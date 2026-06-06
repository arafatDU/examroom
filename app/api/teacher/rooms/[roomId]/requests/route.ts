import dbConnect from "@/lib/mongodb";
import JoinRequest from "@/models/JoinRequest";
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
  
  // Verify room ownership
  const room = await ExamRoom.findOne({ _id: roomId, teacherId: session.user.id });
  if (!room) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const requests = await JoinRequest.find({ roomId, status: "PENDING" })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json(requests);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roomId } = await params;
    const { requestId, status } = await req.json(); // status: 'APPROVED' or 'REJECTED'
    
    await dbConnect();

    // Verify room ownership
    const room = await ExamRoom.findOne({ _id: roomId, teacherId: session.user.id });
    if (!room) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) return NextResponse.json({ message: "Request not found" }, { status: 404 });

    if (status === "APPROVED") {
      joinRequest.status = "APPROVED";
      // Add student to room - fix comparison
      const isAlreadyEnrolled = room.enrolledStudents.some(
        (id: any) => id.toString() === joinRequest.studentId.toString()
      );

      if (!isAlreadyEnrolled) {
        room.enrolledStudents.push(joinRequest.studentId);
        await room.save();
      }
    }
 else {
      joinRequest.status = "REJECTED";
    }

    await joinRequest.save();

    return NextResponse.json({ message: `Request ${status.toLowerCase()} successfully` });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
