"use client";

import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useDashboardStats } from "./useDashboardStats";
import SectionCard from "./ui/SectionCard";

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        up ? "text-[#01B574]" : "text-red-400"
      }`}
    >
      {up ? <FaArrowUp className="w-2.5 h-2.5" /> : <FaArrowDown className="w-2.5 h-2.5" />}
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

/**
 * Replaces the old "Daily Traffic" widget. There is no visitor/session
 * tracking in the schema, so this honestly shows today's real signups &
 * listings versus yesterday.
 */
export default function TodayActivity() {
  const { data, loading } = useDashboardStats();
  const t = data?.today;

  const signupDelta =
    t && t.yesterdaySignups > 0
      ? Math.round(((t.signups - t.yesterdaySignups) / t.yesterdaySignups) * 100)
      : t && t.signups > 0
      ? 100
      : 0;
  const listingDelta =
    t && t.yesterdayListings > 0
      ? Math.round(((t.listings - t.yesterdayListings) / t.yesterdayListings) * 100)
      : t && t.listings > 0
      ? 100
      : 0;

  return (
    <SectionCard title="Today's Activity" subtitle="vs yesterday">
      {loading ? (
        <div className="space-y-4">
          <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-lighttext/50 text-xs font-medium">
                New Signups
              </p>
              <p className="text-white text-2xl font-bold mt-0.5">
                {t?.signups ?? 0}
              </p>
            </div>
            <Delta value={signupDelta} />
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-lighttext/50 text-xs font-medium">
                New Listings
              </p>
              <p className="text-white text-2xl font-bold mt-0.5">
                {t?.listings ?? 0}
              </p>
            </div>
            <Delta value={listingDelta} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
