"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, FileText, ArrowLeft, Play, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function StudentRoomPage() {
  const { roomId } = useParams();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/student/rooms/${roomId}/exams`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then(d => { throw new Error(d.message || "Failed to load exams") });
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setExams(data);
        } else {
          setExams([]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [roomId]);

  if (error) return (
    <div className="max-w-5xl mx-auto p-12 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-8">{error}</p>
      <Link href="/student" className="text-indigo-600 font-bold hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/student" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Exams</h1>

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading exams...</p>
        ) : exams.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No exams available in this room yet.</p>
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
              isActive = true; // Open-ended
            } else {
              isActive = (!start || now >= start) && (!end || now <= end);
              isFuture = start ? now < start : false;
              isPast = end ? now > end : false;
            }

            return (
              <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                      {exam.durationMinutes} Minutes
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        isActive ? 'bg-green-100 text-green-700' : 
                        isFuture ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isActive ? 'Active Now' : isFuture ? 'Upcoming' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    {start || end ? (
                      <>
                        {start ? `Start: ${start.toLocaleString()}` : 'Open Start'} | {end ? `End: ${end.toLocaleString()}` : 'Open End'}
                      </>
                    ) : (
                      'Always Available'
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {exam.isAttempted && (
                    <Link
                      href={`/student/exams/${exam._id}/result`}
                      className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      View Last Result
                    </Link>
                  )}

                  {isActive ? (
                    <Link
                      href={`/student/exams/${exam._id}`}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {exam.isAttempted ? "Retake Exam" : "Start Exam"}
                    </Link>
                  ) : isFuture ? (
                    <button disabled className="bg-gray-100 text-gray-400 px-6 py-2 rounded-lg font-semibold cursor-not-allowed">
                      Not Started
                    </button>
                  ) : !exam.isAttempted ? (
                    <button disabled className="bg-gray-100 text-gray-400 px-6 py-2 rounded-lg font-semibold cursor-not-allowed">
                      Closed
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
