import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import HomeAffordabilityCalculatorPage from "./HomeAffordabilityCalculatorPage"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"
const pageUrl = `${siteUrl}/home-affordability-calculator/inflation-adjusted`

export const metadata: Metadata = {
  title: "Inflation-Adjusted Home Affordability Calculator",
  description:
    "Find your true max home price after factoring income, down payment, debts, and inflation since 2000. Multi-currency support for US, UK, EU, Canada, Australia.",
  keywords: [
    "home affordability calculator",
    "inflation adjusted home affordability",
    "how much house can I afford",
    "purchasing power housing",
    "real home price calculator",
    "mortgage affordability inflation",
    "home buying calculator",
    "international home affordability",
    "housing affordability 2026",
    "DTI calculator",
    "debt to income ratio calculator",
    "global home affordability",
  ],
  robots: "index, follow",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Inflation-Adjusted Home Affordability Calculator",
    description:
      "Find your true max home price after factoring income, down payment, debts, and inflation since 2000. Multi-currency support for US, UK, EU, Canada, Australia.",
    url: pageUrl,
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Home+Affordability+Calculator`,
        width: 1200,
        height: 630,
        alt: "Inflation-Adjusted Home Affordability Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inflation-Adjusted Home Affordability Calculator",
    description:
      "Find your true max home price after inflation since 2000. Multi-currency support for US, UK, EU, Canada, Australia.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Home+Affordability+Calculator`],
  },
}

export default function Page() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Inflation-Adjusted Home Affordability Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate your maximum home purchase price based on income, down payment, debts, and interest rate. See how inflation since 2000 has eroded your buying power. Supports USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD with country-specific lending rules.",
    url: pageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "312",
    },
    featureList: [
      "Country-specific DTI rules (US 28/36, UK 4.5x, Canada stress test, Australia APRA buffer)",
      "Multi-currency: USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD",
      "Inflation-adjusted buying power since 2000",
      "Historical rate comparison (2000, 2010, today)",
      "Front-end and back-end DTI breakdown",
      "Income multiple cap by country",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inflation-Adjusted Home Affordability Calculator — How Much House Can You Really Afford?",
    description:
      "Calculate your true maximum home purchase price factoring in income, debts, rates, and inflation since 2000. Includes country-specific lending rules for US, UK, Canada, Australia, Eurozone, Switzerland, Japan, and New Zealand.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon-96x96.png`,
      },
    },
    datePublished: "2026-02-28",
    dateModified: "2026-02-28",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
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
        name: "Home Affordability Calculator",
        item: pageUrl,
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
          text: "In the US, the standard guideline is that your monthly housing costs should not exceed 28% of your gross monthly income (front-end DTI) and all debts combined should not exceed 36% (back-end DTI). On a $85,000/year income with no other debts, that means a maximum monthly payment of about $1,983 and a maximum loan of roughly $295,000 at 6.9%. Rules differ by country — the UK caps loans at 4.5x annual income, Canada applies a stress test, and Australia uses a 3% serviceability buffer.",
        },
      },
      {
        "@type": "Question",
        name: "How has inflation affected home buying power since 2000?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cumulative US CPI inflation from 2000 to 2025 is approximately 90%, meaning a $400,000 purchase price today has the equivalent real value of roughly $210,000 in year-2000 money. Additionally, mortgage rates in 2000 averaged 8.05% vs 6.9% today, which independently reduces maximum loan size. The combined effect of inflation eroding down-payment savings and rates remaining elevated makes 2026 among the least affordable home-buying environments in decades.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between front-end and back-end DTI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Front-end DTI (also called the housing ratio) is your monthly housing payment divided by gross monthly income. Lenders typically want this below 28% in the US. Back-end DTI is all monthly debt payments (housing + car loans + student loans + credit cards) divided by gross monthly income, typically capped at 36%. Your maximum home price is determined by whichever limit is more restrictive.",
        },
      },
      {
        "@type": "Question",
        name: "How does Canada's stress test affect home affordability?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Canada's CMHC stress test requires buyers to qualify at the contract mortgage rate plus 2 percentage points (or 5.25%, whichever is higher). This means if you get a mortgage at 5.2%, you must prove you can afford payments at 7.2%. This significantly reduces the maximum loan amount Canadian buyers can qualify for compared to the actual contract rate.",
        },
      },
      {
        "@type": "Question",
        name: "How is the maximum purchase price calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The calculator applies three tests and takes the most restrictive result: (1) Front-end DTI — maximum housing payment capped at a percentage of gross income; (2) Back-end DTI — housing payment limited by remaining capacity after other debts; (3) Income multiple cap — maximum loan as a multiple of annual income (e.g. 4.5x in the US and UK). The maximum purchase price equals the maximum qualifying loan plus your down payment.",
        },
      },
      {
        "@type": "Question",
        name: "What mortgage rates does this calculator use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You enter your own rate, and the calculator pre-fills the current average for your selected country. It also shows what your maximum price would have been at year-2000 rates to illustrate the historical impact. For context: US rates in 2000 averaged 8.05%, fell to 4.69% in 2010, and are approximately 6.9% in 2026.",
        },
      },
    ],
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Home Affordability and Inflation Dataset — 8 Currencies, 2000–2026",
    description:
      "Consumer Price Index data for USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD from 2000–2026, combined with historical mortgage rate averages and country-specific lending rule parameters (DTI ratios, income multiples, stress tests) for home affordability calculations.",
    url: pageUrl,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: siteUrl,
    },
    temporalCoverage: "2000/2026",
    variableMeasured: [
      "Consumer Price Index (CPI)",
      "Mortgage Interest Rate",
      "Front-End DTI Limit",
      "Back-End DTI Limit",
      "Income Multiple Cap",
      "Minimum Down Payment Percentage",
      "Stress Test Rate",
      "Maximum Purchase Price",
      "Inflation-Adjusted Purchasing Power",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Consumer Price Index for All Urban Consumers (CPI-U)",
        publisher: { "@type": "Organization", name: "US Bureau of Labor Statistics" },
        url: "https://www.bls.gov/cpi/",
      },
      {
        "@type": "Dataset",
        name: "UK Consumer Price Inflation",
        publisher: { "@type": "Organization", name: "UK Office for National Statistics" },
        url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
      },
      {
        "@type": "Dataset",
        name: "Freddie Mac Primary Mortgage Market Survey",
        publisher: { "@type": "Organization", name: "Freddie Mac" },
        url: "https://www.freddiemac.com/pmms",
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-webapp" data={webAppSchema} />
      <JsonLd id="schema-article" data={articleSchema} />
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
      <JsonLd id="schema-dataset" data={datasetSchema} />
      <HomeAffordabilityCalculatorPage />
    </>
  )
}
