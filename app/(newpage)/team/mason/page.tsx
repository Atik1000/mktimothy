import { Metadata } from "next";
import Mason from "./Mason";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Mason" },

  description: "Mason, a savvy freelancer based in Kenya, is making waves as an independent investment partner, connecting investors with lucrative opportunities in Uganda...",
  openGraph: {
    description: "Mason, a savvy freelancer based in Kenya, is making waves as an independent investment partner, connecting investors with lucrative opportunities in Uganda...",
    title: "Mk Timothy & Company - Mason",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/3d58a030165bbae4b904ec2e9ff9d30a5d3683e7-1000x1000.jpg",
        width: 1200,
        height: 630,
        alt: "Mason",
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
      <Mason />
    </div>
  );
};

export default page;

