"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function ExamPage() {
  const { examId } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitExam = useCallback(async (finalAnswers = answers) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/student/exams/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/student/exams/${examId}/result`);
      } else {
        setError(data.message);
        setSubmitting(false);
      }
    } catch (err) {
      setError("Failed to submit exam. Please try again.");
      setSubmitting(false);
    }
  }, [examId, answers, submitting, router]);

  useEffect(() => {
    fetch(`/api/student/exams/${examId}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.message || "Could not load exam");
          });
        }
        return res.json();
      })
      .then((data) => {
        setExam(data);
        
        let initialTimeLeft = 0;
        if (data.endTime) {
          // Fixed end time
          const end = new Date(data.endTime).getTime();
          const now = new Date().getTime();
          initialTimeLeft = Math.max(0, Math.floor((end - now) / 1000));
        } else {
          // Open-ended, use duration (this isn't perfect across refreshes yet, but fixes the crash)
          initialTimeLeft = data.durationMinutes * 60;
        }
        
        setTimeLeft(initialTimeLeft);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          if (!submitting) submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, submitExam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-gray-500 font-medium">Loading exam questions...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
      <p className="text-gray-600 max-w-md">{error}</p>
      <button 
        onClick={() => router.push("/student")}
        className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold"
      >
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs md:max-w-md">
              {exam.title}
            </h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl ${
            (timeLeft || 0) < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-indigo-50 text-indigo-600"
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft || 0)}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        <div className="space-y-8">
          {exam.questions.map((q: any, idx: number) => (
            <div key={q._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">{q.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(q.options[0]).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setAnswers(prev => ({ ...prev, [q._id]: key }))}
                        className={`flex items-center p-4 rounded-lg border text-left transition-all ${
                          answers[q._id] === key
                            ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-10"
                            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-xs font-bold uppercase ${
                          answers[q._id] === key ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-400"
                        }`}>
                          {key}
                        </span>
                        <span className={answers[q._id] === key ? "text-indigo-900 font-medium" : "text-gray-700"}>
                          {value as string}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to submit your exam?")) {
                submitExam();
              }
            }}
            disabled={submitting}
            className="bg-indigo-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                Final Submission
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
