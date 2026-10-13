import { Metadata } from "next";
import Sandra from "./Sandra";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Ankunda Sandra" },
  
  description: "Ankunda Sandra holds a degree from Ndejje University, where she developed a strong foundation in business management, human resource development, and entre...",
  openGraph: {
    description: "Ankunda Sandra holds a degree from Ndejje University, where she developed a strong foundation in business management, human resource development, and entre...",
    title: "Mk Timothy & Company - Ankunda Sandra",

    images: [
      {
        url: "/images/sandra.jpeg",
        width: 1200,
        height: 630,
        alt: "Ankunda Sandra",
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
      <Sandra />
    </div>
  );
};

export default page;
