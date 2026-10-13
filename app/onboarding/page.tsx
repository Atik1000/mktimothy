"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import InvestorFlow from "@/components/onboarding/InvestorFlow";
import EntrepreneurFlow from "@/components/onboarding/EntrepreneurFlow";
import LightRays from "@/components/investors/LightRays";

/**
 * /onboarding
 *
 * Shown to brand-new Google-first-login users to collect the full
 * questionnaire that the manual investor/pitch-idea forms collect, plus
 * contact details. The flow is chosen by the calling portal:
 *   - investors-login / investors-signup → ?flow=investor (InvestorProfile)
 *   - login / sign-up                    → ?flow=entrepreneur (PitchIdea)
 *
 * Reached because the auth-provider sees onboardingComplete === false and
 * redirects here with the appropriate ?flow=.
 */

function OnboardingInner() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // ?flow=investor | entrepreneur. Default from user role if missing.
  const flowParam = searchParams.get("flow");
  const flow: "investor" | "entrepreneur" =
    flowParam === "investor"
      ? "investor"
      : flowParam === "entrepreneur"
        ? "entrepreneur"
        : user?.role === "INVESTOR"
          ? "investor"
          : "entrepreneur";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && (user as any).onboardingComplete) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (data: {
    questions: Array<{ number: number; answer: string }>;
    user: Record<string, string>;
  }) => {
    setSubmitting(true);
    setServerError("");
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token") ||
        "";
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flow, ...data }),
      });
      const result = await res.json();
      if (result.success) {
        // Hard reload so the auth-provider re-verifies and clears the gate.
        window.location.href = "/";
      } else {
        setServerError(result.error || "Could not save your details.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white/70">Loading…</div>
      </div>
    );
  }

  const defaultName = user
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "";
  const defaultEmail = user?.email || "";

  return (
    <div
      className="min-h-screen relative font-helvetica overflow-y-auto flex flex-col bg-cover bg-center bg-no-repeat py-10 pt-20"
      style={{ backgroundImage: "url('/images/background2.png')" }}
    >
      {/* Animated light rays overlay — matches /investors/form and /pitch-idea/form */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full mix-blend-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#D1A54F"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays w-full h-full opacity-40"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      <div className="relative z-10 min-h-[calc(100dvh_-_120px)] flex flex-col items-center w-full justify-center">
        {serverError && (
          <div className="mb-4 max-w-md w-full mx-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-4 py-2">
            {serverError}
          </div>
        )}

        {/* Each flow renders its own per-page cards (matching the originals:
            question pages have no card, detail uses max-w-xl p-6, signup
            uses max-w-md p-6 with the logo inside). */}
        {flow === "investor" ? (
          <InvestorFlow
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <EntrepreneurFlow
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  // useSearchParams must be inside a Suspense boundary.
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white/70">Loading…</div>
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
