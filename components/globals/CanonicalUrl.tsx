"use client";

import { usePathname } from "next/navigation";

export default function CanonicalUrl() {
  const pathname = usePathname();
  // Ensure we don't have double slashes if pathname is just "/"
  const url = `https://www.mktimothy.com${pathname === "/" ? "" : pathname}`;

  return <link rel="canonical" href={url} />;
}
