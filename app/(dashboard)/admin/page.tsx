"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, TrendingUp, Loader2 } from "lucide-react";

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
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Teachers" value={data.stats.teachers} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Students" value={data.stats.students} icon={Users} color="bg-green-500" />
        <StatCard title="Global Questions" value={data.stats.questions} icon={BookOpen} color="bg-purple-500" />
        <StatCard title="Total Exams" value={data.stats.exams} icon={FileText} color="bg-orange-500" />
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Results</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {data.recentResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No recent activity.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Exam</th>
                    <th className="px-6 py-3">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentResults.map((r: any) => (
                    <tr key={r._id} className="text-sm">
                      <td className="px-6 py-4 font-medium">{r.studentId?.name}</td>
                      <td className="px-6 py-4">{r.examId?.title}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-indigo-900">User Growth</span>
              </div>
              <span className="text-xs font-bold text-indigo-600">+12% this month</span>
            </div>
            {/* Add more insights here */}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
