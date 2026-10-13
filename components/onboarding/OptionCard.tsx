"use client";

import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

/**
 * Shared option card — lifted verbatim from the investor FormTailwind.
 * Centered icon-card layout with a top-right check badge when selected.
 * Used by all multi-step forms (investor, pitch-idea, onboarding) so they
 * can never drift apart visually.
 */

interface OptionCardProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  selected: boolean;
  onChange: () => void;
  onNext?: () => void;
}

export const OptionCard = ({
  label,
  description,
  icon,
  selected,
  onChange,
}: OptionCardProps) => (
  <label
    className={`
      relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer
      border-2 transition-all duration-200 group min-h-[100px] text-center
      ${
        selected
          ? "border-[#e4c273] bg-[#e4c273]/10 shadow-lg shadow-[#e4c273]/20"
          : "border-[#e4c273]/20 bg-white/5 hover:border-[#e4c273]/50 hover:bg-white/10"
      }
    `}
  >
    <input
      type="radio"
      className="sr-only"
      checked={selected}
      onChange={onChange}
    />

    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e4c273] flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-white" />
      </div>
    )}

    <div
      className={`
        w-12 h-12 rounded-full flex items-center justify-center mb-2
        ${selected ? "bg-[#e4c273]/20 text-[#e4c273]" : "bg-white/10 text-[#e4c273]/70 group-hover:text-[#e4c273]"}
        transition-all duration-200
      `}
    >
      {icon}
    </div>

    <span
      className={`
        text-xs font-semibold mb-1
        ${selected ? "text-[#e4c273]" : "text-gray-200 group-hover:text-white"}
      `}
    >
      {label}
    </span>
    {description && (
      <span
        className={`
          text-[11px] leading-tight
          ${selected ? "text-[#e4c273]/80" : "text-gray-400 group-hover:text-gray-300"}
        `}
      >
        {description}
      </span>
    )}
  </label>
);
