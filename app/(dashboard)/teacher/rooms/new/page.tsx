"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRoomPage() {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/teacher/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, visibility }),
      });

      if (res.ok) {
        router.push("/teacher");
      }
    } catch (error) {
      console.error("Failed to create room", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Create New ExamRoom</h1>
            <p className="text-slate-400 text-xs mt-0.5">Set up a virtual classroom to host and manage exams.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Room Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., HSC 2026 - Chemistry Batch A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Visibility
            </label>
            <select
              className="input-field appearance-none bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.75rem center`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2.5rem`,
              }}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PRIVATE">Private (Invite only via code)</option>
              <option value="PUBLIC">Public (Visible to everyone)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full btn-primary py-3.5 text-base rounded-xl font-bold transition-all mt-4"
          >
            {loading ? "Creating Room..." : "Create ExamRoom"}
          </button>
        </form>
      </div>
    </div>
  );
}
