import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "./components/SiteNav";
import Footer from "./components/Footer";
import { SEASON } from "@/lib/api";

// Editorial serif for headlines and big numbers.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

// Small-caps labels and timing data.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
  // Matches --color-paper.
  themeColor: "#faf7f2",
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
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteNav />
        <div id="content" className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
