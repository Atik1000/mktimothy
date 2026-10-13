import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Navigate through MK Timothy & Company's website structure.",
};

const sitemapData = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about-us" },
      { name: "Strategic Partners", href: "/team" },
      { name: "Media & News", href: "/blogs" },
      { name: "Invest in Uganda", href: "/invest-in-uganda" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Our Blogs", href: "/blogs" },
      { name: "Businesses Directory", href: "/businesses" },
    ],
  },
  {
    title: "Services",
    links: [
      { name: "Business Registration", href: "/businesses" },
      { name: "Specializations", href: "/solutions" },
      { name: "Listings", href: "/all-listings" },
      { name: "Investment Advisory", href: "/invest-in-uganda" },
    ],
  },
  {
    title: "Compare",
    links: [
      { name: "Market Insights", href: "#" },
      { name: "Business Trends", href: "#" },
    ],
  },
  {
    title: "Most Popular",
    links: [
      { name: "IT Solutions", href: "#" },
      { name: "Consulting Services", href: "#" },
      { name: "Property Management", href: "#" },
      { name: "Project Planning", href: "#" },
    ],
  },
  {
    title: "Tutorials",
    links: [
      { name: "All Tutorials", href: "#" },
      { name: "How-To Guides", href: "#" },
    ],
  },
  {
    title: "Information",
    links: [
      {
        name: "Definitions",
        href: "https://company.mktimothy.com/definitions.html",
        external: true,
      },
      {
        name: "Terms and Conditions",
        href: "https://company.mktimothy.com/terms.html",
        external: true,
      },
      {
        name: "Privacy Policy",
        href: "https://company.mktimothy.com/privacy.html",
        external: true,
      },
      {
        name: "Cookie Policy",
        href: "https://company.mktimothy.com/cookie-policy.html",
        external: true,
      },
      { name: "Partners", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      {
        name: "Contact Us",
        href: "https://contact.mktimothy.com/",
        external: true,
      },
      { name: "Partner's Portal", href: "/investors-login/", external: true },
      {
        name: "hi@mktimothy.com",
        href: "mailto:hi@mktimothy.com",
        external: true,
      },
      { name: "+256200902220", href: "tel:+256200902220", external: true },
    ],
  },
  {
    title: "Legal & Other Links",
    links: [
      { name: "About Us", href: "/about-us" },
      {
        name: "Cancellation & Refunds Policy",
        href: "https://company.mktimothy.com/terms.html",
        external: true,
      },
      {
        name: "Terms and Conditions",
        href: "https://company.mktimothy.com/terms.html",
        external: true,
      },
      {
        name: "Privacy Policy",
        href: "https://company.mktimothy.com/privacy.html",
        external: true,
      },
      { name: "Sitemap", href: "/sitemap" },
      { name: "Report Abuse", href: "/report" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed font-sans py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-100 mb-4">
            Sitemap
          </h1>
          <p className="text-lg text-gray-300">
            A complete overview of MK Timothy & Company's website pages and
            resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sitemapData.map((section, index) => (
            <div key={index} className="bg-textdark rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-6 pb-2 border-b border-gray-200">
                {section.title}
              </h2>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-gray-300 hover:text-greencolor hover:underline flex items-center transition-colors"
                      >
                        {link.name}
                        <svg
                          className="w-3 h-3 ml-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[15px] text-gray-300 hover:text-greencolor hover:underline flex items-center transition-colors"
                      >
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3"></span>
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
