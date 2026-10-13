import { Metadata } from "next";
import Umutesi from "./Umutesi";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Umutesi" },

  description: "Umutesi, based in South Africa, is a key partner at MK Timothy & Company, where she plays a significant role in connecting foreign investors with Uganda’s ...",
  openGraph: {
    description: "Umutesi, based in South Africa, is a key partner at MK Timothy & Company, where she plays a significant role in connecting foreign investors with Uganda’s ...",
    title: "Mk Timothy & Company - Umutesi",

    images: [
      {
        url: "/images/umutesi.jpg",
        width: 1200,
        height: 630,
        alt: "Umutesi",
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
      <Umutesi />
    </div>
  );
};

export default page;

