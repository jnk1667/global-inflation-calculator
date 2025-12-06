import type { Metadata } from "next"
import { redirect } from "next/navigation"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl
  }
  return "https://www.globalinflationcalculator.com"
})()

export const metadata: Metadata = {
  title: "Housing Affordability Calculator - Judge Home Affordability",
  description:
    "Calculate housing affordability across ages. Compare house price-to-income ratios from 1987 to now. See how affordable housing is now versus historical periods.",
  keywords: [
    "housing affordability calculator",
    "house price to income ratio",
    "housing affordability index",
    "home affordability calculator",
    "housing market affordability",
    "median home price calculator",
    "housing cost calculator",
    "real estate affordability",
    "home buying affordability",
    "housing inflation calculator",
    "case shiller index",
    "housing bubble comparison",
    "historical housing prices",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/housing-affordability-calculator`,
  },
  openGraph: {
    title: "Housing Affordability Calculator - Historical Home Price Analysis",
    description:
      "Compare housing affordability across decades. Calculate house price-to-income ratios using real Case-Shiller and median household income data from 1987 to today.",
    url: `${siteUrl}/housing-affordability-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Housing+Affordability+Calculator`,
        width: 1200,
        height: 630,
        alt: "Housing Affordability Calculator - Compare Home Prices Across Decades",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Housing Affordability Calculator - Historical Analysis",
    description:
      "Compare housing affordability from 1987 to today. See how house price-to-income ratios have changed over decades.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Housing+Affordability+Calculator`],
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

export default function HousingAffordabilityCalculator() {
  redirect("/mortgage-calculator")
}
