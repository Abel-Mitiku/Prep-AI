"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Mic,
  MessageSquare,
  ChevronRight,
  Check,
  AlertCircle,
  Play,
  Loader2,
  Star,
  Code,
  Brain,
  Users,
  TrendingUp,
} from "lucide-react";

type FormData = {
  role: string;
  interviewType: string;
  difficulty: "easy" | "medium" | "hard";
  duration: string;
  mode: "text" | "voice";
  industry: string;
  focusAreas: string[];
};

type InterviewType = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
};

type ModeOption = {
  id: "text" | "voice";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const INTERVIEW_TYPES: InterviewType[] = [
  {
    id: "behavioral",
    label: "Behavioral",
    icon: Users,
    desc: "STAR method, leadership, teamwork",
  },
  {
    id: "technical",
    label: "Technical",
    icon: Code,
    desc: "Coding, algorithms, debugging",
  },
  {
    id: "system_design",
    label: "System Design",
    icon: Brain,
    desc: "Architecture, scalability, trade-offs",
  },
  {
    id: "case_study",
    label: "Case Study",
    icon: TrendingUp,
    desc: "Business problems, analytics, strategy",
  },
  {
    id: "hr_screening",
    label: "HR / Screening",
    icon: MessageSquare,
    desc: "Culture fit, motivation, background",
  },
];

const FOCUS_AREAS: readonly string[] = [
  "Communication",
  "Problem Solving",
  "Technical Depth",
  "Leadership",
  "Time Management",
  "Conflict Resolution",
  "System Architecture",
  "Coding Speed",
] as const;

const MODE_OPTIONS: ModeOption[] = [
  { id: "text", icon: MessageSquare, label: "Text Chat" },
  { id: "voice", icon: Mic, label: "Voice Call" },
];

const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

export default function NewSessionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    role: "",
    interviewType: "",
    difficulty: "medium",
    duration: "30",
    mode: "text",
    industry: "",
    focusAreas: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleFocusArea = (area: string): void => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a: string) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.role.trim()) newErrors.role = "Target role is required";
    if (!formData.interviewType)
      newErrors.interviewType = "Please select an interview type";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const params = new URLSearchParams({
        difficulty: formData.difficulty,
        mode: formData.mode,
        type: formData.interviewType,
        role: formData.role,
        duration: formData.duration,
        ...(formData.industry && { industry: formData.industry }),
        ...(formData.focusAreas.length > 0 && {
          focus: formData.focusAreas.join(","),
        }),
      });
      router.push(`/session/active?${params.toString()}`);
    } catch (err: unknown) {
      console.error("Session creation failed:", err);
      setErrors({ role: "Failed to start session. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-cyan-600/5 rounded-full blur-[100px]"></div>
      </div>

      {}
      <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Configure New Interview
          </h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 md:px-8 py-10">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all">
              <label
                htmlFor="role"
                className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest"
              >
                Target Role *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="role"
                  type="text"
                  value={formData.role}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange("role", e.target.value)
                  }
                  placeholder="e.g., Senior Frontend Developer, Data Scientist"
                  className={`w-full pl-12 pr-4 bg-zinc-950/50 text-zinc-100 placeholder-zinc-500 py-3.5 rounded-xl border ${
                    errors.role
                      ? "border-rose-500/50 focus:ring-rose-500/20"
                      : "border-zinc-800 focus:border-violet-500/50 focus:ring-violet-500/20"
                  } focus:outline-none focus:ring-4 transition`}
                />
              </div>
              {errors.role && (
                <p className="text-rose-400 text-xs mt-2 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.role}
                </p>
              )}
            </div>

            {}
            <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all">
              <fieldset>
                <legend className="block text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                  Interview Type *
                </legend>
                <div className="grid sm:grid-cols-2 gap-3">
                  {INTERVIEW_TYPES.map((type) => {
                    const isSelected = formData.interviewType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleChange("interviewType", type.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-4 group ${
                          isSelected
                            ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/20 shadow-lg shadow-violet-500/5"
                            : "border-zinc-800 bg-zinc-950/30 hover:border-zinc-700 hover:bg-zinc-800/30"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-2.5 rounded-xl transition-colors ${
                            isSelected
                              ? "bg-violet-500/20 text-violet-300"
                              : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-300"
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold transition-colors ${isSelected ? "text-zinc-100" : "text-zinc-300"}`}
                          >
                            {type.label}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            {type.desc}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-1 rounded-full bg-violet-500/20">
                            <Check className="w-3.5 h-3.5 text-violet-300" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              {errors.interviewType && (
                <p className="text-rose-400 text-xs mt-3 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.interviewType}
                </p>
              )}
            </div>

            {}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all">
                <fieldset>
                  <legend className="block text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                    Difficulty Level
                  </legend>
                  <div className="flex gap-1 p-1 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    {DIFFICULTY_LEVELS.map((level) => {
                      const isSelected = formData.difficulty === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleChange("difficulty", level)}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold capitalize transition-all ${
                            isSelected
                              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all">
                <label
                  htmlFor="duration"
                  className="block text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest"
                >
                  Duration
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      handleChange("duration", e.target.value)
                    }
                    className="w-full pl-12 pr-10 bg-zinc-950/50 text-zinc-100 py-3.5 rounded-xl border border-zinc-800 appearance-none focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/20 transition cursor-pointer"
                  >
                    <option value="15">15 minutes (Quick)</option>
                    <option value="30">30 minutes (Standard)</option>
                    <option value="45">45 minutes (Deep dive)</option>
                    <option value="60">60 minutes (Full sim)</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            {}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all">
                <fieldset>
                  <legend className="block text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                    Interview Mode
                  </legend>
                  <div className="flex gap-1 p-1 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    {MODE_OPTIONS.map((modeOption) => {
                      const isSelected = formData.mode === modeOption.id;
                      return (
                        <button
                          key={modeOption.id}
                          type="button"
                          onClick={() => handleChange("mode", modeOption.id)}
                          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold text-sm ${
                            isSelected
                              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <modeOption.icon className="w-4 h-4" />
                          {modeOption.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all">
                <label className="block text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                  Focus Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((area) => {
                    const isSelected = formData.focusAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleFocusArea(area)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-violet-500/10 border-violet-500/30 text-violet-300 shadow-sm shadow-violet-500/5"
                            : "bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-zinc-100 mb-5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                Session Preview
              </h3>

              <dl className="space-y-4 text-sm">
                {[
                  { label: "Role", value: formData.role || "Not specified" },
                  {
                    label: "Type",
                    value:
                      INTERVIEW_TYPES.find(
                        (t) => t.id === formData.interviewType,
                      )?.label || "Not selected",
                  },
                  {
                    label: "Difficulty",
                    value:
                      formData.difficulty.charAt(0).toUpperCase() +
                      formData.difficulty.slice(1),
                  },
                  { label: "Duration", value: `${formData.duration} min` },
                  {
                    label: "Mode",
                    value:
                      formData.mode === "voice" ? "Voice Call" : "Text Chat",
                  },
                  {
                    label: "Focus",
                    value:
                      formData.focusAreas.length > 0
                        ? formData.focusAreas.join(", ")
                        : "General",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0"
                  >
                    <dt className="text-zinc-500 font-medium">{item.label}</dt>
                    <dd className="font-semibold text-zinc-100 text-right max-w-[60%] truncate">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                onClick={() => setShowSummary((prev) => !prev)}
                className="mt-5 text-violet-400 text-sm hover:text-violet-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                {showSummary ? "Hide details" : "Show AI configuration"}
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-300 ${showSummary ? "rotate-90" : ""}`}
                />
              </button>

              {showSummary && (
                <div
                  id="ai-config-details"
                  className="mt-3 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-2"
                >
                  <p className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-violet-500"></span>{" "}
                    AI adapts questions to your level
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-violet-500"></span>{" "}
                    Real-time feedback on clarity
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-violet-500"></span>{" "}
                    Dynamic follow-up questions
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-violet-500"></span>{" "}
                    Post-session scorecard & tips
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all font-bold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )}
                {isLoading ? "Preparing AI..." : "Start Session"}
              </button>

              <p className="mt-4 text-xs text-center text-zinc-500 font-medium">
                1 session = ~{formData.duration} min • Free tier: 3/month
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
