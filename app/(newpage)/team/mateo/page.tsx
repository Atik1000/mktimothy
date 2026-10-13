import { Metadata } from "next";
import Mateo from "./Mateo";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Mateo" },

  description: "Mateo, an ambitious industrial strategist based in Turkey, is at the forefront of driving industrialization efforts within Uganda through his role at MK Ti...",
  openGraph: {
    description: "Mateo, an ambitious industrial strategist based in Turkey, is at the forefront of driving industrialization efforts within Uganda through his role at MK Ti...",
    title: "Mk Timothy & Company - Mateo",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/beebb32457f3a27afb27dfd060b461fc11a96919-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Mateo",
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
      <Mateo />
    </div>
  );
};

export default page;

