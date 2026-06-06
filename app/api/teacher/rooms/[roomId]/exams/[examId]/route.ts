import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import Exam from "@/models/Exam";
import Result from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string, examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roomId, examId } = await params;

  try {
    await dbConnect();
    
    // Verify room ownership
    const room = await ExamRoom.findOne({ _id: roomId, teacherId: session.user.id });
    if (!room) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Cascade delete: delete results associated with this exam
    await Promise.all([
      Result.deleteMany({ examId: examId }),
      Exam.findByIdAndDelete(examId)
    ]);

    return NextResponse.json({ message: "Exam and associated results deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
