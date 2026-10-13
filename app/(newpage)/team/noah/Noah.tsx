"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Noah = () => {
  const bio = [
    "Noah started his career as a web designer and developer in the 90s, but has spent the last 20+ years as a product leader across Europe and the US, building products and product teams in startups such as Allt om, Huddle, Covestor, and Cazoo, as well as global brands such as Monster and the Financial Times.", 
    "Noah is the founder of ProductTank and co-founder of Mind the Product—together the world’s largest product management community with meetups in 215+ cities around the world and annual conferences in Kenya, Japan, Singapore, and more.", 
    "He is also the co-author of a best-selling book on product leadership, collecting insights from 100+ interviews with product leaders from around the world - \"Product Leadership: How Top Product Managers Launch Great Products and Build Successful Teams” (O’Reilly, 2017). He identifies and lobbies for investment opportunities in Uganda."
  ];

  const interests: string[] = [
    "Mfg", 
    "Pharma", 
    "Medical Mfg", 
    "Food Processing", 
    "Packaging", 
    "Export Mfg", 
    "Industrial Parks", 
    "Logistics"
  ];

  return (
    <TeamProfileTemplate
      name="Noah"
      role="Operating Partner"
      location="Kenya"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/d1be4a94b63aa9070f7e006b881a7fd623fde3a8-3000x3000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Noah;
