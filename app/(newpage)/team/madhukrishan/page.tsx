import { Metadata } from "next";
import MadhuKrishan from "./MadhuKrishan";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - His Eminence Prof. Dr. Madhu Krishan" },

  description: "His Eminence Prof. Dr. Madhu Krishan is a globally recognised humanitarian leader, peace ambassador, educator, eminent scientist, and international develop...",
  openGraph: {
    description: "His Eminence Prof. Dr. Madhu Krishan is a globally recognised humanitarian leader, peace ambassador, educator, eminent scientist, and international develop...",
    title: "Mk Timothy & Company - His Eminence Prof. Dr. Madhu Krishan",
    images: [
      {
        url: "/images/madhukrishan.jpg",
        width: 1200,
        height: 630,
        alt: "His Eminence Prof. Dr. Madhu Krishan",
      },
    ],
  },
  icons: {
    icon: "/images/favicon.ico",
  },
};

const page = () => {
  return (
    <div>
      <MadhuKrishan />
    </div>
  );
};

export default page;
