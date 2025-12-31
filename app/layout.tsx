import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import Script from "next/script"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

function getMetadataBaseUrl(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const fallbackUrl = "https://www.globalinflationcalculator.com"

  // If no site URL is provided, use fallback
  if (!siteUrl) {
    return new URL(fallbackUrl)
  }

  // Try to construct URL, fallback if invalid
  try {
    return new URL(siteUrl)
  } catch {
    return new URL(fallbackUrl)
  }
}

export const metadata: Metadata = {
  title: {
    default: "Global Inflation Calculator - Inflation & Purchasing Power",
    template: "%s | Global Inflation Calculator",
  },
  description:
    "Calculate historical inflation and purchasing power across multiple currencies. USD, GBP, CAD, AUD, CHF, JPY from 1913; EUR from 1996; NZD from 1960. Official government data.",
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
  metadataBase: getMetadataBaseUrl(),
  alternates: {
    canonical: "/",
  },
  other: {
    "llms-txt": "/llms.txt",
  },
  openGraph: {
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description:
      "Calculate historical inflation across multiple currencies. USD, GBP, CAD from 1913; EUR from 1996; NZD from 1960. Real government data.",
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
    description: "Calculate historical inflation across multiple currencies. USD, GBP, CAD from 1913; EUR from 1996.",
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
    other: [{ rel: "manifest", url: "/manifest.json" }],
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
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly site information" />
      </head>
      <body className={inter.className}>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* Theme Toggle - Top Left */}
          <div className="fixed top-4 left-4 z-50">
            <ThemeToggle />
          </div>

          {/* Navigation - Center Top - Moved lower to avoid overlap */}
          <nav className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 shadow-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800/90">
              <div className="flex items-center space-x-3 sm:space-x-6">
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Home
                </Link>
                <Link
                  href="/deflation-calculator"
                  className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Deflation Calculator
                </Link>
                <Link
                  href="/charts"
                  className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Charts
                </Link>

                {/* Black Circle Dropdown */}
                <div className="relative group">
                  <div className="w-6 h-6 bg-black rounded-full cursor-pointer hover:bg-gray-800 transition-colors"></div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-8 right-0 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800/95 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                    <div className="py-2">
                      <Link
                        href="/ppp-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        PPP Calculator
                      </Link>
                      <Link
                        href="/auto-loan-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Auto Loan Calculator
                      </Link>
                      <Link
                        href="/student-loan-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Student Loan Calculator
                      </Link>
                      <Link
                        href="/salary-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Salary Calculator
                      </Link>
                      <Link
                        href="/mortgage-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Mortgage Calculator
                      </Link>
                      <Link
                        href="/roi-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        ROI Calculator
                      </Link>
                      <Link
                        href="/emergency-fund-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Emergency Fund Calculator
                      </Link>
                      <Link
                        href="/budget-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        50/30/20 Budget Calculator
                      </Link>
                      <Link
                        href="/legacy-planner"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Legacy Planner
                      </Link>
                      <Link
                        href="/retirement-calculator"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Retirement Calculator
                      </Link>
                      <Link
                        href="/about"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        About
                      </Link>
                      <Link
                        href="/privacy"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href="/terms"
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Terms of Service
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {children}
          <Toaster />
        </ThemeProvider>

        <SpeedInsights />
      </body>
    </html>
  )
}
