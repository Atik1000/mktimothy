"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Alemi = () => {
  const bio = [
    "Alemi James is a highly accomplished automotive professional, real estate expert, and international trade specialist with over 18 years of experience spanning multiple industries. As the Founding Kampala Range Rovers Limited Uganda, he has established himself as one of Uganda's leading authorities in luxury vehicle repair, advanced diagnostics, and automotive engineering. His exceptional technical expertise and commitment to excellence have earned him widespread recognition within the automotive sector.",
    "A Car Repair and Diagnosis Expert with nearly two decades of practical experience, James specializes in identifying and resolving complex mechanical and electronic vehicle faults, particularly in premium and luxury automobiles. His reputation for precision, reliability, and innovation has made him a trusted advisor to individuals, businesses, and corporate fleets.",
    "Beyond the automotive industry, James is recognized as one of Uganda's leading real estate professionals, with extensive expertise in property acquisition, investment advisory, valuation, and strategic real estate development. His comprehensive understanding of the Ugandan property market enables him to connect investors with high value opportunities across residential, commercial, industrial, and hospitality sectors.",
    "James is also an accomplished International Trade Expert, International Commodity Sourcing Specialist, and Foreign Direct Investment (FDI) Consultant. He possesses extensive experience in global procurement, cross border trade, supplier identification, commodity sourcing, and facilitating international investment partnerships. His broad international network and deep understanding of global markets enable him to bridge opportunities between foreign investors and African enterprises.",
    "Renowned for his vast professional network across Uganda and international markets, James cultivates strong relationships with business leaders, investors, entrepreneurs, manufacturers, and government stakeholders. His multidisciplinary expertise, strategic insight, and unwavering commitment to delivering value make him an indispensable partner at MK Timothy & Company, where he plays a pivotal role in connecting global investors with transformative business and investment opportunities throughout Africa."
  ];

  const interests: string[] = [
    "Automotive Engineering", 
    "Luxury Vehicle Repair", 
    "Real Estate Investment", 
    "International Trade", 
    "FDI Consulting", 
    "Commodity Sourcing"
  ];

  return (
    <TeamProfileTemplate
      name="Alemi James"
      role="Automotive, Real Estate & International Trade Partner"
      location="Uganda"
      imageSrc="/images/alemijames.jpg"
      linkedInUrl="https://www.linkedin.com"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Alemi;
