import type { Metadata } from "next"
import GlobalNetWorthCalculatorPage from "./GlobalNetWorthCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Global Net Worth Calculator | Inflation-Adjusted Wealth Tracker",
  description:
    "Calculate your real net worth across 8 major currencies with inflation-adjusted purchasing power analysis. Track assets and liabilities, project future wealth, and see what your net worth is truly worth after inflation.",
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
    canonical: "/global-net-worth-calculator",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
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
