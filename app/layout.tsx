import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Script from "next/script"
import Link from "next/link"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const siteUrl = "https://www.globalinflationcalculator.com/"

export const metadata: Metadata = {
  title: "Global Inflation Calculator – For Inflation & Purchasing Power",
  description:
    "Calculate historical inflation and purchasing power across multiple currencies from 1913 using data sourced from official government sources.",
  keywords: [
    "inflation calculator",
    "purchasing power",
    "historical inflation",
    "currency calculator",
    "CPI",
    "consumer price index",
    "economic data",
    "financial calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Global Inflation Calculator - Historical Inflation & Purchasing Power Calculator",
    description:
      "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present. Free inflation calculator with data from official government sources.",
    url: siteUrl,
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "/images/globe-icon.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Inflation Calculator - Historical Inflation & Purchasing Power Calculator",
    description:
      "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present. Free inflation calculator with data from official government sources.",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
                  page_location: window.location.href,
                  page_title: document.title,
                });
              `}
            </Script>
          </>
        )}

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Additional meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Theme Toggle - Fixed Position */}
          <div className="fixed top-4 left-4 z-50">
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-background/95 backdrop-blur-sm border rounded-full px-3 sm:px-6 py-2 shadow-lg max-w-[90vw] sm:max-w-none">
            <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
              <Link href="/" className="font-medium hover:text-primary transition-colors whitespace-nowrap">
                Home
              </Link>
              <Link href="/about" className="font-medium hover:text-primary transition-colors whitespace-nowrap">
                About
              </Link>
              <Link href="/privacy" className="font-medium hover:text-primary transition-colors whitespace-nowrap">
                Privacy
              </Link>
              <Link href="/terms" className="font-medium hover:text-primary transition-colors whitespace-nowrap">
                Terms
              </Link>
            </div>
          </nav>

          {children}
          <Toaster />
        </ThemeProvider>

        {/* Schema.org structured data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Global Inflation Calculator",
              url: siteUrl,
              logo: `${siteUrl}/images/globe-icon.png`,
              description: "Free inflation calculator with historical data from official government sources",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "English",
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
