import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("interview_sessions")
      .select(
        `
        id,
        role,
        interview_type,
        started_at,
        ended_at,
        status,
        interview_summary (
          final_score
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent interviews:", error);
      throw error;
    }

    const recentInterviews = data?.map((s) => {
      const summary = Array.isArray(s.interview_summary)
        ? s.interview_summary[0]
        : s.interview_summary;
      const score = summary?.final_score ?? 0;
      let status = "Needs Work";
      if (score >= 90) status = "Excellent";
      else if (score >= 75) status = "Good";

      const duration =
        s.started_at && s.ended_at
          ? Math.round(
              (new Date(s.ended_at).getTime() -
                new Date(s.started_at).getTime()) /
                60000,
            )
          : null;

      return {
        id: s.id,
        role: s.role,
        company: s.interview_type?.replace("_", " ") || "Interview",
        date: s.started_at
          ? new Date(s.started_at).toISOString().split("T")[0]
          : "N/A",
        score,
        status,
        duration,
      };
    });

    return NextResponse.json({
      success: true,
      data: recentInterviews || [],
    });
  } catch (error) {
    console.error("Error fetching recent interviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent interviews" },
      { status: 500 },
    );
  }
}
