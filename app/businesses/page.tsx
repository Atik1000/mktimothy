"use client";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

import AvailableBusinesses from "@/components/home/AvailableBusinesses";
import DiscoverBusinesses from "@/components/home/DiscoverBusinesses";
import FinalTextSections from "@/components/home/FinalTextSections";
import HeroSection from "@/components/home/HeroSection";
import PopularBusinesses from "@/components/home/PopularBusinesses";
import PopularSectors from "@/components/home/PopularSectors";
import PrivateStays from "@/components/home/PrivateStays";
import Link from "next/link";
import { getTotalStat } from "@/lib/utils/mock-stats";
import Sidebar from "@/components/home/Sidebar";
import SignInBox from "@/components/home/SignInBox";
import { SectionLoader } from "@/components/ui/Loader";
import { fetchListings } from "@/lib/services/listing";
import { useEffect, useState } from "react";

interface ListingData {
  id: string;
  title: string;
  description: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  images: string[];
  price?: number;
  priceType?: string;
  currency: string;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    phone?: string;
    location?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  sector?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  _count: {
    likes: number;
    reviews: number;
    savedBy: number;
  };
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filteredListings, setFilteredListings] = useState<ListingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Function to update sidebar state based on screen width
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Run on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [selectedFilters, setSelectedFilters] = useState({
    search: "",
    categoryId: "",
    minPrice: 0,
    maxPrice: 10000,
    location: "",
    businessType: "",
    isFeatured: false,
    moduleType: "",
  });

  // Apply filters function
  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        status: "PUBLISHED,SOLD,UNDER_OFFER",
        isActive: true,
        approvalStatus: "APPROVED", // Only show approved listings on public pages
      };

      if (selectedFilters.search) {
        filters.search = selectedFilters.search;
      }
      if (selectedFilters.categoryId) {
        filters.categoryId = selectedFilters.categoryId;
      }
      if (selectedFilters.minPrice > 0) {
        filters.minPrice = selectedFilters.minPrice;
      }
      if (selectedFilters.maxPrice < 10000) {
        filters.maxPrice = selectedFilters.maxPrice;
      }
      if (selectedFilters.location) {
        filters.country = selectedFilters.location;
      }
      if (selectedFilters.businessType) {
        filters.businessType = selectedFilters.businessType;
      }
      if (selectedFilters.isFeatured) {
        filters.isFeatured = true;
      }
      if (selectedFilters.moduleType) {
        filters.moduleType = selectedFilters.moduleType;
      }

      const result = await fetchListings(filters, 1, 20);
      if (result.success) {
        setFilteredListings(result.data.listings);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleApplyFilters();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [selectedFilters]);

  return (
    <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Area */}
      <div className="width flex md:gap-[40px] relative z-10 ">
        {/* Left Sidebar */}
        <div
          className={`w-[230px] lg:w-[260px] flex-shrink-0 absolute md:relative left-0 top-0 ${
            isSidebarOpen ? "left-0" : "left-[-230px] "
          } transition-all duration-300 ease-in-out overflow-hidden z-10 min-h-screen h-full`}
        >
          <Sidebar
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            onApplyFilters={handleApplyFilters}
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0 py-[50px]">
          <div className="flex justify-end mb-8 w-full md:hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex flex-col gap-2 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              <div className="w-7 h-1 rounded-full bg-white" />
              <div className="w-7 h-1 rounded-full bg-white" />
            </button>
          </div>

          <SignInBox />
          <div className="z-40 overflow-x-auto max-w-full thin-green-scrollbar pb-3 mb-8">
            <div className="flex gap-3 p-2 rounded-xl bg-bgdark border border-gray-700 w-fit">
              {[
                { label: "All Listings", value: "" },
                { label: "Businesses for Sale", value: "Business for Sale" },
                { label: "Investment Projects", value: "Investment Project" },
                { label: "Joint Ventures", value: "Joint Venture" },
                { label: "Bankable Projects", value: "Bankable Project" },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      moduleType: tab.value,
                    }))
                  }
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    selectedFilters.moduleType === tab.value
                      ? "bg-greencolor text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <PopularSectors />

          {/* Filtered Results Section */}
          {(selectedFilters.search ||
            selectedFilters.categoryId ||
            selectedFilters.location ||
            selectedFilters.businessType ||
            selectedFilters.isFeatured ||
            selectedFilters.moduleType ||
            selectedFilters.minPrice > 0 ||
            selectedFilters.maxPrice < 10000) && (
            <section className="mb-[80px]">
              <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[20px] md:mb-[30px]">
                Filtered Results
              </h2>
              {isLoading ? (
                <SectionLoader
                  height="h-24"
                  message="Loading filtered results..."
                />
              ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-bgdark rounded-[10px] overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() =>
                        window.open(`/project/${listing.id}`, "_blank")
                      }
                    >
                      {listing.images && listing.images.length > 0 && (
                        <div className="h-[200px] relative">
                          <img
                            src={proxiedImageUrl(listing.images[0])}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                          {listing.isFeatured && (
                            <div className="absolute top-[10px] left-[10px] bg-greencolor text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px]">
                              FEATURED
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-[15px]">
                        <div className="flex flex-wrap items-center gap-2 mb-[8px]">
                          {listing.sector && (
                            <div className="bg-gray-700 text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px]">
                              {listing.sector.name}
                            </div>
                          )}
                          <div className="bg-greencolor text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px]">
                            {listing.category.name}
                          </div>
                          {listing.businessType && (
                            <div className="bg-gray-600 text-white aabbss font-bold text-[10px] px-[8px] py-[4px] rounded-[4px]">
                              {listing.businessType}
                            </div>
                          )}
                        </div>
                        <h3 className="text-white aabbss font-semibold text-[16px] leading-[22px] mb-[8px] line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-gray-400 aabbss text-[12px] leading-[16px] mb-[8px] line-clamp-2">
                          {listing.description}
                        </p>
                        {(listing.city || listing.country) && (
                          <p className="text-gray-500 aabbss text-[11px] mb-[8px]">
                            {[listing.city, listing.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        {listing.price && (
                          <p className="text-greencolor aabbss font-bold text-[14px]">
                            {listing.currency} {listing.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {listing.priceType && ` / ${listing.priceType}`}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-[10px] text-[11px] text-gray-500">
                          <span>{getTotalStat(listing.id, listing._count?.likes, 'likes')} likes</span>
                          <span>{getTotalStat(listing.id, listing.viewCount, 'views')} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-lg mb-4">
                    No businesses found matching your filters.
                  </p>
                  <button
                    onClick={() =>
                      setSelectedFilters({
                        search: "",
                        categoryId: "",
                        minPrice: 0,
                        maxPrice: 10000,
                        location: "",
                        businessType: "",
                        isFeatured: false,
                        moduleType: "",
                      })
                    }
                    className="text-greencolor hover:text-greencolor/80 transition-colors underline"
                  >
                    Reset filters to see all businesses
                  </button>
                </div>
              )}
            </section>
          )}

          <AvailableBusinesses />
          <DiscoverBusinesses />
          <PopularBusinesses />
          <PrivateStays />
          <FinalTextSections />
        </div>
      </div>
    </div>
  );
}

