import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // ✅ params is now a Promise
) {
  // ✅ Await params to get the id
  const { id: sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Session ID is required" },
      { status: 400 },
    );
  }
  console.log(sessionId);

  try {
    // 1. Fetch Session Info
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 },
      );
    }

    // 2. Fetch Summary
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from("interview_summary")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    // 3. Fetch Questions with Feedback
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("interview_questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    // Parse strengths/weaknesses from summary text back to arrays for UI
    const parsedSummary = summary
      ? {
          ...summary,
          strengths: summary.strengths ? summary.strengths.split(" ||| ") : [],
          weaknesses: summary.weaknesses
            ? summary.weaknesses.split(" ||| ")
            : [],
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        session,
        summary: parsedSummary,
        questions: questions || [],
      },
    });
  } catch (error) {
    console.error("Error fetching session summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch summary" },
      { status: 500 },
    );
  }
}
