import { IconType } from "react-icons";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: IconType;
  /** Month-over-month delta percentage. Omit when not applicable. */
  delta?: number;
  loading?: boolean;
}

/**
 * A single metric tile: icon chip, label, big value, and a real
 * month-over-month delta (green up / red down).
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  loading = false,
}: StatCardProps) {
  const isUp = (delta ?? 0) >= 0;

  return (
    <div className="bg-bgdark/80 backdrop-blur-sm border border-white/5 rounded-2xl p-4 sm:p-5 transition-colors hover:border-greencolor/30">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-greencolor/15 border border-greencolor/20 flex items-center justify-center">
          <Icon className="text-xl sm:text-2xl text-greencolor" />
        </div>

        {typeof delta === "number" && !loading && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isUp
                ? "text-[#01B574] bg-[#01B574]/10"
                : "text-red-400 bg-red-400/10"
            }`}
          >
            {isUp ? (
              <FaArrowUp className="w-2.5 h-2.5" />
            ) : (
              <FaArrowDown className="w-2.5 h-2.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {loading ? (
            <span className="inline-block w-16 h-7 rounded bg-white/10 animate-pulse" />
          ) : (
            typeof value === "number" ? value.toLocaleString() : value
          )}
        </p>
        <p className="text-lighttext/60 text-sm font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}
