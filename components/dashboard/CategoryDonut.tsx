"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardStats } from "./useDashboardStats";
import SectionCard from "./ui/SectionCard";

// Consistent palette keyed off the listing status name.
const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "#00805A",
  ACTIVE: "#01B574",
  DRAFT: "#4A4A4A",
  SOLD: "#4481EB",
  UNDER_OFFER: "#A855F7",
  ARCHIVED: "#64748B",
  SUSPENDED: "#EF4444",
};
const FALLBACK = ["#00805A", "#4481EB", "#A855F7", "#F59E0B", "#64748B", "#01B574"];

function label(name: string) {
  return name
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = entry?.payload?.__total ?? entry.value;
  return (
    <div className="bg-bglight border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white text-sm font-medium">
        {label(entry.name)}
      </p>
      <p className="text-lighttext text-xs">{entry.value} listings</p>
    </div>
  );
}

/** Real distribution of listings by status. */
export default function CategoryDonut() {
  const { data, loading } = useDashboardStats();
  const breakdown = data?.listingStatusBreakdown ?? [];
  const total = breakdown.reduce((sum, b) => sum + b.value, 0);

  const withColors = breakdown.map((b, i) => ({
    ...b,
    fill: STATUS_COLORS[b.name] ?? FALLBACK[i % FALLBACK.length],
  }));

  return (
    <SectionCard title="Listings by Status" subtitle="Current distribution">
      {loading ? (
        <div className="h-[220px] w-full bg-white/5 rounded-xl animate-pulse" />
      ) : breakdown.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-lighttext/40 text-sm">
          No listings yet
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={withColors}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {withColors.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-white text-2xl font-bold leading-none">
                {total.toLocaleString()}
              </p>
              <p className="text-lighttext/50 text-xs mt-1">Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
            {withColors.map((b) => (
              <div key={b.name} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.fill }}
                />
                <span className="text-lighttext/80 text-xs truncate flex-1">
                  {label(b.name)}
                </span>
                <span className="text-white text-xs font-medium">
                  {b.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
