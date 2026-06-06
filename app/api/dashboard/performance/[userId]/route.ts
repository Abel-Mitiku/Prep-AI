import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type SessionWithSummary = {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  interview_summary:
    | {
        final_score: number | null;
      }[]
    | null;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") || "30";

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  try {
    const { data, error } = await supabaseAdmin
      .from("interview_sessions")
      .select(
        `
        id,
        started_at,
        ended_at,
        interview_summary!left (
          final_score
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("started_at", startDate.toISOString())
      .order("started_at", { ascending: true });

    if (error) {
      console.error("Error fetching performance data:", error);
      throw error;
    }

    const sessions = data as SessionWithSummary[] | null;

    const performanceData =
      sessions
        ?.filter((s) => s.started_at && s.ended_at)
        .map((s) => {
          const summary = Array.isArray(s.interview_summary)
            ? s.interview_summary[0]
            : s.interview_summary;
          const score = summary?.final_score ?? 0;

          return {
            date: new Date(s.started_at!).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            score,
            duration:
              s.started_at && s.ended_at
                ? Math.round(
                    (new Date(s.ended_at).getTime() -
                      new Date(s.started_at).getTime()) /
                      60000,
                  )
                : null,
          };
        })
        .filter((item) => item.score >= 0) || [];

    if (performanceData.length > 0) {
      const zeroPoint = {
        date: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: 0,
        duration: null,
      };

      performanceData.unshift(zeroPoint);
    } else {
      performanceData.push({
        date: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: 0,
        duration: null,
      });
    }

    console.log("✅ Performance data (with zero start):", performanceData);

    return NextResponse.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch performance data" },
      { status: 500 },
    );
  }
}
