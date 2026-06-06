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

  // ✅ Extract focus monitoring data from request (with safe defaults)
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

  // Validate required fields
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
    // ✅ Step 1: Update session status AND save focus metrics
    const { error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .update({
        status: completed ? "completed" : "expired",
        ended_at: new Date().toISOString(),
        // ✅ Save anti-cheating/focus data
        cheat_count: cheatCount,
        focus_score: focusScore,
        suspicious: suspicious,
        focus_events: focusEvents,
      })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("❌ Failed to update session status:", sessionError);
    }

    // ✅ Step 2: Store per-question evaluations (if not already saved)
    for (const answer of answers) {
      // Check if already exists to avoid duplicates
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

    // ✅ Step 3: Calculate RAW average score (technical performance only)
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

    // ✅ Step 4: Calculate focus-based penalty (MAX 30 points)
    const focusPenalty = suspicious ? Math.min(30, cheatCount * 6) : 0;

    // ✅ Step 5: Calculate FINAL adjusted score WITH FLOOR PROTECTION
    // Floor: never below 50% of raw score to prevent unfair zeros
    const adjustedScore = Math.max(
      Math.round(rawAverageScore * 0.5), // Floor protection
      rawAverageScore - focusPenalty, // Apply penalty
    );

    console.log("🎯 Final score calculation:", {
      rawAverageScore, // Technical only
      focusScore, // Behavioral metric
      cheatCount,
      suspicious,
      focusPenalty, // Points deducted
      adjustedScore, // ✅ FINAL SCORE (pre-calculated, ready for frontend)
    });

    // ✅ Step 6: Aggregate strengths/weaknesses
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

    // ✅ Step 7: Generate contextual recommendations
    let recommendationsText: string | null = null;

    if (focusPenalty > 0) {
      // Acknowledge focus issues in recommendations
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

    // ✅ Step 8: Store summary with PRE-CALCULATED final score
    const { error: summaryError } = await supabaseAdmin
      .from("interview_summary")
      .upsert(
        {
          session_id: sessionId,
          // ✅ Store the pre-calculated final score (with penalty applied)
          final_score: adjustedScore,
          // ✅ Also store raw score for transparency/analytics
          // raw_score: rawAverageScore,
          strengths: strengthsText,
          weaknesses: weaknessesText,
          recommendations: recommendationsText,
          // ✅ Store focus metrics for future reference
          cheat_count: cheatCount,
          focus_score: focusScore,
          suspicious: suspicious,
        },
        { onConflict: "session_id" },
      );

    if (summaryError) {
      console.error("❌ Failed to save interview summary:", summaryError);
    }

    // ✅ Step 9: Return summary with PRE-CALCULATED score
    // Frontend just displays summary.averageScore — no extra math needed!
    return NextResponse.json({
      success: true,
      summary: {
        totalQuestions: answers.length,
        // ✅ This is the FINAL score (penalty already applied)
        averageScore: adjustedScore,
        // ✅ Optional: include raw score for transparency
        rawScore: rawAverageScore,
        // ✅ Optional: include penalty amount for display
        focusPenalty: focusPenalty,
        totalTime: timeUsed,
        completed,
        strengths: allStrengths,
        weaknesses: allWeaknesses,
        recommendations: recommendationsText || "",
        // ✅ Include focus metrics if frontend wants to show analytics
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
