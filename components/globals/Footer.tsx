"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { useEffect, useState } from "react";

interface Sector {
  id: string;
  name: string;
  slug: string;
  _count?: {
    listings: number;
  };
}

const Footer = () => {
  const pathname = usePathname();
  const isOtherPage =
    pathname === "/chats" ||
    pathname === "/dashboard" ||
    pathname === "/analytics" ||
    pathname === "/categories" ||
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
    pathname === "/invest-in-uganda" ||
    pathname === "/moderator-assignments" ||
    pathname === "/pitch-idea" ||
    pathname === "/investors" ||
    pathname === "/comments" ||
    pathname === "/support-tickets" ||
    pathname === "/whatsapp-chatbot" ||
    pathname.includes("/onboarding") ||
    pathname.includes("/investors/") ||
    pathname.includes("/pitch-idea/") ||
    pathname.includes("/messages") ||
    pathname.includes("/calls") ||
    pathname.includes("/invest-in-uganda/");

  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch("/api/sectors?includeListingCount=true");
        const result = await response.json();

        if (result.success) {
          const sortedSectors = result.data
            .filter((sec: Sector) => sec._count && sec._count.listings > 0)
            .sort(
              (a: Sector, b: Sector) =>
                (b._count?.listings || 0) - (a._count?.listings || 0),
            )
            .slice(0, 4);
          setSectors(sortedSectors);
        }
      } catch (error) {
        console.error("Error fetching sectors in footer:", error);
      }
    };

    fetchSectors();
  }, []);

  return (
    <div
      className={`w-full bg-white border-t font-sans ${
        isOtherPage ? "hidden" : "block"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Header */}
        <div className="flex justify-between items-center pb-8 border-b border-gray-200">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="MK Timothy Logo"
              width={150}
              height={45}
              className="object-contain invert"
            />
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/mktimothyco/"
              className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black hover:text-greencolor hover:border-greencolor transition-colors"
            >
              <FaFacebook size={18} />
            </a>
            <a
              href="https://twitter.com/MKTimothy_"
              className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black hover:text-greencolor hover:border-greencolor transition-colors"
            >
              <FaXTwitter size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
              className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black hover:text-greencolor hover:border-greencolor transition-colors"
            >
              <FaLinkedinIn size={18} />
            </a>
          </div>
        </div>

        {/* Main Links Area */}
        <div className="footer-links-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
          {/* Column 1 */}
          <div>
            <h3 className="text-[15px] font-bold text-black mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about-us"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Strategic Partners
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Media & News
                </Link>
              </li>
              <li>
                <Link
                  href="/invest-in-uganda"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Invest in Uganda
                </Link>
              </li>
            </ul>
            <h3 className="text-[15px] font-bold text-black mt-10 mb-6">
              Explore
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/blogs"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Our Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/businesses"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Businesses Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-[15px] font-bold text-black mb-6">
              Services
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/businesses"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Business Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Specializations
                </Link>
              </li>
              <li>
                <Link
                  href="/all-listings"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/invest-in-uganda"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Investment Advisory
                </Link>
              </li>
            </ul>
            <h3 className="text-[15px] font-bold text-black mt-10 mb-6">
              Compare
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Market Insights
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Business Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-[15px] font-bold text-black mb-6">
              Most Popular
            </h3>
            <ul className="space-y-4">
              {sectors.length > 0 ? (
                sectors.map((sector) => (
                  <li key={sector.id}>
                    <Link
                      href={`/all-listings?sector=${sector.id}`}
                      className="text-[14px] text-black hover:text-greencolor"
                    >
                      {sector.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i}>
                      <div className="w-32 h-4 bg-gray-300 animate-pulse rounded"></div>
                    </li>
                  ))}
                </>
              )}
            </ul>
           
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-[15px] font-bold text-black mb-6">
              Information
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="https://company.mktimothy.com/definitions.html"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Definitions
                </Link>
              </li>
              <li>
                <Link
                  href="https://company.mktimothy.com/terms.html"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="https://company.mktimothy.com/privacy.html"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://company.mktimothy.com/cookie-policy.html"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h3 className="text-[15px] font-bold text-black mb-6">Help</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="https://contact.mktimothy.com/"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/investors-login/"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  Partner&apos;s Portal
                </Link>
              </li>

              <li>
                <Link
                  href="mailto:hi@mktimothy.com"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  hi@mktimothy.com
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+256200902220"
                  className="text-[14px] text-black hover:text-greencolor"
                >
                  +256200902220
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-[13px] text-black pb-10">
          <Link href="/about-us" className="hover:text-greencolor">
            About Us
          </Link>
          <Link
            href="https://company.mktimothy.com/terms.html"
            className="hover:text-greencolor"
          >
            Cancellation & Refunds Policy
          </Link>
          <Link
            href="https://company.mktimothy.com/terms.html"
            className="hover:text-greencolor"
          >
            Terms and Conditions
          </Link>
          <Link
            href="https://company.mktimothy.com/privacy.html"
            className="hover:text-greencolor"
          >
            Privacy Policy
          </Link>

          <Link href="/sitemap" className="hover:text-greencolor">
            Sitemap
          </Link>
          <Link href="/report" className="hover:text-greencolor">
            Report Abuse
          </Link>
        </div>

        {/* Bottom Footer Area */}
        <div className="footer-bottom-bar flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <p className="text-[13px] text-black mb-4 md:mb-0">
            ©{new Date().getFullYear()} Mk Timothy & Company - All rights
            reserved
          </p>

          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Image
                key={num}
                src={`/images/payment${num}.png`}
                alt={`Payment method ${num}`}
                width={48}
                height={30}
                className="object-contain w-auto h-5 sm:h-6 rounded-lg border shadow-[rgba(0, 0, 0, 0.5)_0px_4px_12px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
