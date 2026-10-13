"use client";

import { useState } from "react";
import { HiPhotograph } from "react-icons/hi";

interface Step5UploadImagesProps {
  onNext: (imageInfo: {
    logoImage: File | null;
    businessImages: File[];
  }) => void;
  onBack: () => void;
}

const Step5UploadImages = ({ onNext, onBack }: Step5UploadImagesProps) => {
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [businessImages, setBusinessImages] = useState<File[]>([]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      // 5MB limit
      setLogoImage(file);
    } else {
      alert("File size must be 5MB or less");
    }
  };

  const handleBusinessImagesUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      alert("Some files were too large. File size must be 5MB or less");
    }

    setBusinessImages((prev) => [...prev, ...validFiles]);
  };

  const handleNext = () => {
    onNext({
      logoImage,
      businessImages,
    });
  };

  return (
    <div className="flex flex-col h-full px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white aabbuu font-semibold text-2xl mb-4">
          Upload Images
        </h2>
      </div>

      {/* Upload Areas */}
      <div className="flex-1 space-y-6">
        {/* Upload Logo */}
        <div>
          <label className="text-white aabbss font-normal text-sm block mb-3">
            Upload Logo
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border border-[#4A4A4A] rounded-lg bg-[#4A4A4A]/10 flex items-center justify-between py-6 hover:border-greencolor/50 transition-colors px-5">
              <HiPhotograph className="w-6 h-6 text-white " />
              <span className="text-[#A0A0A0] aabbss text-sm text-center">
                {logoImage ? logoImage.name : "Upload image (Maximum size 5mb)"}
              </span>
              <div></div>
            </div>
          </div>
        </div>

        {/* Upload Business Images */}
        <div>
          <label className="text-white aabbss font-normal text-sm block mb-3">
            Upload Business Images
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBusinessImagesUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border border-[#4A4A4A] rounded-lg bg-[#4A4A4A]/10 flex items-center justify-between py-6 hover:border-greencolor/50 transition-colors px-5">
              <HiPhotograph className="w-6 h-6 text-white " />
              <span className="text-[#A0A0A0] aabbss text-sm text-center">
                {businessImages.length > 0
                  ? `${businessImages.length} image(s) selected`
                  : "Upload image (Maximum size 5mb)"}
              </span>
              <div></div>
            </div>
          </div>

          {/* Show selected business images */}
          {businessImages.length > 0 && (
            <div className="mt-3 space-y-2">
              {businessImages.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-white text-sm bg-bglight/20 p-2 rounded"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() =>
                      setBusinessImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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

export default Step5UploadImages;
