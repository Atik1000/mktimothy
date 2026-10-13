"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import toast from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabKey = "general" | "entrepreneur" | "investor";

/** Wording copied 1:1 from the old "Action Required" popup. Links are the
 *  same too: General → /investors + /investors-login, Entrepreneur →
 *  /pitch-idea + /login, Investor → /investors + /investors-login. */
const OPTIONS: Record<
  TabKey,
  {
    isNew: boolean;
    title: string;
    desc: string;
    href: string;
    icon: "user" | "login" | "layers" | "dollar";
  }[]
> = {
  general: [
    {
      isNew: true,
      title: "New user",
      desc: "Create an account to get started in just a few steps.",
      href: "/investors",
      icon: "user",
    },
    {
      isNew: false,
      title: "Returning user",
      desc: "Log in to access your dashboard.",
      href: "/investors-login",
      icon: "login",
    },
  ],
  entrepreneur: [
    {
      isNew: true,
      title: "New entrepreneur",
      desc: "Sign up here to list your business and connect with investors.",
      href: "/pitch-idea",
      icon: "layers",
    },
    {
      isNew: false,
      title: "Already registered",
      desc: "Log in here to manage your pitch deck and funding progress.",
      href: "/login",
      icon: "login",
    },
  ],
  investor: [
    {
      isNew: true,
      title: "New investor",
      desc: "Create an account to discover vetted opportunities.",
      href: "/investors",
      icon: "dollar",
    },
    {
      isNew: false,
      title: "Returning investor",
      desc: "Sign in to view your portfolio and new deals.",
      href: "/investors-login",
      icon: "login",
    },
  ],
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "entrepreneur", label: "Entrepreneur" },
  { key: "investor", label: "Investor" },
];

function OptionIcon({ name }: { name: "user" | "login" | "layers" | "dollar" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "user")
    return (
      <svg {...common}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    );
  if (name === "layers")
    return (
      <svg {...common}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  if (name === "dollar")
    return (
      <svg {...common}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
      <polyline points="10 17 15 12 10 7"></polyline>
      <line x1="15" y1="12" x2="3" y2="12"></line>
    </svg>
  );
}

/** Full-width Google button — runs the SAME OAuth flow as /investors-login
 *  (useGoogleLogin → userinfo → posted to parent handler). Not a link. */
function GoogleLoginButton({
  onSuccess,
  onError,
}: {
  onSuccess: (userInfo: any) => void;
  onError: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const userInfo = await userInfoRes.json();
        onSuccess(userInfo);
      } catch (err) {
        console.error("Failed to fetch Google user info", err);
        onError();
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      onError();
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 font-semibold text-[15px] py-[15px] rounded-[14px] cursor-pointer bg-white text-[#1E222B] transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}

export function ConnectToContinueModal({ open, onClose }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [selected, setSelected] = useState<Record<TabKey, number>>({
    general: 0,
    entrepreneur: 0,
    investor: 0,
  });

  const current = OPTIONS[activeTab][selected[activeTab]];

  const continueLabel = current.isNew
    ? activeTab === "entrepreneur"
      ? "Continue as New Entrepreneur"
      : activeTab === "investor"
        ? "Continue as New Investor"
        : "Continue as New User"
    : "Continue to Login";

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Google OAuth — identical to the flow on /investors-login.
  const handleGoogleLogin = async (userInfo: any) => {
    if (!userInfo?.email) {
      toast.error("Google login failed. No user info received.");
      return;
    }

    try {
      const response = await fetch("/api/auth/social-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "GOOGLE",
          providerId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name || "",
          lastName: userInfo.family_name || "",
          avatarUrl: userInfo.picture,
          providerData: userInfo,
          role: "INVESTOR",
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.user?.role === "USER") {
          toast.error("Please use the standard Login page.");
          return;
        }

        if (result.token) {
          sessionStorage.setItem("auth-token", result.token);
          localStorage.setItem("auth-token", result.token);
          document.cookie = `auth-token=${
            result.token
          }; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
        }

        window.location.href = result.requiresOnboarding
          ? "/onboarding?flow=investor"
          : "/";
      } else if (result.requiresVerification) {
        router.push(
          `/otp?email=${encodeURIComponent(userInfo.email)}&type=email`,
        );
      } else {
        toast.error(result.error || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-modal-headline"
        className={`${inter.className} relative max-w-[500px] w-full bg-bglight backdrop-blur-[20px] rounded-[28px] overflow-hidden p-[42px] px-9 pb-9 text-[#1E222B]  animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-[22px] right-[22px] w-8 h-8 rounded-full bg-white/80 text-black text-sm cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-[#1E222B] hover:bg-white/90 hover:scale-105"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 13L13 1M1 1L13 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-[30px]">
          <div className="w-[52px] h-[52px] bg-[#F97316] rounded-2xl mx-auto mb-5 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <h2
            id="connect-modal-headline"
            className="font-bold text-2xl tracking-[-0.025em] mb-2 text-white"
          >
            Connect to continue
          </h2>
          <p className="text-sm text-[#717784] leading-normal mx-auto max-w-[290px]">
            To connect with this business, please create an account or sign in
            to your existing profile.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex mb-6 bg-black/[0.04] rounded-[14px] p-1 border border-white/50"
          role="tablist"
          aria-label="Account type"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 appearance-none border-none font-semibold text-[13px] py-2.5 rounded-[10px] cursor-pointer transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-[#1E222B] shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                  : "bg-transparent text-[#717784] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Option cards */}
        <div className="flex flex-col gap-3">
          {OPTIONS[activeTab].map((opt, idx) => {
            const isSelected = selected[activeTab] === idx;
            return (
              <div
                key={opt.title}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [activeTab]: idx }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected((prev) => ({ ...prev, [activeTab]: idx }));
                  }
                }}
                className={`flex items-center gap-4 border-[1px] rounded-2xl py-4 px-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-[#F97316] bg-[#F97316]/[0.05]"
                    : "bg-bgdark hover:border-[#F97316] hover:bg-[#F97316]/[0.05] hover:-translate-y-px"
                }`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center border transition-all duration-200 ${
                    isSelected
                      ? "bg-[#F97316] text-white border-transparent"
                      : "bg-[#F4F6F9]/80 text-[#717784] border-black/[0.04]"
                  }`}
                >
                  <OptionIcon name={opt.icon} />
                </div>
                <div className="flex-1">
                  <div className="text-[14.5px] font-semibold tracking-[-0.01em] mb-0.5 text-white">
                    {opt.title}
                  </div>
                  <div className="text-[12.5px] text-[#717784] leading-[1.45]">
                    {opt.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue — exact same <Link> + hrefs as the old popup */}
        <div className="mt-7">
          <Link
            href={current.href}
            className="block w-full text-center font-semibold text-[15px] py-[15px] rounded-[14px] cursor-pointer bg-[#F97316] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-[#EA580C] active:scale-[0.98]"
          >
            {continueLabel}
          </Link>
        </div>

        {/* Google login — real OAuth, full width (hidden if not configured) */}
        {googleClientId && (
          <div className="mt-7">
            <div className="flex items-center text-[#717784] text-[12.5px] mb-5 before:content-[''] before:flex-1 before:border-b before:border-white/20 after:content-[''] after:flex-1 after:border-b after:border-white/20">
              <span className="px-3 font-medium">Or continue with</span>
            </div>
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLoginButton
                onSuccess={handleGoogleLogin}
                onError={handleGoogleLoginError}
              />
            </GoogleOAuthProvider>
          </div>
        )}
      </div>
    </div>
  );
}
