"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Clock, DollarSign, Layers, Link, Lock, ShieldAlert, X } from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa6";

const StartTailwind = () => {
  return (
    <section className="h-full flex items-center justify-center px-4 py-8 pt-20 min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-3xl py-6 flex flex-col gap-6">
        {/* Main Card with original glass effect design */}
        <div className="bg-white/5 backdrop-blur-xl border border-orange-200 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Top Row: Logo */}
          <div className="flex items-center justify-center mb-4">
              <Image
                src="/images/mkwhite.png"
                alt="Mk Timothy Logo"
                width={200}
                height={100}
                className="max-w-[150px] w-full opacity-90 hover:opacity-100 transition-opacity"
              />
          </div>

          {/* Main Heading - Compact */}
          <div className="text-center mb-6">
            <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-light mb-3 leading-tight">
              East Africa's Premier Business & Investment Network
            </h1>
            <p className="text-[#e4c273] text-sm md:text-base font-medium italic mb-2">
              Your Next Opportunity Is One Step Away.
            </p>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto">
              Whether you're selling a business, seeking a joint venture partner, or looking for investors – Mk Timothy connects you with the right people.
            </p>
          </div>

          {/* Two Column Layout: Buttons + Benefits */}
          <div className="grid md:grid-cols-2 gap-4 items-center">
            {/* Left: CTA Buttons */}
            <div className="space-y-3">
              <Button
                as="link"
                href="/pitch-idea/form"
                variant="gradient"
                size="large"
                className="w-full justify-center text-sm py-3"
              >
                 START YOUR JOURNEY
              </Button>

              <Button
                as="link"
                href="/investors-login"
                variant="outline"
                size="large"
                className="w-full justify-center text-sm py-3 border-[#e4c273] text-[#e4c273] hover:bg-[#e4c273]/10"
              >
                EXPLORE OPPORTUNITIES
              </Button>
            </div>

            {/* Right: Benefits as compact list */}
            <div className="bg-orange-800/5 rounded-xl p-4 border border-orange-200">
              <p className="text-white text-sm font-medium mb-3 text-center md:text-left flex items-center justify-center md:justify-start gap-2">
                 GET STARTED
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#e4c273]/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-[#e4c273]" />
                  </div>
                  <span>Under 3 Minutes</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#e4c273]/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-3 h-3 text-[#e4c273]" />
                  </div>
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#e4c273]/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-3 h-3 text-[#e4c273]" />
                  </div>
                  <span>Zero Upfront Fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="text-center mt-6 pt-4 border-t border-gray-700/50">
            <p className="text-white/80 italic text-sm">
              "Turn ambition into reality with Mk Timothy."
            </p>
          </div>
        </div>

        {/* Premium Security Guarantee Section */}
        <div className="relative overflow-hidden bg-black/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl mt-4">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-600/10 blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-bold tracking-[0.15em] uppercase">Security Guarantee & Fraud Warning</span>
            </div>
            
            <h2 className="text-[#C29F5D] text-sm md:text-base font-semibold tracking-widest uppercase mb-4">
              100% Paperless • 100% Cashless • Bank-To-Bank Only
            </h2>
            
            <p className="text-white/70 text-sm max-w-xl mx-auto leading-relaxed mb-5">
              Mk Timothy communicates <span className="text-white font-semibold">EXCLUSIVELY</span> through our verified WhatsApp Business channel.
            </p>

            <div className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-green-500/30 hover:border-green-500/50 transition-colors px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.1)]">
              <FaWhatsapp className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-white font-mono font-medium tracking-wider">+256 200 902 209</span>
            </div>
          </div>

          {/* "We Never" Grid */}
          <div className="relative z-10 bg-black/40 border border-white/5 rounded-xl p-6 md:p-8">
            <h3 className="text-white/90 text-sm font-semibold tracking-wider uppercase mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              WE DON'T – WE NEVER
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-white/70 leading-relaxed">Call founders requesting payment</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-white/70 leading-relaxed">Accept cash or mobile money (MTN, Airtel)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-white/70 leading-relaxed">Send representatives to collect payments</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-white/70 leading-relaxed">Ask for banking passwords or PINs</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-white/70 leading-relaxed">Contact from personal mobile numbers</span>
              </div>
            </div>

            {/* Final Alert Banner */}
            <div className="mt-8 bg-red-950/30 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-200/90 text-sm leading-relaxed">
                <strong className="text-red-400 font-semibold mr-1">URGENT ACTION:</strong>
                If anyone calls claiming to be Mk Timothy demanding upfront fees or cash, <strong className="text-white">HANG UP</strong> and report them to our official WhatsApp immediately.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StartTailwind;
