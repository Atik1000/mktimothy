import { Metadata } from "next";
import Arianna from "./Arianna";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Arianna" },

  description: "Arianna, based in Milan, is an invaluable partner at MK Timothy & Company, where she plays a pivotal role in connecting foreign investors with promising bu...",
  openGraph: {
    description: "Arianna, based in Milan, is an invaluable partner at MK Timothy & Company, where she plays a pivotal role in connecting foreign investors with promising bu...",
    title: "Mk Timothy & Company - Arianna",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/7fd5ea378dd634a9d784b912e4d4378e416ef600-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Arianna",
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
      <Arianna />
    </div>
  );
};

export default page;

