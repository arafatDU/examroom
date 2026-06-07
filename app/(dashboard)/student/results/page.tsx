"use client";

import { useEffect, useState } from "react";
import { Trophy, ArrowRight, Loader2, TrendingUp, Target, BookOpen } from "lucide-react";
import Link from "next/link";

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/results")
      .then((res) => res.json())
      .then((data) => { setResults(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  // Compute summary stats
  const totalExams = results.length;
  const avgScore = totalExams > 0
    ? Math.round(results.reduce((acc, r) => acc + Math.round((r.score / (r.answersSubmitted?.length || 1)) * 100), 0) / totalExams)
    : 0;
  const bestScore = totalExams > 0
    ? Math.max(...results.map((r) => Math.round((r.score / (r.answersSubmitted?.length || 1)) * 100)))
    : 0;
  const passCount = results.filter((r) => Math.round((r.score / (r.answersSubmitted?.length || 1)) * 100) >= 40).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
        <p className="text-slate-500 font-medium">Loading your results...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-indigo-600" />
          My Performance
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Your complete exam history and results overview.</p>
      </div>

      {/* Summary stats */}
      {totalExams > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Exams Taken", value: totalExams, icon: BookOpen, color: "#6366f1", bg: "#eef2ff" },
            { label: "Avg. Score", value: `${avgScore}%`, icon: Target, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Best Score", value: `${bestScore}%`, icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
            { label: "Passed", value: `${passCount}/${totalExams}`, icon: Trophy, color: "#d97706", bg: "#fffbeb" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results list */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No results yet</p>
            <p className="text-slate-400 text-sm">Take your first exam to see your performance here.</p>
          </div>
        ) : (
          results.map((result) => {
            const total = result.answersSubmitted?.length || 1;
            const pct = Math.round((result.score / total) * 100);
            const passed = pct >= 40;
            return (
              <div
                key={result._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Color left border */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: passed ? "#10b981" : "#ef4444" }} />
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: exam info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: passed ? "#ecfdf5" : "#fef2f2" }}>
                          <Trophy className="w-6 h-6" style={{ color: passed ? "#059669" : "#ef4444" }} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 truncate">{result.examId?.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{result.examId?.examRoomId?.name}</p>
                        </div>
                      </div>

                      {/* Right: stats */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Score</p>
                          <p className="text-xl font-extrabold text-slate-900">{result.score}/{total}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Accuracy</p>
                          <p className="text-xl font-extrabold" style={{ color: passed ? "#059669" : "#ef4444" }}>{pct}%</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Date</p>
                          <p className="text-sm font-bold text-slate-700">{new Date(result.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <Link
                          href={`/student/exams/${result.examId?._id}/result`}
                          className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors whitespace-nowrap"
                        >
                          Review <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: passed ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#f87171,#ef4444)" }} />
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
