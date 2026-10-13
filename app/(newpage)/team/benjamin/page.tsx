import { Metadata } from "next";
import Benjamin from "./Benjamin";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Benjamin" },

  description: "Meet Benjamin, a dynamic tech analyst from Cape Town, South Africa, who is revolutionizing investment opportunities at MK Timothy & Company. With his finge...",
  openGraph: {
    description: "Meet Benjamin, a dynamic tech analyst from Cape Town, South Africa, who is revolutionizing investment opportunities at MK Timothy & Company. With his finge...",
    title: "Mk Timothy & Company - Benjamin",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/933c228e2528ea4717df297adac1c800baad997f-500x500.jpg",
        width: 1200,
        height: 630,
        alt: "Benjamin",
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
      <Benjamin />
    </div>
  );
};

export default page;

