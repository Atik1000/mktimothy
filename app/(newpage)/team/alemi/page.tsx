import { Metadata } from "next";
import Alemi from "./Alemi";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Alemi James" },

  description: "Alemi James is a highly accomplished automotive professional, real estate expert, and international trade specialist with over 18 years of experience spann...",
  openGraph: {
    description: "Alemi James is a highly accomplished automotive professional, real estate expert, and international trade specialist with over 18 years of experience spann...",
    title: "Mk Timothy & Company - Alemi James",
    images: [
      {
        url: "/images/alemijames.jpg",
        width: 1200,
        height: 630,
        alt: "Alemi James",
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
      <Alemi />
    </div>
  );
};

export default page;
