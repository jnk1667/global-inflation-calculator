import type { Metadata } from "next"
import AutoLoanCalculatorPage from "./AutoLoanCalculatorPage"

export const revalidate = 86400

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl
  }
  return "https://www.globalinflationcalculator.com"
})()

export const metadata: Metadata = {
  title: "Auto Loan Calculator | Inflation-Adjusted Car Costs",
  description:
    "Calculate monthly car payments with inflation analysis. See how car prices and gas costs have changed over time using real government data from 1985-2026.",
  keywords: [
    "auto loan calculator",
    "car loan calculator",
    "car payment calculator",
    "inflation adjusted car prices",
    "gas price calculator",
    "total ownership cost",
    "vehicle financing calculator",
    "car price inflation",
    "auto financing calculator",
    "monthly car payment",
    "loan amortization",
    "true cost of ownership",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/auto-loan-calculator`,
  },
  openGraph: {
    title: "Auto Loan Calculator - Car Payment & Inflation",
    description:
      "Calculate auto loan payments and discover true ownership costs. Advanced mode shows car price inflation, gas cost impact, and inflation-adjusted analysis.",
    url: `${siteUrl}/auto-loan-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Auto+Loan+Calculator`,
        width: 1200,
        height: 630,
        alt: "Auto Loan Calculator with Inflation Analysis",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Loan Calculator | Inflation-Adjusted Car Costs",
    description:
      "Calculate car payments and see true ownership costs with inflation analysis. Real data from FRED and EIA.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Auto+Loan+Calculator`],
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
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Auto Loan Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate monthly auto loan payments with advanced inflation analysis. See car price inflation trends, gas price impact, and true ownership costs using government data from 1985-2026.",
    url: `${siteUrl}/auto-loan-calculator`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "1789",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Monthly payment calculator",
      "Total interest calculation",
      "Loan amortization schedule",
      "Car price inflation chart (1985-2026)",
      "Gas price impact analysis with EIA data",
      "Inflation-adjusted payment analysis",
      "Total ownership cost calculator",
      "Down payment optimization",
      "Trade-in value calculator",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Auto Loan Calculator - Car Payment & Inflation-Adjusted Ownership Costs",
    description:
      "Comprehensive guide to calculating auto loan payments with inflation analysis. Understand how car price inflation and gas costs have changed from 1985-2026 using Federal Reserve and EIA data.",
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
    datePublished: "2024-01-12",
    dateModified: "2026-02-13",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/auto-loan-calculator`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Auto Loan and Vehicle Price Inflation Dataset",
    description:
      "Historical vehicle price inflation data and gasoline cost trends from 1985-2026, including Consumer Price Index for new vehicles, used cars, and automotive fuel prices.",
    url: `${siteUrl}/auto-loan-calculator`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "1985/2026",
    spatialCoverage: {
      "@type": "Place",
      name: "United States",
    },
    variableMeasured: [
      "New Vehicle CPI",
      "Used Car CPI",
      "Gasoline Price per Gallon",
      "Auto Loan Interest Rate",
      "Vehicle Depreciation Rate",
      "Total Ownership Cost",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data - New Vehicle CPI",
        description:
          "Consumer Price Index for new vehicles (CUSR0000SETA01) from 1985 to present, tracking inflation-adjusted price changes for new automobiles and light trucks.",
        url: "https://fred.stlouisfed.org/series/CUSR0000SETA01",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data - Used Car Price Index",
        description:
          "Consumer Price Index for used cars and trucks (CUSR0000SETA02), providing historical pricing trends for the secondary automobile market from 1985 onwards.",
        url: "https://fred.stlouisfed.org/series/CUSR0000SETA02",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "US Energy Information Administration Gasoline Prices",
        description:
          "Weekly U.S. regular all formulations retail gasoline prices from 1993 to present, including historical trends in automotive fuel costs affecting total vehicle ownership expenses.",
        url: "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=pet&s=emm_epm0_pte_nus_dpg",
        creator: {
          "@type": "Organization",
          name: "U.S. Energy Information Administration",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Auto Loan Interest Rates",
        description:
          "Historical average interest rates for new car loans at commercial banks and credit unions, providing benchmark rates for automotive financing cost analysis.",
        url: "https://fred.stlouisfed.org/series/TERMCBAUTO48NS",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
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
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Auto Loan Calculator",
        item: `${siteUrl}/auto-loan-calculator`,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is the monthly car payment calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Monthly car payments are calculated using the loan amount (vehicle price minus down payment), interest rate, and loan term. The formula accounts for compound interest to determine equal monthly payments that will fully repay the loan over the specified term.",
        },
      },
      {
        "@type": "Question",
        name: "How has car price inflation affected vehicle costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Car prices have significantly increased due to inflation. Our calculator uses Federal Reserve (FRED) data to show how vehicle prices have changed since 1985. The advanced mode displays inflation-adjusted car prices to help you understand the true cost impact over time.",
        },
      },
      {
        "@type": "Question",
        name: "What is the true cost of car ownership?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "True ownership cost includes more than just loan payments. It encompasses purchase price, interest, gas costs, insurance, maintenance, and depreciation. Our advanced calculator shows how gas price inflation impacts total ownership costs using real Energy Information Administration (EIA) data.",
        },
      },
      {
        "@type": "Question",
        name: "Should I choose a longer or shorter loan term?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shorter loan terms (36-48 months) mean higher monthly payments but less total interest paid. Longer terms (60-72 months) reduce monthly payments but significantly increase total interest costs. Our calculator shows both scenarios to help you make informed financing decisions.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AutoLoanCalculatorPage />
    </>
  )
}
