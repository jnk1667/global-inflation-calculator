import type { Metadata } from "next"
import MortgageCalculatorPage from "./MortgageCalculatorPage"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Mortgage Calculator | Home Affordability & Loan Payments",
  description:
    "Calculate mortgage payments and home affordability from 1987-present. Compare house price-to-income ratios using Case-Shiller and Census data.",
  keywords: [
    "mortgage calculator",
    "home loan calculator",
    "mortgage payment calculator",
    "home affordability calculator",
    "mortgage affordability index",
    "house price calculator",
    "mortgage qualification calculator",
    "home buying calculator",
    "property affordability",
    "real estate calculator",
    "mortgage payment estimator",
    "home loan estimator",
  ],
  alternates: {
    canonical: `${siteUrl}/mortgage-calculator`,
  },
  openGraph: {
    title: "Mortgage Calculator - Historical Home Price Analysis",
    description:
      "Calculate mortgage payments and home affordability across decades. Compare house price-to-income ratios using real Case-Shiller and median income data from 1987 to today.",
    url: `${siteUrl}/mortgage-calculator`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Mortgage+Calculator`,
        width: 1200,
        height: 630,
        alt: "Mortgage Calculator - Compare Home Prices Across Decades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator - Historical Analysis",
    description:
      "Calculate mortgage payments from 1987 to today. See how house price-to-income ratios have changed over decades.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Mortgage+Calculator`],
  },
}

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate mortgage payments and home affordability using historical Case-Shiller Home Price Index and median household income data.",
    url: `${siteUrl}/mortgage-calculator`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Historical home price data from 1987-present",
      "Median household income comparison",
      "Price-to-income ratio analysis",
      "Mortgage affordability calculations",
      "Interactive comparison charts",
      "Inflation-adjusted analysis",
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mortgage Calculator",
        item: `${siteUrl}/mortgage-calculator`,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <MortgageCalculatorPage />
    </>
  )
}
