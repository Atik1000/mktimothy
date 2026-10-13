"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Grayson = () => {
  const bio = [
    "Grayson, born and raised in northern Sweden, brings a unique perspective to MK Timothy & Company as an economist. His deep understanding of economic principles and market dynamics equips him to identify promising investment opportunities in Uganda. Grayson’s analytical skills allow him to assess various sectors , from technology to agriculture, helping Swedish investors make informed decisions that align with their financial goals.", 
    "At MK Timothy & Company, Grayson leverages the firm’s online platform to connect Swedish investors with businesses for sale and joint venture opportunities in Uganda. His ability to clearly articulate the benefits of investing in this emerging market enhances investor confidence. Grayson’s expertise in international economics positions him as a vital resource for those seeking to navigate the complexities of cross-border investments.", 
    "Grayson is passionate about fostering sustainable economic growth and ethical investment practices. He believes that successful investments should contribute positively to local communities while generating strong returns. By promoting collaboration between Swedish investors and Ugandan entrepreneurs, Grayson helps create partnerships that drive economic development in Uganda.", 
    "With a focus on building long-term relationships, Grayson prioritizes open communication and trust between investors and local businesses. His commitment to ethical practices and community engagement enhances MK Timothy & Company’s reputation as a leading investment advisory firm. Through his efforts, Grayson plays a key role in driving impactful investments that benefit both investors and the Ugandan economy."
  ];

  const interests: string[] = [
    "Infra", 
    "Roads", 
    "Bridges", 
    "Water Supply", 
    "Smart Infra", 
    "Construction", 
    "Public Private Partnerships", 
    "Industrial Development"
  ];

  return (
    <TeamProfileTemplate
      name="Grayson"
      role="Operating Partner Analytics"
      location=""
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/34b8a3847e68552550a375763e7cdea84575dbef-1999x1804.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Grayson;
