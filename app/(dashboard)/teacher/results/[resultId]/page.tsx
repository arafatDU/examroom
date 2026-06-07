"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import ResultView from "@/components/shared/ResultView";

export default function TeacherResultDetailPage() {
  const { resultId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teacher/results/${resultId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [resultId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
      <p className="text-slate-500 text-sm font-medium">Loading submission details...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Results
      </button>

      <ResultView data={data} showBackToDashboard={false} />
    </div>
  );
}
