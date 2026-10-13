"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Tasha = () => {
  const bio = [
    "Tasha Mugisha is a distinguished tourism and hospitality professional with extensive experience in destination development, tourism operations, and hospitality management. As a Partner at MK Timothy & Company, she plays a pivotal role in connecting international investors with high value opportunities across Uganda's tourism and hospitality sector, including hotels, eco lodges, resorts, safari ventures, leisure developments, and tourism infrastructure.",
    "With a strong foundation built through years of service at the Uganda Tourism Board, Tasha possesses an in depth understanding of Uganda's tourism landscape, visitor markets, destination marketing, and industry regulations. Her expertise enables investors to identify sustainable opportunities while ensuring projects align with global tourism standards and long term commercial success.",
    "At MK Timothy & Company, Tasha works closely with local entrepreneurs, hospitality operators, developers, and international investors to facilitate strategic partnerships, investment transactions, and business expansion initiatives. Her commitment to excellence, market insight, and passion for showcasing Uganda's world class tourism potential make her an invaluable member of the firm's international investment advisory team."
  ];

  const interests: string[] = [
    "Tourism", 
    "Hospitality", 
    "Destination Development", 
    "Eco Lodges", 
    "Resorts", 
    "Safari Ventures"
  ];

  return (
    <TeamProfileTemplate
      name="Tasha Mugisha"
      role="Partner, Tourism & Hospitality Investment"
      location="Uganda"
      imageSrc="/images/tashamugisha.jpg"
      linkedInUrl="https://www.linkedin.com"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Tasha;
