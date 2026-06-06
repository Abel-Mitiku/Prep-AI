import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  EvaluateRequest,
  EvaluationResult,
  EvaluateResponse,
} from "@/app/types/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

function validateEvaluateRequest(
  body: unknown,
):
  | { isValid: true; data: EvaluateRequest }
  | { isValid: false; error: string; code: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      isValid: false,
      error: "Invalid request body",
      code: "INVALID_BODY",
    };
  }

  const req = body as Record<string, unknown>;
  const required = ["sessionId", "questionId", "answer"] as const;
  for (const field of required) {
    if (!req[field] || typeof req[field] !== "string") {
      return {
        isValid: false,
        error: `Missing or invalid required field: ${field}`,
        code: "MISSING_FIELD",
      };
    }
  }

  const sessionId = req.sessionId as string;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      sessionId,
    )
  ) {
    return {
      isValid: false,
      error: "Invalid sessionId format",
      code: "INVALID_SESSION_ID",
    };
  }

  const answer = req.answer as string;
  if (answer.trim().length < 10) {
    return {
      isValid: false,
      error: "Answer is too short",
      code: "ANSWER_TOO_SHORT",
    };
  }

  return {
    isValid: true,
    data: {
      sessionId,
      questionId: req.questionId as string,
      answer: answer.trim(),
      isVoice: req.isVoice === true,
      duration: typeof req.duration === "number" ? req.duration : undefined,
      questionText:
        typeof req.questionText === "string" ? req.questionText : undefined,
    },
  };
}

async function evaluateAnswerWithGroq(params: {
  questionText: string;
  answer: string;
  isVoice?: boolean;
  duration?: number;
}): Promise<EvaluationResult> {
  const { questionText, answer, isVoice, duration } = params;

  const prompt = `
You are an extremely strict senior-level technical interviewer evaluating a candidate's answer.

Your task is to objectively evaluate:

* technical correctness
* depth of understanding
* relevance to the question
* communication quality
* confidence and reasoning

You must behave like a real FAANG-level interviewer.

QUESTION:
"${questionText}"

CANDIDATE ANSWER:
"${answer}"

INTERVIEW CONTEXT:

* Response mode: ${isVoice ? "Voice (spoken)" : "Text (written)"}
* Response length: ${duration ? `~${duration} seconds` : "N/A"}

STRICT EVALUATION RULES:

* Be harsh when necessary.
* Do NOT be overly generous.
* Do NOT assume knowledge that is not explicitly stated.
* Only evaluate what the candidate actually said.
* Penalize vague explanations heavily.
* Penalize filler words and rambling.
* Penalize buzzwords without explanation.
* Penalize incorrect technical claims aggressively.
* Penalize weak structure and unclear explanations.
* If the answer avoids the actual question, reduce scores significantly.
* If the answer is unrelated to the question, technical_score MUST be below 20.
* If the answer is mostly incorrect, technical_score MUST be below 30.
* Only exceptional answers should receive scores above 85.

RELEVANCE CHECK:
First determine whether the candidate actually answered the question.

* If the answer is unrelated or mostly unrelated:

  * technical_score MUST be between 0–20
  * communication_score MUST NOT exceed 40
  * confidence_score MUST NOT exceed 30
  * feedback MUST explicitly mention that the answer was unrelated or off-topic

SCORING RUBRIC:

1. TECHNICAL SCORE (0–100):
   Evaluate:

* correctness
* technical depth
* accuracy
* understanding of tradeoffs
* problem-solving ability
* production-level thinking

Score guide:

* 90–100: Expert-level answer with deep understanding and strong reasoning
* 75–89: Strong answer with only minor gaps
* 60–74: Decent understanding but missing important details
* 40–59: Weak understanding with several gaps or mistakes
* 20–39: Mostly incorrect, shallow, or incomplete
* 0–19: Irrelevant, nonsensical, or completely incorrect

2. COMMUNICATION SCORE (0–100):
   Evaluate:

* clarity
* structure
* organization
* conciseness
* readability

Score guide:

* 90–100: Extremely clear, structured, and professional
* 75–89: Mostly clear with minor issues
* 60–74: Understandable but inconsistent or somewhat unclear
* 40–59: Difficult to follow or poorly structured
* 0–39: Confusing, rambling, or incoherent

3. CONFIDENCE SCORE (0–100):
   Evaluate:

* confidence
* reasoning quality
* certainty
* honesty about uncertainty

IMPORTANT:

* Overconfident wrong answers should score VERY LOW.
* Guessing or bluffing should reduce score heavily.

OUTPUT REQUIREMENTS:

Return ONLY valid JSON in this exact structure:

{
"technical_score": 85,
"communication_score": 78,
"confidence_score": 90,
"feedback": "2–3 sentence precise evaluation focusing on biggest strengths and weaknesses.",
"strengths": [
"specific strength 1",
"specific strength 2"
],
"areas_to_improve": [
"specific weakness 1",
"specific weakness 2"
]
}

FINAL RULES:

* Scores must be integers between 0 and 100
* Feedback must be specific to THIS answer
* Avoid generic feedback
* Strengths and weaknesses must be concrete and tied to the response
* 2–4 items per list
* No markdown
* No explanations outside JSON
* No code blocks
* Output must be valid JSON parsable by JSON.parse()

`.trim();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message.content || "";
    if (!text) throw new Error("Groq returned empty response");

    const cleanedText = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    const result: EvaluationResult = {
      technical_score: clampScore(parsed.technical_score),
      communication_score: clampScore(parsed.communication_score),
      confidence_score: clampScore(parsed.confidence_score),
      feedback:
        typeof parsed.feedback === "string" && parsed.feedback.trim()
          ? parsed.feedback.trim()
          : "No feedback provided.",
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths
            .filter((s: unknown) => typeof s === "string" && s.trim())
            .map((s: string) => s.trim())
            .slice(0, 4)
        : [],
      areas_to_improve: Array.isArray(parsed.areas_to_improve)
        ? parsed.areas_to_improve
            .filter((a: unknown) => typeof a === "string" && a.trim())
            .map((a: string) => a.trim())
            .slice(0, 4)
        : [],
    };

    if (result.strengths.length === 0) {
      result.strengths.push("Provided a response to the question");
    }
    if (result.areas_to_improve.length === 0) {
      result.areas_to_improve.push("Continue practicing to refine responses");
    }

    return result;
  } catch (error: any) {
    console.error("❌ Groq evaluation failed:", {
      error: error instanceof Error ? error.message : String(error),
      questionPreview: questionText.slice(0, 100),
      answerPreview: answer.slice(0, 100),
    });

    return {
      technical_score: 20,
      communication_score: 20,
      confidence_score: 20,
      feedback:
        "Thanks for your response. Consider expanding on your examples and structuring your answer more clearly.",
      strengths: ["Provided a thoughtful response"],
      areas_to_improve: [
        "Add more specific examples",
        "Structure your answer with clear points",
      ],
    };
  }
}

function clampScore(value: unknown): number {
  const num = typeof value === "number" ? value : parseInt(String(value), 10);
  if (isNaN(num)) return 30;
  return Math.max(0, Math.min(100, Math.round(num)));
}

async function saveEvaluationToDB(
  sessionId: string,
  questionId: string,
  questionText: string,
  answer: string,
  evaluation: EvaluationResult,
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("interview_questions").insert({
      session_id: sessionId,
      question: questionText,
      answer: answer,
      technical_score: evaluation.technical_score,
      communication_score: evaluation.communication_score,
      confidence_score: evaluation.confidence_score,
      feedback: evaluation.feedback,
      areas_to_improve: evaluation.areas_to_improve,
    });

    if (error) {
      console.error("❌ Failed to save evaluation:", error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error("❌ Exception saving evaluation:", error);
    return false;
  }
}

export async function POST(
  req: Request,
): Promise<NextResponse<EvaluateResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON in request body",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const validation = validateEvaluateRequest(body);
  if (!validation.isValid) {
    return NextResponse.json(
      { success: false, error: validation.error, code: validation.code },
      { status: 400 },
    );
  }
  const {
    sessionId,
    questionId,
    answer,
    isVoice,
    duration,
    questionText: providedQuestionText,
  } = validation.data;

  let questionText = providedQuestionText;
  if (!questionText) {
    questionText = "Question text not provided";
    console.warn("⚠️ questionText not provided; using placeholder");
  }

  let evaluation: EvaluationResult;
  try {
    evaluation = await evaluateAnswerWithGroq({
      questionText,
      answer,
      isVoice,
      duration,
    });
  } catch (error: any) {
    console.error("❌ Evaluation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to evaluate answer. Please try again.",
        code: "EVALUATION_FAILED",
      },
      { status: 503 },
    );
  }

  const saved = await saveEvaluationToDB(
    sessionId,
    questionId,
    questionText,
    answer,
    evaluation,
  );

  return NextResponse.json(
    {
      success: true,

      technical_score: evaluation.technical_score,
      communication_score: evaluation.communication_score,
      confidence_score: evaluation.confidence_score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      areas_to_improve: evaluation.areas_to_improve,

      evaluation,
      saved,
    },
    { status: 200 },
  );
}
