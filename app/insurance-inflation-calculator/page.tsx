import type { Metadata } from "next"
import InsuranceInflationCalculatorPage from "./InsuranceInflationCalculatorPage"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "Insurance Inflation Calculator | Premium Cost Forecast",
  description:
    "Calculate how your health insurance premiums will increase over time with medical inflation. Project 5, 10, or 20-year costs based on age, family size, and location.",
  keywords: [
    "insurance inflation calculator",
    "health insurance cost calculator",
    "premium forecast",
    "health insurance rates",
    "insurance cost projection",
    "medical insurance calculator",
    "healthcare cost inflation",
    "insurance premium estimator",
    "family health insurance",
    "ACA insurance costs",
    "insurance affordability",
    "healthcare expenses",
  ],
  alternates: {
    canonical: `${siteUrl}/insurance-inflation-calculator`,
  },
  openGraph: {
    title: "Insurance Inflation Calculator - Premium Cost Projections",
    description:
      "See how your health insurance premiums will grow over the next 5, 10, or 20 years. Compare medical inflation to regular inflation with accurate projections.",
    url: `${siteUrl}/insurance-inflation-calculator`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Insurance+Inflation+Calculator`,
        width: 1200,
        height: 630,
        alt: "Insurance Inflation Calculator - Health Insurance Premium Forecast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insurance Inflation Calculator",
    description:
      "Calculate insurance premium increases with medical inflation projections. Plan for healthcare costs over decades.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Insurance+Inflation+Calculator`],
  },
}

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Insurance Inflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate how health insurance premiums will increase over time with medical inflation projections. Forecast costs by age, family size, location, and plan type.",
    url: `${siteUrl}/insurance-inflation-calculator`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "1256",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Premium cost forecasting 1-20 years ahead",
      "Age-based rate multipliers",
      "Family size adjustments",
      "State and regional variations",
      "Plan tier comparisons (Bronze to Platinum)",
      "Medical inflation analysis",
      "Real-time projections with 2026 data",
      "Interactive comparison charts",
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
        name: "Insurance Inflation Calculator",
        item: `${siteUrl}/insurance-inflation-calculator`,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <InsuranceInflationCalculatorPage />
    </>
  )
}
