import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import User from "@/models/User";
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
  
  const room = await ExamRoom.findOne({ _id: roomId, teacherId: session.user.id })
    .populate({ path: "enrolledStudents", model: User, select: "name email" });

  if (!room) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json(room.enrolledStudents);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roomId } = await params;
    const { studentId } = await req.json();
    
    await dbConnect();

    const room = await ExamRoom.findOne({ _id: roomId, teacherId: session.user.id });
    if (!room) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    room.enrolledStudents = room.enrolledStudents.filter(
      (id: any) => id.toString() !== studentId
    );
    
    await room.save();

    return NextResponse.json({ message: "Student removed from room" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
