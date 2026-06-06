import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  EndSessionRequest,
  EndSessionResponse,
  Answer,
} from "@/app/types/types";

export async function POST(
  req: Request,
): Promise<NextResponse<EndSessionResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON in request body",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const {
    sessionId,
    answers,
    timeUsed,
    completed,
    cheatCount = 0,
    focusScore = 100,
    suspicious = false,
    focusEvents = [],
  } = body as EndSessionRequest & {
    cheatCount?: number;
    focusScore?: number;
    suspicious?: boolean;
    focusEvents?: any[];
  };

  console.log("📊 Session end data:", {
    sessionId,
    answerCount: answers?.length,
    cheatCount,
    focusScore,
    suspicious,
  });

  if (!sessionId || !Array.isArray(answers)) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: sessionId or answers",
        code: "MISSING_FIELDS",
      },
      { status: 400 },
    );
  }

  try {
    const { error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .update({
        status: completed ? "completed" : "expired",
        ended_at: new Date().toISOString(),

        cheat_count: cheatCount,
        focus_score: focusScore,
        suspicious: suspicious,
        focus_events: focusEvents,
      })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("❌ Failed to update session status:", sessionError);
    }

    for (const answer of answers) {
      const { data: existing } = await supabaseAdmin
        .from("interview_questions")
        .select("id")
        .eq("session_id", sessionId)
        .eq("question", answer.questionText || answer.text)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("interview_questions").insert({
          session_id: sessionId,
          question: answer.questionText || "Question text not provided",
          answer: answer.text,
          technical_score: answer.technical_score || null,
          communication_score: answer.communication_score || null,
          confidence_score: answer.confidence_score || null,
          feedback: answer.feedback || null,
          strengths: answer.strengths || [],
          areas_to_improve: answer.areas_to_improve || [],
        });
      }
    }

    const scoredAnswers = answers.filter(
      (a) =>
        typeof a.score === "number" || typeof a.technical_score === "number",
    );

    const rawAverageScore =
      scoredAnswers.length > 0
        ? Math.round(
            scoredAnswers.reduce((sum, a) => {
              const score = a.technical_score ?? a.score ?? 0;
              return sum + score;
            }, 0) / scoredAnswers.length,
          )
        : 0;

    const focusPenalty = suspicious ? Math.min(30, cheatCount * 6) : 0;

    const adjustedScore = Math.max(
      Math.round(rawAverageScore * 0.5),
      rawAverageScore - focusPenalty,
    );

    console.log("🎯 Final score calculation:", {
      rawAverageScore,
      focusScore,
      cheatCount,
      suspicious,
      focusPenalty,
      adjustedScore,
    });

    const allStrengths = answers
      .map((a) => a.strengths || [])
      .flat()
      .filter((s): s is string => typeof s === "string" && s.trim() !== "")
      .slice(0, 5);

    const allWeaknesses = answers
      .map((a) => a.areas_to_improve || [])
      .flat()
      .filter((w): w is string => typeof w === "string" && w.trim() !== "")
      .slice(0, 5);

    const strengthsText =
      allStrengths.length > 0 ? allStrengths.join(" ||| ") : null;
    const weaknessesText =
      allWeaknesses.length > 0 ? allWeaknesses.join(" ||| ") : null;

    let recommendationsText: string | null = null;

    if (focusPenalty > 0) {
      recommendationsText = `Score adjusted due to ${cheatCount} focus interruption(s). ${
        rawAverageScore >= 80
          ? "Strong technical performance—maintain focus for even better results."
          : rawAverageScore >= 60
            ? "Good foundation—practice staying focused to improve your score."
            : "Keep practicing both technical skills and interview focus."
      }`;
    } else if (rawAverageScore >= 90) {
      recommendationsText =
        "Excellent performance! Focus on maintaining consistency.";
    } else if (rawAverageScore >= 75) {
      recommendationsText =
        "Strong foundation. Practice scenario-based questions.";
    } else if (rawAverageScore >= 60) {
      recommendationsText =
        "Good progress. Focus on clear structure and examples.";
    } else {
      recommendationsText =
        "Keep practicing! Review fundamentals and speak confidently.";
    }

    const { error: summaryError } = await supabaseAdmin
      .from("interview_summary")
      .upsert(
        {
          session_id: sessionId,

          final_score: adjustedScore,

          strengths: strengthsText,
          weaknesses: weaknessesText,
          recommendations: recommendationsText,

          cheat_count: cheatCount,
          focus_score: focusScore,
          suspicious: suspicious,
        },
        { onConflict: "session_id" },
      );

    if (summaryError) {
      console.error("❌ Failed to save interview summary:", summaryError);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalQuestions: answers.length,

        averageScore: adjustedScore,

        rawScore: rawAverageScore,

        focusPenalty: focusPenalty,
        totalTime: timeUsed,
        completed,
        strengths: allStrengths,
        weaknesses: allWeaknesses,
        recommendations: recommendationsText || "",

        focusMetrics: {
          focusScore,
          cheatCount,
          suspicious,
          eventCount: focusEvents?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("❌ Exception ending session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to end session", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
