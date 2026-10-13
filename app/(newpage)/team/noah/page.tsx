import { Metadata } from "next";
import Noah from "./Noah";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Noah" },

  description: "Noah started his career as a web designer and developer in the 90s, but has spent the last 20+ years as a product leader across Europe and the US, building...",
  openGraph: {
    description: "Noah started his career as a web designer and developer in the 90s, but has spent the last 20+ years as a product leader across Europe and the US, building...",
    title: "Mk Timothy & Company - Noah",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/d1be4a94b63aa9070f7e006b881a7fd623fde3a8-3000x3000.jpg",
        width: 1200,
        height: 630,
        alt: "Noah",
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
      <Noah />
    </div>
  );
};

export default page;

