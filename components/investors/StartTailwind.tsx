"use client";

import { ArrowRight, CheckCircle, Clock, Lock } from "lucide-react";
import Image from "next/image";

import LayoutTailwind from "./LayoutTailwind";
import { Button } from "../ui/Button";

const StartTailwind = () => {
  return (
    <LayoutTailwind>
      <div className="h-full flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-4xl mx-auto py-6">
          {/* Main Card - Horizontal Layout */}
          <div className="bg-white/5 backdrop-blur-xl border border-[#e4c273]/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:gap-8">
              {/* Left Side - Logo, Title, Description */}
              <div className="lg:w-1/2 lg:border-r lg:border-[#c89f4a]/20 lg:pr-8">
                <div className="flex flex-col gap-4 mb-4">
                  {/* Logo */}
                  <div className="mb-2">
                    <Image
                      src="/images/mkwhite.png"
                      alt="Mk Timothy Logo"
                      width={180}
                      height={60}
                      className="max-w-[140px] w-full opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div>
                    <div className="inline-block rounded-full px-4 py-1.5 mb-4 border border-[#c89f4a] bg-transparent">
                      <span className="text-[#c89f4a] uppercase tracking-[0.15em] text-[10px] font-semibold">
                        Investor Access – East Africa
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl text-white font-medium leading-tight">
                      Unlock East Africa's High-Growth Investment Frontier
                    </h1>
                  </div>
                </div>

                <p className="text-[#c89f4a] text-sm md:text-[15px] font-medium mb-4 italic">
                  Your Gateway to Uganda, Kenya, Tanzania, Rwanda & Beyond
                </p>

                <p className="text-white/80 text-sm md:text-[14px] leading-relaxed mb-4">
                  East Africa is emerging as one of the world's most compelling investment destinations. With a combined GDP exceeding $300 billion, a rapidly expanding consumer class, and transformative infrastructure projects underway – the opportunity is now.
                </p>
                <p className="text-white/80 text-sm md:text-[14px] leading-relaxed mb-6 lg:mb-0">
                  Mk Timothy & Company connects discerning investors with rigorously vetted opportunities across the region's most promising sectors.
                </p>

                {/* Why Join - Desktop */}
                {/* <div className="hidden lg:block mt-6">
                  <h3 className="text-[#c89f4a] text-[13px] font-semibold tracking-[0.1em] uppercase mb-4">
                    Why Partner With Us
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {[
                      { title: "Curated Deal Flow", desc: "Access to proprietary, diligence-ready opportunities" },
                      { title: "On-the-Ground Intelligence", desc: "Deep regional expertise and local networks" },
                      { title: "Flexible Structures", desc: "From minority stakes to full acquisitions" },
                      { title: "Trusted Reputation", desc: "A track record of connecting capital with impact" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2 pr-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c89f4a] flex-shrink-0 mt-1.5" />
                        <span className="text-white/90 text-[11px] leading-tight">
                          <strong className="text-white font-medium">{item.title}</strong> – {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div> */}
              </div>

              {/* Divider - Mobile */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#c89f4a]/30 to-transparent my-6 lg:hidden" />

              {/* Right Side - Benefits & CTAs */}
              <div className="lg:w-1/2 lg:pl-2 flex flex-col justify-center">
                {/* Benefits Icons */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-full border border-[#c89f4a] bg-transparent flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-[#c89f4a]" />
                    </div>
                    <span className="text-white/90 text-[11px] sm:text-xs">Under 2 mins</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-full border border-[#c89f4a] bg-transparent flex items-center justify-center mb-3">
                      <Lock className="w-5 h-5 text-[#c89f4a]" />
                    </div>
                    <span className="text-white/90 text-[11px] sm:text-xs">Confidential</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-full border border-[#c89f4a] bg-transparent flex items-center justify-center mb-3">
                      <CheckCircle className="w-5 h-5 text-[#c89f4a]" />
                    </div>
                    <span className="text-white/90 text-[11px] sm:text-xs">By Review</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3.5">
                  <Button
                    as="link"
                    href="/investors/form"
                    variant="gradient"
                    size="large"
                    className="w-full justify-center text-[13px] py-4 rounded-md tracking-wider"
                  >
                    YES, I AM IN!
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    as="link"
                    href="/investors-login"
                    variant="gradient"
                    size="large"
                    className="w-full justify-center text-[13px] py-4 rounded-md tracking-wider"
                  >
                    INVESTOR PANEL
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    as="link"
                    href="/pitch-idea"
                    variant="gradient"
                    size="large"
                    className="w-full justify-center text-[13px] py-4 rounded-md tracking-wider"
                  >
                    PITCH YOUR IDEA
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Footer note */}
                <div className="mt-5 text-center flex items-center justify-center gap-3">
                  <p className="text-white/80 text-[12px] italic flex items-center gap-1">
                    ⏱️ 2 minutes to register
                  </p>
                  <span className="text-white/30">|</span>
                  <p className="text-white/80 text-[12px] font-medium flex items-center gap-1">
                    🔒 100% Confidential
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutTailwind>
  );
};

export default StartTailwind;
