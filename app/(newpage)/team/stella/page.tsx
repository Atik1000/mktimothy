import { Metadata } from "next";
import Stella from "./Stella";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Stella" },

  description: "Stella holds an Accounting and Finance degree from Uppsala University, where she first developed her interest in venture capital, writing her thesis about ...",
  openGraph: {
    description: "Stella holds an Accounting and Finance degree from Uppsala University, where she first developed her interest in venture capital, writing her thesis about ...",
    title: "Mk Timothy & Company - Stella",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/78276d44230aadf750b8119dd04d614e856fd51b-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Stella",
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
      <Stella />
    </div>
  );
};

export default page;

