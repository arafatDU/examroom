"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, FileText, Users, Clock, ArrowLeft, BarChart2, Trash2, Check, X, AlertCircle, Sparkles } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"exams" | "students" | "requests">("exams");

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
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 text-sm font-medium">Loading room data...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back link + Delete action */}
      <div className="flex justify-between items-center">
        <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <button 
          onClick={handleDeleteRoom}
          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100/80 px-4 py-2 rounded-xl transition-colors border border-red-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Room
        </button>
      </div>

      {/* Room Stats Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase",
                room?.visibility === 'PUBLIC' ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
              )}>
                {room?.visibility}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{room?.name}</h1>
            <div className="flex items-center mt-3 text-slate-500 gap-4 flex-wrap text-sm font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" /> {students.length} Students
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Invite Code: <span className="font-mono font-bold text-indigo-600">{room?.code}</span>
              </span>
            </div>
          </div>
          <Link 
            href={`/teacher/rooms/${roomId}/exams/new`}
            className="btn-primary px-6 py-3 text-sm rounded-xl font-bold flex items-center justify-center gap-2 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </Link>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "exams", label: `Exams (${exams.length})` },
          { id: "students", label: `Students (${students.length})` },
          { id: "requests", label: `Requests (${requests.length})`, alert: requests.length > 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-4.5 font-bold text-sm transition-all relative flex items-center gap-1.5",
              activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
            )}
          >
            {tab.label}
            {tab.alert && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content area */}
      <div className="space-y-6">
        {activeTab === "exams" && (
          <div className="space-y-4">
            {exams.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl border border-dashed border-slate-200 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-700 font-semibold text-base">No exams created yet</p>
                <p className="text-slate-400 text-sm mt-0.5">Start testing your students by publishing your first exam.</p>
                <Link href={`/teacher/rooms/${roomId}/exams/new`} className="btn-primary text-xs px-5 py-2.5 mt-4 inline-flex">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create Exam
                </Link>
              </div>
            ) : (
              exams.map((exam) => (
                <div key={exam._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{exam.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" /> {exam.durationMinutes} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-slate-400" /> {exam.questions?.length || 0} Questions
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide",
                        exam.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                      )}>
                        {exam.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/teacher/exams/${exam._id}/results`}
                      className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors border border-slate-200 shadow-sm"
                      title="View Results"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteExam(exam._id)}
                      className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-slate-400 text-sm">
                      No students enrolled in this room yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleRemoveStudent(student._id)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
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
        )}

        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-700 font-semibold text-base">No pending requests</p>
                <p className="text-slate-400 text-sm">Students seeking to join this room will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {requests.map((req) => (
                  <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                        {req.studentId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{req.studentId?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{req.studentId?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRequest(req._id, "APPROVED")}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleRequest(req._id, "REJECTED")}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1 border border-slate-200"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
