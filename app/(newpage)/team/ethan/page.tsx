import { Metadata } from "next";
import Ethan from "./Ethan";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Ethan" },
  description: "Ethan",
  openGraph: {
    title: "Mk Timothy & Company - Ethan",
    description: "Ethan",
    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/7bb964a17cbe65f01667f774fb7750175324ee89-547x547.jpg",
        width: 1200,
        height: 630,
        alt: "Ethan",
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
      <Ethan />
    </div>
  );
};

export default page;
