"use client";

import CategoryHeader from "@/components/singlecategory/CategoryHeader";
import SearchFilters from "@/components/singlecategory/SearchFilters";
import SortSection from "@/components/singlecategory/SortSection";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaTh } from "react-icons/fa";
import { FaClock, FaHeart } from "react-icons/fa6";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"
import { Calendar, LayoutGrid, ArrowRight } from "lucide-react";


interface PageProps {
  params: {
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  _count?: {
    listings: number;
  };
}

interface Listing {
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
  status?: string;
  createdAt: string;
  rating?: number;
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

export default function SingleCategoryPage({ params }: PageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [industry, setIndustry] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [businessType, setBusinessType] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data only once on page load
  useEffect(() => {
    fetchCategoryAndAllListings();
  }, [params.slug]);

  const fetchCategoryAndAllListings = async () => {
    setIsLoading(true);
    try {
      let categoryId = null;

      // Handle "all" case - show all listings
      if (params.slug === "all") {
        setCategory({
          id: "all",
          name: "All Categories",
          slug: "all",
          description: "Browse all available listings across all categories",
        });
      } else {
        // Fetch category details using slug
        const categoryResponse = await fetch(`/api/categories/${params.slug}`);
        const categoryResult = await categoryResponse.json();

        if (categoryResult.success) {
          setCategory(categoryResult.data);
          categoryId = categoryResult.data.id;
        }
      }

      // Fetch ALL listings for this category (no filters, higher limit)
      const listingsParams = new URLSearchParams({
        status: "PUBLISHED",
        isActive: "true",
        limit: "1000", // Get more listings for client-side filtering
        ...(categoryId && { categoryId: categoryId }),
      });

      const listingsResponse = await fetch(`/api/listings?${listingsParams}`);
      const listingsResult = await listingsResponse.json();

      console.log(
        "Single-category API call:",
        `/api/listings?${listingsParams}`
      );
      console.log("Single-category API response:", listingsResult);

      if (listingsResult.success) {
        setAllListings(listingsResult.data.listings);
        console.log(
          "All listings loaded:",
          listingsResult.data.listings.length,
          "items"
        );
      } else {
        console.error("Failed to fetch listings:", listingsResult);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering using useMemo
  const filteredListings = useMemo(() => {
    let filtered = [...allListings];

    // Search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower) ||
          listing.businessName?.toLowerCase().includes(searchLower) ||
          listing.city?.toLowerCase().includes(searchLower) ||
          listing.state?.toLowerCase().includes(searchLower) ||
          listing.country?.toLowerCase().includes(searchLower)
      );
    }

    // Country filter
    if (country.trim()) {
      filtered = filtered.filter((listing) =>
        listing.country?.toLowerCase().includes(country.toLowerCase())
      );
    }

    // State filter
    if (state.trim()) {
      filtered = filtered.filter((listing) =>
        listing.state?.toLowerCase().includes(state.toLowerCase())
      );
    }

    // Industry filter
    if (industry.trim()) {
      filtered = filtered.filter((listing) =>
        listing.sector?.name.toLowerCase().includes(industry.toLowerCase())
      );
    }

    // Business type filter (if different from industry)
    if (businessType.trim()) {
      filtered = filtered.filter((listing) =>
        listing.businessType?.toLowerCase().includes(businessType.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter((listing) => {
      if (listing.price === undefined || listing.price === null) return true;
      const meetsMin = minPrice === "" ? true : listing.price >= minPrice;
      const meetsMax = maxPrice === "" ? true : listing.price <= maxPrice;
      return meetsMin && meetsMax;
    });

    // Featured filter
    if (isFeatured) {
      filtered = filtered.filter((listing) => listing.isFeatured === true);
    }

    return filtered;
  }, [
    allListings,
    searchTerm,
    country,
    state,
    industry,
    businessType,
    minPrice,
    maxPrice,
    isFeatured,
  ]);

  const handleSearch = () => {
    // No need to do anything - filtering happens automatically via useMemo
    console.log("Search executed with filters:", {
      searchTerm,
      country,
      state,
      industry,
      resultsCount: filteredListings.length,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCountry("");
    setState("");
    setIndustry("");
    setMinPrice("");
    setMaxPrice("");
    setBusinessType("");
    setIsFeatured(false);
  };

  if (isLoading) {
    return (
      <div className="bg-bglight min-h-screen">
        <div className="width pt-[150px] pb-[100px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
            <div className="h-20 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div
                  key={index}
                  className="h-[300px] bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bglight min-h-screen">
      <div className="">
        <div className="bg-bgdark pb-3">
          <CategoryHeader
            title={category?.name || "Category"}
            description={
              category?.description ||
              "Explore businesses in this category and find the perfect service or product that meets your needs."
            }
          />
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            country={country}
            setCountry={setCountry}
            state={state}
            setState={setState}
            industry={industry}
            setIndustry={setIndustry}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            businessType={businessType}
            setBusinessType={setBusinessType}
            isFeatured={isFeatured}
            setIsFeatured={setIsFeatured}
            onSearch={handleSearch}
            onReset={handleResetFilters}
          />
        </div>

        <div className="width py-10">
          <SortSection />
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1  gap-[20px]">
              {filteredListings.map((listing) => (
                <div key={listing.id}>
                  <div className="w-full bg-[#18181b] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-5 sm:gap-6 shadow-2xl shadow-black/40 group hover:border-white/10 transition-colors duration-300">
                    
                    {/* Fixed aspect ratio container for the image with a subtle inner shadow */}
                    <div className="relative w-full sm:w-56 aspect-[4/3] sm:aspect-square shrink-0 bg-zinc-800 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow">
                      {listing.images && listing.images[0] ? (
                        <img 
                          src={proxiedImageUrl(listing.images[0])} 
                          alt={listing.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">No Image</div>
                      )}
                      {/* Subtle gradient overlay to ensure image doesn't look flat */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {listing.isFeatured && (
                        <div className="absolute top-2 left-2 bg-amber-500/90 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-sm z-10">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col py-1">
                      
                      {/* Header Row: Title & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-2">
                        <div>
                          <h2 className="text-xl font-semibold text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                            {listing.title}
                          </h2>
                          <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                            {listing.city}, {listing.state}, {listing.country}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
                            listing.status === "PUBLISHED"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : listing.status === "SOLD" || listing.status === "UNDER_OFFER"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : listing.status === "DRAFT"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {listing.status === "PUBLISHED" ? "ACTIVE" : (listing.status || "ACTIVE").replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-px bg-white/5 my-4 sm:my-auto" />

                      {/* Description */}
                      <p className="text-lg text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                        {listing.description}
                      </p>

                      {/* Clean, icon-driven metadata replacing the heavy green blocks */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5 mt-auto">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar size={16} className="text-zinc-500" />
                          <span className="text-sm font-medium">{new Date(listing.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Category */}
                        <div className="flex items-center gap-2 text-zinc-400">
                          <LayoutGrid size={16} className="text-zinc-500" />
                          <span className="text-sm font-medium truncate max-w-[200px]" title={listing.category?.name}>
                            {listing.category?.name || "Category"}
                          </span>
                        </div>

                        {/* Likes */}
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <FaHeart className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-sm font-medium tracking-wide">{listing._count?.likes || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        {/* Primary Action (View) */}
                        <Link 
                          href={`/project/${listing.id}`}
                          className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 py-2 px-5 rounded-lg text-sm font-semibold transition-all active:scale-95 flex-1 sm:flex-none"
                        >
                          <span>View Details</span>
                          <ArrowRight size={16} className="text-zinc-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">
                No listings found matching your search criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-greencolor hover:text-greencolor/80 transition-colors underline"
              >
                Reset filters to see all listings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
