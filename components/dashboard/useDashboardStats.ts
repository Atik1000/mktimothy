"use client";

import { useEffect, useState } from "react";

export interface DashboardStats {
  totals: {
    users: number;
    listings: number;
    admins: number;
    blogs: number;
    pendingApprovals: number;
  };
  deltas: {
    users: number;
    listings: number;
    blogs: number;
    pendingApprovals: number;
  };
  monthlyTrend: Array<{ month: string; users: number; listings: number }>;
  weeklyActivity: Array<{ day: string; listings: number; users: number }>;
  today: {
    signups: number;
    listings: number;
    yesterdaySignups: number;
    yesterdayListings: number;
  };
  listingStatusBreakdown: Array<{ name: string; value: number }>;
  topCategories: Array<{ name: string; count: number }>;
}

/**
 * Fetches the consolidated admin dashboard stats from
 * /api/admin/dashboard-stats using the same auth-token pattern the rest of
 * the dashboard uses (localStorage/sessionStorage "auth-token").
 */
export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const token =
          localStorage.getItem("auth-token") ||
          sessionStorage.getItem("auth-token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();
        if (!cancelled && json.success && json.data) {
          setData(json.data as DashboardStats);
        } else if (!cancelled) {
          setError("Failed to load stats");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
