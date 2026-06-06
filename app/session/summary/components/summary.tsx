"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SummaryData } from "@/app/types/types";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Home,
  RotateCcw,
  Trophy,
  Brain,
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  AlertTriangle,
  Target,
  Star,
  TrendingUp,
  Shield,
  ShieldAlert,
  Clock,
  Award,
} from "lucide-react";

function ScoreArc({ score, size = 160 }: { score: number; size?: number }) {
  const cx = size / 2,
    cy = size / 2;
  const r = (size - 20) / 2;
  const totalArc = Math.PI * 1.5;
  const startAngle = Math.PI * 0.75;
  const endAngle = startAngle + totalArc;
  const filled = startAngle + (score / 100) * totalArc;

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const s = toXY(startAngle),
    e = toXY(endAngle),
    f = toXY(filled);
  const large = (score / 100) * totalArc > Math.PI ? 1 : 0;

  const trackPath = `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`;
  const fillPath =
    score <= 0 ? "" : `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${f.x} ${f.y}`;

  const color = score >= 80 ? "#10b981" : score >= 60 ? "#a78bfa" : "#f59e0b";
  const glowId = `glow-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={trackPath}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {fillPath && (
        <path
          d={fillPath}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          style={{ filter: `url(#${glowId})` }}
        />
      )}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        style={{
          fill: "#fff",
          fontSize: size * 0.22,
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        style={{ fill: "#475569", fontSize: size * 0.09 }}
      >
        / 100
      </text>
      <text
        x={cx}
        y={cy + 32}
        textAnchor="middle"
        style={{
          fill: color,
          fontSize: size * 0.085,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
      </text>
    </svg>
  );
}

function AnimBar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: `${width}%`,
          background: color,
          borderRadius: 999,
          transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 10px ${color}60`,
        }}
      />
    </div>
  );
}

function Pill({ text, variant }: { text: string; variant: "green" | "amber" }) {
  const styles = {
    green: {
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.25)",
      color: "#34d399",
    },
    amber: {
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.25)",
      color: "#fbbf24",
    },
  }[variant];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: 8,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#a78bfa" : "#f59e0b";
  const bg =
    score >= 80
      ? "rgba(16,185,129,0.12)"
      : score >= 60
        ? "rgba(124,58,237,0.12)"
        : "rgba(245,158,11,0.12)";
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: bg,
        border: `2px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color,
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "'DM Mono',monospace",
        }}
      >
        {score}
      </span>
    </div>
  );
}

export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SummaryData | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard");
      return;
    }
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/ai/session/summary/${sessionId}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else throw new Error(json.error || "Failed to load");
      } catch (err) {
        console.error("❌ Failed to fetch summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [sessionId, router]);

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#03050f",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: "rgba(124,58,237,0.2)",
                animation: "ping 1.4s infinite",
              }}
            />
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain size={26} color="#fff" />
            </div>
          </div>
          <p
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              margin: "0 0 6px",
            }}
          >
            Analyzing your performance…
          </p>
          <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
            Our AI is reviewing your session
          </p>
        </div>
        <style>{`@keyframes ping{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.7);opacity:0}}`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#03050f",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 32,
          }}
        >
          <AlertCircle
            size={44}
            color="#f59e0b"
            style={{ margin: "0 auto 16px" }}
          />
          <h2
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              margin: "0 0 8px",
            }}
          >
            Could Not Load Summary
          </h2>
          <p
            style={{
              color: "#475569",
              fontSize: 14,
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            We couldn't find the interview results. This might happen if the
            session expired or was deleted.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link
              href="/dashboard"
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { session, summary, questions } = data;
  const finalScore = summary?.final_score || 0;
  const rawScore = summary?.raw_score;
  const focusPenalty =
    rawScore != null && rawScore !== finalScore ? rawScore - finalScore : 0;

  const parseList = (text: string | null | undefined) => {
    if (!text) return [];
    return text.split(" ||| ").filter((s) => s.trim());
  };
  const strengths = summary?.strengths
    ? Array.isArray(summary.strengths)
      ? summary.strengths
      : parseList(summary.strengths as string)
    : [];
  const weaknesses = summary?.weaknesses
    ? Array.isArray(summary.weaknesses)
      ? summary.weaknesses
      : parseList(summary.weaknesses as string)
    : [];

  const avgTechnical =
    questions.length > 0
      ? Math.round(
          questions.reduce((a, q) => a + (q.technical_score || 0), 0) /
            questions.length,
        )
      : 0;
  const avgComm =
    questions.length > 0
      ? Math.round(
          questions.reduce((a, q) => a + (q.communication_score || 0), 0) /
            questions.length,
        )
      : 0;
  const avgConf =
    questions.length > 0
      ? Math.round(
          questions.reduce((a, q) => a + (q.confidence_score || 0), 0) /
            questions.length,
        )
      : 0;

  const card = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
  } as const;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03050f",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        paddingBottom: 80,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

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
            top: -150,
            left: "20%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(3,5,15,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "14px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={14} color="#fff" />
              </div>
              <span
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "-0.3px",
                }}
              >
                Session Report
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/session/new"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <RotateCcw size={13} /> Retry
              </Link>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <Home size={13} /> Dashboard
              </Link>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
          <div
            style={{
              ...card,
              padding: "40px 32px",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, #7c3aed, ${finalScore >= 80 ? "#10b981" : finalScore >= 60 ? "#06b6d4" : "#f59e0b"})`,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 32,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    marginBottom: 16,
                  }}
                >
                  <Trophy size={12} color="#fbbf24" />
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Interview Complete
                  </span>
                </div>
                <h1
                  style={{
                    color: "#fff",
                    fontSize: 32,
                    fontWeight: 700,
                    margin: "0 0 8px",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                  }}
                >
                  {session?.role || "Interview"}
                  <br />
                  <span
                    style={{ color: "#334155", fontSize: 18, fontWeight: 400 }}
                  >
                    {session?.interview_type?.replace("_", " ") || "Session"}
                  </span>
                </h1>

                {focusPenalty > 0 && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 12,
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.25)",
                    }}
                  >
                    <AlertTriangle size={12} color="#fbbf24" />
                    <span
                      style={{
                        color: "#fbbf24",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Score adjusted: −{focusPenalty}% focus penalty
                    </span>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxWidth: 340,
                  }}
                >
                  {[
                    {
                      label: "Technical",
                      val: avgTechnical,
                      color: "#7c3aed",
                      icon: Brain,
                    },
                    {
                      label: "Communication",
                      val: avgComm,
                      color: "#06b6d4",
                      icon: MessageSquare,
                    },
                    {
                      label: "Confidence",
                      val: avgConf,
                      color: "#f59e0b",
                      icon: Zap,
                    },
                  ].map((s, i) => (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <s.icon size={12} color={s.color} />
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {s.label}
                          </span>
                        </div>
                        <span
                          style={{
                            color: "#94a3b8",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'DM Mono',monospace",
                          }}
                        >
                          {s.val}%
                        </span>
                      </div>
                      <AnimBar value={s.val} color={s.color} delay={i * 150} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ScoreArc score={finalScore} size={160} />
                {rawScore != null && rawScore !== finalScore && (
                  <span
                    style={{
                      color: "#334155",
                      fontSize: 11,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    Raw: {rawScore}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {[
              {
                icon: Brain,
                label: "Technical",
                val: `${avgTechnical}%`,
                color: "#7c3aed",
                glow: "rgba(124,58,237,0.15)",
              },
              {
                icon: MessageSquare,
                label: "Communication",
                val: `${avgComm}%`,
                color: "#06b6d4",
                glow: "rgba(6,182,212,0.15)",
              },
              {
                icon: Zap,
                label: "Confidence",
                val: `${avgConf}%`,
                color: "#f59e0b",
                glow: "rgba(245,158,11,0.15)",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  ...card,
                  padding: "18px 20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                  }}
                />
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: s.glow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <s.icon size={15} color={s.color} />
                </div>
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 24,
                    margin: "0 0 2px",
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  {s.val}
                </p>
                <p
                  style={{
                    color: "#475569",
                    fontSize: 12,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {summary?.suspicious !== undefined && (
            <div
              style={{ ...card, padding: "24px 24px 20px", marginBottom: 20 }}
            >
              <h3
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: "0 0 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  letterSpacing: "-0.3px",
                }}
              >
                <Eye size={16} color="#a78bfa" /> Focus Analytics
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginBottom:
                    summary?.suspicious && focusPenalty > 0 ? 16 : 0,
                }}
              >
                {[
                  {
                    label: "Focus Score",
                    val: `${summary.focus_score ?? 100}%`,
                    color:
                      (summary.focus_score ?? 100) >= 80
                        ? "#10b981"
                        : (summary.focus_score ?? 100) >= 60
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                  {
                    label: "Interruptions",
                    val: `${summary.cheat_count ?? 0}`,
                    color: summary.cheat_count ? "#f59e0b" : "#10b981",
                  },
                  {
                    label: "Session Status",
                    val: summary.suspicious ? "Flagged" : "Verified",
                    color: summary.suspicious ? "#ef4444" : "#10b981",
                    icon: summary.suspicious ? ShieldAlert : Shield,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      textAlign: "center",
                      background: `${s.color}10`,
                      border: `1px solid ${s.color}25`,
                    }}
                  >
                    {s.icon && (
                      <s.icon
                        size={20}
                        color={s.color}
                        style={{ margin: "0 auto 6px" }}
                      />
                    )}
                    <p
                      style={{
                        color: s.color,
                        fontWeight: 700,
                        fontSize: 20,
                        margin: "0 0 2px",
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      {s.val}
                    </p>
                    <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {rawScore != null && rawScore !== finalScore && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    fontSize: 13,
                    color: "#94a3b8",
                  }}
                >
                  <span style={{ color: "#cbd5e1", fontWeight: 600 }}>
                    Score Breakdown:
                  </span>{" "}
                  Technical{" "}
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {rawScore}%
                  </span>
                  {focusPenalty > 0 && (
                    <>
                      {" "}
                      − Penalty{" "}
                      <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                        {focusPenalty}%
                      </span>
                    </>
                  )}{" "}
                  = Final{" "}
                  <span
                    style={{
                      color: "#a78bfa",
                      fontWeight: 700,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {finalScore}%
                  </span>
                </div>
              )}

              {session?.focus_events &&
                Array.isArray(session.focus_events) &&
                session.focus_events.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <p
                      style={{
                        color: "#475569",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        margin: "0 0 10px",
                      }}
                    >
                      Focus Events
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        maxHeight: 120,
                        overflowY: "auto",
                      }}
                    >
                      {session.focus_events
                        .slice(0, 5)
                        .map((event: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "6px 10px",
                              borderRadius: 8,
                              background: "rgba(245,158,11,0.05)",
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#f59e0b",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                color: "#475569",
                                fontSize: 11,
                                fontFamily: "'DM Mono',monospace",
                              }}
                            >
                              {event.timestamp
                                ? new Date(event.timestamp).toLocaleTimeString()
                                : "—"}
                            </span>
                            <span style={{ color: "#334155", fontSize: 11 }}>
                              •
                            </span>
                            <span style={{ color: "#64748b", fontSize: 12 }}>
                              {event.details || event.type || "Focus event"}
                            </span>
                          </div>
                        ))}
                      {session.focus_events.length > 5 && (
                        <p
                          style={{
                            color: "#334155",
                            fontSize: 11,
                            margin: "2px 0 0 16px",
                          }}
                        >
                          +{session.focus_events.length - 5} more events
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {summary?.recommendations && (
            <div
              style={{
                marginBottom: 20,
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.06) 100%)",
                  borderRadius: 20,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "1px solid rgba(124,58,237,0.25)",
                  borderRadius: 20,
                }}
              />
              <div
                style={{
                  position: "relative",
                  padding: "24px 24px 24px 20px",
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                  }}
                >
                  <Brain size={20} color="#fff" />
                </div>
                <div>
                  <p
                    style={{
                      color: "#a78bfa",
                      fontWeight: 700,
                      fontSize: 13,
                      margin: "0 0 6px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    AI Coach
                  </p>
                  <p
                    style={{
                      color: "#cbd5e1",
                      fontSize: 14,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {summary.recommendations}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ ...card, padding: "22px 22px 20px" }}>
              <h3
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  margin: "0 0 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "rgba(16,185,129,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle size={13} color="#10b981" />
                </div>
                Strengths
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {strengths.length > 0 ? (
                  strengths.map((s: string, i: number) => (
                    <Pill key={i} text={s} variant="green" />
                  ))
                ) : (
                  <p style={{ color: "#334155", fontSize: 13 }}>
                    No specific strengths identified.
                  </p>
                )}
              </div>
            </div>
            <div style={{ ...card, padding: "22px 22px 20px" }}>
              <h3
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  margin: "0 0 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "rgba(245,158,11,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={13} color="#f59e0b" />
                </div>
                Areas to Improve
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {weaknesses.length > 0 ? (
                  weaknesses.map((w: string, i: number) => (
                    <Pill key={i} text={w} variant="amber" />
                  ))
                ) : (
                  <p style={{ color: "#334155", fontSize: 13 }}>
                    Great job! Keep it up.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ ...card, overflow: "hidden", marginBottom: 32 }}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: "0 0 2px",
                  letterSpacing: "-0.3px",
                }}
              >
                Question Review
              </h3>
              <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>
                {questions.length} questions — click to expand feedback
              </p>
            </div>

            <div>
              {questions.length > 0 ? (
                questions.map((q, index) => {
                  const isExpanded = expandedQuestions.has(index);
                  const avgQ = Math.round(
                    ((q.technical_score || 0) +
                      (q.communication_score || 0) +
                      (q.confidence_score || 0)) /
                      3,
                  );
                  const qColor =
                    avgQ >= 80 ? "#10b981" : avgQ >= 60 ? "#a78bfa" : "#f59e0b";

                  return (
                    <div
                      key={index}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <button
                        onClick={() => toggleQuestion(index)}
                        style={{
                          width: "100%",
                          padding: "18px 24px",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "rgba(255,255,255,0.02)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "transparent")
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#334155",
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                            }}
                          >
                            Q{index + 1}
                          </span>
                          <ScoreBadge score={avgQ} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              color: "#e2e8f0",
                              fontWeight: 500,
                              fontSize: 14,
                              margin: "0 0 4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {q.question}
                          </p>

                          <div style={{ display: "flex", gap: 8 }}>
                            {[
                              { l: "Tech", v: q.technical_score, c: "#7c3aed" },
                              {
                                l: "Comm",
                                v: q.communication_score,
                                c: "#06b6d4",
                              },
                              {
                                l: "Conf",
                                v: q.confidence_score,
                                c: "#f59e0b",
                              },
                            ].map(
                              (s, si) =>
                                s.v != null && (
                                  <span
                                    key={si}
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: s.c,
                                      background: `${s.c}15`,
                                      border: `1px solid ${s.c}30`,
                                      borderRadius: 6,
                                      padding: "2px 6px",
                                      fontFamily: "'DM Mono',monospace",
                                    }}
                                  >
                                    {s.l} {s.v}
                                  </span>
                                ),
                            )}
                          </div>
                        </div>

                        <div style={{ color: "#334155", flexShrink: 0 }}>
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 24px 20px",
                            background: "rgba(0,0,0,0.2)",
                          }}
                        >
                          <div
                            style={{
                              borderRadius: 16,
                              overflow: "hidden",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              style={{
                                padding: "16px 18px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              <p
                                style={{
                                  color: "#334155",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  margin: "0 0 8px",
                                }}
                              >
                                Your Answer
                              </p>
                              <p
                                style={{
                                  color: "#94a3b8",
                                  fontSize: 13,
                                  lineHeight: 1.7,
                                  margin: 0,
                                  background: "rgba(255,255,255,0.02)",
                                  padding: "10px 12px",
                                  borderRadius: 10,
                                  border: "1px solid rgba(255,255,255,0.04)",
                                }}
                              >
                                {q.answer || "No answer recorded."}
                              </p>
                            </div>

                            <div
                              style={{
                                padding: "16px 18px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.04)",
                                background: "rgba(124,58,237,0.03)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 5,
                                    background:
                                      "linear-gradient(135deg,#7c3aed,#4f46e5)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Brain size={10} color="#fff" />
                                </div>
                                <p
                                  style={{
                                    color: "#a78bfa",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    margin: 0,
                                  }}
                                >
                                  AI Feedback
                                </p>
                              </div>
                              <p
                                style={{
                                  color: "#cbd5e1",
                                  fontSize: 13,
                                  lineHeight: 1.75,
                                  margin: 0,
                                }}
                              >
                                {q.feedback || "No feedback available."}
                              </p>
                            </div>

                            <div
                              style={{
                                padding: "14px 18px",
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 10,
                              }}
                            >
                              {[
                                {
                                  label: "Technical",
                                  val: q.technical_score,
                                  color: "#7c3aed",
                                },
                                {
                                  label: "Communication",
                                  val: q.communication_score,
                                  color: "#06b6d4",
                                },
                                {
                                  label: "Confidence",
                                  val: q.confidence_score,
                                  color: "#f59e0b",
                                },
                              ].map((s, si) => (
                                <div
                                  key={si}
                                  style={{
                                    textAlign: "center",
                                    padding: "10px 8px",
                                    borderRadius: 12,
                                    background: `${s.color}08`,
                                    border: `1px solid ${s.color}20`,
                                  }}
                                >
                                  <p
                                    style={{
                                      color: s.color,
                                      fontWeight: 700,
                                      fontSize: 18,
                                      margin: "0 0 2px",
                                      fontFamily: "'DM Mono',monospace",
                                    }}
                                  >
                                    {s.val != null ? `${s.val}%` : "—"}
                                  </p>
                                  <p
                                    style={{
                                      color: "#475569",
                                      fontSize: 10,
                                      margin: 0,
                                    }}
                                  >
                                    {s.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                  <p style={{ color: "#334155", fontSize: 14 }}>
                    No questions recorded for this session.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              href="/session/new"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 14,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow:
                  "0 0 32px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                letterSpacing: "-0.2px",
              }}
            >
              Practice Again <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              View History
            </Link>
          </div>
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes ping { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.8);opacity:0} }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
      `}</style>
    </div>
  );
}
