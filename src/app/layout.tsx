import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "UltraRareLove - Premium Valentine's Cards",
    template: "%s | UltraRareLove",
  },
  description: "Premium holographic Valentine's cards that say 'I Choose You' - the perfect gift for your special someone.",
  keywords: ["valentine's card", "holographic card", "gift", "love", "collectible"],
  openGraph: {
    title: "UltraRareLove - Premium Valentine's Cards",
    description: "Premium holographic Valentine's cards that say 'I Choose You'",
    type: "website",
    locale: "en_US",
    siteName: "UltraRareLove",
  },
  twitter: {
    card: "summary_large_image",
    title: "UltraRareLove - Premium Valentine's Cards",
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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-brand-50: #fef2f2;
            --color-brand-100: #fee2e2;
            --color-brand-200: #fecaca;
            --color-brand-300: #fca5a5;
            --color-brand-400: #f87171;
            --color-brand-500: #ef4444;
            --color-brand-600: #dc2626;
          }
        `}} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
