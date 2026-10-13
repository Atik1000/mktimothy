"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStats } from "./useDashboardStats";
import SectionCard from "./ui/SectionCard";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bglight border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-lighttext/70 text-xs mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white font-medium capitalize">
            {entry.dataKey}:
          </span>
          <span className="text-lighttext">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Real users-vs-listings trend over the last 6 months. */
export default function LargeChart() {
  const { data, loading } = useDashboardStats();
  const trend = data?.monthlyTrend ?? [];

  // Month-over-month delta for listings (the headline metric).
  const lastTwo = trend.slice(-2);
  const delta =
    lastTwo.length === 2 && lastTwo[0].listings > 0
      ? Math.round(
          ((lastTwo[1].listings - lastTwo[0].listings) / lastTwo[0].listings) *
            100
        )
      : 0;

  return (
    <SectionCard
      title="Overview"
      subtitle="Users & listings over the last 6 months"
      className="xl:col-span-2"
      action={
        <span className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-lighttext/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
          Last 6 months
        </span>
      }
    >
      {loading ? (
        <div className="h-[260px] flex items-center justify-center">
          <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-6 mb-4">
            <div>
              <p className="text-lighttext/50 text-xs font-medium">
                Total this month
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white text-2xl sm:text-3xl font-bold leading-none">
                  {lastTwo[1]?.listings?.toLocaleString() ?? 0}
                </p>
                <span
                  className={`text-xs font-bold ${
                    delta >= 0 ? "text-[#01B574]" : "text-red-400"
                  }`}
                >
                  {delta >= 0 ? "+" : ""}
                  {delta}%
                </span>
              </div>
              <p className="text-lighttext/40 text-[11px] mt-0.5">
                New listings vs last month
              </p>
            </div>
          </div>

          <div className="h-[220px] sm:h-[240px] w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00805A" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00805A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="listingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4481EB" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4481EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(198,202,214,0.5)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  stroke="rgba(198,202,214,0.5)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#00805A"
                  strokeWidth={2.5}
                  fill="url(#usersGrad)"
                  dot={{ r: 3, fill: "#00805A", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="listings"
                  stroke="#4481EB"
                  strokeWidth={2.5}
                  fill="url(#listingsGrad)"
                  dot={{ r: 3, fill: "#4481EB", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </SectionCard>
  );
}
