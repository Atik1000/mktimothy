import { Metadata } from "next";
import Zoey from "./Zoey";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Zoey" },

  description: "Prior to partnering with MK Timothy, Zoey worked for more than 20 years as a bilingual assistant in South Africa, with roles in sectors as diverse as luxur...",
  openGraph: {
    description: "Prior to partnering with MK Timothy, Zoey worked for more than 20 years as a bilingual assistant in South Africa, with roles in sectors as diverse as luxur...",
    title: "Mk Timothy & Company - Zoey",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/6c05733cf79cd286fd919933487168f4895ada7d-433x552.jpg",
        width: 1200,
        height: 630,
        alt: "Zoey",
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
      <Zoey />
    </div>
  );
};

export default page;

