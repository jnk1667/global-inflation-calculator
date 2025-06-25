import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Global Inflation Calculator - Compare Currency Values Since 1913",
  description: "Free inflation calculator for USD, GBP, EUR, CAD, AUD with 100+ years of data - Updated June 2025",
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
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ADSENSE-ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onError={(e) => {
            console.warn("AdSense failed to load:", e)
          }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
          onError={(e) => {
            console.warn("Google Analytics failed to load:", e)
          }}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <noscript>
          <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#f3f4f6" }}>
            This calculator requires JavaScript to function properly. Please enable JavaScript in your browser.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  )
}
