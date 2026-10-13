"use client";
import { useAuth } from "@/lib/providers/auth-provider";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IoNotifications } from "react-icons/io5";
import NotificationPopup from "./NotificationPopup";
import LottieBlob from "./LottieBlob";

// Background the overlay transitions to when a menu item is hovered
const BG_COLORS: Record<string, string> = {
  "orange-blob": "#ffffff",
  "blue-blob": "#ffffff",
  bubble: "#acb5ba",
  lines: "#270c41",
  Q: "#270c41",
  particles: "#270c41",
  default: "#270c41",
};
const LIGHT_BACKGROUNDS = new Set(["orange-blob", "blue-blob", "bubble"]);

interface MenuItem {
  label: string;
  bg: string;
  textColor: "white" | "dark" | "light";
  href?: string;
  action?: () => void;
  subItems?: { label: string; href: string }[];
  videoSrc?: string;
}

const STATIC_MENU_ITEMS: MenuItem[] = [
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
    label: "Specializations",
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
    subItems: [
      { label: "All Listings", href: "/all-listings" },
      { label: "Businesses for Sale", href: "/businesses-for-sale" },
      { label: "Investment Projects", href: "/investment-projects" },
      { label: "Joint Ventures", href: "/joint-ventures" },
      { label: "Bankable Projects", href: "/bankable-projects" },
    ],
  },
];

const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, logout, isLoading, user } = useAuth();

  const isOtherPage =
    pathname === "/chats" ||
    pathname === "/dashboard" ||
    pathname === "/categories" ||
    pathname === "/analytics" ||
    pathname === "/broadcast" ||
    pathname === "/listings" ||
    pathname === "/blog" ||
    pathname === "/filters" ||
    pathname === "/users" ||
    pathname === "/saved" ||
    pathname === "/history" ||
    pathname === "/moderation" ||
    pathname === "/" ||
    pathname === "/about-us" ||
    pathname === "/team" ||
    pathname === "/solutions" ||
    pathname === "/news" ||
    pathname === "/comments" ||
    pathname === "/support-tickets" ||
    pathname === "/whatsapp-chatbot" ||
    pathname.includes("/messages") ||
    pathname.includes("/calls") ||
    pathname === "/invest-in-uganda" ||
    pathname === "/moderator-assignments" ||
    pathname.includes("/team/");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredBg, setHoveredBg] = useState("default");
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const toggleNotifications = () => setIsNotificationOpen((v) => !v);

  /* ────── notification helpers ────── */
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;
    setNotificationsLoading(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (!token) return;
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data.notifications);
          setUnreadCount(result.data.unreadCount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (!token) return;
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      if (response.ok) {
        setNotifications((prev: any) =>
          prev.map((n: any) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (!token) return;
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (response.ok) {
        setNotifications((prev: any) =>
          prev.map((n: any) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      const interval = setInterval(async () => {
        try {
          const token =
            localStorage.getItem("auth-token") ||
            sessionStorage.getItem("auth-token");
          if (!token) return;
          const response = await fetch("/api/notifications?unreadOnly=true", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) setUnreadCount(result.data.unreadCount);
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      }, 120000); // TEMP_FIX: Throttled to 120s to save Vercel usage
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);
    window.location.href = href;
  };

  /* ────── dynamic auth items ────── */
  const authItems: MenuItem[] = isAuthenticated
    ? [
        user?.role !== "USER" && user?.role !== "INVESTOR"
          ? {
              href: "/dashboard",
              label: "Dashboard",
              bg: "bubble",
              textColor: "white",
              videoSrc: "/videos/Header_Retail.mp4",
            }
          : {
              href: `/profile/${user?.id}`,
              label: "Profile",
              bg: "bubble",
              textColor: "white",
              videoSrc: "/videos/Header_Retail.mp4",
            },
        {
          action: handleLogout,
          label: "Logout",
          bg: "particles",
          textColor: "dark",
          videoSrc: "/videos/Header_Airlines.mp4",
        },
      ]
    : [
        {
          href: "/login",
          label: "Login",
          bg: "particles",
          textColor: "dark",
          videoSrc: "/videos/Header_Retail.mp4",
        },
      ];

  const menuItems = [...STATIC_MENU_ITEMS, ...authItems];

  const bgColor = BG_COLORS[hoveredBg] ?? "#270c41";
  const isLightBg = LIGHT_BACKGROUNDS.has(hoveredBg);

  let activeVideo = "/videos/headerCPG.mp4"; // Default background video
  if (hoveredLabel === "Invest In Uganda") {
    activeVideo = "/videos/UtilitiesResources.mp4";
  } else if (hoveredLabel) {
    const foundItem = menuItems.find((item) => item.label === hoveredLabel);
    if (foundItem?.videoSrc) {
      activeVideo = foundItem.videoSrc;
    }
  }

  const itemColor = (item: MenuItem) =>
    isLightBg && (item.textColor === "dark" || item.textColor === "light")
      ? "#270c41"
      : "#ffffff";

  /* ────── Shared top bar JSX ────── */
  const topBar = (
    <div className="flex justify-between items-center h-full width py-7 relative z-[61]">
      {/* Logo */}
      <div
        onClick={() => handleNavigation("/")}
        className="cursor-pointer z-[61]"
      >
        <Image
          src="/images/mkorange.png"
          alt="MK Timothy"
          width={150}
          height={50}
          className="h-[40px] sm:h-[50px] w-auto"
        />
      </div>

      <div className="flex items-center gap-4 xsm:gap-5 md:gap-10">
        {/* Desktop links */}
        <div className="flex items-center gap-5 sm:gap-7">
          <a
            href="https://contact.mktimothy.com/"
            className="text-white font-sofia text-[15px] tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap hidden sm:block"
          >
            Contact Us
          </a>

          {isAuthenticated ? (
            <div className="relative group cursor-pointer">
              <div className="text-white font-sofia text-[15px] tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1 whitespace-nowrap">
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

              <div className="absolute top-[120%] right-0 w-[200px] bg-[#000]/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden">
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
            <div className="relative group cursor-pointer">
              <div className="text-white font-sofia text-[15px] tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1 whitespace-nowrap">
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

              <div className="absolute top-[120%] right-0 w-[280px] bg-[#000]/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden">
                <div className="p-5">
                  <div className="text-white font-semibold text-[17px] mb-5 drop-shadow-md">
                    Investor & Founder Access
                  </div>
                  
                  {/* Investors Portal */}
                  <div className="mb-4">
                    <div className="text-white font-medium text-[16px] mb-1 drop-shadow-md">
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
                    <div className="text-white font-medium text-[16px] mb-1 drop-shadow-md">
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
          )}
        </div>

        {/* Notifications */}
        {isAuthenticated && (
          <div className="relative z-[61]">
            <button
              onClick={toggleNotifications}
              className="relative w-7 h-7 text-white hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Open notifications"
            >
              <IoNotifications className="w-full h-full" />
              {unreadCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-[11px] h-[11px] bg-greencolor rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-[7px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
              )}
            </button>
            <NotificationPopup
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notificationsLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </div>
        )}

        {/* Animated burger → × */}
        <button
          onClick={toggleMenu}
          className="relative w-9 h-8 flex flex-col justify-center items-center cursor-pointer z-[61] focus:outline-none gap-0"
          aria-label="Toggle navigation menu"
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="block w-7 h-[2px] rounded-full hamburger-bar-white bg-white origin-center"
          />
          <div className="h-[10px]" />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="block w-7 h-[2px] rounded-full hamburger-bar-white bg-white origin-center"
          />
        </button>
      </div>
    </div>
  );

  /* ────── Loading state ────── */
  if (isLoading) {
    return (
      <header
        className={`z-[60] w-full ${isOtherPage ? "hidden" : "absolute"}`}
      >
        {topBar}
      </header>
    );
  }

  /* ────── Main render ────── */
  return (
    <>
      <header
        className={`z-[60] w-full ${isOtherPage ? "hidden" : "absolute"}`}
      >
        {topBar}
      </header>

      {/* ── Full-screen menu overlay ── */}
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
            

            {/* Right-side gradient panel – multiple layers, only the active one is visible */}
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

            {/* ── Animated Lottie Q blob ── */}
            <AnimatePresence>
              {!activeVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                    <LottieBlob isLightBg={isLightBg} />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ── Menu content ── */}
            <div className="container relative z-10 sm-only:max-w-xs mx-auto px-4 sm:px-16 flex flex-col h-full">
              {/* Spacer matching header height */}
              <div className="flex-shrink-0 h-28" />

              {/* Menu items */}
              <div className="flex justify-end items-center flex-1">
                <ul className="text-[25px] md:text-[35px] md:leading-[55px] uppercase flex flex-col items-end font-sofia">
                  {menuItems.map((item, i) => (
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
                      className="flex-shrink-0 cursor-pointer select-none relative group"
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
                      {item.href ? (
                        <a
                          onClick={() => handleNavigation(item.href!)}
                          className="inline-block py-0.5 cursor-pointer transition-[padding] duration-200 hover:pr-2"
                        >
                          <span>{item.label}</span>
                        </a>
                      ) : (
                        <button
                          onClick={item.action}
                          className="inline-block py-0.5 transition-[padding] duration-200 hover:pr-2"
                        >
                          <span>{item.label}</span>
                        </button>
                      )}

                      {item.subItems && (
                        <div className="absolute top-1/2 right-[110%] -translate-y-1/2 mr-4 bg-bgdark/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col p-3 text-left pointer-events-auto">
                          {item.subItems.map((subItem) => (
                            <a
                              key={subItem.href}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigation(subItem.href);
                              }}
                              className="px-5 py-2.5 text-[16px] md:text-[18px] leading-tight text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg whitespace-nowrap normal-case font-sofia font-medium transition-colors cursor-pointer block"
                            >
                              {subItem.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </motion.li>
                  ))}

                  {/* Mobile-only: Invest in Uganda */}
                  <motion.li
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{
                      delay: menuItems.length * 0.045,
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
                      <span className="text-[#FF6600]">Invest In Uganda</span>
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
                      : "rgba(255,255,255)",
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
                  <a className="text-[#FF6600]" onClick={() => handleNavigation("/invest-in-uganda")}>
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

export default Header;
