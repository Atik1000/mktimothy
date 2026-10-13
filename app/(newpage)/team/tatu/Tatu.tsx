"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Tatu = () => {
  const bio = [
    "Driving Market Expansion. Building High-Performance Teams. Turning Opportunities into Growth.",
    "With over 8 years of progressive experience across internationally recognised, revenue-driven organisations, Tatu brings a strong track record in sales strategy, distribution, market expansion, team leadership, and revenue growth.",
    "As a partner of MK Timothy & Company, Tatu combines deep commercial experience with a strong understanding of how to take opportunities from concept to market, build effective sales structures, develop distribution channels, and create teams capable of delivering measurable results.",
    "From Concept to Market",
    "Tatu has been part of teams behind major commercial initiatives, including the launch of MTN MoMo Pay, the unbundling of MultiChoice starter packages, and the development of Smart Telecom's SIM-card distribution operations.",
    "These experiences provided hands-on expertise in building projects from the ground up, including recruitment, training, coaching, sales-force development, distribution structures, and market execution.",
    "Tatu holds a Bachelor's Degree in Information Technology from the University of St. Joseph Mbarara and professional certifications from The Chartered Institute of Marketing, bringing together commercial expertise and technology in an increasingly digital business environment.",
    "A Partner for Growth",
    "At MK Timothy & Company, Tatu contributes the commercial insight, market knowledge, and execution capability required to connect business opportunities with the right markets, partners, and distribution networks.",
    "Start together. Excel together.",
    "Connecting Opportunities. Building Markets. Creating Growth."
  ];

  const interests: string[] = [
    "Sales & Distribution Strategy",
    "Market Expansion & Penetration",
    "Revenue Growth",
    "Distributor & Channel Management",
    "Sales Team Development",
    "Market Intelligence & Data Analysis",
    "Training & Performance Management",
    "New Product & Market Launches",
    "Business Development",
    "Strategic Partnerships"
  ];

  return (
    <TeamProfileTemplate
      name="Tatu"
      role="Sales & Distribution Professional"
      location="Uganda"
      imageSrc="/images/tatu.jpeg"
      linkedInUrl=""
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Tatu;
