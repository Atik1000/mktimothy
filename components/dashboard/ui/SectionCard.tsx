import { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  /** Optional pill/badge rendered at the top-right of the header. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * A titled container for chart/section content. Provides a consistent
 * header (title + subtitle + optional action) above a flexible body.
 */
export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: SectionCardProps) {
  return (
    <div
      className={`bg-bgdark/80 backdrop-blur-sm border border-white/5 rounded-2xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] p-4 sm:p-6 flex flex-col ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-white text-lg sm:text-xl font-bold leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-lighttext/50 text-xs sm:text-sm mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
