import { Metadata } from "next";
import Hannah from "./Hannah";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Hannah" },

  description: "Hannah, a dynamic business consultant from Mauritius, is a key partner at MK Timothy & Company, where she expertly bridges the gap between investors in Mau...",
  openGraph: {
    description: "Hannah, a dynamic business consultant from Mauritius, is a key partner at MK Timothy & Company, where she expertly bridges the gap between investors in Mau...",
    title: "Mk Timothy & Company - Hannah",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/cf50ab29554422ad6a0223ee54e7c56b5164a9db-2392x2392.jpg",
        width: 1200,
        height: 630,
        alt: "Hannah",
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
      <Hannah />
    </div>
  );
};

export default page;

