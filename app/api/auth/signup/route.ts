import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, targetRole, experience, industry } =
      body;

    if (!fullName || !email || !password || !targetRole || !experience) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          target_role: targetRole,
          experience_level: experience,
          industry: industry,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (authError) {
      if (
        authError.message?.toLowerCase().includes("already") ||
        authError.code === "user_already_exists"
      ) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 },
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Failed to create user account" },
        { status: 500 },
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        target_role: targetRole,
        experience: experience,
        industry: industry || null,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Profile creation failed:", profileError);

      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { success: false, error: "Failed to initialize user profile" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        needsConfirmation: true,
        data: { userId, email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
