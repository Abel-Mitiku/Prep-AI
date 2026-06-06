"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Brain,
  Loader2,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8)
      return setError("Password must be at least 8 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
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
            maxWidth: 380,
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
            Password updated!
          </p>
          <p style={{ color: "#475569", fontSize: 14, margin: "0 0 28px" }}>
            Redirecting to your dashboard...
          </p>
          <div
            style={{
              height: 3,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg,#10b981,#06b6d4)",
                borderRadius: 999,
                animation: "fillBar 2s ease forwards",
              }}
            />
          </div>
        </div>
        <style>{`@keyframes fillBar{from{width:0%}to{width:100%}}`}</style>
      </div>
    );
  }

  const inputStyle = (name: string) => ({
    width: "100%",
    padding: "13px 16px 13px 44px",
    borderRadius: 12,
    background: focused === name ? "rgba(124,58,237,0.04)" : "rgba(2,6,23,0.6)",
    border: `1px solid ${focused === name ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
    boxShadow: focused === name ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
  });

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
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
          Set new password
        </h1>
        <p
          style={{
            color: "#475569",
            fontSize: 14,
            margin: "0 0 32px",
            lineHeight: 1.6,
          }}
        >
          Your identity has been verified. Choose a strong new password for your
          account.
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
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* New Password */}
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
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                color={focused === "pass" ? "#a78bfa" : "#334155"}
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
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onFocus={() => setFocused("pass")}
                onBlur={() => setFocused(null)}
                style={inputStyle("pass")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#334155",
                  padding: 0,
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
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
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                color={focused === "confirm" ? "#a78bfa" : "#334155"}
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
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onFocus={() => setFocused("confirm")}
                onBlur={() => setFocused(null)}
                style={inputStyle("confirm")}
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
              marginTop: 8,
            }}
          >
            {isLoading ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Updating...
              </>
            ) : (
              <>
                Update password <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } ::placeholder { color: #1e293b !important; }`}</style>
    </div>
  );
}
