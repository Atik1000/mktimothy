import { Metadata } from "next";
import Luca from "./Luca";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Luca" },

  description: "Luca, a dynamic business developer in Spain, is a driving force at MK Timothy & Company, passionately connecting Spanish investors with the abundant opport...",
  openGraph: {
    description: "Luca, a dynamic business developer in Spain, is a driving force at MK Timothy & Company, passionately connecting Spanish investors with the abundant opport...",
    title: "Mk Timothy & Company - Luca",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/67603d565296249d2c7e22f47077076b2e9a033a-588x680.jpg",
        width: 1200,
        height: 630,
        alt: "Luca",
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
      <Luca />
    </div>
  );
};

export default page;

