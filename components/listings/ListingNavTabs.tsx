"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListingNavTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "All Listings", href: "/all-listings" },
    { name: "Businesses for Sale", href: "/businesses-for-sale" },
    { name: "Investment Projects", href: "/investment-projects" },
    { name: "Joint Ventures", href: "/joint-ventures" },
    { name: "Bankable Projects", href: "/bankable-projects" },
  ];

  return (
    <div className="flex overflow-x-auto thin-green-scrollbar gap-3 mb-[30px] p-2 rounded-xl bg-bgdark border border-gray-700 w-full md:w-fit z-40 relative">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              isActive
                ? "bg-greencolor text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
