"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Brain,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

function ParticleField() {
  const canvasRef = useState<HTMLCanvasElement | null>(null);

  return null;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Email is required");

    setIsLoading(true);
    setError("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#03050f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', system-ui",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "52px 44px",
            borderRadius: 28,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(16,185,129,0.2)",
            backdropFilter: "blur(20px)",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 72,
              height: 72,
              margin: "0 auto 24px",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={30} color="#34d399" />
            </div>
          </div>
          <p
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 22,
              margin: "0 0 6px",
            }}
          >
            Check your inbox
          </p>
          <p
            style={{
              color: "#475569",
              fontSize: 14,
              margin: "0 0 28px",
              lineHeight: 1.6,
            }}
          >
            We sent a secure password reset link to <br />{" "}
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{email}</span>
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03050f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui",
        position: "relative",
        padding: 20,
      }}
    >
      {}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-5%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          padding: "40px 32px",
          borderRadius: 24,
          background: "rgba(15,23,42,0.6)",
          border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link
          href="/auth/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#64748b",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,58,237,0.35)",
            }}
          >
            <Brain size={18} color="#fff" />
          </div>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.4px",
            }}
          >
            PrepAI
          </span>
        </div>

        <h1
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 8px",
          }}
        >
          Forgot password?
        </h1>
        <p
          style={{
            color: "#475569",
            fontSize: 14,
            margin: "0 0 32px",
            lineHeight: 1.6,
          }}
        >
          No worries, it happens. Enter your email and we'll send you a secure
          link to reset it.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertCircle size={15} color="#f87171" />
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                color={focused ? "#a78bfa" : "#334155"}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  transition: "color 0.2s",
                  pointerEvents: "none",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  width: "100%",
                  padding: "13px 16px 13px 44px",
                  borderRadius: 12,
                  background: focused
                    ? "rgba(124,58,237,0.04)"
                    : "rgba(2,6,23,0.6)",
                  border: `1px solid ${focused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                  color: "#e2e8f0",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  boxShadow: focused
                    ? "0 0 0 3px rgba(124,58,237,0.08)"
                    : "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 13,
              border: "none",
              background: isLoading
                ? "rgba(124,58,237,0.4)"
                : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: isLoading ? "none" : "0 0 28px rgba(124,58,237,0.35)",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {isLoading ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Sending link...
              </>
            ) : (
              <>
                Send reset link <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } ::placeholder { color: #1e293b !important; }`}</style>
    </div>
  );
}
