"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying secure link...");

  useEffect(() => {
    const code = searchParams.get("code");
    const type = searchParams.get("type");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setStatus("error");
          setMessage("This link has expired or is invalid.");
          setTimeout(() => router.push("/auth/forgot-password"), 3000);
        } else {
          setStatus("success");
          setMessage("Verification successful! Redirecting...");

          // ✅ FIX: Redirect based on the type of email link clicked
          if (type === "recovery") {
            setTimeout(() => router.push("/auth/reset-password"), 1500);
          } else if (type === "signup") {
            setTimeout(() => router.push("/dashboard"), 1500); // Redirect to dashboard after registration
          } else if (type === "email_change") {
            setTimeout(() => router.push("/dashboard/settings"), 1500);
          } else {
            // Default fallback for any other successful auth flow
            setTimeout(() => router.push("/dashboard"), 1500);
          }
        }
      });
    } else {
      setStatus("error");
      setMessage("No verification code found.");
      setTimeout(() => router.push("/auth/forgot-password"), 3000);
    }
  }, [searchParams, router]);

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
          textAlign: "center",
          padding: "52px 44px",
          borderRadius: 28,
          background: "rgba(15,23,42,0.9)",
          border: `1px solid ${
            status === "error"
              ? "rgba(239,68,68,0.2)"
              : status === "success"
                ? "rgba(34,197,94,0.2)"
                : "rgba(124,58,237,0.2)"
          }`,
          backdropFilter: "blur(20px)",
          maxWidth: 380,
          width: "100%",
        }}
      >
        {status === "loading" ? (
          <>
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
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={30} color="#a78bfa" />
              </div>
            </div>
            <p
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                margin: "0 0 8px",
              }}
            >
              Decrypting secure link
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#475569",
                fontSize: 14,
              }}
            >
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
              {message}
            </div>
          </>
        ) : status === "success" ? (
          <>
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
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={30} color="#4ade80" />
              </div>
            </div>
            <p
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                margin: "0 0 8px",
              }}
            >
              Success!
            </p>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              {message}
            </p>
          </>
        ) : (
          <>
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
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle size={30} color="#f87171" />
              </div>
            </div>
            <p
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                margin: "0 0 8px",
              }}
            >
              Link Expired
            </p>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              {message}
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#03050f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            size={32}
            color="#a78bfa"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
