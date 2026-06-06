"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronRight,
  Play,
  CheckCircle,
  Zap,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  Star,
  Mic,
  MessageSquare,
  TrendingUp,
  Brain,
  Sparkles,
  Rocket,
  Target,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preloaderText, setPreloaderText] = useState("");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );

  const fullText = "AI Mock Interviews Engineered for real-world hiring.";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setPreloaderText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );

    const sections = document.querySelectorAll("[data-animate]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-zinc-950 flex items-center justify-center overflow-hidden">
        {}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[150px] animate-pulse"></div>
          <div
            className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/20 rounded-full blur-[150px] animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center space-y-8">
          {}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-2 border-cyan-500/30 animate-spin-slow-reverse"></div>
            <div className="absolute inset-8 rounded-full border-2 border-violet-400/20 animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-2xl shadow-violet-500/50 flex items-center justify-center animate-pulse">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <div className="h-8 flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {preloaderText}
              </span>
              <span className="inline-block w-0.5 h-6 bg-violet-400 ml-1 animate-blink"></span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
          .animate-spin-slow-reverse { animation: spin-slow 12s linear infinite reverse; }
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          .animate-blink { animation: blink 0.8s infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30">
      {}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>

      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      {}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                PrepAI
              </span>
            </Link>

            {}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-zinc-400 hover:text-zinc-100 transition font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-zinc-400 hover:text-zinc-100 transition font-medium"
              >
                How it Works
              </a>
              <a
                href="#testimonials"
                className="text-zinc-400 hover:text-zinc-100 transition font-medium"
              >
                Reviews
              </a>
              <div className="flex items-center gap-3 ml-4">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-zinc-300 hover:text-zinc-100 font-medium transition"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-zinc-800/50 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-4 py-4 space-y-3 shadow-2xl">
            <a
              href="#features"
              className="block py-2 text-zinc-300 hover:text-zinc-100 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block py-2 text-zinc-300 hover:text-zinc-100 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#testimonials"
              className="block py-2 text-zinc-300 hover:text-zinc-100 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </a>
            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="w-full py-2 text-center text-zinc-300 hover:text-zinc-100 font-medium border border-zinc-700 rounded-xl"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="w-full py-2 text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> Trusted by 50,000+ job seekers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Ace your next interview with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 animate-gradient">
                AI-powered
              </span>{" "}
              practice
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
              Simulate real interviews, get instant feedback on your answers,
              and track your progress. Turn nervous energy into confident
              performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5"
              >
                Start Practicing Free{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-2 px-6 py-3.5 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800/50 hover:border-zinc-600 transition-all font-semibold">
                <Play className="w-4 h-4 fill-zinc-300" /> Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-zinc-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-2 border-zinc-950"
                  ></div>
                ))}
              </div>
              <p className="font-medium">Join 10,000+ users practicing daily</p>
            </div>
          </div>

          {}
          <div className="relative animate-float">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-3xl blur-3xl opacity-50"></div>
            <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">
              <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-2 text-xs text-zinc-500 font-medium">
                  InterviewAI Dashboard
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-4 w-2/3 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl border border-violet-500/20 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-violet-400" />
                  </div>
                  <div className="h-20 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl border border-cyan-500/20 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="h-32 bg-zinc-800/30 rounded-xl border border-zinc-700/50 flex items-center justify-center">
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 bg-gradient-to-t from-violet-500 to-cyan-500 rounded-t"
                        style={{ height: `${30 + i * 15}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg"></div>
                  <div className="h-8 w-24 bg-zinc-800 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section
        id="stats"
        data-animate
        className={`py-16 border-y border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm transition-all duration-1000 ${visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Mock Interviews", value: "50K+", icon: Mic },
              {
                label: "Avg. Score Improvement",
                value: "+32%",
                icon: TrendingUp,
              },
              { label: "Active Users", value: "10K+", icon: Users },
              { label: "Industries Covered", value: "25+", icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="space-y-2 group">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section
        id="features"
        data-animate
        className={`py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-1000 ${visibleSections.has("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Everything you need to land the job
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Our AI adapts to your industry, experience level, and target role to
            deliver realistic, high-impact practice sessions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Realistic AI Interviews",
              desc: "Voice & text-based simulations that mirror real company interview styles and difficulty levels.",
            },
            {
              icon: BarChart3,
              title: "Instant Performance Feedback",
              desc: "Get detailed breakdowns of your communication, technical accuracy, and confidence scores.",
            },
            {
              icon: CheckCircle,
              title: "Customizable Practice Modes",
              desc: "Choose behavioral, technical, system design, or case interview formats tailored to your goal.",
            },
            {
              icon: TrendingUp,
              title: "Progress Tracking",
              desc: "Visual dashboards show your improvement over time with actionable insights.",
            },
            {
              icon: Shield,
              title: "Privacy & Security First",
              desc: "Your recordings and data are encrypted. Never used for training without explicit consent.",
            },
            {
              icon: Users,
              title: "Industry-Specific Question Banks",
              desc: "Curated prompts for Tech, Finance, Healthcare, Consulting, and more.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all">
                <feature.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {}
      <section
        id="how-it-works"
        data-animate
        className={`py-20 bg-zinc-900/30 backdrop-blur-sm border-y border-zinc-800/50 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visibleSections.has("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              How it works
            </h2>
            <p className="text-zinc-400">
              Get interview-ready in 3 simple steps. No setup, no scheduling,
              just practice.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>

            {[
              {
                step: "01",
                title: "Pick Your Target Role",
                desc: "Select industry, seniority, and interview type. Our AI configures the difficulty instantly.",
                icon: Target,
              },
              {
                step: "02",
                title: "Practice with AI",
                desc: "Answer questions via voice or text. The AI asks follow-ups just like a real human interviewer.",
                icon: MessageSquare,
              },
              {
                step: "03",
                title: "Review & Improve",
                desc: "Get a scorecard, transcript, and personalized tips. Repeat until you're ready.",
                icon: Rocket,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800 hover:border-violet-500/30 transition-all duration-300 text-center group hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4 relative z-10 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Ready to crush your next interview?
            </h2>
            <p className="text-zinc-400 text-lg">
              Join thousands of candidates who turned anxiety into offers. Start
              practicing for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5"
              >
                Create Free Account
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-zinc-800/50 border border-zinc-700 text-zinc-300 font-semibold rounded-xl hover:bg-zinc-800 hover:border-zinc-600 transition-all"
              >
                Log In to Dashboard
              </Link>
            </div>
            <p className="text-sm text-zinc-500 pt-2">
              No credit card required • 3 free interviews/month
            </p>
          </div>
        </div>
      </section>

      {}
      <footer className="bg-zinc-900/30 border-t border-zinc-800/50 pt-16 pb-8 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              AI-powered interview practice platform helping job seekers succeed
              globally.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Enterprise", "API"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"],
            },
            {
              title: "Legal",
              links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-zinc-100 mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} InterviewAI. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-zinc-500 hover:text-zinc-300 transition text-sm font-medium"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
