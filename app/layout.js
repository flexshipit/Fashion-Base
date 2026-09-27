import localFont from "next/font/local";
import Providers from "@/app/providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import config from "@/lib/config";
import { getSiteSettings } from "@/lib/site/getSiteSettings";
import "./globals.css";
import TopSection from "@/components/layout/TopSection";
import SmoothScroll from "@/components/layout/SmoothScroll";

const display = localFont({
  src: "./fonts/cormorant-garamond-latin-wght-normal.woff2",
  variable: "--font-cormorant",
  weight: "300 700",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const body = localFont({
  src: "./fonts/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin-wght-normal.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const site = await getSiteSettings();

  return {
    title: site.siteName,
    description: site.description,
    icons: site.favicon?.url
      ? {
          icon: [{ url: site.favicon.url }],
          shortcut: [{ url: site.favicon.url }],
          apple: [{ url: site.favicon.url }],
        }
      : undefined,
  };
}

export default async function RootLayout({ children }) {
  const site = await getSiteSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <Providers
          imagekitUrlEndpoint={config.imagekitUrlEndpoint || ""}
          site={site}
        >
          <SmoothScroll>
            <div className="store-surface flex min-h-screen flex-col">
              <TopSection />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
