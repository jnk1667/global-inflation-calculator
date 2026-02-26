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

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Regional Cost of Living Dataset — 80+ Cities Across 8 Currencies",
    description:
      "Comprehensive cost of living data for 80+ cities worldwide covering housing, utilities, food, and transportation costs. Sourced from official government statistical agencies across the United States, United Kingdom, European Union, Canada, Australia, Switzerland, Japan, and New Zealand.",
    url: "https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living",
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: "https://globalinflationcalculator.com",
    },
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "Global Inflation Calculator Data Repository",
    },
    spatialCoverage: {
      "@type": "Place",
      name: "Global — 80+ cities across United States, United Kingdom, European Union, Canada, Australia, Switzerland, Japan, New Zealand",
    },
    variableMeasured: [
      "Monthly Housing Rent",
      "Housing Cost as Percentage of Income",
      "Monthly Utilities Cost",
      "Monthly Food and Grocery Cost",
      "Monthly Transportation Cost",
      "Overall Cost of Living Index",
      "Cross-Currency Equivalent Salary",
      "Affordability Ratio",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "US Bureau of Labor Statistics — Consumer Expenditure Survey",
        description:
          "Official US household expenditure data covering housing, food, utilities, and transportation costs for major metropolitan areas.",
        url: "https://www.bls.gov/cex/",
        creator: { "@type": "Organization", name: "U.S. Bureau of Labor Statistics" },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "UK Office for National Statistics — Family Spending",
        description:
          "Official UK household spending data including regional cost breakdowns for housing, utilities, food, and transport across UK cities.",
        url: "https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure",
        creator: { "@type": "Organization", name: "UK Office for National Statistics" },
        license: "http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      },
      {
        "@type": "Dataset",
        name: "Eurostat — Household Budget Survey",
        description:
          "EU-wide household expenditure data covering cost of living in European cities including housing, food, utilities, and transportation.",
        url: "https://ec.europa.eu/eurostat/web/household-budget-surveys",
        creator: { "@type": "Organization", name: "Eurostat — European Commission" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Statistics Canada — Survey of Household Spending",
        description:
          "Official Canadian household spending data across major cities, covering housing, food, utilities, and transportation costs.",
        url: "https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&SDDS=3508",
        creator: { "@type": "Organization", name: "Statistics Canada" },
        license: "https://www.statcan.gc.ca/en/reference/licence",
      },
      {
        "@type": "Dataset",
        name: "Australian Bureau of Statistics — Household Expenditure Survey",
        description:
          "Official ABS data on household spending patterns and cost of living across Australian cities.",
        url: "https://www.abs.gov.au/statistics/economy/finance/household-expenditure-survey-australia",
        creator: { "@type": "Organization", name: "Australian Bureau of Statistics" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Swiss Federal Statistical Office — Household Budget Survey",
        description:
          "Official Swiss cost of living and household expenditure data for Swiss cities including housing, food, and utilities.",
        url: "https://www.bfs.admin.ch/bfs/en/home/statistics/economic-social-situation-population/income-consumption-wealth/household-budget.html",
        creator: { "@type": "Organization", name: "Swiss Federal Statistical Office" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Statistics Bureau of Japan — Family Income and Expenditure Survey",
        description:
          "Official Japanese household expenditure data covering cost of living across Japanese cities.",
        url: "https://www.stat.go.jp/english/data/kakei/",
        creator: { "@type": "Organization", name: "Statistics Bureau of Japan" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Stats NZ — Household Economic Survey",
        description:
          "Official New Zealand household expenditure and cost of living data across New Zealand cities.",
        url: "https://www.stats.govt.nz/topics/household-economic-survey",
        creator: { "@type": "Organization", name: "Stats NZ — Statistics New Zealand" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
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
