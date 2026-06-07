"use client";

import { useState } from "react";
import { Upload, Sparkles, Check, Save, AlertCircle, FileText, Layers, Loader2, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = {
  serialNumber: number;
  title: string;
  options: { a: string; b: string; c: string; d: string }[];
  answer: string;
  justification?: string;
  subject?: string;
  board?: string;
  chapter?: string;
};

export default function ExtractPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Single Question State
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleResult, setSingleResult] = useState<Question | null>(null);

  // Bulk Questions State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<Question[]>([]);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBoard, setBulkBoard] = useState("");
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [answersExtracted, setAnswersExtracted] = useState(false);

  const handleSingleUpload = async (file: File) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("mode", "single");

    try {
      const res = await fetch("/api/teacher/extract", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      setSingleResult(data);
    } catch (err) {
      setError("Failed to extract single question.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (file: File) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("mode", "bulk");

    try {
      const res = await fetch("/api/teacher/extract", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      setBulkResults(data.questions || []);
      setBulkSubject(data.subject || "");
      setBulkBoard(data.board || "");
      setAnswersExtracted(false);
    } catch (err) {
      setError("Failed to extract bulk questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerUpload = async (file: File) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("mode", "answers");

    try {
      const res = await fetch("/api/teacher/extract", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Answer extraction failed");
      const data = await res.json();
      
      // Map answers to questions
      const updatedResults = bulkResults.map(q => ({
        ...q,
        answer: data.answers[q.serialNumber.toString()] || q.answer || "a"
      }));
      setBulkResults(updatedResults);
      setAnswersExtracted(true);
    } catch (err) {
      setError("Failed to extract answers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingle = async () => {
    if (!singleResult) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [
            {
                ...singleResult,
                "ক্রমিক নম্বর": singleResult.serialNumber,
                option: singleResult.options
            }
        ] }),
      });
      if (res.ok) {
        alert("Question added to bank!");
        setSingleResult(null);
        setSingleFile(null);
      }
    } catch (err) {
      alert("Error adding question.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBulk = async () => {
    if (bulkResults.length === 0) return;
    setLoading(true);
    const finalQuestions = bulkResults.map(q => ({
      ...q,
      subject: bulkSubject,
      board: bulkBoard,
      "ক্রমিক নম্বর": q.serialNumber,
      option: q.options
    }));

    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: finalQuestions }),
      });
      if (res.ok) {
        alert(`${bulkResults.length} questions added to bank!`);
        setBulkResults([]);
        setBulkFile(null);
        setAnswerFile(null);
      }
    } catch (err) {
      alert("Error adding questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">Advanced AI Extractor</h1>
            <p className="text-slate-400 text-xs mt-0.5">Use optical character recognition and AI to extract questions from images.</p>
          </div>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex self-start sm:self-center">
          <button
            onClick={() => setActiveTab("single")}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "single" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Single MCQ
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "bulk" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Layers className="w-3.5 h-3.5" /> Bulk Sheet
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-red-500" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {activeTab === "single" && (
        <div className="space-y-8">
          {!singleResult ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-12 hover:border-indigo-400 transition-colors group bg-slate-50/20">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSingleFile(file);
                      handleSingleUpload(file);
                    }
                  }}
                />
                <Upload className="w-14 h-14 mx-auto text-slate-300 mb-4 group-hover:text-indigo-500 transition-colors" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Upload Single Question Image</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-normal">Drag and drop or browse to import an image containing one question with options.</p>
              </div>
              {loading && (
                <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Question Parsing in progress...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-scale-in">
              <QuestionCard 
                question={singleResult} 
                onChange={(q) => setSingleResult(q)} 
              />
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleAddSingle}
                  disabled={loading}
                  className="btn-primary px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add to Question Bank
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="space-y-8">
          {bulkResults.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-12 hover:border-indigo-400 transition-colors group bg-slate-50/20">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBulkFile(file);
                      handleBulkUpload(file);
                    }
                  }}
                />
                <Upload className="w-14 h-14 mx-auto text-slate-300 mb-4 group-hover:text-indigo-500 transition-colors" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Upload Bulk Exam Sheet (Step 1)</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-normal">Drag and drop or browse to import a full page image containing up to 25 questions.</p>
              </div>
              {loading && (
                <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Bulk Extraction in progress...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-scale-in">
              {/* Common Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Global Subject</label>
                  <input 
                    className="input-field"
                    placeholder="e.g. Physics"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Global Board</label>
                  <input 
                    className="input-field"
                    placeholder="e.g. Dhaka Board 2023"
                    value={bulkBoard}
                    onChange={(e) => setBulkBoard(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2: Answers */}
              <div className={cn(
                "p-6 rounded-2xl border-2 transition-all",
                answersExtracted ? "bg-emerald-50/50 border-emerald-200" : "bg-indigo-50/40 border-indigo-200 border-dashed"
              )}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0",
                        answersExtracted ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                    )}>
                      {answersExtracted ? <CheckCircle2 className="w-5 h-5" /> : "2"}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {answersExtracted ? "Answers Extracted Successfully" : "Upload Answer Key Sheet (Step 2)"}
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5">Map answer options automatically to the {bulkResults.length} questions below</p>
                    </div>
                  </div>
                  
                  <div className="relative self-stretch sm:self-auto">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAnswerFile(file);
                          handleAnswerUpload(file);
                        }
                      }}
                    />
                    <button className={cn(
                        "w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs",
                        answersExtracted ? "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50" : "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    )}>
                      <Upload className="w-4 h-4" />
                      {answersExtracted ? "Change Answers Sheet" : "Upload Answer Sheet"}
                    </button>
                  </div>
                </div>
                {loading && !answersExtracted && (
                  <div className="mt-4 text-center text-indigo-600 font-bold text-xs animate-pulse">
                    Extracting Answers...
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {bulkResults.map((q, idx) => (
                  <QuestionCard 
                    key={idx}
                    question={q}
                    onChange={(updated) => {
                      const newResults = [...bulkResults];
                      newResults[idx] = updated;
                      setBulkResults(newResults);
                    }}
                  />
                ))}
              </div>

              <div className="sticky bottom-6 flex justify-center pb-6 z-10">
                <button
                  onClick={handleAddBulk}
                  disabled={loading}
                  className="btn-primary px-10 py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Add {bulkResults.length} Questions to Bank
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, onChange }: { question: Question; onChange: (q: Question) => void }) {
  const options = question.options[0] || { a: "", b: "", c: "", d: "" };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <span className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-100 select-none">
            {question.serialNumber}
          </span>
          <div className="w-px flex-1 bg-slate-100" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-5">
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Question Title</label>
            <textarea
              className="w-full text-base font-semibold border-none focus:ring-0 p-0 resize-none leading-relaxed text-slate-800 focus:outline-none"
              rows={2}
              value={question.title}
              onChange={(e) => onChange({ ...question, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <div key={opt} className={cn(
                  "relative group flex items-center p-1 rounded-xl border transition-all",
                  question.answer === opt ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 bg-slate-50/20"
              )}>
                <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold uppercase mr-2.5 shadow-sm text-xs",
                    question.answer === opt ? "bg-emerald-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                )}>
                  {opt}
                </span>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 font-semibold text-xs py-1.5 focus:outline-none"
                  value={(options as any)[opt]}
                  onChange={(e) => {
                    const newOpts = [{ ...options, [opt]: e.target.value }];
                    onChange({ ...question, options: newOpts });
                  }}
                />
                <button 
                  onClick={() => onChange({ ...question, answer: opt })}
                  className={cn(
                    "absolute right-2 p-1 rounded-full transition-all",
                    question.answer === opt ? "text-emerald-600" : "text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100"
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Correct Answer</label>
              <select 
                className="w-full text-xs border border-slate-200 rounded-xl bg-indigo-50/40 px-3 py-2.5 font-bold uppercase text-indigo-700 focus:outline-none"
                value={question.answer}
                onChange={(e) => onChange({ ...question, answer: e.target.value })}
              >
                {['a', 'b', 'c', 'd'].map(opt => (
                  <option key={opt} value={opt}>Option {opt.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject / Topic</label>
              <input 
                className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50/40 px-3 py-2.5 font-semibold text-slate-700"
                value={question.subject || ""}
                placeholder="Subject"
                onChange={(e) => onChange({ ...question, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Board</label>
              <input 
                className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50/40 px-3 py-2.5 font-semibold text-slate-700"
                value={question.board || ""}
                placeholder="e.g. Dhaka Board"
                onChange={(e) => onChange({ ...question, board: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Chapter</label>
              <input 
                className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50/40 px-3 py-2.5 font-semibold text-slate-700"
                value={question.chapter || ""}
                placeholder="Chapter"
                onChange={(e) => onChange({ ...question, chapter: e.target.value })}
              />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Justification / Explanation</label>
              <input 
                className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50/40 px-3 py-2.5 font-medium text-slate-600 italic"
                value={question.justification || ""}
                placeholder="Provide details on why this answer is correct..."
                onChange={(e) => onChange({ ...question, justification: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
