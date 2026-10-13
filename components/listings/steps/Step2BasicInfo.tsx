"use client";

import { useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";

interface Step2BasicInfoProps {
  onNext: (basicInfo: { bedrooms: number; bathrooms: number }) => void;
  onBack: () => void;
}

const Step2BasicInfo = ({ onNext, onBack }: Step2BasicInfoProps) => {
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);

  const handleNext = () => {
    onNext({ bedrooms, bathrooms });
  };

  const incrementBedrooms = () => {
    setBedrooms((prev) => Math.min(prev + 1, 20));
  };

  const decrementBedrooms = () => {
    setBedrooms((prev) => Math.max(prev - 1, 0));
  };

  const incrementBathrooms = () => {
    setBathrooms((prev) => Math.min(prev + 1, 20));
  };

  const decrementBathrooms = () => {
    setBathrooms((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex flex-col h-full px-8">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-white aabbss font-bold text-2xl mb-2">
          Tell us about your place
        </h2>
        <p className="text-white aabbss font-normal text-[14px]  opacity-80">
          With a few details we can show you an estimate of how much you could
          earn
        </p>
      </div>

      {/* Counter Controls */}
      <div className="flex-1 space-y-8">
        {/* Bedrooms Counter */}
        <div className="flex items-center justify-between py-2 border-b border-gray-600">
          <span className="text-white aabbss font-medium text-[14px]">
            {bedrooms} Bedroom{bedrooms !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-4">
            <button
              onClick={decrementBedrooms}
              disabled={bedrooms === 0}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                bedrooms === 0
                  ? "border-gray-600 text-gray-600 cursor-not-allowed"
                  : "border-white text-white hover:border-greencolor hover:text-greencolor"
              }`}
            >
              <HiMinus className="w-4 h-4" />
            </button>

            <button
              onClick={incrementBedrooms}
              className="w-6 h-6 rounded-full border-2 border-white text-white flex items-center justify-center hover:border-greencolor hover:text-greencolor transition-all"
            >
              <HiPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bathrooms Counter */}
        <div className="flex items-center justify-between py-2 border-b border-gray-600">
          <span className="text-white aabbss font-medium text-[14px]">
            {bathrooms} Bathroom{bathrooms !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-4">
            <button
              onClick={decrementBathrooms}
              disabled={bathrooms === 0}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                bathrooms === 0
                  ? "border-gray-600 text-gray-600 cursor-not-allowed"
                  : "border-white text-white hover:border-greencolor hover:text-greencolor"
              }`}
            >
              <HiMinus className="w-4 h-4" />
            </button>

            <button
              onClick={incrementBathrooms}
              className="w-6 h-6 rounded-full border-2 border-white text-white flex items-center justify-center hover:border-greencolor hover:text-greencolor transition-all"
            >
              <HiPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-auto pt-5">
        <button
          onClick={handleNext}
          className="w-full bg-greencolor text-white aabbss font-semibold text-[14px] py-2 rounded-xl hover:bg-greencolor/90 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2BasicInfo;
