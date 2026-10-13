"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Stella = () => {
  const bio = [
    "Stella holds an Accounting and Finance degree from Uppsala University, where she first developed her interest in venture capital, writing her thesis about the effect of VC backing on IPO pricing. During her studies, Stella also drove projects and organized events for the Business and Economics Student Association.",
    "Stella subsequently began her career at Swedbank, one of Scandinavia’s largest asset managers, working with the performance of funds before moving on to Klarna, where she was involved with project management, data analysis, and visualization within sales operations.",
    "To get more insight into the startup community, she also volunteered for startup hubs and tech events around Africa during her time there. She identifies and lobbies for investment opportunities in Uganda.",
    "Stella is passionate about fintech and the way new technology can transform consumers’ everyday lives, as well as the way companies do business.",
    "As an Operations Lead, Stella manages fund reporting, portfolio companies’ valuations and data collection from both deal teams and portfolio companies. She also organizes, improves and automates the way MK Timothy operates internally. She also identifies and lobbies for investment opportunities in Uganda.",
    "In her spare time, Stella likes to go on weekend trips to explore cities around Europe or play volleyball. You can often find her delving into new consumer apps, (preferably in the financial services area) and trying out various savings tips.",
  ];

  const interests: string[] = [
    "Tourism",
    "Safari Lodges & Resorts",
    "Hotel Development",
    "Hospitality",
    "Real Estate Development",
    "Commercial Land Investments",
    "Business Acquisitions",
    "Joint Venture Partnerships",
  ];

  return (
    <TeamProfileTemplate
      name="Stella"
      role="Operations Lead"
      location="Sweden"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/78276d44230aadf750b8119dd04d614e856fd51b-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Stella;
