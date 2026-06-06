"use client";

import { CheckCircle2, XCircle, Info, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultViewProps {
  data: any;
  showBackToDashboard?: boolean;
  backUrl?: string;
}

export default function ResultView({ data, showBackToDashboard = true, backUrl = "/student" }: ResultViewProps) {
  if (!data?.result) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <Info className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Result not found</h1>
    </div>
  );

  const { result, exam } = data;
  const totalQuestions = result.answersSubmitted.length;
  const percentage = Math.round((result.score / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-12">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
        <p className="text-gray-500 mb-8">
            {result.studentId?.name ? `Result for ${result.studentId.name}` : "Exam Result Summary"}
        </p>
        
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Score</p>
            <p className="text-2xl font-bold text-gray-900">{result.score}/{totalQuestions}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
            <p className={`text-2xl font-bold ${percentage >= 40 ? "text-green-600" : "text-red-600"}`}>
              {percentage >= 40 ? "Pass" : "Fail"}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-8">Detailed Review</h2>

      <div className="space-y-8">
        {result.answersSubmitted.map((item: any, idx: number) => {
          const q = item.questionId;
          if (!q) return null;

          return (
            <div key={idx} className={`bg-white rounded-xl shadow-sm border ${
              item.isCorrect ? "border-green-100" : "border-red-100"
            } p-6`}>
              <div className="flex gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                  item.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">{q.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {Object.entries(q.options[0]).filter(([key]) => key !== "_id" && key !== "id").map(([key, value]) => {
                      const isSelected = item.selectedOption === key;
                      const isCorrect = q.answer === key;
                      
                      let style = "border-gray-100 text-gray-500";
                      if (isCorrect) style = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500";
                      else if (isSelected && !isCorrect) style = "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500";

                      return (
                        <div key={key} className={`flex items-center p-4 rounded-lg border ${style}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold uppercase ${
                            isCorrect ? "bg-green-500 text-white" : 
                            (isSelected ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400")
                          }`}>
                            {key}
                          </span>
                          <span>{value as string}</span>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto text-green-500" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 ml-auto text-red-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.justification && (
                    <div className="bg-indigo-50 p-4 rounded-lg flex gap-3">
                      <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Justification</p>
                        <p className="text-sm text-indigo-900 leading-relaxed">{q.justification}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
