import dbConnect from "@/lib/mongodb";
import JoinRequest from "@/models/JoinRequest";
import ExamRoom from "@/models/ExamRoom";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  
  const requests = await JoinRequest.find({
    studentId: session.user.id,
    status: "PENDING"
  })
  .populate({
    path: "roomId",
    model: ExamRoom,
    select: "name",
    populate: { path: "teacherId", model: User, select: "name" }
  })
  .sort({ createdAt: -1 });

  return NextResponse.json(requests);
}
