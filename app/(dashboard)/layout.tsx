"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { Montserrat, Nunito, Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to update sidebar state based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Run on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (user.role === "USER" || user.role === "INVESTOR") {
        // Not admin, redirect to home or unauthorized page
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${nunito.variable} ${poppins.variable} ${montserrat.variable} font-nunito antialiased bg-bglight min-h-screen`}
        >
          <FullPageLoader message="Checking dashboard access..." />
        </body>
      </html>
    );
  }

  // Show nothing while redirecting
  if (!user || user.role === "USER") {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${nunito.variable} ${poppins.variable} ${montserrat.variable} font-nunito antialiased bg-bglight min-h-screen`}
        >
          <FullPageLoader message="Redirecting..." />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${poppins.variable} ${montserrat.variable} font-nunito antialiased bg-bglight`}
      >
        <div className="flex w-full h-screen overflow-hidden relative">
          {/* Sidebar */}
          <div
            className={`w-64 flex-shrink-0 fixed lg:sticky top-0 ${
              isSidebarOpen ? "left-0" : "-left-64"
            } transition-all duration-300 ease-in-out z-50 h-dvh bg-[#121214] flex flex-col overflow-y-auto thin-green-scrollbar`}
          >
            <Sidebar />
          </div>

          {/* Backdrop for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 min-h-dvh flex flex-col overflow-y-auto relative">
            <Topbar />
            {/* Mobile hamburger menu */}
            <div className="lg:hidden flex justify-start p-4 shrink-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex flex-col gap-1 focus:outline-none cursor-pointer p-2"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-0.5 rounded-full bg-white" />
                <div className="w-6 h-0.5 rounded-full bg-white" />
                <div className="w-6 h-0.5 rounded-full bg-white" />
              </button>
            </div>
            {/* flex column + min-h-0: lets full-height app pages (like /chats)
                fill EXACTLY the remaining space — no pixel-height guessing. */}
            <div className="flex-1 min-h-0 flex flex-col">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}

