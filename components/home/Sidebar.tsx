"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface SidebarProps {
  selectedFilters: {
    search: string;
    categoryId: string;
    minPrice: number;
    maxPrice: number;
    location: string;
    businessType: string;
    isFeatured: boolean;
  };
  setSelectedFilters: (filters: any) => void;
  onApplyFilters?: () => void;
}

export default function Sidebar({
  selectedFilters,
  setSelectedFilters,
  onApplyFilters,
}: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchChange = (value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      search: value,
    });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      categoryId: value,
    });
  };

  const handleMinPriceChange = (value: number) => {
    setSelectedFilters({
      ...selectedFilters,
      minPrice: value,
    });
  };

  const handleMaxPriceChange = (value: number) => {
    setSelectedFilters({
      ...selectedFilters,
      maxPrice: value,
    });
  };

  const handleLocationChange = (value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      location: value,
    });
  };

  const handleBusinessTypeChange = (value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      businessType: value,
    });
  };

  const handleFeaturedToggle = () => {
    setSelectedFilters({
      ...selectedFilters,
      isFeatured: !selectedFilters.isFeatured,
    });
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      search: "",
      categoryId: "",
      minPrice: 0,
      maxPrice: 10000,
      location: "",
      businessType: "",
      isFeatured: false,
    });
  };

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
  ];

  const locations = [
    "Central Region",
    "Eastern Region",
    "Northern Region",
    "Western Region",
  ];

  return (
    <div className="w-[230px] lg:w-[260px] bg-bgdark py-[30px] px-[30px] flex flex-col flex-grow flex-1 sticky top-0 flex-shrink-0">
      {/* Search */}
      <div className="mb-[30px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[15px]">
          Search
        </h3>
        <input
          type="text"
          placeholder="Search businesses..."
          value={selectedFilters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-[40px] bg-transparent border border-gray-500 rounded-[8px] px-[15px] text-white aabbss text-[14px] placeholder-gray-400 focus:border-greencolor focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="mb-[30px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[15px]">
          Category
        </h3>
        {isLoading ? (
          <div className="text-gray-400 text-[14px]">Loading categories...</div>
        ) : (
          <div className="space-y-[8px] max-h-[200px] overflow-y-auto">
            <div
              className="flex items-center gap-[12px] cursor-pointer"
              onClick={() => handleCategoryChange("")}
            >
              <div
                className={`w-[16px] h-[16px] rounded-full border-2 ${
                  selectedFilters.categoryId === ""
                    ? "border-greencolor"
                    : "border-gray-500"
                } flex items-center justify-center`}
              >
                {selectedFilters.categoryId === "" && (
                  <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
                )}
              </div>
              <span className="text-white aabbss text-[14px] leading-[19px]">
                All Categories
              </span>
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-[12px] cursor-pointer"
                onClick={() => handleCategoryChange(category.id)}
              >
                <div
                  className={`w-[16px] h-[16px] rounded-full border-2 ${
                    selectedFilters.categoryId === category.id
                      ? "border-greencolor"
                      : "border-gray-500"
                  } flex items-center justify-center`}
                >
                  {selectedFilters.categoryId === category.id && (
                    <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
                  )}
                </div>
                <span className="text-white aabbss text-[14px] leading-[19px]">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-[30px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[15px]">
          Price Range
        </h3>
        <div className="space-y-[10px]">
          <div>
            <label className="text-white aabbss text-[12px] mb-[5px] block">
              Min Price ($)
            </label>
            <input
              type="number"
              min="0"
              value={selectedFilters.minPrice}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              className="w-full h-[35px] bg-transparent border border-gray-500 rounded-[6px] px-[10px] text-white aabbss text-[14px] focus:border-greencolor focus:outline-none"
            />
          </div>
          <div>
            <label className="text-white aabbss text-[12px] mb-[5px] block">
              Max Price ($)
            </label>
            <input
              type="number"
              min="0"
              value={selectedFilters.maxPrice}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              className="w-full h-[35px] bg-transparent border border-gray-500 rounded-[6px] px-[10px] text-white aabbss text-[14px] focus:border-greencolor focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-[30px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[15px]">
          Region
        </h3>
        <div className="space-y-[8px]">
          <div
            className="flex items-center gap-[12px] cursor-pointer"
            onClick={() => handleLocationChange("")}
          >
            <div
              className={`w-[16px] h-[16px] rounded-full border-2 ${
                selectedFilters.location === ""
                  ? "border-greencolor"
                  : "border-gray-500"
              } flex items-center justify-center`}
            >
              {selectedFilters.location === "" && (
                <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
              )}
            </div>
            <span className="text-white aabbss text-[14px] leading-[19px]">
              All Regions
            </span>
          </div>
          {locations.map((location) => (
            <div
              key={location}
              className="flex items-center gap-[12px] cursor-pointer"
              onClick={() => handleLocationChange(location)}
            >
              <div
                className={`w-[16px] h-[16px] rounded-full border-2 ${
                  selectedFilters.location === location
                    ? "border-greencolor"
                    : "border-gray-500"
                } flex items-center justify-center`}
              >
                {selectedFilters.location === location && (
                  <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
                )}
              </div>
              <span className="text-white aabbss text-[14px] leading-[19px]">
                {location}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Business Type */}
      <div className="mb-[30px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[15px]">
          Business Type
        </h3>
        <div className="space-y-[8px] max-h-[150px] overflow-y-auto">
          <div
            className="flex items-center gap-[12px] cursor-pointer"
            onClick={() => handleBusinessTypeChange("")}
          >
            <div
              className={`w-[16px] h-[16px] rounded-full border-2 ${
                selectedFilters.businessType === ""
                  ? "border-greencolor"
                  : "border-gray-500"
              } flex items-center justify-center`}
            >
              {selectedFilters.businessType === "" && (
                <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
              )}
            </div>
            <span className="text-white aabbss text-[14px] leading-[19px]">
              All Types
            </span>
          </div>
          {businessTypes.map((type) => (
            <div
              key={type}
              className="flex items-center gap-[12px] cursor-pointer"
              onClick={() => handleBusinessTypeChange(type)}
            >
              <div
                className={`w-[16px] h-[16px] rounded-full border-2 ${
                  selectedFilters.businessType === type
                    ? "border-greencolor"
                    : "border-gray-500"
                } flex items-center justify-center`}
              >
                {selectedFilters.businessType === type && (
                  <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
                )}
              </div>
              <span className="text-white aabbss text-[14px] leading-[19px]">
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Only */}
      <div className="mb-[30px]">
        <div
          className="flex items-center gap-[12px] cursor-pointer"
          onClick={handleFeaturedToggle}
        >
          <div
            className={`w-[16px] h-[16px] rounded border-2 ${
              selectedFilters.isFeatured
                ? "border-greencolor bg-greencolor"
                : "border-gray-500"
            } flex items-center justify-center`}
          >
            {selectedFilters.isFeatured && (
              <div className="w-[8px] h-[8px] bg-white rounded-sm" />
            )}
          </div>
          <span className="text-white aabbss text-[14px] leading-[19px]">
            Featured Only
          </span>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="space-y-[15px]">
        <button
          onClick={onApplyFilters}
          className="w-full bg-greencolor hover:bg-greencolor/90 transition-colors text-white aabbss font-bold text-[14px] py-[10px] rounded-[8px]"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="w-full bg-transparent border border-gray-500 hover:border-greencolor transition-colors text-white aabbss font-medium text-[14px] py-[10px] rounded-[8px]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
