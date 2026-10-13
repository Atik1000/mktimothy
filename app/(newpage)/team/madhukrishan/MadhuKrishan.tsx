"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const MadhuKrishan = () => {
  const bio = [
    "His Eminence Prof. Dr. Madhu Krishan is a globally recognised humanitarian leader, peace ambassador, educator, eminent scientist, and international development strategist whose lifelong mission has been to advance global peace, sustainable development, education, and international cooperation. With over four decades of leadership across more than 120 countries, he has established an extraordinary legacy of building institutions that promote humanitarian service, academic excellence, diplomatic collaboration, and economic empowerment.",
    "As a Strategic Global Partner of MK Timothy & Company, Prof. Dr. Madhu Krishan brings an unparalleled international network spanning governments, diplomatic institutions, universities, global organisations, philanthropists, and business leaders. His global influence strengthens the company's mission of connecting high value investment opportunities in Uganda and Africa with credible international investors, strategic partners, and development institutions.",
    "Founder and Chairman of the Academy of Universal Global Peace (AUGP) and several internationally recognised institutions, he has dedicated his career to fostering peace, leadership, education, entrepreneurship, and sustainable development. His extensive work aligns closely with MK Timothy & Company's vision of promoting responsible investment, economic transformation, and cross border partnerships that create long term prosperity.",
    "Through this strategic partnership, Prof. Dr. Madhu Krishan contributes global insight, international credibility, and access to influential networks that enhance investment promotion, international collaboration, humanitarian initiatives, and sustainable enterprise development. His commitment to ethical leadership, innovation, and global cooperation reinforces the shared vision of creating lasting economic and social impact across Uganda, Africa, and the international community."
  ];

  const interests: string[] = [
    "Global Peace & Diplomacy",
    "Humanitarian Leadership",
    "International Relations",
    "Higher Education & Academic Leadership",
    "Sustainable Development (SDGs)",
    "Global Strategic Partnerships",
    "Philanthropy & Social Impact",
    "International Institutional Development",
    "Leadership & Governance",
    "Cross Border Collaboration"
  ];

  return (
    <TeamProfileTemplate
      name="His Eminence Prof. Dr. Madhu Krishan"
      role="Strategic Global Partner"
      location="Global"
      imageSrc="/images/madhukrishan.jpg"
      linkedInUrl="https://www.linkedin.com"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default MadhuKrishan;
