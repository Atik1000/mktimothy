"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Zoey = () => {
  const bio = [
    "Prior to partnering with MK Timothy, Zoey worked for more than 20 years as a bilingual assistant in South Africa, with roles in sectors as diverse as luxury goods, investment banking and vocational training. Her interest in start-ups and technology dates back to an intense (but short-lived) experience working for a video games’ sales startup back in 2000 and, more recently, assisting the global head of technology and communications for an executive search and talent management firm.   Zoey is an Executive Assistant / Team Coordinator at MK Timothy, based in South Africa where she supports the local team.   Outside of work, Zoey is a published writer and mother to two teens. She loves to roam the streets of South Africa photographing street art. She also identifies and lobbies for investment opportunities in Uganda."
  ];

  const interests: string[] = [
    "ICT", 
    "Artificial Intelligence", 
    "Software Development", 
    "FinTech", 
    "Innovation", 
    "Telecom", 
    "Data Centers", 
    "Cybersec"
  ];

  return (
    <TeamProfileTemplate
      name="Zoey"
      role="Team Coordinator"
      location="South Africa"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/6c05733cf79cd286fd919933487168f4895ada7d-433x552.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Zoey;
