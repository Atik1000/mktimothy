"use client";

import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Facebook,
  Footprints,
  Globe,
  Handshake,
  HelpCircle,
  Lightbulb,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Monitor,
  Mountain,
  PalmtreeIcon,
  Rocket,
  Search,
  Settings,
  Shield,
  Timer,
  TrendingUp,
  Twitter,
  Users,
  UserX,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactCodeInput from "react-code-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import LayoutTailwind from "./LayoutTailwind";

// Reusable Option Card Component - Icon Card Style (like reference)
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
    {/* Hidden Radio Input */}
    <input
      type="radio"
      className="sr-only"
      checked={selected}
      onChange={onChange}
    />

    {/* Selection checkmark */}
    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e4c273] flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-white" />
      </div>
    )}

    {/* Icon */}
    <div
      className={`
        w-12 h-12 rounded-full flex items-center justify-center mb-2
        ${selected ? "bg-[#e4c273]/20 text-[#e4c273]" : "bg-white/10 text-[#e4c273]/70 group-hover:text-[#e4c273]"}
        transition-all duration-200
      `}
    >
      {icon}
    </div>

    {/* Label */}
    <span
      className={`
        text-xs font-medium leading-tight mb-1
        ${selected ? "text-[#e4c273]" : "text-gray-300 group-hover:text-white"}
      `}
    >
      {label}
    </span>

    {/* Description */}
    {description && (
      <span className="text-[10px] md:text-xs text-white/50 leading-snug mt-1">
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
}: QuestionPageProps) => (
  <>
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#e4c273]/80 text-sm md:text-base">{subtitle}</p>
      )}
    </div>

    {/* Options Grid - Responsive */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {children}
        </div>

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
  const [agreements, setAgreements] = useState({
    accurate: false,
    paperless: false,
    whatsapp: false,
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    company: false,
    source: false,
    agreements: false,
  });

  useEffect(() => {
    if (searchParams.get("direct")) {
      setPage(5);
    }
  }, [searchParams]);

  const [q2Data, setQ2Data] = useState({
    name: "",
    industry: "",
    description: "",
    location: "",
    stage: "",
    teamSize: "",
  });

  const [q3Data, setQ3Data] = useState({
    revenue: "",
    profitability: "",
    capital: "",
    useOfFunds: "",
  });

  const [q4Data, setQ4Data] = useState({
    buyerType: "",
    valuation: "",
    reason: "",
    partnerType: "",
    partnerBring: "",
    investorType: "",
  });

  const [q5Data, setQ5Data] = useState({
    strengths: "",
    market: "",
    assets: "",
    investorStatus: "",
  });

  const [payload, setPayload] = useState([
    {
      question: "What Brings You to Mk Timothy Today?",
      number: 1,
      selected: "",
      answer: "",
    },
    {
      question: "Tell Us About Your Business or Idea",
      number: 2,
      selected: "",
      answer: "",
    },
    {
      question: "Financial Overview",
      number: 3,
      selected: "",
      answer: "",
    },
    {
      question: "Tell Us More About Your Goal",
      number: 4,
      selected: "",
      answer: "",
    },
    {
      question: "Additional Information",
      number: 5,
      selected: "",
      answer: "",
    },
    {
      question: "Contact Information & Verification",
      number: 6,
      selected: "",
      answer: "",
    },
  ]);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
  });

  const [otp, setotp] = useState("");
  const [otpState, setotpState] = useState(false);
  const [final, setfinal] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(true);
  const [otpError, setotpError] = useState({
    error: false,
    message: "Something went wrong please try again or enter a new number",
  });

  const handleOnChange = (
    question: number,
    answer: string,
    optionId: string,
  ) => {
    let newArray = payload.map((ques) => {
      if (ques.number === question) {
        return { ...ques, selected: optionId, answer: answer };
      }
      return ques;
    });
    setPayload(newArray);
    setTimeout(() => setPage(page + 1), 300);
  };

  const handleSignupFormChange = (
    event: React.ChangeEvent<HTMLInputElement>,
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
      company: userInfo.company === "" ? true : false,
      source: userInfo.source === "" ? true : false,
      agreements: !agreements.accurate || !agreements.paperless || !agreements.whatsapp,
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
        console.log(response.data.message);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
        setShowCaptcha(false);
        setotpState(true);
      })
      .catch((err) => {
        console.error("OTP Error:", err);
        let msg = "An error occurred";
        if (err.response && err.response.data && err.response.data.message) {
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
        window.alert(
          error.response && error.response.data
            ? error.response.data.message
            : error.message,
        );
        setotpError({
          error: true,
          message:
            "Something went wrong please try again or enter a new number",
        });
        setShowCaptcha(false);
        setButtonDisabled(false);
        setotpState(false);
        setVerifyButtonDisabled(false);
        return;
      });
  };

  const sendEmail = () => {
    const body = {
      questions: payload,
      user: userInfo,
    };

    axios
      .post("/api/pitch-idea/register", body)
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

  // Progress indicator
  const totalSteps = 6;
  const currentStep = Math.min(page + 1, totalSteps);
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <LayoutTailwind
      footerContent={
        page === 0 ? (
          <div className="mb-4">
            <p className="text-[#e4c273] text-xs font-semibold tracking-wider mb-1">
              🛡️ 100% Paperless & Cashless
            </p>
            <p className="text-white/70 text-xs">
              Mk Timothy only communicates via WhatsApp:{" "}
              <span className="font-bold text-white">+256 200 902 209</span>
            </p>
          </div>
        ) : page === 1 ? (
          <div className="mb-4">
            <p className="text-[#e4c273] text-xs font-semibold tracking-wider mb-1 flex items-center justify-center gap-1">
              Bank-to-Bank Only – No Cash, No Mobile Money
            </p>
            <p className="text-white/70 text-xs">
              Verified WhatsApp:{" "}
              <span className="font-bold text-white">+256 200 902 209</span>
            </p>
          </div>
        ) : page === 2 ? (
          <div className="mb-4">
            <p className="text-red-500 text-xs font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
              ⚠️ 🚨 BEWARE OF SCAMMERS 🚨
            </p>
            <p className="text-white/70 text-xs">
              Mk Timothy's ONLY communication channel is{" "}
              <span className="font-bold text-white">+256 200 902 209</span> (WhatsApp).
            </p>
            <p className="text-white/70 text-xs mt-1">
              We are 100% paperless and cashless – no cash, no mobile money.
            </p>
          </div>
        ) : page === 4 ? (
          <div className="mb-4">
            <p className="text-[#e4c273] text-xs font-semibold tracking-wider mb-1 flex items-center justify-center gap-1">
              Secure. Paperless. Cashless.
            </p>
            <p className="text-white/70 text-xs">
              All transactions are bank-to-bank. Report suspicious activity to{" "}
              <span className="font-bold text-white">+256 200 902 209</span>.
            </p>
          </div>
        ) : null
      }
    >
      {/* GLOBAL SMOOTH PROGRESS BAR WRAPPER FOR PAGES 0-4 */}
      {page < 5 && (
        <div className="min-h-[calc(100vh-70px)] flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <p className="text-[#e4c273]/60 text-sm uppercase tracking-wider mb-3">
                  Question {currentStep}/{totalSteps}
                </p>
                <div className="w-full max-w-xs mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C29F5D] to-[#e4c273] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(194,159,93,0.4)]"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Page 0: What Brings You */}
              {page === 0 && (
        <QuestionPage
          title="What Brings You to Mk Timothy Today?"
          subtitle="Select the option that best describes your goal:"
          currentStep={1}
          totalSteps={6}
          onPrevious={() => router.push("/pitch-idea")}
          onNext={() => setPage(1)}
          canGoNext={!!payload[0].selected}
        >
          <OptionCard
            label="Selling My Business"
            description="I want to find a buyer for my established business."
            icon={<Building2 className="w-6 h-6" />}
            selected={payload[0].selected === "opt-1"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = {
                  ...n[0],
                  selected: "opt-1",
                  answer: "Selling My Business",
                };
                return n;
              })
            }
          />
          <OptionCard
            label="Seeking a Joint Venture Partner"
            description="I want to partner with an investor or company."
            icon={<Handshake className="w-6 h-6" />}
            selected={payload[0].selected === "opt-2"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = {
                  ...n[0],
                  selected: "opt-2",
                  answer: "Seeking a Joint Venture Partner",
                };
                return n;
              })
            }
          />
          <OptionCard
            label="Looking for Investors"
            description="I have an idea or venture and need funding."
            icon={<Lightbulb className="w-6 h-6" />}
            selected={payload[0].selected === "opt-3"}
            onChange={() =>
              setPayload((prev) => {
                const n = [...prev];
                n[0] = {
                  ...n[0],
                  selected: "opt-3",
                  answer: "Looking for Investors",
                };
                return n;
              })
            }
          />
        </QuestionPage>
      )}

      {/* Page 1: Tell Us About Your Business or Idea */}
      {page === 1 && (
        <QuestionPage
          title="Tell Us About Your Business or Idea"
          currentStep={2}
          totalSteps={6}
          onPrevious={() => setPage(0)}
          onNext={() => {
            setPayload((prev) => {
              const n = [...prev];
              n[1] = {
                ...n[1],
                selected: "filled",
                answer: `Name: ${q2Data.name} | Industry: ${q2Data.industry} | Desc: ${q2Data.description} | Location: ${q2Data.location} | Stage: ${q2Data.stage} | Team: ${q2Data.teamSize}`,
              };
              return n;
            });
            setPage(2);
          }}
          canGoNext={
            !!q2Data.name &&
            !!q2Data.industry &&
            !!q2Data.description &&
            !!q2Data.location &&
            !!q2Data.stage &&
            !!q2Data.teamSize
          }
        >
          <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                  Business / Venture Name
                </label>
                <input
                  type="text"
                  placeholder="Enter business name"
                  value={q2Data.name}
                  onChange={(e) =>
                    setQ2Data({ ...q2Data, name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                  Industry / Sector
                </label>
                <select
                  value={q2Data.industry}
                  onChange={(e) =>
                    setQ2Data({ ...q2Data, industry: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="" className="bg-[#111] text-white">
                    Select sector
                  </option>
                  <option
                    value="Tourism & Hospitality"
                    className="bg-[#111] text-white"
                  >
                    Tourism & Hospitality
                  </option>
                  <option value="Healthcare" className="bg-[#111] text-white">
                    Healthcare
                  </option>
                  <option
                    value="Agriculture & Agribusiness"
                    className="bg-[#111] text-white"
                  >
                    Agriculture & Agribusiness
                  </option>
                  <option
                    value="Finance & Investment"
                    className="bg-[#111] text-white"
                  >
                    Finance & Investment
                  </option>
                  <option
                    value="Real Estate & Infrastructure"
                    className="bg-[#111] text-white"
                  >
                    Real Estate & Infrastructure
                  </option>
                  <option
                    value="Manufacturing"
                    className="bg-[#111] text-white"
                  >
                    Manufacturing
                  </option>
                  <option
                    value="Energy & Natural Resources"
                    className="bg-[#111] text-white"
                  >
                    Energy & Natural Resources
                  </option>
                  <option
                    value="ICT & Innovation"
                    className="bg-[#111] text-white"
                  >
                    ICT & Innovation
                  </option>
                  <option value="Other" className="bg-[#111] text-white">
                    Other
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Brief Description
              </label>
              <textarea
                placeholder="Tell us what you do, offer, or plan to build"
                value={q2Data.description}
                onChange={(e) =>
                  setQ2Data({ ...q2Data, description: e.target.value })
                }
                rows={2}
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country"
                value={q2Data.location}
                onChange={(e) =>
                  setQ2Data({ ...q2Data, location: e.target.value })
                }
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                  Current Stage
                </label>
                <select
                  value={q2Data.stage}
                  onChange={(e) =>
                    setQ2Data({ ...q2Data, stage: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="" className="bg-[#111] text-white">
                    Select current stage
                  </option>
                  <option value="Idea Stage" className="bg-[#111] text-white">
                    Idea Stage – Just a concept
                  </option>
                  <option value="Building" className="bg-[#111] text-white">
                    Building – Developing product or MVP
                  </option>
                  <option
                    value="First Revenue"
                    className="bg-[#111] text-white"
                  >
                    First Revenue – Made our first sale
                  </option>
                  <option value="Growing" className="bg-[#111] text-white">
                    Growing – Consistent revenue, proven traction
                  </option>
                  <option value="Scaling" className="bg-[#111] text-white">
                    Scaling – Ready for expansion
                  </option>
                  <option value="Established" className="bg-[#111] text-white">
                    Established – Profitable, stable business
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                  Team Size
                </label>
                <select
                  value={q2Data.teamSize}
                  onChange={(e) =>
                    setQ2Data({ ...q2Data, teamSize: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="" className="bg-[#111] text-white">
                    Select team size
                  </option>
                  <option value="Solo Founder" className="bg-[#111] text-white">
                    {" "}
                    Solo Founder
                  </option>
                  <option value="2-5" className="bg-[#111] text-white">
                    {" "}
                    2-5
                  </option>
                  <option value="6-20" className="bg-[#111] text-white">
                    {" "}
                    6-20
                  </option>
                  <option value="20+" className="bg-[#111] text-white">
                    {" "}
                    20+
                  </option>
                </select>
              </div>
            </div>
            </div>
        </QuestionPage>
      )}

      {/* Page 2: Financial Overview */}
      {page === 2 && (
        <QuestionPage
          title="Financial Overview"
          currentStep={3}
          totalSteps={6}
          onPrevious={() => setPage(1)}
          onNext={() => {
            setPayload((prev) => {
              const n = [...prev];
              n[2] = {
                ...n[2],
                selected: "filled",
                answer: `Revenue: ${q3Data.revenue} | Profitability: ${q3Data.profitability} | Capital: ${q3Data.capital} | Use: ${q3Data.useOfFunds}`,
              };
              return n;
            });
            setPage(3);
          }}
          canGoNext={
            !!q3Data.revenue &&
            !!q3Data.profitability &&
            !!q3Data.capital &&
            !!q3Data.useOfFunds
          }
        >
          <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                  Annual Revenue (USD)
                </label>
                <select
                  value={q3Data.revenue}
                  onChange={(e) =>
                    setQ3Data({ ...q3Data, revenue: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="" className="bg-[#111] text-white">Select revenue range</option>
                  <option value="Pre-Revenue" className="bg-[#111] text-white">Pre-Revenue</option>
                  <option value="Under $50,000" className="bg-[#111] text-white">Under $50,000</option>
                  <option value="$50,000 - $250,000" className="bg-[#111] text-white">$50,000 - $250,000</option>
                  <option value="$250,000 - $1,000,000" className="bg-[#111] text-white">$250,000 - $1,000,000</option>
                  <option value="$1,000,000 - $5,000,000" className="bg-[#111] text-white">$1,000,000 - $5,000,000</option>
                  <option value="$5,000,000+" className="bg-[#111] text-white">$5,000,000+</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                  Profitability
                </label>
                <select
                  value={q3Data.profitability}
                  onChange={(e) =>
                    setQ3Data({ ...q3Data, profitability: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="" className="bg-[#111] text-white">Select profitability</option>
                  <option value="Pre-Revenue / Break-even" className="bg-[#111] text-white">Pre-Revenue / Break-even</option>
                  <option value="Profitable" className="bg-[#111] text-white">Profitable</option>
                  <option value="High-Growth Profitable" className="bg-[#111] text-white">High-Growth Profitable</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Amount of Capital or Investment Sought
              </label>
              <input
                type="text"
                placeholder="Enter amount"
                value={q3Data.capital}
                onChange={(e) =>
                  setQ3Data({ ...q3Data, capital: e.target.value })
                }
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                How Would You Use the Funds?
              </label>
              <textarea
                placeholder="Describe use of funds"
                value={q3Data.useOfFunds}
                onChange={(e) =>
                  setQ3Data({ ...q3Data, useOfFunds: e.target.value })
                }
                rows={3}
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
              />
            </div>
          </div>
        </QuestionPage>
      )}

      {/* Page 3: Tell Us More About Your Goal */}
      {page === 3 && (
        <QuestionPage
          title="Tell Us More About Your Goal"
          currentStep={4}
          totalSteps={6}
          onPrevious={() => setPage(2)}
          onNext={() => {
            setPayload((prev) => {
              const n = [...prev];
              let ans = "";
              if (payload[0].selected === "opt-1") {
                ans = `Buyer: ${q4Data.buyerType} | Valuation: ${q4Data.valuation} | Reason: ${q4Data.reason}`;
              } else if (payload[0].selected === "opt-2") {
                ans = `Partner: ${q4Data.partnerType} | Brings: ${q4Data.partnerBring}`;
              } else if (payload[0].selected === "opt-3") {
                ans = `Investor: ${q4Data.investorType}`;
              }
              n[3] = {
                ...n[3],
                selected: "filled",
                answer: ans,
              };
              return n;
            });
            setPage(4);
          }}
          canGoNext={
            payload[0].selected === "opt-1"
              ? !!q4Data.buyerType && !!q4Data.valuation
              : payload[0].selected === "opt-2"
              ? !!q4Data.partnerType && !!q4Data.partnerBring
              : payload[0].selected === "opt-3"
              ? !!q4Data.investorType
              : false
          }
        >
          <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
            {payload[0].selected === "opt-1" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                    What type of buyer are you seeking?
                  </label>
                  <select
                    value={q4Data.buyerType}
                    onChange={(e) =>
                      setQ4Data({ ...q4Data, buyerType: e.target.value })
                    }
                    className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="" className="bg-[#111] text-white">Select buyer type</option>
                    <option value="Individual Buyer" className="bg-[#111] text-white">Individual Buyer</option>
                    <option value="Private Equity Firm" className="bg-[#111] text-white">Private Equity Firm</option>
                    <option value="Strategic Corporate Buyer" className="bg-[#111] text-white">Strategic Corporate Buyer</option>
                    <option value="Industry Competitor" className="bg-[#111] text-white">Industry Competitor</option>
                    <option value="No Preference" className="bg-[#111] text-white">No Preference</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                    Valuation Expectation (USD)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter range or 'Undetermined'"
                    value={q4Data.valuation}
                    onChange={(e) =>
                      setQ4Data({ ...q4Data, valuation: e.target.value })
                    }
                    className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                    Reason for Selling
                  </label>
                  <textarea
                    placeholder='Optional - e.g., retirement, new venture, strategic shift'
                    value={q4Data.reason}
                    onChange={(e) =>
                      setQ4Data({ ...q4Data, reason: e.target.value })
                    }
                    rows={2}
                    className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
                  />
                </div>
              </>
            )}

            {payload[0].selected === "opt-2" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                    What type of partner are you seeking?
                  </label>
                  <select
                    value={q4Data.partnerType}
                    onChange={(e) =>
                      setQ4Data({ ...q4Data, partnerType: e.target.value })
                    }
                    className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="" className="bg-[#111] text-white">Select partner type</option>
                    <option value="Financial Partner" className="bg-[#111] text-white">Financial Partner (Capital only)</option>
                    <option value="Strategic Partner" className="bg-[#111] text-white">Strategic Partner (Industry expertise)</option>
                    <option value="Operational Partner" className="bg-[#111] text-white">Operational Partner (Management)</option>
                    <option value="Technical Partner" className="bg-[#111] text-white">Technical Partner (Technology/IP)</option>
                    <option value="Other" className="bg-[#111] text-white">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                    What would the partner bring?
                  </label>
                  <textarea
                    placeholder="Describe what you're looking for"
                    value={q4Data.partnerBring}
                    onChange={(e) =>
                      setQ4Data({ ...q4Data, partnerBring: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
                  />
                </div>
              </>
            )}

            {payload[0].selected === "opt-3" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                    What type of investor are you seeking?
                  </label>
                  <select
                    value={q4Data.investorType}
                    onChange={(e) =>
                      setQ4Data({ ...q4Data, investorType: e.target.value })
                    }
                    className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="" className="bg-[#111] text-white">Select investor type</option>
                    <option value="Angel Investor" className="bg-[#111] text-white">Angel Investor</option>
                    <option value="Venture Capital" className="bg-[#111] text-white">Venture Capital</option>
                    <option value="Private Equity" className="bg-[#111] text-white">Private Equity</option>
                    <option value="Development Finance Institution (DFI)" className="bg-[#111] text-white">Development Finance Institution (DFI)</option>
                    <option value="Family Office" className="bg-[#111] text-white">Family Office</option>
                    <option value="No Preference" className="bg-[#111] text-white">No Preference</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </QuestionPage>
      )}

      {/* Page 4: Additional Information */}
      {page === 4 && (
        <QuestionPage
          title="Additional Information"
          currentStep={5}
          totalSteps={6}
          onPrevious={() => setPage(3)}
          onNext={() => {
            setPayload((prev) => {
              const n = [...prev];
              n[4] = {
                ...n[4],
                selected: "filled",
                answer: `Strengths: ${q5Data.strengths} | Market: ${q5Data.market} | Assets: ${q5Data.assets} | Status: ${q5Data.investorStatus}`,
              };
              return n;
            });
            setPage(5);
          }}
          canGoNext={
            !!q5Data.strengths &&
            !!q5Data.market &&
            !!q5Data.assets &&
            !!q5Data.investorStatus
          }
        >
          <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Key Strengths & Competitive Advantages
              </label>
              <textarea
                placeholder="Describe what makes your business, idea, or offer unique"
                value={q5Data.strengths}
                onChange={(e) =>
                  setQ5Data({ ...q5Data, strengths: e.target.value })
                }
                rows={2}
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Market Opportunity
              </label>
              <textarea
                placeholder="Describe the market size and growth potential"
                value={q5Data.market}
                onChange={(e) =>
                  setQ5Data({ ...q5Data, market: e.target.value })
                }
                rows={2}
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Key Assets
              </label>
              <textarea
                placeholder="Including intellectual property, patents, exclusive contracts, real estate, equipment, etc."
                value={q5Data.assets}
                onChange={(e) =>
                  setQ5Data({ ...q5Data, assets: e.target.value })
                }
                rows={2}
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#e4c273] font-medium tracking-wide uppercase">
                Current Investor or Partner Status (if applicable)
              </label>
              <select
                value={q5Data.investorStatus}
                onChange={(e) =>
                  setQ5Data({ ...q5Data, investorStatus: e.target.value })
                }
                className="w-full bg-white/5 border border-[#e4c273]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e4c273]/50 focus:bg-white/10 transition-colors outline-none appearance-none cursor-pointer relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e4c273' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option value="" className="bg-[#111] text-white">Select status</option>
                <option value="No investors or partners yet" className="bg-[#111] text-white">No investors or partners yet</option>
                <option value="Have some interest already" className="bg-[#111] text-white">Have some interest already</option>
                <option value="In discussions with potential partners" className="bg-[#111] text-white">In discussions with potential partners</option>
                <option value="Existing partners/investors onboard" className="bg-[#111] text-white">Existing partners/investors onboard</option>
              </select>
            </div>
          </div>
        </QuestionPage>
      )}
            </div>
          </div>
        </div>
      )}

      {/* Page 5: Signup Form */}
      {page === 5 && (
        <div className="min-h-[calc(100vh-70px)] flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-md bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-6 shadow-2xl">
              {otpState ? (
                // OTP Verification View
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
                // Signup Form View
                <div className="text-center mb-5">
                  <div className="mx-auto">
                    <Image
                      src="/images/mkwhite.png" 
                      alt="Carpfield"
                      width={200}
                      height={100}
                      className="w-full max-w-[150px] h-full mx-auto"
                    />
                  </div>
                  <h2 className="text-xl text-white font-medium mb-2">
                    Get Matched With Investors
                  </h2>
                  <p className="text-white/80 text-sm font-medium mb-1">
                    You're closer than you think.
                  </p>
                  <p className="text-white/60 text-xs">
                    Join Mk Timothy and connect with active investors.
                  </p>
                </div>
              )}

              {!otpState ? (
                // Signup Form
                <div className="space-y-4">
                  {/* Full Name */}
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

                  {/* Email */}
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

                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Phone Number
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

                  {/* Company / Business Name */}
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      Company / Business Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={userInfo.company}
                      onChange={handleSignupFormChange}
                      placeholder="Enter name"
                      className={`
                      w-full px-3 py-2.5 bg-transparent border rounded-lg text-white text-sm placeholder-white/70
                      focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D]
                      transition-all duration-300
                      ${formErrors.company ? "border-red-500" : "border-[#C29F5D]/70"}
                    `}
                    />
                    {formErrors.company && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter your company name
                      </p>
                    )}
                  </div>

                  {/* How did you hear about us? */}
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5">
                      How did you hear about us?
                    </label>
                    <select
                      name="source"
                      value={userInfo.source}
                      onChange={(e) => setUserInfo({ ...userInfo, source: e.target.value })}
                      className={`
                      w-full px-3 py-2.5 bg-transparent border rounded-lg text-white text-sm
                      focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 focus:border-[#C29F5D]
                      transition-all duration-300 appearance-none
                      ${formErrors.source ? "border-red-500" : "border-[#C29F5D]/70"}
                    `}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C29F5D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="" className="bg-[#111] text-white">Select option</option>
                      <option value="Referral" className="bg-[#111] text-white">Referral</option>
                      <option value="Web Search" className="bg-[#111] text-white">Web Search</option>
                      <option value="LinkedIn" className="bg-[#111] text-white">LinkedIn</option>
                      <option value="Conference / Event" className="bg-[#111] text-white">Conference / Event</option>
                      <option value="Social Media" className="bg-[#111] text-white">Social Media</option>
                      <option value="Other" className="bg-[#111] text-white">Other</option>
                    </select>
                    {formErrors.source && (
                      <p className="text-red-500 text-xs mt-1">
                        Please select how you heard about us
                      </p>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 mt-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={agreements.accurate}
                          onChange={() => setAgreements({ ...agreements, accurate: !agreements.accurate })}
                          className="sr-only peer"
                        />
                        <div
                          className={`
                          w-4 h-4 border-2 rounded transition-all duration-200
                          ${
                            agreements.accurate
                              ? "bg-[#C29F5D] border-[#C29F5D]"
                              : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"
                          }
                          ${formErrors.agreements && !agreements.accurate ? "border-red-500" : ""}
                        `}
                        >
                          {agreements.accurate && (
                            <CheckCircle className="w-3 h-3 text-black" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#C29F5D] font-light">
                        I confirm the information provided is accurate and complete.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={agreements.paperless}
                          onChange={() => setAgreements({ ...agreements, paperless: !agreements.paperless })}
                          className="sr-only peer"
                        />
                        <div
                          className={`
                          w-4 h-4 border-2 rounded transition-all duration-200
                          ${
                            agreements.paperless
                              ? "bg-[#C29F5D] border-[#C29F5D]"
                              : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"
                          }
                          ${formErrors.agreements && !agreements.paperless ? "border-red-500" : ""}
                        `}
                        >
                          {agreements.paperless && (
                            <CheckCircle className="w-3 h-3 text-black" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#C29F5D] font-light">
                        I understand Mk Timothy is 100% paperless and cashless – all payments are bank-to-bank.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={agreements.whatsapp}
                          onChange={() => setAgreements({ ...agreements, whatsapp: !agreements.whatsapp })}
                          className="sr-only peer"
                        />
                        <div
                          className={`
                          w-4 h-4 border-2 rounded transition-all duration-200
                          ${
                            agreements.whatsapp
                              ? "bg-[#C29F5D] border-[#C29F5D]"
                              : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"
                          }
                          ${formErrors.agreements && !agreements.whatsapp ? "border-red-500" : ""}
                        `}
                        >
                          {agreements.whatsapp && (
                            <CheckCircle className="w-3 h-3 text-black" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#C29F5D] font-light">
                        I confirm I will only communicate via +256 200 902 209 (WhatsApp).
                      </span>
                    </label>
                    {formErrors.agreements && (
                      <p className="text-red-500 text-xs mt-1">
                        Please agree to all terms to continue.
                      </p>
                    )}
                  </div>

                  {/* Error Display */}
                  {otpError.error && (
                    <div className="text-red-500 text-xs">
                      {otpError.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={() => {
                      setPayload((prev) => {
                        const n = [...prev];
                        n[5] = {
                          ...n[5],
                          selected: "filled",
                          answer: `Company: ${userInfo.company} | Source: ${userInfo.source} | Name: ${userInfo.name} | Phone: ${userInfo.phone} | Email: ${userInfo.email}`,
                        };
                        return n;
                      });
                      submit();
                    }}
                    disabled={buttonDisabled}
                    className={`
                    w-full py-3 mt-4 rounded-lg font-semibold text-sm
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
                        SUBMIT MY OPPORTUNITY
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[#e4c273]/70 text-xs">
                    Serious founders. Real investors. Real capital.
                  </p>

                  <div className="mt-8 border-t border-[#C29F5D]/20 pt-6">
                    <h3 className="text-center text-[#C29F5D] text-sm font-bold mb-4 flex items-center justify-center gap-2">
                    ⚠️ OFFICIAL SECURITY POLICY
                    </h3>
                    <p className="text-center text-white/80 text-[10px] font-bold tracking-wider mb-4">
                      100% PAPERLESS • 100% CASHLESS • BANK-TO-BANK ONLY
                    </p>
                    
                    <div className="bg-[#111]/80 rounded-lg overflow-hidden border border-[#C29F5D]/20">
                      <div className="bg-[#C29F5D]/10 px-3 py-2 border-b border-[#C29F5D]/20">
                        <p className="text-[#C29F5D] text-xs font-semibold flex items-center gap-1.5">
                          How to Verify Legitimate Communication
                        </p>
                      </div>
                      <div className="divide-y divide-[#C29F5D]/10">
                        <div className="flex px-3 py-2 text-xs">
                          <div className="w-24 text-white/60 font-medium">WhatsApp</div>
                          <div className="flex-1 text-white">Must be <span className="font-bold text-[#C29F5D]">+256 200 902 209</span></div>
                        </div>
                        <div className="flex px-3 py-2 text-xs">
                          <div className="w-24 text-white/60 font-medium">Email</div>
                          <div className="flex-1 text-white">Must end with <span className="font-bold text-[#C29F5D]">@mktimothy.com</span></div>
                        </div>
                        <div className="flex px-3 py-2 text-xs">
                          <div className="w-24 text-white/60 font-medium">Payments</div>
                          <div className="flex-1 text-white">Must be bank-to-bank transfer only</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // OTP Verification Form
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
                        border: "1px solid rgba(228, 194, 115, 0.3)",
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
                    bg-gradient-to-r from-[#C29F5D] to-[#C29F5D] text-black
                    hover:from-[#C29F5D] hover:to-[#d4a955]
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

      {/* Page 6: Success / Thank You */}
      {page === 6 && (
        <div className="min-h-screen flex flex-col pt-10 pb-20">
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#C29F5D]/30 rounded-2xl p-8 md:p-10 shadow-2xl">
              
              {/* Header */}
              <div className="text-center mb-8 border-b border-[#C29F5D]/20 pb-8">
                <div className="mx-auto">
                    <Image
                      src="/images/mkwhite.png" 
                      alt="Carpfield"
                      width={200}
                      height={100}
                      className="w-full max-w-[150px] h-full mx-auto"
                    />
                  </div>
                <h2 className="text-xl md:text-2xl text-white font-medium mb-3 flex items-center justify-center gap-2">
                   You're In – Welcome to the Network!
                </h2>
                <h3 className="text-[#C29F5D]/80 text-lg">
                  Your Submission Has Been Received.
                </h3>
              </div>

              {/* Body Content */}
              <div className="text-white/90 text-sm md:text-base leading-relaxed space-y-4 mb-10">
                <p>
                  Dear <span className="text-[#C29F5D] font-semibold">{userInfo.name || "Founder/Business Owner"}</span>,
                </p>
                <p>
                  <em className="text-[#C29F5D] not-italic font-semibold">Congratulations!</em> You've just taken the first step toward achieving your business goal – whether selling, partnering, or funding.
                </p>
                <p>
                  Your submission is now being reviewed by the Mk Timothy team.
                </p>
              </div>

              {/* Next Steps Table */}
              <div className="mb-10">
                <h3 className="text-[#C29F5D] font-semibold text-lg mb-4 flex items-center gap-2">
                  📋 Your Next Steps
                </h3>
                <div className="bg-[#111]/80 rounded-xl overflow-hidden border border-[#C29F5D]/20">
                  <div className="divide-y divide-[#C29F5D]/10">
                    <div className="flex px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="mr-3 text-[#C29F5D] font-bold">1</div>
                      <div className="flex-1 text-white/90">
                        <span className="font-semibold text-white">Check Your Email</span> – Click the confirmation link we just sent
                      </div>
                    </div>
                    <div className="flex px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="mr-3 text-[#C29F5D] font-bold">2</div>
                      <div className="flex-1 text-white/90">
                         <span className="font-semibold text-white">Review Process</span> – Our team will review your submission
                      </div>
                    </div>
                    <div className="flex px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="mr-3 text-[#C29F5D] font-bold">3</div>
                      <div className="flex-1 text-white/90">
                       <span className="font-semibold text-white">Matching</span> – We'll connect you with the right buyers, partners, or investors
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                <h2 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                  ⚠️ CRITICAL SECURITY NOTICE
                </h2>
                <h3 className="text-white font-semibold mb-6">
                  Mk Timothy & Company is 100% Paperless & Cashless
                </h3>
                
                <p className="text-white/80 text-sm mb-4 italic">
                  We only communicate and transact through:
                </p>
                
                <ul className="space-y-3 text-sm text-white/90 mb-6 font-medium">
                  <li className="flex items-center gap-2">
                    <span><span className="text-[#C29F5D]">WhatsApp:</span> +256 200 902 209 (Verified Business)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span><span className="text-[#C29F5D]">Email:</span> info@mktimothy.com</span>
                  </li>
                  <li className="flex items-center gap-2">
                      <span className="text-[#C29F5D]">Bank-to-Bank Transfers ONLY</span>
                  </li>
                </ul>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    <span className="font-bold">📌 Remember:</span><br/>
                    <strong className="text-white font-bold tracking-wide">If it's not from +256 200 902 209, it's not Mk Timothy.</strong>
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-[#C29F5D]/20">
                <a
                  href="/login"
                  className="flex-1 py-3 bg-gradient-to-r from-[#C29F5D] to-[#d4a955] text-white text-center rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Login to Your Account
                </a>
                <a
                  href="https://mktimothy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-transparent border border-[#C29F5D]/50 text-[#C29F5D] text-center rounded-lg font-bold text-sm hover:bg-[#C29F5D]/10 transition-colors"
                >
                  Explore Mk Timothy →
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
