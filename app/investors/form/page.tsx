"use client";

import dynamic from "next/dynamic";

// Dynamically import the Tailwind form component
const FormTailwind = dynamic(
  () => import("@/components/investors/FormTailwind"),
  { ssr: false },
);

export default function InvestorsFormPage() {
  return <FormTailwind />;
}

