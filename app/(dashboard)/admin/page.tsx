"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, TrendingUp, Loader2, Award, Activity, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
      <p className="text-slate-500 text-sm font-medium">Loading administrative stats...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Admin Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-10 text-white bg-slate-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle,white,transparent)", transform: "translate(20%,20%)" }} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">Root Admin Space</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Platform Console ⚡</h1>
            <p className="text-slate-400 max-w-md text-sm">Monitor system users, verify question banks, and overview test results across rooms.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold self-start sm:self-center">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Server status: Online</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Teachers" value={data?.stats?.teachers || 0} icon={Users} gradient="from-blue-500 to-indigo-600" />
        <StatCard title="Total Students" value={data?.stats?.students || 0} icon={Users} gradient="from-emerald-500 to-teal-600" />
        <StatCard title="Global Questions" value={data?.stats?.questions || 0} icon={BookOpen} gradient="from-purple-500 to-violet-600" />
        <StatCard title="Total Exams" value={data?.stats?.exams || 0} icon={FileText} gradient="from-amber-500 to-orange-600" />
      </div>

      {/* Lower Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Recent Exam Results</h2>
            <p className="text-slate-400 text-xs mt-0.5">Realtime student submissions from all rooms</p>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {data?.recentResults?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No exam submissions recorded.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Title</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentResults.map((r: any) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-6 py-4 font-semibold text-slate-800">{r.studentId?.name}</td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-[180px]">{r.examId?.title}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600 text-right">{r.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Platform Insights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Platform Insights</h2>
            <p className="text-slate-400 text-xs mt-0.5">Core indicators on user behavior and system performance</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100/50 rounded-xl">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-indigo-600 mr-3" />
                <span className="text-sm font-semibold text-indigo-950">User Signups Growth</span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-100">+12% this month</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100/50 rounded-xl">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-emerald-600 mr-3" />
                <span className="text-sm font-semibold text-emerald-950">Active Exams Ratio</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-100">Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={cn("p-2 rounded-xl text-white bg-gradient-to-br shadow-sm", gradient)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}
