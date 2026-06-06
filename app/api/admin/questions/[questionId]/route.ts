import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { questionId } = await params;
  const body = await req.json();

  await dbConnect();
  const question = await Question.findByIdAndUpdate(questionId, body, { new: true });

  if (!question) {
    return NextResponse.json({ message: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { questionId } = await params;


  await dbConnect();
  await Question.findByIdAndDelete(questionId);
  
  return NextResponse.json({ message: 'Question deleted' });
}
