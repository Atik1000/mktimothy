interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Maps a status string to a colour treatment (bg / text) for consistent
// status pills across the admin tables. Falls back to neutral styling.
const STATUS_STYLES: Record<string, string> = {
  // Listing statuses
  PUBLISHED: "bg-[#01B574]/15 text-[#01B574] border-[#01B574]/20",
  ACTIVE: "bg-[#01B574]/15 text-[#01B574] border-[#01B574]/20",
  DRAFT: "bg-white/10 text-lighttext/70 border-white/15",
  SOLD: "bg-[#4481EB]/15 text-[#4481EB] border-[#4481EB]/20",
  UNDER_OFFER: "bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/20",
  ARCHIVED: "bg-white/10 text-lighttext/50 border-white/10",
  SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/20",
  INACTIVE: "bg-white/10 text-lighttext/50 border-white/10",
  // Approval
  APPROVED: "bg-[#01B574]/15 text-[#01B574] border-[#01B574]/20",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/20",
};

function label(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A small colour-coded status pill used across the admin tables. */
export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status?.toUpperCase?.()] ?? STATUS_STYLES.DRAFT;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${styles} ${className}`}
    >
      {label(status || "")}
    </span>
  );
}
