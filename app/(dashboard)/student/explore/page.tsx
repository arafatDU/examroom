"use client";

import { useEffect, useState } from "react";
import { Search, User, ArrowRight, Loader2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExploreRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/explore")
      .then((res) => res.json())
      .then((data) => { setRooms(data); setLoading(false); });
  }, []);

  const handleJoinRoom = async (roomId: string, code: string) => {
    setJoiningId(roomId);
    try {
      const res = await fetch("/api/student/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setRooms(rooms.filter((r) => r._id !== roomId));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Failed to send request");
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = rooms.filter((r) =>
    r.name?.toLowerCase().includes(query.toLowerCase()) ||
    r.teacherId?.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-7 h-7 text-indigo-600" />
            Explore Public Rooms
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Find and request to join public exam rooms created by teachers.</p>
        </div>
        {!loading && rooms.length > 0 && (
          <span className="badge badge-primary text-sm self-start sm:self-center">{rooms.length} rooms available</span>
        )}
      </div>

      {/* Search bar */}
      {!loading && rooms.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms or teachers..."
            className="input-field pl-10 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
            <p className="text-slate-500 font-medium">Finding public rooms...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">{query ? "No rooms match your search" : "No public rooms available"}</p>
            <p className="text-slate-400 text-sm">{query ? "Try a different search term." : "Check back later or ask your teacher for a join code."}</p>
          </div>
        ) : (
          filtered.map((room) => {
            const initials = (room.teacherId?.name || "T").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div key={room._id} className="er-card bg-white overflow-hidden">
                <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#6366f1,#7c3aed)" }} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 truncate flex-1 pr-2">{room.name}</h3>
                    <span className="badge badge-success flex-shrink-0">PUBLIC</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{room.teacherId?.name || "Unknown Teacher"}</p>
                      <p className="text-xs text-slate-400">Teacher</p>
                    </div>
                  </div>
                  <button
                    id={`join-${room._id}`}
                    onClick={() => handleJoinRoom(room._id, room.code)}
                    disabled={joiningId === room._id}
                    className="btn-primary w-full py-2.5 text-sm"
                  >
                    {joiningId === room._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><ArrowRight className="w-4 h-4 mr-1.5" /> Request to Join</>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
