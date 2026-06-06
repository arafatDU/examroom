import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import JoinRequest from "@/models/JoinRequest";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Get rooms the student is enrolled in
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const rooms = await ExamRoom.find({ enrolledStudents: session.user.id })
    .populate({ path: "teacherId", model: User, select: "name" })
    .sort({ createdAt: -1 });
    
  return NextResponse.json(rooms);
}

// Join/Request a room via code or click
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, roomId } = await req.json();
    
    await dbConnect();
    
    let room;
    if (code) {
      room = await ExamRoom.findOne({ code: code.toUpperCase() });
    } else if (roomId) {
      room = await ExamRoom.findById(roomId);
    }

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // Check if already enrolled
    const isEnrolled = room.enrolledStudents.some((id: any) => id.toString() === session.user.id);
    if (isEnrolled) {
      return NextResponse.json({ message: "Already enrolled in this room" }, { status: 400 });
    }

    // PRIVATE: Instant Enroll
    if (room.visibility === "PRIVATE") {
      if (!code) return NextResponse.json({ message: "Code required for private rooms" }, { status: 400 });
      
      room.enrolledStudents.push(session.user.id);
      await room.save();
      return NextResponse.json({ message: "Joined successfully", status: "ENROLLED" });
    }

    // PUBLIC: Create Request
    const existingRequest = await JoinRequest.findOne({
      studentId: session.user.id,
      roomId: room._id,
      status: "PENDING"
    });

    if (existingRequest) {
      return NextResponse.json({ message: "Request already pending" }, { status: 400 });
    }

    await JoinRequest.create({
      studentId: session.user.id,
      roomId: room._id,
    });

    return NextResponse.json({ message: "Join request sent to teacher", status: "PENDING" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
