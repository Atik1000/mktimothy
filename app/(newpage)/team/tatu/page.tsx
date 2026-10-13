import { Metadata } from "next";
import Tatu from "./Tatu";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Tatu" },

  description: "Driving Market Expansion. Building High-Performance Teams. Turning Opportunities into Growth. With over 8 years of progressive experience...",
  openGraph: {
    description: "Driving Market Expansion. Building High-Performance Teams. Turning Opportunities into Growth. With over 8 years of progressive experience...",
    title: "Mk Timothy & Company - Tatu",

    images: [
      {
        url: "/images/tatu.jpeg",
        width: 1200,
        height: 630,
        alt: "Tatu",
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
      <Tatu />
    </div>
  );
};

export default page;
