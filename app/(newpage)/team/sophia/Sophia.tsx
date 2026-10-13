"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Sophia = () => {
  const bio = [
    "Prior to partnering with MK Timothy as Partner in January 2022, Sophia spent several years honing her role as one of Germany’s most respected business entrepreneurs and food technology experts, holding various C-level positions throughout her career and having founded her first company at 23.   As the founder and CEO of LEMONCAT (acquired in 2019 by Rocket Internet’s B2B Food Group), Sophia built a marketplace and SaaS solution for the European catering industry. She was also COO of food delivery unicorn Delivery Hero, currently valued at over €10bn.   Outside of work, Sophia is a keen traveller and art lover and holds a Master's degree in Media Science, Literature and Art History from Humboldt University. She identifies and lobbies for investment opportunities in Uganda."
  ];

  const interests: string[] = [
    "Renewable Energy", 
    "Solar Projects", 
    "Hydropower", 
    "Infra", 
    "Green Technologies", 
    "Energy Storage", 
    "Carbon Projects", 
    "Utilities"
  ];

  return (
    <TeamProfileTemplate
      name="Sophia"
      role="Partner"
      location="South Sudan"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/3bb52f4afffd860159e97f9de780030a51b3c8d2-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Sophia;
