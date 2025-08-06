import type { Metadata } from "next"
import SalaryCalculatorPage from "./SalaryCalculatorPage"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Salary Inflation Calculator - Wage Adjustment",
  description:
    "Calculate what your historical salary might be worth today if it were adjusted for inflation. Understand what real wage growth looks like.",
  keywords: [
    "salary inflation calculator",
    "wage adjustment calculator",
    "historical salary calculator",
    "salary negotiation tool",
    "real wage calculator",
    "purchasing power salary",
    "inflation adjusted salary",
    "career planning calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/salary-calculator`,
  },
  openGraph: {
    title: "Salary Inflation Calculator - Historical Wage Adjustment Tool",
    description:
      "Calculate what your historical salary should be worth today based on inflation. Perfect for salary negotiations and career planning.",
    url: `${siteUrl}/salary-calculator`,
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "/images/globe-icon.png",
        width: 1200,
        height: 630,
        alt: "Salary Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Inflation Calculator - Historical Wage Adjustment Tool",
    description:
      "Calculate what your historical salary should be worth today based on inflation. Perfect for salary negotiations.",
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
}

export default function SalaryCalculatorPageRoute() {
  return <SalaryCalculatorPage />
}
