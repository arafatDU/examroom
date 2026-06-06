import dbConnect from "@/lib/mongodb";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;

  await dbConnect();

  // Verify the teacher owns the room this exam belongs to
  const exam = await Exam.findById(examId).populate("examRoomId");
  if (!exam) {
    return NextResponse.json({ message: "Exam not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && (exam.examRoomId as any).teacherId.toString() !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Use aggregation to get only the FIRST attempt for each student
  const results = await Result.aggregate([
    { $match: { examId: exam._id } },
    { $sort: { submittedAt: 1 } }, // Sort by oldest first
    {
      $group: {
        _id: "$studentId",
        firstResult: { $first: "$$ROOT" }
      }
    },
    { $replaceRoot: { newRoot: "$firstResult" } },
    {
      $lookup: {
        from: "users",
        localField: "studentId",
        foreignField: "_id",
        as: "studentId"
      }
    },
    { $unwind: "$studentId" },
    {
      $project: {
        "studentId.password": 0,
        "studentId.role": 0
      }
    },
    { $sort: { score: -1, submittedAt: 1 } }
  ]);

  return NextResponse.json({ results, exam });
}
