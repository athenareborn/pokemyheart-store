import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Pokemyheart - Premium Valentine's Cards",
    template: "%s | Pokemyheart",
  },
  description: "Premium holographic Valentine's cards that say 'I Choose You' - the perfect gift for your special someone.",
  keywords: ["valentine's card", "holographic card", "gift", "love", "collectible"],
  openGraph: {
    title: "Pokemyheart - Premium Valentine's Cards",
    description: "Premium holographic Valentine's cards that say 'I Choose You'",
    type: "website",
    locale: "en_US",
    siteName: "Pokemyheart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokemyheart - Premium Valentine's Cards",
    description: "Premium holographic Valentine's cards that say 'I Choose You'",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <FacebookPixel />
        <ThemeProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
