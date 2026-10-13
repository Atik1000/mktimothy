import { FaChevronUp, FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  minPrice?: number | "";
  setMinPrice?: (value: number | "") => void;
  maxPrice?: number | "";
  setMaxPrice?: (value: number | "") => void;
  businessType?: string;
  setBusinessType?: (value: string) => void;
  isFeatured?: boolean;
  setIsFeatured?: (value: boolean) => void;
  onSearch?: () => void;
  onReset?: () => void;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  country,
  setCountry,
  state,
  setState,
  industry,
  setIndustry,
  minPrice = "",
  setMinPrice,
  maxPrice = "",
  setMaxPrice,
  businessType = "",
  setBusinessType,
  isFeatured = false,
  setIsFeatured,
  onSearch,
  onReset,
}: SearchFiltersProps) => {
  const businessTypes = [
    "Small Business",
    "Medium Business",
    "Large Enterprise",
    "Startup",
    "Non-Profit",
    "Franchise",
    "E-commerce",
    "Service Provider",
    "Manufacturer",
    "Retailer",
    "Consulting",
    "Freelancer",
    "Partnership",
    "Corporation",
    "LLC",
    "Sole Proprietorship",
  ];

  const locations = [
    "Central Region",
    "Eastern Region",
    "Northern Region",
    "Western Region",
  ];

  const [dynamicIndustries, setDynamicIndustries] = useState<{name: string, slug: string}[]>([]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch('/api/sectors');
        const result = await response.json();
        if (result.success) {
          setDynamicIndustries(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch sectors:", error);
      }
    };
    fetchSectors();
  }, []);

  const states = [
    "Kampala",
    "Entebbe",
    "Jinja",
    "Mbarara",
    "Gulu",
    "Lira",
    "Mbale",
    "Fort Portal",
    "Masaka",
    "Soroti",
    "Hoima",
    "Arua",
    "Wakiso",
    "Mukono",
    "Kasese",
    "Kabale",
    "Iganga",
    "Tororo",
    "Moroto",
    "Lugazi",
  ];

  return (
    <div className="mb-5 md:mb-[40px] width">
      {/* Filter Row 1 */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-[20px] mb-[20px]">
        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            placeholder="Keyword, city, listing ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] pl-4 md:pl-[20px] pr-[20px] text-white aabbss font-light text-[14px] md:text-[16px] placeholder-white/70"
          />
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            Search
          </span>
        </div>

        {/* Location Field */}
        <div className="relative">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] px-[20px] text-white aabbss font-light text-[14px] md:text-[16px] appearance-none cursor-pointer"
          >
            <option value="" className="bg-bgdark">
              All Regions
            </option>
            {locations.map((location) => (
              <option
                key={location}
                value={location.toLowerCase().replace(/\s+/g, "-")}
                className="bg-bgdark"
              >
                {location}
              </option>
            ))}
          </select>
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            Region
          </span>
          <FaChevronUp className="absolute rotate-180 right-[20px] top-1/2 transform -translate-y-1/2 text-white w-[16px] h-[16px] xsm:w-[20px] xsm:h-[20px] pointer-events-none" />
        </div>

        {/* Business Type Field */}
        <div className="relative">
          <select
            value={businessType}
            onChange={(e) => setBusinessType && setBusinessType(e.target.value)}
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] px-[20px] text-white aabbss font-light text-[14px] md:text-[16px] appearance-none cursor-pointer"
          >
            <option value="" className="bg-bgdark">
              All Business Types
            </option>
            {businessTypes.map((type) => (
              <option key={type} value={type} className="bg-bgdark">
                {type}
              </option>
            ))}
          </select>
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            Business Type
          </span>
          <FaChevronUp className="absolute rotate-180 right-[20px] top-1/2 transform -translate-y-1/2 text-white w-[16px] h-[16px] xsm:w-[20px] xsm:h-[20px] pointer-events-none" />
        </div>

        {/* Industry Field */}
        <div className="relative">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] px-[20px] text-white aabbss font-light text-[14px] md:text-[16px] appearance-none cursor-pointer"
          >
            <option value="" className="bg-bgdark">
              All Industries
            </option>
            {dynamicIndustries.map((sector) => (
              <option key={sector.slug} value={sector.name} className="bg-bgdark">
                {sector.name}
              </option>
            ))}
          </select>
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            Industry
          </span>
          <FaChevronUp className="absolute rotate-180 right-[20px] top-1/2 transform -translate-y-1/2 text-white w-[16px] h-[16px] xsm:w-[20px] xsm:h-[20px] pointer-events-none" />
        </div>
      </div>

      {/* Filter Row 2 */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-[20px] mb-[20px]">
        {/* Min Price Field */}
        <div className="relative">
          <input
            type="number"
            placeholder="0"
            min="0"
            value={minPrice}
            onChange={(e) =>
              setMinPrice && setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] pl-4 md:pl-[20px] pr-[20px] text-white aabbss font-light text-[14px] md:text-[16px] placeholder-white/70"
          />
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            Min Price ($)
          </span>
        </div>

        {/* Max Price Field */}
        <div className="relative">
          <input
            type="number"
            placeholder="Any"
            min="0"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice && setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] pl-4 md:pl-[20px] pr-[20px] text-white aabbss font-light text-[14px] md:text-[16px] placeholder-white/70"
          />
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            Max Price ($)
          </span>
        </div>

        {/* State Field */}
        <div className="relative">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full h-[40px] md:h-[62px] bg-transparent border border-lightgray rounded-[10px] px-[20px] text-white aabbss font-light text-[14px] md:text-[16px] appearance-none cursor-pointer"
          >
            <option value="" className="bg-bgdark">
              All Cities
            </option>
            {states.map((state) => (
              <option
                key={state}
                value={state.toLowerCase().replace(/\s+/g, "-")}
                className="bg-bgdark"
              >
                {state}
              </option>
            ))}
          </select>
          <span className="absolute top-[-10px] left-[20px] bg-bgdark px-[10px] text-white aabbss font-semibold text-[16px]">
            City
          </span>
          <FaChevronUp className="absolute rotate-180 right-[20px] top-1/2 transform -translate-y-1/2 text-white w-[16px] h-[16px] xsm:w-[20px] xsm:h-[20px] pointer-events-none" />
        </div>

        {/* Featured Toggle */}
        <div className="relative flex items-center h-[40px] md:h-[62px]">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured && setIsFeatured(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 ${
                isFeatured
                  ? "bg-greencolor border-greencolor"
                  : "border-lightgray"
              }`}
            >
              {isFeatured && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="text-white aabbss font-semibold text-[14px] md:text-[16px]">
              Featured Only
            </span>
          </label>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-between items-center ">
        <button
          onClick={onReset}
          className="text-greencolor aabbss text-[16px] md:text-[20px] leading-[27px] hover:text-greencolor/80 transition-colors"
        >
          Reset all Filters
        </button>

        <button
          onClick={onSearch}
          className="bg-greencolor hover:bg-greencolor/90 transition-colors text-white aabbss font-bold text-[16px] md:text-[20px] leading-[27px] px-[20px] py-[8px] rounded-[8px] flex items-center gap-[10px]"
        >
          <FaSearch className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
