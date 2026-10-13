import { Metadata } from "next";
import Victoria from "./Victoria";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Victoria" },

  description: "Prior to partnering with MK Timothy, Victoria worked at several startups channeling her passion for creativity and innovation. She started out at Caterwing...",
  openGraph: {
    description: "Prior to partnering with MK Timothy, Victoria worked at several startups channeling her passion for creativity and innovation. She started out at Caterwing...",
    title: "Mk Timothy & Company - Victoria",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/2985d3b280354e730f5c955ccc8fde186c52cef8-408x408.jpg",
        width: 1200,
        height: 630,
        alt: "Victoria",
      },
    ],
  },
  icons: {
    icon: "/images/favicon.ico", // adjust path if needed
  },
};
const page = () => {
  return (
    <div>
      <Victoria />
    </div>
  );
};

export default page;

