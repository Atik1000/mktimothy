"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Shared step wrapper — lifted verbatim from the investor FormTailwind.
 *
 * The originals split this into two pieces:
 *   1. The progress bar (rendered by the page wrapper around the form body)
 *   2. The inner step (title + options grid + Previous/Next nav)
 *
 * We export both, so each consumer can match the originals' exact layout:
 *   <QuestionPageProgress currentStep totalSteps />   // page-level
 *   <QuestionPageInner title subtitle ...>...</QuestionPageInner>  // step-level
 *
 * For convenience we also export <QuestionPage> which renders both together
 * inside the standard `max-w-2xl` page container — used by the onboarding
 * flows whose pages are self-contained.
 */

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const QuestionPageProgress = ({
  currentStep,
  totalSteps,
}: ProgressProps) => (
  <div className="text-center mb-8">
    <p className="text-[#e4c273]/60 text-sm uppercase tracking-wider mb-3">
      Question {Math.min(currentStep, totalSteps)}/{totalSteps}
    </p>
    <div className="w-full max-w-xs mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#C29F5D] to-[#e4c273] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(194,159,93,0.4)]"
        style={{
          width: `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%`,
        }}
      />
    </div>
  </div>
);

interface QuestionPageInnerProps {
  /** Optional — render your own title inside children if omitted. */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  gridCols?: string;
  /** Override the "Next" label (e.g. "Continue"). */
  nextLabel?: string;
  /** When true (default), the options grid wraps `children`. Set false when
   *  children render their own layout (e.g. detail page with mixed inputs). */
  wrapGrid?: boolean;
}

export const QuestionPageInner = ({
  title,
  subtitle,
  children,
  onPrevious,
  onNext,
  canGoNext = true,
  gridCols = "grid-cols-2 sm:grid-cols-3",
  nextLabel = "Next",
  wrapGrid = true,
}: QuestionPageInnerProps) => (
  <>
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#e4c273]/80 text-sm italic mt-2">{subtitle}</p>
      )}
    </div>

    {wrapGrid ? (
      <div className={`grid ${gridCols} gap-3 mb-8`}>{children}</div>
    ) : (
      <div className="mb-8">{children}</div>
    )}

    <div className="flex items-center justify-center gap-4">
      {onPrevious && (
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-6 py-3 text-[#e4c273]/70 hover:text-[#e4c273] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm
            transition-all duration-300
            ${
              canGoNext
                ? "bg-[#e4c273] text-white hover:bg-[#f0d08a]"
                : "bg-[#e4c273]/30 text-white/50 cursor-not-allowed"
            }
          `}
        >
          {nextLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  </>
);

interface QuestionPageProps extends QuestionPageInnerProps {
  /** Render the page-level progress bar above the step. */
  showProgress?: boolean;
  /** Outer container max-width (matches originals' `max-w-2xl`). */
  className?: string;
}

export const QuestionPage = ({
  currentStep,
  totalSteps,
  showProgress = true,
  className = "max-w-2xl w-full mx-auto px-4 py-6",
  ...inner
}: QuestionPageProps) => (
  <div className={className}>
    {showProgress && currentStep && totalSteps ? (
      <QuestionPageProgress currentStep={currentStep} totalSteps={totalSteps} />
    ) : null}
    <QuestionPageInner {...inner} />
  </div>
);
