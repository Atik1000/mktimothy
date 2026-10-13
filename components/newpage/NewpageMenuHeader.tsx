"use client";

/**
 * <NewpageMenuHeader />
 * --------------------
 * Shared menu-overlay + header for every page under `app/(newpage)/`.
 *
 * Why this exists
 * ---------------
 * The full-screen menu (`#menu`) and the fixed `#header` used to be
 * copy-pasted into ~30 page files. That duplication meant:
 *   1. The legacy engine's (app-1.0.12.js) GSAP open/close animation
 *      fought with React-rendered children placed inside the animated
 *      `.background` node — hovering during the close animation remounted
 *      a keyed `<motion.video>` and snapped the menu back open.
 *   2. Any fix had to be replicated 30 times.
 *
 * This component renders the menu with the engine-safe structure (no keyed
 * React children inside `.background`) and the hover-driven background video
 * in a sibling overlay that is only mounted while the menu is settled. The
 * fragile close-fix logic lives here exactly once.
 *
 * Per-page variation (logo, links, colors, listings layout, etc.) is passed
 * in as props so each page keeps its current appearance.
 */

import { useAuth } from "@/lib/providers/auth-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export type NewpageMenuHeaderProps = {
  /** Inline background-color on the engine-animated `.background` node.
   *  "none" omits the style (the `bg-darkpurple` class wins). */
  menuBackgroundStyle?: "none" | "orange" | "#efba0f";
  /** Listings menu item: plain link vs. hover dropdown with 5 sub-items. */
  listingsVariant?: "plain" | "dropdown";
  /** Solutions link: plain `<a href>` vs. `onClick handleNavigation`. */
  solutionsLinkMode?: "plain" | "onClick";
  /** Label of the login button inside the menu list. */
  loginLabel?: "Login" | "LOGIN";
  /** Header variant: "account" = Login/Account dropdown (homepage style);
   *  "portal" = plain "Partner's Portal" + "Contact Us" links. */
  headerVariant?: "account" | "portal";
  /** `<img src>` for the logo. */
  logoSrc: string;
  /** Optional `<img alt>` for the logo. */
  logoAlt?: string;
  /** href of the "Contact Us" link in the header. */
  contactHref: string;
  /** href of the "Partner's Portal" link (only used when headerVariant="portal"). */
  portalHref: string;
  /** z-index class of the `<header id="header">`. */
  headerZ?: "z-40" | "z-50";
  /** Whether the header links carry the legacy `tasveer` class. */
  headerLinksTasveer?: boolean;
  /** Whether the secondary-menu "Invest in Uganda" wrapper has `cursor-pointer`. */
  secMenuCursorPointer?: boolean;
  /** When true, the header is `relative` (not fixed) on mobile screens (<md).
   *  Use this on team profile pages so the header scrolls away naturally. */
  mobileScrollable?: boolean;
};

/** Maps a hovered menu label to its background video. */
const MENU_VIDEOS: Record<string, string> = {
  "About us": "/videos/Contactus.mp4",
  "Strategic Partners": "/videos/footer_media.mp4",
  Businesses: "/videos/herobusinesses.mp4",
  Solutions: "/videos/Header_FinancialServices.mp4",
  Blogs: "/videos/Header_Utilities.mp4",
  Listings: "/videos/Header_Hospitality.mp4",
  Dashboard: "/videos/Header_Retail.mp4",
  Profile: "/videos/Header_Retail.mp4",
  LOGOUT: "/videos/Header_Airlines.mp4",
  LOGIN: "/videos/Header_Retail.mp4",
};

const NewpageMenuHeader = ({
  menuBackgroundStyle = "none",
  listingsVariant = "dropdown",
  solutionsLinkMode = "plain",
  loginLabel = "Login",
  headerVariant = "portal",
  logoSrc,
  logoAlt,
  contactHref,
  portalHref,
  headerZ = "z-40",
  headerLinksTasveer = true,
  secMenuCursorPointer = false,
  mobileScrollable = false,
}: NewpageMenuHeaderProps) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  /**
   * `menuOpen` is state (drives re-render so the background video overlay
   * mounts the moment the menu finishes opening). `menuInteractable` is a
   * ref mirror read synchronously inside hover handlers — during the close
   * animation it flips false immediately so stray hover events can't
   * remount the keyed `<motion.video>` inside the engine-animated tree and
   * snap the menu back open.
   */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuInteractable = useRef(false);

  let activeVideo = "/videos/headerCPG.mp4";
  if (
    hoveredLabel === "Invest in Uganda" ||
    hoveredLabel === "INVEST IN UGANDA"
  ) {
    activeVideo = "/videos/UtilitiesResources.mp4";
  } else if (hoveredLabel && MENU_VIDEOS[hoveredLabel]) {
    activeVideo = MENU_VIDEOS[hoveredLabel];
  }

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Track the engine-managed menu. The engine toggles `menu-opened` on
   * <html>. We consider the menu "interactable" only after it has fully
   * opened (~1s GSAP timeline), and we drop hover state the instant it
   * starts closing.
   */
  useEffect(() => {
    const OPEN_CLASS = "menu-opened";
    const settle = () => {
      const isOpen = document.documentElement.classList.contains(OPEN_CLASS);
      menuInteractable.current = isOpen;
      setMenuOpen(isOpen);
      if (!isOpen) setHoveredLabel(null);
    };
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const htmlObserver = new MutationObserver(() => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 1100);
      if (!document.documentElement.classList.contains(OPEN_CLASS)) {
        menuInteractable.current = false;
        setMenuOpen(false);
        setHoveredLabel(null);
      }
    });
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      if (settleTimer) clearTimeout(settleTimer);
      htmlObserver.disconnect();
    };
  }, []);

  const setHoveredLabelSafe = useCallback((label: string | null) => {
    if (!menuInteractable.current) return;
    setHoveredLabel(label);
  }, []);

  const backgroundStyle =
    menuBackgroundStyle === "none"
      ? undefined
      : { backgroundColor: menuBackgroundStyle };

  const tasveer = headerLinksTasveer ? "tasveer " : "";
  const secMenuExtra = secMenuCursorPointer ? " cursor-pointer" : "";

  return (
    <>
      <div
        id="menu"
        className="hidden fixed top-0 left-0 w-full h-full z-40"
        data-component="Menu"
      >
        {/*
          The `.background` div below is animated by the legacy engine
          (app-1.0.12.js) with GSAP transforms on open/close. Do NOT mount
          keyed/conditional React children (e.g. <motion.video key=...>)
          inside it — remounting during the close animation disrupts the
          slide and makes the menu snap back open. The hover-driven video
          lives in the sibling overlay further down.
        */}
        <div
          className="absolute inset-0 background bg-darkpurple overflow-hidden "
          style={backgroundStyle}
        >
          <div
            className="absolute left-0 top-0 w-full h-full "
            data-component="MenuView"
            style={{ opacity: 0 }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-1/2 max-w-screen-sm">
                <div
                  className="w-full"
                  data-component="QCircle"
                  data-size="0.52"
                  data-fit-mobile="false"
                ></div>
                <div
                  className="absolute top-1/2 left-1/2 w-1/2 h-1/2"
                  data-component="QTail"
                  data-size="0.26"
                  data-fit-mobile="false"
                ></div>
              </div>
            </div>
          </div>
          <div className="w-full sm:block bg-gradients absolute right-0 top-0 h-full sm:w-1/2 lg:w-1/3">
            <div className="absolute inset-0 bg-gradient bg-gradient-lines bg-gradient-to-l from-darkpurple"></div>
            <div className="absolute inset-0 bg-gradient bg-gradient-Q bg-gradient-to-l from-darkpurple"></div>
            <div className="absolute inset-0 bg-gradient bg-gradient-orange-blob bg-gradient-to-l from-orange2"></div>
            <div className="absolute inset-0 bg-gradient bg-gradient-blue-blob bg-gradient-to-l from-white"></div>
            <div className="absolute inset-0 bg-gradient bg-gradient-bubble bg-gradient-to-l from-lightgray2"></div>
            <div className="absolute inset-0 bg-gradient bg-gradient-particles bg-gradient-to-l from-darkpurple"></div>
          </div>
        </div>

        {/* React-managed video overlay — a SIBLING of `.background`, so the
            engine's GSAP transforms never touch it. `menuOpen` is state, so
            this mounts the moment the menu finishes opening (no need to
            hover first) and unmounts immediately when closing begins. The
            video sits above the engine's (now hidden) MenuView blob. */}
        {activeVideo && menuOpen && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 6, overflow: "hidden" }}
          >
            <AnimatePresence>
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
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            {/* Dark veil removed per client request — videos now show at full
                brightness (same change as Header/HeaderTim/HeaderPortable) */}
          </div>
        )}

        <div className="absolute inset-0 foreground z-30">
          <div className="container relative z-10 sm-only:max-w-xs mx-auto px-4 sm:px-16 flex flex-col h-full">
            <div className="flex justify-end items-center h-full mt-32">
              <ul
                className="main-menu text-[25px] md:text-[35px]  md:leading-55 uppercase flex flex-col items-end"
                onMouseOver={(e) => {
                  if (!menuInteractable.current) return;
                  const target = e.target as HTMLElement;
                  const li = target.closest("li[data-background]");
                  if (li) {
                    const span = li.querySelector("span");
                    if (span && span.textContent) {
                      setHoveredLabelSafe(span.textContent);
                    }
                  }
                }}
                onMouseLeave={() => setHoveredLabelSafe(null)}
              >
                <li
                  data-text-color="white"
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-background="orange-blob"
                >
                  <a
                    onClick={() => handleNavigation("/about-us")}
                    className="inline-block"
                  >
                    <span>About us</span>
                  </a>
                </li>
                <li
                  data-text-color="dark"
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-background="lines"
                >
                  <a
                    onClick={() => handleNavigation("/team")}
                    className="inline-block"
                  >
                    <span>Strategic Partners</span>
                  </a>
                </li>
                <li
                  data-text-color="dark"
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-background="Q"
                >
                  <a
                    onClick={() => handleNavigation("/businesses")}
                    className="inline-block cursor-pointer"
                  >
                    <span>Businesses</span>
                  </a>
                </li>
                <li
                  data-text-color="light"
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-background="blue-blob"
                >
                  {solutionsLinkMode === "plain" ? (
                    <a href="/solutions" className="inline-block">
                      <span>Solutions</span>
                    </a>
                  ) : (
                    <a
                      onClick={() => handleNavigation("/solutions")}
                      className="inline-block"
                    >
                      <span>Solutions</span>
                    </a>
                  )}
                </li>
                {/* <li
                  data-text-color="white"
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-background="bubble"
                >
                  <a
                    onClick={() => handleNavigation("/blogs")}
                    className="inline-block"
                  >
                    <span>Media</span>
                  </a>
                </li> */}

                <li
                  data-text-color="dark"
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-background="Q"
                >
                  <a
                    onClick={() => handleNavigation("/blogs")}
                    className="inline-block cursor-pointer"
                  >
                    <span>Blogs</span>
                  </a>
                </li>
                {listingsVariant === "plain" ? (
                  <li
                    data-text-color="light"
                    className="flex-grow-0 flex-shrink cursor-pointer"
                    data-background="blue-blob"
                  >
                    <a
                      onClick={() => handleNavigation("/all-listings")}
                      className="inline-block cursor-pointer"
                    >
                      <span>Listings</span>
                    </a>
                  </li>
                ) : (
                  <li
                    data-text-color="dark"
                    className="flex-grow-0 flex-shrink relative group"
                    data-background="Q"
                  >
                    <a
                      onClick={() => handleNavigation("/all-listings")}
                      className="inline-block cursor-pointer transition-[padding] duration-200 hover:pr-2"
                    >
                      <span>Listings</span>
                    </a>
                    {/* Dropdown for sub-items */}
                    <div className="absolute top-1/2 right-[110%] -translate-y-1/2 mr-4 bg-bgdark/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col p-3 text-left pointer-events-auto">
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/all-listings");
                        }}
                        className="px-5 py-2.5 text-[16px] md:text-[18px] leading-tight text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg whitespace-nowrap normal-case font-sofia font-medium transition-colors cursor-pointer block"
                      >
                        All Listings
                      </a>
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/businesses-for-sale");
                        }}
                        className="px-5 py-2.5 text-[16px] md:text-[18px] leading-tight text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg whitespace-nowrap normal-case font-sofia font-medium transition-colors cursor-pointer block"
                      >
                        Businesses for Sale
                      </a>
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/investment-projects");
                        }}
                        className="px-5 py-2.5 text-[16px] md:text-[18px] leading-tight text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg whitespace-nowrap normal-case font-sofia font-medium transition-colors cursor-pointer block"
                      >
                        Investment Projects
                      </a>
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/joint-ventures");
                        }}
                        className="px-5 py-2.5 text-[16px] md:text-[18px] leading-tight text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg whitespace-nowrap normal-case font-sofia font-medium transition-colors cursor-pointer block"
                      >
                        Joint Ventures
                      </a>
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/bankable-projects");
                        }}
                        className="px-5 py-2.5 text-[16px] md:text-[18px] leading-tight text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg whitespace-nowrap normal-case font-sofia font-medium transition-colors cursor-pointer block"
                      >
                        Bankable Projects
                      </a>
                    </div>
                  </li>
                )}

                {user?.role !== "USER" && user?.role !== "INVESTOR" ? (
                  <li
                    data-text-color="white"
                    className={`flex-grow-0 flex-shrink ${isAuthenticated ? "block" : "hidden"}`}
                    data-background="bubble"
                  >
                    <a
                      onClick={() => handleNavigation("/dashboard")}
                      className="inline-block cursor-pointer"
                    >
                      <span>Dashboard</span>
                    </a>
                  </li>
                ) : (
                  <li
                    data-text-color="white"
                    className={`flex-grow-0 flex-shrink ${isAuthenticated ? "block" : "hidden"}`}
                    data-background="bubble"
                  >
                    <a
                      onClick={() => handleNavigation(`/profile/${user?.id}`)}
                      className="inline-block cursor-pointer"
                    >
                      <span>Profile</span>
                    </a>
                  </li>
                )}
                <li
                  className="flex-grow-0 flex-shrink block lg:hidden"
                  data-text-color="dark"
                  data-background="particles"
                >
                  <a
                    onClick={() => handleNavigation("/invest-in-uganda")}
                    className="inline-block"
                  >
                    <span className="text-[#FF6600]">INVEST IN UGANDA</span>
                  </a>
                </li>

                <li
                  className="flex-grow-0 flex-shrink cursor-pointer"
                  data-text-color="dark"
                  data-background="particles"
                >
                  <a className="inline-block cursor-pointer">
                    <span>
                      {isAuthenticated ? (
                        <button onClick={handleLogout}>LOGOUT</button>
                      ) : (
                        <button onClick={() => handleNavigation("/login")}>
                          {loginLabel}
                        </button>
                      )}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col-reverse text-right lg:flex-row lg:justify-between lg:items-baseline flex-grow-0 flex-shrink-0 mb-6 lg:mb-10">
              <div className="footer-menu text-11 leading-14 uppercase font-light tracking-tighter flex justify-between mt-10 lg:justify-start">
                <a href="https://company.mktimothy.com/definitions.html">
                  <span>Definitions</span>
                </a>
                <a
                  href="https://company.mktimothy.com/terms.html"
                  className="ml-2"
                >
                  <span>Terms & Conditions </span>
                </a>
                <a
                  href="https://company.mktimothy.com/privacy.html"
                  className="ml-2"
                >
                  <span>Privacy Notice</span>
                </a>
                <a
                  href="https://company.mktimothy.com/cookie-policy.html"
                  className="ml-2"
                >
                  <span>Cookie Policy</span>
                </a>
              </div>
              <div
                className={`secondary-menu text-22 leading-39 lg:text-41 lg:leading-70 uppercase tracking-tighter hidden lg:flex justify-between lg:justify-start${secMenuExtra}`}
              >
                <div
                  className="hidden lg:block text-22 lg:text-41 uppercase tracking-tighter font-sofia cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => handleNavigation("/invest-in-uganda")}
                  onMouseEnter={() => setHoveredLabelSafe("Invest in Uganda")}
                  onMouseLeave={() => setHoveredLabelSafe(null)}
                >
                  <span className="text-[#FF6600]">Invest in Uganda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header
        id="header"
        data-component="Header"
        className={`${mobileScrollable ? "mobile-scrollable-header" : "fixed"} top-0 inline-block w-full pointer-events-none ${headerZ}`}
      >
        <div className="max-w-[1540px] sm-only:max-w-xs mx-auto px-4 mt-10 ">
          <div className="relative flex justify-between items-center">
            <a
              onClick={() => handleNavigation("/")}
              id="logo"
              className="pointer-events-auto transform origin-left scale-75 md:transform-none "
              data-component="Logo"
            >
              <img src={logoSrc} width="150px;" alt={logoAlt} />
            </a>
            <div className="flex items-center gap-4 sm:gap-7">
              <a
                href={contactHref}
                className="pointer-events-auto transform origin-left scale-75 md:transform-none whitespace-nowrap hidden sm:block mr-3"
              >
                Contact Us
              </a>

              {headerVariant === "account" ? (
                isAuthenticated ? (
                  <div
                    className="pointer-events-auto transform origin-left scale-75 md:transform-none relative group cursor-pointer text-white"
                  >
                    <div className="flex items-center gap-1 hover:opacity-70 transition-opacity text-[#FF6600] whitespace-nowrap">
                      Account
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

                    <div
                      className="absolute top-[120%] right-0 w-[200px] bg-[#000]/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden text-left"
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      }}
                    >
                      <div className="p-2">
                        {user?.role !== "USER" && user?.role !== "INVESTOR" ? (
                          <a
                            href="/dashboard"
                            className="flex flex-col px-3 py-2 hover:bg-white/5 rounded-xl transition-colors"
                          >
                            <span className="text-white font-medium text-[15px]">
                              Dashboard
                            </span>
                          </a>
                        ) : (
                          <a
                            href={`/profile/${user?.id}`}
                            className="flex flex-col px-3 py-2 hover:bg-white/5 rounded-xl transition-colors"
                          >
                            <span className="text-white font-medium text-[15px]">
                              Profile
                            </span>
                          </a>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex flex-col px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-left w-full mt-1"
                        >
                          <span className="text-white font-medium text-[15px]">
                            Logout
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="pointer-events-auto transform origin-left scale-75 md:transform-none relative group cursor-pointer text-white"
                  >
                    <div className="flex items-center gap-1 hover:opacity-70 transition-opacity text-[#FF6600] whitespace-nowrap">
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

                    <div
                      className="absolute top-[120%] right-0 w-[280px] bg-[#000]/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden text-left"
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      }}
                    >
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
                            <a href="/investors-login" className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                              <span className="text-[14px]">🔐</span> LOGIN
                            </a>
                            <a href="/investors" className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
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
                            <a href="/login" className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                              <span className="text-[14px]">🔐</span> LOGIN
                            </a>
                            <a href="/pitch-idea" className="flex items-center gap-1 text-[13px] text-white hover:text-orange-500 font-bold transition-colors drop-shadow-md">
                              <span className="text-[14px]">✨</span> REGISTER
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <a
                  href={portalHref}
                  className="pointer-events-auto transform origin-left scale-75 md:transform-none whitespace-nowrap hidden sm:block"
                >
                  Partner&apos;s Portal
                </a>
              )}

              <div
                id="burger"
                className="pointer-events-auto "
                data-component="Burger"
              >
                <div className="circle">
                  <div className="half">
                    <div className="inner"></div>
                  </div>
                  <div className="half">
                    <div className="inner"></div>
                  </div>
                </div>

                <div className="burger">
                  <div className="line"></div>
                  <div className="line"></div>
                </div>

                <div className="cross">
                  <div className="line"></div>
                  <div className="line"></div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="ctaArrow arrowLeft absolute top-full transition-opacity duration-200"
            // data-follow-link="/"
            onClick={() => handleNavigation("/")}
          >
            <div className="arrow">
              <div className="body"></div>
              <div className="branch"></div>
              <div className="branch"></div>
            </div>
          </div>
        </div>
      </header>

      <div id="click-preventer"></div>
    </>
  );
};

export default NewpageMenuHeader;
