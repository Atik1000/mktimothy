import { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  /** Padding control — default keeps the standard inner spacing. */
  padding?: "default" | "tight" | "none";
}

/**
 * The standard rounded container used across the admin dashboard.
 * Dark surface, subtle border, soft shadow — matches the brand dark theme.
 */
export default function DashboardCard({
  children,
  className = "",
  padding = "default",
}: DashboardCardProps) {
  const pad =
    padding === "none"
      ? ""
      : padding === "tight"
      ? "p-4 sm:p-5"
      : "p-4 sm:p-6";

  return (
    <div
      className={`bg-bgdark/80 backdrop-blur-sm border border-white/5 rounded-2xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] ${pad} ${className}`}
    >
      {children}
    </div>
  );
}
