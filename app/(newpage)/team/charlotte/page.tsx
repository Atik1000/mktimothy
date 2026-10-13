import { Metadata } from "next";
import Charlotte from "./Charlotte";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Charlotte" },

  description: "Charlotte, based in Germany, is a key partner at MK Timothy & Company, specializing in connecting European investors with promising opportunities in Uganda...",
  openGraph: {
    description: "Charlotte, based in Germany, is a key partner at MK Timothy & Company, specializing in connecting European investors with promising opportunities in Uganda...",
    title: "Mk Timothy & Company - Charlotte",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/bbc26d75e00bc763936f819c5823dcff8beeb821-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Charlotte",
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
      <Charlotte />
    </div>
  );
};

export default page;

