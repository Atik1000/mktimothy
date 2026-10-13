import { Metadata } from "next";
import Chole from "./Chole";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Chloe" },

  description: "Chloe, an influential partner at MK Timothy & Company, hails from Greece and is committed to unlocking the vast investment potential of Uganda for European...",
  openGraph: {
    description: "Chloe, an influential partner at MK Timothy & Company, hails from Greece and is committed to unlocking the vast investment potential of Uganda for European...",
    title: "Mk Timothy & Company - Chloe",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/38d037cfcb7ead37c0328c9faa3b9c608e56d79f-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Chloe",
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
      <Chole />
    </div>
  );
};

export default page;

