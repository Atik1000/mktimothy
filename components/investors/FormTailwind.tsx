"use client";

import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  CircleDollarSign,
  Coins,
  Compass,
  CreditCard,
  DollarSign,
  Facebook,
  FastForward,
  Globe,
  Handshake,
  Heart,
  HelpCircle,
  Landmark,
  Lightbulb,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Mountain,
  Rocket,
  Scale,
  Shield,
  Target,
  TrendingUp,
  Twitter,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactCodeInput from "react-code-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import LayoutTailwind from "./LayoutTailwind";
import { useFormDraft } from "@/lib/hooks/useFormDraft";

// Reusable Option Card Component - Icon Card Style
interface OptionCardProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  selected: boolean;
  onChange: () => void;
  onNext?: () => void;
}

const OptionCard = ({
  label,
  description,
  icon,
  selected,
  onChange,
  onNext,
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

interface QuestionPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  gridCols?: string;
}

const QuestionPage = ({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext = true,
  gridCols = "grid-cols-2 sm:grid-cols-3",
}: QuestionPageProps) => (
  <>
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">
        {title}
      </h2>
      {subtitle && <p className="text-[#e4c273]/80 text-sm italic mt-2">{subtitle}</p>}
    </div>

    {/* Options Grid */}
    <div className={`grid ${gridCols} gap-3 mb-8`}>{children}</div>

        {/* Navigation */}
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
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
  </>
);

const FormTailwind = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(false);
  const [accreditedInvestor, setAccreditedInvestor] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    country: false,
    accreditedInvestor: false,
    targetRegion: false,
  });

  useEffect(() => {
    if (searchParams.get("direct")) {
      setPage(7);
    }
  }, [searchParams]);

  const [payload, setPayload] = useState([
    {
      question: "Tell Us About Yourself",
      number: 1,
      selected: "",
      answer: "",
    },
    {
      question: "Define Your Investment Ambition",
      number: 2,
      selected: "",
      answer: "",
    },
    {
      question: "How Much Capital Are You Ready to Deploy?",
      number: 3,
      selected: "",
      answer: "",
    },
    {
      question: "How Do You Prefer to Invest?",
      number: 4,
      selected: "",
      answer: "",
    },
    {
      question: "Where Are You Looking to Invest?",
      number: 5,
      selected: "",
      answer: "",
    },
    {
      question: "Which Sectors Capture Your Interest?",
      number: 6,
      selected: "",
      answer: "",
    },
    {
      question: "Annual Revenue Range",
      number: 7,
      selected: "custom",
      answer: "",
    },
    {
      question: "Number of Employees",
      number: 8,
      selected: "custom",
      answer: "",
    },
    {
      question: "Preferred Business Type",
      number: 9,
      selected: "custom",
      answer: "",
    },
    {
      question: "Post-Investment Engagement",
      number: 10,
      selected: "custom",
      answer: "",
    },
    {
      question: "Business Plan Status",
      number: 11,
      selected: "custom",
      answer: "",
    },
    {
      question: "Local Partnership Needs",
      number: 12,
      selected: "custom",
      answer: "",
    },
    {
      question: "Projected Launch Timeline",
      number: 13,
      selected: "custom",
      answer: "",
    },
    {
      question: "Partner Reference Code",
      number: 14,
      selected: "custom",
      answer: "",
    },
  ]);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });

  const [otp, setotp] = useState("");
  const [otpState, setotpState] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(true);
  const [otpError, setotpError] = useState({
    error: false,
    message: "Something went wrong please try again or enter a new number",
  });

  const [targetRegion, setTargetRegion] = useState(false);

  // Draft preservation: mirror the user-editable state (page + answers +
  // contact info) to localStorage so navigating away or refreshing does
  // not lose progress. Hydrated once on mount; cleared on successful submit.
  const DRAFT_KEY = "investor-form";
  const [draft, setDraft, clearDraft] = useFormDraft<{
    page: number;
    payload: typeof payload;
    userInfo: typeof userInfo;
    accreditedInvestor: boolean;
    targetRegion: boolean;
  }>(DRAFT_KEY, {
    page: 0,
    payload: [],
    userInfo: { name: "", email: "", phone: "", country: "" },
    accreditedInvestor: false,
    targetRegion: false,
  });

  // Hydrate once on mount if a draft exists.
  const hydrated = React.useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (draft.payload.length > 0) {
      setPayload(draft.payload);
      setUserInfo(draft.userInfo);
      setAccreditedInvestor(draft.accreditedInvestor);
      setTargetRegion(draft.targetRegion);
      if (typeof draft.page === "number") setPage(draft.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change (debounced inside the hook).
  useEffect(() => {
    if (!hydrated.current) return;
    setDraft({
      page,
      payload,
      userInfo,
      accreditedInvestor,
      targetRegion,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, payload, userInfo, accreditedInvestor, targetRegion]);

  const handleOnInputChange = (value: string, question: number) => {
    setPayload((prev) =>
      prev.map((q) => (q.number === question ? { ...q, answer: value } : q)),
    );
  };

  const handleSignupFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setUserInfo({ ...userInfo, [event.target.name]: event.target.value });
  };

  const submit = () => {
    if (buttonDisabled) return;

    setotpError({
      error: false,
      message: "Something went wrong please try again or enter a new number",
    });

    setButtonDisabled(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = userInfo.email && emailRegex.test(userInfo.email);

    const errorObj = {
      name: userInfo.name === "" ? true : false,
      email: !userInfo.email || !isValidEmail ? true : false,
      phone: !userInfo.phone || userInfo.phone.length < 10 ? true : false,
      country: userInfo.country === "" ? true : false,
      accreditedInvestor: !accreditedInvestor,
      targetRegion: !targetRegion,
    };

    setFormErrors(errorObj);

    let error = false;
    for (const key in errorObj) {
      if (errorObj[key as keyof typeof errorObj] === true) {
        error = true;
      }
    }

    if (error) {
      setButtonDisabled(false);
      return;
    }
    sendEmail();
  };

  const phoneVerification = () => {
    axios
      .post("/api/otp/send", {
        phone: userInfo.phone,
      })
      .then((response) => {
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
        setShowCaptcha(false);
        setotpState(true);
      })
      .catch((err) => {
        let msg = "An error occurred";
        if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        window.alert(msg);
        setShowCaptcha(false);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
      });
  };

  const verifyOtp = async () => {
    if (verifyButtonDisabled) return;
    setVerifyButtonDisabled(true);

    axios
      .post("/api/otp/verify", {
        phone: userInfo.phone,
        code: otp,
      })
      .then((result) => {
        sendEmail();
      })
      .catch((error) => {
        window.alert(error.response?.data?.message || error.message);
        setotpError({
          error: true,
          message:
            "Something went wrong please try again or enter a new number",
        });
        setShowCaptcha(false);
        setButtonDisabled(false);
        setotpState(false);
        setVerifyButtonDisabled(false);
      });
  };

  const sendEmail = () => {
    const body = {
      questions: payload,
      user: userInfo,
    };

    axios
      .post("/api/investors/register", body)
      .then(async (response) => {
        setotpState(false);
        setPage(page + 1);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
      })
      .catch((error) => {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
        window.alert(msg);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
      });
  };

  const totalSteps = 6;

  return (
    <LayoutTailwind>
      {/* GLOBAL SMOOTH PROGRESS BAR WRAPPER FOR PAGES 0-5 */}
      {page < 6 && (
        <div className="min-h-[calc(100vh-120px)] flex flex-col">
          <div className="inset-0 bg-[#000]/60" />
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-2xl z-10 relative">
              <div className="text-center mb-8">
                <p className="text-[#e4c273]/60 text-sm uppercase tracking-wider mb-3">
                  Question {Math.min(page + 1, totalSteps)}/{totalSteps}
                </p>
                <div className="w-full max-w-xs mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C29F5D] to-[#e4c273] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(194,159,93,0.4)]"
                    style={{ width: `${(Math.min(page + 1, totalSteps) / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Page 0: Investor Type */}
              {page === 0 && (
        <QuestionPage
          title="Tell Us About Yourself"
          subtitle="How would you classify your investment profile?"
          currentStep={1}
          totalSteps={totalSteps}
          onPrevious={() => router.push("/investors")}
          onNext={() => setPage(1)}
          canGoNext={!!payload[0].selected}
          gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OptionCard
            label="High-Net-Worth Individual"
            description="Deploying personal capital"
            icon={<UserCheck className="w-6 h-6" />}
            selected={payload[0].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = { ...n[0], selected: "opt-1", answer: "High-Net-Worth Individual – Deploying personal capital" };
                return n;
              })
            }
          />
          <OptionCard
            label="Family Office"
            description="Managing multi-generational wealth"
            icon={<Landmark className="w-6 h-6" />}
            selected={payload[0].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = { ...n[0], selected: "opt-2", answer: "Family Office – Managing multi-generational wealth" };
                return n;
              })
            }
          />
          <OptionCard
            label="Private Equity Firm"
            description="Institutional capital deployment"
            icon={<Building2 className="w-6 h-6" />}
            selected={payload[0].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = {
                  ...n[0],
                  selected: "opt-3",
                  answer: "Private Equity Firm – Institutional capital deployment",
                };
                return n;
              })
            }
          />
          <OptionCard
            label="Venture Capital Firm"
            description="Early to growth-stage investing"
            icon={<Rocket className="w-6 h-6" />}
            selected={payload[0].selected === "opt-4"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = {
                  ...n[0],
                  selected: "opt-4",
                  answer: "Venture Capital Firm – Early to growth-stage investing",
                };
                return n;
              })
            }
          />
          <OptionCard
            label="Corporate Development"
            description="Strategic market entry"
            icon={<Briefcase className="w-6 h-6" />}
            selected={payload[0].selected === "opt-5"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = { ...n[0], selected: "opt-5", answer: "Corporate Development – Strategic market entry" };
                return n;
              })
            }
          />
          <OptionCard
            label="Development Finance Institution"
            description="Impact-driven capital"
            icon={<Globe className="w-6 h-6" />}
            selected={payload[0].selected === "opt-6"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = {
                  ...n[0],
                  selected: "opt-6",
                  answer: "Development Finance Institution – Impact-driven capital",
                };
                return n;
              })
            }
          />
          <OptionCard
            label="Joint Venture Partner"
            description="Collaborative investment structure"
            icon={<Handshake className="w-6 h-6" />}
            selected={payload[0].selected === "opt-7"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = { ...n[0], selected: "opt-7", answer: "Joint Venture Partner – Collaborative investment structure" };
                return n;
              })
            }
          />
          <OptionCard
            label="Other"
            description="Please specify"
            icon={<HelpCircle className="w-6 h-6" />}
            selected={payload[0].selected === "opt-8"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = { ...n[0], selected: "opt-8", answer: "Other (Please specify)" };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

      {/* Page 1: Investment Ambition */}
      {page === 1 && (
        <QuestionPage
          title="Define Your Investment Ambition"
          subtitle="What is your primary investment mandate?"
          currentStep={2}
          totalSteps={totalSteps}
          onPrevious={() => setPage(0)}
          onNext={() => setPage(2)}
          canGoNext={!!payload[1].selected}
          gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OptionCard
            label="Full Acquisition"
            description="Take complete ownership and control"
            icon={<Building2 className="w-6 h-6" />}
            selected={payload[1].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[1] = { ...n[1], selected: "opt-1", answer: "Full Acquisition – Take complete ownership and control" };
                return n;
              })
            }
          />
          <OptionCard
            label="Strategic Joint Venture"
            description="Partner with established players"
            icon={<Handshake className="w-6 h-6" />}
            selected={payload[1].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[1] = { ...n[1], selected: "opt-2", answer: "Strategic Joint Venture – Partner with established players" };
                return n;
              })
            }
          />
          <OptionCard
            label="Equity Capital Injection"
            description="Minority or majority stake"
            icon={<TrendingUp className="w-6 h-6" />}
            selected={payload[1].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[1] = { ...n[1], selected: "opt-3", answer: "Equity Capital Injection – Minority or majority stake" };
                return n;
              })
            }
          />
          <OptionCard
            label="Entrepreneurship"
            description="Build your business from the ground up"
            icon={<Rocket className="w-6 h-6" />}
            selected={payload[1].selected === "opt-4"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[1] = { ...n[1], selected: "opt-4", answer: "Entrepreneurship – Build your business from the ground up" };
                return n;
              })
            }
          />
          <OptionCard
            label="Build-to-Exit"
            description="Acquire, grow, and exit within 3-7 years"
            icon={<Target className="w-6 h-6" />}
            selected={payload[1].selected === "opt-5"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[1] = { ...n[1], selected: "opt-5", answer: "Build-to-Exit – Acquire, grow, and exit within 3-7 years" };
                return n;
              })
            }
          />
          <OptionCard
            label="Other"
            description="Please specify"
            icon={<HelpCircle className="w-6 h-6" />}
            selected={payload[1].selected === "opt-6"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[1] = { ...n[1], selected: "opt-6", answer: "Other (Please specify)" };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

      {/* Page 2: Capital Ready */}
      {page === 2 && (
        <QuestionPage
          title="How Much Capital Are You Ready to Deploy?"
          subtitle="Select your investment range (USD):"
          currentStep={3}
          totalSteps={totalSteps}
          onPrevious={() => setPage(1)}
          onNext={() => setPage(3)}
          canGoNext={!!payload[2].selected}
          gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          <OptionCard
            label="$50,000 – $250,000"
            icon={<Wallet className="w-6 h-6" />}
            selected={payload[2].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-1", answer: "$50,000 – $250,000" };
                return n;
              })
            }
          />
          <OptionCard
            label="$250,000 – $500,000"
            icon={<Banknote className="w-6 h-6" />}
            selected={payload[2].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-2", answer: "$250,000 – $500,000" };
                return n;
              })
            }
          />
          <OptionCard
            label="$500,000 – $1,000,000"
            icon={<CircleDollarSign className="w-6 h-6" />}
            selected={payload[2].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-3", answer: "$500,000 – $1,000,000" };
                return n;
              })
            }
          />
          <OptionCard
            label="$1,000,000 – $5,000,000"
            icon={<DollarSign className="w-6 h-6" />}
            selected={payload[2].selected === "opt-4"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-4", answer: "$1,000,000 – $5,000,000" };
                return n;
              })
            }
          />
          <OptionCard
            label="$5,000,000 – $10,000,000"
            icon={<BarChart3 className="w-6 h-6" />}
            selected={payload[2].selected === "opt-5"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-5", answer: "$5,000,000 – $10,000,000" };
                return n;
              })
            }
          />
          <OptionCard
            label="$10,000,000+"
            icon={<TrendingUp className="w-6 h-6" />}
            selected={payload[2].selected === "opt-6"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-6", answer: "$10,000,000+" };
                return n;
              })
            }
          />
          <OptionCard
            label="Flexible"
            description="Open to the right opportunity"
            icon={<Compass className="w-6 h-6" />}
            selected={payload[2].selected === "opt-7"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[2] = { ...n[2], selected: "opt-7", answer: "Flexible – Open to the right opportunity" };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

      {/* Page 3: How to invest */}
      {page === 3 && (
        <QuestionPage
          title="How Do You Prefer to Invest?"
          subtitle="What investment structure best aligns with your goals?"
          currentStep={4}
          totalSteps={totalSteps}
          onPrevious={() => setPage(2)}
          onNext={() => setPage(4)}
          canGoNext={!!payload[3].selected}
          gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OptionCard
            label="Full Buyout"
            description="100% ownership and decision-making control"
            icon={<Building2 className="w-6 h-6" />}
            selected={payload[3].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-1", answer: "Full Buyout – 100% ownership and decision-making control" };
                return n;
              })
            }
          />
          <OptionCard
            label="Controlling Interest"
            description="Majority stake with strategic influence"
            icon={<Scale className="w-6 h-6" />}
            selected={payload[3].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-2", answer: "Controlling Interest – Majority stake with strategic influence" };
                return n;
              })
            }
          />
          <OptionCard
            label="Minority Interest"
            description="Strategic equity position"
            icon={<Users className="w-6 h-6" />}
            selected={payload[3].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-3", answer: "Minority Interest – Strategic equity position" };
                return n;
              })
            }
          />
          <OptionCard
            label="Strategic Partnership"
            description="Joint venture or co-investment"
            icon={<Handshake className="w-6 h-6" />}
            selected={payload[3].selected === "opt-4"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-4", answer: "Strategic Partnership – Joint venture or co-investment" };
                return n;
              })
            }
          />
          <OptionCard
            label="Passive Investment"
            description="Silent partner, hands-off approach"
            icon={<UserCheck className="w-6 h-6" />}
            selected={payload[3].selected === "opt-5"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-5", answer: "Passive Investment – Silent partner, hands-off approach" };
                return n;
              })
            }
          />
          <OptionCard
            label="Active Involvement"
            description="Operational role in the business"
            icon={<Briefcase className="w-6 h-6" />}
            selected={payload[3].selected === "opt-6"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-6", answer: "Active Involvement – Operational role in the business" };
                return n;
              })
            }
          />
          <OptionCard
            label="Other"
            description="Please specify"
            icon={<HelpCircle className="w-6 h-6" />}
            selected={payload[3].selected === "opt-7"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[3] = { ...n[3], selected: "opt-7", answer: "Other (Please specify)" };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

      {/* Page 4: Target Market */}
      {page === 4 && (
        <QuestionPage
          title="Where Are You Looking to Invest?"
          subtitle="Select your target market(s):"
          currentStep={5}
          totalSteps={totalSteps}
          onPrevious={() => setPage(3)}
          onNext={() => setPage(5)}
          canGoNext={!!payload[4].selected}
          gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OptionCard
            label="Uganda"
            description="The Pearl of Africa's thriving economy"
            icon={<MapPin className="w-6 h-6" />}
            selected={payload[4].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-1", answer: "Uganda – The Pearl of Africa's thriving economy" };
                return n;
              })
            }
          />
          <OptionCard
            label="Kenya"
            description="East Africa's commercial powerhouse"
            icon={<MapPin className="w-6 h-6" />}
            selected={payload[4].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-2", answer: "Kenya – East Africa's commercial powerhouse" };
                return n;
              })
            }
          />
          <OptionCard
            label="Tanzania"
            description="Resource-rich and growing rapidly"
            icon={<MapPin className="w-6 h-6" />}
            selected={payload[4].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-3", answer: "Tanzania – Resource-rich and growing rapidly" };
                return n;
              })
            }
          />
          <OptionCard
            label="Rwanda"
            description="Africa's rising tech hub"
            icon={<MapPin className="w-6 h-6" />}
            selected={payload[4].selected === "opt-4"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-4", answer: "Rwanda – Africa's rising tech hub" };
                return n;
              })
            }
          />
          <OptionCard
            label="South Sudan"
            description="Emerging frontier market"
            icon={<MapPin className="w-6 h-6" />}
            selected={payload[4].selected === "opt-5"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-5", answer: "South Sudan – Emerging frontier market" };
                return n;
              })
            }
          />
          <OptionCard
            label="East Africa Region"
            description="Multi-country strategy"
            icon={<Globe className="w-6 h-6" />}
            selected={payload[4].selected === "opt-6"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-6", answer: "East Africa Region – Multi-country strategy" };
                return n;
              })
            }
          />
          <OptionCard
            label="Cross-Border"
            description="EAC-wide investment approach"
            icon={<ArrowRight className="w-6 h-6" />}
            selected={payload[4].selected === "opt-7"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-7", answer: "Cross-Border – EAC-wide investment approach" };
                return n;
              })
            }
          />
          <OptionCard
            label="No Geographic Restriction"
            description="Open to all"
            icon={<Globe className="w-6 h-6" />}
            selected={payload[4].selected === "opt-8"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[4] = { ...n[4], selected: "opt-8", answer: "No Geographic Restriction – Open to all" };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

      {/* Page 5: Sectors */}
      {page === 5 && (
        <QuestionPage
          title="Which Sectors Capture Your Interest?"
          subtitle="Select the industries that align with your investment thesis:"
          currentStep={6}
          totalSteps={totalSteps}
          onPrevious={() => setPage(4)}
          onNext={() => setPage(6)}
          canGoNext={!!payload[5].selected}
          gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          <OptionCard
            label="Agriculture & AgriTech"
            description="Feeding Africa's future"
            icon={<Mountain className="w-6 h-6" />}
            selected={payload[5].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-1", answer: "Agriculture & AgriTech – Feeding Africa's future" };
                return n;
              })
            }
          />
          <OptionCard
            label="Renewable Energy"
            description="Powering sustainable growth"
            icon={<Lightbulb className="w-6 h-6" />}
            selected={payload[5].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-2", answer: "Renewable Energy – Powering sustainable growth" };
                return n;
              })
            }
          />
          <OptionCard
            label="Financial Services / Fintech"
            description="Banking the unbanked"
            icon={<Landmark className="w-6 h-6" />}
            selected={payload[5].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-3", answer: "Financial Services / Fintech – Banking the unbanked" };
                return n;
              })
            }
          />
          <OptionCard
            label="Healthcare"
            description="Building healthier communities"
            icon={<Heart className="w-6 h-6" />}
            selected={payload[5].selected === "opt-4"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-4", answer: "Healthcare – Building healthier communities" };
                return n;
              })
            }
          />
          <OptionCard
            label="Technology / SaaS"
            description="Digital transformation leaders"
            icon={<Rocket className="w-6 h-6" />}
            selected={payload[5].selected === "opt-5"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-5", answer: "Technology / SaaS – Digital transformation leaders" };
                return n;
              })
            }
          />
          <OptionCard
            label="Real Estate & Construction"
            description="Infrastructure boom"
            icon={<Building2 className="w-6 h-6" />}
            selected={payload[5].selected === "opt-6"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-6", answer: "Real Estate & Construction – Infrastructure boom" };
                return n;
              })
            }
          />
          <OptionCard
            label="Manufacturing"
            description="Industrialization in action"
            icon={<Briefcase className="w-6 h-6" />}
            selected={payload[5].selected === "opt-7"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-7", answer: "Manufacturing – Industrialization in action" };
                return n;
              })
            }
          />
          <OptionCard
            label="Retail & E-Commerce"
            description="The rise of African consumer"
            icon={<Users className="w-6 h-6" />}
            selected={payload[5].selected === "opt-8"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-8", answer: "Retail & E-Commerce – The rise of African consumer" };
                return n;
              })
            }
          />
          <OptionCard
            label="Logistics & Transportation"
            description="Connecting markets"
            icon={<FastForward className="w-6 h-6" />}
            selected={payload[5].selected === "opt-9"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-9", answer: "Logistics & Transportation – Connecting markets" };
                return n;
              })
            }
          />
          <OptionCard
            label="Tourism & Hospitality"
            description="Africa's natural beauty"
            icon={<Globe className="w-6 h-6" />}
            selected={payload[5].selected === "opt-10"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-10", answer: "Tourism & Hospitality – Africa's natural beauty" };
                return n;
              })
            }
          />
          <OptionCard
            label="Education"
            description="Investing in human capital"
            icon={<UserCheck className="w-6 h-6" />}
            selected={payload[5].selected === "opt-11"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-11", answer: "Education – Investing in human capital" };
                return n;
              })
            }
          />
          <OptionCard
            label="Mining & Natural Resources"
            description="Extractive industries"
            icon={<Mountain className="w-6 h-6" />}
            selected={payload[5].selected === "opt-12"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-12", answer: "Mining & Natural Resources – Extractive industries" };
                return n;
              })
            }
          />
          <OptionCard
            label="Telecom & Mobile"
            description="Digital connectivity"
            icon={<Globe className="w-6 h-6" />}
            selected={payload[5].selected === "opt-13"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-13", answer: "Telecom & Mobile – Digital connectivity" };
                return n;
              })
            }
          />
          <OptionCard
            label="Other"
            description="Please specify"
            icon={<HelpCircle className="w-6 h-6" />}
            selected={payload[5].selected === "opt-14"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[5] = { ...n[5], selected: "opt-14", answer: "Other (Please specify)" };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

            </div>
          </div>
        </div>
      )}

      {/* Page 6: Investment Criteria */}
      {page === 6 && (
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-xl bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-xl text-white font-medium mb-2">
                  Tell Us More About Your Investment Criteria
                </h2>
                <p className="text-[#C29F5D] text-sm font-medium">
                  Target Enterprise Profile
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Annual Revenue Range (if applicable)
                  </label>
                  <input
                    type="text"
                    value={payload[6].answer}
                    onChange={(e) => handleOnInputChange(e.target.value, 7)}
                    placeholder="Enter details..."
                    className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Number of Employees
                  </label>
                  <input
                    type="text"
                    value={payload[7].answer}
                    onChange={(e) => handleOnInputChange(e.target.value, 8)}
                    placeholder="Enter details..."
                    className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Preferred Business Type
                  </label>
                  <select
                    value={payload[8].answer}
                    onChange={(e) => handleOnInputChange(e.target.value, 9)}
                    className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                  >
                    <option value="" className="bg-black text-white">Select option...</option>
                    <option value="Family-Owned Enterprise" className="bg-black text-white">Family-Owned Enterprise</option>
                    <option value="Startup / Early-Stage" className="bg-black text-white">Startup / Early-Stage</option>
                    <option value="Established SME" className="bg-black text-white">Established SME</option>
                    <option value="Franchise" className="bg-black text-white">Franchise</option>
                    <option value="Corporate Spin-Off" className="bg-black text-white">Corporate Spin-Off</option>
                    <option value="Other" className="bg-black text-white">Other</option>
                  </select>
                </div>

                <hr className="border-[#C29F5D]/20 my-2" />
                

                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Post-Investment Engagement
                  </label>
                  <select
                    value={payload[9].answer}
                    onChange={(e) => handleOnInputChange(e.target.value, 10)}
                    className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                  >
                    <option value="" className="bg-black text-white">Select option...</option>
                    <option value="Active Management – Hands-on operational role" className="bg-black text-white">Active Management – Hands-on operational role</option>
                    <option value="Board Representation – Strategic oversight" className="bg-black text-white">Board Representation – Strategic oversight</option>
                    <option value="Advisory Capacity – Mentorship and guidance" className="bg-black text-white">Advisory Capacity – Mentorship and guidance</option>
                    <option value="Silent / Passive – Capital-only investment" className="bg-black text-white">Silent / Passive – Capital-only investment</option>
                  </select>
                </div>

                <hr className="border-[#C29F5D]/20 my-2" />
                <p className="text-[#C29F5D] text-sm font-medium mb-2 text-center">
                  For New Venture Launches
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Business Plan Status
                    </label>
                    <select
                      value={payload[10].answer}
                      onChange={(e) => handleOnInputChange(e.target.value, 11)}
                      className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                    >
                      <option value="" className="bg-black text-white">Select option...</option>
                      <option value="Complete business plan prepared" className="bg-black text-white">Complete business plan prepared</option>
                      <option value="Currently in development" className="bg-black text-white">Currently in development</option>
                      <option value="Require assistance with development" className="bg-black text-white">Require assistance with development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Local Partnership Needs
                    </label>
                    <select
                      value={payload[11].answer}
                      onChange={(e) => handleOnInputChange(e.target.value, 12)}
                      className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                    >
                      <option value="" className="bg-black text-white">Select option...</option>
                      <option value="Seeking local co-founder/partner" className="bg-black text-white">Seeking local co-founder/partner</option>
                      <option value="Self-managed operation" className="bg-black text-white">Self-managed operation</option>
                      <option value="Undetermined at this time" className="bg-black text-white">Undetermined at this time</option>
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs text-white/70 mb-1.5">
                      Projected Launch Timeline
                    </label>
                    <select
                      value={payload[12].answer}
                      onChange={(e) => handleOnInputChange(e.target.value, 13)}
                      className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                    >
                      <option value="" className="bg-black text-white">Select option...</option>
                      <option value="Within 3 months" className="bg-black text-white">Within 3 months</option>
                      <option value="3-6 months" className="bg-black text-white">3-6 months</option>
                      <option value="6-12 months" className="bg-black text-white">6-12 months</option>
                      <option value="Flexible" className="bg-black text-white">Flexible</option>
                    </select>
                  </div>
                </div>

                <hr className="border-[#C29F5D]/20 my-2" />
                
                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Partner Reference Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={payload[13].answer}
                    onChange={(e) => handleOnInputChange(e.target.value, 14)}
                    placeholder="Enter reference code..."
                    className="w-full px-3 py-2.5 bg-black/20 border border-[#C29F5D]/70 rounded-lg text-white text-sm placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D] transition-all duration-300"
                  />
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setPage(5)}
                    className="flex items-center gap-2 px-6 py-3 text-[#C29F5D]/70 hover:text-[#C29F5D] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(7)}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm bg-[#C29F5D] text-white hover:bg-[#C29F5D] transition-all duration-300"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page 7: Signup Form */}
      {page === 7 && (
        <div className="min-h-[calc(100vh-70px)] flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-md bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-6 shadow-2xl">
              {otpState ? (
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#C29F5D]/20 to-[#C29F5D]/20 border border-[#C29F5D]/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#C29F5D]" />
                  </div>
                  <h2 className="text-xl text-white font-medium mb-2">
                    Verify Your Identity
                  </h2>
                  <p className="text-[#C29F5D]/70 text-sm">
                    Enter the six digits sent to your phone number
                  </p>
                </div>
              ) : (
                <div className="text-center mb-5">
                  <div className="mx-auto mb-4">
                    <Image
                      src="/images/mkwhite.png"
                      alt="Mk Timothy"
                      width={200}
                      height={100}
                      className="w-full max-w-[150px] h-full mx-auto"
                    />
                  </div>
                  <h2 className="text-xl text-white font-medium mb-2">
                    Investor Access – East Africa
                  </h2>
                  <p className="text-[#C29F5D] text-sm font-medium mb-2">
                    Join East Africa's Most Exclusive Investment Network
                  </p>
                  <p className="text-white/70 text-xs mt-3">
                    Complete your profile to gain access to curated, high-quality investment opportunities across Uganda and the East African region.
                  </p>
                </div>
              )}

              {!otpState ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userInfo.name}
                      onChange={handleSignupFormChange}
                      placeholder="Enter your full name"
                      className={`
                        w-full px-3 py-2.5 bg-transparent border rounded-lg text-white text-sm placeholder-white/70
                        focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D]
                        transition-all duration-300
                        ${formErrors.name ? "border-red-500" : "border-[#C29F5D]/70"}
                      `}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter your name
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Professional Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleSignupFormChange}
                      placeholder="address@mail.com"
                      className={`
                        w-full px-3 py-2.5 bg-transparent border rounded-lg text-white text-sm placeholder-white/70
                        focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D]
                        transition-all duration-300
                        ${formErrors.email ? "border-red-500" : "border-[#C29F5D]/70"}
                      `}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Direct Contact Number
                    </label>
                    <PhoneInput
                      country={"us"}
                      value={userInfo.phone}
                      onChange={(phone) =>
                        setUserInfo({ ...userInfo, phone: phone })
                      }
                      inputStyle={{
                        width: "100%",
                        height: "42px",
                        backgroundColor: "transparent",
                        border: formErrors.phone
                          ? "1px solid #ef4444"
                          : "1px solid rgba(194, 159, 93, 0.7)",
                        borderRadius: "8px",
                        color: "#fff",
                        paddingLeft: "52px",
                        fontSize: "14px",
                      }}
                      buttonStyle={{
                        backgroundColor: "transparent",
                        border: formErrors.phone
                          ? "1px solid #ef4444"
                          : "1px solid rgba(194, 159, 93, 0.7)",
                        borderRadius: "8px 0 0 8px",
                      }}
                      dropdownStyle={{
                        backgroundColor: "#111827",
                        color: "#fff",
                      }}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid phone number
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Country of Residence
                    </label>
                    <select
                      name="country"
                      value={userInfo.country}
                      onChange={handleSignupFormChange}
                      className={`
                        w-full px-3 py-2.5 bg-transparent border rounded-lg text-white text-sm placeholder-white/70
                        focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D]
                        transition-all duration-300
                        ${formErrors.country ? "border-red-500" : "border-[#C29F5D]/70"}
                      `}
                    >
                      <option value="" className="bg-black text-white">Select Country...</option>
                      <option value="Uganda" className="bg-black text-white">Uganda</option>
                      <option value="Kenya" className="bg-black text-white">Kenya</option>
                      <option value="Tanzania" className="bg-black text-white">Tanzania</option>
                      <option value="Rwanda" className="bg-black text-white">Rwanda</option>
                      <option value="South Sudan" className="bg-black text-white">South Sudan</option>
                      <option value="United States" className="bg-black text-white">United States</option>
                      <option value="United Kingdom" className="bg-black text-white">United Kingdom</option>
                      <option value="United Arab Emirates" className="bg-black text-white">United Arab Emirates</option>
                      <option value="Other" className="bg-black text-white">Other</option>
                    </select>
                    {formErrors.country && (
                      <p className="text-red-500 text-xs mt-1">
                        Please select your country of residence
                      </p>
                    )}
                  </div>

                  <hr className="border-[#C29F5D]/20 my-4" />

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={accreditedInvestor}
                            onChange={() =>
                              setAccreditedInvestor(!accreditedInvestor)
                            }
                            className="sr-only peer"
                          />
                          <div
                            className={`
                              w-4 h-4 border-2 rounded transition-all duration-200
                              ${
                                accreditedInvestor
                                  ? "bg-[#C29F5D] border-[#C29F5D]"
                                  : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"
                              }
                              ${formErrors.accreditedInvestor ? "border-red-500" : ""}
                            `}
                          >
                            {accreditedInvestor && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-[#C29F5D] font-light leading-snug">
                          I confirm that I am an accredited investor or qualified purchaser as defined under applicable securities laws.
                        </span>
                      </label>
                      {formErrors.accreditedInvestor && (
                        <p className="text-red-500 text-xs mt-1">
                          Please confirm your investor status
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={targetRegion}
                            onChange={() =>
                              setTargetRegion(!targetRegion)
                            }
                            className="sr-only peer"
                          />
                          <div
                            className={`
                              w-4 h-4 border-2 rounded transition-all duration-200
                              ${
                                targetRegion
                                  ? "bg-[#C29F5D] border-[#C29F5D]"
                                  : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"
                              }
                              ${formErrors.targetRegion ? "border-red-500" : ""}
                            `}
                          >
                            {targetRegion && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-[#C29F5D] font-light leading-snug">
                          I confirm my investment interest is directed toward opportunities in Uganda and/or the East African region.
                        </span>
                      </label>
                      {formErrors.targetRegion && (
                        <p className="text-red-500 text-xs mt-1">
                          Please confirm your investment interest region
                        </p>
                      )}
                    </div>
                  </div>

                  <hr className="border-[#C29F5D]/20 my-4" />

                  {otpError.error && (
                    <div className="text-red-500 text-xs">
                      {otpError.message}
                    </div>
                  )}

                  <button
                    onClick={submit}
                    disabled={buttonDisabled}
                    className={`
                      w-full py-3 rounded-lg font-semibold text-sm
                      bg-gradient-to-r from-[#C29F5D] to-[#C29F5D] text-white
                      hover:from-[#C29F5D] hover:to-[#C29F5D]
                      focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50
                      transition-all duration-300 flex items-center justify-center gap-2
                      disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                  >
                    {buttonDisabled ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        COMPLETE REGISTRATION
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <ReactCodeInput
                      name="otp-input"
                      inputMode="numeric"
                      type="number"
                      fields={6}
                      onChange={(e) => setotp(e)}
                      inputStyle={{
                        width: "38px",
                        height: "44px",
                        border: "1px solid rgba(194, 159, 93, 0.7)",
                        borderRadius: "8px",
                        outline: "none",
                        fontSize: "18px",
                        textAlign: "center",
                        margin: "0px 3px",
                        backgroundColor: "transparent",
                        color: "#fff",
                      }}
                    />
                  </div>

                  {otpError.error && (
                    <div className="text-red-500 text-xs text-center">
                      {otpError.message}
                    </div>
                  )}

                  <button
                    onClick={verifyOtp}
                    disabled={verifyButtonDisabled}
                    className={`
                      w-full py-3 rounded-lg font-semibold text-sm
                      bg-gradient-to-r from-[#C29F5D] to-[#C29F5D] text-white
                      hover:from-[#C29F5D] hover:to-[#C29F5D]
                      focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50
                      transition-all duration-300 flex items-center justify-center gap-2
                      disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                  >
                    {verifyButtonDisabled ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </button>

                  <button
                    onClick={submit}
                    disabled={buttonDisabled}
                    className="w-full py-2.5 rounded-lg font-medium text-xs text-[#C29F5D]/70 border border-[#C29F5D]/30 hover:border-[#C29F5D]/50 hover:text-[#C29F5D] transition-all duration-300"
                  >
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page 8: Success */}
      {page === 8 && (
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-xl bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#C29F5D] to-[#C29F5D] flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl text-white font-bold mb-2">
                You're In!
              </h2>
              <p className="text-[#C29F5D] text-lg font-medium mb-6">
                Welcome to East Africa's Premier Investment Network
              </p>

              <div className="mb-8">
                <p className="text-white text-lg italic mb-3">
                  Congratulations, {userInfo.name || "Investor"}!
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  Your investor profile has been successfully registered. You've just taken the first step toward unlocking transformative investment opportunities across Uganda, Kenya, Tanzania, Rwanda, and beyond.
                </p>
              </div>

              <div className="bg-black/20 border border-[#C29F5D]/30 rounded-xl p-5 mb-6 text-left">
                <h3 className="text-[#C29F5D] font-medium mb-4 text-center">Your Next Steps</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C29F5D]/20 text-[#C29F5D] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</div>
                    <div>
                      <p className="text-white text-sm font-medium">Confirm Your Email</p>
                      <p className="text-white/60 text-xs">Check your inbox for our confirmation message</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C29F5D]/20 text-[#C29F5D] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</div>
                    <div>
                      <p className="text-white text-sm font-medium">Schedule a Call</p>
                      <p className="text-white/60 text-xs">Click the link in your email to book your consultation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C29F5D]/20 text-[#C29F5D] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">3</div>
                    <div>
                      <p className="text-white text-sm font-medium">Explore Opportunities</p>
                      <p className="text-white/60 text-xs">Log in to review curated deals matching your criteria</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#2a1f0a]/50 border border-[#C29F5D]/20 rounded-xl p-4 mb-8 text-sm">
                <p className="text-white/80 leading-relaxed">
                  <span className="text-[#C29F5D] font-bold">⚠️ Important: </span>
                  If you don't see our email within 5 minutes, please check your <span className="text-[#C29F5D]">Spam/Junk folder</span> and mark us as "Not Spam" to ensure you receive future investment updates.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a
                  href="/investors-login"
                  className="px-6 py-3 bg-[#C29F5D] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Login to Your Account
                </a>
                <a
                  href="/about-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-transparent border border-[#C29F5D]/50 text-[#C29F5D] rounded-lg font-medium text-sm hover:bg-[#C29F5D]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn More About Mk Timothy →
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://www.linkedin.com/company/mktimothy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f0a]/50 hover:bg-[#2a1f0a]/80 rounded-lg text-[#C29F5D] text-sm transition-colors border border-[#C29F5D]/20"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com/Mk Timothy_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f0a]/50 hover:bg-[#2a1f0a]/80 rounded-lg text-[#C29F5D] text-sm transition-colors border border-[#C29F5D]/20"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter/X
                </a>
                <a
                  href="https://www.facebook.com/mktimothyexpanding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f0a]/50 hover:bg-[#2a1f0a]/80 rounded-lg text-[#C29F5D] text-sm transition-colors border border-[#C29F5D]/20"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
                <a
                  href="mailto:info@mktimothy.com"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f0a]/50 hover:bg-[#2a1f0a]/80 rounded-lg text-[#C29F5D] text-sm transition-colors border border-[#C29F5D]/20"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutTailwind>
  );
};

export default FormTailwind;
