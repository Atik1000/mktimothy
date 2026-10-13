"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import { queryClient } from "../react-query/queryClient";
import { store } from "../redux/store";
import { AuthProvider } from "./auth-provider";
import { GlobalCallChat } from "@/components/globals/GlobalCallChat";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <GlobalCallChat />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#2C2C2C",
                color: "#fff",
                border: "1px solid #4A5568",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          {/* Show React Query DevTools in development */}
          {/* {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )} */}
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default Providers;

