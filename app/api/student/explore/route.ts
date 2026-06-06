import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import JoinRequest from "@/models/JoinRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  
  // Get all pending requests for this student
  const pendingRequests = await JoinRequest.find({
    studentId: session.user.id,
    status: "PENDING"
  }).select("roomId");
  
  const pendingRoomIds = pendingRequests.map(r => r.roomId.toString());

  // Find all public rooms where student is NOT enrolled AND NOT pending
  const rooms = await ExamRoom.find({
    visibility: "PUBLIC",
    enrolledStudents: { $ne: session.user.id },
    _id: { $nin: pendingRoomIds }
  })
  .populate({ path: "teacherId", model: User, select: "name" })
  .sort({ createdAt: -1 });

  return NextResponse.json(rooms);
}

}
