"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Clipboard, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My ExamRooms</h1>
        <Link 
          href="/teacher/rooms/new"
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Room
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-gray-500">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-500">You haven't created any ExamRooms yet.</p>
            <Link href="/teacher/rooms/new" className="mt-4 inline-block text-indigo-600 font-medium">
              Create your first room &rarr;
            </Link>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Join Code:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono font-bold text-lg">
                  {room.code}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(room.code);
                    alert("Code copied!");
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1.5" />
                  {room.enrolledStudents?.length || 0} Students
                </div>
                <Link 
                  href={`/teacher/rooms/${room._id}`}
                  className="flex items-center text-indigo-600 font-medium hover:underline"
                >
                  Manage <ExternalLink className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
