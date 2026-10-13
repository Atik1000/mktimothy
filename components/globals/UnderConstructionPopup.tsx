"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function UnderConstructionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show in production environments to avoid disturbing local development
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Only show on the homepage
    if (pathname !== "/") {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl rounded-2xl bg-[#ffffff] p-6 shadow-2xl md:p-8 dark:bg-bglight"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-textdark dark:text-white font-montserrat">
                Site Under Maintenance
              </h2>
            </div>
            
            <p className="mb-4 text-sm text-[#4A4A4A] dark:text-lighttext md:text-base font-nunito">
              We are currently making some improvements to our website to provide you with a better experience. Because of this, you may encounter some broken links or incomplete pages.
            </p>
            
            <ul className="mb-8 space-y-3 text-sm text-[#4A4A4A] dark:text-lighttext md:text-base font-nunito">
              <li className="flex items-start">
                <span className="mr-3 font-bold text-greencolor mt-0.5">•</span>
                <span>We are aware of the current issues and our team is actively working to resolve them.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-greencolor mt-0.5">•</span>
                <span>If you require immediate assistance, please feel free to reach out to our team using our official contact channels.</span>
              </li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleClose}
                className="w-full sm:w-auto rounded-full bg-gray-200 dark:bg-bgdark px-6 py-2.5 text-sm font-semibold text-textdark dark:text-white transition-colors hover:bg-gray-300 dark:hover:bg-lightgray"
              >
                Close
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto rounded-full bg-custom-gradient px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
