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
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-8 h-8 mr-3 text-indigo-600" />
          Advanced AI Extractor
        </h1>
        
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
          <button
            onClick={() => setActiveTab("single")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "single" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <FileText className="w-4 h-4" /> Single Question
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "bulk" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Layers className="w-4 h-4" /> Bulk Questions
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {activeTab === "single" && (
        <div className="space-y-8">
          {!singleResult ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-12 hover:border-indigo-400 transition-colors group">
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
                <Upload className="w-16 h-16 mx-auto text-gray-300 mb-6 group-hover:text-indigo-400 transition-colors" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Single Question</h3>
                <p className="text-gray-500">Take a clear photo of one question and its options</p>
              </div>
              {loading && (
                <div className="mt-8 flex items-center justify-center gap-3 text-indigo-600 font-bold">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Extracting Question...
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <QuestionCard 
                question={singleResult} 
                onChange={(q) => setSingleResult(q)} 
              />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleAddSingle}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
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
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-12 hover:border-indigo-400 transition-colors group">
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
                <Upload className="w-16 h-16 mx-auto text-gray-300 mb-6 group-hover:text-indigo-400 transition-colors" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Bulk Questions (Step 1)</h3>
                <p className="text-gray-500">Upload an image containing up to 25 questions</p>
              </div>
              {loading && (
                <div className="mt-8 flex items-center justify-center gap-3 text-indigo-600 font-bold">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Extracting Bulk Questions...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Common Header */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Global Subject</label>
                  <input 
                    className="w-full border-gray-200 rounded-xl p-3 focus:ring-indigo-500"
                    placeholder="e.g. Physics"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Global Board</label>
                  <input 
                    className="w-full border-gray-200 rounded-xl p-3 focus:ring-indigo-500"
                    placeholder="e.g. Dhaka Board 2023"
                    value={bulkBoard}
                    onChange={(e) => setBulkBoard(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2: Answers */}
              <div className={cn(
                "p-8 rounded-2xl border-2 transition-all",
                answersExtracted ? "bg-green-50 border-green-200" : "bg-indigo-50 border-indigo-200 border-dashed"
              )}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl",
                        answersExtracted ? "bg-green-600 text-white" : "bg-indigo-600 text-white"
                    )}>
                      {answersExtracted ? <CheckCircle2 className="w-6 h-6" /> : "2"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {answersExtracted ? "Answers Extracted Successfully" : "Upload Answer Key (Step 2)"}
                      </h3>
                      <p className="text-gray-600">Map answers to the {bulkResults.length} questions above</p>
                    </div>
                  </div>
                  
                  <div className="relative">
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
                        "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                        answersExtracted ? "bg-white text-green-600 border border-green-200" : "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    )}>
                      <Upload className="w-5 h-5" />
                      {answersExtracted ? "Re-upload Answers" : "Upload Answer Image"}
                    </button>
                  </div>
                </div>
                {loading && !answersExtracted && (
                    <div className="mt-4 text-center text-indigo-600 font-bold animate-pulse">
                        Extracting Answers...
                    </div>
                )}
              </div>

              <div className="space-y-6">
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

              <div className="sticky bottom-8 flex justify-center pb-8">
                <button
                  onClick={handleAddBulk}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-16 py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all flex items-center gap-3 transform hover:scale-105"
                >
                  {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
                  Finalize & Add {bulkResults.length} Questions
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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-2">
            <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 border border-gray-100">
            {question.serialNumber}
            </span>
            <div className="w-px h-full bg-gray-50" />
        </div>
        
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Question Title</label>
            <textarea
              className="w-full text-xl font-medium border-none focus:ring-0 p-0 resize-none leading-relaxed text-gray-900"
              rows={2}
              value={question.title}
              onChange={(e) => onChange({ ...question, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <div key={opt} className={cn(
                  "relative group flex items-center p-1 rounded-xl border-2 transition-all",
                  question.answer === opt ? "border-green-500 bg-green-50" : "border-gray-50 bg-gray-50/50"
              )}>
                <span className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold uppercase mr-3 shadow-sm",
                    question.answer === opt ? "bg-green-500 text-white" : "bg-white text-gray-400"
                )}>
                  {opt}
                </span>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
                  value={(options as any)[opt]}
                  onChange={(e) => {
                    const newOpts = [{ ...options, [opt]: e.target.value }];
                    onChange({ ...question, options: newOpts });
                  }}
                />
                <button 
                  onClick={() => onChange({ ...question, answer: opt })}
                  className={cn(
                    "absolute right-3 p-1 rounded-full transition-all",
                    question.answer === opt ? "text-green-600" : "text-gray-300 hover:text-indigo-400 opacity-0 group-hover:opacity-100"
                  )}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Correct Answer</label>
              <select 
                className="w-full text-sm border-gray-100 rounded-lg bg-indigo-50/50 p-3 font-bold uppercase text-indigo-700 focus:ring-indigo-500"
                value={question.answer}
                onChange={(e) => onChange({ ...question, answer: e.target.value })}
              >
                {['a', 'b', 'c', 'd'].map(opt => (
                  <option key={opt} value={opt}>Option {opt.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Subject / Topic</label>
              <input 
                className="w-full text-sm border-gray-100 rounded-lg bg-gray-50/50 p-3"
                value={question.subject || ""}
                placeholder="Extracting..."
                onChange={(e) => onChange({ ...question, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Board</label>
              <input 
                className="w-full text-sm border-gray-100 rounded-lg bg-gray-50/50 p-3"
                value={question.board || ""}
                placeholder="e.g. Dhaka Board"
                onChange={(e) => onChange({ ...question, board: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Chapter</label>
              <input 
                className="w-full text-sm border-gray-100 rounded-lg bg-gray-50/50 p-3"
                value={question.chapter || ""}
                placeholder="e.g. Chapter 1"
                onChange={(e) => onChange({ ...question, chapter: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Justification / Hint</label>
                <input 
                    className="w-full text-sm border-gray-100 rounded-lg bg-gray-50/50 p-3 italic"
                    value={question.justification || ""}
                    placeholder="Provide explanation..."
                    onChange={(e) => onChange({ ...question, justification: e.target.value })}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
