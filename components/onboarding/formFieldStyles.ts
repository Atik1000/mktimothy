/**
 * Shared form-field styling tokens — lifted verbatim from the investor /
 * pitch-idea FormTailwind components. Each form has its own field style;
 * rather than maintaining a fourth approximation, the onboarding flows
 * import these so they match the originals pixel-for-pixel.
 */

/* ── Field class variants ────────────────────────────────────────── */

/** Pitch-idea inline question pages (text/select/textarea). */
export const fieldInlinePitch =
  "w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none";

/** Investor page-6 detail inputs. */
export const fieldInvDetail =
  "w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300";

/** Signup-page input (both forms). Pass an error flag to render red border. */
export const fieldSignup = (hasError?: boolean) =>
  `w-full px-3 py-2.5 bg-transparent border rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300 ${
    hasError ? "border-red-500" : "border-[#C29F5D]/70"
  }`;

/** Textareas add `resize-none`. */
export const textareaInlinePitch = `${fieldInlinePitch} resize-none`;

/* ── Select appearance ───────────────────────────────────────────── */

/** Investor selects use the native arrow (no `appearance-none`, no chevron). */
export const selectInvDetail = `${fieldInvDetail} [&>option]:bg-black [&>option]:text-white`;
export const selectInvSignup = (hasError?: boolean) => `${fieldSignup(hasError)} [&>option]:bg-black [&>option]:text-white`;

/** Inline-style style attribute for pitch selects (the `#e4c273` chevron). */
export const selectChevronInline = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: "right 0.5rem center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "1.5em 1.5em",
} as const;

/** Pitch signup "How did you hear about us?" chevron (`#C29F5D` variant). */
export const selectChevronSignup = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C29F5D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: "right 0.5rem center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "1.5em 1.5em",
} as const;

/** Pitch-style inline select: appearance-none + the `#e4c273` chevron. */
export const selectInlinePitchClass =
  "w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative [&>option]:bg-black [&>option]:text-white";

/* ── Labels ──────────────────────────────────────────────────────── */

/** Inline pitch-idea labels (uppercase gold). */
export const labelInlinePitch = "text-xs text-[#e4c273] font-medium tracking-wide uppercase";

/** Investor detail + both signup labels. */
export const labelBlock = "block text-xs text-white/70 mb-1.5";
