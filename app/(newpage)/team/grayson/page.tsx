import { Metadata } from "next";
import Grayson from "./Grayson";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Grayson" },

  description: "Grayson, born and raised in northern Sweden, brings a unique perspective to MK Timothy & Company as an economist. His deep understanding of economic princi...",
  openGraph: {
    description: "Grayson, born and raised in northern Sweden, brings a unique perspective to MK Timothy & Company as an economist. His deep understanding of economic princi...",
    title: "Mk Timothy & Company - Grayson",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/34b8a3847e68552550a375763e7cdea84575dbef-1999x1804.jpg",
        width: 1200,
        height: 630,
        alt: "Grayson",
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
      <Grayson />
    </div>
  );
};

export default page;

