"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, Sparkles, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
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
      <p className="text-slate-500 text-sm font-medium">Loading platform analytics...</p>
    </div>
  );

  const roleData = [
    { name: "Teachers", value: data?.stats?.teachers || 0 },
    { name: "Students", value: data?.stats?.students || 0 },
  ];

  const COLORS = ["#6366f1", "#10b981"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight font-sans">Platform Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Demographics, resources allocation, and global data trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution PieChart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">User Distribution</h2>
            <p className="text-slate-400 text-xs mb-6">Percentage ratio of active student accounts and teachers.</p>
          </div>
          
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800">
                {(data?.stats?.teachers || 0) + (data?.stats?.students || 0)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
            {roleData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs font-semibold text-slate-600">{item.name}: <span className="text-slate-900 font-bold">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Overview BarChart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">Content Overview</h2>
            <p className="text-slate-400 text-xs mb-6">Global question bank count versus scheduled exams.</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { name: "Questions", value: data?.stats?.questions || 0 },
                  { name: "Exams", value: data?.stats?.exams || 0 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(99,102,241,0.04)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Repository distribution: Global DB</span>
            <span className="font-bold text-indigo-600">Active Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}
