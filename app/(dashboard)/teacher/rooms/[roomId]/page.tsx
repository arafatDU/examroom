"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, FileText, Users, Clock, ArrowLeft, BarChart2, Trash2, Check, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TeacherRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"exams" | "students">("exams");

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, examsRes, requestsRes, studentsRes] = await Promise.all([
        fetch(`/api/teacher/rooms`),
        fetch(`/api/teacher/rooms/${roomId}/exams`),
        fetch(`/api/teacher/rooms/${roomId}/requests`),
        fetch(`/api/teacher/rooms/${roomId}/students`)
      ]);

      const [rooms, examsData, requestsData, studentsData] = await Promise.all([
        roomsRes.json(),
        examsRes.json(),
        requestsRes.json(),
        studentsRes.json()
      ]);

      const currentRoom = rooms.find((r: any) => r._id === roomId);
      setRoom(currentRoom);
      setExams(Array.isArray(examsData) ? examsData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      console.error("Failed to fetch room data");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRoom = async () => {
    if (!confirm("Are you sure? This will delete the room, all exams, and all results PERMANENTLY.")) return;
    
    const res = await fetch(`/api/teacher/rooms/${roomId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/teacher");
    } else {
      alert("Failed to delete room");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Delete this exam and all student results?")) return;
    
    const res = await fetch(`/api/teacher/rooms/${roomId}/exams/${examId}`, { method: "DELETE" });
    if (res.ok) {
      setExams(prev => prev.filter(e => e._id !== examId));
    }
  };

  const handleRequest = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch(`/api/teacher/rooms/${roomId}/requests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status }),
    });

    if (res.ok) {
      fetchData(); // Refresh all to keep student list in sync
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Remove this student from the room?")) return;
    
    const res = await fetch(`/api/teacher/rooms/${roomId}/students`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });

    if (res.ok) {
      fetchData();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href="/teacher" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <button 
          onClick={handleDeleteRoom}
          className="flex items-center text-red-600 hover:text-red-700 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Room
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{room?.name}</h1>
            <div className="flex items-center mt-2 text-gray-500 gap-4 flex-wrap">
              <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                <Users className="w-4 h-4 mr-1.5" /> {students.length} Students
              </span>
              <span className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                Code: {room?.code}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold uppercase",
                room?.visibility === 'PUBLIC' ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
              )}>
                {room?.visibility}
              </span>
            </div>
          </div>
          <Link 
            href={`/teacher/rooms/${roomId}/exams/new`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-100 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Exam
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab("exams")}
          className={cn(
            "px-8 py-4 font-bold text-sm transition-colors relative",
            activeTab === "exams" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Exams Bank ({exams.length})
          {activeTab === "exams" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("students")}
          className={cn(
            "px-8 py-4 font-bold text-sm transition-colors relative flex items-center",
            activeTab === "students" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Students & Requests
          {requests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {requests.length}
            </span>
          )}
          {activeTab === "students" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {activeTab === "exams" ? (
        <div className="space-y-6">
          {exams.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No exams created for this room yet.</p>
              <Link href={`/teacher/rooms/${roomId}/exams/new`} className="text-indigo-600 font-bold mt-4 inline-block">
                Start by creating your first exam &rarr;
              </Link>
            </div>
          ) : (
            exams.map((exam) => (
              <div key={exam._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-gray-400" /> {exam.durationMinutes} min</span>
                    <span className="flex items-center"><FileText className="w-4 h-4 mr-1.5 text-gray-400" /> {exam.questions?.length} MCQs</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {exam.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/teacher/exams/${exam._id}/results`}
                    className="p-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
                    title="View Results"
                  >
                    <BarChart2 className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteExam(exam._id)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Requests Section */}
          {requests.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                Pending Join Requests
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <div key={req._id} className="p-5 flex items-center justify-between hover:bg-red-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                          {req.studentId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{req.studentId?.name}</p>
                          <p className="text-sm text-gray-500">{req.studentId?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRequest(req._id, "APPROVED")}
                          className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 shadow-sm transition-all flex items-center"
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleRequest(req._id, "REJECTED")}
                          className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center"
                        >
                          <X className="w-4 h-4 mr-1.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Students Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Enrolled Students
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-500">No students enrolled yet.</td></tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student._id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {student.name?.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => handleRemoveStudent(student._id)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Student"
                          >
                            <Trash2 className="w-4 h-4 ml-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
