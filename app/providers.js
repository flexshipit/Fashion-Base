"use client";

import { useState } from "react";
import { ImageKitProvider } from "@imagekit/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Toaster from "@/components/ui/Toaster";

export default function Providers({ children, imagekitUrlEndpoint = "" }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ImageKitProvider urlEndpoint={imagekitUrlEndpoint}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="light"
        enableSystem={false}
        themes={["light", "dark"]}
      >
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" />
        </QueryClientProvider>
      </ThemeProvider>
    </ImageKitProvider>
  );
}
