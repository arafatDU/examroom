import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const mode = formData.get("mode") as string; // 'single', 'bulk', 'answers'

    if (!image) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");

    let prompt = "";

    if (mode === "single") {
      prompt = `
        Extract ONE MCQ question from this image. The question is in Bangla.
        Mapping for options: ক -> a, খ -> b, গ -> c, ঘ -> d.
        Return the data in EXACTLY this JSON format:
        {
          "serialNumber": 1,
          "title": "Question Title in Bangla",
          "options": [{"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"}],
          "answer": "a",
          "justification": "Detailed explanation in Bangla",
          "subject": "Subject Name (if found, else empty)",
          "board": "Board Name (if found, else empty)",
          "chapter": "Chapter Name (if found, else empty)"
        }
        Important: 
        - Ensure 'answer' is either 'a', 'b', 'c', or 'd' based on mapping.
        - All text except keys must be in Bangla if the original text is Bangla.
        - Return ONLY the JSON object, no markdown formatting.
      `;
    } else if (mode === "bulk") {
      prompt = `
        Extract up to 25 MCQ questions from this image. The questions are in Bangla.
        Mapping for options: ক -> a, খ -> b, গ -> c, ঘ -> d.
        Subject and Board are likely the same for all questions.
        Return the data in EXACTLY this JSON format:
        {
          "subject": "Common Subject Name",
          "board": "Common Board Name",
          "questions": [
            {
              "serialNumber": 1,
              "title": "Question Title in Bangla",
              "options": [{"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"}]
            }
          ]
        }
        Important: 
        - DO NOT extract answers or justifications in this mode.
        - All text except keys must be in Bangla.
        - Return ONLY the JSON object, no markdown formatting.
      `;
    } else if (mode === "answers") {
      prompt = `
        This image contains an answer sheet or list of answers for multiple choice questions.
        Extract the correct option for each serial number.
        Mapping for options: ক -> a, খ -> b, গ -> c, ঘ -> d.
        Return the data in EXACTLY this JSON format:
        {
          "answers": {
            "1": "a",
            "2": "c",
            ...
          }
        }
        Important: 
        - Ensure values are 'a', 'b', 'c', or 'd'.
        - Use the serial number as the key (as a string).
        - Return ONLY the JSON object, no markdown formatting.
      `;
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown code blocks
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
