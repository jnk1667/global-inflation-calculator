import type { Metadata } from "next"
import RegionalCostOfLivingPage from "./RegionalCostOfLivingPage"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Regional Cost of Living Comparison | Global Inflation Calculator",
  description:
    "Compare cost of living across 100+ cities worldwide. Analyze housing, utilities, food, and transportation costs with official government data.",
  keywords:
    "cost of living comparison, city comparison, housing costs, regional comparison, salary comparison, purchasing power",
  openGraph: {
    title: "Regional Cost of Living Comparison Tool",
    description:
      "Compare cost of living across 100+ cities worldwide with comprehensive data from official government sources.",
    url: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://globalinflationcalculator.com/og-regional-comparison.jpg",
        width: 1200,
        height: 630,
        alt: "Regional Cost of Living Comparison - Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regional Cost of Living Comparison Tool",
    description: "Compare cost of living across 100+ cities worldwide with comprehensive government data.",
    images: ["https://globalinflationcalculator.com/og-regional-comparison.jpg"],
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
  },
}

export default function RegionalCostOfLivingRoute() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Regional Cost of Living Comparison Tool",
    applicationCategory: "FinanceApplication",
    description:
      "Compare cost of living across 100+ cities worldwide. Comprehensive analysis of housing, utilities, food, and transportation costs with official government data.",
    url: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "100+ cities across 8 currencies",
      "Official government data sources",
      "Cross-currency comparison",
      "Housing, utilities, food, transportation costs",
      "Affordability metrics",
      "Real-time cost analysis",
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
        item: "https://globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Salary Calculator",
        item: "https://globalinflationcalculator.com/salary-calculator",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Regional Cost of Living",
        item: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <RegionalCostOfLivingPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/salary-calculator" className="hover:text-foreground">
                  Salary Calculator
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Regional Cost of Living</li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Regional Cost of Living Comparison</h1>
            <p className="text-lg text-muted-foreground">
              This tool requires JavaScript to function. Please enable JavaScript to compare cost of living across 100+
              cities worldwide.
            </p>
          </header>

          <section className="prose max-w-none">
            <h2>Features</h2>
            <ul>
              <li>100+ cities across 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)</li>
              <li>Official government data from BLS, UK ONS, Eurostat, Statistics Canada, and more</li>
              <li>Compare housing, utilities, food, and transportation costs</li>
              <li>Cross-currency comparison with real-time exchange rates</li>
              <li>Affordability metrics and cost breakdowns</li>
            </ul>

            <h2>Navigation</h2>
            <ul>
              <li>
                <Link href="/salary-calculator">Back to Salary Calculator</Link>
              </li>
              <li>
                <Link href="/">Home - Inflation Calculator</Link>
              </li>
            </ul>
          </section>
        </div>
      </noscript>
    </>
  )
}
