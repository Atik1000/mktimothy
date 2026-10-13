"use client";
import React from "react";
import TeamProfileTemplate from "@/components/newpage/TeamProfileTemplate";

const Mila = () => {
  const bio = [
    "Mila, a dynamic finance expert based in Zurich, is on a mission to revolutionize investment strategies for her clients at MK Timothy & Company. With a sharp focus on innovative financial solutions, she specializes in vital instruments like Letters of Credit, Standby Letters of Credit, and Bank Guarantees. Mila’s in-depth knowledge of these tools empowers investors to navigate the complexities of international finance, minimizing risks and maximizing returns in emerging markets like Uganda.", 
    "At MK Timothy & Company, Mila serves as a crucial link between investors and tailored financial solutions, offering services such as Tender Guarantees, Proof of Funds, and Pre-Advice Services. She is dedicated to ensuring that her clients are fully equipped to tackle the intricacies of global investment, providing them with the necessary documentation and expert guidance. Her insights into Blocked Funds Services and Bank Comfort Letters help clients streamline their financial operations and build confidence in their investment strategies.", 
    "Mila is passionate about driving financial inclusivity and believes that the right financial solutions can unlock transformative opportunities. By promoting essential instruments like Ready, Willing,", 
    "and Able Letters and Wavelink services, she helps investors seize new possibilities while contributing to sustainable growth in Uganda. With her commitment to excellence, Mila is positioning MK Timothy & Company as the go-to partner for investors eager to explore the world of international finance and create lasting impact."
  ];

  const interests: string[] = [
    "Healthcare", 
    "Pharma", 
    "Medical Equipment", 
    "Biotech", 
    "Education Projects", 
    "ICT", 
    "Innovation", 
    "Joint Venture Partnerships"
  ];

  return (
    <TeamProfileTemplate
      name="Mila"
      role="Partner"
      location="Switzerland"
      imageSrc="https://cdn.sanity.io/images/doauu19r/production/7fd5f25e701e93e0f402efe0a10d135510b889c9-1000x1000.jpg"
      linkedInUrl="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/"
      emailUrl="mailto:hi@mktimothy.com"
      bioParagraphs={bio}
      interests={interests}
    />
  );
};

export default Mila;
