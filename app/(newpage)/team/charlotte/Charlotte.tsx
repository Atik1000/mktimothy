"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Charlotte = () => {
  const bio = [
    "Charlotte, based in Germany, is a key partner at MK Timothy & Company, specializing in connecting European investors with promising opportunities in Uganda. With an extensive background in international business and finance, Charlotte excels in identifying ventures that align with the goals of investors seeking growth in emerging markets. Her ability to navigate both the European and African business environments makes her an indispensable bridge for investors looking to expand into Uganda’s fast- &amp; growing economy.", 
    "At MK Timothy & Company, Charlotte focuses on promoting the firm’s online platform, which lists businesses for sale and joint ventures in Uganda. Her deep understanding of European investor preferences allows her to effectively showcase investment opportunities in sectors such as technology, agriculture, and real estate. Charlotte’s strategic thinking and clear communication ensure that investors receive tailored solutions that meet their specific needs, helping them make informed decisions.", 
    "Passionate about sustainable and ethical business practices, Charlotte is committed to fostering partnerships that not only generate strong returns but also contribute to the economic development of Uganda. Her approach is centered on creating long-term value for both investors and local entrepreneurs, helping MK Timothy & Company strengthen its reputation as a leading firm in international investment advisory. Through her efforts, Charlotte continues to build strong relationships that drive impactful investments and fuel economic growth."
  ];

  const interests: string[] = [
    "Education Projects", 
    "Vocational Training", 
    "Universities", 
    "Healthcare", 
    "Social Infra", 
    "Technology Education", 
    "Innovation", 
    "Youth Development"
  ];

  return (
    <TeamProfileTemplate
      name="Charlotte"
      role="Venture Lead"
      location="Germany"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/bbc26d75e00bc763936f819c5823dcff8beeb821-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Charlotte;
