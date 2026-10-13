"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const MkTimothy = () => {
  const bio = [
    "Musasizi Timothy Karubanga, widely known as MK Timothy, is a visionary entrepreneur, angel investor, strategic business leader, and investment facilitator dedicated to unlocking Africa's economic potential through innovation, strategic partnerships, and sustainable enterprise development. As the Founder and Managing Director of MK Timothy & Company, he has established a premier investment platform that connects high value businesses, large scale investment opportunities, and international investors, positioning Uganda as a leading destination for global capital.",
    "In addition to leading MK Timothy & Company, he is the Founder of Tim Tech Consults, an information technology company focused on delivering innovative digital solutions that enhance business efficiency, technology adoption, and enterprise growth. His entrepreneurial journey spans multiple industries, reflecting a deep commitment to building businesses that create lasting economic value.",
    "As an active angel investor, MK Timothy has supported and invested in promising ventures, including Homeduuka during its early growth as an online home grocery platform, Takeaway Uganda, and several other high potential enterprises. His investment philosophy is centred on identifying innovative businesses with scalable models and empowering visionary founders to achieve sustainable success.",
    "Recognised for his entrepreneurial foresight and strategic thinking, MK Timothy has developed extensive expertise across commercial real estate, hospitality, agriculture, mining, manufacturing, tourism, infrastructure, renewable energy, technology, and digital innovation. His ability to identify overlooked opportunities, structure commercially viable ventures, and connect entrepreneurs with strategic investors has established him as a trusted advisor to business owners, investors, and corporate leaders.",
    "A passionate advocate for foreign direct investment, MK Timothy has played an important role in attracting international entrepreneurs and investors to Uganda by showcasing the country's immense commercial potential and facilitating strategic partnerships across diverse sectors. Through his leadership, he continues to bridge the gap between local opportunities and global investment, fostering collaborations that generate sustainable economic growth.",
    "Beyond his commercial achievements, MK Timothy is deeply committed to youth empowerment and entrepreneurship development. He actively mentors young entrepreneurs, equipping them with the knowledge, strategic insight, and business networks required to build resilient enterprises and become future leaders. His dedication to nurturing entrepreneurial talent reflects his belief that Africa's greatest asset is its people and that sustainable development begins with investing in the next generation.",
    "His leadership philosophy is founded on integrity, innovation, excellence, and long term value creation. He believes that meaningful economic transformation is achieved through visionary leadership, strong partnerships, responsible investment, and businesses that create measurable social and economic impact.",
    "Driven by an unwavering commitment to progress, MK Timothy continues to champion transformative opportunities that strengthen industries, attract global investment, create employment, and contribute to Uganda's long term prosperity. His vision extends beyond building successful companies to shaping an internationally recognised investment ecosystem where entrepreneurs, investors, and communities thrive together.This version presents you as a founder, angel investor, technology entrepreneur, investment facilitator, youth mentor, and advocate for foreign investment while maintaining a polished executive tone suitable for company profiles, investor presentations, and corporate publications."
  ];

  const interests: string[] = [
    "Strategic Investment Advisory",
    "Angel Investing & Venture Capital",
    "Entrepreneurship",
    "Foreign Direct Investment (FDI)",
    "Information Technology & Digital Innovation"
  ];

  return (
    <TeamProfileTemplate
      name="Musasizi Timothy Karubanga"
      role="Founder"
      location="Uganda"
      imageSrc="/images/mktimothy.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default MkTimothy;
