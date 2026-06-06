import dbConnect from "@/lib/mongodb";
import Exam from "@/models/Exam";
import ExamRoom from "@/models/ExamRoom";
import Result from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;

  await dbConnect();
  
  // Verify student is enrolled in this room
  const room = await ExamRoom.findById(roomId);

  if (!room) {
    return NextResponse.json({ message: "Room not found" }, { status: 404 });
  }

  const isEnrolled = room.enrolledStudents.some(
    (id: any) => id.toString() === session.user.id.toString()
  );

  if (!isEnrolled) {
    return NextResponse.json({ message: "Not enrolled in this room" }, { status: 403 });
  }

  // Find published exams for this room
  const exams = await Exam.find({
    examRoomId: roomId,
    status: { $in: ["PUBLISHED", "COMPLETED"] },
  }).sort({ startTime: -1 }).lean();

  // For each exam, check if the student has attempted it
  const examsWithStatus = await Promise.all(exams.map(async (exam: any) => {
    const attempt = await Result.findOne({
      examId: exam._id,
      studentId: session.user.id
    }).select("_id").lean();
    
    return {
      ...exam,
      isAttempted: !!attempt
    };
  }));

  return NextResponse.json(examsWithStatus);
}
