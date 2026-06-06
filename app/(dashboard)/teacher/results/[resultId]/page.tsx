"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
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
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Results
      </button>

      <ResultView data={data} showBackToDashboard={false} />
    </div>
  );
}
