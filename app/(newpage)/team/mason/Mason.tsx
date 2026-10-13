"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Mason = () => {
  const bio = [
    "Mason, a savvy freelancer based in Kenya, is making waves as an independent investment partner, connecting investors with lucrative opportunities in Uganda. With a keen eye for emerging markets and a robust network across East Africa, he identifies high-potential sectors such as technology, agriculture, mining, and real estate that are ripe for investment. His ability to spot promising ventures empowers investors to capitalize on Uganda's growth potential, facilitating seamless cross-border investments that drive economic development.", 
    "As a freelance partner, Mason collaborates with various companies and entrepreneurs, leveraging his expertise to provide tailored investment solutions. He actively promotes Uganda as a vibrant market, showcasing its unique advantages and diverse business landscape. His strategic insights into sectors like renewable energy, tourism, and infrastructure development help investors make informed decisions, ensuring they maximize their returns while supporting local businesses.", 
    "Mason is passionate about fostering sustainable investments that yield financial benefits and positively impact local communities. He believes in the power of ethical investing to drive social development and economic growth.", 
    "By bridging the gap between Kenyan investors and Ugandan opportunities, Mason is playing a pivotal role in enhancing regional collaboration and establishing himself as a trusted investment partner in East Africa."
  ];

  const interests: string[] = [
    "Renewable Energy", 
    "Oil & Gas Services", 
    "Infra", 
    "Utilities", 
    "Industrial Projects", 
    "Engineering", 
    "Mfg", 
    "Heavy Industry"
  ];

  return (
    <TeamProfileTemplate
      name="Mason"
      role="Venture Lead"
      location="Kenya"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/3d58a030165bbae4b904ec2e9ff9d30a5d3683e7-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Mason;
