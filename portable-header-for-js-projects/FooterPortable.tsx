"use client";

/**
 * ───────────────────────────────────────────────────────────────────────────
 *  PORTABLE FOOTER — TYPESCRIPT (TSX) VERSION
 *  For TypeScript Next.js projects. Works in Pages Router
 *  (pages/_app.tsx) and App Router alike.
 * ───────────────────────────────────────────────────────────────────────────
 *  Self-contained dark footer with dynamic sector links, social icons,
 *  payment method images, and multi-column navigation.
 *  • NO auth requirements — works in any project.
 *  • Internal links open on the main site via baseUrl prop.
 *  • Sectors are fetched live from the main site's API.
 *  • Custom Tailwind colours are replaced with inline styles so this component
 *    works without the host project's tailwind.config.
 *
 *  Install:  yarn add react-icons
 *            (next/image is already included with Next.js)
 *
 *  Usage:
 *    import FooterPortable from "@/portable-header-for-js-projects/FooterPortable";
 *    <FooterPortable />
 *
 *  Props:
 *    hidden   – hide the footer entirely (default: false)
 *    baseUrl  – prefix for internal links + API / asset calls
 *               (default: "https://www.mktimothy.com")
 *    logoSrc  – path/URL for the footer logo image
 *               (default: "/images/logo.png")
 * ───────────────────────────────────────────────────────────────────────────
 */

import Image from "next/image";
import { CSSProperties, FC, useEffect, useState } from "react";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

/* ─── types ──────────────────────────────────────────────────────────────── */

interface Sector {
  id: string;
  name: string;
  slug: string;
  _count?: { listings: number };
}

interface NavLink {
  label: string;
  href: string;
}

export interface FooterPortableProps {
  hidden?: boolean;
  baseUrl?: string;
  logoSrc?: string;
}

/* ─── constants ─────────────────────────────────────────────────────────── */

const DEFAULT_BASE_URL = "https://www.mktimothy.com";

/** Mirrors the custom colours defined in tailwind.config of the main project */
const C = {
  bgdark: "#2C2C2C",
  green: "#00805A",
  textMuted: "#9ca3af", // gray-400
  textHeading: "#e5e7eb", // gray-200
  border: "rgba(209,213,219,0.2)",
  socialBorder: "rgba(209,213,219,0.5)",
} as const;

/* ─── column data ────────────────────────────────────────────────────────── */

const COMPANY_LINKS: NavLink[] = [
  { label: "About Us", href: "/about-us" },
  { label: "Strategic Partners", href: "/team" },
  { label: "Media & News", href: "/blogs" },
  { label: "Invest in Uganda", href: "/invest-in-uganda" },
];
const EXPLORE_LINKS: NavLink[] = [
  { label: "Our Blogs", href: "/blogs" },
  { label: "Businesses Directory", href: "/businesses" },
];
const SERVICES_LINKS: NavLink[] = [
  { label: "Business Registration", href: "/businesses" },
  { label: "Specializations", href: "/solutions" },
  { label: "Listings", href: "/all-listings" },
  { label: "Investment Advisory", href: "/invest-in-uganda" },
];
const COMPARE_LINKS: NavLink[] = [
  { label: "Market Insights", href: "#" },
  { label: "Business Trends", href: "#" },
];
const TUTORIALS_LINKS: NavLink[] = [
  { label: "All Tutorials", href: "#" },
  { label: "How-To Guides", href: "#" },
];
const INFORMATION_LINKS: NavLink[] = [
  {
    label: "Definitions",
    href: "https://company.mktimothy.com/definitions.html",
  },
  {
    label: "Terms and Conditions",
    href: "https://company.mktimothy.com/terms.html",
  },
  {
    label: "Privacy Policy",
    href: "https://company.mktimothy.com/privacy.html",
  },
  {
    label: "Cookie Policy",
    href: "https://company.mktimothy.com/cookie-policy.html",
  },
  { label: "Partners", href: "#" },
];
const HELP_LINKS: NavLink[] = [
  { label: "Contact Us", href: "https://contact.mktimothy.com/" },
  { label: "Partner's Portal", href: "/investors-login/" },
  { label: "hi@mktimothy.com", href: "mailto:hi@mktimothy.com" },
  { label: "+256200902220", href: "tel:+256200902220" },
];
const BOTTOM_LINKS: NavLink[] = [
  { label: "About Us", href: "/about-us" },
  {
    label: "Cancellation & Refunds Policy",
    href: "https://company.mktimothy.com/terms.html",
  },
  {
    label: "Terms and Conditions",
    href: "https://company.mktimothy.com/terms.html",
  },
  {
    label: "Privacy Policy",
    href: "https://company.mktimothy.com/privacy.html",
  },
  { label: "Sitemap", href: "/sitemap" },
  { label: "Report Abuse", href: "/report" },
];

/* ─── tiny helper sub-components ────────────────────────────────────────── */

interface ColHeadingProps {
  children: React.ReactNode;
  extraTopMargin?: boolean;
}
const ColHeading: FC<ColHeadingProps> = ({
  children,
  extraTopMargin = false,
}) => (
  <h3
    style={{
      fontSize: 15,
      fontWeight: "bold",
      color: C.textHeading,
      marginBottom: 24,
      marginTop: extraTopMargin ? 40 : 0,
    }}
  >
    {children}
  </h3>
);

interface ColLinkProps {
  label: string;
  onClick: () => void;
}
const ColLink: FC<ColLinkProps> = ({ label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <li style={{ listStyle: "none" }}>
      <a
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontSize: 14,
          color: hovered ? C.green : C.textMuted,
          textDecoration: "none",
          cursor: "pointer",
          transition: "color 0.2s",
        }}
      >
        {label}
      </a>
    </li>
  );
};

const listStyle: CSSProperties = {
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

interface ColLinkListProps {
  links: NavLink[];
  onNav: (href: string) => void;
}
const ColLinkList: FC<ColLinkListProps> = ({ links, onNav }) => (
  <ul style={listStyle}>
    {links.map((l) => (
      <ColLink key={l.label} label={l.label} onClick={() => onNav(l.href)} />
    ))}
  </ul>
);

interface SocialButtonProps {
  href: string;
  children: React.ReactNode;
}
const SocialButton: FC<SocialButtonProps> = ({ href, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: `1px solid ${hovered ? C.green : C.socialBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: hovered ? C.green : C.textHeading,
        textDecoration: "none",
        transition: "color 0.2s, border-color 0.2s",
      }}
    >
      {children}
    </a>
  );
};

interface BottomLinkProps {
  label: string;
  onClick: () => void;
}
const BottomLink: FC<BottomLinkProps> = ({ label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? C.green : C.textMuted,
        textDecoration: "none",
        cursor: "pointer",
        transition: "color 0.2s",
      }}
    >
      {label}
    </a>
  );
};

/* ─── main component ─────────────────────────────────────────────────────── */

const FooterPortable: FC<FooterPortableProps> = ({
  hidden = false,
  baseUrl = DEFAULT_BASE_URL,
  logoSrc = "/images/logo.png",
}) => {
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    const base = baseUrl.replace(/\/$/, "");
    fetch(`${base}/api/sectors?includeListingCount=true`)
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          const sorted: Sector[] = result.data
            .filter((s: Sector) => s._count && s._count.listings > 0)
            .sort(
              (a: Sector, b: Sector) =>
                (b._count?.listings ?? 0) - (a._count?.listings ?? 0),
            )
            .slice(0, 4);
          setSectors(sorted);
        }
      })
      .catch((err: unknown) =>
        console.error("FooterPortable: error fetching sectors", err),
      );
  }, [baseUrl]);

  if (hidden) return null;

  const base = baseUrl.replace(/\/$/, "");

  const handleNavigation = (href: string): void => {
    const url = href.startsWith("/") ? `${base}${href}` : href;
    window.location.href = url;
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: C.bgdark,
        borderTop: `1px solid ${C.border}`,
        fontFamily: "Sofia, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 16px" }}>
        {/* ── Top: logo + social icons ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 32,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <Image
            src={logoSrc}
            alt="MK Timothy Logo"
            width={150}
            height={45}
            style={{ objectFit: "contain" }}
          />
          <div style={{ display: "flex", gap: 16 }}>
            <SocialButton href="#">
              <FaFacebook size={18} />
            </SocialButton>
            <SocialButton href="#">
              <FaXTwitter size={18} />
            </SocialButton>
            <SocialButton href="#">
              <AiFillInstagram size={18} />
            </SocialButton>
            <SocialButton href="#">
              <FaLinkedinIn size={18} />
            </SocialButton>
          </div>
        </div>

        {/* ── Main links grid ───────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8"
          style={{ padding: "48px 0" }}
        >
          {/* Column 1 — Company + Explore */}
          <div>
            <ColHeading>Company</ColHeading>
            <ColLinkList links={COMPANY_LINKS} onNav={handleNavigation} />
            <ColHeading extraTopMargin>Explore</ColHeading>
            <ColLinkList links={EXPLORE_LINKS} onNav={handleNavigation} />
          </div>

          {/* Column 2 — Services + Compare */}
          <div>
            <ColHeading>Services</ColHeading>
            <ColLinkList links={SERVICES_LINKS} onNav={handleNavigation} />
            <ColHeading extraTopMargin>Compare</ColHeading>
            <ColLinkList links={COMPARE_LINKS} onNav={handleNavigation} />
          </div>

          {/* Column 3 — Most Popular (live sectors) + Tutorials */}
          <div>
            <ColHeading>Most Popular</ColHeading>
            <ul style={listStyle}>
              {sectors.length > 0
                ? sectors.map((sector) => (
                    <ColLink
                      key={sector.id}
                      label={sector.name}
                      onClick={() =>
                        handleNavigation(`/all-listings?sector=${sector.id}`)
                      }
                    />
                  ))
                : ([1, 2, 3, 4] as const).map((i) => (
                    <li key={i} style={{ listStyle: "none" }}>
                      <div
                        style={{
                          width: 128,
                          height: 16,
                          backgroundColor: "#374151",
                          borderRadius: 4,
                          opacity: 0.7,
                        }}
                      />
                    </li>
                  ))}
            </ul>
            {/* <ColHeading extraTopMargin>Tutorials</ColHeading> */}
            {/* <ColLinkList links={TUTORIALS_LINKS} onNav={handleNavigation} /> */}
          </div>

          {/* Column 4 — Information */}
          <div>
            <ColHeading>Information</ColHeading>
            <ColLinkList links={INFORMATION_LINKS} onNav={handleNavigation} />
          </div>

          {/* Column 5 — Help */}
          <div>
            <ColHeading>Help</ColHeading>
            <ColLinkList links={HELP_LINKS} onNav={handleNavigation} />
          </div>
        </div>

        {/* ── Middle: legal quick-links ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            fontSize: 13,
            paddingBottom: 40,
          }}
        >
          {BOTTOM_LINKS.map((l) => (
            <BottomLink
              key={l.label}
              label={l.label}
              onClick={() => handleNavigation(l.href)}
            />
          ))}
        </div>

        {/* ── Bottom: copyright + payment icons ───────────────────────── */}
        <div
          className="flex flex-col md:flex-row justify-between items-center"
          style={{
            paddingTop: 32,
            borderTop: `1px solid ${C.border}`,
            gap: 16,
          }}
        >
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
            ©{new Date().getFullYear()} Mk Timothy &amp; Company - All rights
            reserved
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {([1, 2, 3, 4, 5, 6] as const).map((num) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={num}
                src={`${base}/images/payment${num}.png`}
                alt={`Payment method ${num}`}
                style={{
                  objectFit: "contain",
                  width: "auto",
                  height: 24,
                  borderRadius: 8,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterPortable;
