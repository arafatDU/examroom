import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const board = searchParams.get("board");
  const chapter = searchParams.get("chapter");

  const query: any = {};
  if (subject) query.subject = subject;
  if (board) query.board = board;
  if (chapter) query.chapter = chapter;

  const questions = await Question.find(query).sort({ createdAt: -1 });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  
  // Handle mapping from Bangla keys if necessary, or assume standard schema
  const formattedData = {
    ...body,
    serialNumber: body["ক্রমিক নম্বর"] || body.serialNumber
  };

  const question = await Question.create(formattedData);
  return NextResponse.json(question, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",");

  if (!ids || ids.length === 0) {
    return NextResponse.json({ message: "No IDs provided" }, { status: 400 });
  }

  await dbConnect();
  await Question.deleteMany({ _id: { $in: ids } });

  return NextResponse.json({ message: "Questions deleted successfully" });
}
