import dbConnect from "@/lib/mongodb";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { resultId } = await params;

  await dbConnect();

  const result = await Result.findById(resultId)
    .populate("studentId", "name email")
    .populate({
      path: 'answersSubmitted.questionId',
      model: Question,
      select: 'title options answer justification serialNumber',
    });

  if (!result) {
    return NextResponse.json({ message: "Result not found" }, { status: 404 });
  }

  const exam = await Exam.findById(result.examId).populate("examRoomId");
  if (!exam) {
    return NextResponse.json({ message: "Exam not found" }, { status: 404 });
  }

  // Verify permission
  if (session.user.role !== "ADMIN" && (exam.examRoomId as any).teacherId.toString() !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ result, exam });
}
