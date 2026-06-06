"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, BookOpen, Edit2, Trash2, X, Save } from "lucide-react";
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
    
    const res = await fetch(`/api/admin/questions?${params.toString()}`);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters.subject, filters.board, filters.chapter]);

  // Derived unique values for filters from loaded questions
  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject).filter(Boolean)));
  const uniqueBoards = Array.from(new Set(questions.map(q => q.board).filter(Boolean)));
  const uniqueChapters = Array.from(new Set(questions.map(q => q.chapter).filter(Boolean)));

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
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

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
        <button 
          onClick={() => {
            setEditingQuestion(null);
            setFormData({
              title: "", subject: "", board: "", chapter: "", answer: "a", justification: "",
              options: [{ a: "", b: "", c: "", d: "" }]
            });
            setShowModal(true);
          }}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingQuestion ? "Edit Question" : "Add New Question"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input required className="w-full border-gray-200 rounded-lg p-2.5" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                  <input className="w-full border-gray-200 rounded-lg p-2.5" value={formData.board} onChange={e => setFormData({ ...formData, board: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                <textarea required className="w-full border-gray-200 rounded-lg p-2.5 h-24" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">Option {opt}</label>
                    <input required className="w-full border-gray-200 rounded-lg p-2.5" value={(formData.options[0] as any)[opt]} onChange={e => {
                      const newOptions = [...formData.options];
                      (newOptions[0] as any)[opt] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  <select className="w-full border-gray-200 rounded-lg p-2.5 uppercase" value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })}>
                    {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
                <textarea className="w-full border-gray-200 rounded-lg p-2.5 h-20" value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} />
              </div>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                {editingQuestion ? "Update Question" : "Save Question"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/50">
          <div className="flex items-center gap-4 flex-1">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length}
              onChange={handleSelectAll}
            />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search title or subject..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-red-100 transition-colors mr-2 animate-in fade-in zoom-in duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </button>
            )}

            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
            </select>

            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filters.board}
              onChange={(e) => setFilters({ ...filters, board: e.target.value })}
            >
              <option value="">All Boards</option>
              {uniqueBoards.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
            </select>

            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filters.chapter}
              onChange={(e) => setFilters({ ...filters, chapter: e.target.value })}
            >
              <option value="">All Chapters</option>
              {uniqueChapters.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>

            {(filters.subject || filters.board || filters.chapter) && (
              <button 
                onClick={() => setFilters({ ...filters, subject: "", board: "", chapter: "" })}
                className="text-xs text-red-600 font-bold hover:underline px-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No questions found matching your filters.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q._id} className={cn(
                "p-6 hover:bg-gray-50 transition-colors flex gap-4",
                selectedIds.includes(q._id) ? "bg-indigo-50/50" : ""
              )}>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                  checked={selectedIds.includes(q._id)}
                  onChange={() => handleToggleSelect(q._id)}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium uppercase">
                          {q.subject}
                        </span>
                        {q.board && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium uppercase">
                            {q.board}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{q.title}</h3>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {Object.entries(q.options[0]).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => (
                          <div key={key} className={`p-2 rounded border text-sm ${key === q.answer ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                            <span className="font-bold uppercase mr-2">{key}.</span> {value as string}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingQuestion(q);
                          setFormData({
                            title: q.title, subject: q.subject, board: q.board || "", chapter: q.chapter || "", 
                            answer: q.answer, justification: q.justification || "", options: q.options
                          });
                          setShowModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(q._id)}
                        className="text-red-600 hover:text-red-900 p-1"
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
