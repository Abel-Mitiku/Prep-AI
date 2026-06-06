import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import Groq from "groq-sdk";
import {
  InterviewRequest,
  InterviewResponse,
  Question,
} from "@/app/types/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const CONFIG = {
  MIN_DURATION: 15,
  MAX_DURATION: 60,
  DEFAULT_QUESTION_COUNT: 5,
  QUESTIONS_PER_MINUTE: 0.15,
  ALLOWED_DIFFICULTIES: ["easy", "medium", "hard"] as const,
  ALLOWED_TYPES: [
    "behavioral",
    "technical",
    "system_design",
    "case_study",
    "hr_screening",
  ] as const,
  ALLOWED_MODES: ["text", "voice"] as const,
};

function validateInterviewRequests(
  body: unknown,
):
  | { isValid: true; data: InterviewRequest }
  | { isValid: false; error: string; code: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      isValid: false,
      error: "Something went wrong please try again later",
      code: "INVALID_BODY",
    };
  }

  const req = body as Record<string, unknown>;
  const required = ["role", "difficulty", "type", "mode", "duration"] as const;

  for (const field of required) {
    const value = req[field];
    if (
      value === undefined ||
      value === null ||
      (field !== "duration" && typeof value !== "string")
    ) {
      return {
        isValid: false,
        error: `Missing or invalid required field: ${field}`,
        code: "MISSING_FIELD",
      };
    }
  }

  const difficulty = req.difficulty as string;
  if (!CONFIG.ALLOWED_DIFFICULTIES.includes(difficulty as any)) {
    return {
      isValid: false,
      error: `Invalid difficulty. Must be one of: ${CONFIG.ALLOWED_DIFFICULTIES.join(", ")}`,
      code: "INVALID_DIFFICULTY",
    };
  }

  const type = req.type as string;
  if (!CONFIG.ALLOWED_TYPES.includes(type as any)) {
    return {
      isValid: false,
      error: `Invalid interview type. Must be one of: ${CONFIG.ALLOWED_TYPES.join(", ")}`,
      code: "INVALID_TYPE",
    };
  }

  const mode = req.mode as string;
  if (!CONFIG.ALLOWED_MODES.includes(mode as any)) {
    return {
      isValid: false,
      error: `Invalid mode. Must be one of: ${CONFIG.ALLOWED_MODES.join(", ")}`,
      code: "INVALID_MODE",
    };
  }

  const duration =
    typeof req.duration === "string"
      ? parseInt(req.duration, 10)
      : (req.duration as number);
  if (
    isNaN(duration) ||
    duration < CONFIG.MIN_DURATION ||
    duration > CONFIG.MAX_DURATION
  ) {
    return {
      isValid: false,
      error: `Duration must be between ${CONFIG.MIN_DURATION}-${CONFIG.MAX_DURATION} minutes`,
      code: "INVALID_DURATION",
    };
  }

  if (req.industry && typeof req.industry !== "string") {
    return {
      isValid: false,
      error: "Industry must be a string",
      code: "INVALID_INDUSTRY",
    };
  }

  if (req.focusAreas) {
    if (!Array.isArray(req.focusAreas)) {
      return {
        isValid: false,
        error: "Focus areas must be an array",
        code: "INVALID_FOCUS_AREAS",
      };
    }
    if (!req.focusAreas.every((area: unknown) => typeof area === "string")) {
      return {
        isValid: false,
        error: "Each focus area must be a string",
        code: "INVALID_FOCUS_AREA_ITEM",
      };
    }
  }

  return {
    isValid: true,
    data: {
      role: String(req.role).trim(),
      difficulty: difficulty as InterviewRequest["difficulty"],
      type: type as InterviewRequest["type"],
      mode: mode as InterviewRequest["mode"],
      duration,
      industry: req.industry ? String(req.industry).trim() : undefined,
      focusAreas: Array.isArray(req.focusAreas)
        ? req.focusAreas.map((a: unknown) => String(a).trim())
        : [],
    },
  };
}

async function generateQuestionsWithGemini(
  params: InterviewRequest,
): Promise<Question[]> {
  const questionCount = Math.max(
    3,
    Math.min(10, Math.round(params.duration * CONFIG.QUESTIONS_PER_MINUTE)),
  );

  const prompt = `
You are a senior technical interviewer conducting a realistic ${params.type} interview.

Generate exactly ${questionCount} high-quality interview questions for a candidate applying for the role:
"${params.role}"

Candidate Context:
- Difficulty: ${params.difficulty}
- Industry: ${params.industry || "General tech"}
- Focus Areas: ${params.focusAreas?.join(", ") || "General competency"}
- Interview Mode: ${params.mode}

Interview Rules:
1. Questions must match the ${params.difficulty} difficulty level.
   ${
     params.difficulty === "easy"
       ? "- Focus on fundamentals, basic concepts, and junior-level expectations."
       : params.difficulty === "medium"
         ? "- Focus on practical application, debugging, tradeoffs, and real-world usage."
         : "- Focus on advanced architecture, optimization, scalability, and complex problem-solving."
   }

2. Questions must directly relate to the responsibilities and expectations of a "${params.role}".

3. Questions must be open-ended and encourage detailed responses.

4. Questions should sound like real interview questions asked by experienced hiring managers and engineers at modern tech companies.

5. Each question must be unique and non-repetitive.

6. Include a balanced mix of:
   - conceptual questions
   - practical/scenario-based questions
   - problem-solving questions
   - real-world experience questions (when appropriate)

7. ${
    params.mode === "voice"
      ? "Questions should feel conversational and natural for spoken interviews."
      : "Questions may include technical detail, code-related discussion, or written problem-solving."
  }

8. Keep each question concise and under 80 words unless additional context is necessary.

9. Avoid generic filler questions unless they are highly relevant to the role and difficulty level.

10. For technical or system design interviews, include a concise hint describing what an excellent answer should demonstrate.

Return ONLY valid JSON in this exact schema:

{
  "questions": [
    {
      "id": "unique_string_id",
      "text": "The actual interview question",
      "type": "${params.type}",
      "difficulty": "${params.difficulty}",
      "category": "conceptual | practical | problem_solving | experience",
      "expectedTopics": ["topic1", "topic2"],
      "hint": "Concise description of what a strong answer should demonstrate"
    }
  ]
}

Critical Output Rules:
- Return pure JSON only
- Do not include markdown formatting
- Do not wrap the response in triple backticks
- Do not include explanations or extra text
- Do not include trailing commas
- Ensure the response is fully parseable using JSON.parse()

`.trim();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content || "";
    if (!text) throw new Error("Groq returned empty response");

    const cleanedText = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleanedText);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Groq response missing 'questions' array");
    }

    const questions: Question[] = parsed.questions
      .filter((q: unknown) => q && typeof q === "object")
      .map((q: Record<string, unknown>, index: number) => ({
        id: typeof q.id === "string" ? q.id : `q_${Date.now()}_${index}`,
        text:
          typeof q.text === "string" && q.text.trim()
            ? q.text.trim()
            : "Untitled question",
        type: typeof q.type === "string" ? q.type : params.type,
        hint: typeof q.hint === "string" ? q.hint.trim() : undefined,
        difficulty:
          typeof q.difficulty === "string" ? q.difficulty : params.difficulty,
        category: typeof q.category === "string" ? q.category : "conceptual",
        expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics : [],
      }))
      .filter((q: Question) => q.text.length > 10);

    if (questions.length === 0) {
      throw new Error("No valid questions generated from AI response");
    }

    return questions;
  } catch (error) {
    console.error("❌ Groq question generation failed:", {
      error: error instanceof Error ? error.message : String(error),
      params: {
        role: params.role,
        type: params.type,
        difficulty: params.difficulty,
      },
    });

    return [
      {
        id: `fallback_${Date.now()}`,
        text: `Based on your target role "${params.role}", describe a challenging project you've worked on and what you learned from it.`,
        type: params.type,
        difficulty: params.difficulty,
        category: "experience",
        expectedTopics: ["project experience", "lessons learned"],
        hint: "Use the STAR method: Situation, Task, Action, Result",
      },
    ];
  }
}

async function createInterviewSession(
  userId: string,
  params: InterviewRequest,
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("interview_sessions")
    .insert({
      user_id: userId,
      role: params.role,
      level: params.difficulty,
      interview_type: params.type,
      status: "in_progress",

      cheat_count: 0,
      focus_score: 100,
      suspicious: false,
      focus_events: [],
    })
    .select("id")
    .single();

  if (error) {
    console.error("❌ Failed to create session:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(`Failed to create interview session: ${error.message}`);
  }

  if (!data?.id || typeof data.id !== "string") {
    console.error("❌ Session created but ID not returned:", { data });
    throw new Error("Session created but ID not returned from Supabase");
  }

  console.log("✅ Session created successfully:", {
    sessionId: data.id,
    userId,
    role: params.role,
    type: params.type,
  });

  return data.id;
}

export async function POST(
  req: Request,
): Promise<NextResponse<InterviewResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch (parseError) {
    console.error("❌ JSON parse error:", parseError);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON in request body",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const reqBody = body as Record<string, unknown>;
  const userId = reqBody.userId as string;

  if (
    !userId ||
    typeof userId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      userId,
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Valid userId is required",
        code: "INVALID_USER_ID",
      },
      { status: 400 },
    );
  }

  const validation = validateInterviewRequests(body);
  if (!validation.isValid) {
    return NextResponse.json(
      { success: false, error: validation.error, code: validation.code },
      { status: 400 },
    );
  }
  const params = validation.data;

  let questions: Question[];
  try {
    questions = await generateQuestionsWithGemini(params);
  } catch (error) {
    console.error("❌ Question generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate interview questions. Please try again.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 503 },
    );
  }

  let sessionId: string;
  try {
    sessionId = await createInterviewSession(userId, params);
  } catch (error) {
    console.error("❌ Session creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize interview session",
        code: "SESSION_CREATION_FAILED",
      },
      { status: 500 },
    );
  }

  if (!sessionId) {
    console.error("❌ sessionId is undefined after creation");
    return NextResponse.json(
      {
        success: false,
        error: "Session ID not generated",
        code: "SESSION_ID_MISSING",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      sessionId,
      questions,
      metadata: {
        totalQuestions: questions.length,
        estimatedDuration: params.duration,
        aiModel: "llama-3.1-8b-instant",
      },
    },
    { status: 200 },
  );
}
