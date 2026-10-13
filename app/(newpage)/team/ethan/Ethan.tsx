"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Ethan = () => {
  const bio = [
    "Ethan, a proactive partner at MK Timothy & Company in Toronto, connects Canadian investors with exciting opportunities in Uganda. With a solid background in finance, he identifies high-potential ventures in sectors like technology and agriculture. Ethan's insights into emerging markets showcase Uganda as a prime destination for growth, making it attractive for Canadian investors.", 
    "At MK Timothy & Company, Ethan promotes the firm’s intuitive online platform, which features businesses for sale and joint ventures in Uganda. His clear communication highlights the unique benefits of investing in Uganda, empowering Canadian investors to make informed decisions. By leveraging his extensive network, Ethan fosters cross-border collaborations that benefit both investors and local entrepreneurs.", 
    "Ethan prioritizes building strong relationships between Canadian investors and Ugandan businesses. He believes that trust and collaboration are key to successful investments. By facilitating open dialogue, Ethan ensures that both parties align their goals, creating a win-win scenario that drives economic growth.", 
    "Passionate about ethical investment practices, Ethan focuses on community development alongside financial returns. His commitment to sustainability enhances MK Timothy & Company’s reputation as a trusted investment advisory firm. Through his efforts, Ethan contributes to meaningful change in Uganda while delivering attractive opportunities for Canadian investors."
  ];

  const interests: string[] = [
    "Mining", 
    "Mfg", 
    "Industrial Parks", 
    "Logistics", 
    "Export Trade", 
    "Commercial Land Investments", 
    "Infra", 
    "Business Development"
  ];

  return (
    <TeamProfileTemplate
      name="Ethan"
      role="Venture Analyst"
      location="Toronto, Canada"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/7bb964a17cbe65f01667f774fb7750175324ee89-547x547.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Ethan;
