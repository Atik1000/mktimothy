import { Metadata } from "next";
import Tasha from "./Tasha";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Tasha Mugisha" },

  description: "Tasha Mugisha is a distinguished tourism and hospitality professional with extensive experience in destination development, tourism operations, and hospita...",
  openGraph: {
    description: "Tasha Mugisha is a distinguished tourism and hospitality professional with extensive experience in destination development, tourism operations, and hospita...",
    title: "Mk Timothy & Company - Tasha Mugisha",
    images: [
      {
        url: "/images/tashamugisha.jpg",
        width: 1200,
        height: 630,
        alt: "Tasha Mugisha",
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
      <Tasha />
    </div>
  );
};

export default page;
