"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Benjamin = () => {
  const bio = [
    "Meet Benjamin, a dynamic tech analyst from Cape Town, South Africa, who is revolutionizing investment opportunities at MK Timothy & Company. With his finger on the pulse of the technology landscape, he excels at identifying cutting-edge startups and innovative projects that attract tech-savvy investors to Uganda's burgeoning market. Benjamin’s keen analytical skills enable him to evaluate potential ventures, ensuring only the most promising opportunities make the cut. As a passionate   advocate for Uganda's digital economy he leverages the firm’s online platform to showcase technology-focused businesses and joint ventures, making them irresistible to potential investors.   His commitment to ethical investment practices not only drives economic growth but also empowers local entrepreneurs,positioning MK Timothy & Company as a trailblazer in fostering tech innovation across borders."
  ];

  const interests: string[] = [
    "ICT", 
    "Telecom", 
    "Data", 
    "Smart Tech", 
    "AI", 
    "Innovation", 
    "FinTech", 
    "Digital Transform"
  ];

  return (
    <TeamProfileTemplate
      name="Benjamin"
      role="Tech Analyst"
      location="South Africa"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/933c228e2528ea4717df297adac1c800baad997f-500x500.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Benjamin;
