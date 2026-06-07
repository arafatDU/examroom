"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, User, ArrowRight, Loader2, X, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  const userName = session?.user?.name || "Student";

  const fetchRooms = async () => {
    try {
      const [roomsRes, requestsRes] = await Promise.all([
        fetch("/api/student/rooms"),
        fetch("/api/student/requests"),
      ]);
      const roomsData = await roomsRes.json();
      const requestsData = await requestsRes.json();
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setPendingRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) return;
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/student/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmedCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setJoinCode("");
        setShowJoinModal(false);
        fetchRooms();
        alert(data.message);
      } else {
        setError(data.message);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setJoining(false);
    }
  };

  // Color palette for room cards
  const roomColors = [
    { from: "#6366f1", to: "#7c3aed", light: "#eef2ff" },
    { from: "#0ea5e9", to: "#2563eb", light: "#eff6ff" },
    { from: "#10b981", to: "#059669", light: "#ecfdf5" },
    { from: "#f59e0b", to: "#d97706", light: "#fffbeb" },
    { from: "#ec4899", to: "#db2777", light: "#fdf2f8" },
    { from: "#8b5cf6", to: "#7c3aed", light: "#f5f3ff" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-10 text-white" style={{ background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 50%,#9333ea 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle,white,transparent)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-48 opacity-10" style={{ background: "radial-gradient(ellipse,white,transparent)" }} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span className="text-indigo-200 text-sm font-medium">Student Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome back, {userName.split(" ")[0]}! 👋</h1>
            <p className="text-indigo-200 max-w-md text-sm md:text-base">Manage your enrolled rooms, take exams, and track your performance — all in one place.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="join-room-btn"
              onClick={() => setShowJoinModal(true)}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Join via Code
            </button>
            <Link
              href="/student/explore"
              className="flex items-center justify-center gap-2 bg-white/15 text-white border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition-all text-sm whitespace-nowrap backdrop-blur-sm"
            >
              Explore Public Rooms
            </Link>
          </div>
        </div>
        <BookOpen className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Pending Join Requests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <div key={req._id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-bold text-amber-900 truncate mb-1">{req.roomId?.name}</h3>
                <p className="text-xs text-amber-700 mb-3">Teacher: {req.roomId?.teacherId?.name}</p>
                <span className="badge badge-warning">⏳ Awaiting Approval</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rooms Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Enrolled ExamRooms
            {rooms.length > 0 && <span className="badge badge-primary ml-1">{rooms.length}</span>}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
              <p className="text-slate-500 font-medium">Loading your rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-1">No rooms yet</p>
              <p className="text-slate-400 text-sm mb-6">Ask your teacher for a join code or explore public rooms.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => setShowJoinModal(true)} className="btn-primary text-sm px-6 py-2.5">
                  <Plus className="w-4 h-4 mr-1.5" /> Join via Code
                </button>
                <Link href="/student/explore" className="btn-secondary text-sm px-6 py-2.5">
                  Explore Rooms
                </Link>
              </div>
            </div>
          ) : (
            rooms.map((room, idx) => {
              const palette = roomColors[idx % roomColors.length];
              const initials = (room.teacherId?.name || "T").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={room._id} className="er-card bg-white overflow-hidden group">
                  {/* Card top accent */}
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg,${palette.from},${palette.to})` }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight pr-2">{room.name}</h3>
                    </div>
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg,${palette.from},${palette.to})` }}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{room.teacherId?.name || "Unknown Teacher"}</p>
                        <p className="text-xs text-slate-400">Teacher</p>
                      </div>
                    </div>
                    <Link
                      href={`/student/rooms/${room._id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                      style={{ background: `linear-gradient(135deg,${palette.from},${palette.to})`, boxShadow: `0 4px 12px ${palette.from}33` }}
                    >
                      Enter Classroom <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Join Private Room</h2>
              </div>
              <button onClick={() => { setShowJoinModal(false); setError(""); setJoinCode(""); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJoinRoom} className="p-6">
              <p className="text-sm text-slate-500 mb-5">Enter the 6-character code provided by your teacher.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 font-medium">{error}</div>
              )}
              <input
                type="text"
                placeholder="E.G. 8K2L9X"
                required
                maxLength={6}
                id="join-code-input"
                className="w-full text-center text-3xl font-mono tracking-[0.4em] border-2 border-slate-200 rounded-xl p-4 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none uppercase transition-all bg-slate-50"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button
                type="submit"
                id="join-room-submit"
                disabled={joining || joinCode.length < 6}
                className={`w-full mt-5 py-3.5 rounded-xl font-bold text-base text-white transition-all flex items-center justify-center ${joinCode.length >= 6 ? "animate-pulse-glow" : ""}`}
                style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", opacity: joining || joinCode.length < 6 ? 0.6 : 1 }}
              >
                {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enroll Now →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
