import dbConnect from "@/lib/mongodb";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import ExamRoom from "@/models/ExamRoom";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const results = await Result.find({ studentId: session.user.id })
    .populate({
      path: "examId",
      select: "title",
      populate: { path: "examRoomId", select: "name" }
    })
    .sort({ submittedAt: -1 });

  return NextResponse.json(results);
}
