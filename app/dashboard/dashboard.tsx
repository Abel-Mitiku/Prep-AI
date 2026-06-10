"use client";

import { supabase } from "../lib/supabaseClient";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  LogIn,
  UserPlus,
  ChevronRight,
  Calendar,
  Star,
  Search,
  PlayCircle,
  Loader2,
  AlertCircle,
  Zap,
  Activity,
  Target,
  ArrowUpRight,
  Mic,
  Brain,
  Trophy,
  Flame,
  ChevronUp,
  MoreVertical,
  LogOut,
  Upload,
} from "lucide-react";

type DashboardStats = {
  totalInterviews: number;
  avgScore: number;
  bestScore: number;
  hoursPracticed: number;
};
type PerformancePoint = { date: string; score: number };
type RecentInterview = {
  id: string;
  role: string;
  company: string;
  date: string;
  score: number;
  status: string;
  duration: number;
};
type HistoryItem = {
  id: string;
  role: string;
  type: string;
  date: string;
  duration: number;
  score: number;
  status: string;
  sessionStatus: string;
};
const isValidInterview = (item: any) =>
  !!(
    item.role?.trim() &&
    item.date?.trim() &&
    typeof item.score === "number" &&
    item.score >= 0
  );

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#7c3aed" : "#f59e0b";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          fill: "#fff",
          fontSize: size > 50 ? 13 : 11,
          fontWeight: 700,
          transform: "rotate(90deg)",
          transformOrigin: "50% 50%",
        }}
      >
        {score}
      </text>
    </svg>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(t);
      } else setVal(Math.floor(start));
    }, 20);
    return () => clearInterval(t);
  }, [to]);
  return (
    <>
      {val}
      {suffix}
    </>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            borderRadius: 2,
            background: color,
            height: `${(v / max) * 100}%`,
            opacity: i === data.length - 1 ? 1 : 0.35 + (i / data.length) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(10,10,20,0.95)",
        border: "1px solid rgba(124,58,237,0.4)",
        borderRadius: 10,
        padding: "8px 14px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 2px" }}>
        {label}
      </p>
      <p style={{ color: "#a78bfa", fontWeight: 700, fontSize: 20, margin: 0 }}>
        {payload[0].value}
        <span style={{ color: "#475569", fontSize: 12 }}>%</span>
      </p>
    </div>
  );
};

export function Dashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>(
    [],
  );
  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>(
    [],
  );
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const test = async () => {
      const res = await fetch("/api/dashboard/history/test");
      await res.json();
    };
    test();
  }, []);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
      } else router.push("/auth/login");
      setLoading(false);
    }
    checkSession();
  }, [router]);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/dashboard/stats/${userId}`);
      const json = await res.json();
      if (json.success) setStats(json.data);
      else throw new Error(json.error);
    } catch {
      setError("Could not load stats");
    } finally {
      setStatsLoading(false);
    }
  }, [userId]);

  const fetchPerformance = useCallback(
    async (days = 30) => {
      if (!userId) return;
      try {
        const res = await fetch(
          `/api/dashboard/performance/${userId}?days=${days}`,
        );
        const json = await res.json();
        if (json.success)
          setPerformanceData(
            (json.data || []).filter(
              (p: PerformancePoint) => p.score != null && p.score >= 0,
            ),
          );
      } catch {
      } finally {
        setChartLoading(false);
      }
    },
    [userId],
  );

  const fetchRecent = useCallback(
    async (limit = 5) => {
      if (!userId) return;
      try {
        const res = await fetch(
          `/api/dashboard/recent/${userId}?limit=${limit}`,
        );
        const json = await res.json();
        if (json.success)
          setRecentInterviews((json.data || []).filter(isValidInterview));
      } catch {
      } finally {
        setRecentLoading(false);
      }
    },
    [userId],
  );

  const fetchHistory = useCallback(
    async (page = 1, search = "") => {
      if (!userId) return;
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(search && { search }),
        });
        const res = await fetch(`/api/dashboard/history/${userId}?${params}`);
        const json = await res.json();
        if (json.success)
          setHistory((json.data.interviews || []).filter(isValidInterview));
      } catch {
      } finally {
        setHistoryLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchPerformance();
      fetchRecent();
      fetchHistory();
    }
  }, [
    isAuthenticated,
    fetchStats,
    fetchPerformance,
    fetchRecent,
    fetchHistory,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        fetchHistory(1, searchQuery);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated, fetchHistory]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const sparklines = {
    interviews: [
      2,
      3,
      2,
      4,
      3,
      5,
      4,
      6,
      5,
      7,
      6,
      stats?.totalInterviews || 8,
    ].slice(-12),
    avg: [
      55,
      60,
      58,
      62,
      65,
      68,
      64,
      70,
      72,
      68,
      74,
      stats?.avgScore || 76,
    ].slice(-12),
    best: [
      60,
      65,
      70,
      68,
      72,
      75,
      78,
      76,
      80,
      82,
      85,
      stats?.bestScore || 88,
    ].slice(-12),
    hours: [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, stats?.hoursPracticed || 7].slice(
      -12,
    ),
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
              marginBottom: 16,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "rgba(124,58,237,0.25)",
                animation: "ping 1.2s infinite",
              }}
            />
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2
                size={22}
                color="#fff"
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
          </div>
          <p style={{ color: "#475569", fontSize: 13 }}>
            Loading your dashboard…
          </p>
        </div>
        <style>{`@keyframes ping{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.6);opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
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
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Award size={30} color="#a78bfa" />
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}
          >
            AI Interview Prep
          </h1>
          <p
            style={{
              color: "#475569",
              fontSize: 14,
              margin: "0 0 28px",
              lineHeight: 1.6,
            }}
          >
            Track progress, practice with AI, land your dream role.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.push("/auth/login")}
              style={{
                padding: "11px 24px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LogIn size={16} /> Log In
            </button>
            <button
              onClick={() => router.push("/auth/signup")}
              style={{
                padding: "11px 24px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#cbd5e1",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scoreLevel = !stats
    ? "—"
    : stats.avgScore >= 80
      ? "Excellent"
      : stats.avgScore >= 60
        ? "Good"
        : "Needs Work";
  const scoreLevelColor = !stats
    ? "#64748b"
    : stats.avgScore >= 80
      ? "#10b981"
      : stats.avgScore >= 60
        ? "#7c3aed"
        : "#f59e0b";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03050f",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
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
            top: -200,
            left: "10%",
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
            top: 400,
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "30%",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(79,70,229,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "0 16px 60px" : "0 24px 60px",
        }}
      >
        <nav
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            padding: "20px 0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            marginBottom: 32,
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={17} color="#fff" />
              </div>
              <span
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: "-0.3px",
                }}
              >
                PrepAI
              </span>
            </div>
            {isMobile && (
              <button
                title="log-out"
                onClick={handleLogout}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.push("/dashboard/resume/upload")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: isMobile ? "9px 12px" : "10px 20px",
                borderRadius: 12,
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.3)",
                color: "#06b6d4",
                fontWeight: 600,
                fontSize: isMobile ? 12 : 14,
                cursor: "pointer",
                flex: isMobile ? 1 : undefined,
              }}
            >
              <Upload size={15} /> {!isMobile && "Upload Resume"}
            </button>
            <button
              onClick={() => router.push("/session/new")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: isMobile ? "9px 12px" : "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: isMobile ? 12 : 14,
                cursor: "pointer",
                flex: isMobile ? 1 : undefined,
                boxShadow:
                  "0 0 32px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <Zap size={15} /> New Session
            </button>
            {!isMobile && (
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <LogOut size={15} /> Logout
              </button>
            )}
          </div>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
            gap: 24,
            marginBottom: 32,
            alignItems: "center",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px rgba(16,185,129,0.8)",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  color: "#10b981",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Live Session Tracker
              </span>
            </div>
            <h1
              style={{
                color: "#fff",
                fontSize: isMobile ? 28 : 38,
                fontWeight: 700,
                margin: "0 0 10px",
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              Your Interview
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Command Center
              </span>
            </h1>
            <p
              style={{
                color: "#475569",
                fontSize: 15,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {statsLoading
                ? "Loading your stats…"
                : `${stats?.totalInterviews ?? 0} sessions completed · Avg score ${stats?.avgScore ?? 0}% · Rated `}
              {!statsLoading && (
                <span style={{ color: scoreLevelColor, fontWeight: 600 }}>
                  {scoreLevel}
                </span>
              )}
            </p>
          </div>

          {!statsLoading && stats && (
            <div
              style={{
                textAlign: "center",
                padding: "16px 24px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                justifySelf: isMobile ? "center" : "end",
              }}
            >
              <ScoreRing score={stats.avgScore} size={72} />
              <p
                style={{
                  color: "#475569",
                  fontSize: 10,
                  marginTop: 6,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Avg Score
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? 12 : 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Sessions",
              icon: Mic,
              val: stats?.totalInterviews ?? 0,
              disp: stats?.totalInterviews?.toString() ?? "—",
              spark: sparklines.interviews,
              accent: "#7c3aed",
              glow: "rgba(124,58,237,0.15)",
              suffix: "",
            },
            {
              label: "Avg Score",
              icon: Activity,
              val: stats?.avgScore ?? 0,
              disp: stats?.avgScore?.toString() ?? "—",
              spark: sparklines.avg,
              accent: "#06b6d4",
              glow: "rgba(6,182,212,0.15)",
              suffix: "%",
            },
            {
              label: "Best Score",
              icon: Trophy,
              val: stats?.bestScore ?? 0,
              disp: stats?.bestScore?.toString() ?? "—",
              spark: sparklines.best,
              accent: "#f59e0b",
              glow: "rgba(245,158,11,0.15)",
              suffix: "%",
            },
            {
              label: "Hours",
              icon: Flame,
              val: stats?.hoursPracticed ?? 0,
              disp: stats?.hoursPracticed?.toString() ?? "—",
              spark: sparklines.hours,
              accent: "#10b981",
              glow: "rgba(16,185,129,0.15)",
              suffix: "h",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                borderRadius: 18,
                padding: isMobile ? "16px" : "20px 20px 16px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s, border-color 0.2s",
                cursor: "default",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: isMobile ? 32 : 36,
                    height: isMobile ? 32 : 36,
                    borderRadius: 10,
                    background: `${s.glow}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <s.icon size={isMobile ? 15 : 17} color={s.accent} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    color: "#10b981",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  <ChevronUp size={12} /> 12%
                </div>
              </div>

              {statsLoading ? (
                <div
                  style={{
                    height: 32,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    marginBottom: 8,
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ) : (
                <p
                  style={{
                    color: "#fff",
                    fontSize: isMobile ? 22 : 28,
                    fontWeight: 700,
                    margin: "0 0 2px",
                    letterSpacing: "-0.5px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  <CountUp to={s.val} suffix={s.suffix} />
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    color: "#475569",
                    fontSize: isMobile ? 11 : 12,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </p>
                <Sparkline data={s.spark} color={s.accent} />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              borderRadius: 20,
              padding: isMobile ? "20px 16px 16px" : "24px 24px 16px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 20,
                gap: 12,
              }}
            >
              <div>
                <h2
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 16,
                    margin: "0 0 4px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Performance Trend
                </h2>
                <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
                  Score progression across sessions
                </p>
              </div>
              <select
                title="Date-Limit"
                onChange={(e) => {
                  setChartLoading(true);
                  fetchPerformance(parseInt(e.target.value));
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                  borderRadius: 10,
                  padding: "7px 12px",
                  fontSize: 12,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
              </select>
            </div>

            <div style={{ height: isMobile ? 180 : 220 }}>
              {chartLoading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Loader2
                    size={24}
                    color="#7c3aed"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
              ) : performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{
                      top: 4,
                      right: 4,
                      left: isMobile ? -10 : -20,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#7c3aed"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="#7c3aed"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#334155", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#334155", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "rgba(124,58,237,0.2)",
                        strokeWidth: 1,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="url(#lineGrad)"
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 10,
                  }}
                >
                  <BarChart3 size={32} color="#1e293b" />
                  <p style={{ color: "#334155", fontSize: 13 }}>
                    No data yet. Start practicing!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              padding: isMobile ? "20px 16px" : "24px 20px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Recent
              </h2>
              <button
                onClick={() => router.push("/dashboard/history")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7c3aed",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                See all <ChevronRight size={13} />
              </button>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {recentLoading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 62,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                ))
              ) : recentInterviews.length > 0 ? (
                recentInterviews.slice(0, 5).map((iv) => {
                  const sc = iv.score;
                  return (
                    <button
                      key={iv.id}
                      onClick={() =>
                        router.push(`/session/summary?sessionId=${iv.id}`)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                        <p
                          style={{
                            color: "#e2e8f0",
                            fontSize: 13,
                            fontWeight: 500,
                            margin: "0 0 3px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {iv.role}
                        </p>
                        <p
                          style={{
                            color: "#334155",
                            fontSize: 11,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Calendar size={9} /> {iv.date}
                        </p>
                      </div>
                      <ScoreRing score={sc} size={38} />
                    </button>
                  );
                })
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <PlayCircle size={28} color="#1e293b" />
                  <p
                    style={{
                      color: "#334155",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    No sessions yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              padding: isMobile ? "16px" : "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  margin: "0 0 2px",
                  letterSpacing: "-0.3px",
                }}
              >
                Interview History
              </h2>
              <p style={{ color: "#334155", fontSize: 11, margin: 0 }}>
                {history.length} sessions recorded
              </p>
            </div>
            <div
              style={{
                position: "relative",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Search
                size={14}
                color="#334155"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: 34,
                  paddingRight: 14,
                  paddingTop: 9,
                  paddingBottom: 9,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  width: isMobile ? "100%" : 200,
                  transition: "border-color 0.2s",
                }}
              />
            </div>
          </div>

          {historyLoading ? (
            <div
              style={{
                padding: "48px 0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Loader2
                size={22}
                color="#7c3aed"
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
          ) : history.length > 0 ? (
            isMobile ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {history.map((item) => {
                  const scoreColor =
                    item.score >= 80
                      ? "#10b981"
                      : item.score >= 60
                        ? "#a78bfa"
                        : "#f59e0b";
                  const scoreBg =
                    item.score >= 80
                      ? "rgba(16,185,129,0.1)"
                      : item.score >= 60
                        ? "rgba(124,58,237,0.1)"
                        : "rgba(245,158,11,0.1)";
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        router.push(`/session/summary?sessionId=${item.id}`)
                      }
                      style={{
                        padding: 16,
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                          <p
                            style={{
                              color: "#e2e8f0",
                              fontWeight: 500,
                              fontSize: 14,
                              margin: "0 0 4px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.role}
                            {item.type && (
                              <span
                                style={{
                                  color: "#475569",
                                  fontWeight: 400,
                                  fontSize: 11,
                                  marginLeft: 6,
                                  textTransform: "capitalize",
                                }}
                              >
                                ({item.type})
                              </span>
                            )}
                          </p>
                          <p
                            style={{
                              color: "#475569",
                              fontSize: 11,
                              margin: 0,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Calendar size={10} /> {item.date} •{" "}
                            {item.duration != null ? `${item.duration}m` : "—"}
                          </p>
                        </div>
                        <ScoreRing score={item.score} size={44} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 8,
                            background: scoreBg,
                            color: scoreColor,
                            fontSize: 11,
                            fontWeight: 600,
                            border: `1px solid ${scoreColor}30`,
                            textTransform: "capitalize",
                          }}
                        >
                          {item.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/session/summary?sessionId=${item.id}`,
                            );
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 10,
                            background: "rgba(124,58,237,0.12)",
                            border: "1px solid rgba(124,58,237,0.25)",
                            color: "#a78bfa",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Review <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 600,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {["Role", "Date", "Duration", "Score", "Rating", ""].map(
                        (h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "10px 24px",
                              textAlign: "left",
                              color: "#334155",
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => {
                      const scoreColor =
                        item.score >= 80
                          ? "#10b981"
                          : item.score >= 60
                            ? "#a78bfa"
                            : "#f59e0b";
                      const scoreBg =
                        item.score >= 80
                          ? "rgba(16,185,129,0.1)"
                          : item.score >= 60
                            ? "rgba(124,58,237,0.1)"
                            : "rgba(245,158,11,0.1)";
                      const isHovered = hoveredRow === item.id;
                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            background: isHovered
                              ? "rgba(124,58,237,0.04)"
                              : "transparent",
                            transition: "background 0.15s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={() => setHoveredRow(item.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() =>
                            router.push(`/session/summary?sessionId=${item.id}`)
                          }
                        >
                          <td style={{ padding: "14px 24px" }}>
                            <p
                              style={{
                                color: "#e2e8f0",
                                fontWeight: 500,
                                fontSize: 14,
                                margin: "0 0 2px",
                              }}
                            >
                              {item.role}
                            </p>
                            {item.type && (
                              <p
                                style={{
                                  color: "#334155",
                                  fontSize: 11,
                                  margin: 0,
                                  textTransform: "capitalize",
                                }}
                              >
                                {item.type}
                              </p>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "14px 24px",
                              color: "#475569",
                              fontSize: 12,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {item.date}
                          </td>
                          <td
                            style={{
                              padding: "14px 24px",
                              color: "#475569",
                              fontSize: 12,
                            }}
                          >
                            {item.duration != null ? `${item.duration}m` : "—"}
                          </td>
                          <td style={{ padding: "14px 24px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{ display: "flex", gap: 2, width: 60 }}
                              >
                                {[...Array(10)].map((_, si) => (
                                  <div
                                    key={si}
                                    style={{
                                      flex: 1,
                                      height: 4,
                                      borderRadius: 2,
                                      background:
                                        si < Math.round(item.score / 10)
                                          ? scoreColor
                                          : "rgba(255,255,255,0.07)",
                                      transition: "background 0.3s",
                                    }}
                                  />
                                ))}
                              </div>
                              <span
                                style={{
                                  color: "#fff",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  fontFamily: "'DM Mono', monospace",
                                }}
                              >
                                {item.score}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 24px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: 8,
                                background: scoreBg,
                                color: scoreColor,
                                fontSize: 11,
                                fontWeight: 600,
                                border: `1px solid ${scoreColor}30`,
                              }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td
                            style={{ padding: "14px 24px", textAlign: "right" }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/session/summary?sessionId=${item.id}`,
                                );
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 14px",
                                borderRadius: 10,
                                background: "rgba(124,58,237,0.12)",
                                border: "1px solid rgba(124,58,237,0.25)",
                                color: "#a78bfa",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                            >
                              Review <ArrowUpRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div
              style={{
                padding: "60px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <BarChart3 size={36} color="#1e293b" />
              <p style={{ color: "#334155", fontSize: 14 }}>
                {searchQuery
                  ? "No interviews match your search."
                  : "No history yet."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/session/new")}
                  style={{
                    marginTop: 4,
                    padding: "9px 20px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Start Practicing
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { to { transform:rotate(360deg) } }
        * { box-sizing: border-box; }
        ::placeholder { color: #334155 !important; }
      `}</style>
    </div>
  );
}
