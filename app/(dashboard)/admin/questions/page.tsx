"use client";

import { useEffect, useState } from "react";
import { Plus, Search, BookOpen, Edit2, Trash2, X, Save, Loader2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    subject: "",
    board: "",
    chapter: "",
    search: ""
  });

  const [editFormData, setEditFormData] = useState<any>(null);

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

  // Derived unique values for filters
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

  const startEditing = (q: any) => {
    setEditingId(q._id);
    setIsAddingNew(false);
    const opts = (q.options && q.options.length > 0) ? q.options[0] : { a: "", b: "", c: "", d: "" };
    setEditFormData({
      title: q.title || "",
      subject: q.subject || "",
      board: q.board || "",
      chapter: q.chapter || "",
      serialNumber: q.serialNumber?.toString() || "",
      answer: q.answer || "a",
      justification: q.justification || "",
      options: {
        a: opts.a || "",
        b: opts.b || "",
        c: opts.c || "",
        d: opts.d || ""
      }
    });
  };

  const startAdding = () => {
    setEditingId(null);
    setIsAddingNew(true);
    setEditFormData({
      title: "",
      subject: "",
      board: "",
      chapter: "",
      serialNumber: "",
      answer: "a",
      justification: "",
      options: { a: "", b: "", c: "", d: "" }
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setEditFormData(null);
  };

  const handleSave = async (id?: string) => {
    setLoading(true);
    const payload = {
      ...editFormData,
      options: [editFormData.options],
      serialNumber: editFormData.serialNumber ? parseInt(editFormData.serialNumber) : undefined
    };

    const url = id ? `/api/admin/questions/${id}` : "/api/admin/questions";
    const method = id ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingId(null);
        setIsAddingNew(false);
        setEditFormData(null);
        fetchQuestions();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (res.ok) fetchQuestions();
  };

  const renderEditForm = (id?: string) => (
    <div className="space-y-4 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
          <input className="input-field py-2" value={editFormData.subject} onChange={e => setEditFormData({...editFormData, subject: e.target.value})} placeholder="Subject" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chapter</label>
          <input className="input-field py-2" value={editFormData.chapter} onChange={e => setEditFormData({...editFormData, chapter: e.target.value})} placeholder="Chapter" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Board/Year</label>
          <input className="input-field py-2" value={editFormData.board} onChange={e => setEditFormData({...editFormData, board: e.target.value})} placeholder="Board" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Serial</label>
          <input type="number" className="input-field py-2" value={editFormData.serialNumber} onChange={e => setEditFormData({...editFormData, serialNumber: e.target.value})} placeholder="Serial" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Question Text</label>
        <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 ring-indigo-500/5 outline-none transition-all min-h-[100px]" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} placeholder="Enter question..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['a', 'b', 'c', 'd'].map(opt => (
          <div key={opt} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditFormData({ ...editFormData, answer: opt })}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0 transition-all border shadow-sm",
                editFormData.answer === opt 
                  ? "bg-emerald-600 border-emerald-500 text-white" 
                  : "bg-white border-slate-200 text-slate-400 hover:border-indigo-400"
              )}
            >
              {opt}
            </button>
            <input className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" value={(editFormData.options as any)[opt]} onChange={e => setEditFormData({ ...editFormData, options: { ...editFormData.options, [opt]: e.target.value } })} placeholder={`Option ${opt.toUpperCase()}`} />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Explanation</label>
        <textarea className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs italic text-slate-500 min-h-[60px] outline-none focus:border-indigo-400" value={editFormData.justification} onChange={e => setEditFormData({...editFormData, justification: e.target.value})} placeholder="Explanation..." />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => handleSave(id)} disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {id ? "Update Question" : "Add to Bank"}
        </button>
        <button onClick={cancelEditing} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">Question Bank</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and edit your shared question repository inline.</p>
        </div>
        {!isAddingNew && (
          <button 
            onClick={startAdding}
            className="btn-primary px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            New Question
          </button>
        )}
      </div>

      {isAddingNew && renderEditForm()}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition-colors bg-white shadow-sm"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center hover:bg-rose-100 transition-colors mr-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete ({selectedIds.length})
              </button>
            )}

            <select className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white outline-none shadow-sm" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })}>
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
            </select>

            <select className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white outline-none shadow-sm" value={filters.board} onChange={(e) => setFilters({ ...filters, board: e.target.value })}>
              <option value="">All Boards</option>
              {uniqueBoards.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
            </select>

            <select className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white outline-none shadow-sm" value={filters.chapter} onChange={(e) => setFilters({ ...filters, chapter: e.target.value })}>
              <option value="">All Chapters</option>
              {uniqueChapters.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading && !editingId && !isAddingNew ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <span>Loading question catalog...</span>
            </div>
          ) : filteredQuestions.length === 0 && !isAddingNew ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold">No questions found.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q._id} className={cn(
                "transition-all duration-200",
                editingId === q._id ? "bg-white" : "hover:bg-slate-50/40",
                selectedIds.includes(q._id) ? "bg-indigo-50/10" : ""
              )}>
                {editingId === q._id ? (
                  renderEditForm(q._id)
                ) : (
                  <div className="p-6 flex gap-4 items-start">
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
                            {q.serialNumber && (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold">
                                #{q.serialNumber}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                              {q.subject}
                            </span>
                            {q.chapter && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                                {q.chapter}
                              </span>
                            )}
                            {q.board && (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                {q.board}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-base font-bold text-slate-800 leading-relaxed">{q.title}</h3>
                          
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(q.options?.[0] || {}).filter(([key]) => ['a', 'b', 'c', 'd'].includes(key)).map(([key, value]) => (
                              <div key={key} className={cn(
                                "p-3 rounded-xl border text-xs font-semibold flex items-center transition-all",
                                key === q.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50/50 border-slate-200/50 text-slate-600'
                              )}>
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
                            <div className="mt-4 text-xs italic text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="font-bold not-italic text-slate-700 mr-2 text-[10px] uppercase">Explanation</span>
                              {q.justification}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => startEditing(q)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(q._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
