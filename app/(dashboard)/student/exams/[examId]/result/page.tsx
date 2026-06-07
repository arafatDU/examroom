"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ResultView from "@/components/shared/ResultView";

export default function ResultPage() {
  const { examId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/exams/${examId}/result`)
      .then((res) => res.json())
      .then((data) => { setData(data); setLoading(false); });
  }, [examId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
        <Loader2 className="w-7 h-7 animate-spin text-white" />
      </div>
      <p className="text-slate-600 font-semibold">Loading your result...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-2 py-2">
      <Link href="/student" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <ResultView data={data} backUrl="/student" />
    </div>
  );
}
