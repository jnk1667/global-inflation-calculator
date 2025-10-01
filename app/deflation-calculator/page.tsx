import type { Metadata } from "next"
import DeflationCalculatorPage from "./DeflationCalculatorPage"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Deflation Calculator - Track Purchasing Power Growth with Scarce Assets",
  description:
    "Calculate how deflationary assets like Gold, Silver, and Crude Oil preserve and grow purchasing power over time. See the opposite of inflation with scarce asset appreciation from 1985-2025.",
  keywords: [
    "deflation calculator",
    "purchasing power growth",
    "gold appreciation calculator",
    "silver price calculator",
    "scarce assets",
    "deflationary assets",
    "asset scarcity calculator",
    "inflation hedge",
    "wealth preservation",
    "commodity calculator",
    "gold vs inflation",
    "precious metals calculator",
    "crude oil calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/deflation-calculator`,
  },
  openGraph: {
    title: "Deflation Calculator - Track Purchasing Power Growth with Scarce Assets",
    description:
      "Calculate how deflationary assets like Gold, Silver, and Crude Oil preserve purchasing power over time. Historical data from 1985-2025.",
    url: `${siteUrl}/deflation-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Deflation+Calculator`,
        width: 1200,
        height: 630,
        alt: "Deflation Calculator - Scarce Asset Analysis",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deflation Calculator - Track Purchasing Power Growth",
    description: "Calculate how deflationary assets preserve purchasing power over time. Gold, Silver, Crude Oil data.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Deflation+Calculator`],
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
}

export default function DeflationCalculator() {
  return <DeflationCalculatorPage />
}
