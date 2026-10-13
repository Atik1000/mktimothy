"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Hannah = () => {
  const bio = [
    "Hannah, a dynamic business consultant from Mauritius, is a key partner at MK Timothy & Company, where she expertly bridges the gap between investors in Mauritius, Seychelles, and exciting opportunities in Uganda. With her deep insight into regional markets, she identifies high-potential ventures in tourism, agriculture, and technology, showcasing Uganda as a goldmine for investment. Hannah not only empowers Mauritian and Seychellois investors to make informed decisions but also offers invaluable support to Ugandan entrepreneurs seeking to immigrate to these thriving islands. Her dual focus fosters a vibrant ecosystem of cross-border collaboration that drives economic growth.", 
    "At MK Timothy & Company, Hannah leverages the firm’s user-friendly online platform to highlight a variety of businesses for sale and potential joint ventures in Uganda. She champions ethical investment practices, ensuring that investors can achieve robust returns while positively impacting local communities. By facilitating connections between Mauritian and Seychellois investors and Ugandan entrepreneurs whether they seek to invest in Uganda or establish roots in Mauritius and Seychelles—Hannah plays a transformative role in fostering sustainable economic development. Her efforts enhance", 
    "MK Timothy & Company’s reputation as a leading investment advisory firm, dedicated to creating meaningful partnerships that benefit all parties involved."
  ];

  const interests: string[] = [
    "Tourism Experiences", 
    "Eco Tourism", 
    "Cultural Tourism", 
    "Safari Lodges", 
    "Hotel Development", 
    "Hospitality", 
    "Events & Leisure", 
    "Conservation Projects"
  ];

  return (
    <TeamProfileTemplate
      name="Hannah"
      role="Team Coordinator"
      location="Mauritius"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/cf50ab29554422ad6a0223ee54e7c56b5164a9db-2392x2392.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Hannah;
