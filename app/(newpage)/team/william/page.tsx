import { Metadata } from "next";
import William from "./William";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - William" },

  description: "Graduating with a B.S. and Commission from the United States Coast Guard Academy, William started his career as an afloat officer in the Pacific waters of ...",
  openGraph: {
    description: "Graduating with a B.S. and Commission from the United States Coast Guard Academy, William started his career as an afloat officer in the Pacific waters of ...",
    title: "Mk Timothy & Company - William",

    images: [
      {
        url: "https://cdn.sanity.io/images/doauu19r/production/1b3c289d499b9b243ad3e2a4447862f7469ae488-916x1280.jpg",
        width: 1200,
        height: 630,
        alt: "William",
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
      <William />
    </div>
  );
};

export default page;

