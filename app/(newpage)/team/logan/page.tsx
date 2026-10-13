import { Metadata } from "next";
import Logan from "./Logan";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Logan" },

  description: "Logan, the Operating Partner for Business and Corporate Development at MK Timothy & Company in Japan, is instrumental &amp; in fostering strategic partners...",
  openGraph: {
    description: "Logan, the Operating Partner for Business and Corporate Development at MK Timothy & Company in Japan, is instrumental &amp; in fostering strategic partners...",
    title: "Mk Timothy & Company - Logan",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/fae42324564549d6af7f90dba72a3c53e1548205-1603x1600.jpg",
        width: 1200,
        height: 630,
        alt: "Logan",
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
      <Logan />
    </div>
  );
};

export default page;

