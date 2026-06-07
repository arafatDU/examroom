"use client";

import { CheckCircle2, XCircle, Info, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ResultViewProps {
  data: any;
  showBackToDashboard?: boolean;
  backUrl?: string;
}

export default function ResultView({ data, showBackToDashboard = true, backUrl = "/student" }: ResultViewProps) {
  if (!data?.result) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Info className="w-10 h-10 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Result Not Found</h1>
      <p className="text-slate-500 mb-6">We couldn&apos;t find the result for this exam.</p>
      <Link href={backUrl} className="btn-primary text-sm px-6 py-2.5">Back to Dashboard</Link>
    </div>
  );

  const { result, exam } = data;
  const totalQuestions = result.answersSubmitted.length;
  const percentage = Math.round((result.score / totalQuestions) * 100);
  const passed = percentage >= 40;
  const wrongCount = totalQuestions - result.score;

  // Score arc colors
  const arcColor = passed ? "#10b981" : "#ef4444";
  const arcBg = passed ? "#ecfdf5" : "#fef2f2";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Score Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score circle */}
            <div className="flex-shrink-0 relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(${arcColor} ${percentage * 3.6}deg, #e2e8f0 ${percentage * 3.6}deg)`,
                  padding: "4px",
                }}
              >
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-white">
                  <span className="text-3xl font-extrabold" style={{ color: arcColor }}>{percentage}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1">{exam.title}</h1>
              {result.studentId?.name && (
                <p className="text-slate-400 text-xs mb-4">Result for <span className="font-semibold text-slate-600">{result.studentId.name}</span></p>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-xl font-extrabold text-slate-800">{result.score}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Correct</p>
                </div>
                <div className="bg-red-50/50 rounded-xl p-3 text-center border border-red-50">
                  <p className="text-xl font-extrabold text-red-600">{wrongCount}</p>
                  <p className="text-[10px] text-red-400 font-bold uppercase mt-0.5">Wrong</p>
                </div>
                <div className="bg-indigo-50/50 rounded-xl p-3 text-center border border-indigo-50">
                  <p className="text-xl font-extrabold text-indigo-700">{result.score}/{totalQuestions}</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-955 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-600" />
          Detailed Review
          <span className="badge badge-primary ml-1">{totalQuestions} Questions</span>
        </h2>

        <div className="space-y-4">
          {result.answersSubmitted.map((item: any, idx: number) => {
            const q = item.questionId;
            if (!q) return null;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
              >
                {/* Question header */}
                <div className="flex items-start gap-3.5 mb-5">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 text-white`}
                    style={{ background: item.isCorrect ? "#10b981" : "#ef4444" }}>
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 leading-relaxed pt-1">{q.title}</h3>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {Object.entries(q.options[0]).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => {
                    const isSelected = item.selectedOption === key;
                    const isCorrect = q.answer === key;

                    let borderStyle = "border-slate-100 bg-slate-50";
                    let labelStyle = "bg-slate-100 text-slate-400";
                    let textStyle = "text-slate-500";
                    let icon = null;

                    if (isCorrect) {
                      borderStyle = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 ring-opacity-20";
                      labelStyle = "bg-emerald-500 text-white";
                      textStyle = "text-emerald-800 font-medium";
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />;
                    } else if (isSelected && !isCorrect) {
                      borderStyle = "border-red-400 bg-red-50 ring-1 ring-red-400 ring-opacity-20";
                      labelStyle = "bg-red-500 text-white";
                      textStyle = "text-red-700 font-medium";
                      icon = <XCircle className="w-4 h-4 text-red-600 ml-auto flex-shrink-0" />;
                    }

                    return (
                      <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${borderStyle}`}>
                        <span className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0 ${labelStyle}`}>
                          {key}
                        </span>
                        <span className={`text-sm flex-1 ${textStyle}`}>{value as string}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                {/* Justification / Explanation */}
                {q.justification && (
                  <div className="flex gap-2.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Explanation</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{q.justification}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <Link href={backUrl} className="btn-secondary flex items-center gap-2 justify-center py-3 flex-1 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
