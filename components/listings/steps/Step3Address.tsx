"use client";

import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

interface Step3AddressProps {
  onNext: (addressInfo: {
    country: string;
    streetAddress: string;
    unitNumber: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  onBack: () => void;
}

const Step3Address = ({ onNext, onBack }: Step3AddressProps) => {
  const [formData, setFormData] = useState({
    country: "",
    streetAddress: "",
    unitNumber: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Other",
  ];

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  return (
    <div className="flex flex-col h-full px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white aabbuu font-semibold text-2xl mb-4">
          What's your address?
        </h2>
        <p className="text-white aabbss font-medium text-sm opacity-80">
          With a few details we can show you an estimate of how much you could
          earn
        </p>
      </div>

      {/* Form Fields */}
      <div className="flex-1 space-y-6">
        {/* Country Dropdown */}
        <div className="relative">
          <div className="relative">
            <select
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full bg-transparent text-white aabbss text-sm pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-bgdark text-white">
                Country
              </option>
              {countries.map((country) => (
                <option
                  key={country}
                  value={country}
                  className="bg-bgdark text-white"
                >
                  {country}
                </option>
              ))}
            </select>
            <IoChevronDown className="absolute right-0 top-0 w-6 h-6 text-white pointer-events-none" />
          </div>
        </div>

        {/* Street Address */}
        <div>
          <input
            type="text"
            value={formData.streetAddress}
            onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            className="w-full bg-transparent text-white aabbss text-[16px] pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none"
            placeholder="Street Address"
          />
        </div>

        {/* Unit Number */}
        <div>
          <input
            type="text"
            value={formData.unitNumber}
            onChange={(e) => handleInputChange("unitNumber", e.target.value)}
            className="w-full bg-transparent text-white aabbss text-sm pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none"
            placeholder="Unit Number (optional)"
          />
        </div>

        {/* City */}
        <div>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="w-full bg-transparent text-white aabbss text-sm pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none"
            placeholder="City"
          />
        </div>

        {/* State Dropdown */}
        <div className="relative">
          <div className="relative">
            <select
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full bg-transparent text-white aabbss text-[16px] pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-bgdark text-white">
                State
              </option>
              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                  className="bg-bgdark text-white"
                >
                  {state}
                </option>
              ))}
            </select>
            <IoChevronDown className="absolute right-0 top-0 w-6 h-6 text-white pointer-events-none" />
          </div>
        </div>

        {/* Zip Code */}
        <div>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            className="w-full bg-transparent text-white aabbss text-sm pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none"
            placeholder="Zip Code"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-8">
        <button
          onClick={handleNext}
          className="w-full bg-greencolor text-white aabbss font-bold text-sm py-3 rounded-lg hover:bg-greencolor/90 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3Address;
