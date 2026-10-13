import { Metadata } from "next";
import MkTimothy from "./MkTimothy";

export const metadata: Metadata = {
  title: { absolute: "Mk Timothy & Company - Musasizi Timothy Karubanga (MK Timothy)" },

  description: "Musasizi Timothy Karubanga, widely known as MK Timothy, is a visionary entrepreneur, angel investor, strategic business leader, and investment facilitator ...",
  openGraph: {
    description: "Musasizi Timothy Karubanga, widely known as MK Timothy, is a visionary entrepreneur, angel investor, strategic business leader, and investment facilitator ...",
    title: "Mk Timothy & Company - Musasizi Timothy Karubanga (MK Timothy)",
    images: [
      {
        url: "/images/mktimothy.jpg",
        width: 1200,
        height: 630,
        alt: "Musasizi Timothy Karubanga (MK Timothy)",
      },
    ],
  },
  icons: {
    icon: "/images/favicon.ico",
  },
};

const page = () => {
  return (
    <div>
      <MkTimothy />
    </div>
  );
};

export default page;
