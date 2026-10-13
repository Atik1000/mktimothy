"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaEdit, FaWhatsapp } from "react-icons/fa";
import {
  IoApps,
  IoListSharp,
  IoLocation,
  IoMail,
  IoPersonSharp,
  IoShareSocial,
  IoTime,
} from "react-icons/io5";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className=" bg-bglight text-white">
      {/* Hero Section with Profile */}
      <div className="relative pt-[450px] pb-[100px] bg-[url('/images/bgmainpage.png')] bg-cover bg-center">
        {/* Background Image */}

        {/* Profile Circle */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-[150px] z-10">
          <div className="relative">
            <div className="w-[300px] h-[300px] rounded-full border-[10px] border-[#2C2C2C] overflow-hidden">
              <Image
                src="/images/pimage.png"
                alt="Kevin Smith"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Edit Button Top Right */}
        <div className="absolute top-20 right-20 w-[57px] h-[57px] bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
          <FaEdit className="w-[22px] h-[22px] text-white" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-[200px] pb-16 text-center">
        <h1 className=" font-semibold text-[36px]  mb-4">Kevin Smith</h1>
        <p className=" font-medium text-[20px] text-white mb-12">
          Advisor and Consultant for 17+ years
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-12">
          {/* Profile Button */}
          <div className="w-[100px] h-[100px] relative">
            <div
              className={`w-full h-full ${
                activeTab === "profile"
                  ? "bg-greencolor"
                  : "bg-[#2C2C2C] border border-white"
              } rounded-[10px] flex flex-col items-center justify-center cursor-pointer`}
              onClick={() => setActiveTab("profile")}
            >
              <IoPersonSharp
                className={`w-[50px] h-[50px] ${
                  activeTab === "profile" ? "text-white" : "text-greencolor"
                } mb-2`}
              />
              <span className="aabbuu font-medium text-[16px] text-white">
                Profile
              </span>
            </div>
          </div>

          {/* Catalog Button */}
          <div className="w-[100px] h-[100px] relative">
            <div
              className={`w-full h-full ${
                activeTab === "catalog"
                  ? "bg-greencolor"
                  : "bg-[#2C2C2C] border border-white"
              } rounded-[10px] flex flex-col items-center justify-center cursor-pointer`}
              onClick={() => setActiveTab("catalog")}
            >
              <IoListSharp
                className={`w-[50px] h-[50px] ${
                  activeTab === "catalog" ? "text-white" : "text-greencolor"
                } mb-2`}
              />
              <span className="aabbuu font-medium text-[16px] text-white">
                Catalog
              </span>
            </div>
          </div>

          {/* Share Button */}
          <div className="w-[100px] h-[100px] relative">
            <div
              className={`w-full h-full ${
                activeTab === "share" ? "bg-greencolor" : "border border-white"
              } rounded-[10px] flex flex-col items-center justify-center cursor-pointer`}
              onClick={() => setActiveTab("share")}
            >
              <IoShareSocial
                className={`w-[50px] h-[50px] ${
                  activeTab === "share" ? "text-white" : "text-greencolor"
                } mb-2`}
              />
              <span className="aabbuu font-medium text-[16px] text-white">
                Share
              </span>
            </div>
          </div>

          {/* Message Button */}
          <div className="w-[100px] h-[100px] relative">
            <div
              className={`w-full h-full ${
                activeTab === "message"
                  ? "bg-greencolor"
                  : "border border-white"
              } rounded-[10px] flex flex-col items-center justify-center cursor-pointer`}
              onClick={() => setActiveTab("message")}
            >
              <FaWhatsapp
                className={`w-[50px] h-[50px] ${
                  activeTab === "message" ? "text-white" : "text-greencolor"
                } mb-2`}
              />
              <span className="aabbuu font-medium text-[16px] text-white">
                Message
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === "profile" && (
        <>
          {/* Projects Section */}
          <div className="px-20 pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="aabbss font-bold text-[32px] leading-[44px]">
                Projects
              </h2>
              <button className="aabbss font-medium text-[20px] text-white hover:text-greencolor">
                View all
              </button>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-4 gap-8 mb-16">
              {[
                { src: "/images/sp1.png", alt: "Project 1" },
                { src: "/images/sp2.png", alt: "Project 2" },
                { src: "/images/sp3.png", alt: "Project 3" },
                { src: "/images/sp4.png", alt: "Project 4" },
                { src: "/images/sp5.png", alt: "Project 5" },
                { src: "/images/sp6.png", alt: "Project 6" },
                { src: "/images/sp7.png", alt: "Project 7" },
                { src: "/images/sp8.png", alt: "Project 8" },
              ].map((project, index) => (
                <Link
                  href={`/project/${index}`}
                  key={index}
                  className="w-[299px] h-[200px] rounded-[10px] overflow-hidden"
                >
                  <Image
                    src={project.src}
                    alt={project.alt}
                    width={299}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "catalog" && (
        <>
          {/* Catalog Content */}
          <div className="px-20 pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="aabbss font-bold text-[32px] leading-[44px]">
                Listings
              </h2>
              <Link
                href="/all-listings"
                className="aabbss font-medium text-[20px] text-white hover:text-greencolor"
              >
                View all
              </Link>
            </div>

            {/* Scenarios List */}
            <div className="space-y-8">
              {[
                { src: "/images/sp1.png", alt: "Scenario 1" },
                { src: "/images/sp2.png", alt: "Scenario 2" },
                { src: "/images/sp3.png", alt: "Scenario 3" },
                { src: "/images/sp4.png", alt: "Scenario 4" },
                { src: "/images/sp5.png", alt: "Scenario 5" },
              ].map((scenario, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-6 bg-transparent"
                >
                  {/* Limited Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm rounded-[10px] px-3 py-2">
                    <span className="aabbuu font-semibold text-[16px] text-white">
                      Limited
                    </span>
                  </div>

                  {/* Image */}
                  <div className="w-[199px] h-[119px] rounded-[15px] overflow-hidden flex-shrink-0">
                    <Image
                      src={scenario.src}
                      alt={scenario.alt}
                      width={199}
                      height={119}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="aabbss font-semibold text-[32px] leading-[44px] text-white mb-2">
                      Scenery
                    </h3>
                    <p className="aabbss font-medium text-[20px] leading-[27px] text-white">
                      Advisor and Consultant for 17+ years
                    </p>
                  </div>

                  {/* Plus Button */}
                  <div className="flex-shrink-0">
                    <button className="w-[41px] h-[41px] flex items-center justify-center text-white hover:text-greencolor transition-colors">
                      <svg
                        width="31"
                        height="31"
                        viewBox="0 0 31 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.5 5.16666V25.8333M5.16667 15.5H25.8333"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Description Section */}
      <div className={`px-20 py-16 ${activeTab === "catalog" ? "hidden" : ""}`}>
        
      </div>

      {/* Contact Info Grid */}
      <div
        className={`px-20 py-12 grid grid-cols-4 gap-16 ${
          activeTab === "catalog" ? "hidden" : ""
        }`}
      >
        {/* Working Hours */}
        <div className="flex items-center gap-4">
          <IoTime className="w-[30px] h-[30px] text-white" />
          <div>
            <span className="aabbuu font-medium text-[20px] text-white">
              Mon - Fri
            </span>
            <div className="bg-[#2C2C2C] rounded-[5px] px-[10px] py-[6px] ml-4 inline-block">
              <span className="aabbuu font-medium text-[16px] text-white">
                Open
              </span>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <IoMail className="w-[30px] h-[30px] text-white" />
          <span className="aabbuu font-medium text-[20px] text-white">
            Timothy@gmail.com
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-4">
          <IoLocation className="w-[30px] h-[30px] text-white" />
          <span className="aabbuu font-medium text-[20px] text-white">
            New York City, USA
          </span>
        </div>

        {/* Business Type */}
        <div className="flex items-center gap-4">
          <IoApps className="w-[30px] h-[30px] text-white" />
          <span className="aabbuu font-medium text-[20px] text-white">
            Finance, Business
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
