"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Amelia = () => {
  const bio = [
    "Amelia, operating from Osaka, is a key partner at MK Timothy & Company, driving the company's mission of connecting foreign investors with lucrative opportunities in Uganda. With her deep expertise in business development and international relations, Amelia specializes in bridging Japanese entrepreneurs and Ugandan enterprises, ensuring smooth, culturally aware collaborations.", 
    " MK Timothy & Company, renowned for its innovative online listing platform, &amp; offers a unique gateway for foreign investors looking{\" \"}  for businesses for sale in Uganda  ), or or seeking joint venture partnerships Amelia plays a pivotal role in showcasing these opportunities to investors in{\" \"} Japan,, emphasizing the vast potential in sectors such as technology, real estate, and agriculture.", 
    " Her ability to align investor goals with Uganda’s growing market needs ensures that each collaboration is mutually beneficial. Through her strategic insight and commitment to excellence, Amelia helps streamline the process of securing investment, making MK Timothy & Company the go-to advisory firm for investors seeking to enter Uganda’s dynamic business environment.with a particular love for Ethanling, having Ethanled all the way across the Atlantic Ocean.", 
    "", 
    "Education Msc at Chalmers School of Entrepreneurship and Msc in Finance at Gothenburg University."
  ];

  const interests: string[] = [
    "Real Estate Development", 
    "Construction", 
    "Commercial Property", 
    "Infra", 
    "Industrial Parks", 
    "Urban Development", 
    "Smart Cities", 
    "Commercial Land Investments"
  ];

  return (
    <TeamProfileTemplate
      name="Amelia"
      role="Partner"
      location="Osaka"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/d9de592d419e82fb16dce0707f375de994b772bb-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Amelia;
