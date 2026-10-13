"use client";

import { ReactNode } from "react";
import LightRays from "../investors/LightRays";

interface LayoutProps {
  children: ReactNode;
  footerContent?: ReactNode;
}

const LayoutTailwind = ({ children, footerContent }: LayoutProps) => {
  return (
    <div
      className="h-screen relative font-helvetica overflow-y-auto flex flex-col bg-cover bg-center bg-no-repeat pt-20"
      style={{ backgroundImage: "url('/images/background2.png')" }}
    >
      {/* Animated Light Rays Background */}
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

      {/* Main Content */}
      <main className="relative z-10 flex-1">{children}</main>
      <footer className="relative z-10 py-6 text-center">
        {footerContent}
        <p className="text-sm">
          <em>
            <strong className="text-[#C29F5D]">
              Grow your idea with Mk Timothy
            </strong>
          </em>
        </p>
      </footer>
    </div>
  );
};

export default LayoutTailwind;
