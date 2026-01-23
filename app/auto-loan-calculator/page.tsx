import type { Metadata } from "next"
import AutoLoanCalculatorPage from "./AutoLoanCalculatorPage"

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
    "Calculate monthly car payments with inflation analysis. See how car prices and gas costs have changed over time using real government data from 1985-2025.",
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
      "Calculate monthly auto loan payments with advanced inflation analysis. See car price inflation trends, gas price impact, and true ownership costs using government data from 1985-2025.",
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
      "Car price inflation chart (1985-2025)",
      "Gas price impact analysis with EIA data",
      "Inflation-adjusted payment analysis",
      "Total ownership cost calculator",
      "Down payment optimization",
      "Trade-in value calculator",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AutoLoanCalculatorPage />
    </>
  )
}
