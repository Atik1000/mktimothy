"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"

interface Sector {
  id: string;
  name: string;
  slug: string;
  image?: string;
  color?: string;
  icon?: string;
  _count?: {
    listings: number;
  };
}

export default function PopularSectors() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          "/api/sectors?includeListingCount=true"
        );
        const result = await response.json();

        if (result.success) {
          const sortedSectors = result.data
            .filter((sec: Sector) => sec._count && sec._count.listings > 0)
            .sort(
              (a: Sector, b: Sector) =>
                (b._count?.listings || 0) - (a._count?.listings || 0)
            )
            .slice(0, 6);
          setSectors(sortedSectors);
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectors();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (sectors.length === 0) return;

    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.9; // px per frame — adjust for faster/slower

    const scroll = () => {
      if (!isPausedRef.current && el) {
        el.scrollLeft += speed;
        // When we've scrolled half (the duplicated set), reset to 0
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [sectors]);

  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => { isPausedRef.current = false; };

  if (isLoading) {
    return (
      <section className="mb-[80px] overflow-hidden">
        <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[20px] md:mb-[30px]">
          Popular Sectors
        </h2>
        <div className="flex gap-[20px] overflow-x-auto scrollbar-hide">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="w-full max-w-[300px] md:max-w-[400px] flex-shrink-0 overflow-hidden animate-pulse"
            >
              <div className="h-[160px] rounded-t-[20px] bg-gray-700"></div>
              <div className="bg-bgdark py-5 rounded-b-[20px] px-[20px]">
                <div className="h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Duplicate sectors for seamless infinite loop
  const loopedSectors = [...sectors, ...sectors];

  return (
    <section className="mb-[80px] overflow-hidden">
      <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[20px] md:mb-[30px]">
        Popular Sectors
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-[20px] overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: "auto" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {loopedSectors.map((sector, i) => (
          <Link
            key={`${sector.id}-${i}`}
            href={`/all-listings?sector=${sector.id}`}
            className="w-full max-w-[300px] md:max-w-[400px] flex-shrink-0 overflow-hidden group transition-all duration-300 cursor-pointer"
          >
            <div className="h-[160px] rounded-t-[20px] overflow-hidden relative">
              {sector.image || sector.icon ? (
                <Image
                  src={proxiedImageUrl(sector.image || sector.icon)}
                  alt={sector.name}
                  width={350}
                  height={160}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center bg-gray-800"
                >
                  <span className="text-white aabbss font-bold text-[24px] md:text-[32px]">
                    {sector.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs">
                {sector._count?.listings || 0} listings
              </div>
            </div>
            <div className="bg-bgdark py-5 rounded-b-[20px]">
              <span className=" px-[20px] text-white aabbss font-bold text-[14px] md:text-[20px]">
                {sector.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
