import { Cormorant_Garamond, Manrope, Geist_Mono } from "next/font/google";
import Providers from "@/app/providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import config from "@/lib/config";
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

export const metadata = {
  title: "FlexShop",
  description: "Premium fashion and lifestyle shopping",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <Providers imagekitUrlEndpoint={config.imagekitUrlEndpoint || ""}>
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
