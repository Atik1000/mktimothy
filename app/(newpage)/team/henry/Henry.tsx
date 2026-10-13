"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Henry = () => {

  const bio = [
  "Magandaazi Henry Seguya is a Ugandan entrepreneur, tourism professional, and financial literacy advocate with a background in commerce, banking, and business development. He is married and a proud father of children (girls and one boy).",

  "Mr. Seguya holds a Bachelor of Commerce from Makerere University and a Diploma in Logistics and Transport Management from Uganda Management Institute (UMI). He also earned a First Class Diploma in Bookkeeping from Damelin Management School (The South African Institute of Management), South Africa, and Certificates in Information Technology from the Institute of Information and Communications Technology, Nakawa.",

  "Committed to continuous professional development, he is currently pursuing a Master of Business Administration (MBA) at INTI International University & Colleges, Persiaran Perdana, Malaysia.",

  "Mr. Seguya's career spans the media, finance, banking, and entrepreneurial sectors, reflecting a diverse and practical professional journey.",

  "He began his career in marketing at Prime Radio before moving into finance and accounts at M-Products. He later joined the banking sector, serving with Crane Bank, where he gained valuable experience in financial services and client relations.",

  "After several years in formal employment, he transitioned into private business and farming, focusing on entrepreneurship and investment initiatives."
];

  const interests: string[] = [
    "Strategic Investments", 
    "Cross Border Trade", 
    "Investment Promotion", 
    "Joint Venture Partnerships", 
    "Government Relations", 
    "Foreign Direct Investment", 
    "Business Expansion", 
    "Intl Markets"
  ];

  return (
    <TeamProfileTemplate
      name="Henry Magandaazi Seguya"
      role="Partner"
      location="Uganda"
      imageSrc="/images/henry.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Henry;
