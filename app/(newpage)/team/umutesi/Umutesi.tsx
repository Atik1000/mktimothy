"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Umutesi = () => {
  const bio = [
    "Umutesi, based in South Africa, is a key partner at MK Timothy & Company, where she plays a significant role in connecting foreign investors with Uganda’s vibrant business opportunities. With her strong expertise in finance and international trade, she is adept at identifying lucrative investment prospects that resonate with potential partners. Umutesi’s knowledge of the South African market allows her to tailor investment strategies that attract interest and foster collaboration.", 
    "At MK Timothy & Company, Umutesi leverages the firm’s innovative online platform, which showcases businesses for sale and potential joint ventures in Uganda. Her ability to present these opportunities compellingly helps capture the attention of South African investors seeking to diversify their portfolios. By highlighting Uganda's unique advantages, she effectively communicates the potential for profitable returns in various sectors, including technology, agriculture, and real estate.", 
    "Umutesi's exceptional interpersonal skills are instrumental in building trust and rapport with clients. She prioritizes clear communication and support, ensuring that both investors and local entrepreneurs feel confident navigating the complexities of international investment. Her approachable demeanor and dedication to client success make her a reliable partner in the investment process.", 
    "Committed to sustainable and ethical business practices, Umutesi aligns her efforts with MK Timothy's mission to drive economic growth in Uganda. By promoting ventures that are not only profitable but also beneficial to the local economy, she contributes to the broader vision of fostering responsible investment. Through her significant contributions, Umutesi enhances MK Timothy & Company’s reputation as a leading advisory firm in facilitating international investment."
  ];

  const interests: string[] = [
    "Commercial Farming", 
    "Dairy & Livestock", 
    "Fisheries & Aquaculture", 
    "Food Processing", 
    "Women's Enterprise", 
    "Agribusiness", 
    "Rural Development", 
    "Export Agriculture"
  ];

  return (
    <TeamProfileTemplate
      name="Umutesi"
      role="Partner"
      location="South Africa"
      imageSrc="/images/umutesi.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Umutesi;
