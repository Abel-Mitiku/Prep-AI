import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import PDFParser from "pdf2json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);
    pdfParser.on("pdfParser_dataError", (err: any) =>
      reject(new Error(`PDF parse error: ${err.parserError}`)),
    );
    pdfParser.on("pdfParser_dataReady", () =>
      resolve(pdfParser.getRawTextContent().trim()),
    );
    pdfParser.parseBuffer(buffer);
  });
}

const INTERVIEW_CONFIG_PROMPT = `
You are an expert technical recruiter. Analyze the following resume text and extract the interview configuration.

RESUME TEXT:
"{text}"

Return ONLY valid JSON with this exact schema:
{
  "role": "String - The most likely job title based on skills (e.g., Senior React Developer)",
  "difficulty": "String - 'easy', 'medium', or 'hard'",
  "type": "String - 'technical', 'behavioral', or 'system_design'",
  "focusAreas": ["Array of top 3-5 skills"]
}
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filePath, userId } = body;

    if (!filePath || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing filePath or userId" },
        { status: 400 },
      );
    }

    // 1️⃣ Download & Parse PDF
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(filePath);
    if (downloadError || !fileData) {
      return NextResponse.json(
        { success: false, error: "Failed to download resume" },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const resumeText = await extractTextFromPDF(buffer);
    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from PDF" },
        { status: 400 },
      );
    }

    // 2️⃣ AI Analysis
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: INTERVIEW_CONFIG_PROMPT.replace(
            "{text}",
            resumeText.substring(0, 4000),
          ),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 512,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();
    if (!aiResponse) throw new Error("Empty AI response");

    let config: any;
    try {
      const cleaned = aiResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      config = JSON.parse(cleaned);
      if (
        !config.role?.trim() ||
        !config.difficulty ||
        !Array.isArray(config.focusAreas)
      ) {
        throw new Error("Invalid AI response structure");
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response" },
        { status: 502 },
      );
    }

    // ✅ 3️⃣ Return config to frontend — DON'T call interview API here
    return NextResponse.json({
      success: true,
      config: {
        role: config.role.trim(),
        difficulty: config.difficulty,
        type: config.type || "technical",
        focusAreas: config.focusAreas,
        userId, // Pass userId so frontend can include it
      },
    });
  } catch (err: any) {
    console.error("❌ Resume processing error:", err);
    if (err?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "AI service busy. Please wait 30s and retry.",
          retryAfter: 30,
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process resume" },
      { status: 500 },
    );
  }
}
