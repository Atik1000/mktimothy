"use client";

import { useState } from "react";
import { TiTimes } from "react-icons/ti";
import Step1PropertyType from "./steps/Step1PropertyType";
import Step2BasicInfo from "./steps/Step2BasicInfo";
import Step3Address from "./steps/Step3Address";
import Step4Location from "./steps/Step4Location";
import Step5UploadImages from "./steps/Step5UploadImages";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddListingModal = ({ isOpen, onClose }: AddListingModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [listingData, setListingData] = useState({
    propertyType: "",
    bedrooms: 2,
    bathrooms: 2,
    country: "",
    streetAddress: "",
    unitNumber: "",
    city: "",
    state: "",
    zipCode: "",
    enterAddress: "",
    locationUnitNumber: "",
    logoImage: null as File | null,
    businessImages: [] as File[],
  });

  const handleStep1Next = (propertyType: string) => {
    setListingData((prev) => ({ ...prev, propertyType }));
    setCurrentStep(2);
  };

  const handleStep2Next = (basicInfo: {
    bedrooms: number;
    bathrooms: number;
  }) => {
    setListingData((prev) => ({ ...prev, ...basicInfo }));
    setCurrentStep(3);
  };

  const handleStep3Next = (addressInfo: {
    country: string;
    streetAddress: string;
    unitNumber: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setListingData((prev) => ({ ...prev, ...addressInfo }));
    setCurrentStep(4);
  };

  const handleStep4Next = (locationInfo: {
    enterAddress: string;
    unitNumber: string;
  }) => {
    setListingData((prev) => ({
      ...prev,
      enterAddress: locationInfo.enterAddress,
      locationUnitNumber: locationInfo.unitNumber,
    }));
    setCurrentStep(5);
  };

  const handleStep5Next = (imageInfo: {
    logoImage: File | null;
    businessImages: File[];
  }) => {
    setListingData((prev) => ({
      ...prev,
      logoImage: imageInfo.logoImage,
      businessImages: imageInfo.businessImages,
    }));

    // Handle final completion - you can add your submission logic here
    console.log("Final listing data:", {
      ...listingData,
      ...imageInfo,
    });

    // Close modal or show success message
    alert("Listing created successfully!");
    onClose();
  };

  const handleStepBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PropertyType onNext={handleStep1Next} />;
      case 2:
        return (
          <Step2BasicInfo onNext={handleStep2Next} onBack={handleStepBack} />
        );
      case 3:
        return (
          <Step3Address onNext={handleStep3Next} onBack={handleStepBack} />
        );
      case 4:
        return (
          <Step4Location onNext={handleStep4Next} onBack={handleStepBack} />
        );
      case 5:
        return (
          <Step5UploadImages onNext={handleStep5Next} onBack={handleStepBack} />
        );
      default:
        return <Step1PropertyType onNext={handleStep1Next} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-bgdark border border-white/20 rounded-xl p-6 w-[90%] max-w-[700px] flex flex-col">
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors ml-auto text-right flex justify-end mb-4"
        >
          <TiTimes className="w-6 h-6" />
        </button>

        {/* Step Progress Indicator */}
        {/* <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step === currentStep
                    ? "bg-greencolor"
                    : step < currentStep
                    ? "bg-greencolor/60"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div> */}

        {/* Main Content */}
        <div className="flex-1">{renderCurrentStep()}</div>
      </div>
    </div>
  );
};

export default AddListingModal;
