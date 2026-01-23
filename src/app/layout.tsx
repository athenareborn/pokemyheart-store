import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ultrararelove.com'),
  title: {
    default: "UltraRareLove - Premium Valentine's Cards",
    template: "%s | UltraRareLove",
  },
  description: "Premium holographic Valentine's cards that say 'I Choose You' - the perfect gift for your special someone.",
  keywords: ["valentine's card", "holographic card", "gift", "love", "collectible"],
  openGraph: {
    title: "UltraRareLove - Premium Valentine's Cards",
    description: "Premium holographic Valentine's cards that say 'I Choose You' - the perfect gift for your special someone.",
    type: "website",
    locale: "en_US",
    siteName: "UltraRareLove",
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: "UltraRareLove - Premium Valentine's Cards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UltraRareLove - Premium Valentine's Cards",
    description: "Premium holographic Valentine's cards that say 'I Choose You' - the perfect gift for your special someone.",
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
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
            --brand-50: oklch(0.971 0.014 343.198);
            --brand-100: oklch(0.948 0.028 342.258);
            --brand-200: oklch(0.899 0.061 343.231);
            --brand-300: oklch(0.823 0.12 346.018);
            --brand-400: oklch(0.718 0.202 349.761);
            --brand-500: oklch(0.656 0.241 354.308);
            --brand-600: oklch(0.592 0.249 0.584);
          }
          .theme-red {
            --brand-50: oklch(0.971 0.013 17.38);
            --brand-100: oklch(0.936 0.032 17.717);
            --brand-200: oklch(0.885 0.062 18.334);
            --brand-300: oklch(0.808 0.114 19.571);
            --brand-400: oklch(0.704 0.191 22.216);
            --brand-500: oklch(0.637 0.237 25.331);
            --brand-600: oklch(0.577 0.245 27.325);
          }
        `}} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <FacebookPixel />
        <GoogleAnalytics />
        <ThemeProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
