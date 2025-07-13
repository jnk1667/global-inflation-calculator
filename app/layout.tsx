import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
  description:
    "Calculate historical inflation and purchasing power across USD, GBP, EUR, CAD, AUD from 1913 to 2025. See how money value changes over time with real economic data.",
  keywords:
    "inflation calculator, purchasing power, historical inflation, currency calculator, CPI, economic data, USD inflation, GBP inflation, EUR inflation, CAD inflation, AUD inflation",
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description:
      "Calculate historical inflation and purchasing power across USD, GBP, EUR, CAD, AUD from 1913 to 2025. See how money value changes over time with real economic data.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com",
    siteName: "Global Inflation Calculator",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/globe-icon.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description:
      "Calculate historical inflation and purchasing power across USD, GBP, EUR, CAD, AUD from 1913 to 2025. See how money value changes over time with real economic data.",
    images: ["/images/globe-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://www.globalinflationcalculator.com/" />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
