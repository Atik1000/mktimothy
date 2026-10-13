import { Metadata } from "next";
import Emma from "./Emma";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Emma" },

  description: "Emmanuel, a strategic partner at MK Timothy & Company based in Johannesburg, is dedicated to connecting South African investors with lucrative opportunitie...",
  openGraph: {
    description: "Emmanuel, a strategic partner at MK Timothy & Company based in Johannesburg, is dedicated to connecting South African investors with lucrative opportunitie...",
    title: "Mk Timothy & Company - Emma",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/e3648464ad1167efbba189daaaf76491b5236166-1211x1211.jpg",
        width: 1200,
        height: 630,
        alt: "Emma",
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
      <Emma />
    </div>
  );
};

export default page;

