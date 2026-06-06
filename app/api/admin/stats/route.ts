import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import Result from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const [totalTeachers, totalStudents, totalQuestions, totalExams, recentResults] = await Promise.all([
    User.countDocuments({ role: "TEACHER" }),
    User.countDocuments({ role: "STUDENT" }),
    Question.countDocuments(),
    Exam.countDocuments(),
    Result.find().sort({ createdAt: -1 }).limit(5)
      .populate({ path: "studentId", model: User, select: "name" })
      .populate({ path: "examId", model: Exam, select: "title" })
  ]);

  return NextResponse.json({
    stats: {
      teachers: totalTeachers,
      students: totalStudents,
      questions: totalQuestions,
      exams: totalExams
    },
    recentResults
  });
}
