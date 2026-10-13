"use client";

import React, { useState, useEffect } from "react";
import NewpageMenuHeader from "@/components/newpage/NewpageMenuHeader";
import { useRouter } from "next/navigation";
import { useNewpageEngine } from "@/lib/hooks/useNewpageEngine";

interface TeamProfileTemplateProps {
  name: string;
  role: string;
  location?: string;
  imageSrc: string;
  linkedInUrl?: string;
  emailUrl?: string;
  bioParagraphs: string[];
  interests?: string[];
}

const TeamProfileTemplate: React.FC<TeamProfileTemplateProps> = ({
  name,
  role,
  location,
  imageSrc,
  linkedInUrl,
  emailUrl,
  bioParagraphs,
  interests,
}) => {
  const router = useRouter();
  useNewpageEngine();

  const cursorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let circleX = mouseX;
    let circleY = mouseY;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".hello")
      ) {
        if (cursorRef.current) cursorRef.current.style.opacity = "0";
      } else {
        if (cursorRef.current) cursorRef.current.style.opacity = "1";
      }
    };

    const animate = () => {
      circleX += (mouseX - circleX) * 0.15; // smooth easing
      circleY += (mouseY - circleY) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleClose = () => {
    if (window.getSelection()?.toString().length) return;
    window.location.assign("/team");
  };

  return (
    <>
      {/* Engine required DOM nodes */}
      <div id="loader" data-component="Loader" style={{ display: "none" }}>
        <div className="pixi-wrapper">
          <div data-component="LoaderPixiView"></div>
        </div>
        <div className="q-tail-orange-wrapper">
          <div data-component="QTail" data-size="0.26"></div>
        </div>
      </div>
      <div
        id="interloader"
        data-component="Interloader"
        style={{ display: "none" }}
      >
        <div data-component="QCircle"></div>
        <div data-component="QTail"></div>
      </div>

      <div className="hello">
        <NewpageMenuHeader
          menuBackgroundStyle="none"
          listingsVariant="dropdown"
          solutionsLinkMode="plain"
          loginLabel="Login"
          headerVariant="account"
          logoSrc="/images/mkorange.png"
          contactHref="https://contact.mktimothy.com/"
          portalHref="/investors-login/"
          headerZ="z-50"
          mobileScrollable={true}
        />
      </div>

      <div
        id="root"
        className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FA] relative"
        onClick={handleClose}
      >
        {/* Smooth Trailing Custom Cursor */}
        <div
          ref={cursorRef}
          className="pointer-events-none fixed z-[60] left-0 top-0 hidden lg:flex items-center justify-center w-[72px] h-[72px] -ml-[36px] -mt-[36px] rounded-full border border-[#0b2b56] bg-transparent transition-opacity duration-200 width"
        >
          <svg
            className="w-5 h-5 text-[#0b2b56]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Main Content Container matching Header Alignment */}
        <div className="relative z-10 mx-auto px-4 md:!px-8 lg:!px-12 w-full min-h-screen">
          <div className="grid md:grid-cols-2 h-full">
            <div className="w-full flex flex-col md:pr-8 lg:pr-16">
              {/* Mobile Close Button */}
              <div className="w-full flex pt-5 pb-3 md:hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/team");
                  }}
                  className="w-12 h-12 rounded-full border border-[#0b2b56] flex items-center justify-center text-[#0b2b56] hover:bg-[#0b2b56] hover:text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Right Image Column (Mobile view) */}
              <div className="w-full flex items-start justify-center overflow-hidden md:hidden mb-8">
                <img
                  src={imageSrc}
                  alt={name}
                  className="relative z-10 w-full object-cover object-top pointer-events-none"
                />
              </div>

              {/* Text Content */}
              <div className="w-full flex flex-col py-8 md:pt-32 md:pb-16 overflow-y-auto cursor-auto md:!max-w-[30vw] mx-auto">
                <div className="w-full flex hidden md:block lg:hidden pb-4 ">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/team");
                    }}
                    className="w-12 h-12 rounded-full border border-[#0b2b56] flex items-center justify-center text-[#0b2b56] hover:bg-[#0b2b56] hover:text-white transition-all duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-[24px] md:text-[30px] leading-tight font-serif text-[#0b2b56] tracking-tight mb-1">
                      {name}
                    </h1>
                    <h3 className="text-xs text-[#0b2b56] tracking-widest uppercase mt-2">
                      {role}{" "}
                      {location && (
                        <span className="italic normal-case font-medium">
                          , {location}
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex gap-4 items-center pb-1">
                    {linkedInUrl && (
                      <a
                        href={linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0b2b56] hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[22px] tracking-tighter leading-none">
                          in
                        </span>
                      </a>
                    )}
                    {emailUrl && (
                      <a
                        href={emailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0b2b56] hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                <hr className="mb-6 mt-2 border-t border-gray-300 w-full" />

                <div className="prose prose-lg text-gray-800 flex-grow max-w-none">
                  {bioParagraphs.map((text, idx) => (
                    <p
                      key={idx}
                      className="mb-6 leading-relaxed text-[15px] md:text-[17px]"
                    >
                      {text}
                    </p>
                  ))}
                </div>
                {interests && interests.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-semibold">
                      Areas of Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 md:px-4 md:py-2 bg-gray-100 rounded-full text-xs md:text-sm font-medium text-gray-700 border border-gray-200 shadow-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Removed the static X button since we now have the custom cursor closing the page */}
              </div>
            </div>

            {/* Sticky Right Column Spacer */}
            <div className="hidden md:block w-full h-full">
              <div className="sticky top-0 h-screen w-[50vw] bg-gray-100 flex items-start justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-[#fdfdfd] z-0 opacity-70"></div>
                <img
                  src={imageSrc}
                  alt={name}
                  className="relative z-10 w-full h-full object-cover object-top pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamProfileTemplate;