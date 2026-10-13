"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Luca = () => {
  const bio = [
    "Luca, a dynamic business developer in Spain, is a driving force at MK Timothy & Company, passionately connecting Spanish investors with the abundant opportunities in Uganda. With his extensive expertise in international trade, Luca showcases Uganda as a thriving hub for investment in sectors like agriculture, technology, and renewable energy. His unique ability to navigate the complexities of the Ugandan market empowers investors to make strategic decisions that align with their financial goals and values.", 
    "At MK Timothy & Company, Luca leverages the firm’s innovative online platform to present a curated selection of businesses for sale and joint venture possibilities. His deep understanding of both Spanish and Ugandan cultures allows him to forge strong connections between investors and local entrepreneurs. By facilitating these partnerships, Luca creates pathways for impactful collaborations that drive economic growth and innovation in Uganda.", 
    "Driven by a commitment to sustainable investment, Luca champions ethical practices that benefit local communities and foster social development. He believes that successful investments should not only generate financial returns but also contribute positively to society. By bridging the gap between Spanish capital and Ugandan entrepreneurship, Luca is instrumental in establishing MK Timothy & Company as a leading investment advisory firm dedicated to transforming potential into prosperity.", 
    ""
  ];

  const interests: string[] = [
    "Logistics & Warehousing", 
    "Transport", 
    "Cold Chain", 
    "Ports & Inland Logistics", 
    "Supply Chain", 
    "Industrial Parks", 
    "Export Trade", 
    "Infra"
  ];

  return (
    <TeamProfileTemplate
      name="Luca"
      role="Partner"
      location="Spain"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/67603d565296249d2c7e22f47077076b2e9a033a-588x680.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Luca;
