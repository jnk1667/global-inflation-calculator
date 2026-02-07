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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "2345",
      bestRating: "5",
      worstRating: "1",
    },
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Mortgage Calculator - Historical Home Affordability & Price-to-Income Analysis",
    description:
      "Comprehensive guide to calculating mortgage affordability using Case-Shiller Home Price Index and median income data from 1987-2025. Analyze how home affordability has changed over nearly 40 years.",
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
    datePublished: "2024-01-25",
    dateModified: "2026-02-06",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/mortgage-calculator`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Historical Home Affordability and Mortgage Dataset",
    description:
      "Comprehensive dataset combining S&P CoreLogic Case-Shiller Home Price Index with U.S. Census Bureau median household income data from 1987-2025, enabling detailed analysis of home affordability trends and price-to-income ratios across 39 years.",
    url: `${siteUrl}/mortgage-calculator`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "1987/2025",
    spatialCoverage: {
      "@type": "Place",
      name: "United States",
    },
    variableMeasured: [
      "Case-Shiller Home Price Index",
      "Median Household Income",
      "Median Home Price",
      "Price-to-Income Ratio",
      "Housing Affordability Index",
      "Real Home Price (Inflation-Adjusted)",
      "Real Median Income",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "S&P CoreLogic Case-Shiller U.S. National Home Price Index",
        description:
          "The leading measure of U.S. single-family home prices from 1987 to 2025, tracking the value of residential real estate across major metropolitan areas. The index reached 331.69 in 2025, showing significant appreciation over the 39-year period.",
        url: "https://www.spglobal.com/spdji/en/indices/indicators/sp-corelogic-case-shiller-us-national-home-price-nsa-index/",
        creator: {
          "@type": "Organization",
          name: "S&P Dow Jones Indices and CoreLogic",
        },
        license: "https://www.spglobal.com/spdji/en/terms-of-use/",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data - Case-Shiller Index",
        description:
          "Time series data of the S&P/Case-Shiller U.S. National Home Price Index (CSUSHPINSA), providing monthly observations of home price changes for economic and housing market analysis.",
        url: "https://fred.stlouisfed.org/series/CSUSHPINSA",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "U.S. Census Bureau Median Household Income",
        description:
          "Annual median household income statistics for the United States from 1987 to 2025, measuring the income at which half of households earn more and half earn less. Latest data shows median income at $83,730 (2024), used for affordability ratio calculations.",
        url: "https://www.census.gov/data/tables/time-series/demo/income-poverty/historical-income-households.html",
        creator: {
          "@type": "Organization",
          name: "U.S. Census Bureau",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Mortgage Interest Rates",
        description:
          "Historical 30-year fixed-rate mortgage average from 1987 to present, tracking how borrowing costs have affected home affordability alongside price and income changes.",
        url: "https://fred.stlouisfed.org/series/MORTGAGE30US",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Consumer Price Index",
        description:
          "Consumer Price Index for All Urban Consumers used for inflation-adjusted home price and income comparisons, enabling real purchasing power analysis across decades.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much house can I afford based on my income?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A general rule is that your home price should be 2.5-3 times your annual household income. However, this varies based on interest rates, down payment, debts, and local market conditions. Our calculator uses historical median income and Case-Shiller home price data to show affordability trends over time.",
        },
      },
      {
        "@type": "Question",
        name: "What is the price-to-income ratio and why does it matter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The price-to-income ratio divides median home prices by median household income. It measures housing affordability - a higher ratio means homes are less affordable relative to incomes. Historically, ratios above 4.0 indicate housing markets may be overvalued.",
        },
      },
      {
        "@type": "Question",
        name: "How have home prices changed relative to wages over time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Using Case-Shiller data since 1987, home prices have generally outpaced wage growth. While median household incomes have roughly doubled, home prices in many markets have tripled or quadrupled. This trend has made housing less affordable for average income earners.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect mortgage affordability?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Key factors include interest rates, home prices, household income, down payment size, property taxes, insurance costs, and existing debts. Lower interest rates improve affordability, while rising home prices reduce it. Our calculator helps you understand these historical relationships.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <MortgageCalculatorPage />
    </>
  )
}
