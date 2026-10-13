"use client";

import {
  Bar,
  BarChart,
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

/** Real weekly signups & listings activity (Sun–Sat of the current week). */
export default function WeeklyListings() {
  const { data, loading } = useDashboardStats();
  const weekly = data?.weeklyActivity ?? [];

  return (
    <SectionCard
      title="Weekly Activity"
      subtitle="Signups & listings this week"
      action={
        <span className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-lighttext/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
          This week
        </span>
      }
    >
      {loading ? (
        <div className="h-[220px] w-full bg-white/5 rounded-xl animate-pulse" />
      ) : (
        <div className="h-[220px] w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekly}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                iconType="circle"
              />
              <Bar dataKey="users" fill="#00805A" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="listings" fill="#4481EB" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
