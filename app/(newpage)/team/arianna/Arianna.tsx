"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Arianna = () => {
  const bio = [
    "Arianna, based in Milan, is an invaluable partner at MK Timothy & Company, where she plays a pivotal role in connecting foreign investors with promising business opportunities in Uganda. Her strong background in international business and finance, combined with her keen understanding of market trends, allows her to effectively identify and promote investment prospects that resonate with potential partners.", 
    "Arianna is instrumental in leveraging the company’s online listing platform, which showcases businesses for sale and highlights joint venture opportunities within Uganda. Her expertise in crafting compelling narratives around these listings helps attract interest from Italian and other European investors looking to diversify their portfolios in emerging markets.", 
    "With her exceptional communication skills and a passion for fostering cross-cultural relationships, Arianna excels at building trust and rapport with clients, ensuring they feel confident navigating the Ugandan business landscape.", 
    "Her dedication to promoting sustainable and ethical investments aligns with MK Timothy’s mission, making her a key player in driving economic growth and creating lasting partnerships between investors and local entrepreneurs.", 
    "Through Arianna’s efforts, MK Timothy & Company continues to expand its influence in Europe while unlocking new avenues for investment in Uganda.", 
    ""
  ];

  const interests: string[] = [
    "Agriculture", 
    "Coffee Processing", 
    "Tea", 
    "Cocoa", 
    "Agribusiness Processing", 
    "Export Markets", 
    "Commercial Farming", 
    "Food Security"
  ];

  return (
    <TeamProfileTemplate
      name="Arianna"
      role="Partner"
      location="Milan Italy"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/7fd5ea378dd634a9d784b912e4d4378e416ef600-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Arianna;
