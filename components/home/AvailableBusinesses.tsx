"use client";

import { fetchListings } from "@/lib/services/listing";
import Image from "next/image";
import { useEffect, useState } from "react";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"

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
}

export default function AvailableBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableBusinesses = async () => {
      try {
        const result = await fetchListings(
          {
            status: "PUBLISHED,SOLD,UNDER_OFFER",
            isActive: true,
          },
          1,
          8
        );

        if (result.success) {
          setBusinesses(result.data.listings);
        }
      } catch (error) {
        console.error("Error fetching available businesses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableBusinesses();
  }, []);

  if (isLoading) {
    return (
      <section className="mb-[80px]">
        <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[20px] md:mb-[30px]">
          Available Businesses
        </h2>
        <div className="flex gap-[20px] overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="h-[350px] rounded-[20px] bg-gray-700 animate-pulse flex-shrink-0 w-full max-w-[300px]"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-[80px]">
      <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[20px] md:mb-[30px]">
        Available Businesses
      </h2>
      <div className="flex gap-[20px] overflow-x-auto scrollbar-hide">
        {businesses.slice(0, 4).map((business) => (
          <div
            key={business.id}
            className="h-[350px] rounded-[20px] relative overflow-hidden flex-shrink-0 w-full max-w-[300px] cursor-pointer group transition-all duration-300"
            onClick={() => window.open(`/project/${business.id}`, "_blank")}
          >
            {business.images && business.images.length > 0 ? (
              <Image
                src={proxiedImageUrl(business.images[0])}
                alt={business.title}
                width={300}
                height={350}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <span className="text-gray-400 text-lg aabbss">
                  {business.title}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
            <div className="absolute bottom-[20px] left-[20px] right-[20px]">
              <div className="mb-2">
                <span className="bg-greencolor text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px]">
                  {business.category.name}
                </span>
              </div>
              <h3 className="text-white aabbss font-bold text-[16px] md:text-[18px] leading-[24px] mb-1 line-clamp-2">
                {business.title}
              </h3>
              {business.businessType && (
                <p className="text-gray-300 aabbss text-[12px] mb-1">
                  {business.businessType}
                </p>
              )}
              {(business.city || business.country) && (
                <p className="text-gray-400 aabbss text-[11px] mb-2">
                  {[business.city, business.country].filter(Boolean).join(", ")}
                </p>
              )}
              {business.price && (
                <p className="text-greencolor aabbss font-bold text-[14px]">
                  {business.currency} {business.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        ))}

        {businesses.length === 0 && !isLoading && (
          <div className="text-center py-10 w-full">
            <p className="text-gray-400 text-lg">
              No businesses available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
