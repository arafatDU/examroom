"use client";

import { useEffect, useState } from "react";
import { Plus, Search, BookOpen, Edit2, Trash2, X, Save, Loader2, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filter States
  const [filters, setFilters] = useState({
    subject: "",
    board: "",
    chapter: "",
    search: ""
  });

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    board: "",
    chapter: "",
    answer: "a",
    justification: "",
    options: [{ a: "", b: "", c: "", d: "" }]
  });

  const fetchQuestions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.subject) params.append("subject", filters.subject);
    if (filters.board) params.append("board", filters.board);
    if (filters.chapter) params.append("chapter", filters.chapter);
    
    try {
      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters.subject, filters.board, filters.chapter]);

  // Derived unique values for filters from loaded questions
  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject).filter(Boolean)));
  const uniqueBoards = Array.from(new Set(questions.map(q => q.board).filter(Boolean)));
  const uniqueChapters = Array.from(new Set(questions.map(q => q.chapter).filter(Boolean)));

  const filteredQuestions = questions.filter(q => 
    q.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
    (q.subject && q.subject.toLowerCase().includes(filters.search.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuestions.map(q => q._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/questions?ids=${selectedIds.join(",")}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedIds([]);
      fetchQuestions();
    } else {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingQuestion ? `/api/admin/questions/${editingQuestion._id}` : "/api/admin/questions";
    const method = editingQuestion ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingQuestion(null);
      setFormData({
        title: "", subject: "", board: "", chapter: "", answer: "a", justification: "",
        options: [{ a: "", b: "", c: "", d: "" }]
      });
      fetchQuestions();
    } else {
      alert("Failed to save question");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (res.ok) fetchQuestions();
  };

  const extractOptions = (q: any) => {
    const opts = (q && q.options && q.options.length > 0) ? q.options[0] : null;
    return [{
      a: opts?.a || "",
      b: opts?.b || "",
      c: opts?.c || "",
      d: opts?.d || ""
    }];
  };

  const currentOptions = (formData.options && formData.options.length > 0) ? formData.options[0] : { a: "", b: "", c: "", d: "" };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">Question Bank</h1>
          <p className="text-slate-400 text-sm mt-0.5">Central repository for questions shared across classrooms.</p>
        </div>
        <button 
          onClick={() => {
            setEditingQuestion(null);
            setFormData({
              title: "", subject: "", board: "", chapter: "", answer: "a", justification: "",
              options: [{ a: "", b: "", c: "", d: "" }]
            });
            setShowModal(true);
          }}
          className="btn-primary px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-extrabold text-slate-800">{editingQuestion ? "Edit Question Details" : "Add New Question"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                  <input required className="input-field" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. রসায়ন" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Board</label>
                  <input className="input-field" value={formData.board} onChange={e => setFormData({ ...formData, board: e.target.value })} placeholder="e.g. ঢাকা" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Question Title</label>
                <textarea required className="w-full border border-slate-200 rounded-xl p-3 h-24 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. নিচের কোনটি সঠিক?" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt}>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Option {opt.toUpperCase()}</label>
                    <input required className="input-field" value={(currentOptions as any)[opt] || ""} onChange={e => {
                      const newOptions = [{
                        a: currentOptions.a || "",
                        b: currentOptions.b || "",
                        c: currentOptions.c || "",
                        d: currentOptions.d || ""
                      }];
                      (newOptions[0] as any)[opt] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }} placeholder={`Value for option ${opt}`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correct Answer Option</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none" value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })}>
                    {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>Option {o.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Explanation Justification</label>
                <textarea className="w-full border border-slate-200 rounded-xl p-3 h-20 text-xs italic focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} placeholder="Provide context on correct option..." />
              </div>

              <div className="pt-2">
                <button className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingQuestion ? "Save Changes" : "Save to Question Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main questions list container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filtering bar and search */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 bg-slate-50/30">
          <div className="flex items-center gap-4 flex-1">
            <input 
              type="checkbox" 
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length}
              onChange={handleSelectAll}
            />
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by text, subject..."
                className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center hover:bg-rose-100 transition-colors mr-2 animate-in fade-in duration-200"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}

            <select 
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white focus:outline-none"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
            </select>

            <select 
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white focus:outline-none"
              value={filters.board}
              onChange={(e) => setFilters({ ...filters, board: e.target.value })}
            >
              <option value="">All Boards</option>
              {uniqueBoards.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
            </select>

            <select 
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white focus:outline-none"
              value={filters.chapter}
              onChange={(e) => setFilters({ ...filters, chapter: e.target.value })}
            >
              <option value="">All Chapters</option>
              {uniqueChapters.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>

            {(filters.subject || filters.board || filters.chapter) && (
              <button 
                onClick={() => setFilters({ ...filters, subject: "", board: "", chapter: "" })}
                className="text-xs text-rose-600 font-bold hover:underline px-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Questions list */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <span>Loading question catalog...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold">No questions match the current criteria.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q._id} className={cn(
                "p-6 hover:bg-slate-50/30 transition-colors flex gap-4 items-start",
                selectedIds.includes(q._id) ? "bg-indigo-50/20" : ""
              )}>
                <input 
                  type="checkbox" 
                  className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer flex-shrink-0"
                  checked={selectedIds.includes(q._id)}
                  onChange={() => handleToggleSelect(q._id)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                          {q.subject}
                        </span>
                        {q.board && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {q.board}
                          </span>
                        )}
                        {q.chapter && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {q.chapter}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base font-bold text-slate-800 leading-relaxed">{q.title}</h3>
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {Object.entries(q.options?.[0] || {}).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => (
                          <div 
                            key={key} 
                            className={cn(
                              "p-2.5 rounded-xl border text-xs font-semibold flex items-center transition-all",
                              key === q.answer 
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' 
                                : 'bg-slate-50/50 border-slate-200/50 text-slate-600'
                            )}
                          >
                            <span className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center font-bold uppercase mr-2 text-[10px] shadow-sm",
                              key === q.answer ? "bg-emerald-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                            )}>
                              {key}
                            </span>
                            <span className="truncate">{value as string}</span>
                          </div>
                        ))}
                      </div>
                      
                      {q.justification && (
                        <p className="mt-4 text-xs italic text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold not-italic text-slate-700">Explanation:</span> {q.justification}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button 
                        onClick={() => {
                          setEditingQuestion(q);
                          setFormData({
                            title: q.title || "", 
                            subject: q.subject || "", 
                            board: q.board || "", 
                            chapter: q.chapter || "", 
                            answer: q.answer || "a", 
                            justification: q.justification || "", 
                            options: extractOptions(q)
                          });
                          setShowModal(true);
                        }}
                        className="inline-flex p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(q._id)}
                        className="inline-flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
