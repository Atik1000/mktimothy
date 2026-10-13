import { Metadata } from "next";
import Jacob from "./Jacob";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Jacob" },

  description: "Jacob, an innovative entrepreneur from Amsterdam, plays a vital role at MK Timothy & Company by connecting Dutch investors with promising opportunities in ...",
  openGraph: {
    description: "Jacob, an innovative entrepreneur from Amsterdam, plays a vital role at MK Timothy & Company by connecting Dutch investors with promising opportunities in ...",
    title: "Mk Timothy & Company - Jacob",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/6938de4f0d91cbdff44d66f7ad08397bae4fe5a8-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Jacob",
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
      <Jacob />
    </div>
  );
};

export default page;

