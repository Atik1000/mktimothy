"use client";
import Button from "@/components/globals/Button";
import ListingNavTabs from "@/components/listings/ListingNavTabs";
import { FullPageLoader } from "@/components/ui/Loader";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import Image from "next/image";
import Link from "next/link";
import { getTotalStat } from "@/lib/utils/mock-stats";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

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

interface Sector {
  id: string;
  name: string;
  slug: string;
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

export default function BankableProjectsPage() {
  return (
    <Suspense
      fallback={<FullPageLoader message="Loading bankable projects..." />}
    >
      <BankableProjectsContent />
    </Suspense>
  );
}

function BankableProjectsContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>(
    searchParams.get("sector") || "",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<Record<string, string>>({});

  const filterConfigs = [
    {
      name: "projectType",
      label: "Project Type",
      type: "select",
      options: ["Greenfield", "Brownfield", "Expansion", "Turnaround Project"],
    },
    {
      name: "investmentType",
      label: "Investment Type",
      type: "select",
      options: [
        "Joint Venture",
        "Public Private Partnership (PPP)",
        "Private Investment",
        "Government Partnership",
        "Consortium Investment",
      ],
    },
    {
      name: "proposedInvestment",
      label: "Proposed Investment",
      type: "select",
      options: [
        "Under $1 Million",
        "$1M - $10M",
        "$10M - $50M",
        "$50M - $100M",
        "$100M - $500M",
        "$500M - $1 Billion",
        "Above $1 Billion",
      ],
    },
    {
      name: "financingType",
      label: "Financing Type",
      type: "select",
      options: [
        "Equity Financing",
        "Debt Financing",
        "Mixed Financing (Debt + Equity)",
        "Project Finance",
        "Grant + Investment Blend",
        "Strategic Investor Funding",
      ],
    },
    {
      name: "sector",
      label: "Sector",
      type: "select",
      options: [
        "Agriculture",
        "Mining",
        "Real Estate",
        "Energy (Renewable & Non-renewable)",
        "Manufacturing",
        "Tourism & Hospitality",
        "Healthcare",
        "Education",
        "Technology & Startups",
        "Transport & Logistics",
        "Infrastructure",
        "Financial Services",
      ],
    },
    {
      name: "projectStatus",
      label: "Project Status",
      type: "select",
      options: [
        "Idea Stage",
        "Concept Stage",
        "Pre-Feasibility",
        "Feasibility Completed",
        "Financial Close Ready",
        "Construction Stage",
        "Operational",
      ],
    },
  ];

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [selectedSector]);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedSector, searchTerm, filters]);

  const fetchSectors = async () => {
    try {
      const response = await fetch("/api/sectors");
      const result = await response.json();
      if (result.success) {
        setSectors(result.data);
      }
    } catch (error) {
      console.error("Error fetching sectors:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const params = new URLSearchParams();
      params.append("includeListingCount", "true");
      if (selectedSector) {
        params.append("sectorId", selectedSector);
      }
      const response = await fetch(`/api/categories?${params}`);
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: "PUBLISHED,SOLD,UNDER_OFFER",
        isActive: "true",
        limit: "12",
        moduleType: "Bankable Project",
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedSector && { sectorId: selectedSector }),
        ...(searchTerm && { search: searchTerm }),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/listings?${params}`);
      const result = await response.json();

      if (result.success) {
        setListings(result.data.listings);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationString = (
    city?: string,
    state?: string,
    country?: string,
  ) => {
    return [city, state, country].filter(Boolean).join(", ");
  };

  const formatPrice = (price: number, currency: string, priceType?: string) => {
    const formatted = `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return priceType ? `${formatted} / ${priceType}` : formatted;
  };

  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;
    return (
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="bg-bglight pt-[150px] pb-[100px]">
        <div className="width">
          <div className="grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[40px]">
            <div className="xs:col-span-2">
              <div className="h-8 bg-gray-700 rounded mb-4 w-24"></div>
              <div className="h-12 bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="h-20 bg-gray-700 rounded w-full"></div>
            </div>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="h-[281px] bg-gray-700 rounded-[10px]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[150px] pb-[100px] relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat -z-30" />
      <div className="absolute inset-0 bg-black/50 -z-20" />
      <div className="width">
        <ListingNavTabs />
        <div className="grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[40px] mb-[60px]">
          <div className="xs:col-span-2 mb-[30px] z-40">
            <Button text="Explore" className="mb-[15px]" />
            <h1 className="text-white aabbss font-bold text-[32px] leading-[44px] mb-[15px] max-w-[500px]">
              Bankable Projects
            </h1>
            <p className="text-white aabbss text-[20px] leading-[27px] max-w-[572px] mb-[20px]">
              Discover premium, fully-vetted bankable projects ready for
              investment and financing.
            </p>

            <div className="flex flex-wrap gap-[15px] max-w-[800px] mb-[20px]">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-bgdark text-white border border-gray-600 focus:border-greencolor focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-[15px] max-w-[800px]">
              {filterConfigs.map((config) =>
                config.type === "select" ? (
                  <select
                    key={config.name}
                    value={filters[config.name] || ""}
                    onChange={(e) =>
                      handleFilterChange(config.name, e.target.value)
                    }
                    className="w-full sm:w-[200px] px-4 py-3 rounded-lg bg-bgdark text-white border border-gray-600 focus:border-greencolor focus:outline-none cursor-pointer"
                  >
                    <option value="">{config.label}</option>
                    {config.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    key={config.name}
                    type={config.type}
                    placeholder={config.label}
                    value={filters[config.name] || ""}
                    onChange={(e) =>
                      handleFilterChange(config.name, e.target.value)
                    }
                    className="w-full sm:w-[200px] px-4 py-3 rounded-lg bg-bgdark text-white border border-gray-600 focus:border-greencolor focus:outline-none"
                  />
                ),
              )}
            </div>
          </div>

          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/single-category/${category.slug}`}
              className="relative w-full sm:max-w-[280px] group cursor-pointer mx-auto block"
            >
              <div
                className={`w-full sm:max-w-[280px] h-[250px] sm:h-[281px] rounded-[10px] relative overflow-hidden border-2 transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "border-greencolor"
                    : "border-transparent"
                }`}
              >
                {category.image || category.icon ? (
                  <Image
                    src={proxiedImageUrl(
                      category.image ||
                        category.icon ||
                        "/images/default-category.png",
                    )}
                    alt={category.name}
                    width={280}
                    height={281}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: category.color || "#1f2937" }}
                  >
                    <span className="text-white aabbss font-bold text-[32px]">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-x-0 bottom-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
                  <h3 className="text-white aabbss font-bold text-[18px] sm:text-[24px] leading-tight drop-shadow-md">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-200 aabbss text-[13px] sm:text-[14px] mt-1.5 line-clamp-2 drop-shadow-md">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-greencolor text-white px-2 py-1 rounded text-xs shadow-md">
                  {category._count?.listings || 0} listings
                </div>
              </div>
            </Link>
          ))}

          {(!searchTerm || filteredCategories.length > 0) && (
            <Link
              href="/single-category/all"
              className="relative group cursor-pointer mx-auto w-full sm:max-w-[280px]"
              onClick={() => setSelectedCategory("")}
            >
              <div
                className={`w-full sm:max-w-[280px] h-[250px] sm:h-[281px] rounded-[10px] bg-greencolor flex flex-col justify-between relative p-5 border-2 transition-all duration-300 ${
                  selectedCategory === ""
                    ? "border-white"
                    : "border-transparent"
                }`}
              >
                <FaChevronDown className="text-white text-[24px] leading-[33px]" />
                <div>
                  <h3 className="text-white aabbss font-extrabold text-[24px] leading-[33px] tracking-[0.05em]">
                    Show all
                    <br />
                    Categories
                  </h3>
                </div>
              </div>
            </Link>
          )}

          {searchTerm && filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-400 text-lg mb-4">
                No categories found matching "{searchTerm}".
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-greencolor text-white rounded-lg hover:bg-greencolor/90 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="mb-[40px]">
          <h2 className="text-white aabbss font-bold text-[28px] mb-[20px]">
            {selectedCategory
              ? `${categories.find((cat) => cat.id === selectedCategory)?.name} Projects`
              : "All Projects"}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px]">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-[200px] bg-gray-700 rounded-[10px] mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px]">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/project/${listing.id}`}
                  className="bg-bgdark rounded-[10px] overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
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
                    <div className="flex items-center gap-2 mb-[8px]">
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
                        {getLocationString(
                          listing.city,
                          listing.state,
                          listing.country,
                        )}
                      </p>
                    )}
                    {listing.price && (
                      <p className="text-greencolor aabbss font-bold text-[14px]">
                        {formatPrice(
                          listing.price,
                          listing.currency,
                          listing.priceType,
                        )}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-[10px] text-[11px] text-gray-500">
                      <span>{getTotalStat(listing.id, listing._count?.likes, 'likes')} likes</span>
                      <span>{getTotalStat(listing.id, listing._count?.reviews, 'reviews')} reviews</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg mb-4">
                No projects found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setFilters({});
                  setSearchTerm("");
                }}
                className="px-6 py-3 bg-greencolor text-white rounded-lg hover:bg-greencolor/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

