import Script from "next/script"

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
  return (
    <>
      <Script id="schema-tool" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(toolSchema)}
      </Script>
      <Script id="schema-breadcrumb" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(breadcrumbSchema)}
      </Script>
      <Script id="schema-faq" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(faqSchema)}
      </Script>
      <Script id="schema-dataset" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(datasetSchema)}
      </Script>
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
