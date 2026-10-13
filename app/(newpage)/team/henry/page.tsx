import { Metadata } from "next";
import Henry from "./Henry";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Henry" },

  description: "Magandaazi Henry Seguya is a Ugandan entrepreneur, tourism professional, and financial literacy advocate with a background in commerce, banking, and busine...",
  openGraph: {
    description: "Magandaazi Henry Seguya is a Ugandan entrepreneur, tourism professional, and financial literacy advocate with a background in commerce, banking, and busine...",
    title: "Mk Timothy & Company - Henry",

    images: [
      {
        url: "/images/henry.jpg",
        width: 1200,
        height: 630,
        alt: "Henry",
      },
    ],
  },
  icons: {
    icon: "/images/favicon.ico", 
  },
};
const page = () => {
  return (
    <div>
      <Henry />
    </div>
  );
};

export default page;

