"use client";

import dynamic from "next/dynamic";

// Dynamically import the Tailwind start component
const StartTailwind = dynamic(
  () => import("@/components/investors/StartTailwind"),
  { ssr: false },
);

export default function InvestorsPage() {
  return <StartTailwind />;
}

