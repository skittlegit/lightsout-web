import type { Metadata, Viewport } from "next";
import { Archivo, Titillium_Web } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import CommandPaletteServer from "./components/CommandPaletteServer";
import SiteNav from "./components/SiteNav";
import Footer from "./components/Footer";
import { SEASON } from "@/lib/api";

// Wide display face for headings: the wdth axis gives the Formula1 Display feel.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

// Body face — the typeface formula1.com used for years.
const titillium = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `LightsOut · F1 ${SEASON}`,
    template: "%s · LightsOut",
  },
  description: `Formula 1 ${SEASON} season hub — calendar, standings, race results, driver head-to-heads, and Monte Carlo race forecasts.`,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    siteName: "LightsOut",
    type: "website",
    title: `LightsOut · F1 ${SEASON}`,
    description: "Every stat. Every race. Every prediction.",
  },
};

export const viewport: Viewport = {
  // Matches the red navigation bar.
  themeColor: "#e10600",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${titillium.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteNav />
        <div id="content" className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
        <Suspense fallback={null}>
          <CommandPaletteServer />
        </Suspense>
      </body>
    </html>
  );
}
