import { Montserrat, Nunito, Poppins } from "next/font/google";
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
  variable: "--aabbuu",
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/min-1.0.12.css" />
        {/* Runs on every REAL document load (inline scripts don't re-run on
            client-side navigations). useNewpageEngine reads this flag to
            decide whether booting the legacy DOM-manipulating animation
            engine is safe — it only is on a fresh document. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__mkHardLoad = true;`,
          }}
        />
      </head>
      <body
        className={` ${nunito.variable} ${poppins.variable} ${montserrat.variable}  antialiased bg-lightgray`}
      >
        {/* <HeaderTim /> */}

        <main className="flex-1">{children}</main>

        {/* 
          This script runs synchronously during the initial HTML parse, long before React 
          hydrates. It instantly hides the green loader on all sub-pages so users don't 
          see a green flash while waiting for the JS bundles to download on a live site.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (!document.querySelector('[data-component="HomepageLanding"]')) {
                var loader = document.getElementById('loader');
                if (loader) {
                  loader.style.cssText = 'display:none!important;opacity:0!important;pointer-events:none!important;';
                }
                var interloader = document.getElementById('interloader');
                if (interloader) {
                  interloader.style.cssText = 'display:none!important;';
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
