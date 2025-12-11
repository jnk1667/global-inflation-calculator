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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is ROI and how is it calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ROI (Return on Investment) measures the profitability of an investment. It's calculated as: (Final Value - Initial Investment) / Initial Investment × 100. For example, if you invest $1,000 and it grows to $1,500, your ROI is 50%.",
        },
      },
      {
        "@type": "Question",
        name: "How does inflation affect my investment returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inflation reduces the real purchasing power of your returns. While you may earn 8% nominal returns, if inflation is 3%, your real return is only about 5%. Our calculator adjusts for inflation to show your true purchasing power gains.",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between nominal and real ROI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nominal ROI shows the raw percentage return without accounting for inflation. Real ROI adjusts for inflation to show the actual increase in purchasing power. Real ROI = (1 + Nominal ROI) / (1 + Inflation Rate) - 1.",
        },
      },
      {
        "@type": "Question",
        name: "How should I compare my ROI to Treasury rates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Treasury rates represent risk-free returns. If your investment ROI doesn't beat Treasury rates (adjusted for inflation), you're taking on extra risk without adequate reward. Our calculator helps you make this comparison across different time periods.",
        },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ROICalculatorPage />
    </>
  )
}
