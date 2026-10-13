import { Metadata } from "next";
import Parvej from "./Parvej";

export const metadata: Metadata = {
    
  title: { absolute: "Mk Timothy & Company - Parvej Husen Talukder" },

  description: "Parvej Husen Talukder is a Partner at Mk Timothy & Company with expertise in digital strategy, software development, and online brand development. He contr...",
  openGraph: {
    description: "Parvej Husen Talukder is a Partner at Mk Timothy & Company with expertise in digital strategy, software development, and online brand development. He contr...",

    title: "Mk Timothy & Company - Parvej Husen Talukder",
    
    images: [
      {
        url: "/images/parvej.jpg",
        width: 1200,
        height: 630,
        alt: "Parvej Husen Talukder",
      },
    ],
  },
  icons: {
    icon: "/images/favicon.ico",
  },
};

const Page = () => {
  return (
    <div>
      <Parvej />
    </div>
  );
};

export default Page;