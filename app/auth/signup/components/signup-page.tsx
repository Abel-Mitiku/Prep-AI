"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Calendar,
  Globe,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Brain,
  Loader2,
  ChevronDown,
} from "lucide-react";

type FormData = {
  fullName: string;
  email: string;
  password: string;
  targetRole: string;
  experience: string;
  industry: string;
};

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      da: number;
    };
    const particles: P[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.005,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a < 0.1) p.da = Math.abs(p.da);
        if (p.a > 0.7) p.da = -Math.abs(p.da);
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.a * 0.6})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

function DashPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 80);
    return () => clearInterval(t);
  }, []);

  const bars = [42, 68, 55, 78, 62, 88, 71, 92, 80, 85];
  const animated = bars.map((b, i) =>
    i === tick % bars.length ? Math.min(100, b + 5) : b,
  );

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
      <div
        style={{
          position: "absolute",
          inset: -40,
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 2,
            background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
          }}
        />

        <div style={{ padding: "20px 20px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Your Progress
              </p>
              <p style={{ color: "#334155", fontSize: 11, margin: "2px 0 0" }}>
                Last 10 sessions
              </p>
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <span style={{ color: "#34d399", fontSize: 11, fontWeight: 700 }}>
                ↑ 32%
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 5,
              height: 60,
              marginBottom: 16,
            }}
          >
            {animated.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.3s ease",
                  height: `${h}%`,
                  background:
                    i === tick % bars.length
                      ? "linear-gradient(180deg,#a78bfa,#7c3aed)"
                      : "rgba(124,58,237,0.25)",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              { label: "Technical", val: 84, color: "#7c3aed" },
              { label: "Comm", val: 76, color: "#06b6d4" },
              { label: "Confidence", val: 71, color: "#10b981" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 10px 8px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: s.color,
                    fontWeight: 700,
                    fontSize: 18,
                    margin: "0 0 2px",
                    fontFamily: "monospace",
                  }}
                >
                  {s.val}
                </p>
                <p style={{ color: "#334155", fontSize: 10, margin: 0 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: -28,
          right: -24,
          padding: "10px 14px",
          borderRadius: 14,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(124,58,237,0.25)",
          backdropFilter: "blur(12px)",
          animation: "floatA 5s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(124,58,237,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 14 }}>🎯</span>
          </div>
          <div>
            <p
              style={{
                color: "#a78bfa",
                fontWeight: 700,
                fontSize: 13,
                margin: 0,
              }}
            >
              Role matched!
            </p>
            <p style={{ color: "#475569", fontSize: 10, margin: 0 }}>
              Senior Frontend Dev
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: -24,
          left: -20,
          padding: "10px 14px",
          borderRadius: 14,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(16,185,129,0.25)",
          backdropFilter: "blur(12px)",
          animation: "floatB 6s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px rgba(16,185,129,0.8)",
            }}
          />
          <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>
            AI configuring your sessions…
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    targetRole: "",
    experience: "",
    industry: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): Partial<Record<keyof FormData, string>> => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!formData.targetRole.trim())
      newErrors.targetRole = "Target role is required";
    if (!formData.experience)
      newErrors.experience = "Please select your experience level";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      }
      if (!data.success) {
        setErrors({ fullName: data.error });
        setIsSuccess(false);
      }
    } catch {
      setErrors({ fullName: "Something went wrong. Please try again." });
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
        <ParticleField />
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
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)",
              borderRadius: 28,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: 72,
                height: 72,
                margin: "0 auto 24px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.2)",
                  animation: "pingGreen 1.5s infinite",
                }}
              />
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
                letterSpacing: "-0.4px",
              }}
            >
              Account created
            </p>
            <p style={{ color: "#475569", fontSize: 14, margin: "0 0 28px" }}>
              Check your inbox for a verification link…
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
                  animation: "fillBar 1.5s ease forwards",
                }}
              />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pingGreen{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}
          @keyframes fillBar{from{width:0%}to{width:100%}}
        `}</style>
        {/* ✅ FIXED: Complete Google Fonts URL */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </div>
    );
  }

  const inputStyle = (
    name: string,
    hasError: boolean,
  ): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px 13px 44px",
    borderRadius: 12,
    background: focused === name ? "rgba(124,58,237,0.04)" : "rgba(2,6,23,0.6)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.4)" : focused === name ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s",
    boxShadow:
      focused === name && !hasError
        ? "0 0 0 3px rgba(124,58,237,0.08)"
        : "none",
    fontFamily: "inherit",
  });

  const selectStyle = (
    name: string,
    hasError: boolean,
  ): React.CSSProperties => ({
    width: "100%",
    padding: "13px 40px 13px 44px",
    borderRadius: 12,
    background: focused === name ? "rgba(124,58,237,0.04)" : "rgba(2,6,23,0.6)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.4)" : focused === name ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s",
    boxShadow:
      focused === name && !hasError
        ? "0 0 0 3px rgba(124,58,237,0.08)"
        : "none",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none" as const,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03050f",
        display: "flex",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* ✅ FIXED: Complete Google Fonts URL */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <ParticleField />

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
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          position: "relative",
          zIndex: 1,
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, padding: "20px 0" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 40,
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
          </Link>

          <h1
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.6px",
              margin: "0 0 6px",
              lineHeight: 1.1,
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              color: "#475569",
              fontSize: 14,
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            Start practicing with AI and track your interview performance.
          </p>

          {errors.fullName && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <AlertCircle
                size={15}
                color="#f87171"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <p
                style={{
                  color: "#f87171",
                  fontSize: 13,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {errors.fullName}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={15}
                  color={focused === "fullName" ? "#a78bfa" : "#334155"}
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
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  onFocus={() => setFocused("fullName")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("fullName", !!errors.fullName)}
                />
              </div>
              {errors.fullName && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 12,
                    margin: "5px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={11} /> {errors.fullName}
                </p>
              )}
            </div>

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
                  color={focused === "email" ? "#a78bfa" : "#334155"}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("email", !!errors.email)}
                />
              </div>
              {errors.email && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 12,
                    margin: "5px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>

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
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  color={focused === "password" ? "#a78bfa" : "#334155"}
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle("password", !!errors.password),
                    paddingRight: 44,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#94a3b8")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#334155")
                  }
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 12,
                    margin: "5px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

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
                Target Role
              </label>
              <div style={{ position: "relative" }}>
                <Briefcase
                  size={15}
                  color={focused === "targetRole" ? "#a78bfa" : "#334155"}
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
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g., Senior Frontend Developer"
                  onFocus={() => setFocused("targetRole")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("targetRole", !!errors.targetRole)}
                />
              </div>
              {errors.targetRole && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 12,
                    margin: "5px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={11} /> {errors.targetRole}
                </p>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
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
                  Experience
                </label>
                <div style={{ position: "relative" }}>
                  <Calendar
                    size={15}
                    color={focused === "experience" ? "#a78bfa" : "#334155"}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color 0.2s",
                      pointerEvents: "none",
                    }}
                  />
                  <select
                    title="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    onFocus={() => setFocused("experience")}
                    onBlur={() => setFocused(null)}
                    style={selectStyle("experience", !!errors.experience)}
                  >
                    <option value="">Select</option>
                    <option value="0-1">&lt; 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="#334155"
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
                {errors.experience && (
                  <p
                    style={{
                      color: "#f87171",
                      fontSize: 12,
                      margin: "5px 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <AlertCircle size={11} /> {errors.experience}
                  </p>
                )}
              </div>
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
                  Industry
                </label>
                <div style={{ position: "relative" }}>
                  <Globe
                    size={15}
                    color={focused === "industry" ? "#a78bfa" : "#334155"}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color 0.2s",
                      pointerEvents: "none",
                    }}
                  />
                  <select
                    title="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    onFocus={() => setFocused("industry")}
                    onBlur={() => setFocused(null)}
                    style={selectStyle("industry", false)}
                  >
                    <option value="">Select</option>
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="#334155"
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
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
                boxShadow: isLoading
                  ? "none"
                  : "0 0 28px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "all 0.2s",
                letterSpacing: "-0.2px",
                fontFamily: "inherit",
                marginTop: 8,
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Creating account…
                </>
              ) : (
                <>
                  Create account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "#334155",
              fontSize: 13,
              margin: "24px 0 0",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#a78bfa",
                fontWeight: 600,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#c4b5fd")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#a78bfa")
              }
            >
              Log in
            </Link>
          </p>
          <p
            style={{
              textAlign: "center",
              color: "#1e293b",
              fontSize: 11,
              margin: "12px 0 0",
              lineHeight: 1.5,
            }}
          >
            By signing up, you agree to our{" "}
            <a
              href="#"
              style={{
                color: "#475569",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              style={{
                color: "#475569",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div
        style={{
          display: "none",
          flex: 1,
          position: "relative",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
        }}
        className="lg-flex"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 48,
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div style={{ position: "relative", width: 100, height: 100 }}>
            {[60, 80, 100].map((size, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: size * 2,
                  height: size * 2,
                  borderRadius: "50%",
                  border: "1px solid rgba(124,58,237,0.15)",
                  transform: "translate(-50%,-50%)",
                  animation: `orbit ${8 + i * 3}s linear infinite ${i % 2 ? "reverse" : ""}`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background:
                      i === 0 ? "#a78bfa" : i === 1 ? "#06b6d4" : "#34d399",
                    transform: "translate(50%,-50%)",
                    boxShadow: "0 0 8px currentColor",
                  }}
                />
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 40px rgba(124,58,237,0.5)",
                }}
              >
                <Brain size={28} color="#fff" />
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                color: "#fff",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                margin: "0 0 10px",
                lineHeight: 1.2,
              }}
            >
              Practice smarter.
              <br />
              Interview better.
            </h2>
            <p
              style={{
                color: "#475569",
                fontSize: 15,
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Join thousands of professionals who used AI to land offers at top
              companies.
            </p>
          </div>

          <DashPreview />

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              { emoji: "🎙️", text: "Real-time voice & text simulations" },
              { emoji: "💡", text: "Personalized feedback on skills" },
              { emoji: "📊", text: "Track progress with detailed analytics" },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(124,58,237,0.25)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(124,58,237,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.02)";
                }}
              >
                <span style={{ fontSize: 16 }}>{f.emoji}</span>
                <span
                  style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}
                >
                  {f.text}
                </span>
                <CheckCircle
                  size={14}
                  color="#34d399"
                  style={{ marginLeft: "auto", flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes orbit { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(0deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @media (min-width: 1024px) { .lg-flex { display: flex !important; } }
        ::placeholder { color: #1e293b !important; }
        ::selection { background: rgba(124,58,237,0.3) }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 999px }
      `}</style>
    </div>
  );
}
