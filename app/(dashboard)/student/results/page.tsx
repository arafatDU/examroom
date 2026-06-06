"use client";

import { useEffect, useState } from "react";
import { Trophy, Calendar, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/results")
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Performance History</h1>

      <div className="grid grid-cols-1 gap-6">
        {results.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't taken any exams yet.</p>
          </div>
        ) : (
          results.map((result) => (
            <div key={result._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{result.examId?.title}</h3>
                  <p className="text-sm text-gray-500">{result.examId?.examRoomId?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Score</p>
                  <p className="text-lg font-bold text-gray-900">{result.score}/{result.answersSubmitted.length}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Link 
                    href={`/student/exams/${result.examId?._id}/result`}
                    className="inline-flex items-center text-indigo-600 font-bold hover:underline"
                  >
                    View Review <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
