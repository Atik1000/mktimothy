import Footer from "@/components/globals/Footer";
import Header from "@/components/globals/Header";
import { Providers } from "@/lib/providers";
import type { Metadata } from "next";
import { Montserrat, Nunito, Poppins } from "next/font/google";
import UnderConstructionPopup from "@/components/globals/UnderConstructionPopup";
import CookieConsent from "@/components/globals/CookieConsent";
import CanonicalUrl from "@/components/globals/CanonicalUrl";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Mk Timothy & Company",
    template: "%s | Mk Timothy & Company",
  },
  description:
    "Your Gateway to Investing in Uganda. Connecting global entrepreneurs with high-growth ventures that drive returns and impact.",
  keywords: [
    "business brokerage",
    "investment",
    "Uganda",
    "East Africa",
    "businesses for sale",
    "Mk Timothy & Company",
  ],
  authors: [{ name: "Mk Timothy & Company Team" }],
  creator: "Mk Timothy & Company",
  publisher: "Mk Timothy & Company",
  metadataBase: new URL("https://www.mktimothy.com"), // Replace with your actual domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.mktimothy.com", // Replace with your actual domain
    title: "Mk Timothy & Company",
    description:
      "Your Gateway to Investing in Uganda. Connecting global entrepreneurs with high-growth ventures that drive returns and impact.",
    siteName: "Mk Timothy & Company",
    images: [
      {
        url: "https://www.mktimothy.com/images/meta_compressed.jpg", // WhatsApp strongly prefers PNG/JPG over WebP
        width: 1200,
        height: 630,
        alt: "Mk Timothy & Company - Business Brokerage & Investment Advisory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mk Timothy & Company | Investment & Business Advisory",
    description:
      "Your Gateway to Investing in Uganda. Connecting global entrepreneurs with high-growth ventures that drive returns and impact.",
    images: ["https://www.mktimothy.com/images/meta_compressed.jpg"], // Twitter also prefers PNG/JPG
    creator: "@MKTimothy_", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: [
      { url: "/icon.png" } // Fallback to icon.png if no apple touch icon exists
    ]
  },
  verification: {
    google: "your-google-verification-code", // Replace with your Google verification code
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "business",
  classification: "Investment & Business Advisory",
  referrer: "origin-when-cross-origin",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <CanonicalUrl />
      </head>
      <body
        suppressHydrationWarning
        className={`${nunito.variable} ${poppins.variable} ${montserrat.variable} font-sofia antialiased bg-bglight`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MK Timothy & Company",
              url: "https://www.mktimothy.com",
              logo: "https://www.mktimothy.com/icon.png",
              sameAs: [
                "https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/",
                "https://twitter.com/MKTimothy_"
              ]
            })
          }}
        />
        <UnderConstructionPopup />
        <CookieConsent />
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
