"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, AlertTriangle, CheckCircle, Loader2, BookOpen } from "lucide-react";

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
    } catch {
      setError("Failed to submit exam. Please try again.");
      setSubmitting(false);
    }
  }, [examId, answers, submitting, router]);

  useEffect(() => {
    fetch(`/api/student/exams/${examId}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Could not load exam"); });
        return res.json();
      })
      .then((data) => {
        setExam(data);
        let initialTimeLeft = 0;
        if (data.endTime) {
          const end = new Date(data.endTime).getTime();
          initialTimeLeft = Math.max(0, Math.floor((end - Date.now()) / 1000));
        } else {
          initialTimeLeft = data.durationMinutes * 60;
        }
        setTimeLeft(initialTimeLeft);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) { clearInterval(timer); if (!submitting) submitExam(); return 0; }
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
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: "#f8f9ff" }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
      <p className="text-slate-600 font-semibold text-lg">Loading exam...</p>
      <p className="text-slate-400 text-sm mt-1">Please wait while we prepare your questions.</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center" style={{ background: "#f8f9ff" }}>
      <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Unable to Load Exam</h1>
      <p className="text-slate-500 max-w-md mb-8">{error}</p>
      <button onClick={() => router.push("/student")} className="btn-primary text-sm px-6 py-2.5">
        Return to Dashboard
      </button>
    </div>
  );

  const questions = exam.questions || [];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLowTime = (timeLeft || 0) < 60;

  return (
    <div className="min-h-screen flex flex-col pb-12" style={{ background: "#f8f9ff" }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-sm md:max-w-lg">{exam.title}</h1>
              <p className="text-xs text-slate-400">{answeredCount} of {totalQ} answered</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Progress Bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(answeredCount / totalQ) * 100}%`, background: "linear-gradient(90deg,#6366f1,#7c3aed)" }} />
              </div>
              <span className="text-xs text-slate-400 font-medium">{Math.round((answeredCount / totalQ) * 100)}%</span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-base transition-all ${isLowTime ? "bg-red-100 text-red-600 animate-pulse" : "bg-indigo-50 text-indigo-700"}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft || 0)}
            </div>
          </div>
        </div>
        {/* Full-width progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div className="h-full transition-all duration-300" style={{ width: `${(answeredCount / totalQ) * 100}%`, background: "linear-gradient(90deg,#6366f1,#7c3aed)" }} />
        </div>
      </header>

      {/* Main Container - Scrollable Question List */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {questions.map((q: any, idx: number) => (
          <div key={q._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 transition-shadow hover:shadow-md">
            {/* Question Header - Simple clean number badge */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {idx + 1}
              </div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900 leading-relaxed pt-1.5">
                {q.title}
              </h2>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(q.options[0])
                .filter(([key]) => key !== "_id" && key !== "id")
                .map(([key, value]) => {
                  const isSelected = answers[q._id] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: key }))}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-indigo-500 shadow-sm"
                          : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                      style={isSelected ? { background: "linear-gradient(135deg,#eef2ff,#f5f3ff)" } : {}}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 transition-all ${
                        isSelected ? "text-white" : "bg-slate-100 text-slate-500"
                      }`}
                        style={isSelected ? { background: "linear-gradient(135deg,#6366f1,#7c3aed)" } : {}}>
                        {key}
                      </span>
                      <span className={`text-sm font-medium ${isSelected ? "text-indigo-900" : "text-slate-700"}`}>
                        {value as string}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Submit Section */}
        <div className="pt-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Answered {answeredCount} of {totalQ} questions
          </p>
          <button
            id="submit-exam-btn"
            onClick={() => {
              if (confirm(`Are you sure you want to submit? You have answered ${answeredCount} out of ${totalQ} questions.`)) {
                submitExam();
              }
            }}
            disabled={submitting}
            className="btn-primary text-base px-10 py-3.5 rounded-xl w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Final Submission</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
