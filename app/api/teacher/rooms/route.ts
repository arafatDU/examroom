import dbConnect from "@/lib/mongodb";
import ExamRoom from "@/models/ExamRoom";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateJoinCode } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const rooms = await ExamRoom.find({ teacherId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { name, visibility } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Room name is required" }, { status: 400 });
  }

  const code = generateJoinCode();

  const room = await ExamRoom.create({
    name,
    code,
    teacherId: session.user.id,
    visibility: visibility || "PRIVATE",
  });

  return NextResponse.json(room, { status: 201 });
}
