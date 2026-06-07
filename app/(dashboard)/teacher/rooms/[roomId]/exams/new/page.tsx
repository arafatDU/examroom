"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Search, Check, Filter, ListChecks, Grid, Info, Clock, Calendar, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewExamPage() {
  const { roomId } = useParams();
  const router = useRouter();
  
  // Exam Meta State
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("PUBLISHED");

  // Selection & UI State
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"available" | "selected">("available");

  // Filters State
  const [filters, setFilters] = useState({
    subject: "",
    chapter: "",
    board: "",
    search: ""
  });

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      setError("Failed to load question bank");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Extract unique filter options from questions
  const filterOptions = useMemo(() => {
    const subjects = Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);
    const chapters = Array.from(new Set(questions.map(q => q.chapter))).filter(Boolean);
    const boards = Array.from(new Set(questions.map(q => q.board))).filter(Boolean);
    return { subjects, chapters, boards };
  }, [questions]);

  // Apply filtering
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSubject = !filters.subject || q.subject === filters.subject;
      const matchesChapter = !filters.chapter || q.chapter === filters.chapter;
      const matchesBoard = !filters.board || q.board === filters.board;
      const matchesSearch = !filters.search || 
        q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.subject.toLowerCase().includes(filters.search.toLowerCase());
      
      // Exclude already selected
      const isNotSelected = !selectedQuestions.find(sq => sq._id === q._id);
      
      return matchesSubject && matchesChapter && matchesBoard && matchesSearch && isNotSelected;
    });
  }, [questions, filters, selectedQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) return alert("Select at least one question");

    const res = await fetch(`/api/teacher/rooms/${roomId}/exams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        durationMinutes: duration,
        startTime: startTime || null, // Allow empty for unscheduled
        endTime: endTime || null,
        questions: selectedQuestions.map(q => q._id),
        status
      }),
    });

    if (res.ok) {
      router.push(`/teacher/rooms/${roomId}`);
    }
  };

  const toggleSelection = (q: any) => {
    const isSelected = selectedQuestions.find(sq => sq._id === q._id);
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(item => item._id !== q._id));
    } else {
      setSelectedQuestions(prev => [...prev, q]);
    }
  };

  const toggleChecked = (id: string) => {
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAdd = () => {
    const toAdd = filteredQuestions.filter(q => checkedIds.includes(q._id));
    setSelectedQuestions(prev => [...prev, ...toAdd]);
    setCheckedIds([]);
  };

  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href={`/teacher/rooms/${roomId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Room
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Settings Panel */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Exam Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exam Title</label>
                <input 
                  required 
                  className="input-field" 
                  placeholder="e.g. Model Test 01 - Chemistry"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration (Minutes)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    className="input-field pr-12 font-bold" 
                    value={duration} 
                    onChange={e => setDuration(Number(e.target.value))} 
                  />
                  <span className="absolute right-4 top-3 text-sm text-slate-400 font-medium select-none">min</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-3 text-indigo-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Scheduling (Optional)</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      className="input-field text-xs bg-slate-50" 
                      value={startTime} 
                      onChange={e => setStartTime(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      className="input-field text-xs bg-slate-50" 
                      value={endTime} 
                      onChange={e => setEndTime(e.target.value)} 
                    />
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 leading-normal flex items-start gap-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                  Leave empty for no timing locks (always available).
                </p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!title.trim() || selectedQuestions.length === 0}
                className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-6"
              >
                <Save className="w-4 h-4" />
                Publish Exam
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Browser */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
            {/* Header & Tabs */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Build Your Paper</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Explore the question bank or review items added to this exam.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold self-start sm:self-center">
                  {selectedQuestions.length} Selected
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab("available")}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
                    activeTab === "available" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100/80"
                  )}
                >
                  <Grid className="w-4 h-4" />
                  Explore Bank
                </button>
                <button 
                  onClick={() => setActiveTab("selected")}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
                    activeTab === "selected" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100/80"
                  )}
                >
                  <ListChecks className="w-4 h-4" />
                  Review Selection ({selectedQuestions.length})
                </button>
              </div>
            </div>

            {/* Filters Bar (Available Only) */}
            {activeTab === "available" && (
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="flex items-center gap-3 flex-1">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    checked={filteredQuestions.length > 0 && filteredQuestions.every(q => checkedIds.includes(q._id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCheckedIds(filteredQuestions.map(q => q._id));
                      } else {
                        setCheckedIds([]);
                      }
                    }}
                  />
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      placeholder="Search titles or tags..." 
                      className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" 
                      value={filters.search}
                      onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {checkedIds.length > 0 && (
                    <button 
                      onClick={handleBulkAdd}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Selection ({checkedIds.length})
                    </button>
                  )}

                  <select 
                    className="py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                    value={filters.subject}
                    onChange={e => setFilters({ ...filters, subject: e.target.value })}
                  >
                    <option value="">All Subjects</option>
                    {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select 
                    className="py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                    value={filters.chapter}
                    onChange={e => setFilters({ ...filters, chapter: e.target.value })}
                  >
                    <option value="">All Chapters</option>
                    {filterOptions.chapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    className="py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                    value={filters.board}
                    onChange={e => setFilters({ ...filters, board: e.target.value })}
                  >
                    <option value="">All Boards</option>
                    {filterOptions.boards.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4">
              {activeTab === "available" ? (
                loading ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Scanning question bank...</p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="py-20 text-center">
                    <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">No matching questions found.</p>
                  </div>
                ) : (
                  filteredQuestions.map((q) => (
                    <QuestionRow 
                      key={q._id} 
                      question={q} 
                      onSelect={() => toggleChecked(q._id)} 
                      isSelected={checkedIds.includes(q._id)} 
                      isAddMode={true}
                    />
                  ))
                )
              ) : (
                selectedQuestions.length === 0 ? (
                  <div className="py-20 text-center">
                    <Plus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Select questions to view them here.</p>
                  </div>
                ) : (
                  selectedQuestions.map((q) => (
                    <QuestionRow key={q._id} question={q} onSelect={() => toggleSelection(q)} isSelected={true} />
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionRow({ question, onSelect, isSelected, isAddMode }: any) {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 bg-white",
        isSelected 
          ? (isAddMode ? "border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50" : "border-rose-200 bg-rose-50/40 hover:bg-rose-50/60")
          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/30"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
        isSelected 
          ? (isAddMode ? "bg-indigo-600 border-indigo-600 text-white" : "bg-rose-500 border-rose-500 text-white") 
          : "border-slate-300 group-hover:border-indigo-400 bg-white"
      )}>
        {isSelected 
          ? (isAddMode ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[3]" />) 
          : <Plus className="w-3 h-3 text-transparent group-hover:text-indigo-500 stroke-[3]" />
        }
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {question.subject}
          </span>
          <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {question.chapter}
          </span>
          {question.board && (
            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {question.board}
            </span>
          )}
        </div>
        <h4 className="text-slate-800 font-bold text-sm leading-relaxed">{question.title}</h4>
        
        {/* Options Preview */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(question.options[0] || {}).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => (
            <div key={key} className="flex items-center text-xs text-slate-500 bg-slate-50/60 border border-slate-100 rounded-lg px-2.5 py-1.5">
              <span className="font-extrabold uppercase mr-2 text-slate-400">{key}.</span>
              <span className="truncate">{value as string}</span>
            </div>
          ))}
        </div>
      </div>

      {isSelected && (
        <span className={cn(
          "text-[9px] font-extrabold uppercase tracking-wider self-start px-2 py-0.5 rounded-full border",
          isAddMode 
            ? "text-indigo-600 bg-indigo-50 border-indigo-100" 
            : "text-rose-600 bg-rose-50 border-rose-100"
        )}>
          {isAddMode ? "Added" : "Remove"}
        </span>
      )}
    </div>
  );
}
