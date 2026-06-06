import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin
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
        { count: "exact" },
      )
      .eq("user_id", userId);

    if (search) {
      query = query.ilike("role", `%${search}%`);
    }

    const { data, error, count } = await query
      .order("started_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching interview history:", error);
      throw error;
    }

    const history = data?.map((s) => {
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
        type: s.interview_type?.replace("_", " "),
        date: s.started_at
          ? new Date(s.started_at).toISOString().split("T")[0]
          : "N/A",
        duration,
        score,
        status,
        sessionStatus: s.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        interviews: history || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
