import type { Metadata } from "next"
import ROICalculatorPage from "./ROICalculatorPage"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "ROI Calculator - Investment Return Analysis Tool",
  description:
    "Calculate return on investment with inflation adjustment across 8 currencies. Compare your ROI against Treasury rates with multi-measure analysis.",
  keywords: [
    "ROI calculator",
    "return on investment calculator",
    "investment return calculator",
    "inflation adjusted ROI",
    "real vs nominal returns",
    "treasury rate comparison",
    "multi-currency ROI",
  ],
  openGraph: {
    title: "ROI Calculator - Investment Return Analysis",
    description:
      "Calculate return on investment with inflation adjustment across 8 currencies. Compare your ROI against Treasury rates with multi-measure analysis.",
    url: `${siteUrl}/roi-calculator`,
    siteName: "Global Inflation Calculator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROI Calculator - Investment Return Analysis",
    description:
      "Calculate return on investment with inflation adjustment across 8 currencies. Compare your ROI against Treasury rates.",
  },
  alternates: {
    canonical: `${siteUrl}/roi-calculator`,
  },
}

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ROI Calculator",
    description:
      "Calculate return on investment with inflation adjustment across 8 currencies. Compare your ROI against Treasury rates with multi-measure analysis.",
    url: `${siteUrl}/roi-calculator`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Standard ROI calculation",
      "Inflation-adjusted returns",
      "Multi-currency analysis",
      "Treasury rate comparison",
      "Real vs nominal returns",
      "Tax adjustment",
    ],
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ROI Calculator",
        item: `${siteUrl}/roi-calculator`,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <ROICalculatorPage />
    </>
  )
}
