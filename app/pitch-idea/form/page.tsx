"use client";

import dynamic from "next/dynamic";

// Dynamically import the form component
const FormTailwind = dynamic(
  () => import("@/components/pitch-idea/FormTailwind") as any,
  { ssr: false },
);

export default function PitchIdeaFormPage() {
  return <FormTailwind />;
}

