"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, User, ArrowRight, Loader2, X, Lock } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchRooms = async () => {
    try {
      const [roomsRes, requestsRes] = await Promise.all([
        fetch("/api/student/rooms"),
        fetch("/api/student/requests")
      ]);
      const roomsData = await roomsRes.json();
      const requestsData = await requestsRes.json();
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setPendingRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 mb-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="mt-2 text-indigo-100 opacity-90 max-w-md">Manage your enrolled rooms or join a new one using a code.</p>
          <div className="mt-6 flex gap-4">
            <button 
              onClick={() => setShowJoinModal(true)}
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-50 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Join Room via Code
            </button>
            <Link 
              href="/student/explore"
              className="bg-indigo-500 bg-opacity-30 text-white border border-indigo-400 px-6 py-2 rounded-lg font-bold hover:bg-opacity-40 transition-colors flex items-center"
            >
              Explore Public Rooms
            </Link>
          </div>
        </div>
        <BookOpen className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10 rotate-12" />
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Loader2 className="w-6 h-6 mr-3 text-amber-500 animate-spin" />
            Pending Join Requests
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((req) => (
              <div key={req._id} className="bg-amber-50 border border-amber-100 rounded-xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-amber-900 truncate mb-1">{req.roomId?.name}</h3>
                  <p className="text-xs text-amber-700 font-medium mb-4">Teacher: {req.roomId?.teacherId?.name}</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Awaiting Approval
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center">
                <Lock className="w-6 h-6 mr-2 text-indigo-600" />
                Join Private Room
              </h2>
              <button onClick={() => setShowJoinModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleJoinRoom} className="p-6">
              <p className="text-sm text-gray-500 mb-6">Enter the 6-character alphanumeric code provided by your teacher.</p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {error}
                </div>
              )}

              <input
                type="text"
                placeholder="E.G. 8K2L9X"
                required
                maxLength={6}
                className="w-full text-center text-3xl font-mono tracking-widest border-2 border-gray-200 rounded-xl p-4 focus:border-indigo-600 focus:ring-0 outline-none uppercase"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />

              <button 
                type="submit"
                disabled={joining || joinCode.length < 6}
                className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {joining ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enroll Now"}
              </button>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
        <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
        Enrolled ExamRooms
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
            Loading your rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full bg-white p-16 rounded-xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">You haven't joined any ExamRooms yet.</p>
            <p className="text-gray-400 text-sm mt-1">Ask your teacher for a join code or explore public rooms.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{room.name}</h3>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-8">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-medium">Prof. {room.teacherId?.name || "Unknown"}</span>
                </div>
                
                <Link 
                  href={`/student/rooms/${room._id}`}
                  className="w-full inline-flex justify-center items-center bg-gray-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200"
                >
                  Enter Classroom <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
