import type { Metadata } from "next"
import GlobalNetWorthCalculatorPage from "./GlobalNetWorthCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Global Net Worth Calculator | Inflation-Adjusted Wealth Tracker",
  description:
    "Calculate real net worth across 8 currencies with inflation-adjusted purchasing power. Track assets and liabilities, project future wealth, and compare global percentiles.",
  keywords: [
    "global net worth calculator",
    "net worth calculator",
    "inflation adjusted net worth",
    "real net worth calculator",
    "net worth purchasing power",
    "assets and liabilities calculator",
    "net worth tracker",
    "net worth by currency",
    "wealth calculator",
    "net worth projection",
    "debt to asset ratio",
    "net worth percentile",
    "what is my net worth worth",
    "net worth inflation 2026",
  ],
  openGraph: {
    title: "Global Net Worth Calculator — Inflation-Adjusted Wealth",
    description:
      "Track assets and liabilities across 8 currencies. See your real net worth after inflation and project future wealth with growth rate scenarios.",
    url: "/global-net-worth-calculator",
    type: "website",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200&text=Global+Net+Worth+Calculator",
        width: 1200,
        height: 630,
        alt: "Global Net Worth Calculator — Inflation-Adjusted Wealth Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Net Worth Calculator — Real Wealth After Inflation",
    description:
      "Calculate your inflation-adjusted net worth across 8 major currencies. Track assets, liabilities, and project future purchasing power.",
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/global-net-worth-calculator",
  },
}

export default function Page() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Global Net Worth Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate real net worth across 8 major currencies with inflation-adjusted purchasing power. Track assets and liabilities, view debt-to-asset ratio, and project future wealth.",
    url: "https://www.globalinflationcalculator.com/global-net-worth-calculator",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "843",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Net worth calculation across 8 currencies",
      "Inflation-adjusted purchasing power analysis",
      "Asset and liability categorization",
      "Debt-to-asset ratio tracking",
      "Future net worth projection with growth rates",
      "Net worth percentile comparison",
      "30-year inflation erosion visualization",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Global Net Worth Calculator — Inflation-Adjusted Wealth Tracker",
    description:
      "Calculate your real net worth with inflation adjustment across 8 major global currencies. Track assets and liabilities, see purchasing power erosion over time, and project future wealth.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: "https://globalinflationcalculator.com/favicon-96x96.png",
      },
    },
    datePublished: "2026-02-25",
    dateModified: "2026-02-25",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://globalinflationcalculator.com/global-net-worth-calculator",
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
        item: "https://www.globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Global Net Worth Calculator",
        item: "https://www.globalinflationcalculator.com/global-net-worth-calculator",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is net worth and how is it calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Net worth is total assets minus total liabilities. Assets include property, investments, savings, and vehicles. Liabilities include mortgages, loans, and credit card balances. A positive net worth means you own more than you owe.",
        },
      },
      {
        "@type": "Question",
        name: "What is a good net worth by age?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "General benchmarks vary, but a common guideline is to have saved 1x your annual salary by age 30, 3x by 40, 6x by 50, and 8x by 60. However, the median US household net worth is around $192,700, with significant variation by age group.",
        },
      },
      {
        "@type": "Question",
        name: "How does inflation affect net worth?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inflation erodes the purchasing power of your net worth over time. At 2.8% annual inflation (current US rate), $500,000 today will have the purchasing power of roughly $375,000 in 10 years and $280,000 in 20 years — unless your assets grow to compensate.",
        },
      },
      {
        "@type": "Question",
        name: "What is a healthy debt-to-asset ratio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A debt-to-asset ratio below 30% is generally considered healthy. A ratio of 30-60% is moderate and manageable. Above 60% indicates high leverage and financial risk. Paying down high-interest debt is the fastest way to improve this ratio.",
        },
      },
      {
        "@type": "Question",
        name: "Why calculate net worth in multiple currencies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For people with assets or income in multiple countries, or those considering relocation, currency-specific calculations matter because each country has different inflation rates. Swiss Franc holders face only 1.1% inflation while Japanese Yen holders face 3.6%, creating very different long-term purchasing power outcomes.",
        },
      },
    ],
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Global Inflation Data for Net Worth Analysis — 8 Currency Database",
    description:
      "Official government inflation rate data for 8 major currencies used to calculate real purchasing power erosion of household net worth. Covers USD (1913–2026), GBP (1947–2026), EUR (1996–2026), CAD (1913–2026), AUD (1948–2026), CHF (1913–2026), JPY (1946–2026), and NZD (1960–2026).",
    url: "https://globalinflationcalculator.com/global-net-worth-calculator",
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: "https://globalinflationcalculator.com",
    },
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "Global Inflation Calculator Data Repository",
    },
    temporalCoverage: "1913/2026",
    spatialCoverage: {
      "@type": "Place",
      name: "Global — United States, United Kingdom, European Union, Canada, Australia, Switzerland, Japan, New Zealand",
    },
    variableMeasured: [
      "Annual Inflation Rate",
      "Consumer Price Index (CPI)",
      "Household Net Worth",
      "Total Assets",
      "Total Liabilities",
      "Debt-to-Asset Ratio",
      "Real Purchasing Power",
      "Inflation-Adjusted Net Worth",
      "Net Worth Percentile",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "US Bureau of Labor Statistics — Consumer Price Index",
        description:
          "Official CPI-U data series covering US inflation from 1913 to present, used to calculate inflation-adjusted USD net worth.",
        url: "https://www.bls.gov/cpi/",
        creator: { "@type": "Organization", name: "U.S. Bureau of Labor Statistics" },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "UK Office for National Statistics — Consumer Prices Index",
        description:
          "Official UK CPI and RPI data from 1947 to present, used to calculate inflation-adjusted GBP net worth.",
        url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
        creator: { "@type": "Organization", name: "UK Office for National Statistics" },
        license: "http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      },
      {
        "@type": "Dataset",
        name: "Eurostat — Harmonised Index of Consumer Prices",
        description:
          "HICP data for the European Union from 1996 to present, used to calculate inflation-adjusted EUR net worth.",
        url: "https://ec.europa.eu/eurostat/web/hicp",
        creator: { "@type": "Organization", name: "Eurostat — European Commission" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Statistics Canada — Consumer Price Index",
        description:
          "Official CPI data for Canada from 1913 to present, used to calculate inflation-adjusted CAD net worth.",
        url: "https://www.statcan.gc.ca/en/subjects-start/prices_and_price_indexes/consumer_price_indexes",
        creator: { "@type": "Organization", name: "Statistics Canada" },
        license: "https://www.statcan.gc.ca/en/reference/licence",
      },
      {
        "@type": "Dataset",
        name: "Australian Bureau of Statistics — Consumer Price Index",
        description:
          "Official ABS CPI data for Australia from 1948 to present, used to calculate inflation-adjusted AUD net worth.",
        url: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia",
        creator: { "@type": "Organization", name: "Australian Bureau of Statistics" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Swiss Federal Statistical Office — Consumer Price Index",
        description:
          "Official FSO CPI data for Switzerland from 1913 to present, used to calculate inflation-adjusted CHF net worth.",
        url: "https://www.bfs.admin.ch/bfs/en/home/statistics/prices/consumer-price-index.html",
        creator: { "@type": "Organization", name: "Swiss Federal Statistical Office" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Statistics Bureau of Japan — Consumer Price Index",
        description:
          "Official Japanese CPI data from 1946 to present, used to calculate inflation-adjusted JPY net worth.",
        url: "https://www.stat.go.jp/english/data/cpi/",
        creator: { "@type": "Organization", name: "Statistics Bureau of Japan" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Stats NZ — Consumer Price Index",
        description:
          "Official New Zealand CPI data from 1960 to present, used to calculate inflation-adjusted NZD net worth.",
        url: "https://www.stats.govt.nz/topics/consumers-price-index",
        creator: { "@type": "Organization", name: "Stats NZ — Statistics New Zealand" },
        license: "https://creativecommons.org/licenses/by/4.0/",
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
      <GlobalNetWorthCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Global Net Worth Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate your real net worth across 8 major currencies with inflation-adjusted purchasing power analysis. Track assets and liabilities, view debt-to-asset ratio, and project future wealth growth.
                </p>
                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>Net worth calculation across USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD</li>
                    <li>Asset tracking — real estate, investments, savings, vehicles, business</li>
                    <li>Liability tracking — mortgage, auto loan, student loan, credit cards</li>
                    <li>Debt-to-asset ratio with health indicators</li>
                    <li>Inflation-adjusted purchasing power over 10, 20, and 30 years</li>
                    <li>Net worth projection with custom growth rate scenarios</li>
                    <li>Net worth percentile comparison</li>
                  </ul>
                </section>
                <nav className="mt-6" aria-label="Navigation">
                  <h3 className="font-semibold mb-2">Other Tools:</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-blue-600 hover:underline">Inflation Calculator</Link></li>
                    <li><Link href="/retirement-calculator" className="text-blue-600 hover:underline">Retirement Calculator</Link></li>
                    <li><Link href="/salary-calculator" className="text-blue-600 hover:underline">Salary Calculator</Link></li>
                    <li><Link href="/budget-calculator" className="text-blue-600 hover:underline">Budget Calculator</Link></li>
                  </ul>
                </nav>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
