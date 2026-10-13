import { Metadata } from "next";
import Amelia from "./Amelia";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Amelia" },

  description: "Amelia, operating from Osaka, is a key partner at MK Timothy & Company, driving the company",
  openGraph: {
    description: "Amelia, operating from Osaka, is a key partner at MK Timothy & Company, driving the company",
    title: "Mk Timothy & Company - Amelia",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/d9de592d419e82fb16dce0707f375de994b772bb-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Amelia",
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
      <Amelia />
    </div>
  );
};

export default page;

