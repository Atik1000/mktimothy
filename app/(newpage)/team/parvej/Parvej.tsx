"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Parvej = () => {

    const bio = [
      "Parvej Husen Talukder is a Partner at Mk Timothy & Company with expertise in digital strategy, software development, and online brand development. He contributes to the firm's digital initiatives, helping strengthen its global presence through technology and effective digital communication.",
    
      "He is currently pursuing a Bachelor of Science in Computer Science and Engineering (CSE) at Sylhet International University, Bangladesh. His academic background, combined with practical experience in web development and digital marketing, enables him to bridge technology with business development.",
    
      "At Mk Timothy & Company, Parvej collaborates on digital transformation, branding, and strategic communications. He is committed to developing innovative digital solutions that support investor engagement, business growth, and international collaboration."
    ];
    
    const interests: string[] = [
      "Digital Strategy",
      "Web Development",
      "Technology",
      "Digital Marketing",
      "Brand Development",
      "Innovation",
      "Business Development"
    ];

    return (
        <TeamProfileTemplate
          name="Parvej Husen Talukder"
          role="Partner"
          location="Bangladesh"
          imageSrc="/images/parvej.jpg"
          linkedInUrl="https://www.linkedin.com/in/parvejhusentalukder/"
          emailUrl="mailto:hi@mktimothy.com"
          bioParagraphs={bio}
          interests={interests}
        />
  );
};

export default Parvej;