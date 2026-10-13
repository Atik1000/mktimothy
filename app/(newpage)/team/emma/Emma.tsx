"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Emma = () => {
  const bio = [
    "Emmanuel, a strategic partner at MK Timothy & Company based in Johannesburg, is dedicated to connecting South African investors with lucrative opportunities in Uganda. With his extensive background in finance and investment analysis, he excels at identifying high-potential ventures that resonate with investors looking to expand into emerging markets. Emmanuel's in-depth knowledge of both the South African and Ugandan business landscapes positions him as a vital resource for those seeking profitable investments that can drive economic growth in the region.", 
    "At MK Timothy & Company, Emmanuel is instrumental in promoting the firm’s innovative online platform, which features a wide range of businesses for sale and potential joint ventures in Uganda. His ability to articulate the benefits of investing in Uganda's diverse sectors, including technology, agriculture, and infrastructure, ensures that South African investors are well-informed and confident in their investment decisions. Emmanuel's keen insights into market trends and investor preferences enable him to tailor investment opportunities that align with his clients' goals, fostering a seamless investment experience.", 
    "Passionate about creating sustainable partnerships, Emmanuel prioritizes ethical business practices and community engagement in his investment approach. He understands that successful investments go beyond financial returns; they should also contribute positively to local economies. By fostering collaboration between South African investors and Ugandan entrepreneurs, Emmanuel not only enhances MK Timothy & Company’s reputation as a trusted investment advisory firm but also plays a crucial role in driving meaningful economic development in Uganda."
  ];

  const interests: string[] = [
    "Mfg", 
    "Electronics", 
    "Consumer Goods", 
    "Industrial Equipment", 
    "Export Mfg", 
    "Logistics & Warehousing", 
    "Industrial Parks", 
    "Supply Chain"
  ];

  return (
    <TeamProfileTemplate
      name="Emma"
      role="Operating Partner"
      location="Johannesburg"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/e3648464ad1167efbba189daaaf76491b5236166-1211x1211.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Emma;
