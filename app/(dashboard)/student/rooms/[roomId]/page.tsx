"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, FileText, ArrowLeft, Play, AlertCircle, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StudentRoomPage() {
  const { roomId } = useParams();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/student/rooms/${roomId}/exams`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed to load exams"); });
        return res.json();
      })
      .then((data) => { setExams(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [roomId]);

  if (error) return (
    <div className="max-w-xl mx-auto py-24 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
      <p className="text-slate-500 mb-8">{error}</p>
      <Link href="/student" className="btn-primary text-sm px-6 py-2.5">Return to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back + header */}
      <div>
        <Link href="/student" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-indigo-600" />
              Available Exams
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Select an exam below to get started.</p>
          </div>
          {!loading && exams.length > 0 && (
            <span className="badge badge-primary hidden sm:inline-flex">{exams.length} exam{exams.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {/* Exams */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
            <p className="text-slate-500">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No exams yet</p>
            <p className="text-slate-400 text-sm">Your teacher hasn&apos;t added any exams to this room yet.</p>
          </div>
        ) : (
          exams.map((exam) => {
            const now = new Date();
            const start = exam.startTime ? new Date(exam.startTime) : null;
            const end = exam.endTime ? new Date(exam.endTime) : null;

            let isActive = false;
            let isFuture = false;
            let isPast = false;

            if (!start && !end) {
              isActive = true;
            } else {
              isActive = (!start || now >= start) && (!end || now <= end);
              isFuture = start ? now < start : false;
              isPast = end ? now > end : false;
            }

            const statusConfig = isActive
              ? { label: "Active Now", bg: "#ecfdf5", color: "#059669", dot: "#10b981" }
              : isFuture
              ? { label: "Upcoming", bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" }
              : { label: "Closed", bg: "#f8fafc", color: "#64748b", dot: "#cbd5e1" };

            return (
              <div key={exam._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex">
                  {/* Status accent */}
                  <div className="w-1 flex-shrink-0" style={{ background: statusConfig.dot }} />
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Exam info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{exam.title}</h3>
                          {exam.isAttempted && (
                            <span className="flex items-center gap-1 badge badge-success flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Attempted
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {exam.durationMinutes} minutes
                          </span>
                          <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: statusConfig.dot }} />
                            <span className="font-semibold" style={{ color: statusConfig.color }}>{statusConfig.label}</span>
                          </span>
                        </div>
                        {(start || end) && (
                          <p className="text-xs text-slate-400 mt-2">
                            {start ? `Opens: ${start.toLocaleString()}` : "Open start"}
                            {" · "}
                            {end ? `Closes: ${end.toLocaleString()}` : "No end time"}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
                        {exam.isAttempted && (
                          <Link
                            href={`/student/exams/${exam._id}/result`}
                            className="btn-secondary text-sm px-5 py-2.5"
                          >
                            View Result
                          </Link>
                        )}
                        {isActive ? (
                          <Link
                            href={`/student/exams/${exam._id}`}
                            id={`start-exam-${exam._id}`}
                            className="btn-primary text-sm px-5 py-2.5"
                          >
                            <Play className="w-4 h-4 mr-1.5" />
                            {exam.isAttempted ? "Retake" : "Start Exam"}
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-not-allowed text-slate-400 border border-slate-200"
                          >
                            {isFuture ? "⏰ Not Started" : "🔒 Closed"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
