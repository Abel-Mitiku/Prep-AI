import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 },
    );
  }

  try {
    const { count: totalInterviews, error: countError } = await supabaseAdmin
      .from("interview_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    if (countError) {
      console.error("Error counting interviews:", countError);
      throw countError;
    }

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("interview_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (sessionsError) {
      console.error("Error fetching session IDs:", sessionsError);
      throw sessionsError;
    }

    const sessionIds = sessions?.map((s) => s.id) || [];

    const { data: scores, error: scoresError } = await supabaseAdmin
      .from("interview_summary")
      .select("final_score")
      .in("session_id", sessionIds);

    if (scoresError) {
      console.error("Error fetching scores:", scoresError);
    }

    const { data: sessionTimestamps, error: timestampError } =
      await supabaseAdmin
        .from("interview_sessions")
        .select("started_at, ended_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .not("ended_at", "is", null);

    if (timestampError) {
      console.error("Error fetching timestamps:", timestampError);
    }

    const totalMinutes =
      sessionTimestamps?.reduce((sum, session) => {
        if (session.started_at && session.ended_at) {
          const start = new Date(session.started_at).getTime();
          const end = new Date(session.ended_at).getTime();
          const durationMs = end - start;
          if (durationMs > 0) {
            return sum + Math.round(durationMs / 60000);
          }
        }
        return sum;
      }, 0) || 0;

    const hoursPracticed = parseFloat((totalMinutes / 60).toFixed(1));

    const validScores = scores
      ?.map((s) => s.final_score)
      .filter((s): s is number => typeof s === "number" && s >= 0 && s <= 100);

    const avgScore = validScores?.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    const bestScore = validScores?.length ? Math.max(...validScores) : 0;

    console.log("✅ Stats calculated:", {
      avgScore,
      bestScore,
      totalInterviews,
      hoursPracticed,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalInterviews: totalInterviews || 0,
        avgScore,
        bestScore,
        hoursPracticed,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
