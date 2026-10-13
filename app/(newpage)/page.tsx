"use client";
import useNewpageEngine from "@/lib/hooks/useNewpageEngine";
import { useEffect, useState } from "react";
import NewpageMenuHeader from "@/components/newpage/NewpageMenuHeader";

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  // Boot the legacy animation engine safely (handles loader + navigation).
  useNewpageEngine();

  useEffect(() => {
    // Immediate animation triggers
    const setupImmediateAnimationTriggers = () => {
      let isOnFirstSlide = true;
      let lastScrollY = 0;
      let returnTimer: NodeJS.Timeout | null = null;

      // Function to show button after delay
      const showButtonAfterDelay = () => {
        if (returnTimer) clearTimeout(returnTimer);
        returnTimer = setTimeout(() => {
          setIsAnimating(false);
          isOnFirstSlide = true;
        }, 200);
      };

      // Function to check if we're on first slide
      const checkIfOnFirstSlide = () => {
        const landingSlide = document.querySelector(
          '[data-component="HomepageLanding"]',
        );
        if (landingSlide) {
          const isVisible = !landingSlide.classList.contains("invisible");
          if (isVisible && !isOnFirstSlide) {
            showButtonAfterDelay();
          }
        }
      };

      // Listen for scroll events
      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (isOnFirstSlide && currentScrollY > lastScrollY) {
          // Scrolling down from first slide
          setIsAnimating(true);
          isOnFirstSlide = false;
          if (returnTimer) clearTimeout(returnTimer);
        } else if (!isOnFirstSlide && currentScrollY <= 50) {
          // Scrolled back to top
          checkIfOnFirstSlide();
        }

        lastScrollY = currentScrollY;
      };

      // Listen for wheel events (more sensitive than scroll)
      const handleWheel = (e: WheelEvent) => {
        if (isOnFirstSlide && e.deltaY > 0) {
          // Scrolling down from first slide
          setIsAnimating(true);
          isOnFirstSlide = false;
          if (returnTimer) clearTimeout(returnTimer);
        } else if (!isOnFirstSlide && e.deltaY < 0) {
          // Scrolling up - check if we're back on first slide
          setTimeout(checkIfOnFirstSlide, 100);
        }
      };

      // Listen for touch events (mobile)
      const handleTouchStart = () => {
        if (isOnFirstSlide) {
          setIsAnimating(true);
          isOnFirstSlide = false;
          if (returnTimer) clearTimeout(returnTimer);
        }
      };

      // Listen for keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          isOnFirstSlide &&
          (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")
        ) {
          setIsAnimating(true);
          isOnFirstSlide = false;
          if (returnTimer) clearTimeout(returnTimer);
        } else if (
          !isOnFirstSlide &&
          (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Home")
        ) {
          setTimeout(checkIfOnFirstSlide, 100);
        }
      };

      // Listen for navigation dot clicks
      const handleNavClick = (e: Event) => {
        const target = e.target as HTMLElement;

        if (returnTimer) clearTimeout(returnTimer);

        // Check if it's the Home navigation item
        if (
          target &&
          (target.textContent?.includes("Home") ||
            target.closest('[data-navlabel="Home"]'))
        ) {
          showButtonAfterDelay();
        } else if (target && !target.textContent?.includes("Home")) {
          setIsAnimating(true);
          isOnFirstSlide = false;
        }
      };

      // Add event listeners
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("wheel", handleWheel, { passive: true });
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("keydown", handleKeyDown);

      // Watch for navigation clicks (with a delay to ensure navbar is loaded)
      const watchNavigation = () => {
        const navbar = document.querySelector(".navbar");
        if (navbar) {
          navbar.addEventListener("click", handleNavClick);
        } else {
          setTimeout(watchNavigation, 500);
        }
      };
      setTimeout(watchNavigation, 1000);

      // MutationObserver for slide changes (backup detection)
      const observeSlideChanges = () => {
        const landingSlide = document.querySelector(
          '[data-component="HomepageLanding"]',
        );
        if (landingSlide) {
          const observer = new MutationObserver(() => {
            const isVisible = !landingSlide.classList.contains("invisible");
            if (isVisible && !isOnFirstSlide) {
              // We're back on the first slide
              showButtonAfterDelay();
            } else if (!isVisible && isOnFirstSlide) {
              // We've left the first slide
              setIsAnimating(true);
              isOnFirstSlide = false;
              if (returnTimer) clearTimeout(returnTimer);
            }
          });

          observer.observe(landingSlide, {
            attributes: true,
            attributeFilter: ["class"],
          });

          return observer;
        }
        return null;
      };

      let slideObserver: MutationObserver | null = null;
      const observerTimeout = setTimeout(() => {
        slideObserver = observeSlideChanges();
      }, 1500);

      return () => {
        if (returnTimer) clearTimeout(returnTimer);
        clearTimeout(observerTimeout);
        if (slideObserver && typeof slideObserver.disconnect === "function") {
          slideObserver.disconnect();
        }
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("keydown", handleKeyDown);
        const navbar = document.querySelector(".navbar");
        if (navbar) {
          navbar.removeEventListener("click", handleNavClick);
        }
      };
    };

    const cleanup = setupImmediateAnimationTriggers();
    return cleanup;
  }, []);

  return (
    <>
      <style jsx>{`
        .download-btn-animate {
          transform: translateY(0);
          opacity: 1;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform, opacity;
        }
        .download-btn-animate.slide-up {
          transform: translateY(-50px);
          opacity: 0;
          pointer-events: none;
        }

        /* Add subtle entrance animation */
        @keyframes slideInFromBottom {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .download-btn-animate:not(.slide-up) {
          animation: slideInFromBottom 0.8s ease-out;
        }
      `}</style>
      <div
        id="loader"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#270c41",
          zIndex: 10000,
        }}
        data-component="Loader"
      >
        {/* Loader Video Background */}
        <video
          src="/videos/loading.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />

        <div
          className="pixi-wrapper"
          style={{ position: "absolute", visibility: "hidden", opacity: 0 }}
        >
          <div data-component="LoaderPixiView"></div>
        </div>
        <div
          className="q-tail-orange-wrapper"
          style={{ position: "absolute", visibility: "hidden", opacity: 0 }}
        >
          <div data-component="QTail" data-size="0.26"></div>
        </div>
      </div>
      <div
        id="interloader"
        className="fixed top-0 left-0 w-full h-full z-50  items-center justify-center hidden"
        data-component="Interloader"
      >
        <div className="absolute inset-0 bg-purple"></div>
        <div className="relative w-1/2 max-w-screen-sm">
          <div className="w-full" data-component="QCircle"></div>
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-1/2"
            data-component="QTail"
          ></div>
        </div>
      </div>
      <div id="root">
        <div
          className="relative w-full h-screen overflow-hidden is-fullscreen"
          data-component="Homepage"
        >
          <div className="middleground absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0" data-component="SharedView"></div>
            <div className="relative w-8/12 md:w-65vh pointer-events-none">
              <div
                className="w-full"
                data-component="QCircle"
                data-size="0.66"
              ></div>
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-1/2"
                data-component="QTail"
                data-size="0.33"
              ></div>
            </div>
          </div>

          <div
            className="slide invisible"
            data-component="HomepageLanding"
            data-navlabel="Home"
            data-navcolor="orange"
            data-invert="true"
            data-disable-overlay="false"
            data-disable-text="false"
          >
            <div className="background landing absolute inset-0 hidden">
              <div
                className="absolute inset-0"
                data-component="Html5Video"
                data-url="https://cdn.sanity.io/files/doauu19r/production/5e8e410e1d92b5c2c7c9a979a56f53f5aa466ef3.mp4"
                data-autoplay="true"
                data-muted="true"
                data-loop="true"
              ></div>
              <div className="video-overlay absolute inset-0 bg-black opacity-0"></div>
            </div>

            <div
              className="foreground landing absolute inset-0 flex flex-col justify-center overflow-hidden"
            >
              <video
                src="/videos/homepageherobg.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/80 z-0"></div>

              <div className="container relative z-10 sm-only:max-w-xs mx-auto px-4 sm:px-16 flex flex-col items-start xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h1
                    className="transform -translate-y-1/2 md:translate-y-0 max-w-xs text-33 leading-41 text-white tracking-tight transition-colors duration-300 lg:max-w-screen-md lg:text-120 lg:leading-104 lg:mr-0 lg:pr-16 mdh:text-41 mdh:leading-45 mdh:max-w-sm"
                    data-component="WrapLines"
                  >
                    Uganda's strategic advisory firm.
                  </h1>
                  <div
                    className={`download-btn-animate ${
                      isAnimating ? "slide-up" : ""
                    } text-white px-4 py-2 rounded border-2 border-white text-base mt-10 w-fit cursor-pointer hover:bg-white hover:text-green-600 transition-colors duration-300`}
                    onClick={async () => {
                      try {
                        // Create a more robust download function
                        const response = await fetch("/companyprofile.pdf");
                        if (!response.ok) {
                          throw new Error("File not found");
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "MK-Timothy-Company-Profile.pdf";
                        link.setAttribute("type", "application/pdf");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Download failed:", error);
                        alert(
                          "Failed to download the PDF. Please try again or contact support.",
                        );
                      }
                    }}
                  >
                    Company Profile
                  </div>
                </div>

                <a
                  onClick={() => handleNavigation("/about-us")}
                  className="mobile-link text-white text-13 leading-19 font-semibold tracking-wide uppercase mt-20 md:hidden relative z-10"
                >
                  <span>About us</span>
                </a>
              </div>

              <div className="absolute z-10 inset-x-0 bottom-0 pb-6 lg:pb-24 mdh:pb-10">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div className="relative flex justify-center md:justify-between">
                    <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel hidden md:block text-white">
                      <div className="relative w-full h-full">
                        <a
                          href="/about-us"
                          onClick={() => handleNavigation("/about-us")}
                          className="anchor"
                        >
                          <span>About us</span>
                        </a>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ctaCircleArrow text-white">
                      <div className="relative w-full h-full">
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="arrow">
                          <div className="body"></div>
                          <div className="branch"></div>
                          <div className="branch"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="slide invisible"
            data-component="HomepagePortfolio"
            data-navlabel="Portfolio"
            data-navcolor="white"
          >
            <div className="background portfolio absolute inset-0 pointer-events-none">
              <div
                className="w-full h-full bg-purple"
                data-component="PortfolioGrid"
                data-exited-text="Exited"
                data-discover-text=""
              >
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-11-11"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-49"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-01-07"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-10"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-01-13"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-81"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-12-03"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-83"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-04-10"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-53"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-10-27"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-71"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-01-28"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-1"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-09-14"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-45"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-03-11"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-26"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-08-28"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-2"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-09-07"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-33"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2017-01-02"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-27"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-01-24"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-48"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-03-19"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-93"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-04-06"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-56"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2017-02-13"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-19"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-10-20"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-43"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-06-10"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-37"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-05-17"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-16"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-04-19"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-36"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-07-03"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-61"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-10-06"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-80"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-01-20"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-0"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-12-27"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-9"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-03-25"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-46"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-01-20"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-90"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-05-01"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-51"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-02-08"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-84"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2017-11-16"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-86"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-10-11"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-63"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-03-04"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-82"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-06-02"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-23"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-06-20"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-89"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-10-16"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-40"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-07-03"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-14"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-04-01"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-34"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-06-09"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-3"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-10-25"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-65"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-10-25"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-92"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-08-26"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-75"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2017-06-22"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-74"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-04-01"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-44"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-05-08"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-31"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-07-02"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-47"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-11-17"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-12"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-12-27"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-79"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-07-23"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-60"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-11-17"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-69"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-02-20"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-70"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-07-03"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-15"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-05-07"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-42"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-07-18"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-35"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-03-21"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-17"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-06-01"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-11"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-10-02"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-62"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-08-24"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-22"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-02-08"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-73"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-04-27"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-28"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-08-16"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-59"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-01-01"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-6"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-08-23"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-30"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-08-19"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-64"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-09-19"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-39"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-04-06"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-13"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-02-09"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-91"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-02-09"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-94"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-02-28"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-41"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-06-15"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-78"
                ></span>
                <span
                  className="item hidden"
                  data-name="Education Projects"
                  data-geography="Uganda"
                  data-sector="Education Projects"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-03-27"
                  data-picture="/images/sectors/education_projects_1783077711017.webp"
                  data-id="opp-58"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-01-08"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-52"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-07-03"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-21"
                ></span>
                <span
                  className="item hidden"
                  data-name="Smart Cities"
                  data-geography="Uganda"
                  data-sector="Smart Cities"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-04-05"
                  data-picture="/images/sectors/smart_cities_1783077720224.webp"
                  data-id="opp-95"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-09-28"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-76"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-12-11"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-38"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-11-27"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-25"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-09-26"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-67"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-04-25"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-24"
                ></span>
                <span
                  className="item hidden"
                  data-name="Commercial Farming"
                  data-geography="Uganda"
                  data-sector="Commercial Farming"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-12-12"
                  data-picture="/images/sectors/commercial_farming_1783077611836.webp"
                  data-id="opp-87"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-03-23"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-29"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-01-04"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-8"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-07-28"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-5"
                ></span>
                <span
                  className="item hidden"
                  data-name="Agro Industrialization"
                  data-geography="Uganda"
                  data-sector="Agro Industrialization"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2020-07-10"
                  data-picture="/images/sectors/agro_industrialization_1783077582703.webp"
                  data-id="opp-72"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-02-10"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-68"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2022-06-25"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-20"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2016-05-07"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-54"
                ></span>
                <span
                  className="item hidden"
                  data-name="Healthcare"
                  data-geography="Uganda"
                  data-sector="Healthcare"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-11-04"
                  data-picture="/images/sectors/healthcare_1783077644476.webp"
                  data-id="opp-77"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-08-01"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-66"
                ></span>
                <span
                  className="item hidden"
                  data-name="Manufacturing"
                  data-geography="Uganda"
                  data-sector="Manufacturing"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-03-16"
                  data-picture="/images/sectors/manufacturing_1783077683863.webp"
                  data-id="opp-32"
                ></span>
                <span
                  className="item hidden"
                  data-name="Real Estate Development"
                  data-geography="Uganda"
                  data-sector="Real Estate Development"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-11-09"
                  data-picture="/images/sectors/real_estate_1783077654137.webp"
                  data-id="opp-18"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2019-09-09"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-88"
                ></span>
                <span
                  className="item hidden"
                  data-name="Renewable Energy"
                  data-geography="Uganda"
                  data-sector="Renewable Energy"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2018-11-15"
                  data-picture="/images/sectors/renewable_energy_1783077591870.webp"
                  data-id="opp-85"
                ></span>
                <span
                  className="item hidden"
                  data-name="Export & International Trade"
                  data-geography="Uganda"
                  data-sector="Export & International Trade"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2024-01-22"
                  data-picture="/images/sectors/export_trade_1783077701826.webp"
                  data-id="opp-57"
                ></span>
                <span
                  className="item hidden"
                  data-name="Tourism Experiences"
                  data-geography="Uganda"
                  data-sector="Tourism Experiences"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-09-03"
                  data-picture="/images/sectors/tourism_experiences_1783077635583.webp"
                  data-id="opp-4"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2023-09-10"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-55"
                ></span>
                <span
                  className="item hidden"
                  data-name="Artificial Intelligence"
                  data-geography="Uganda"
                  data-sector="Artificial Intelligence"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2021-11-02"
                  data-picture="/images/sectors/artificial_intelligence_1783077662828.webp"
                  data-id="opp-7"
                ></span>
                <span
                  className="item hidden"
                  data-name="FinTech"
                  data-geography="Uganda"
                  data-sector="FinTech"
                  data-stage="Opportunity"
                  data-exited=""
                  data-date="2015-09-06"
                  data-picture="/images/sectors/fintech_1783077602558.webp"
                  data-id="opp-50"
                ></span>
              </div>
            </div>

            <div className="foreground portfolio absolute inset-0 flex flex-col justify-center pointer-events-none">
              <div className="absolute inset-0 flex items-center px-4 sm:px-16">
                <div className="container flex justify-start mx-auto">
                  <h2
                    className="font-bold text-white text-77 leading-77 max-w-xs lg:text-120 lg:leading-144 lg:max-w-screen-md lg:pr-8"
                    data-component="WrapLines"
                  >
                    Portfolio
                  </h2>
                </div>
              </div>

              <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16 flex flex-col items-start -mt-20 md:mt-0">
                <p
                  className="text font-semibold text-white text-22 leading-30 tracking-tight pl-1 max-w-xs lg:max-w-screen-sm lg:text-46 lg:leading-57 lg:pr-16"
                  data-component="WrapLines"
                >
                  In today's competitive landscape, innovation, - &lt;br&gt;is
                  the key for entrepreneurs to stand out and thrive.
                </p>
                <a
                  href="/bankable-projects"
                  className="mobile-link text-orange text-13 leading-19 font-semibold tracking-wide uppercase mt-20 md:hidden pointer-events-auto"
                >
                  <span>Opportunity</span>
                </a>
              </div>

              <div className="absolute inset-x-0 bottom-0 pb-6 lg:pb-24 mdh:pb-10">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div className="relative flex justify-center md:justify-between">
                    <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel text-white hidden md:block pointer-events-auto">
                      <div className="relative w-full h-full">
                        <a
                          href="/bankable-projects"
                          className="anchor"
                        >
                          <span>Opportunity</span>
                        </a>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ctaCircleArrow text-white pointer-events-auto">
                      <div className="relative w-full h-full">
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="arrow">
                          <div className="body"></div>
                          <div className="branch"></div>
                          <div className="branch"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="slide invisible"
            data-component="HomepageTeam"
            data-navlabel="Team"
            data-navcolor="white"
          >
            <div className="background team absolute inset-0 pointer-events-none">
              <div
                className="w-full h-full bg-purple"
                data-component="TeamGrid"
              >
                <span
                  className="item hidden"
                  // href="team/Adalynn-mitchell.html"
                  data-name="Sandra"
                  data-role="Partner"
                  data-office="Uganda"
                  data-picture="/images/sandra.jpeg"
                  data-id="6df421b01d0419955b3ac269b2b59dea89f5fff8"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Stella-altynnikova.html"
                  data-name="Stella"
                  data-role="Operations Lead"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/78276d44230aadf750b8119dd04d614e856fd51b-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="53da0a17-8c32-49a4-8d8a-ab263a87cd21"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Mateo-levi-astrom.html"
                  data-name="Mateo"
                  data-role="Analytics Lead"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/beebb32457f3a27afb27dfd060b461fc11a96919-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="210401b7-856d-4387-93bf-4ad2cfb1dd1f"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Mila-lundstrom.html"
                  data-name="Mila"
                  data-role="Partner"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/7fd5f25e701e93e0f402efe0a10d135510b889c9-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="c104b4e0-270a-491d-8c59-28b4ca21dfc4"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Zoey-sanderson.html"
                  data-name="Zoey"
                  data-role="Team Coordinator"
                  data-office="South Africa"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/6c05733cf79cd286fd919933487168f4895ada7d-433x552.jpg?rect=0,59,433,433&w=620&h=620&auto=format"
                  data-id="769a3d38-45c4-4dd3-9ed6-6e5273d42c7c"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Emma-ambord.html"
                  data-name="Emma"
                  data-role="Operating Partner"
                  data-office="South Africa"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/e3648464ad1167efbba189daaaf76491b5236166-1211x1211.jpg?w=620&h=620&auto=format"
                  data-id="f1c19227-a2fe-4376-8cc8-d4421284d865"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Hannah-brown.html"
                  data-name="Hannah"
                  data-role="Team Coordinator"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/cf50ab29554422ad6a0223ee54e7c56b5164a9db-2392x2392.jpg?w=620&h=620&auto=format"
                  data-id="c10037ad-b930-4194-8731-53fc29444e66"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Sophia-huber.html"
                  data-name="Sophia"
                  data-role="Partner"
                  data-office="South Sudan"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/3bb52f4afffd860159e97f9de780030a51b3c8d2-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="9dd09c9b-efcf-4a46-baba-8d0a343448cc"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Olivia-franklin.html"
                  data-name="Olivia Franklin"
                  data-role=""
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/2555ea0eab0f0a762c04a75ea5c3582b20d49fb2-408x408.jpg?w=620&h=620&auto=format"
                  data-id="db43dabf-13aa-4954-8e99-7c678ba23b1e"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Logan-nadella.html"
                  data-name="Logan"
                  data-role="Operating Partner, Business &amp; Corporate Development"
                  data-office="Japan"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/fae42324564549d6af7f90dba72a3c53e1548205-1603x1600.jpg?rect=2,0,1600,1600&w=620&h=620&auto=format"
                  data-id="e3f41551-a35c-4533-ba1f-4132b088712c"
                ></span>
                <span
                  className="item hidden"
                  // href="team/William-bernstein.html"
                  data-name="William"
                  data-role="Venture Lead"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/1b3c289d499b9b243ad3e2a4447862f7469ae488-916x1280.jpg?rect=67,0,706,706&w=620&h=620&auto=format"
                  data-id="79a9cfc6-8780-4de0-8b1c-d65783c3f3c5"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Charlotte-dreier.html"
                  data-name="Charlotte"
                  data-role="Venture Lead"
                  data-office="South Sudan"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/bbc26d75e00bc763936f819c5823dcff8beeb821-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="ae8cac55-5d5c-4d2a-bafd-442266a65d31"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Benjamin-svanstrom.html"
                  data-name="Benjamin Svanström"
                  data-role="Advisor"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/agx8u29z/production/5a9fcd70449ff76fb509a4285fba4afe36fb88f9-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="4354d700-b15e-40ee-be34-f99a5a941a4c"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Luca-jornow.html"
                  data-name="Luca"
                  data-role="Partner"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/67603d565296249d2c7e22f47077076b2e9a033a-588x680.jpg?rect=0,46,588,588&w=620&h=620&auto=format"
                  data-id="43c45a7b-790c-4e8a-b6c3-58b7e3647795"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Arianna-yao.html"
                  data-name="Arianna"
                  data-role="Partner"
                  data-office="Japan"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/7fd5ea378dd634a9d784b912e4d4378e416ef600-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="e9d171c4-9164-4d51-9ca6-ab11f26cd2b3"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Victoria-koenig.html"
                  data-name="Victoria"
                  data-role="Team Coordinator"
                  data-office="South Sudan"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/2985d3b280354e730f5c955ccc8fde186c52cef8-408x408.jpg?w=620&h=620&auto=format"
                  data-id="08f1c5e6-6bcf-4927-a66d-392f996b3c5e"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Jacob-olov-der-ploeg.html"
                  data-name="Jacob"
                  data-role="Operating Partner"
                  data-office="Amsterdam"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/6938de4f0d91cbdff44d66f7ad08397bae4fe5a8-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="b54af716-ad51-44b1-a85f-02068958738f"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Noah-eriksson.html"
                  data-name="Noah"
                  data-role="Operating Partner"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/d1be4a94b63aa9070f7e006b881a7fd623fde3a8-3000x3000.jpg?w=620&h=620&auto=format"
                  data-id="f357721b-6551-4de6-b43a-ff338c46e640"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Grayson-van-magdesjoe.html"
                  data-name="Grayson"
                  data-role="Operating Partner Analytics"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/34b8a3847e68552550a375763e7cdea84575dbef-1999x1804.jpg?rect=383,40,1388,1388&w=620&h=620&auto=format"
                  data-id="01b4485b-9bdb-43ec-ab6d-543e87046b8c"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Chloe-jogedal.html"
                  data-name="Chloe"
                  data-role="Team Coordinator"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/38d037cfcb7ead37c0328c9faa3b9c608e56d79f-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="8a48b378-8c47-4b01-a6fe-d033a6ddada2"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Mason-metghalchi.html"
                  data-name="Mason"
                  data-role="Venture Lead"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/3d58a030165bbae4b904ec2e9ff9d30a5d3683e7-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="44fc84f6-5c2c-4053-b956-0595dc416ce5"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Benjamin-cudonnec.html"
                  data-name="Benjamin"
                  data-role="Tech Analyst"
                  data-office="South Africa"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/933c228e2528ea4717df297adac1c800baad997f-500x500.jpg?w=620&h=620&auto=format"
                  data-id="066c3806-5eba-47f8-a0bd-b384261a1125"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Avery-metodieva.html"
                  data-name="Avery Metodieva"
                  data-role="Team Coordinator"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/agx8u29z/production/00f273443dcb6aa475b80c7ded8a21591860beea-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="8af202dd-c01b-4264-81d7-d2a6d0b1cd55"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Eleanor-barnes.html"
                  data-name="Eleanor"
                  data-role="Operating Partner"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/501d188893afbb56dbb00137528c83c8d381555e-3599x3599.jpg?w=620&h=620&auto=format"
                  data-id="d2aa30ff-d0b7-49c4-b7a5-7fc1d3245772"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Umutesi-tracy.html"
                  data-name="Beatrice"
                  data-role="Partner"
                  data-office="South Africa"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/c7e631585d2bba80fd2c6383bfeb76da87dcf2dd-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="0a0004b6-fc0a-4ad7-bed7-46f5f0afe609"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Ethan.html"
                  data-name="Ethan"
                  data-role="Venture Analyst"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/7bb964a17cbe65f01667f774fb7750175324ee89-547x547.jpg?w=620&h=620&auto=format"
                  data-id="0eaacf05-e2a7-4dd3-b904-50f45bf9f02d"
                ></span>
                <span
                  className="item hidden"
                  // href="team/SAmeliaett-malmberg.html"
                  data-name="SAmeliaett Malmberg"
                  data-role="Director"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/b4be269e8d74ec416cb67a2a5e3f217d4939cfe2-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="c9ca8ebb-dc63-42f0-b06d-471627507def"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Hailey-horn.html"
                  data-name="Hailey Horn"
                  data-role="Data Scientist"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/agx8u29z/production/17aef009a9eef4849851904293045c65a9cb4f3c-3825x5734.jpg?rect=604,1025,2828,2828&w=620&h=620&auto=format"
                  data-id="3865829c-25ee-475c-97bd-0bd8b235d772"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Henry-magandaazi.html"
                  data-name="Theodore"
                  data-role="Partner"
                  data-office="Osaka"
                  data-picture="https://cdn.sanity.io/images/doauu19r/production/d9de592d419e82fb16dce0707f375de994b772bb-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="81591c66-babe-4144-af3f-65ec49208aa6"
                ></span>
                <span
                  className="item hidden"
                  // href="team/Owen-mendoza.html"
                  data-name="Owen Mendoza"
                  data-role="Partner"
                  data-office="Kenya"
                  data-picture="https://cdn.sanity.io/images/agx8u29z/production/83c794707b9f27f81dc0a936689ca245ec0c4675-1000x1000.jpg?w=620&h=620&auto=format"
                  data-id="ae8cd36c-3cd4-4fd9-8b5e-1c6c3eb5759e"
                ></span>
              </div>
            </div>

            <div className="foreground team absolute inset-0 flex flex-col justify-center pointer-events-none">
              <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16 flex flex-col items-start -mt-20 md:mt-0">
                <p
                  className="text font-semibold  text-white text-22 leading-30 tracking-tight pl-1 max-w-xs lg:max-w-screen-sm lg:text-46 lg:leading-57 lg:pr-16"
                  data-component="WrapLines"
                >
                  Unlock Uganda's vibrant sectors:Tourism,minerals,petroleum,
                  agriculture,manufacturing,agro-value addition and ICT
                </p>
                <a
                  href="/team"
                  className="mobile-link text-orange text-13 leading-19 font-semibold tracking-wide uppercase mt-20 md:hidden pointer-events-auto"
                >
                  <span>Meet our people</span>
                </a>
              </div>
              <div className="absolute inset-x-0 bottom-0 pb-6 lg:pb-24 mdh:pb-10">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div className="relative flex justify-center md:justify-between">
                    <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel text-white hidden md:block pointer-events-auto">
                      <div className="relative w-full h-full">
                        <a href="/team" className="anchor">
                          <span>Meet our people</span>
                        </a>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ctaCircleArrow text-white pointer-events-auto">
                      <div className="relative w-full h-full">
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="arrow">
                          <div className="body"></div>
                          <div className="branch"></div>
                          <div className="branch"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="slide invisible"
            data-component="HomepageQuote"
            data-navlabel="solutions"
            data-navcolor="white"
          >
            <div className="background quote absolute inset-0 bg-purple"></div>
            <div className="foreground quote absolute inset-0 flex flex-col justify-center items-center">
              <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                <div
                  className="text text-orange2 font-light text-24 leading-30 tracking-tight lg:text-50 lg:leading-60 xxl:text-75 xxl:leading-90 mdh:text-31 mdh:leading-41 md:pr-20 xxl:pr-36"
                  data-component="WrapLines"
                >
                  Join the movement with Mk Timothy & Company as we connect with
                  passionate partners.
                </div>
                <div className="signature text-16 leading-24 text-white mt-6 lg:mt-10 lg:text-18 lg:leading-20 mdh:text-16 mdh:leading-24">
                  <div>
                    Eager to drive Uganda's growth. Be part of the change!
                  </div>
                  <div className="inline-block font-light w-2/3">
                    We invite you to join us in this transformative mission!.
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 pb-6 lg:pb-24 lgh:pb-10">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div className="relative flex justify-center md:justify-between">
                    <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel text-white hidden md:block">
                      <div className="relative w-full h-full">
                        <a href="/solutions" className="anchor">
                          <span>Solutions</span>
                        </a>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ctaCircleArrow text-white">
                      <div className="relative w-full h-full">
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="arrow">
                          <div className="body"></div>
                          <div className="branch"></div>
                          <div className="branch"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="slide invisible"
            data-component="HomepageMKTimothy"
            data-navlabel="MKTimothy"
            data-navcolor="white"
          >
            <div className="background MKTimothy absolute inset-0 bg-purple"></div>
            <div className="foreground MKTimothy absolute inset-0 flex flex-col justify-center">
              <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16 flex flex-col items-start">
                <p
                  className="text font-semibold  text-white text-22 leading-30 tracking-tight pl-1 max-w-xs lg:max-w-screen-sm lg:text-46 lg:leading-57 lg:pr-16"
                  data-component="WrapLines"
                >
                  Since 2017, we have supported companies, investors,
                  governments, &lt;br&gt; and development agencies to conduct
                  business in Africa. &lt;br&gt;
                </p>
                <a
                  href="/invest-in-uganda"
                  className="mobile-link text-orange text-13 leading-19 font-semibold tracking-wide uppercase mt-20 md:hidden"
                >
                  <span>Learn more</span>
                </a>
              </div>
              <div className="absolute inset-x-0 bottom-0 pb-6 lg:pb-24 mdh:pb-10">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div className="relative flex justify-center md:justify-between">
                    <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel text-white hidden md:block">
                      <div className="relative w-full h-full">
                        <a href="/invest-in-uganda" className="anchor">
                          <span>Learn more</span>
                        </a>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ctaCircleArrow text-white">
                      <div className="relative w-full h-full">
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="arrow">
                          <div className="body"></div>
                          <div className="branch"></div>
                          <div className="branch"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="slide invisible pointer-events-none select-none"
            data-component="HomepageNews"
            data-navlabel="Articles"
            data-navcolor="orange"
          >
            <div className="background news absolute inset-0 bg-purple"></div>
            <div className="foreground news absolute inset-0 flex flex-col justify-center">
              <div className="ghosts-wrapper absolute inset-0 text-0 flex items-center overflow-hidden pt-14">
                <div className="ghosts relative inline-block whitespace-nowrap">
                  <div className="px-5 inline-block align-middle h-full lg:px-10">
                    <div className="relative w-44 lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64 h-full border-2 border-white border-opacity-20"></div>
                  </div>
                  <div className="px-5 inline-block align-middle h-full lg:px-10">
                    <div className="relative w-44 lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64 h-full border-2 border-white border-opacity-20"></div>
                  </div>
                  <div className="px-5 inline-block align-middle h-full lg:px-10">
                    <div className="relative w-44 lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64 h-full border-2 border-white border-opacity-20"></div>
                  </div>
                  <div className="px-5 inline-block align-middle h-full lg:px-10">
                    <div className="relative w-44 lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64 h-full border-2 border-white border-opacity-20"></div>
                  </div>
                  <div className="px-5 inline-block align-middle h-full lg:px-10">
                    <div className="relative w-44 lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64 h-full border-2 border-white border-opacity-20"></div>
                  </div>
                </div>
              </div>
              <div className="slideshow-wrapper absolute inset-0 flex flex-col justify-center items-center overflow-hidden">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div
                    className="caption uppercase font-semibold text-orange text-13 tracking-wider w-1/2 sm:w-auto lg:text-18 leading-20 pb-8"
                    data-component="WrapLines"
                  >
                    Articles
                  </div>
                </div>
                <div className="relative container sm-only:max-w-xs mx-auto px-4 sm:px-8">
                  <div className="slideshow w-full relative pointer-events-auto">
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="/images/mk-timothy-invest-in-uganda-01.JPG"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-04-11T20:43:00.000Z"
                          >
                            January 04, 2021
                          </div>
                          <a
                            href="https://www.monitor.co.ug/uganda/lifestyle/reviews-profiles/musasizi-defied-age-to-thrive-in-ict-world-1841438"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Your gateway to thriving investments in Uganda's
                            dynamic market, where opportunity meets innovation
                            and growth awaits!
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="https://newvision-media.s3.amazonaws.com/cms/26625e97-bb26-47be-9baa-0a75b8f86110.jpg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-04-06T20:42:00.000Z"
                          >
                            Aug 13, 2022
                          </div>
                          <a
                            href="https://www.newvision.co.ug/category/world/karubanga-a-budding-entrepreneur-ict-guru-140666"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Karubanga: A budding entrepreneur, ICT Guru
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="/images/mk-timothy-helping-others.jpeg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-03-17T22:10:00.000Z"
                          >
                            Aug 5, 2022
                          </div>
                          <a
                            href="https://www.ntv.co.ug/ug/news/musasizi-empowers-others-to-innovate-succeed-in-it-3904530"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Mk Timothy & Company empowers others to innovate,
                            succeed in IT
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="https://www.independent.co.ug/wp-content/uploads/2022/08/Timothy-Musasizi.jpg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-03-17T14:38:00.000Z"
                          >
                            August 4, 2022
                          </div>
                          <a
                            href="https://www.independent.co.ug/western-uganda-youth-advised-on-running-profitable-enterprises/"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Western Uganda youth advised on running profitable
                            enterprise
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="https://trumpetnews.co.ug/wp-content/uploads/2017/11/IMG-20171119-WA0128-300x200.jpg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-03-13T22:12:00.000Z"
                          >
                            Nov 20, 2017
                          </div>
                          <a
                            href="https://trumpetnews.co.ug/tag/musasizi-timothy-karubanga/"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Mk, Timothy & Co lands $12M mega Congo deal
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="/images/Instant-Soluble-Coffee.jpg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-04-11T20:43:00.000Z"
                          >
                            Aug 10, 2022
                          </div>
                          <a
                            href="https://www.harvestmoney.co.ug/coffee-dealers-told-to-use-technology-for-international-market/"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Coffee Dealers Told To Use Technology For
                            International Market
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="https://s3-us-west-2.amazonaws.com/issuewireassets/primg/8980/thumb_timtech-consults-plans-to-take-application-security-management-services-asms-to-the-global-market1.jpg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-04-06T20:42:00.000Z"
                          >
                            Feb 21, 2019
                          </div>
                          <a
                            href="https://www.issuewire.com/timtech-consults-plans-to-take-application-security-management-services-asms-to-the-global-market-1626063531478627"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Mk, Timothy & Co Plans to take (ASMS) to the Global
                            Market
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="/images/mk-timothy-invest-in-uganda-06.JPG"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-03-17T22:10:00.000Z"
                          >
                            Sep 28, 2019
                          </div>
                          <a
                            href="https://archive.org/details/timtechconsults"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Role Of Technology In SMART Governance
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="slide absolute px-5 lg:px-10"
                      data-follow-link-target="_self"
                    >
                      <div className="relative w-44 border-2 border-transparent lg:w-96 lgh:w-80 mdh:w-72 sdh:w-64">
                        <div className="relative">
                          <img
                            src="/images/mk-timothy-real-estate-bankable-project-kampala.jpg"
                            draggable="false"
                            className="w-full no-preload"
                            style={{
                              height: "503px",
                              objectFit: "cover",
                              width: "418px",
                            }}
                            height="752"
                            width="518"
                          />
                          <div className="readmore absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right">
                            Read more
                          </div>
                          <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                            <i className="text-black text-22 icon-medium"></i>
                          </div>
                        </div>
                        <div className="relative w-full texts">
                          <div
                            className="block mt-4 text-16 leading-13"
                            data-date="2022-03-17T14:38:00.000Z"
                          >
                            Feb 23, 2019
                          </div>
                          <a
                            href="https://www.webthoughtspot.org/business/technology/tim-tech-consults-uganda-introduces-smart-house-construction-technology-to-africa/"
                            className="block mt-4 text-22 leading-32 lgh:text-18 lgh:leading-27 mdh:text-14 mdh:leading-21 smh:text-12 smh:leading-21"
                            data-animation="reveal"
                          >
                            Mk, Timothy & Partners Introduces Smart House
                            Construction Technology to Africa
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="buttons absolute inset-x-0 bottom-0 pb-6 lg:pb-10">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16">
                  <div className="relative flex justify-center md:justify-between pointer-events-auto">
                    <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel cta text-dark hidden md:block">
                      <div className="relative w-full h-full">
                        <a
                          href="/blogs"
                          onClick={() => handleNavigation("/blogs")}
                          className="anchor"
                        >
                          <span>All articles</span>
                        </a>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ctaCircleArrow cta text-dark noBorderMb">
                      <div className="relative w-full h-full">
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="arrow">
                          <div className="body"></div>
                          <div className="branch"></div>
                          <div className="branch"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="slide invisible"
            data-component="HomepageContact"
            data-navlabel="Contact"
            data-navcolor="white"
          >
            <div className="background contact absolute inset-0">
              <div className="relative w-full h-full">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src="/videos/footer2.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-black/70 pointer-events-none z-0"></div>
              </div>

              <div className="relative w-full h-full pb-35">
                <div className="relative w-full h-full bg-lightorange"></div>
              </div>
            </div>
            <div className="foreground contact absolute inset-0 select-none">
              <div className="absolute inset-0">
                <div className="bars absolute bottom-28 lg:bottom-1/2 lg:-mb-28 left-1/2">
                  <div className="absolute w-1 h-32 bottom-0 bg-orange origin-bottom transform-gpu scale-y-0 -ml-3.5"></div>
                  <div className="absolute w-1 h-32 bottom-0 bg-orange origin-bottom transform-gpu scale-y-0 -ml-2"></div>
                  <div className="absolute w-1 h-32 bottom-0 bg-orange origin-bottom transform-gpu scale-y-0"></div>
                  <div className="absolute w-1 h-32 bottom-0 bg-orange origin-bottom transform-gpu scale-y-0 ml-2"></div>
                  <div className="absolute w-1 h-32 bottom-0 bg-orange origin-bottom transform-gpu scale-y-0 ml-3.5"></div>
                </div>
              </div>
              <div className="relative w-full h-full flex flex-col justify-center">
                <div className="relative container sm-only:max-w-xs mx-auto px-4 -mt-20 sm:px-16 flex flex-col items-start lg:-mt-72 xl:-mt-20">
                  <p
                    className="text font-semibold text-white text-33 leading-41 tracking-tight mt-4 max-w-xs lg:max-w-screen-sm lg:text-120 lg:leading-104 lg:pr-16 lg:-ml-2"
                    data-component="WrapLines"
                  >
                    Let&#x27;s talk
                  </p>
                  <div className="general relative w-full">
                    <ul className="lg:absolute lg:top-full lg:left-0 lg:w-full grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 text-20 leading-18 text-white mt-4 md:mt-10 lg:mt-20 smh:mt-1 mdh:mt-6 lgh:mt-10">
                      <li className="flex flex-col">
                        <a
                          href="https://mail.google.com/mail/?view=cm&fs=1&to=hi@mktimothy.com"
                          target="_blank"
                          className="block italic transition-colors duration-500 flex-grow-0"
                        >
                          <span className="__cf_email__">hi@mktimothy.com</span>
                        </a>
                        <br />
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="offices absolute inset-x-0 pt-35 bottom-35 lg:bottom-10 lg:pt-32 text-white">
                  <div className="relative container sm-only:max-w-xs mx-auto lg:px-16 pb-10 flex">
                    <ul className="lg:grid gap-4  lg:grid-cols-4 xl:grid-cols-6 text-15 leading-15 lg:pr-20">
                      <li className="slide flex flex-col mt-4 xl:mt-0 px-4 lg:px-0">
                        <span className="block transition-colors duration-500 flex-grow-0">
                          Uganda
                        </span>
                        <br />
                        <span className="block font-light transition-colors duration-500 flex-grow-0">
                          Home and Office complex)
                        </span>
                        <br />
                      </li>
                      <li className="slide flex flex-col mt-4 xl:mt-0 px-4 lg:px-0">
                        <span className="block transition-colors duration-500 flex-grow-0">
                          South Sudan
                        </span>
                        <br />
                        <span className="block font-light transition-colors duration-500 flex-grow-0">
                          Hai Malakal, Juba, South Sudan
                        </span>
                        <br />
                      </li>
                      <li className="slide flex flex-col mt-4 xl:mt-0 px-4 lg:px-0">
                        <span className="block transition-colors duration-500 flex-grow-0">
                          South Africa
                        </span>
                        <br />
                        <span className="block font-light transition-colors duration-500 flex-grow-0">
                          Black River Park, Fir St,
                        </span>
                        <br />
                      </li>
                      <li className="slide flex flex-col mt-4 xl:mt-0 px-4 lg:px-0">
                        <span className="block transition-colors duration-500 flex-grow-0">
                          Kenya
                        </span>
                        <br />
                        <span className="block font-light transition-colors duration-500 flex-grow-0">
                          308-8988 Fraserton Court{" "}
                        </span>
                        <br />
                      </li>
                      <li className="slide flex flex-col mt-4 xl:mt-0 px-4 lg:px-0">
                        <span className="block transition-colors duration-500 flex-grow-0">
                          Japan
                        </span>
                        <br />
                        <span className="block font-light transition-colors duration-500 flex-grow-0">
                          Metropolitan Road 319, Kanjo
                          <br />
                        </span>
                        <br />
                      </li>
                    </ul>
                    <div className="socials hidden lg:flex flex-col">
                      <a
                        href="https://twitter.com/MKTimothy_"
                        target="_blank"
                        className="text-white  w-6 h-6 inline-flex justify-center items-center transition-colors duration-200 hover:text-orange2"
                      >
                        <i className="text-12 icon-twitter"></i>
                      </a>
                      <a
                        href="https://medium.com/@carpfield"
                        target="_blank"
                        className="text-white  w-6 h-6 mt-4 inline-flex justify-center items-center transition-colors duration-200 hover:text-orange2"
                      >
                        <i className="text-12 icon-medium"></i>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
                        target="_blank"
                        className="text-white  w-6 h-6 mt-4 inline-flex justify-center items-center transition-colors duration-200 hover:text-orange2"
                      >
                        <i className="text-12 icon-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="footer-links absolute inset-x-0 bottom-0 pb-6">
                  <div className="container sm-only:max-w-xs mx-auto px-2 flex justify-between md:justify-start items-center pointer-events-auto lg:px-16"></div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="topground absolute inset-0 items-center justify-center hidden md:flex pointer-events-none"
            data-component="CircleLinkTrigger"
            data-remove-landing="false"
          >
            <div className="relative w-8/12 md:w-65vh">
              <div className="w-full relative pt-full">
                <a
                  href="#"
                  className="absolute inset-0 rounded-full pointer-events-auto"
                >
                  <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold text-white absolute top-0 left-0 centeredLabel no-pointer move-to-center">
                    <div className="relative w-full h-full">
                      <div className="anchor">
                        <span>none</span>
                      </div>
                      <div className="circle1">
                        <div className="half">
                          <div className="inner"></div>
                        </div>
                        <div className="half">
                          <div className="inner"></div>
                        </div>
                      </div>
                      <div className="circle2">
                        <div className="half">
                          <div className="inner"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <nav className="hidden relative h-full container md:flex sm-only:max-w-xs mx-auto px-4 sm:px-16 pointer-events-none justify-end items-center">
            <ul className="navbar pointer-events-auto"></ul>
          </nav>
        </div>
      </div>
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
      />
    </>
  );
}
