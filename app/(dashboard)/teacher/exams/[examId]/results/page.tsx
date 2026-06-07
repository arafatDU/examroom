"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Search, Eye, Trophy, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TeacherExamResultsPage() {
  const { examId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`/api/teacher/exams/${examId}/results`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, [examId]);

  // Client-side search implementation
  const filteredResults = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((res: any) => {
      const name = res.studentId?.name?.toLowerCase() || "";
      const email = res.studentId?.email?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [data, searchQuery]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-slate-500 text-sm font-medium">Loading exam submissions...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-500 text-xs font-bold uppercase tracking-wider">Results Scoreboard</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{data?.exam?.title}</h1>
        <p className="text-slate-400 text-sm mt-1">Review student performance, accurate ratios, and time of completion.</p>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Student Submissions</h2>
            <p className="text-slate-400 text-xs mt-0.5">Showing {filteredResults.length} records</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors" 
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted At</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res: any) => {
                  const scoreTotal = res.answersSubmitted?.length || 0;
                  const ratio = scoreTotal > 0 ? res.score / scoreTotal : 0;
                  return (
                    <tr key={res._id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">{res.studentId?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{res.studentId?.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600">
                        {res.score}/{scoreTotal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold",
                          ratio >= 0.4 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        )}>
                          {Math.round(ratio * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                        {new Date(res.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/teacher/results/${res._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition-colors border border-indigo-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
