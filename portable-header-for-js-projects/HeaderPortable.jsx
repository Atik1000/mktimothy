"use client";

/**
 * ───────────────────────────────────────────────────────────────────────────
 *  PORTABLE HEADER — PLAIN JAVASCRIPT (JSX) VERSION
 *  For JavaScript Next.js projects (no TypeScript). Works in Pages Router
 *  (pages/_app.js) and App Router alike.
 * ───────────────────────────────────────────────────────────────────────────
 *  Pure navigation header: animated burger → ✕, full-screen menu overlay with
 *  hover-reactive background colours, animated Lottie "Q" blob, Sofia-Pro font.
 *  • NO auth (no Login / Dashboard / Profile / Logout, no bell).
 *  • Internal links open on the main site, e.g. Businesses →
 *    https://www.mktimothy.com/businesses
 *  • External links (Contact, Partner's Portal, footer legal) unchanged.
 *
 *  Install:  yarn add framer-motion @lottiefiles/dotlottie-react
 *  Usage:    <HeaderPortable logoSrc="/mkorange.png" />
 * ───────────────────────────────────────────────────────────────────────────
 */

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

/* Lottie blob — client-side only (canvas/WASM player). Hosted, no local file. */
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false },
);

const LOTTIE_SRC =
  "https://lottie.host/4ff38b75-1ff8-48fe-8119-d0b49b710e6f/mem8Xa1T7y.lottie";

function QBlob({ isLightBg }) {
  return (
    <div className="relative w-full h-full">
      <div
        className="w-full h-full"
        style={{
          mixBlendMode: isLightBg ? "normal" : "screen",
          filter: isLightBg ? "saturate(1.1)" : "brightness(1.35)",
          transition: "filter 0.35s ease",
        }}
      >
        <DotLottieReact
          src={LOTTIE_SRC}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {/* Q tail */}
      <div
        className="absolute"
        style={{
          width: "30%",
          height: "44%",
          bottom: "2%",
          right: "6%",
          transform: "rotate(-45deg)",
          borderRadius: "6px",
          background: isLightBg
            ? "rgba(39,12,65,0.16)"
            : "rgba(255,255,255,0.14)",
          transition: "background 0.35s ease",
        }}
      />
    </div>
  );
}

/* Main site that all internal menu links are prefixed with. */
const DEFAULT_BASE_URL = "https://www.mktimothy.com";

const BG_COLORS = {
  "orange-blob": "#ffffff",
  "blue-blob": "#ffffff",
  bubble: "#acb5ba",
  lines: "#270c41",
  Q: "#270c41",
  particles: "#270c41",
  default: "#270c41",
};
const LIGHT_BACKGROUNDS = new Set(["orange-blob", "blue-blob", "bubble"]);

const MENU_ITEMS = [
  {
    href: "/about-us",
    label: "About us",
    bg: "orange-blob",
    textColor: "white",
    videoSrc: "/videos/Contactus.mp4",
  },
  {
    href: "/team",
    label: "Strategic Partners",
    bg: "lines",
    textColor: "dark",
    videoSrc: "/videos/footer_media.mp4",
  },
  {
    href: "/businesses",
    label: "Businesses",
    bg: "Q",
    textColor: "dark",
    videoSrc: "/videos/herobusinesses.mp4",
  },
  {
    href: "/solutions",
    label: "Solutions",
    bg: "blue-blob",
    textColor: "light",
    videoSrc: "/videos/Header_FinancialServices.mp4",
  },
  // { href: "/news", label: "Media", bg: "bubble", textColor: "white" },
  {
    href: "/blogs",
    label: "Blogs",
    bg: "Q",
    textColor: "dark",
    videoSrc: "/videos/Header_Utilities.mp4",
  },
  {
    href: "/all-listings",
    label: "Listings",
    bg: "blue-blob",
    textColor: "light",
    videoSrc: "/videos/Header_Hospitality.mp4",
  },
];

const HeaderPortable = ({
  logoSrc = "/mkorange.png",
  hidden = false,
  baseUrl = DEFAULT_BASE_URL,
  contactUrl = "https://contact.mktimothy.com/",
  partnerPortalUrl = "/investors-login/",
  // "dark"  → white top-bar text/burger (for dark page backgrounds, default)
  // "light" → dark  top-bar text/burger (for WHITE/light page backgrounds)
  theme = "dark",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredBg, setHoveredBg] = useState("default");
  const [hoveredLabel, setHoveredLabel] = useState(null);

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  // Lock body scroll while the menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Internal links (starting with "/") open on the main site; absolute URLs unchanged.
  const handleNavigation = (href) => {
    setIsMenuOpen(false);
    const url = href.startsWith("/")
      ? `${baseUrl.replace(/\/$/, "")}${href}`
      : href;
    window.location.href = url;
  };

  const bgColor = BG_COLORS[hoveredBg] ?? "#270c41";
  const isLightBg = LIGHT_BACKGROUNDS.has(hoveredBg);

  let activeVideo = "/videos/headerCPG.mp4"; // Default background video
  if (hoveredLabel === "Invest In Uganda") {
    activeVideo = "/videos/UtilitiesResources.mp4";
  } else if (hoveredLabel) {
    const foundItem = MENU_ITEMS.find((item) => item.label === hoveredLabel);
    if (foundItem?.videoSrc) {
      activeVideo = foundItem.videoSrc;
    }
  }

  // Top-bar text + burger colour:
  //   • While menu is OPEN  → always white (overlay is dark)
  //   • While menu is CLOSED → white for dark pages, dark (#270c41) for light pages
  const topBarColor = isMenuOpen
    ? "#ffffff"
    : theme === "light"
      ? "#270c41"
      : "#ffffff";

  const itemColor = (item) =>
    isLightBg && (item.textColor === "dark" || item.textColor === "light")
      ? "#270c41"
      : "#ffffff";

  // Centering wrapper used by both the top bar and the menu content.
  // Inline styles (not the `.width` class) so it works in ANY project without
  // depending on that project's Tailwind config / custom utilities.
  const containerStyle = {
    width: "100%",
    maxWidth: "1440px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  /* shared top bar */
  const topBar = (
    <div
      style={containerStyle}
      className="flex justify-between items-center h-full px-5 py-7 relative z-[61]"
    >
      <div
        onClick={() => handleNavigation("/")}
        className="cursor-pointer z-[61]"
      >
        <Image
          src={logoSrc}
          alt="Logo"
          width={150}
          height={50}
          className="h-[40px] sm:h-[50px] w-auto"
        />
      </div>

      <div className="flex items-center gap-5 md:gap-10 justify-end">
        <div className="hidden md:flex items-center gap-7 mt-2">
          <a
            href={contactUrl}
            className="font-sofia text-[15px] tracking-wide hover:opacity-70 transition-opacity"
            style={{ color: topBarColor }}
          >
            Contact Us
          </a>
          {/* Login Dropdown */}
          <div className="relative group cursor-pointer">
            <div
              className="font-sofia text-[15px] tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1 whitespace-nowrap"
              style={{ color: topBarColor }}
            >
              Login Portal
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            <div className="absolute top-[120%] right-0 w-[280px] bg-[#000]/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden text-left">
              <div className="p-5">
                <div className="text-white font-semibold text-[17px] mb-5 drop-shadow-md">
                  Investor & Founder Access
                </div>
                
                {/* Investors Portal */}
                <div className="mb-4">
                  <div className="text-[#FF6600] font-medium text-[16px] mb-1 drop-shadow-md">
                    Investors Portal
                  </div>
                  <div className="text-white/80 text-[13px] leading-[1.4] mb-4 drop-shadow-md">
                    Vetted opportunities<br/>
                    Flexible structures & confidential
                  </div>
                  <div className="flex flex-col gap-5">
                    <a href={`${baseUrl.replace(/\/$/, "")}/investors-login`} className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                      <span className="text-[14px]">🔐</span> LOGIN
                    </a>
                    <a href={`${baseUrl.replace(/\/$/, "")}/investors`} className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                      <span className="text-[14px]">✨</span> REGISTER
                    </a>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-4 mx-1" />

                {/* Entrepreneur Portal */}
                <div>
                  <div className="text-[#FF6600] font-medium text-[16px] mb-1 drop-shadow-md">
                    Entrepreneur Portal
                  </div>
                  <div className="text-white/80 text-[13px] leading-[1.4] mb-4 drop-shadow-md">
                    Showcase your business<br/>
                    Find strategic partners
                  </div>
                  <div className="flex flex-col gap-5">
                    <a href={`${baseUrl.replace(/\/$/, "")}/login`} className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                      <span className="text-[14px]">🔐</span> LOGIN
                    </a>
                    <a href={`${baseUrl.replace(/\/$/, "")}/pitch-idea`} className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                      <span className="text-[14px]">✨</span> REGISTER
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated burger → ✕ */}
        <button
          onClick={toggleMenu}
          className="relative w-9 h-8 flex flex-col justify-center items-center cursor-pointer z-[61] focus:outline-none gap-0"
          aria-label="Toggle navigation menu"
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="block w-7 h-[2px] rounded-full origin-center"
            style={{ backgroundColor: topBarColor }}
          />
          <div className="h-[10px]" />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="block w-7 h-[2px] rounded-full origin-center"
            style={{ backgroundColor: topBarColor }}
          />
        </button>
      </div>
    </div>
  );

  if (hidden) return null;

  // Header positioning + background:
  //  • light theme, menu CLOSED → solid white sticky bar (visible on a white
  //    page and it takes its own space at the top).
  //  • menu OPEN (any theme)    → transparent so the dark menu overlay shows
  //    through seamlessly behind the logo + ✕.
  //  • dark theme               → floats (absolute) over the hero.
  const headerClass =
    theme === "light"
      ? `z-[60] w-full sticky top-0 ${isMenuOpen ? "bg-transparent" : "bg-white shadow-sm"}`
      : "z-[60] w-full absolute";

  return (
    <>
      <header className={headerClass}>{topBar}</header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="header-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 overflow-hidden"
            style={{
              backgroundColor: activeVideo ? "#270c41" : bgColor,
              transition: "background-color 0.35s ease",
            }}
          >
            {/* Background Video Layer */}
            <AnimatePresence>
              {activeVideo && (
                <motion.video
                  key={activeVideo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={activeVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Video Dark Overlay for Readability */}
            {activeVideo && (
              <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            )}

            {/* Right-side gradient panel */}
            <div className="absolute right-0 top-0 h-full w-full sm:w-1/2 lg:w-1/3 pointer-events-none">
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hoveredBg === "lines" ? 0.7 : 0,
                  background:
                    "linear-gradient(to left, rgba(39,12,65,0.95), transparent)",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hoveredBg === "Q" ? 0.5 : 0,
                  background:
                    "linear-gradient(to left, rgba(39,12,65,0.7), transparent)",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hoveredBg === "orange-blob" ? 1 : 0,
                  background:
                    "linear-gradient(to left, #ff6600, rgba(255,102,0,0))",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hoveredBg === "blue-blob" ? 1 : 0,
                  background:
                    "linear-gradient(to left, #4a8fe0, rgba(74,143,224,0))",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hoveredBg === "bubble" ? 1 : 0,
                  background:
                    "linear-gradient(to left, #acb5ba, rgba(172,181,186,0))",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: hoveredBg === "particles" ? 0.8 : 0,
                  background:
                    "linear-gradient(to left, rgba(39,12,65,0.9), transparent)",
                }}
              />
            </div>

            {/* Animated Lottie Q blob */}
            <AnimatePresence>
              {!activeVideo && (
                <div className="absolute inset-0 flex !items-center !justify-center pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                    className="relative"
                    style={{
                      width: "42vw",
                      maxWidth: "520px",
                      aspectRatio: "1",
                    }}
                  >
                    <QBlob isLightBg={isLightBg} />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Menu content */}
            <div
              style={containerStyle}
              className="px-5 sm:px-16 flex flex-col h-full !items-end"
            >
              <div className="flex-shrink-0 h-28" />

              <div className="flex !justify-end !items-center flex-1">
                <ul className="text-[25px] md:text-[35px] md:leading-[55px] uppercase flex flex-col !items-end font-sofia">
                  {MENU_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ x: 80, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 60, opacity: 0 }}
                      transition={{
                        delay: i * 0.045,
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex-shrink-0 cursor-pointer select-none"
                      onMouseEnter={() => {
                        setHoveredBg(item.bg);
                        setHoveredLabel(item.label);
                      }}
                      onMouseLeave={() => {
                        setHoveredBg("default");
                        setHoveredLabel(null);
                      }}
                      style={{
                        opacity:
                          hoveredBg !== "default" && hoveredBg !== item.bg
                            ? 0.35
                            : 1,
                        transition: "opacity 0.2s ease",
                        color: itemColor(item),
                      }}
                    >
                      <a
                        onClick={() => handleNavigation(item.href)}
                        className="inline-block py-0.5 cursor-pointer transition-[padding] duration-200 hover:pr-2"
                      >
                        <span>{item.label}</span>
                      </a>
                    </motion.li>
                  ))}

                  {/* Mobile-only: Invest in Uganda */}
                  <motion.li
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{
                      delay: MENU_ITEMS.length * 0.045,
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex-shrink-0 cursor-pointer block lg:hidden"
                    style={{ color: isLightBg ? "#270c41" : "#ffffff" }}
                    onMouseEnter={() => {
                      setHoveredBg("particles");
                      setHoveredLabel("Invest In Uganda");
                    }}
                    onMouseLeave={() => {
                      setHoveredBg("default");
                      setHoveredLabel(null);
                    }}
                  >
                    <a
                      onClick={() => handleNavigation("/invest-in-uganda")}
                      className="inline-block py-0.5"
                    >
                      <span>Invest In Uganda</span>
                    </a>
                  </motion.li>
                </ul>
              </div>

              {/* Footer links */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4 }}
                className="flex flex-col-reverse lg:flex-row lg:justify-between lg:items-baseline flex-shrink-0 mb-6 lg:mb-10"
              >
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-[14px] uppercase font-light tracking-tighter mt-8 lg:mt-0"
                  style={{
                    color: isLightBg
                      ? "rgba(39,12,65,0.45)"
                      : "rgba(255,255,255,0.45)",
                  }}
                >
                  <a
                    href="https://company.mktimothy.com/definitions.html"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Definitions
                  </a>
                  <a
                    href="https://company.mktimothy.com/terms.html"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Terms &amp; Conditions
                  </a>
                  <a
                    href="https://company.mktimothy.com/privacy.html"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Privacy Notice
                  </a>
                  <a
                    href="https://company.mktimothy.com/cookie-policy.html"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Cookie Policy
                  </a>
                </div>
                <div
                  className="hidden lg:block text-[22px] lg:text-[41px] uppercase tracking-tighter font-sofia cursor-pointer"
                  style={{
                    color: isLightBg
                      ? "rgba(39,12,65,0.65)"
                      : "rgba(255,255,255,0.65)",
                  }}
                  onMouseEnter={() => {
                    setHoveredBg("particles");
                    setHoveredLabel("Invest In Uganda");
                  }}
                  onMouseLeave={() => {
                    setHoveredBg("default");
                    setHoveredLabel(null);
                  }}
                >
                  <a onClick={() => handleNavigation("/invest-in-uganda")}>
                    Invest in Uganda
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderPortable;
