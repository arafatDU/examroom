"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Clipboard, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || "Teacher";

  useEffect(() => {
    fetch("/api/teacher/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  // Card color presets
  const cardGradients = [
    { from: "#6366f1", to: "#7c3aed" },
    { from: "#0ea5e9", to: "#2563eb" },
    { from: "#10b981", to: "#059669" },
    { from: "#f59e0b", to: "#d97706" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-10 text-white" style={{ background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 50%,#9333ea 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle,white,transparent)", transform: "translate(30%,-30%)" }} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span className="text-indigo-200 text-sm font-medium">Teacher Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome, {userName.split(" ")[0]}! 📚</h1>
            <p className="text-indigo-200 max-w-md text-sm md:text-base">Create and manage classrooms, publish exams, and check student scores.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/teacher/rooms/new"
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create ExamRoom
            </Link>
            <Link
              href="/teacher/extract"
              className="flex items-center justify-center gap-2 bg-white/15 text-white border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition-all text-sm whitespace-nowrap backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" /> AI Question Builder
            </Link>
          </div>
        </div>
        <BookOpen className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
      </div>

      {/* Main content grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            My ExamRooms
            {rooms.length > 0 && <span className="badge badge-primary ml-1">{rooms.length}</span>}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-1">No ExamRooms yet</p>
              <p className="text-slate-400 text-sm mb-6">Create your first virtual classroom to start hosting exams.</p>
              <Link href="/teacher/rooms/new" className="btn-primary text-sm px-6 py-2.5 inline-flex">
                <Plus className="w-4 h-4 mr-1.5" /> Create Room
              </Link>
            </div>
          ) : (
            rooms.map((room, idx) => {
              const gradient = cardGradients[idx % cardGradients.length];
              return (
                <div key={room._id} className="er-card bg-white overflow-hidden group flex flex-col justify-between min-h-[200px]">
                  <div>
                    {/* Color Top Border */}
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }} />
                    <div className="p-6 pb-2">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-3 truncate">
                        {room.name}
                      </h3>

                      {/* Join Code Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join Code:</span>
                        <code className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded font-mono font-bold text-indigo-600 text-sm select-all">
                          {room.code}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(room.code);
                            alert("Code copied to clipboard!");
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-semibold text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      {room.enrolledStudents?.length || 0} Students
                    </div>
                    <Link
                      href={`/teacher/rooms/${room._id}`}
                      className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                    >
                      Manage <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
