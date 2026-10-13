"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import Link from "next/link";

export default function HeroSection() {
  const { user } = useAuth();

  const isInvestor = user?.role === "INVESTOR";
  const isSeller = user?.role === "USER";

  const cta = isInvestor
    ? { text: "Explore Investment Opportunities", href: "/all-listings" }
    : isSeller
    ? { text: "List Your Business or Project", href: "/profile" }
    : { text: "Explore Investment Opportunities", href: "/all-listings" }; // default for guests

  return (
    <div className="relative bg-[url('/images/bgmainpage.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        ref={(el) => { if (el) el.playbackRate = 0.75; }} // 1.0 is normal speed, 0.75 is 25% slower
      >
        <source src="/videos/herobusinesses.mp4" type="video/mp4" />
      </video>
      
      

      <div className="width py-[80px] pt-[120px] relative z-10">
        <div className="text-center">
          <h1 className="text-white aabbss font-extrabold text-[24px] sm:text-[48px] mb-[30px] max-w-[779px] mx-auto">
            {isInvestor
              ? "Discover and Invest in Uganda's Best Opportunities"
              : isSeller
              ? "List, Manage, and Grow Your Business"
              : "Find, List, and Invest in Projects Tailored for Success"}
          </h1>
          <div className="inline-flex items-center border border-white rounded-[8px] px-[20px] sm:px-[40px] py-[8px] sm:py-[10px]">
            <Link
              href={cta.href}
              className="text-white aabbss font-bold text-[16px] sm:text-[20px]"
            >
              {cta.text}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
