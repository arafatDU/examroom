import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import Exam from "@/models/Exam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  await dbConnect();
  const exams = await Exam.find({ examRoomId: roomId }).sort({ createdAt: -1 });
  return NextResponse.json(exams);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  await dbConnect();
  const body = await req.json();
  
  const exam = await Exam.create({
    ...body,
    examRoomId: roomId,
  });

  return NextResponse.json(exam, { status: 201 });
}
