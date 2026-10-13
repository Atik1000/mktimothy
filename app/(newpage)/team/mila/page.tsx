import { Metadata } from "next";
import Mila from "./Mila";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Mila" },

  description: "Mila, a dynamic finance expert based in Zurich, is on a mission to revolutionize investment strategies for her clients at MK Timothy & Company. With a shar...",
  openGraph: {
    description: "Mila, a dynamic finance expert based in Zurich, is on a mission to revolutionize investment strategies for her clients at MK Timothy & Company. With a shar...",
    title: "Mk Timothy & Company - Mila",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/7fd5f25e701e93e0f402efe0a10d135510b889c9-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Mila",
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
      <Mila />
    </div>
  );
};

export default page;

