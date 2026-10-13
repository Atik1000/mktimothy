"use client";

import { fetchListings } from "@/lib/services/listing";
import Image from "next/image";
import { useEffect, useState } from "react";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { getTotalStat } from "@/lib/utils/mock-stats";

interface BusinessData {
  id: string;
  title: string;
  businessName?: string;
  businessType?: string;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  city?: string;
  country?: string;
  price?: number;
  currency: string;
  priceType?: string;
  viewCount: number;
  likeCount: number;
  _count: {
    likes: number;
    reviews: number;
    savedBy: number;
  };
}

export default function PopularBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularBusinesses = async () => {
      try {
        const result = await fetchListings(
          {
            status: "PUBLISHED,SOLD,UNDER_OFFER",
            isActive: true,
            sortBy: "viewCount",
            sortOrder: "desc",
          },
          1,
          6,
        );

        if (result.success) {
          setBusinesses(result.data.listings);
        }
      } catch (error) {
        console.error("Error fetching popular businesses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularBusinesses();
  }, []);

  if (isLoading) {
    return (
      <section className="mb-[80px]">
        <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[15px]">
          Popular Businesses
        </h2>

        <div className="flex gap-[20px] overflow-x-auto scrollbar-hide mb-[50px]">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-[10px] overflow-hidden flex-shrink-0 w-full max-w-[400px]"
            >
              <div className="h-[250px] bg-gray-700 animate-pulse" />
              <div className="pt-4 space-y-[8px]">
                <div className="h-4 bg-gray-700 rounded animate-pulse" />
                <div className="h-6 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-[80px]">
      <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[15px]">
        Popular Businesses
      </h2>

      <div className="flex gap-[20px] overflow-x-auto scrollbar-hide mb-[50px]">
        {businesses.slice(0, 3).map((business) => (
          <div
            key={business.id}
            className="rounded-[10px] overflow-hidden flex-shrink-0 w-full max-w-[400px] cursor-pointer group transition-all duration-300"
            onClick={() => window.open(`/project/${business.id}`, "_blank")}
          >
            <div className="h-[250px] relative">
              {business.images && business.images.length > 0 ? (
                <Image
                  src={proxiedImageUrl(business.images[0])}
                  alt={business.title}
                  width={400}
                  height={250}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="text-gray-400 text-lg aabbss">
                    {business.title}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-[8px] bg-white">
              <h3 className="text-black aabbss font-semibold text-[20px] leading-[27px] uppercase line-clamp-2">
                {business.title}
                <p className="text-black aabbss text-[14px] col-span-5">
                  {business.category.name}
                </p>
              </h3>
              <p className="text-black aabbss text-[12px] leading-[16px]">
                {[business.city, business.country].filter(Boolean).join(", ") ||
                  "Location not specified"}
              </p>
              {business.price && (
                <>
                  <p className="text-black aabbss font-bold text-[20px] leading-[27px]">
                    {business.currency} {business.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {business.priceType && ` / ${business.priceType}`}
                  </p>
                  <p className="text-black aabbss text-[12px] leading-[16px]">
                    Starting price
                    <br />
                    {business.currency} {Math.floor(business.price * 0.8).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per{" "}
                    {business.priceType || "service"}
                    <br />
                    includes taxes & fees
                  </p>
                </>
              )}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2">
                <span>{getTotalStat(business.id, business._count?.likes, 'likes')} likes</span>
                <span>{getTotalStat(business.id, business.viewCount, 'views')} views</span>
              </div>
            </div>
          </div>
        ))}

        {businesses.length === 0 && !isLoading && (
          <div className="text-center py-10 w-full">
            <p className="text-gray-400 text-lg">
              No popular businesses available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
