"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Sandra = () => {

  const bio = [
    "Ankunda Sandra holds a degree from Ndejje University, where she developed a strong foundation in business management, human resource development, and entrepreneurship. From an early stage, she demonstrated exceptional leadership, organizational ability, and a passion for building businesses that create meaningful economic opportunities. Her academic journey nurtured a deep commitment to empowering people, supporting enterprise growth, and contributing to Uganda's long-term development.",
  
    "Sandra is the Founder of Hastsy Sourcing, a labour recruitment company dedicated to connecting highly skilled professionals with employers across diverse industries. Through this venture, she has built extensive expertise in talent acquisition, workforce planning, client relationship management, and recruitment strategy, delivering reliable staffing solutions that help businesses grow while creating sustainable employment opportunities.",
  
    "Her dedication to leadership and community transformation earned her a Certificate as the Best Women Empowerment Leader and Peace Builder from an American university, recognizing her outstanding commitment to empowering communities, promoting peace, and inspiring positive social impact through responsible leadership.",
  
    "At MK Timothy & Company, Sandra serves as Business Development and Operations Manager, where she leads strategic project coordination, operational planning, international partnerships, and investor engagement. She works closely with both local and international stakeholders to identify high-value business opportunities, facilitate cross-border collaborations, and showcase Uganda as one of Africa's most promising investment destinations. Her strategic mindset and operational excellence have made her a trusted contributor to the company's continued growth.",
  
    "Sandra is deeply passionate about Uganda and firmly believes that the country's abundant natural resources, entrepreneurial talent, and expanding economy present extraordinary opportunities for global investors. She is committed to promoting Uganda on the international stage, building lasting partnerships, and attracting investments that create employment, strengthen local industries, and contribute to sustainable national development.",
  
    "Outside her professional responsibilities, Sandra enjoys studying global business trends, leadership, entrepreneurship, and economic development. She actively networks with business leaders and innovators, continually seeking fresh ideas and strategic partnerships that deliver lasting value for investors while accelerating Uganda's economic transformation."
  ];

  const interests: string[] = [
    "Mfg", 
    "Industrial Parks", 
    "ICT", 
    "Renewable Energy", 
    "Logistics & Warehousing", 
    "Joint Venture Partnerships", 
    "Export & Intl Trade", 
    "Commercial Land Investments"
  ];

  return (
    <TeamProfileTemplate
      name="Ankunda Sandra"
      role="Partner"
      location=""
      imageSrc= "/images/sandra.jpeg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Sandra;
