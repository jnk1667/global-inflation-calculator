import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Global Inflation Calculator - Calculate Historical Inflation Impact",
  description:
    "Calculate how inflation affects purchasing power across different currencies and time periods. Compare USD, EUR, GBP, CAD, and AUD inflation rates with historical data.",
  keywords:
    "inflation calculator, purchasing power, currency inflation, historical inflation rates, USD EUR GBP inflation",
  authors: [{ name: "Global Inflation Calculator" }],
  openGraph: {
    title: "Global Inflation Calculator",
    description: "Calculate historical inflation impact across multiple currencies",
    type: "website",
  },
  robots: "index, follow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
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

        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Search Console Verification */}
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ""} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
