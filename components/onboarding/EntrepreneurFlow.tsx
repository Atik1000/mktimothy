"use client";

import React from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  Coins,
  DollarSign,
  Handshake,
  HelpCircle,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { QuestionPage } from "@/components/onboarding/QuestionPage";
import {
  fieldInlinePitch,
  fieldSignup,
  labelBlock,
  labelInlinePitch,
  selectChevronInline,
  selectChevronSignup,
  selectInlinePitchClass,
  textareaInlinePitch,
} from "@/components/onboarding/formFieldStyles";
import { useFormDraft } from "@/lib/hooks/useFormDraft";

/**
 * The pitch-idea / entrepreneur onboarding questionnaire — pixel-identical
 * to components/pitch-idea/FormTailwind.tsx, including the page-3 branch
 * (sell / joint-venture / raise). Draft is persisted to localStorage so a
 * user who navigates away mid-form returns to the exact step + values.
 */

interface QItem {
  number: number;
  answer: string;
}

interface EntrepreneurFlowProps {
  defaultName: string;
  defaultEmail: string;
  onSubmit: (data: {
    questions: QItem[];
    user: { name: string; email: string; phone: string; company: string; source: string };
  }) => Promise<void>;
  submitting: boolean;
}

const TOTAL_STEPS = 6; // 5 question pages + 1 contact page

type Draft = {
  page: number;
  goal: "sell" | "partner" | "investor" | "";
  bName: string;
  industry: string;
  description: string;
  location: string;
  stage: string;
  teamSize: string;
  revenue: string;
  profitability: string;
  capital: string;
  useOfFunds: string;
  buyerType: string;
  valuation: string;
  reason: string;
  partnerType: string;
  partnerBring: string;
  investorType: string;
  strengths: string;
  market: string;
  assets: string;
  invStatus: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  accurate: boolean;
  paperless: boolean;
  whatsapp: boolean;
};

export default function EntrepreneurFlow({
  defaultName,
  defaultEmail,
  onSubmit,
  submitting,
}: EntrepreneurFlowProps) {
  const [d, setD, clearDraft] = useFormDraft<Draft>("onboarding:entrepreneur", {
    page: 0,
    goal: "",
    bName: "",
    industry: "",
    description: "",
    location: "",
    stage: "",
    teamSize: "",
    revenue: "",
    profitability: "",
    capital: "",
    useOfFunds: "",
    buyerType: "",
    valuation: "",
    reason: "",
    partnerType: "",
    partnerBring: "",
    investorType: "",
    strengths: "",
    market: "",
    assets: "",
    invStatus: "",
    name: defaultName,
    email: defaultEmail,
    phone: "",
    company: "",
    source: "",
    accurate: false,
    paperless: false,
    whatsapp: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const page = d.page;

  const GOAL_OPTS = [
    { value: "sell" as const, label: "Selling My Business", desc: "I want to find a buyer for my established business.", icon: <Building2 className="w-6 h-6" /> },
    { value: "partner" as const, label: "Seeking a Joint Venture Partner", desc: "I want to partner with an investor or company.", icon: <Handshake className="w-6 h-6" /> },
    { value: "investor" as const, label: "Looking for Investors", desc: "I have an idea or venture and need funding.", icon: <Rocket className="w-6 h-6" /> },
  ];

  const INDUSTRIES = [
    "Tourism & Hospitality", "Healthcare", "Agriculture & Agribusiness",
    "Finance & Investment", "Real Estate & Infrastructure", "Manufacturing",
    "Energy & Natural Resources", "ICT & Innovation", "Other",
  ];

  const page1Valid = !!(d.bName && d.industry && d.description && d.location && d.stage && d.teamSize);
  const page2Valid = !!(d.revenue && d.profitability && d.capital && d.useOfFunds);
  const page3Valid = d.goal === "sell"
    ? !!(d.buyerType && d.valuation)
    : d.goal === "partner"
      ? !!(d.partnerType && d.partnerBring)
      : !!d.investorType;
  const page4Valid = !!(d.strengths && d.market && d.assets && d.invStatus);

  const canNext = (): boolean => {
    if (page === 0) return !!d.goal;
    if (page === 1) return page1Valid;
    if (page === 2) return page2Valid;
    if (page === 3) return page3Valid;
    if (page === 4) return page4Valid;
    return false;
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setD((prev) => ({ ...prev, [key]: value }));

  const buildQuestions = (): QItem[] => {
    const items: QItem[] = [];
    items.push({ number: 1, answer: GOAL_OPTS.find((o) => o.value === d.goal)?.label || "" });
    items.push({
      number: 2,
      answer: `Name: ${d.bName} | Industry: ${d.industry} | Desc: ${d.description} | Location: ${d.location} | Stage: ${d.stage} | Team: ${d.teamSize}`,
    });
    items.push({
      number: 3,
      answer: `Revenue: ${d.revenue} | Profitability: ${d.profitability} | Capital: ${d.capital} | UseOfFunds: ${d.useOfFunds}`,
    });
    if (d.goal === "sell") {
      items.push({ number: 4, answer: `BuyerType: ${d.buyerType} | Valuation: ${d.valuation} | Reason: ${d.reason || "n/a"}` });
    } else if (d.goal === "partner") {
      items.push({ number: 4, answer: `PartnerType: ${d.partnerType} | PartnerBring: ${d.partnerBring}` });
    } else {
      items.push({ number: 4, answer: `InvestorType: ${d.investorType}` });
    }
    items.push({ number: 5, answer: `Strengths: ${d.strengths} | Market: ${d.market} | Assets: ${d.assets} | InvestorStatus: ${d.invStatus}` });
    items.push({ number: 6, answer: d.industry });
    items.push({ number: 7, answer: d.stage });
    return items;
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Please enter a valid email";
    if (!d.phone || d.phone.replace(/\D/g, "").length < 10) e.phone = "Please enter a valid phone number";
    if (!d.company.trim()) e.company = "Please enter your company name";
    if (!d.source) e.source = "Please select how you heard about us";
    if (!d.accurate || !d.paperless || !d.whatsapp) e.agreements = "Please agree to all terms to continue";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    await onSubmit({
      questions: buildQuestions(),
      user: { name: d.name.trim(), email: d.email.trim(), phone: d.phone, company: d.company.trim(), source: d.source },
    });
    // Clear the saved draft after a successful submit.
    clearDraft();
  };

  const goNext = () => {
    if (page < 5) {
      setD((prev) => ({ ...prev, page: prev.page + 1 }));
      setErrors({});
    }
  };
  const goPrev = () => page > 0 && setD((prev) => ({ ...prev, page: prev.page - 1 }));

  return (
    <>
      {page < 5 && (
        <div className="w-full max-w-2xl mx-auto px-4 py-6">
          <QuestionPage
            currentStep={page + 1}
            totalSteps={TOTAL_STEPS}
            onPrevious={page > 0 ? goPrev : undefined}
            onNext={page < 5 ? goNext : undefined}
            canGoNext={canNext()}
            gridCols={page === 0 ? "grid-cols-1 sm:grid-cols-3 gap-3" : undefined}
            wrapGrid={page === 0}
            showProgress={true}
            className=""
          >
            {/* Page 0 — Goal */}
            {page === 0 && (
              <>
                <div className="text-center mb-8 sm:col-span-3">
                  <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">What brings you to Mk Timothy today?</h2>
                  <p className="text-[#e4c273]/80 text-sm md:text-base">Select the option that best describes your goal.</p>
                </div>
                {GOAL_OPTS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    icon={opt.icon}
                    selected={d.goal === opt.value}
                    onChange={() => set("goal", opt.value)}
                  />
                ))}
              </>
            )}

            {/* Page 1 — Business details (inline layout, no grid wrap) */}
            {page === 1 && (
              <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">Tell us about your business or idea</h2>
                  <p className="text-[#e4c273]/80 text-sm md:text-base">All fields are required.</p>
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Business / Venture Name</label>
                  <input className={fieldInlinePitch} value={d.bName} onChange={(e) => set("bName", e.target.value)} placeholder="Enter business name" />
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Industry / Sector</label>
                  <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.industry} onChange={(e) => set("industry", e.target.value)}>
                    <option value="">Select sector</option>
                    {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Brief Description</label>
                  <textarea className={textareaInlinePitch} rows={2} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell us what you do, offer, or plan to build" />
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Location</label>
                  <input className={fieldInlinePitch} value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`${labelInlinePitch} mb-1.5 block`}>Current Stage</label>
                    <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.stage} onChange={(e) => set("stage", e.target.value)}>
                      <option value="">Select current stage</option>
                      <option>Idea Stage – Just a concept</option>
                      <option>Building – Developing product or MVP</option>
                      <option>First Revenue – Made our first sale</option>
                      <option>Growing – Consistent revenue, proven traction</option>
                      <option>Scaling – Ready for expansion</option>
                      <option>Established – Profitable, stable business</option>
                    </select>
                  </div>
                  <div>
                    <label className={`${labelInlinePitch} mb-1.5 block`}>Team Size</label>
                    <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.teamSize} onChange={(e) => set("teamSize", e.target.value)}>
                      <option value="">Select team size</option>
                      <option>Solo Founder</option>
                      <option>2-5</option>
                      <option>6-20</option>
                      <option>20+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Page 2 — Financials */}
            {page === 2 && (
              <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">Financial overview</h2>
                  <p className="text-[#e4c273]/80 text-sm md:text-base">All fields are required.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`${labelInlinePitch} mb-1.5 block`}>Annual Revenue (USD)</label>
                    <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.revenue} onChange={(e) => set("revenue", e.target.value)}>
                      <option value="">Select revenue range</option>
                      <option>Pre-Revenue</option>
                      <option>Under $50,000</option>
                      <option>$50,000 - $250,000</option>
                      <option>$250,000 - $1,000,000</option>
                      <option>$1,000,000 - $5,000,000</option>
                      <option>$5,000,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className={`${labelInlinePitch} mb-1.5 block`}>Profitability</label>
                    <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.profitability} onChange={(e) => set("profitability", e.target.value)}>
                      <option value="">Select profitability</option>
                      <option>Pre-Revenue / Break-even</option>
                      <option>Profitable</option>
                      <option>High-Growth Profitable</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Amount of Capital or Investment Sought</label>
                  <input className={fieldInlinePitch} value={d.capital} onChange={(e) => set("capital", e.target.value)} placeholder="Enter amount" />
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>How would you use the funds?</label>
                  <textarea className={textareaInlinePitch} rows={3} value={d.useOfFunds} onChange={(e) => set("useOfFunds", e.target.value)} placeholder="Describe use of funds" />
                </div>
              </div>
            )}

            {/* Page 3 — Branched */}
            {page === 3 && (
              <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">Tell us more about your goal</h2>
                  <p className="text-[#e4c273]/80 text-sm md:text-base">Required fields marked.</p>
                </div>
                {d.goal === "sell" && (
                  <>
                    <div>
                      <label className={`${labelInlinePitch} mb-1.5 block`}>What type of buyer are you seeking? *</label>
                      <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.buyerType} onChange={(e) => set("buyerType", e.target.value)}>
                        <option value="">Select buyer type</option>
                        <option>Individual Buyer</option>
                        <option>Private Equity Firm</option>
                        <option>Strategic Corporate Buyer</option>
                        <option>Industry Competitor</option>
                        <option>No Preference</option>
                      </select>
                    </div>
                    <div>
                      <label className={`${labelInlinePitch} mb-1.5 block`}>Valuation Expectation (USD) *</label>
                      <input className={fieldInlinePitch} value={d.valuation} onChange={(e) => set("valuation", e.target.value)} placeholder="Enter range or 'Undetermined'" />
                    </div>
                    <div>
                      <label className={`${labelInlinePitch} mb-1.5 block`}>Reason for Selling (optional)</label>
                      <textarea className={textareaInlinePitch} rows={2} value={d.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g., retirement, new venture, strategic shift" />
                    </div>
                  </>
                )}
                {d.goal === "partner" && (
                  <>
                    <div>
                      <label className={`${labelInlinePitch} mb-1.5 block`}>What type of partner are you seeking? *</label>
                      <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.partnerType} onChange={(e) => set("partnerType", e.target.value)}>
                        <option value="">Select partner type</option>
                        <option>Financial Partner (Capital only)</option>
                        <option>Strategic Partner (Industry expertise)</option>
                        <option>Operational Partner (Management)</option>
                        <option>Technical Partner (Technology/IP)</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={`${labelInlinePitch} mb-1.5 block`}>What would the partner bring? *</label>
                      <textarea className={textareaInlinePitch} rows={3} value={d.partnerBring} onChange={(e) => set("partnerBring", e.target.value)} placeholder="Describe what you're looking for" />
                    </div>
                  </>
                )}
                {d.goal === "investor" && (
                  <div>
                    <label className={`${labelInlinePitch} mb-1.5 block`}>What type of investor are you seeking? *</label>
                    <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.investorType} onChange={(e) => set("investorType", e.target.value)}>
                      <option value="">Select investor type</option>
                      <option>Angel Investor</option>
                      <option>Venture Capital</option>
                      <option>Private Equity</option>
                      <option>Development Finance Institution (DFI)</option>
                      <option>Family Office</option>
                      <option>No Preference</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Page 4 — Additional info */}
            {page === 4 && (
              <div className="col-span-2 sm:col-span-3 space-y-5 text-left w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl md:text-3xl text-white font-medium mb-2">Additional information</h2>
                  <p className="text-[#e4c273]/80 text-sm md:text-base">All fields are required.</p>
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Key Strengths & Competitive Advantages</label>
                  <textarea className={textareaInlinePitch} rows={2} value={d.strengths} onChange={(e) => set("strengths", e.target.value)} placeholder="Describe what makes your business, idea, or offer unique" />
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Market Opportunity</label>
                  <textarea className={textareaInlinePitch} rows={2} value={d.market} onChange={(e) => set("market", e.target.value)} placeholder="Describe the market size and growth potential" />
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Key Assets</label>
                  <textarea className={textareaInlinePitch} rows={2} value={d.assets} onChange={(e) => set("assets", e.target.value)} placeholder="Including intellectual property, patents, exclusive contracts, real estate, equipment, etc." />
                </div>
                <div>
                  <label className={`${labelInlinePitch} mb-1.5 block`}>Current Investor or Partner Status (if applicable)</label>
                  <select className={selectInlinePitchClass} style={{ ...selectChevronInline }} value={d.invStatus} onChange={(e) => set("invStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option>No investors or partners yet</option>
                    <option>Have some interest already</option>
                    <option>In discussions with potential partners</option>
                    <option>Existing partners/investors onboard</option>
                  </select>
                </div>
              </div>
            )}
          </QuestionPage>
        </div>
      )}

      {/* Page 5 — Contact + agreements */}
      {page === 5 && (
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <div className="w-full bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <Image src="/images/mkwhite.png" alt="Mk Timothy" width={150} height={64} className="w-auto h-auto max-w-[150px] mb-3" />
              <h2 className="text-xl text-white font-medium mb-2">Get Matched With Investors</h2>
              <p className="text-white/80 text-sm font-medium mb-1">You're closer than you think.</p>
              <p className="text-white/60 text-xs text-center">Join Mk Timothy and connect with active investors.</p>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelBlock}>Full Name</label>
                <input className={fieldSignup(!!errors.name)} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter your full name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={labelBlock}>Professional Email</label>
                <input className={fieldSignup(!!errors.email)} type="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="address@mail.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelBlock}>Phone Number</label>
                <input className={fieldSignup(!!errors.phone)} type="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className={labelBlock}>Company / Business Name</label>
                <input className={fieldSignup(!!errors.company)} value={d.company} onChange={(e) => set("company", e.target.value)} placeholder="Enter name" />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className={labelBlock}>How did you hear about us?</label>
                <select
                  className={`${fieldSignup(!!errors.source)} appearance-none cursor-pointer relative`}
                  style={{ ...selectChevronSignup }}
                  value={d.source}
                  onChange={(e) => set("source", e.target.value)}
                >
                  <option value="">Select option</option>
                  <option className="bg-black">Referral</option>
                  <option className="bg-black">Web Search</option>
                  <option className="bg-black">LinkedIn</option>
                  <option className="bg-black">Conference / Event</option>
                  <option className="bg-black">Social Media</option>
                  <option className="bg-black">Other</option>
                </select>
                {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
              </div>

              <hr className="border-[#C29F5D]/20 my-4" />

              {[
                { key: "accurate" as const, label: "I confirm the information provided is accurate and complete." },
                { key: "paperless" as const, label: "I understand Mk Timothy is 100% paperless and cashless – all payments are bank-to-bank." },
                { key: "whatsapp" as const, label: "I confirm I will only communicate via +256 200 902 209 (WhatsApp)." },
              ].map((a) => (
                <label key={a.key} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" className="sr-only peer" checked={d[a.key]} onChange={(e) => set(a.key, e.target.checked)} />
                  <div className={`w-4 h-4 mt-0.5 border-2 rounded flex items-center justify-center transition-all duration-200 ${d[a.key] ? "bg-[#C29F5D] border-[#C29F5D]" : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"}`}>
                    {d[a.key] && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-[#C29F5D] font-light leading-snug">{a.label}</span>
                </label>
              ))}
              {errors.agreements && <p className="text-red-500 text-xs mt-1 ml-7">{errors.agreements}</p>}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#C29F5D] to-[#C29F5D] text-white hover:from-[#C29F5D] hover:to-[#C29F5D] focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? "SUBMITTING…" : "SUBMIT MY OPPORTUNITY"}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
