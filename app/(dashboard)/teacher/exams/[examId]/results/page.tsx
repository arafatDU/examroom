"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, Trophy, Calendar, ArrowLeft, Loader2, Search, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TeacherExamResultsPage() {
  const { examId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teacher/exams/${examId}/results`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, [examId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/teacher" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">{data?.exam?.title}</h1>
        <p className="text-gray-500 mt-2">Scoreboard & Performance tracking</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Student Submissions ({data?.results?.length})</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search students..." className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted At</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.results?.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No submissions yet.</td></tr>
            ) : (
              data?.results?.map((res: any) => (
                <tr key={res._id} className="hover:bg-gray-50 transition-colors text-sm">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{res.studentId?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{res.studentId?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600">
                    {res.score}/{res.answersSubmitted.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      (res.score / res.answersSubmitted.length) >= 0.4 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                      {Math.round((res.score / res.answersSubmitted.length) * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(res.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/teacher/results/${res._id}`}
                      className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
