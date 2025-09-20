import type { Metadata } from "next"
import ChartsPage from "./ChartsPage"

export const metadata: Metadata = {
  title: "Inflation Charts & Analytics - Global Inflation Calculator",
  description:
    "Comprehensive inflation charts and analytics across many currencies. Visualize the purchasing power erosion, inflation and healthcare trends with data graphs.",
  keywords: [
    "inflation charts",
    "currency analytics",
    "purchasing power charts",
    "inflation visualization",
    "currency stability",
    "healthcare inflation",
    "historical inflation data",
    "inflation trends",
    "global inflation calculator",
    "currency comparison",
    "inflation rate distribution",
    "cross currency correlation",
    "regional inflation analysis",
    "rolling average inflation",
    "purchasing power convergence",
  ],
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/charts",
  },
  openGraph: {
    title: "Inflation Charts & Analytics - Global Inflation Calculator",
    description:
      "Comprehensive inflation charts and analytics across multiple currencies from 1913-2025. Interactive visualizations of purchasing power erosion, currency stability, and healthcare inflation trends.",
    url: "https://www.globalinflationcalculator.com/charts",
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/og-charts.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator Charts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inflation Charts & Analytics - Global Inflation Calculator",
    description: "Interactive inflation charts across multiple currencies from 1913-2025",
    images: ["https://www.globalinflationcalculator.com/og-charts.png"],
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

export default function Page() {
  return <ChartsPage />
}
