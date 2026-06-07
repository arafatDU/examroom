"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";

export default function TeacherNewQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    board: "",
    chapter: "",
    answer: "a",
    justification: "",
    "ক্রমিক নম্বর": 1,
    options: [{ a: "", b: "", c: "", d: "" }]
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Question added to Global Bank!");
        router.push("/admin/questions"); // Or back to room
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save question");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Add Question Manually</h1>
            <p className="text-slate-400 text-xs mt-0.5">Manually input a new question into the global question bank.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
              <input required className="input-field" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. রসায়ন" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Chapter</label>
              <input required className="input-field" value={formData.chapter} onChange={e => setFormData({ ...formData, chapter: e.target.value })} placeholder="e.g. জৈব যৌগ" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Board</label>
              <input className="input-field" value={formData.board} onChange={e => setFormData({ ...formData, board: e.target.value })} placeholder="e.g. ঢাকা" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Question Title (Bangla Supported)</label>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>ক্রমিক নম্বর:</span>
                <input type="number" className="w-16 border border-slate-200 rounded-lg p-1 text-center font-bold text-slate-700 bg-slate-50/50" value={formData["ক্রমিক নম্বর"]} onChange={e => setFormData({ ...formData, "ক্রমিক নম্বর": Number(e.target.value) })} />
              </div>
            </div>
            <textarea required className="w-full border border-slate-200 rounded-xl p-3 h-24 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm leading-relaxed" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="নিচের কোনটি জৈব যৌগ?" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt} className="relative">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Option {opt.toUpperCase()}</label>
                <div className="relative">
                  <input required className="input-field pl-10" value={(formData.options[0] as any)[opt]} onChange={e => {
                    const newOptions = [...formData.options];
                    (newOptions[0] as any)[opt] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }} />
                  <span className="absolute left-4 top-3 font-bold text-indigo-400 uppercase select-none text-xs">{opt}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Correct Answer</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 uppercase font-bold text-indigo-700 bg-indigo-50/40 focus:outline-none" value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })}>
                {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Justification / Explanation</label>
            <textarea className="w-full border border-slate-200 rounded-xl p-3 h-20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 italic text-xs leading-relaxed text-slate-600" value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} placeholder="Explain why the answer is correct..." />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 text-sm">
            {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save to Question Bank</>}
          </button>
        </form>
      </div>
    </div>
  );
}
