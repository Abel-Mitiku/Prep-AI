"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";

type HistoryItem = {
  id: string;
  role: string;
  type: string;
  date: string;
  duration: number | null;
  score: number;
  status: "Excellent" | "Good" | "Needs Work";
  sessionStatus: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        router.push("/auth/login");
      }
    }
    checkSession();
  }, [router]);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateFilter !== "all" && { dateRange: dateFilter }),
      });

      const res = await fetch(`/api/dashboard/history/${userId}?${params}`);
      const json = await res.json();

      if (json.success) {
        setHistory(json.data.interviews);
        setPagination(json.data.pagination);
      } else {
        throw new Error(json.error || "Failed to fetch history");
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Could not load interview history");
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    pagination.page,
    pagination.limit,
    searchQuery,
    statusFilter,
    dateFilter,
  ]);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [fetchHistory, userId]);

  useEffect(() => {
    if (pathname !== "/dashboard/history") return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      router.replace(`/dashboard/history?${params.toString()}`, {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, router, searchParams, pathname]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleExport = () => {
    if (history.length === 0) return;

    const headers = [
      "Date",
      "Role",
      "Type",
      "Duration (min)",
      "Score",
      "Status",
    ];
    const rows = history.map((item) => [
      item.date,
      item.role,
      item.type,
      item.duration?.toString() || "N/A",
      `${item.score}%`,
      item.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case "Good":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]";
      case "Needs Work":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-cyan-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
          </div>
          <p className="text-zinc-400 font-medium tracking-wide">
            Loading your interview history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30 relative overflow-hidden">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      {}
      <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 px-4 md:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl transition border border-transparent hover:border-zinc-700"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Interview History
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                {pagination.total} interviews • Page {pagination.page} of{" "}
                {pagination.totalPages || 1}
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={history.length === 0}
            className="px-4 py-2 text-sm font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg shadow-black/20"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 z-10">
        {}
        {error && (
          <div className="bg-rose-500/5 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
            <button
              onClick={() => {
                setError(null);
                fetchHistory();
              }}
              className="ml-auto text-sm font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800 p-4 md:p-6 mb-6 shadow-xl hover:border-zinc-700 transition-all">
          <div className="flex flex-col md:flex-row gap-4">
            {}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            {}
            <div className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-1.5 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all">
              <Filter className="w-4 h-4 text-zinc-500" />
              <select
                title="filter-interviews"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-zinc-100 focus:outline-none appearance-none cursor-pointer py-2 pr-6"
              >
                <option value="all" className="bg-zinc-900">
                  All Statuses
                </option>
                <option value="Excellent" className="bg-zinc-900">
                  Excellent
                </option>
                <option value="Good" className="bg-zinc-900">
                  Good
                </option>
                <option value="Needs Work" className="bg-zinc-900">
                  Needs Work
                </option>
              </select>
            </div>

            {}
            <div className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-1.5 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <select
                title="filter-interviews"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-sm text-zinc-100 focus:outline-none appearance-none cursor-pointer py-2 pr-6"
              >
                <option value="all" className="bg-zinc-900">
                  All Time
                </option>
                <option value="7" className="bg-zinc-900">
                  Last 7 Days
                </option>
                <option value="30" className="bg-zinc-900">
                  Last 30 Days
                </option>
                <option value="90" className="bg-zinc-900">
                  Last 90 Days
                </option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden relative">
          {}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-800/30 animate-pulse"
                >
                  <div className="h-4 bg-zinc-700 rounded-full w-1/4"></div>
                  <div className="h-4 bg-zinc-700 rounded-full w-1/6"></div>
                  <div className="h-4 bg-zinc-700 rounded-full w-1/6"></div>
                  <div className="h-4 bg-zinc-700 rounded-full w-1/12"></div>
                  <div className="h-2 bg-zinc-700 rounded-full w-1/6"></div>
                  <div className="h-6 bg-zinc-700 rounded-full w-20"></div>
                  <div className="h-8 bg-zinc-700 rounded-full w-16 ml-auto"></div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-zinc-500 text-xs uppercase tracking-widest font-semibold border-b border-zinc-800/50">
                  <tr>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Type</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Duration</th>
                    <th className="px-6 py-5">Score</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {history.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-800/30 transition-all group relative"
                      style={{ animation: `fadeInUp 0.4s ease-out both` }}
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors">
                          {item.role}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-zinc-400 capitalize bg-zinc-800/50 px-2.5 py-1 rounded-lg border border-zinc-700/50">
                          {item.type?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="w-4 h-4 text-zinc-600" />
                          {item.date}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Clock className="w-4 h-4 text-zinc-600" />
                          {item.duration !== null
                            ? `${item.duration} min`
                            : "N/A"}
                        </div>
                      </td>

                      {}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5 w-16">
                            {[...Array(10)].map((_, si) => {
                              const isFilled = si < Math.round(item.score / 10);
                              let colorClass = "bg-zinc-800";
                              if (isFilled) {
                                if (item.score >= 80)
                                  colorClass =
                                    "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]";
                                else if (item.score >= 60)
                                  colorClass =
                                    "bg-violet-400 shadow-[0_0_4px_rgba(167,139,250,0.5)]";
                                else
                                  colorClass =
                                    "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]";
                              }
                              return (
                                <div
                                  key={si}
                                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${colorClass}`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-sm font-bold text-zinc-100 font-mono w-8">
                            {item.score}%
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            router.push(`/session/summary?sessionId=${item.id}`)
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500 border border-violet-500/20 hover:border-violet-500 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-zinc-800/50 blur-xl"></div>
                <div className="relative w-full h-full rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-zinc-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "No interviews match your filters"
                  : "No interview history yet"}
              </h3>
              <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start your first AI interview to begin tracking your progress!"}
              </p>
              {searchQuery || statusFilter !== "all" || dateFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500 border border-violet-500/20 hover:border-violet-500 rounded-xl transition-all"
                >
                  Clear all filters
                </button>
              ) : (
                <Link
                  href="/session/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-xl shadow-violet-500/20 hover:-translate-y-0.5"
                >
                  Start New Interview
                </Link>
              )}
            </div>
          )}
        </div>

        {}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 px-2">
            <p className="text-sm text-zinc-500 font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </p>
            <div className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-1.5 rounded-2xl">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all ${
                          pagination.page === pageNum
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
