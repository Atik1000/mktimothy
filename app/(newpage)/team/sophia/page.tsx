import { Metadata } from "next";
import Sophia from "./Sophia";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Sophia" },

  description: "Prior to partnering with MK Timothy as Partner in January 2022, Sophia spent several years honing her role as one of Germany’s most respected business entr...",
  openGraph: {
    description: "Prior to partnering with MK Timothy as Partner in January 2022, Sophia spent several years honing her role as one of Germany’s most respected business entr...",
    title: "Mk Timothy & Company - Sophia",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/3bb52f4afffd860159e97f9de780030a51b3c8d2-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Sophia",
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
      <Sophia />
    </div>
  );
};

export default page;

