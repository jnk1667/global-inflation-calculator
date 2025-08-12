import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Global Inflation Calculator - Inflation & Purchasing Power",
    template: "%s | Global Inflation Calculator",
  },
  description:
    "Calculate historical inflation and purchasing power across multiple currencies with official data from as far as 1913 to the present day.",
  keywords: [
    "inflation calculator",
    "purchasing power",
    "historical inflation",
    "currency calculator",
    "CPI calculator",
    "inflation rate",
    "money value",
    "economic data",
    "financial calculator",
    "cost of living",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description:
      "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present. Compare USD, GBP, EUR, CAD, AUD, CHF, JPY with real government data.",
    url: "/",
    siteName: "Global Inflation Calculator",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200&text=Global+Inflation+Calculator",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator - Historical Currency Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description: "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present.",
    images: ["/placeholder.svg?height=630&width=1200&text=Global+Inflation+Calculator"],
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
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* Google Analytics */}
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* Theme Toggle - Top Left */}
          <div className="fixed top-4 left-4 z-50">
            <ThemeToggle />
          </div>

          {/* Navigation - Center Top */}
          <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-6">
                <Link href="/" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <Link
                  href="/salary-calculator"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Salary Calculator
                </Link>
                <Link href="/about" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  About
                </Link>
              </div>
            </div>
          </nav>

          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
