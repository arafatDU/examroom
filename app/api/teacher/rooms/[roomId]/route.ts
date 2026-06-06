import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import Exam from "@/models/Exam";
import JoinRequest from "@/models/JoinRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;

  try {
    await dbConnect();
    
    // Verify ownership
    const room = await ExamRoom.findOne({ _id: roomId, teacherId: session.user.id });
    if (!room) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Cascade delete: delete exams and join requests associated with this room
    await Promise.all([
      Exam.deleteMany({ examRoomId: roomId }),
      JoinRequest.deleteMany({ roomId: roomId }),
      ExamRoom.findByIdAndDelete(roomId)
    ]);

    return NextResponse.json({ message: "ExamRoom and associated data deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
