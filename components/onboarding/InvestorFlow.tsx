"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  Coins,
  CreditCard,
  DollarSign,
  FastForward,
  Globe,
  Handshake,
  HelpCircle,
  Landmark,
  Lightbulb,
  Mountain,
  Rocket,
  Scale,
  Shield,
  TrendingUp,
  UserCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { QuestionPage } from "@/components/onboarding/QuestionPage";
import {
  fieldInvDetail,
  fieldSignup,
  labelBlock,
  selectInvSignup,
} from "@/components/onboarding/formFieldStyles";
import { useFormDraft } from "@/lib/hooks/useFormDraft";

/**
 * The 14-question investor onboarding questionnaire — pixel-identical to
 * components/investors/FormTailwind.tsx (same OptionCard, QuestionPage,
 * field styles, signup card, custom checkboxes, submit button). Draft is
 * persisted to localStorage so a user who navigates away mid-form returns
 * to the exact step + values.
 */

interface QItem {
  number: number;
  answer: string;
}

interface InvestorFlowProps {
  defaultName: string;
  defaultEmail: string;
  onSubmit: (data: {
    questions: QItem[];
    user: { name: string; email: string; phone: string; country: string };
  }) => Promise<void>;
  submitting: boolean;
}

const TOTAL_STEPS = 7; // 6 question pages + 1 contact page

type Draft = {
  page: number;
  choice: Record<number, string>;
  revenueRange: string;
  employees: string;
  businessType: string;
  engagement: string;
  planStatus: string;
  partnership: string;
  timeline: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  accredited: boolean;
  targetRegion: boolean;
};

export default function InvestorFlow({
  defaultName,
  defaultEmail,
  onSubmit,
  submitting,
}: InvestorFlowProps) {
  const [d, setD, clearDraft] = useFormDraft<Draft>("onboarding:investor", {
    page: 0,
    choice: {},
    revenueRange: "",
    employees: "",
    businessType: "",
    engagement: "",
    planStatus: "",
    partnership: "",
    timeline: "",
    referenceCode: "",
    name: defaultName,
    email: defaultEmail,
    phone: "",
    country: "",
    accredited: false,
    targetRegion: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const page = d.page;

  const CHOICES: Record<number, { label: string; desc?: string; icon: React.ReactNode }[]> = {
    1: [
      { label: "High-Net-Worth Individual", desc: "Deploying personal capital", icon: <UserCheck className="w-6 h-6" /> },
      { label: "Family Office", desc: "Managing multi-generational wealth", icon: <Landmark className="w-6 h-6" /> },
      { label: "Private Equity Firm", desc: "Institutional capital deployment", icon: <Building2 className="w-6 h-6" /> },
      { label: "Venture Capital Firm", desc: "Early to growth-stage investing", icon: <Rocket className="w-6 h-6" /> },
      { label: "Corporate Development", desc: "Strategic market entry", icon: <Briefcase className="w-6 h-6" /> },
      { label: "Development Finance Institution", desc: "Impact-driven capital", icon: <Globe className="w-6 h-6" /> },
      { label: "Joint Venture Partner", desc: "Collaborative investment structure", icon: <Handshake className="w-6 h-6" /> },
      { label: "Other", desc: "Please specify", icon: <HelpCircle className="w-6 h-6" /> },
    ],
    2: [
      { label: "Full Acquisition", desc: "Take complete ownership and control", icon: <Building2 className="w-6 h-6" /> },
      { label: "Strategic Joint Venture", desc: "Partner with established players", icon: <Handshake className="w-6 h-6" /> },
      { label: "Equity Capital Injection", desc: "Minority or majority stake", icon: <Coins className="w-6 h-6" /> },
      { label: "Entrepreneurship", desc: "Build from the ground up", icon: <Rocket className="w-6 h-6" /> },
      { label: "Build-to-Exit", desc: "Acquire, grow, and exit within 3-7 years", icon: <FastForward className="w-6 h-6" /> },
      { label: "Other", desc: "Please specify", icon: <HelpCircle className="w-6 h-6" /> },
    ],
    3: [
      { label: "$50,000 – $250,000", icon: <DollarSign className="w-6 h-6" /> },
      { label: "$250,000 – $500,000", icon: <DollarSign className="w-6 h-6" /> },
      { label: "$500,000 – $1,000,000", icon: <Banknote className="w-6 h-6" /> },
      { label: "$1,000,000 – $5,000,000", icon: <Banknote className="w-6 h-6" /> },
      { label: "$5,000,000 – $10,000,000", icon: <Wallet className="w-6 h-6" /> },
      { label: "$10,000,000+", icon: <Wallet className="w-6 h-6" /> },
      { label: "Flexible", desc: "Open to the right opportunity", icon: <Coins className="w-6 h-6" /> },
    ],
    4: [
      { label: "Full Buyout", desc: "100% ownership and control", icon: <Building2 className="w-6 h-6" /> },
      { label: "Controlling Interest", desc: "Majority stake with strategic influence", icon: <Scale className="w-6 h-6" /> },
      { label: "Minority Interest", desc: "Strategic equity position", icon: <Coins className="w-6 h-6" /> },
      { label: "Strategic Partnership", desc: "Joint venture or co-investment", icon: <Handshake className="w-6 h-6" /> },
      { label: "Passive Investment", desc: "Silent partner, hands-off approach", icon: <Wallet className="w-6 h-6" /> },
      { label: "Active Involvement", desc: "Operational role in the business", icon: <Briefcase className="w-6 h-6" /> },
      { label: "Other", desc: "Please specify", icon: <HelpCircle className="w-6 h-6" /> },
    ],
    5: [
      { label: "Uganda", desc: "The Pearl of Africa's thriving economy", icon: <Mountain className="w-6 h-6" /> },
      { label: "Kenya", desc: "East Africa's commercial powerhouse", icon: <Mountain className="w-6 h-6" /> },
      { label: "Tanzania", desc: "Resource-rich and growing rapidly", icon: <Mountain className="w-6 h-6" /> },
      { label: "Rwanda", desc: "Africa's rising tech hub", icon: <Mountain className="w-6 h-6" /> },
      { label: "South Sudan", desc: "Emerging frontier market", icon: <Mountain className="w-6 h-6" /> },
      { label: "East Africa Region", desc: "Multi-country strategy", icon: <Globe className="w-6 h-6" /> },
      { label: "Cross-Border", desc: "EAC-wide investment approach", icon: <Globe className="w-6 h-6" /> },
      { label: "No Geographic Restriction", desc: "Open to all", icon: <Globe className="w-6 h-6" /> },
    ],
    6: [
      { label: "Agriculture & AgriTech", desc: "Feeding Africa's future", icon: <Lightbulb className="w-6 h-6" /> },
      { label: "Renewable Energy", desc: "Powering sustainable growth", icon: <Lightbulb className="w-6 h-6" /> },
      { label: "Financial Services / Fintech", desc: "Banking the unbanked", icon: <CreditCard className="w-6 h-6" /> },
      { label: "Healthcare", desc: "Building healthier communities", icon: <Shield className="w-6 h-6" /> },
      { label: "Technology / SaaS", desc: "Digital transformation leaders", icon: <BarChart3 className="w-6 h-6" /> },
      { label: "Real Estate & Construction", desc: "Infrastructure boom", icon: <Building2 className="w-6 h-6" /> },
      { label: "Manufacturing", desc: "Industrialization in action", icon: <Briefcase className="w-6 h-6" /> },
      { label: "Retail & E-Commerce", desc: "The rise of the African consumer", icon: <CreditCard className="w-6 h-6" /> },
      { label: "Logistics & Transportation", desc: "Connecting markets", icon: <FastForward className="w-6 h-6" /> },
      { label: "Tourism & Hospitality", desc: "Africa's natural beauty", icon: <Mountain className="w-6 h-6" /> },
      { label: "Education", desc: "Investing in human capital", icon: <BookOpen className="w-6 h-6" /> },
      { label: "Mining & Natural Resources", desc: "Extractive industries", icon: <Mountain className="w-6 h-6" /> },
      { label: "Telecom & Mobile", desc: "Digital connectivity", icon: <TrendingUp className="w-6 h-6" /> },
      { label: "Other", desc: "Please specify", icon: <HelpCircle className="w-6 h-6" /> },
    ],
  };

  const PAGE_META = [
    { title: "Tell Us About Yourself", subtitle: "How would you classify your investment profile?" },
    { title: "Define Your Investment Ambition", subtitle: "What is your primary investment mandate?" },
    { title: "How Much Capital Are You Ready to Deploy?", subtitle: "Select your investment range (USD):" },
    { title: "How Do You Prefer to Invest?", subtitle: "What investment structure best aligns with your goals?" },
    { title: "Where Are You Looking to Invest?", subtitle: "Select your target market:" },
    { title: "Which Sectors Capture Your Interest?", subtitle: "Select the industry that aligns with your investment thesis:" },
  ];

  const PAGE_GRID: Record<number, string> = {
    1: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    2: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    3: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setD((prev) => ({ ...prev, [key]: value }));

  const canNext = (): boolean => {
    if (page < 6) return !!d.choice[page + 1];
    if (page === 6) return true;
    return !!d.name.trim() && !!d.phone.trim() && d.phone.replace(/\D/g, "").length >= 10 && !!d.country && d.accredited && d.targetRegion;
  };

  const goNext = () => {
    if (page < 6 && d.choice[page + 1]) {
      setD((prev) => ({ ...prev, page: prev.page + 1 }));
      setErrors({});
    } else if (page === 6) {
      setD((prev) => ({ ...prev, page: 7 }));
    }
  };
  const goPrev = () => page > 0 && setD((prev) => ({ ...prev, page: prev.page - 1 }));

  const buildQuestions = (): QItem[] => {
    const items: QItem[] = [];
    [1, 2, 3, 4, 5, 6].forEach((n) => {
      if (d.choice[n]) items.push({ number: n, answer: d.choice[n] });
    });
    if (d.revenueRange.trim()) items.push({ number: 7, answer: d.revenueRange.trim() });
    if (d.employees.trim()) items.push({ number: 8, answer: d.employees.trim() });
    if (d.businessType) items.push({ number: 9, answer: d.businessType });
    if (d.engagement) items.push({ number: 10, answer: d.engagement });
    if (d.planStatus) items.push({ number: 11, answer: d.planStatus });
    if (d.partnership) items.push({ number: 12, answer: d.partnership });
    if (d.timeline) items.push({ number: 13, answer: d.timeline });
    if (d.referenceCode.trim()) items.push({ number: 14, answer: d.referenceCode.trim() });
    return items;
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Please enter a valid email";
    if (!d.phone || d.phone.replace(/\D/g, "").length < 10) e.phone = "Please enter a valid phone number";
    if (!d.country) e.country = "Please select your country";
    if (!d.accredited) e.accredited = "Please confirm your investor status";
    if (!d.targetRegion) e.targetRegion = "Please confirm your investment region";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    await onSubmit({
      questions: buildQuestions(),
      user: { name: d.name.trim(), email: d.email.trim(), phone: d.phone, country: d.country },
    });
    // Clear the saved draft after a successful submit (the page redirects
    // home on success; if onSubmit threw, the draft is preserved).
    clearDraft();
  };

  return (
    <>
      {page < 6 && (
        <div className="w-full max-w-2xl mx-auto px-4 py-6">
          <QuestionPage
            currentStep={page + 1}
            totalSteps={TOTAL_STEPS}
            title={PAGE_META[page].title}
            subtitle={PAGE_META[page].subtitle}
            onPrevious={page > 0 ? goPrev : undefined}
            onNext={goNext}
            canGoNext={canNext()}
            gridCols={PAGE_GRID[page + 1]}
            showProgress={true}
            className=""
          >
            {CHOICES[page + 1].map((opt) => (
              <OptionCard
                key={opt.label}
                label={opt.label}
                description={opt.desc}
                icon={opt.icon}
                selected={d.choice[page + 1] === opt.label}
                onChange={() => set("choice", { ...d.choice, [page + 1]: opt.label })}
              />
            ))}
          </QuestionPage>
        </div>
      )}

      {page === 6 && (
        <div className="w-full max-w-xl mx-auto px-4 py-6">
          <div className="w-full bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-6 shadow-2xl">
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
                <label className={labelBlock}>Annual Revenue Range (if applicable)</label>
                <input className={fieldInvDetail} value={d.revenueRange} onChange={(e) => set("revenueRange", e.target.value)} placeholder="Enter details..." />
              </div>
              <div>
                <label className={labelBlock}>Number of Employees</label>
                <input className={fieldInvDetail} value={d.employees} onChange={(e) => set("employees", e.target.value)} placeholder="Enter details..." />
              </div>
              <div>
                <label className={labelBlock}>Preferred Business Type</label>
                <select className={fieldInvDetail} value={d.businessType} onChange={(e) => set("businessType", e.target.value)}>
                  <option className="bg-black" value="">Select option...</option>
                  <option className="bg-black">Family-Owned Enterprise</option>
                  <option className="bg-black">Startup / Early-Stage</option>
                  <option className="bg-black">Established SME</option>
                  <option className="bg-black">Franchise</option>
                  <option className="bg-black">Corporate Spin-Off</option>
                  <option className="bg-black">Other</option>
                </select>
              </div>

              <hr className="border-[#C29F5D]/20 my-2" />

              <div>
                <label className={labelBlock}>Post-Investment Engagement</label>
                <select className={fieldInvDetail} value={d.engagement} onChange={(e) => set("engagement", e.target.value)}>
                  <option className="bg-black" value="">Select option...</option>
                  <option className="bg-black">Active Management – Hands-on operational role</option>
                  <option className="bg-black">Board Representation – Strategic oversight</option>
                  <option className="bg-black">Advisory Capacity – Mentorship and guidance</option>
                  <option className="bg-black">Silent / Passive – Capital-only investment</option>
                </select>
              </div>

              <hr className="border-[#C29F5D]/20 my-2" />
              <p className="text-[#C29F5D] text-sm font-medium mb-2 text-center">
                For New Venture Launches
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelBlock}>Business Plan Status</label>
                  <select className={fieldInvDetail} value={d.planStatus} onChange={(e) => set("planStatus", e.target.value)}>
                    <option className="bg-black" value="">Select option...</option>
                    <option className="bg-black">Complete business plan prepared</option>
                    <option className="bg-black">Currently in development</option>
                    <option className="bg-black">Require assistance with development</option>
                  </select>
                </div>
                <div>
                  <label className={labelBlock}>Local Partnership Needs</label>
                  <select className={fieldInvDetail} value={d.partnership} onChange={(e) => set("partnership", e.target.value)}>
                    <option className="bg-black" value="">Select option...</option>
                    <option className="bg-black">Seeking local co-founder/partner</option>
                    <option className="bg-black">Self-managed operation</option>
                    <option className="bg-black">Undetermined at this time</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={labelBlock}>Projected Launch Timeline</label>
                  <select className={fieldInvDetail} value={d.timeline} onChange={(e) => set("timeline", e.target.value)}>
                    <option className="bg-black" value="">Select option...</option>
                    <option className="bg-black">Within 3 months</option>
                    <option className="bg-black">3-6 months</option>
                    <option className="bg-black">6-12 months</option>
                    <option className="bg-black">Flexible</option>
                  </select>
                </div>
              </div>

              <hr className="border-[#C29F5D]/20 my-2" />

              <div>
                <label className={labelBlock}>Partner Reference Code (Optional)</label>
                <input className={fieldInvDetail} value={d.referenceCode} onChange={(e) => set("referenceCode", e.target.value)} placeholder="Enter reference code..." />
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={goPrev}
                  className="flex items-center gap-2 px-6 py-3 text-[#C29F5D]/70 hover:text-[#C29F5D] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm bg-[#C29F5D] text-white hover:bg-[#f0d08a] transition-all duration-300"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 7 && (
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <div className="w-full bg-black/10 backdrop-blur-xl border border-[#C29F5D]/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <Image src="/images/mkwhite.png" alt="Mk Timothy" width={150} height={64} className="w-auto h-auto max-w-[150px] mb-3" />
              <h2 className="text-xl text-white font-medium mb-2">Investor Access – East Africa</h2>
              <p className="text-[#C29F5D] text-sm font-medium mb-2">Complete your registration</p>
              <p className="text-white/70 text-xs mt-1 text-center">A few contact details and we're done.</p>
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
                <label className={labelBlock}>Direct Contact Number</label>
                <input className={fieldSignup(!!errors.phone)} type="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className={labelBlock}>Country of Residence</label>
                <select className={selectInvSignup(!!errors.country)} value={d.country} onChange={(e) => set("country", e.target.value)}>
                  <option value="">Select Country...</option>
                  <option>Uganda</option>
                  <option>Kenya</option>
                  <option>Tanzania</option>
                  <option>Rwanda</option>
                  <option>South Sudan</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>United Arab Emirates</option>
                  <option>Other</option>
                </select>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>

              <hr className="border-[#C29F5D]/20 my-4" />

              {[
                { key: "accredited" as const, label: "I confirm that I am an accredited investor or qualified purchaser as defined under applicable securities laws.", err: errors.accredited },
                { key: "targetRegion" as const, label: "I confirm my investment interest is directed toward opportunities in Uganda and/or the East African region.", err: errors.targetRegion },
              ].map((c) => (
                <div key={c.key}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="sr-only peer" checked={d[c.key]} onChange={(e) => set(c.key, e.target.checked)} />
                    <div className={`w-4 h-4 flex-shrink-0 mt-0.5 border-2 rounded flex items-center justify-center transition-all duration-200 ${d[c.key] ? "bg-[#C29F5D] border-[#C29F5D]" : "border-[#C29F5D]/40 bg-transparent group-hover:border-[#C29F5D]/60"}`}>
                      {d[c.key] && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-[#C29F5D] font-light leading-snug">{c.label}</span>
                  </label>
                  {c.err && <p className="text-red-500 text-xs mt-1 ml-7">{c.err}</p>}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#C29F5D] to-[#C29F5D] text-white hover:from-[#C29F5D] hover:to-[#C29F5D] focus:outline-none focus:ring-1 focus:ring-[#C29F5D]/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? "SUBMITTING…" : "COMPLETE REGISTRATION"}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
