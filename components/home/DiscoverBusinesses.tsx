"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"

interface BusinessListing {
  id: string;
  title: string;
  description: string;
  businessName?: string;
  businessType?: string;
  images: string[];
  price?: number;
  priceType?: string;
  currency: string;
  city?: string;
  state?: string;
  country?: string;
  isFeatured: boolean;
  likeCount: number;
  viewCount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  _count: {
    likes: number;
    reviews: number;
    savedBy: number;
  };
}

export default function DiscoverBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<
    BusinessListing[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        // Fetch latest businesses
        const [latestResponse, featuredResponse] = await Promise.all([
          fetch(
            "/api/listings?status=PUBLISHED,SOLD,UNDER_OFFER&isActive=true&sortBy=createdAt&sortOrder=desc&limit=6"
          ),
          fetch(
            "/api/listings?status=PUBLISHED,SOLD,UNDER_OFFER&isActive=true&isFeatured=true&limit=4"
          ),
        ]);

        const [latestResult, featuredResult] = await Promise.all([
          latestResponse.json(),
          featuredResponse.json(),
        ]);

        if (latestResult.success) {
          setBusinesses(latestResult.data.listings);
        }

        if (featuredResult.success) {
          setFeaturedBusinesses(featuredResult.data.listings);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const formatPrice = (price: number, currency: string, priceType?: string) => {
    const formatted = `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return priceType ? `${formatted} / ${priceType}` : formatted;
  };

  const getLocationString = (
    city?: string,
    state?: string,
    country?: string
  ) => {
    return [city, state, country].filter(Boolean).join(", ");
  };

  if (isLoading) {
    return (
      <section className="mb-[80px] overflow-hidde">
        <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[15px]">
          Discover latest Businesses
        </h2>
       

        <div className="flex gap-[20px] overflow-x-auto scrollbar-hide mb-[50px]">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-[10px] overflow-hidden flex-shrink-0 w-full max-w-[300px] md:max-w-[400px] animate-pulse"
            >
              <div className="h-[250px] bg-gray-700 rounded"></div>
              <div className="pt-4 space-y-[8px]">
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="h-6 bg-gray-600 rounded w-full"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                <div className="h-5 bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="flex gap-[30px] overflow-x-auto scrollbar-hide">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="rounded-[20px] overflow-hidden flex-shrink-0 w-full max-w-[400px] md:max-w-[600px] animate-pulse"
            >
              <div className="h-[320px] bg-gray-700 rounded-[20px]"></div>
              <div className="pt-4">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-[10px]"></div>
                <div className="h-6 bg-gray-600 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div> */}
      </section>
    );
  }

  return (
    <section className="mb-[80px] overflow-hidden ">
      <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[15px]">
        Discover latest Businesses
      </h2>
     

      {/* Latest Businesses */}
      <div className="flex gap-[20px] overflow-x-auto scrollbar-hide mb-[50px]">
        {businesses.slice(0, 6).map((business) => (
          <Link
            key={business.id}
            href={`/project/${business.id}`}
            className="rounded-[10px] overflow-hidden flex-shrink-0 w-full max-w-[250px] xs:max-w-[300px] md:max-w-[400px] group transition-all duration-300 cursor-pointer"
          >
            <div className="h-[200px] xs:h-[250px] relative">
              {business.images && business.images.length > 0 ? (
                <Image
                  src={proxiedImageUrl(business.images[0])}
                  alt={business.title}
                  width={350}
                  height={250}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white aabbss text-lg">No Image</span>
                </div>
              )}
              {business.isFeatured && (
                <div className="absolute top-3 left-3 bg-greencolor text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px]">
                  FEATURED
                </div>
              )}
            </div>
            <div className="pt-4 space-y-[8px]">
              <div className="xsm:flex xsm:flex-row flex-col xsm:items-center gap-2 overflow-hidden">
                <div className="bg-greencolor text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px] w-fit">
                  {business.category.name}
                </div>
                <p className="text-white aabbss text-[12px] ">
                  ({business._count.reviews} Reviews)
                </p>
              </div>

              <h3 className="text-white aabbss font-semibold text-sm xs:text-[16px] md:text-[18px] uppercase line-clamp-2">
                {business.title}
              </h3>
              <p className="text-white aabbss text-[12px]">
                {getLocationString(
                  business.city,
                  business.state,
                  business.country
                ) || "Location not specified"}
              </p>
              {business.price && (
                <p className="text-white aabbss font-bold text-[16px] md:text-[18px]">
                  {formatPrice(
                    business.price,
                    business.currency,
                    business.priceType
                  )}
                </p>
              )}
              <div className="text-white aabbss text-[10px] space-y-1">
                <p>
                  {business._count.likes} likes • {business.viewCount} views
                </p>
                {business.businessType && (
                  <p className="text-gray-300">Type: {business.businessType}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Businesses */}
      {/* {featuredBusinesses.length > 0 && (
        <div className="flex gap-[30px] overflow-x-auto scrollbar-hide">
          {featuredBusinesses.slice(0, 2).map((business) => (
            <Link
              key={business.id}
              href={`/project/${business.id}`}
              className="overflow-hidden flex-shrink-0 w-full max-w-[400px] md:max-w-[600px] hover:transform transition-all duration-300 cursor-pointer"
            >
              {business.images && business.images.length > 0 ? (
                <Image
                  src={proxiedImageUrl(business.images[0])}
                  alt={business.title}
                  width={600}
                  height={320}
                  className="h-[320px] rounded-[20px] w-full object-cover"
                />
              ) : (
                <div className="h-[320px] rounded-[20px] w-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white aabbss text-xl">No Image</span>
                </div>
              )}

              <div className="pt-4">
                <p className="text-white aabbss font-bold text-[14px] leading-[19px] uppercase mb-[10px]">
                  {business.title}
                </p>
                <h3 className="text-white aabbss font-semibold text-[20px] leading-[27px] uppercase">
                  {business.description.substring(0, 50)}...
                </h3>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-gray-300">
                  <span>{business._count.likes} likes</span>
                  <span>{business.viewCount} views</span>
                  <span>{business.category.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )} */}
    </section>
  );
}
