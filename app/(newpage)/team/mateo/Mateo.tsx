"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Mateo = () => {
  const bio = [
    "Mateo, an ambitious industrial strategist based in Turkey, is at the forefront of driving industrialization efforts within Uganda through his role at MK Timothy & Company. With a rich background in manufacturing and economic development, Mateo focuses on connecting Turkish investors with Uganda's burgeoning industrial sector. His keen understanding of both markets allows him to identify key opportunities in manufacturing, infrastructure, and logistics, positioning Uganda as an emerging hub for industrial investment in East Africa.", 
    "At MK Timothy & Company, Mateo leverages the firm’s innovative online platform to showcase a range of industrial projects and joint venture possibilities. He actively engages with Turkish companies looking to expand their footprint in Africa, providing tailored insights that highlight Uganda’s unique advantages. By facilitating partnerships between Turkish investors and Ugandan entrepreneurs, Mateo plays a vital role in promoting technology transfer and best practices in industrial processes.", 
    "Passionate about sustainable development, Mateo emphasizes the importance of ethical investment practices that create long-term value for both investors and local communities. He believes that s   successful industrialization should not only enhance economic growth but also contribute to job creation and social progress. Through his efforts, Mateo is helping to position Uganda as a prime destination for Turkish industrial investments, solidifying MK Timothy & Company’s reputation as a leader in fostering impactful partnerships across borders.", 
    "In his spare time, Mateo enjoys traveling, running and reading a good book.", 
    ""
  ];

  const interests: string[] = [
    "Agro Industrial", 
    "Commercial Farming", 
    "Agribusiness Processing", 
    "Food Processing", 
    "Dairy & Livestock", 
    "Export Crops", 
    "Renewable Energy", 
    "Water & Irrigation"
  ];

  return (
    <TeamProfileTemplate
      name="Mateo Levi Åström"
      role="Analytics Lead"
      location="Turkey"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/beebb32457f3a27afb27dfd060b461fc11a96919-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Mateo;
