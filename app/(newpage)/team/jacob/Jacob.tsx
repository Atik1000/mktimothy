"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Jacob = () => {
  const bio = [
    "Jacob, an innovative entrepreneur from Amsterdam, plays a vital role at MK Timothy & Company by connecting Dutch investors with promising opportunities in Uganda. With his strong background in international business, he identifies high-potential ventures in technology, renewable energy, and agriculture, making Uganda an appealing destination for investment. Jacob’s expertise empowers investors to navigate this dynamic market confidently.", 
    "At MK Timothy & Company, Jacob utilizes the firm’s online platform to showcase a diverse range of businesses for sale and potential joint ventures. His insights into market trends foster investor confidence and help them make informed decisions. By leveraging his extensive network in Amsterdam and Uganda, Jacob facilitates valuable connections that enhance collaboration between investors and local entrepreneurs.", 
    "Passionate about sustainable development, Jacob emphasizes ethical investment practices that yield financial returns while benefiting local communities. He believes successful investments should drive growth and development in Uganda. By fostering partnerships between Dutch investors and Ugandan businesses, Jacob contributes to the economic prosperity of both regions and solidifies MK Timothy & Company’s reputation as a leading investment advisory firm."
  ];

  const interests: string[] = [
    
  ];

  return (
    <TeamProfileTemplate
      name="Jacob"
      role="Operating Partner"
      location="Amsterdam"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/6938de4f0d91cbdff44d66f7ad08397bae4fe5a8-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Jacob;
