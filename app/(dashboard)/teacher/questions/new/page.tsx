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
    <div className="max-w-3xl mx-auto">
      <Link href="/teacher" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <Plus className="w-6 h-6 mr-2 text-indigo-600" />
          Add Question Manually
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input required className="w-full border-gray-200 rounded-lg p-2.5" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. রসায়ন" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
              <input required className="w-full border-gray-200 rounded-lg p-2.5" value={formData.chapter} onChange={e => setFormData({ ...formData, chapter: e.target.value })} placeholder="e.g. জৈব যৌগ" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
              <input className="w-full border-gray-200 rounded-lg p-2.5" value={formData.board} onChange={e => setFormData({ ...formData, board: e.target.value })} placeholder="e.g. ঢাকা" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right italic text-xs">ক্রমিক নম্বর</label>
            <input type="number" className="w-20 border-gray-200 rounded-lg p-2 text-sm float-right mb-2" value={formData["ক্রমিক নম্বর"]} onChange={e => setFormData({ ...formData, "ক্রমিক নম্বর": Number(e.target.value) })} />
            <div className="clear-both"></div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Title (Bangla Supported)</label>
            <textarea required className="w-full border-gray-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="নিচের কোনটি জৈব যৌগ?" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt} className="relative">
                <label className="block text-sm font-bold text-gray-400 mb-1 uppercase">Option {opt}</label>
                <input required className="w-full border-gray-200 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500" value={(formData.options[0] as any)[opt]} onChange={e => {
                  const newOptions = [...formData.options];
                  (newOptions[0] as any)[opt] = e.target.value;
                  setFormData({ ...formData, options: newOptions });
                }} />
                <span className="absolute left-3 top-9 font-bold text-indigo-300 uppercase">{opt}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-bold">Correct Answer</label>
              <select className="w-full border-gray-200 rounded-lg p-2.5 uppercase font-bold text-indigo-600 bg-indigo-50" value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })}>
                {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justification / Explanation</label>
            <textarea className="w-full border-gray-200 rounded-lg p-3 h-20 focus:ring-2 focus:ring-indigo-500 italic text-sm" value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} placeholder="Explain why the answer is correct..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-indigo-100">
            {loading ? "Saving..." : <><Save className="w-5 h-5 mr-2" /> Save to Question Bank</>}
          </button>
        </form>
      </div>
    </div>
  );
}
