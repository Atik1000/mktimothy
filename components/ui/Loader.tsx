/**
 * Shared loading components for the whole app.
 *
 * Replaces the dozens of inline "Loading..." text strings with consistent,
 * branded loaders that match the dark + green theme.
 *
 *   <Spinner />            → small inline spinner (buttons, inline)
 *   <FullPageLoader />     → full-screen loader (route/auth/loading screens)
 *   <SectionLoader />      → in-section loader (tables, lists, panels)
 */

interface SpinnerProps {
  /** Tailwind size class for width/height, e.g. "w-5 h-5". */
  size?: string;
  className?: string;
}

/** A small circular spinner using the brand-green accent. */
export function Spinner({ size = "w-5 h-5", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${size} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface FullPageLoaderProps {
  /** Optional message shown under the spinner. */
  message?: string;
  /** Use `bgdark` instead of `bglight` for pages that sit on the lighter surface. */
  variant?: "bglight" | "bgdark";
  className?: string;
}

/** Full-screen loader used for auth checks, route guards, and loading screens. */
export function FullPageLoader({
  message,
  variant = "bglight",
  className = "",
}: FullPageLoaderProps) {
  const overlayClass = variant === "bgdark" ? "bg-bgdark/30" : "bg-bglight/30";
  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed ${className}`}
    >
      {/* Semi-transparent overlay so the flag shows through faintly */}
      <div className={`absolute inset-0 ${overlayClass}`} />
      
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Pulsing brand ring + spinner */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-greencolor/10 blur-md" />
          <span className="absolute inset-0 rounded-full border-2 border-greencolor/20" />
          <span className="absolute inset-0 rounded-full border-t-2 border-greencolor animate-spin" />
        </div>
        <p className="text-lighttext/60 text-sm font-medium animate-pulse">
          {message || "Loading..."}
        </p>
      </div>
    </div>
  );
}

interface SectionLoaderProps {
  message?: string;
  /** Height of the loader container. */
  height?: string;
}

/** In-section loader for tables, lists, panels, etc. */
export function SectionLoader({
  message,
  height = "h-64",
}: SectionLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${height}`}
    >
      <Spinner size="w-7 h-7" className="text-greencolor" />
      {message && (
        <p className="text-lighttext/50 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export default Spinner;

