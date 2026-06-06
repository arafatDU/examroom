import dbConnect from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import Result from "@/models/Result";
import ExamRoom from "@/models/ExamRoom";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;

  await dbConnect();

  const exam = await Exam.findById(examId).populate({
    path: "questions",
    model: Question,
    select: "title options subject chapter board serialNumber", // Exclude answer and justification
  });

  if (!exam) {
    return NextResponse.json({ message: "Exam not found" }, { status: 404 });
  }

  // Verify enrollment
  const room = await ExamRoom.findOne({
    _id: exam.examRoomId,
    enrolledStudents: session.user.id
  });

  if (!room) {
    return NextResponse.json({ message: "You are not enrolled in this room" }, { status: 403 });
  }

  // Check if student already submitted - only block for scheduled exams
  const isScheduled = !!(exam.startTime || exam.endTime);
  
  if (isScheduled) {
    const existingResult = await Result.findOne({
      examId,
      studentId: session.user.id,
    });

    if (existingResult) {
      return NextResponse.json({ message: "Already submitted", resultId: existingResult._id }, { status: 400 });
    }
  }

  // Check if exam is within time limits
  const now = new Date();
  if (exam.startTime && now < exam.startTime) {
    return NextResponse.json({ message: "Exam has not started yet" }, { status: 403 });
  }
  if (exam.endTime && now > exam.endTime) {
    return NextResponse.json({ message: "Exam has already closed" }, { status: 403 });
  }

  return NextResponse.json(exam);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;
  const { answers } = await req.json(); // { questionId: selectedOption }

  await dbConnect();

  const exam = await Exam.findById(examId).populate({ path: "questions", model: Question });
  if (!exam) {
    return NextResponse.json({ message: "Exam not found" }, { status: 404 });
  }

  // Prevent multiple submissions for scheduled exams
  const isScheduled = !!(exam.startTime || exam.endTime);
  if (isScheduled) {
    const existingResult = await Result.findOne({
      examId,
      studentId: session.user.id,
    });
    if (existingResult) {
      return NextResponse.json({ message: "Already submitted this scheduled exam" }, { status: 400 });
    }
  }

  // Server-side time validation
  const now = new Date();
  if (exam.endTime) {
    const examEndTime = new Date(exam.endTime);
    const bufferTime = 60 * 1000; // 1 minute grace period for network latency
    
    if (now > new Date(examEndTime.getTime() + bufferTime)) {
      return NextResponse.json({ message: "Submission time expired" }, { status: 403 });
    }
  }

  // Calculate score and build result object
  let score = 0;
  const answersSubmitted = exam.questions.map((q: any) => {
    const selectedOption = answers[q._id.toString()];
    const isCorrect = q.answer === selectedOption;
    if (isCorrect) score++;
    
    return {
      questionId: q._id,
      selectedOption,
      isCorrect
    };
  });

  const result = await Result.create({
    examId,
    studentId: session.user.id,
    score,
    answersSubmitted,
    submittedAt: now
  });

  return NextResponse.json({ 
    message: "Exam submitted successfully", 
    resultId: result._id,
    score,
    totalQuestions: exam.questions.length
  });
}
