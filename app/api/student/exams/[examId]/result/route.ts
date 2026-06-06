import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import Exam from '@/models/Exam';
import Question from '@/models/Question';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

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

  const result = await Result.findOne({
    examId,
    studentId: session.user.id,
  })
  .sort({ submittedAt: -1 }) // Get the most recent attempt
  .populate({
    path: 'answersSubmitted.questionId',
    model: Question,
    select: 'title options answer justification serialNumber',
  });

  if (!result) {
    return NextResponse.json({ message: 'Result not found' }, { status: 404 });
  }

  const exam = await Exam.findById(examId).select('title durationMinutes');

  return NextResponse.json({ result, exam });
}
