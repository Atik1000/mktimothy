"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const William = () => {
  const bio = [
    "Graduating with a B.S. and Commission from the United States Coast Guard Academy, William started his career as an afloat officer in the Pacific waters of Central and South America. He then served as the Commanding Officer of a patrol cutter, where he led operations in search and rescue, counter-narcotics, and national defense. After completing five years of service and then going through Georgetown University’s School of Foreign Service with a degree in international politics and business, William worked as a foreign policy and economic advisor for a presidential campaign in the US. He was then introduced to partnering with Mk Timothy through the Wallenberg International Fellowship.",
    "As a ship captain, William worked at the intersection of multiple disciplines and had to make decisions in high risk situations with imperfect information, whilst going deep on understanding the technology that was critical to his team’s success. William leverages this background and core skill set for his work as an investor.",
    "As a Venture Lead, William focuses on early stage, frontier technology in the US and Europe. As a member of the frontier technology team, he invests in companies that are not only set to reshape entire industries but unlock the next frontier of technological breakthroughs. He identifies and lobbies for investment opportunities in Uganda.",
    "Outside of work, you can find William surfing, log canoe Ethanling, reading, playing all kinds of music, and hanging on his family’s Maryland farm.",
  ];

  const interests: string[] = [
    "Financial Services",
    "Investment Advisory",
    "Private Equity",
    "Business Acquisitions",
    "Joint Ventures",
    "Capital Raising",
    "Corporate Finance",
    "Venture Capital",
  ];

  return (
    <TeamProfileTemplate
      name="William"
      role="Venture Lead"
      location="Uganda"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/1b3c289d499b9b243ad3e2a4447862f7469ae488-916x1280.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default William;
