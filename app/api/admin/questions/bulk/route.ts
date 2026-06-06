import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { questions } = await req.json();

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // Format questions to match Mongoose schema
    const formattedQuestions = questions.map((q: any) => ({
      serialNumber: q["ক্রমিক নম্বর"],
      title: q.title,
      options: q.option, // Already an array with {a, b, c, d}
      answer: q.answer,
      justification: q.justification,
      subject: q.subject,
      chapter: q.chapter,
      board: q.board,
    }));

    const result = await Question.insertMany(formattedQuestions);
    return NextResponse.json({ message: "Questions saved successfully", count: result.length });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
