"use client";

import { useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";

interface Step1PropertyTypeProps {
  onNext: (propertyType: string) => void;
}

const Step1PropertyType = ({ onNext }: Step1PropertyTypeProps) => {
  const [selectedType, setSelectedType] = useState("Private Residence");

  const handleSelection = (type: string) => {
    setSelectedType(type);
    // Small delay before moving to next step for better UX
    setTimeout(() => {
      onNext(type);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-white aabbss font-bold text-2xl mb-8 text-center">
        What would you like to list
      </h2>

      <div className="flex gap-6 w-full max-w-[500px]">
        {/* Private Residence Card */}
        <div
          onClick={() => handleSelection("Private Residence")}
          className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedType === "Private Residence"
              ? "border-greencolor bg-greencolor/10"
              : "border-gray-600 hover:border-greencolor/50"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 p-4 rounded-lg ${
                selectedType === "Private Residence"
                  ? "bg-greencolor"
                  : "bg-gray-600"
              }`}
            >
              <FaHome className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white aabbss font-semibold text-[20px] mb-2">
              Private Residence
            </h3>
            <p className="text-gray-300 aabbss text-[14px] leading-relaxed">
              A private home, apartment or vacation home
            </p>
          </div>
        </div>

        {/* Lodging Card */}
        <div
          onClick={() => handleSelection("Lodging")}
          className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedType === "Lodging"
              ? "border-greencolor bg-greencolor/10"
              : "border-gray-600 hover:border-greencolor/50"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 p-4 rounded-lg ${
                selectedType === "Lodging" ? "bg-greencolor" : "bg-gray-600"
              }`}
            >
              <FaBuilding className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white aabbss font-semibold text-[20px] mb-2">
              Lodging
            </h3>
            <p className="text-gray-300 aabbss text-[14px] leading-relaxed">
              A hotel, motel or bed and breakfast
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1PropertyType;
