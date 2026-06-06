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

  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <Link href={`/teacher/rooms/${roomId}`} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Room
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Settings Panel */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-indigo-600" />
              Exam Settings
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Exam Title</label>
                <input 
                  required 
                  className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all" 
                  placeholder="e.g. Model Test 01 - Chemistry"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Duration (Minutes)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    className="w-full border-gray-200 rounded-xl p-3 pr-12 font-bold" 
                    value={duration} 
                    onChange={e => setDuration(Number(e.target.value))} 
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-medium">min</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Scheduling (Optional)</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full border-gray-100 rounded-lg p-2.5 text-sm bg-gray-50" 
                      value={startTime} 
                      onChange={e => setStartTime(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full border-gray-100 rounded-lg p-2.5 text-sm bg-gray-50" 
                      value={endTime} 
                      onChange={e => setEndTime(e.target.value)} 
                    />
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-400 flex items-start gap-1">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  Leave times empty if you want the exam to be always available for enrolled students.
                </p>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center group"
              >
                <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Publish Exam
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Browser */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
            {/* Header & Tabs */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Build Your Paper</h2>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                  {selectedQuestions.length} Questions Selected
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("available")}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all",
                    activeTab === "available" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Explore Bank
                </button>
                <button 
                  onClick={() => setActiveTab("selected")}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all",
                    activeTab === "selected" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <ListChecks className="w-4 h-4 mr-2" />
                  Review Selection
                </button>
              </div>
            </div>

            {/* Filters Bar (Only in Available Tab) */}
            {activeTab === "available" && (
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      placeholder="Search titles..." 
                      className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                      value={filters.search}
                      onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {checkedIds.length > 0 && (
                    <button 
                      onClick={handleBulkAdd}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 animate-in fade-in zoom-in duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Selection ({checkedIds.length})
                    </button>
                  )}

                  <select 
                    className="py-2 px-3 border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={filters.subject}
                    onChange={e => setFilters({ ...filters, subject: e.target.value })}
                  >
                    <option value="">All Subjects</option>
                    {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select 
                    className="py-2 px-3 border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={filters.chapter}
                    onChange={e => setFilters({ ...filters, chapter: e.target.value })}
                  >
                    <option value="">All Chapters</option>
                    {filterOptions.chapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    className="py-2 px-3 border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={filters.board}
                    onChange={e => setFilters({ ...filters, board: e.target.value })}
                  >
                    <option value="">All Boards</option>
                    {filterOptions.boards.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4">
              {activeTab === "available" ? (
                loading ? (
                  <div className="py-20 text-center text-gray-400">Scanning the question bank...</div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="py-20 text-center">
                    <Filter className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400">No matching questions found in the bank.</p>
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
                    <Plus className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400">Start selecting questions to build your exam.</p>
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
        "p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4",
        isSelected 
          ? (isAddMode ? "border-indigo-200 bg-indigo-50" : "border-red-200 bg-red-50 hover:bg-red-100 shadow-sm")
          : "border-gray-100 hover:border-indigo-200 hover:bg-indigo-50"
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors",
        isSelected 
          ? (isAddMode ? "bg-indigo-600 border-indigo-600 text-white" : "bg-red-500 border-red-500 text-white") 
          : "border-gray-200 group-hover:border-indigo-400 bg-white"
      )}>
        {isSelected 
          ? (isAddMode ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />) 
          : <Plus className="w-4 h-4 text-transparent group-hover:text-indigo-400" />
        }
      </div>
      
      <div className="flex-1">
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">
            {question.subject}
          </span>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
            {question.chapter}
          </span>
          {question.board && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
              {question.board}
            </span>
          )}
        </div>
        <h4 className="text-gray-900 font-medium leading-relaxed">{question.title}</h4>
        
        {/* Options Preview */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(question.options[0] || {}).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => (
            <div key={key} className="flex items-center text-xs text-gray-500 bg-white/50 border border-gray-100 rounded px-2 py-1">
              <span className="font-bold uppercase mr-2 text-gray-400">{key}.</span>
              <span className="truncate">{value as string}</span>
            </div>
          ))}
        </div>
      </div>
      
      {isSelected && (
        <div className={cn(
          "text-[10px] font-bold uppercase",
          isAddMode ? "text-indigo-400" : "text-red-400"
        )}>
          {isAddMode ? "Checked" : "Remove"}
        </div>
      )}
    </div>
  );
}
