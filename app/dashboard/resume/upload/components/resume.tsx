"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function ResumeUploadPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<
    "upload" | "uploading" | "processing" | "done" | "error"
  >("upload");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
      else router.push("/auth/login");
    });
  }, [router]);

  const processResume = async (file: File) => {
    if (!userId) return;
    setFileName(file.name);
    setStep("uploading");
    setErrorMsg("");

    try {
      const cleanName = file.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      const filePath = `${userId}/${Date.now()}_${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { cacheControl: "3600" });

      if (uploadError) throw new Error("Failed to upload resume");

      setStep("processing");
      const res = await fetch("/api/ai/resume/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, userId }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Processing failed");

      const { config } = json;
      const params = new URLSearchParams({
        role: config.role,
        difficulty: config.difficulty,
        type: config.type,
        mode: "text",
        duration: "30",
        ...(config.focusAreas?.length > 0 && {
          focus: config.focusAreas.join(","),
        }),
      });

      setStep("done");
      router.push(`/session/active?${params.toString()}`);
    } catch (err: any) {
      console.error("Resume flow error:", err);
      setErrorMsg(err.message || "An unexpected error occurred");
      setStep("error");
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) processResume(acceptedFiles[0]);
    },
    [userId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: step !== "upload",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan { animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {}
        <div className="w-full flex justify-between items-center mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition font-medium text-sm px-4 py-2 rounded-xl hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400">
            Step 1 of 2
          </div>
        </div>

        {}
        <div className="w-full bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
          {}
          <div className="p-8 text-center border-b border-zinc-800/50">
            <div className="inline-flex p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
              <FileText className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2">
              AI Resume Interview
            </h1>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
              Upload your resume. We'll parse it securely, extract your profile,
              and generate a personalized interview.
            </p>
          </div>

          {}
          <div className="p-8 min-h-[300px] flex flex-col justify-center">
            {}
            {step === "upload" && (
              <div className="animate-fade-in-up">
                <div
                  {...getRootProps()}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  style={{
                    backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, ${isDragActive ? "0.25" : "0.1"}), transparent 40%)`,
                  }}
                  className={`relative group border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
                    isDragActive
                      ? "border-violet-500 bg-violet-500/5 shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)] scale-[1.02]"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/30"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 ${
                      isDragActive
                        ? "bg-violet-500/20 text-violet-300 scale-110 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-300 group-hover:scale-105"
                    }`}
                  >
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-lg font-semibold text-zinc-100">
                    {isDragActive
                      ? "Drop your resume here"
                      : "Drag & drop your PDF resume"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 font-medium">
                    or click to browse • PDF only • Max 10MB
                  </p>
                </div>
              </div>
            )}

            {}
            {step === "uploading" && (
              <div className="text-center py-8 animate-fade-in-up">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-cyan-500/50 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">
                  Uploading Resume...
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs font-medium mt-2 max-w-full">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                  <span className="truncate">{fileName}</span>
                </div>
              </div>
            )}

            {}
            {step === "processing" && (
              <div className="text-center py-8 animate-fade-in-up">
                <div className="relative w-24 h-32 mx-auto mb-8 animate-float">
                  <div className="absolute inset-0 rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm shadow-2xl"></div>
                  <FileText className="absolute inset-0 m-auto w-10 h-10 text-zinc-500" />
                  {}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_15px_rgba(139,92,246,1)] animate-scan"></div>
                </div>

                <h3 className="text-xl font-bold text-zinc-100 mb-2">
                  Analyzing & Generating...
                </h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Extracting profile & crafting AI questions
                </p>

                <div className="space-y-3 max-w-xs mx-auto text-left">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                    <span>Secure upload complete</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-violet-400 font-medium">
                    <div className="relative w-3 h-3 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_5px_rgba(139,92,246,0.8)]"></div>
                    </div>
                    <span>AI parsing resume content...</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                    <span>Generating interview questions</span>
                  </div>
                </div>
              </div>
            )}

            {}
            {step === "done" && (
              <div className="text-center py-8 animate-fade-in-up">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow"></div>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">
                  Interview Ready!
                </h3>
                <p className="text-sm text-zinc-400">
                  Redirecting you to the session...
                </p>
                <div className="mt-6 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                </div>
              </div>
            )}

            {}
            {step === "error" && (
              <div className="text-center py-8 animate-fade-in-up">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl"></div>
                  <div className="relative w-full h-full rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">
                  Processing Failed
                </h3>
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-300 text-sm mb-6 max-w-xs mx-auto text-left">
                  {errorMsg}
                </div>
                <button
                  onClick={() => {
                    setStep("upload");
                    setErrorMsg("");
                  }}
                  className="px-6 py-3 bg-zinc-800 text-zinc-200 rounded-xl hover:bg-zinc-700 transition-all font-semibold border border-zinc-700 hover:-translate-y-0.5 shadow-lg"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="mt-6 text-xs text-zinc-600 font-medium flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Secure upload powered by Supabase Storage
        </div>
      </div>
    </div>
  );
}
