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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1432",
      bestRating: "5",
      worstRating: "1",
    },
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "ROI Calculator - Inflation-Adjusted Investment Return Analysis",
    description:
      "Comprehensive guide to calculating investment returns (ROI) with inflation adjustment across 8 currencies. Compare your real returns against risk-free Treasury rates from 2023-2026.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon-96x96.png`,
      },
    },
    datePublished: "2024-02-01",
    dateModified: "2026-02-07",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/roi-calculator`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Treasury Rates and Investment Return Dataset",
    description:
      "Comprehensive dataset of U.S. Treasury yields (3-month bills to 30-year bonds) and Series I/EE Savings Bond rates from 2023-2026, enabling accurate ROI benchmarking against risk-free rates.",
    url: `${siteUrl}/roi-calculator`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "2023/2026",
    spatialCoverage: {
      "@type": "Place",
      name: "United States",
    },
    variableMeasured: [
      "Treasury Bill Yield (3-month, 6-month, 1-year)",
      "Treasury Note Yield (2-year, 3-year, 5-year, 7-year, 10-year)",
      "Treasury Bond Yield (20-year, 30-year)",
      "Series I Savings Bond Composite Rate",
      "Series I Savings Bond Fixed Rate",
      "Series EE Savings Bond Fixed Rate",
      "Risk-Free Rate of Return",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "U.S. Treasury Daily Par Yield Curve Rates",
        description:
          "Official daily Treasury constant maturity rates from February 2026, including 3-month bills at 3.67%, 10-year notes at 4.21%, and 30-year bonds at 4.85%. These rates represent risk-free benchmark returns for investment comparison.",
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data - Treasury Yields",
        description:
          "Time series data for Treasury constant maturity rates from 2023-2026, providing historical context for comparing investment returns against risk-free alternatives.",
        url: "https://fred.stlouisfed.org/categories/115",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "TreasuryDirect Series I Savings Bond Rates",
        description:
          "Series I Savings Bond rates with a composite rate of 4.03% (November 2025 - April 2026), consisting of a 0.90% fixed rate and 3.13% inflation adjustment, providing inflation-protected returns.",
        url: "https://www.treasurydirect.gov/savings-bonds/i-bonds/i-bonds-interest-rates/",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury - TreasuryDirect",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "TreasuryDirect Series EE Savings Bond Rates",
        description:
          "Series EE Savings Bond fixed rates from 2023-2026, currently at 2.9% for bonds issued November 2025 - April 2026, with a guarantee to double in value after 20 years.",
        url: "https://www.treasurydirect.gov/savings-bonds/ee-bonds/ee-bonds-interest-rates/",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury - TreasuryDirect",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Multi-Currency Inflation Rate Dataset",
        description:
          "Historical CPI and inflation rates for USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD from official national statistical agencies, used for calculating real (inflation-adjusted) investment returns.",
        url: `${siteUrl}/`,
        creator: {
          "@type": "Organization",
          name: "Global Inflation Calculator",
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ROICalculatorPage />
    </>
  )
}
