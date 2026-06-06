"use client";

import { useEffect, useState } from "react";
import { Search, User, ArrowRight, Loader2, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExploreRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/explore")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      });
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
        // Refresh list to remove requested room
        setRooms(rooms.filter(r => r._id !== roomId));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to send request");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Globe className="w-8 h-8 mr-3 text-indigo-600" />
          Explore Public ExamRooms
        </h1>
        <p className="text-gray-500 mt-2">Find and request to join public rooms created by teachers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
            Finding public rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full bg-white p-16 rounded-xl border border-gray-100 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No public rooms available at the moment.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 truncate flex-1">{room.name}</h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">PUBLIC</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="w-4 h-4 mr-1.5 text-gray-400" />
                  Teacher: {room.teacherId?.name || "Unknown"}
                </div>
                
                <button 
                  onClick={() => handleJoinRoom(room._id, room.code)}
                  disabled={joiningId === room._id}
                  className="w-full inline-flex justify-center items-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors border border-transparent disabled:opacity-50"
                >
                  {joiningId === room._id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request to Join"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
