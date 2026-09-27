import { Cormorant_Garamond, Manrope, Geist_Mono } from "next/font/google";
import Providers from "@/app/providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import config from "@/lib/config";
import { getSiteSettings } from "@/lib/site/getSiteSettings";
import "./globals.css";
import TopSection from "@/components/layout/TopSection";
import SmoothScroll from "@/components/layout/SmoothScroll";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const body = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
