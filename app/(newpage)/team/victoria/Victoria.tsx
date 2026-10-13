"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Victoria = () => {
  const bio = [
    "Prior to partnering with MK Timothy, Victoria worked at several startups channeling her passion for creativity and innovation. She started out at Caterwings (formerly known as LEMONCAT); the B2B marketplace for business catering. Here she developed herself from Account Manager to Senior Marketing Manager for the DACH Region, whereby she managed the merging of the two brands into one. Subsequently, Victoria joined the wellbeing app actio as Senior Marketing Manager, responsible for building actio’s marketing infrastructure.", 
    "Beyond the startup sphere, Victoria has a background in organising events of all sizes for Deutsche Telekom and Cinema for Peace, making her well positioned for plate-spinning running several projects simultaneously, and always with a smile.", 
    "With MK Timothy, Victoria is the Team Coordinator for the South Sudan Team.She identifies and lobbies for investment opportunities in South Sudan.", 
    "Outside of work, Victoria is an electronic music artist and well known as DJ MUKKIMIAU. And when she’s not gracing the decks, she loves to travel, do yoga and spend time with Bombay, her dog."
  ];

  const interests: string[] = [
    "Hospitality", 
    "Luxury Hotels", 
    "Tourism Investments", 
    "Property Development", 
    "Commercial Real Estate", 
    "Mixed Use Developments", 
    "Business Acquisitions", 
    "Joint Ventures"
  ];

  return (
    <TeamProfileTemplate
      name="Victoria"
      role="Team Coordinator"
      location="South Sudan"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/2985d3b280354e730f5c955ccc8fde186c52cef8-408x408.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Victoria;
