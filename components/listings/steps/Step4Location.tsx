"use client";

import { useState } from "react";

interface Step4LocationProps {
  onNext: (locationInfo: { enterAddress: string; unitNumber: string }) => void;
  onBack: () => void;
}

const Step4Location = ({ onNext, onBack }: Step4LocationProps) => {
  const [formData, setFormData] = useState({
    enterAddress: "",
    unitNumber: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="flex flex-col h-full px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white aabbuu font-semibold text-2xl mb-4">
          Where's your place Located?
        </h2>
      </div>

      {/* Form Fields */}
      <div className="flex-1 space-y-6">
        {/* Enter Address */}
        <div>
          <input
            type="text"
            value={formData.enterAddress}
            onChange={(e) => handleInputChange("enterAddress", e.target.value)}
            className="w-full bg-transparent text-white aabbss text-sm pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none"
            placeholder="Enter Address"
          />
        </div>

        {/* Unit Number */}
        <div>
          <input
            type="text"
            value={formData.unitNumber}
            onChange={(e) => handleInputChange("unitNumber", e.target.value)}
            className="w-full bg-transparent text-white aabbss text-sm pb-2 border-b border-[#4A4A4A] focus:border-greencolor focus:outline-none"
            placeholder="Unit number (optional)"
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

export default Step4Location;
