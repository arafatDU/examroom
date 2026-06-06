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
    <div className="max-w-2xl mx-auto">
      <Link href="/teacher" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-indigo-600" />
          Create New ExamRoom
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              required
              className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., HSC 2026 - Chemistry Batch A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PRIVATE">Private (Invite only via code)</option>
              <option value="PUBLIC">Public (Visible to everyone)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create ExamRoom"}
          </button>
        </form>
      </div>
    </div>
  );
}
