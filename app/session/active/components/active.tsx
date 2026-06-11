"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Answer, interviewMode, Question } from "@/app/types/types";
import { supabase } from "@/app/lib/supabaseClient";
import { useFocusMonitor } from "@/app/lib/focusMonitor";
import {
  Timer,
  Mic,
  Square,
  Send,
  SkipForward,
  Pause,
  Play,
  Flag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Clock,
  Video,
  VideoOff,
  AlertCircle,
  Volume2,
  VolumeX,
  MicOff,
  Eye,
  Shield,
  X,
} from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function AISpeakingOrb({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16">
      {active && (
        <>
          <span
            className="absolute inset-0 rounded-full border border-violet-400/30 animate-ping"
            style={{ animationDuration: "1.4s" }}
          />
          <span
            className="absolute inset-[-8px] rounded-full border border-violet-400/20 animate-ping"
            style={{ animationDuration: "1.8s", animationDelay: "0.3s" }}
          />
          <span
            className="absolute inset-[-16px] rounded-full border border-violet-400/10 animate-ping"
            style={{ animationDuration: "2.2s", animationDelay: "0.6s" }}
          />
        </>
      )}
      <div
        className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
          active
            ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/50 scale-110"
            : "bg-slate-700 border border-slate-600"
        }`}
      >
        <Volume2
          className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${active ? "text-white" : "text-slate-400"}`}
        />
      </div>
    </div>
  );
}

function ListeningOrb({ active }: { active: boolean }) {
  const bars = [
    0.5, 0.8, 1.0, 0.65, 0.9, 0.55, 1.0, 0.75, 0.85, 0.6, 0.95, 0.7,
  ];
  return (
    <div className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16">
      {active && (
        <>
          <span
            className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping"
            style={{ animationDuration: "1s" }}
          />
          <span
            className="absolute inset-[-8px] rounded-full bg-cyan-500/5 animate-ping"
            style={{ animationDuration: "1.5s", animationDelay: "0.2s" }}
          />
        </>
      )}
      <div
        className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center gap-[2px] transition-all duration-500 ${
          active
            ? "bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/50 scale-110"
            : "bg-slate-700 border border-slate-600"
        }`}
      >
        {active ? (
          bars.map((h, i) => (
            <span
              key={i}
              className="rounded-full bg-white"
              style={{
                width: 2,
                height: `${h * 16}px`,
                animation: `waveBar 0.8s ease-in-out ${(i * 0.07).toFixed(2)}s infinite alternate`,
              }}
            />
          ))
        ) : (
          <Mic className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
        )}
      </div>
      <style>{`
        @keyframes waveBar {
          0%   { transform: scaleY(0.3); opacity: 0.6; }
          100% { transform: scaleY(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-6" aria-hidden>
      {[0.6, 1, 0.75, 1.1, 0.5, 0.9, 0.65, 1.05, 0.7, 0.85].map((h, i) => (
        <span
          key={i}
          className="rounded-full transition-all duration-200"
          style={{
            width: 3,
            backgroundColor: active ? "#06b6d4" : "#334155",
            height: active ? `${h * 18}px` : "4px",
            animation: active
              ? `waveBar 0.9s ease-in-out ${(i * 0.08).toFixed(2)}s infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

function EntryWarningModal({ onAccept }: { onAccept: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleAccept = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-radial from-violet-900/20 via-transparent to-transparent" />

      <div className="relative max-w-lg w-full">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Eye className="w-9 h-9 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">
          You're Being Monitored
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          This session uses AI-powered focus detection
        </p>

        <div className="space-y-3 mb-8">
          {[
            {
              icon: "👁",
              text: "Tab switching or losing focus will lower your score",
            },
            {
              icon: "📸",
              text: "Webcam activity is tracked throughout the session",
            },
            {
              icon: "⚠️",
              text: "Suspicious behavior will be flagged on your report",
            },
            {
              icon: "🔒",
              text: "Your session is recorded and reviewed by AI",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-xl">{item.icon}</span>
              <p className="text-slate-300 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleAccept}
          disabled={countdown > 0}
          className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed relative overflow-hidden"
          style={{
            background:
              countdown > 0
                ? "linear-gradient(135deg, #374151, #1f2937)"
                : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: countdown > 0 ? "none" : "0 0 30px rgba(124,58,237,0.4)",
          }}
        >
          {countdown > 0 ? (
            <span className="text-slate-400">
              Please read carefully… ({countdown}s)
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> I Understand — Begin Interview
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function FocusWarningOverlay({
  level,
  onDismiss,
}: {
  level: "warn" | "critical";
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
      style={{
        background:
          level === "critical" ? "rgba(127,29,29,0.3)" : "rgba(120,53,15,0.2)",
      }}
    >
      <div
        className="max-w-sm w-full pointer-events-auto rounded-2xl border overflow-hidden shadow-2xl"
        style={{
          background:
            level === "critical"
              ? "linear-gradient(135deg, #1c0a0a, #2d1212)"
              : "linear-gradient(135deg, #1c1408, #2d2008)",
          borderColor: level === "critical" ? "#dc2626" : "#d97706",
          boxShadow:
            level === "critical"
              ? "0 0 40px rgba(220,38,38,0.3), inset 0 0 40px rgba(220,38,38,0.05)"
              : "0 0 40px rgba(217,119,6,0.3)",
        }}
      >
        <div
          className="h-1 w-full animate-pulse"
          style={{
            background:
              level === "critical"
                ? "linear-gradient(90deg, #dc2626, #ef4444)"
                : "linear-gradient(90deg, #d97706, #f59e0b)",
          }}
        />

        <div className="p-5">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background:
                  level === "critical"
                    ? "rgba(220,38,38,0.2)"
                    : "rgba(217,119,6,0.2)",
                border: `1px solid ${level === "critical" ? "rgba(220,38,38,0.4)" : "rgba(217,119,6,0.4)"}`,
              }}
            >
              <AlertTriangle
                className="w-5 h-5"
                style={{
                  color: level === "critical" ? "#f87171" : "#fbbf24",
                }}
              />
            </div>
            <div className="flex-1">
              <h3
                className="font-bold text-base mb-1"
                style={{ color: level === "critical" ? "#f87171" : "#fbbf24" }}
              >
                {level === "critical"
                  ? "⚠ Session Flagged"
                  : "Focus Alert — Return Now"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {level === "critical"
                  ? "Multiple focus violations detected. This session has been flagged for review. Further violations will severely impact your score."
                  : "You left the interview tab. This has been recorded and will affect your evaluation score."}
              </p>
            </div>
            <button
              title="close"
              onClick={onDismiss}
              className="text-slate-600 hover:text-slate-400 transition mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || "text";
  const typeParam = searchParams.get("type") || "technical";

  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);

  const [status, setStatus] = useState<
    "loading" | "active" | "paused" | "ended"
  >("loading");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [focusWarningDismissed, setFocusWarningDismissed] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(true);

  const [webcamPos, setWebcamPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const speechRecognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const listeningIntentRef = useRef(false);
  const finalTranscriptRef = useRef("");

  const currentQ: Question | undefined = questions[currentQIndex];
  const totalQ: number = questions.length;
  const progress: number =
    totalQ > 0 ? ((currentQIndex + 1) / totalQ) * 100 : 0;

  const {
    cheatCount,
    focusScore,
    suspicious,
    events: focusEvents,
    showWarning,
  } = useFocusMonitor({
    enabled: true,
    warningThreshold: 2,
    suspiciousThreshold: 5,
    inactivityTimeout: 120000,
  });

  useEffect(() => {
    if (!showWarning) setFocusWarningDismissed(false);
  }, [showWarning]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      let clientX = 0,
        clientY = 0;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      setWebcamPos({
        x: clientX - dragOffsetRef.current.x,
        y: clientY - dragOffsetRef.current.y,
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("speechSynthesis" in window)
      synthesisRef.current = window.speechSynthesis;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    speechRecognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;

      const fullText =
        finalTranscript + (interimTranscript ? " " + interimTranscript : "");
      setCurrentInput(fullText.trim());
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      setSpeechError(
        event.error === "audio-capture"
          ? "Microphone not found."
          : event.error === "not-allowed"
            ? "Microphone access denied."
            : "Speech recognition failed.",
      );
      listeningIntentRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (listeningIntentRef.current) {
        setTimeout(() => {
          if (listeningIntentRef.current) {
            try {
              recognition.start();
            } catch {
              listeningIntentRef.current = false;
              setIsListening(false);
            }
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    return () => {
      listeningIntentRef.current = false;
      try {
        recognition.stop();
      } catch {}
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (
      !ttsEnabled ||
      !currentQ?.text ||
      status !== "active" ||
      !hasAcceptedWarning
    )
      return;
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;

    synthesisRef.current.speak(utterance);
  }, [currentQIndex, ttsEnabled, status, currentQ?.text, hasAcceptedWarning]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionDurationMin = parseInt(
          searchParams.get("duration") || "30",
          10,
        );
        const role = searchParams.get("role") || "";
        const difficulty = searchParams.get("difficulty") || "medium";
        const interviewType = searchParams.get("type") || "technical";
        const industry = searchParams.get("industry") || "";
        const focusAreas = searchParams.get("focus")?.split(",") || [];

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("auth/login");
          return;
        }

        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            difficulty,
            type: interviewType,
            mode: modeParam,
            duration: sessionDurationMin,
            industry,
            focusAreas,
            userId: session.user.id,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.error || "Failed to start interview session");

        setSessionId(data.sessionId);
        setQuestions(data.questions || []);
        setTimeLeft(sessionDurationMin * 60);
        setStatus("active");
        setApiError(null);
      } catch (err: unknown) {
        setApiError(
          err instanceof Error ? err.message : "Failed to load interview",
        );
        setStatus("ended");
      } finally {
        setIsFetchingQuestions(false);
      }
    };
    initSession();
  }, [searchParams, modeParam]);

  useEffect(() => {
    if (!showWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let mounted = true;
    let currentStream: MediaStream | null = null;

    const getStream = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!mounted) {
          currentStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = currentStream;
        setWebcamError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          videoRef.current.play().catch((err) => {
            console.warn("Video play failed:", err);
          });
        }
      } catch (err: any) {
        if (!mounted) return;
        setWebcamError(
          err.name === "NotAllowedError"
            ? "Camera permission denied"
            : err.name === "NotFoundError"
              ? "No camera found"
              : "Camera unavailable",
        );
      }
    };

    getStream();

    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
    };
  }, [showWebcam]);

  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch((err) => {
        console.warn("Video play failed on ref attach:", err);
      });
    }
  }, []);

  useEffect(() => {
    if (status !== "active" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleEndSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(
        () => setRecordingDuration((p) => p + 1),
        1000,
      );
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handlePauseResume = () =>
    setStatus((prev) => (prev === "active" ? "paused" : "active"));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setCurrentInput(e.target.value);

  const toggleTTS = () => {
    if (!synthesisRef.current || !currentQ?.text) return;
    if (isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    } else {
      synthesisRef.current.cancel();
      const u = new SpeechSynthesisUtterance(currentQ.text);
      u.rate = 0.9;
      u.pitch = 1;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      synthesisRef.current.speak(u);
    }
  };

  const toggleSpeechInput = () => {
    const recognition = speechRecognitionRef.current;
    if (!recognition) {
      setSpeechError("Voice typing not supported on this browser.");
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      listeningIntentRef.current = false;
      try {
        recognition.stop();
      } catch {
        setIsListening(false);
      }
    } else {
      listeningIntentRef.current = true;
      setSpeechError(null);
      try {
        recognition.start();
      } catch (err: any) {
        listeningIntentRef.current = false;
        if (err.message?.includes("already started")) setIsListening(true);
        else if (err.name === "NotAllowedError")
          setSpeechError("Microphone access denied.");
        else setSpeechError("Failed to start voice input.");
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);

      // Stop speech recognition
      listeningIntentRef.current = false;
      try {
        speechRecognitionRef.current?.stop();
      } catch (e) {
        console.warn("Failed to stop speech recognition:", e);
      }

      // Keep the final transcript, don't overwrite with placeholder
      // Only show placeholder if nothing was captured
      if (!finalTranscriptRef.current.trim()) {
        setCurrentInput(`[Voice Recording - ${recordingDuration}s]`);
      }
      // Otherwise, keep the transcribed text that's already in currentInput

      setRecordingDuration(0);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingDuration(0);
      setCurrentInput("");
      finalTranscriptRef.current = "";

      // Start speech recognition for live transcription
      if (speechRecognitionRef.current) {
        listeningIntentRef.current = true;
        try {
          speechRecognitionRef.current.start();
        } catch (err: any) {
          if (!err.message?.includes("already started")) {
            console.warn("Failed to start speech recognition:", err);
          }
        }
      }
    }
  };

  const handleSubmitAnswer = async (): Promise<void> => {
    if ((!currentInput.trim() && !isRecording) || !currentQ || !sessionId)
      return;
    setAiIsThinking(true);

    listeningIntentRef.current = false;
    speechRecognitionRef.current?.stop();
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
    setIsListening(false);

    try {
      const res = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQ.id,
          questionText: currentQ.text,
          answer: currentInput,
          isVoice: modeParam === "voice" && isRecording,
          duration: isRecording ? recordingDuration : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to evaluate answer");

      const evaluation = data.evaluation || data;

      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQ.id,
          questionText: currentQ.text,
          text: currentInput,
          isVoice: modeParam === "voice" && isRecording,
          duration: isRecording ? recordingDuration : undefined,
          submittedAt: new Date().toISOString(),
          technical_score: evaluation.technical_score,
          communication_score: evaluation.communication_score,
          confidence_score: evaluation.confidence_score,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths || [],
          areas_to_improve: evaluation.areas_to_improve || [],
          score:
            evaluation.technical_score ||
            Math.round(
              (evaluation.technical_score +
                evaluation.communication_score +
                evaluation.confidence_score) /
                3,
            ),
        },
      ]);

      if (data.nextQuestion && currentQIndex >= questions.length - 1)
        setQuestions((prev) => [...prev, data.nextQuestion]);

      if (currentQIndex < totalQ - 1) setCurrentQIndex((prev) => prev + 1);
      else await handleEndSession(false);
    } catch (err) {
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQ?.id || "unknown",
          questionText: currentQ?.text,
          text: currentInput,
          isVoice: modeParam === "voice" && isRecording,
          duration: isRecording ? recordingDuration : undefined,
          submittedAt: new Date().toISOString(),
          feedback: "Evaluation failed",
          strengths: [],
          areas_to_improve: [],
          technical_score: null,
          communication_score: null,
          confidence_score: null,
          score: null,
        },
      ]);

      if (currentQIndex < totalQ - 1) setCurrentQIndex((prev) => prev + 1);
      else await handleEndSession(false);
    } finally {
      setAiIsThinking(false);
      setCurrentInput("");
      finalTranscriptRef.current = "";
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const handleSkip = () => {
    if (currentQIndex < totalQ - 1) setCurrentQIndex((prev) => prev + 1);
  };

  const handleEndSession = useCallback(
    async (isTimeout = false): Promise<void> => {
      setStatus("ended");
      setShowEndConfirm(true);

      if (synthesisRef.current) synthesisRef.current.cancel();
      if (speechRecognitionRef.current && isListening)
        speechRecognitionRef.current.stop();

      if (sessionId) {
        try {
          const res = await fetch("/api/ai/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              answers,
              timeUsed:
                (searchParams.get("duration")
                  ? parseInt(searchParams.get("duration")!, 10) * 60
                  : 1800) - timeLeft,
              completed: !isTimeout,
              cheatCount,
              focusScore,
              suspicious,
              focusEvents,
            }),
          });
          await res.json();
          router.push(`/session/summary?sessionId=${sessionId}`);
        } catch {
          router.push(`/session/summary?sessionId=${sessionId}`);
        }
      } else {
        router.push(`/session/summary?sessionId=mock-${Date.now()}`);
      }
    },
    [
      sessionId,
      answers,
      timeLeft,
      searchParams,
      isListening,
      router,
      cheatCount,
      focusScore,
      suspicious,
      focusEvents,
    ],
  );

  const confirmEndAndRedirect = () =>
    router.push(
      `/session/summary?sessionId=${sessionId || `mock-${Date.now()}`}`,
    );

  const timeUrgent = timeLeft < 120 && timeLeft > 0;
  const timeWarning = timeLeft < 300 && timeLeft > 120;

  if (status === "loading" || isFetchingQuestions) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0891b2 0%, transparent 50%)",
          }}
        />
        <div className="relative text-center">
          <div className="relative flex items-center justify-center mb-6">
            <span className="absolute w-20 h-20 rounded-full bg-violet-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          </div>
          <p className="text-slate-200 font-semibold text-lg mb-1">
            {isFetchingQuestions
              ? "Generating your questions…"
              : "Calibrating AI interviewer…"}
          </p>
          <p className="text-slate-500 text-sm">This will just take a moment</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Failed to Load Interview
          </h2>
          <p className="text-slate-400 mb-4">{apiError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (totalQ === 0) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No Questions Available
          </h2>
          <p className="text-slate-400 mb-4">
            The AI couldn't generate questions for your selection.
          </p>
          <button
            onClick={() => router.push("/session/new")}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            Configure New Session
          </button>
        </div>
      </div>
    );
  }

  if (!hasAcceptedWarning) {
    return <EntryWarningModal onAccept={() => setHasAcceptedWarning(true)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(8,145,178,0.06) 0%, transparent 60%)",
        }}
      />

      {showWarning && !focusWarningDismissed && (
        <FocusWarningOverlay
          level={suspicious ? "critical" : "warn"}
          onDismiss={() => setFocusWarningDismissed(true)}
        />
      )}

      <header
        className="sticky top-0 z-20 border-b px-3 py-2 md:px-6 md:py-3"
        style={{
          background: "rgba(2,6,23,0.85)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(148,163,184,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              title="dashboard"
              onClick={() => router.push("/dashboard")}
              className="text-slate-500 hover:text-slate-300 transition p-1 rounded-lg hover:bg-slate-800 flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-semibold text-slate-100 capitalize tracking-tight text-sm md:text-base truncate">
                {typeParam.replace("_", " ")} Interview
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">
                Question{" "}
                <span className="text-violet-400 font-mono font-semibold">
                  {currentQIndex + 1}
                </span>{" "}
                of <span className="text-slate-400">{totalQ}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            {cheatCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <Eye className="w-3 h-3" />
                <span>
                  {cheatCount} alert{cheatCount > 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border font-mono font-semibold text-xs md:text-sm transition-all ${
                timeUrgent
                  ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                  : timeWarning
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {formatTime(timeLeft)}
            </div>

            <button
              onClick={handlePauseResume}
              className="p-1.5 md:p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title={status === "active" ? "Pause" : "Resume"}
            >
              {status === "active" ? (
                <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
              ) : (
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-1.5 md:p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              title="End Session"
            >
              <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="w-full h-[2px] bg-slate-800 relative z-10">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
            boxShadow: "0 0 12px rgba(124,58,237,0.6)",
          }}
        />
      </div>

      {showWebcam && (
        <div
          className={`fixed top-20 right-4 z-30 w-28 h-20 md:w-44 md:h-32 rounded-2xl overflow-hidden shadow-2xl border group ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            background: "rgba(2,6,23,0.9)",
            borderColor: "rgba(148,163,184,0.15)",
            boxShadow:
              "0 0 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)",
            transform: `translate(${webcamPos.x}px, ${webcamPos.y}px)`,
            touchAction: "none",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            e.preventDefault();
            setIsDragging(true);
            dragOffsetRef.current = {
              x: e.clientX - webcamPos.x,
              y: e.clientY - webcamPos.y,
            };
          }}
          onTouchStart={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            const touch = e.touches[0];
            setIsDragging(true);
            dragOffsetRef.current = {
              x: touch.clientX - webcamPos.x,
              y: touch.clientY - webcamPos.y,
            };
          }}
        >
          {webcamError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
              <AlertCircle className="w-5 h-5 text-amber-400 mb-1" />
              <p className="text-[10px] text-slate-400 leading-tight">
                {webcamError}
              </p>
              <button
                onClick={() => setShowWebcam(false)}
                className="mt-1 text-[10px] text-violet-400 hover:text-violet-300 underline"
              >
                Hide
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <video
                ref={handleVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ boxShadow: "0 0 6px rgba(239,68,68,0.8)" }}
                />
                <span className="text-[9px] font-bold text-red-400 tracking-widest">
                  REC
                </span>
              </div>
              <button
                onClick={() => setShowWebcam(false)}
                className="absolute bottom-2 right-2 p-1.5 md:p-1 bg-slate-900/80 hover:bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition"
                title="Hide webcam"
              >
                <VideoOff className="w-3.5 h-3.5 md:w-3 md:h-3 text-slate-300" />
              </button>
            </div>
          )}
        </div>
      )}

      {!showWebcam && (
        <button
          onClick={() => {
            setShowWebcam(true);
            setWebcamError(null);
          }}
          className="fixed top-20 right-4 z-30 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
        >
          <Video className="w-3.5 h-3.5" /> Camera
        </button>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-3 py-4 md:px-6 md:py-6 flex flex-col gap-3 md:gap-4 relative z-10 pb-24">
        <div
          className="rounded-2xl border p-4 md:p-6"
          style={{
            background: "rgba(15,23,42,0.8)",
            borderColor: "rgba(148,163,184,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <AISpeakingOrb active={isSpeaking} />
              {isSpeaking && (
                <span className="text-[10px] text-violet-400 font-medium tracking-wide">
                  SPEAKING
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className="text-xs text-slate-500 font-mono">
                  Q{currentQIndex + 1}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-xs text-violet-400 capitalize font-medium">
                  {typeParam.replace("_", " ")}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-semibold text-slate-100 leading-snug mb-2 md:mb-3">
                {currentQ?.text || "Preparing next question…"}
              </h2>
              {currentQ?.hint && (
                <div
                  className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs text-slate-400"
                  style={{
                    background: "rgba(148,163,184,0.06)",
                    border: "1px solid rgba(148,163,184,0.1)",
                  }}
                >
                  <span>💡</span>
                  <span>{currentQ.hint}</span>
                </div>
              )}
            </div>

            <button
              onClick={toggleTTS}
              disabled={!currentQ?.text}
              className={`p-2 md:p-2.5 rounded-xl transition flex-shrink-0 border ${
                isSpeaking
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                  : "border-slate-700 text-slate-500 hover:text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
              title={isSpeaking ? "Stop reading" : "Read question aloud"}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl border flex flex-col overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.8)",
            borderColor: isListening
              ? "rgba(6,182,212,0.3)"
              : "rgba(148,163,184,0.1)",
            backdropFilter: "blur(8px)",
            boxShadow: isListening
              ? "0 0 0 1px rgba(6,182,212,0.2), 0 0 30px rgba(6,182,212,0.08)"
              : "none",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <div
            className="flex items-center justify-between px-4 pt-3 pb-2 md:px-5 md:pt-4 md:pb-3 border-b"
            style={{ borderColor: "rgba(148,163,184,0.08)" }}
          >
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <ListeningOrb active={isListening} />
              <div className="min-w-0">
                <h3 className="text-xs md:text-sm font-semibold text-slate-200 truncate">
                  {isListening
                    ? "Listening to you…"
                    : isSpeaking
                      ? "AI is speaking…"
                      : "Your Response"}
                </h3>
                {isListening && (
                  <p className="text-[10px] md:text-xs text-cyan-500 mt-0.5 truncate">
                    Speak clearly — transcribing in real time
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {speechError && (
                <span className="text-[10px] md:text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                  {speechError}
                </span>
              )}
              {modeParam === "voice" && isRecording && (
                <span className="text-[10px] md:text-xs font-mono text-red-400 flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 animate-pulse">
                  <span
                    className="w-2 h-2 bg-red-500 rounded-full"
                    style={{ boxShadow: "0 0 6px rgba(239,68,68,0.8)" }}
                  />
                  {`${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, "0")}`}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 md:p-5 flex flex-col">
            {/* UNIFIED TEXTAREA FOR BOTH MODES */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={currentInput}
                onChange={handleInputChange}
                placeholder={
                  modeParam === "voice"
                    ? "Tap the mic to start recording… Your speech will appear here."
                    : "Type your answer here… Be specific, structured, and concise."
                }
                className="w-full p-3 md:p-4 pr-12 md:pr-14 rounded-xl resize-none focus:outline-none text-slate-200 placeholder-slate-600 font-mono text-xs md:text-sm leading-relaxed"
                style={{
                  background: "rgba(2,6,23,0.5)",
                  border: "1px solid rgba(148,163,184,0.08)",
                  minHeight: "160px",
                }}
                rows={6}
              />

              {/* Mic Button - Bottom Right for BOTH modes */}
              <button
                onClick={
                  modeParam === "voice" ? toggleRecording : toggleSpeechInput
                }
                disabled={aiIsThinking}
                className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2.5 md:p-3 rounded-full transition-all shadow-lg disabled:opacity-40 ${
                  (modeParam === "voice" && isRecording) ||
                  (modeParam === "text" && isListening)
                    ? modeParam === "voice"
                      ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                      : "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30"
                    : "bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/30"
                }`}
                title={
                  modeParam === "voice"
                    ? isRecording
                      ? "Stop recording"
                      : "Start recording"
                    : isListening
                      ? "Stop listening"
                      : "Speak to type"
                }
              >
                {modeParam === "voice" ? (
                  isRecording ? (
                    <Square className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )
                ) : isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Voice Waveform - Shows when listening in either mode */}
            {(modeParam === "text" || modeParam === "voice") && (
              <div
                className={`mt-3 flex items-center gap-3 transition-opacity duration-300 ${isListening ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <VoiceWaveform active={isListening} />
                <span className="text-[10px] md:text-xs text-cyan-500 font-medium">
                  {modeParam === "voice"
                    ? "Recording… tap mic to stop"
                    : "Speaking… click the mic or type to stop"}
                </span>
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-t"
            style={{ borderColor: "rgba(148,163,184,0.08)" }}
          >
            <button
              onClick={handleSkip}
              disabled={aiIsThinking}
              className="px-3 py-2 md:px-4 md:py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium disabled:opacity-40"
            >
              <SkipForward className="w-3.5 h-3.5 md:w-4 md:h-4" />{" "}
              <span className="hidden sm:inline">Skip</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={
                (!currentInput.trim() && !isRecording) ||
                aiIsThinking ||
                !currentQ
              }
              className="px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-semibold text-white flex items-center gap-1.5 md:gap-2 text-xs md:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: aiIsThinking
                  ? "rgba(124,58,237,0.3)"
                  : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: aiIsThinking
                  ? "none"
                  : "0 0 20px rgba(124,58,237,0.3)",
              }}
            >
              {aiIsThinking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                  <span>AI evaluating…</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {showEndConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(2,6,23,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="rounded-2xl max-w-md w-full p-6 text-center border"
            style={{
              background: "rgba(15,23,42,0.95)",
              borderColor: "rgba(148,163,184,0.12)",
              boxShadow: "0 0 60px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Flag className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              End Interview Session?
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {status === "active"
                ? "Your progress will be saved and you'll receive a detailed scorecard."
                : "Time is up! View your full results and performance breakdown."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-5 py-2.5 rounded-xl text-slate-300 font-medium transition border border-slate-700 hover:bg-slate-800"
              >
                Continue
              </button>
              <button
                onClick={confirmEndAndRedirect}
                className="px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 transition"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  boxShadow: "0 0 20px rgba(220,38,38,0.3)",
                }}
              >
                End & View Results <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
