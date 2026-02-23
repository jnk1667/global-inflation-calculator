import type { Metadata } from "next"
import RegionalCostOfLivingPage from "./RegionalCostOfLivingPage"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cost of Living Comparison Tool | 80+ Global Cities",
  description:
    "Compare cost of living across 80+ cities worldwide. Analyze housing, utilities, food & transport costs with official government data from BLS, ONS, Eurostat.",
  keywords:
    "cost of living comparison, city comparison, housing costs, regional comparison, salary comparison, purchasing power, relocation calculator, moving cost calculator",
  openGraph: {
    title: "Regional Cost of Living Comparison | 80+ Global Cities",
    description:
      "Compare cost of living across 80+ cities worldwide with comprehensive data from official government sources including BLS, UK ONS, Eurostat, and more.",
    url: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://globalinflationcalculator.com/og-regional-comparison.jpg",
        width: 1200,
        height: 630,
        alt: "Regional Cost of Living Comparison Tool - Compare 80+ Cities",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cost of Living Comparison | 80+ Global Cities",
    description: "Compare cost of living across 80+ cities worldwide with comprehensive government data.",
    images: ["https://globalinflationcalculator.com/og-regional-comparison.jpg"],
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
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

export default function RegionalCostOfLivingRoute() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Regional Cost of Living Comparison Tool",
    applicationCategory: "FinanceApplication",
    description:
      "Compare cost of living across 80+ cities worldwide in 8 currencies. Comprehensive analysis of housing, utilities, food, and transportation costs with official government data from BLS, UK ONS, Eurostat, Statistics Canada, Australian Bureau of Statistics, Swiss FSO, Statistics Bureau of Japan, and Stats NZ.",
    url: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "80+ cities across 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "Official government data sources",
      "Cross-currency salary comparison",
      "Housing, utilities, food, transportation cost analysis",
      "Affordability metrics and cost breakdowns",
      "Real-time cost of living calculations",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1247",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many cities can I compare in the Regional Cost of Living tool?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can compare cost of living data across 80+ cities worldwide, spanning 8 major currencies including USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD. The tool covers major metropolitan areas in the United States, United Kingdom, European Union, Canada, Australia, Switzerland, Japan, and New Zealand.",
        },
      },
      {
        "@type": "Question",
        name: "What data sources are used for cost of living calculations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All cost of living data comes from official government sources including the US Bureau of Labor Statistics (BLS), UK Office for National Statistics (ONS), Eurostat, Statistics Canada, Australian Bureau of Statistics (ABS), Swiss Federal Statistical Office (FSO), Statistics Bureau of Japan, and Stats NZ. This ensures accuracy and reliability.",
        },
      },
      {
        "@type": "Question",
        name: "What cost categories does the tool analyze?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Regional Cost of Living Comparison tool analyzes housing costs, utilities (electricity, water, gas), food and grocery expenses, and transportation costs. It also calculates an overall cost of living index and equivalent salary needed to maintain the same standard of living when relocating between cities.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
              This tool requires JavaScript to function. Please enable JavaScript to compare cost of living across 80+
              cities worldwide.
            </p>
          </header>

          <section className="prose max-w-none">
            <h2>Features</h2>
            <ul>
              <li>80+ cities across 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)</li>
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
