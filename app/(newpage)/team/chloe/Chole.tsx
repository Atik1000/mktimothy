"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Chole = () => {
  const bio = [
    "Chloe, an influential partner at MK Timothy & Company, hails from Greece and is committed to unlocking the vast investment potential of Uganda for European investors. With her extensive background in finance and international trade, Chloe identifies lucrative opportunities that resonate with Greek investors seeking to diversify their portfolios. Her keen insights into Uganda's thriving sectors, such as technology, agriculture, and renewable energy, allow her to craft compelling investment narratives that highlight the unique advantages of this emerging market. By leveraging her expertise, Chloe effectively bridges the gap between Europe and Uganda, making her an essential resource for those looking to make impactful investments.", 
    "At MK Timothy & Company, Chloe champions the firm’s innovative online platform, which features businesses for sale and joint venture opportunities tailored to European investors. Her ability to articulate the benefits of investing in Uganda ensures that potential investors feel confident and informed throughout the decision-making process. Dedicated to promoting sustainable and ethical business practices, Chloe fosters strong relationships between investors and local entrepreneurs, driving mutually beneficial partnerships.", 
    "Through her strategic vision and passion for economic development, Chloe enhances MK Timothy & Company’s reputation as a leader in facilitating cross-border investments that contribute to Uganda's growth while providing attractive returns for investors. "
  ];

  const interests: string[] = [
    "Retail & Consumer Goods", 
    "Franchising", 
    "Commercial Property", 
    "Shopping Centres", 
    "E Commerce", 
    "Business Acquisitions", 
    "Marketing", 
    "Distribution"
  ];

  return (
    <TeamProfileTemplate
      name="Chloe"
      role="Team Coordinator"
      location="Greece"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/38d037cfcb7ead37c0328c9faa3b9c608e56d79f-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Chole;
