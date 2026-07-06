import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import CommandPaletteServer from "./components/CommandPaletteServer";
import { SEASON } from "@/lib/api";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

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
  // Matches --color-paper; the dark theme is a user toggle (class-based), not
  // OS-derived, so a single light chrome color is the honest default.
  themeColor: "#faf7f2",
};

// Runs before first paint. The site is light by default and ignores OS
// preference — it only goes dark if the user has explicitly toggled it.
const themeScript = `(function(){try{if(localStorage.getItem('lo:theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <CommandPaletteServer />
        </Suspense>
      </body>
    </html>
  );
}
