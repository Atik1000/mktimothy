"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Logan = () => {
  const bio = [
    "Logan, the Operating Partner for Business and Corporate Development at MK Timothy & Company in Japan, is instrumental &amp; in fostering strategic partnerships that bridge the gap between Japanese investors and the flourishing market in Uganda. With a wealth of experience in corporate strategy and international business, Logan identifies lucrative investment opportunities in sectors such as technology, manufacturing, and renewable energy. His expertise not only helps Japanese investors navigate the complexities of the Ugandan market but also highlights the unique benefits of investing in this vibrant economy..", 
    "At MK Timothy & Company, Logan leverages the firm’s online platform to connect Japanese investors with a wide array of businesses for sale and joint venture opportunities in Uganda. His analytical approach and keen market insights empower investors to make informed decisions, ensuring that their investments align with their financial goals. By cultivating relationships with Ugandan entrepreneurs, Logan plays a pivotal role in creating synergies that drive economic growth on both sides.", 
    "Passionate about sustainable business practices, Logan emphasizes the importance of ethical investments that benefit local communities. He believes that successful investments should contribute positively to social and economic development in Uganda.", 
    "By promoting collaboration between Japanese investors and Ugandan businesses, Logan helps foster partnerships that lead to impactful investments, enhancing MK Timothy & Company’s reputation as a trusted investment advisory firm dedicated to driving meaningful change."
  ];

  const interests: string[] = [
    "Mining", 
    "Mineral Value Addition", 
    "Gold Projects", 
    "Rare Earth Minerals", 
    "Industrial Minerals", 
    "Infra", 
    "Heavy Equipment", 
    "Export Trade"
  ];

  return (
    <TeamProfileTemplate
      name="Logan"
      role="Operating Partner, Business &amp; Corporate Development"
      location="Japan"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/fae42324564549d6af7f90dba72a3c53e1548205-1603x1600.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Logan;
