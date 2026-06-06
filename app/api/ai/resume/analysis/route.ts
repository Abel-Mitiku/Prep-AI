import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { success: false, error: "Resume text is too short or invalid" },
        { status: 400 },
      );
    }

    const prompt = `
      You are an expert technical recruiter. Analyze the following resume text and extract the interview configuration.
      
      RESUME TEXT:
      "${text.substring(0, 5000)}" 

      Return ONLY valid JSON with this schema:
      {
        "role": "String - The most likely job title based on skills (e.g., Senior React Developer)",
        "difficulty": "String - 'easy' (0-2 yrs), 'medium' (2-5 yrs), or 'hard' (5+ yrs)",
        "type": "String - 'technical', 'behavioral', or 'system_design'",
        "focusAreas": ["Array of top 3 skills, e.g., ['React', 'TypeScript', 'AWS']"]
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const config = JSON.parse(content);

    if (!config.role || !config.difficulty) {
      throw new Error("AI could not extract valid role or difficulty");
    }

    return NextResponse.json({
      success: true,
      data: {
        role: config.role,
        difficulty: config.difficulty,
        type: config.type || "technical",
        focusAreas: config.focusAreas || [],
      },
    });
  } catch (error) {
    console.error(" Resume analysis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
