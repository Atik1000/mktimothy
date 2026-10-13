"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [analytical, setAnalytical] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if the user has already made a choice in this session
    const hasConsented = sessionStorage.getItem("cookieConsent");
    
    // Define main pages where cookie consent should be shown
    const mainPages = [
      "/",
      // "/businesses",
      // "/blogs",
      // "/bankable-projects",
      // "/joint-ventures",
      // "/investment-projects",
      // "/businesses-for-sale",
      // "/all-listings",
      // "/investors"
    ];
    
    // Only show if no consent is given AND we are on a main page
    if (!hasConsented && mainPages.includes(pathname)) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [pathname]);

  const handleAcceptAll = () => {
    setAnalytical(true);
    setMarketing(true);
    saveConsent();
  };

  const handleOnlyNecessary = () => {
    setAnalytical(false);
    setMarketing(false);
    saveConsent();
  };

  const saveConsent = () => {
    sessionStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-bgdark rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="p-6 pb-4">
            <h2 className="text-[22px] font-bold text-white mb-3">
              Cookie settings
            </h2>
            <p className="text-white/80 text-[15px] leading-relaxed mb-6 font-medium">
              Mk Timothy &amp; Company and our partners save information on your
              device to offer a customized experience, enable visitor statistics,
              and support personalized marketing. You decide which types of
              cookies you accept in addition to the necessary ones needed for the
              website to work.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAcceptAll}
                className="w-full bg-[#ff6600] hover:bg-[#ff6600]/80 text-white font-bold py-3.5 px-4 rounded-full transition-colors text-[16px]"
              >
                Accept all
              </button>
              <button
                onClick={handleOnlyNecessary}
                className="w-full bg-bglight hover:bg-lightgray text-white font-bold py-3.5 px-4 rounded-full transition-colors text-[16px]"
              >
                Only necessary
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[15px]">
                  Analytical cookies
                </span>
                <button
                  type="button"
                  onClick={() => setAnalytical(!analytical)}
                  className={`relative flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    analytical ? "bg-[#ff6600]" : "bg-bglight"
                  }`}
                  role="switch"
                  aria-checked={analytical}
                >
                  <motion.span
                    animate={{ x: analytical ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow ring-0"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[15px]">
                  Marketing
                </span>
                <button
                  type="button"
                  onClick={() => setMarketing(!marketing)}
                  className={`relative flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    marketing ? "bg-[#ff6600]" : "bg-bglight"
                  }`}
                  role="switch"
                  aria-checked={marketing}
                >
                  <motion.span
                    animate={{ x: marketing ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow ring-0"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-bglight p-4 px-6 mt-2">
            <a
              href="https://company.mktimothy.com/cookie-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 hover:underline transition-colors flex items-center gap-2 text-[15px]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              Read more about our cookies
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
