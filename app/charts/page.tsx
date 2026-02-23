import type { Metadata } from "next"
import ChartsPage from "./ChartsPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Inflation Charts & Analytics | Global Calculator",
  description:
    "Interactive inflation charts across 8 currencies from 1913-2025. Visualize purchasing power erosion, currency stability, and historical trends.",
  keywords: [
    "inflation charts",
    "currency analytics",
    "inflation calculator usd",
    "purchasing power charts",
    "inflation visualization",
    "currency stability",
    "healthcare inflation",
    "historical inflation data",
    "inflation trends",
    "global inflation calculator",
    "currency comparison",
    "inflation rate distribution",
    "cross currency correlation",
    "regional inflation analysis",
    "rolling average inflation",
    "purchasing power convergence",
  ],
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/charts",
  },
  openGraph: {
    title: "Inflation Charts & Analytics | Global Calculator",
    description:
      "Interactive inflation charts across 8 currencies from 1913-2025. Visualize purchasing power erosion, currency stability, and historical trends.",
    url: "https://www.globalinflationcalculator.com/charts",
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/og-charts.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator Charts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inflation Charts & Analytics | Global Calculator",
    description: "Interactive inflation charts across 8 currencies from 1913-2025",
    images: ["https://www.globalinflationcalculator.com/og-charts.png"],
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
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Inflation Charts & Analytics",
    applicationCategory: "FinanceApplication",
    description:
      "Interactive inflation charts and analytics tool visualizing historical inflation data across 8 currencies from 1913-2025.",
    url: "https://www.globalinflationcalculator.com/charts",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "1543",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
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
        name: "Charts",
        item: "https://www.globalinflationcalculator.com/charts",
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inflation Charts & Analytics - Visualize Currency Trends Across Time",
    description:
      "Interactive inflation charts and analytics across 8 currencies from 1913-2025. Visualize purchasing power erosion, currency stability, healthcare inflation, and historical trends.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: "https://www.globalinflationcalculator.com/favicon-96x96.png",
      },
    },
    datePublished: "2024-01-20",
    dateModified: "2026-02-02",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.globalinflationcalculator.com/charts",
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Multi-Currency Inflation Visualization Dataset",
    description:
      "Comprehensive visualization dataset for inflation rates, purchasing power changes, currency stability rankings, and cross-currency correlations from 1913-2025.",
    url: "https://www.globalinflationcalculator.com/charts",
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "1913/2025",
    spatialCoverage: {
      "@type": "Place",
      name: "Global - 8 Major Currencies",
    },
    variableMeasured: [
      "Annual Inflation Rate",
      "Cumulative Inflation",
      "Purchasing Power Index",
      "Currency Stability Score",
      "Healthcare Inflation",
      "Real Estate Inflation",
      "Wage Growth",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics CPI",
        description: "U.S. Consumer Price Index time series data including urban consumers (CPI-U), core inflation, and detailed expenditure category inflation rates from 1913 to present.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data (FRED)",
        description: "Economic time series for inflation analysis including CPI, PCE, GDP deflator, and cross-country purchasing power parity data from the Federal Reserve Bank of St. Louis.",
        url: "https://fred.stlouisfed.org/",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "Office for National Statistics UK",
        description: "UK inflation time series including Consumer Prices Index (CPI), CPIH, Retail Prices Index (RPI), and component price indices from 1947 to present.",
        url: "https://www.ons.gov.uk/",
        creator: {
          "@type": "Organization",
          name: "UK Office for National Statistics",
        },
        license: "http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      },
      {
        "@type": "Dataset",
        name: "Eurostat",
        description: "Harmonised Index of Consumer Prices (HICP) for visualization and cross-country comparison across all European Union member states from 1996 onwards.",
        url: "https://ec.europa.eu/eurostat/",
        creator: {
          "@type": "Organization",
          name: "Eurostat - European Commission",
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "OECD Statistics",
        description: "International inflation and purchasing power parity statistics covering OECD member countries, including CPI, healthcare costs, and cost of living indices.",
        url: "https://stats.oecd.org/",
        creator: {
          "@type": "Organization",
          name: "Organisation for Economic Co-operation and Development",
        },
        license: "https://www.oecd.org/en/about/terms-conditions.html",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What inflation data do the charts show?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The charts display historical inflation rates across multiple countries from 1913 to 2025, sourced from official government statistics bureaus including the US Bureau of Labor Statistics, UK Office for National Statistics, Eurostat, Statistics Canada, Australian Bureau of Statistics, and other central banks worldwide.",
        },
      },
      {
        "@type": "Question",
        name: "How do I compare inflation across countries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the interactive charts to select multiple countries and view their inflation rates side by side. The comparison feature helps you understand how different economies experience inflation differently due to monetary policy, economic conditions, and regional factors. You can filter by date range to focus on specific periods.",
        },
      },
      {
        "@type": "Question",
        name: "What time periods can I analyze?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The charts cover inflation data from 1913 to 2025, allowing you to analyze over a century of inflation trends. You can zoom into specific periods like the Great Depression, post-war inflation, the 1970s stagflation, the 2008 financial crisis, or recent pandemic-era inflation spikes.",
        },
      },
      {
        "@type": "Question",
        name: "How often is the inflation data updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The inflation data is updated monthly with the latest releases from official government sources. Historical data remains stable, while current year data is refreshed as new CPI reports are published by national statistics bureaus, typically within the first two weeks of each month.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download or export the chart data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can export chart data and visualizations for your own analysis or presentations. The charts are interactive and allow you to hover over data points to see specific values, making it easy to extract the information you need for research, reports, or financial planning.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ChartsPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Charts & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Explore comprehensive inflation charts and analytics across multiple currencies from 1913-2025.
                </p>

                <section aria-label="Available charts">
                  <h3 className="font-semibold mb-2">Available Charts:</h3>
                  <ul className="space-y-2">
                    <li>• USD Century of Inflation (1913-2025)</li>
                    <li>• Healthcare vs General Inflation</li>
                    <li>• Real Estate vs Inflation</li>
                    <li>• Wage Growth vs Inflation</li>
                    <li>• Commodity Price Correlation</li>
                    <li>• Multi-Currency Comparison</li>
                    <li>• Cost of Living Trends (PCE)</li>
                    <li>• Decade-by-Decade Analysis</li>
                    <li>• Currency Stability Rankings</li>
                    <li>• Inflation Rate Distribution</li>
                    <li>• Regional Inflation Comparison</li>
                  </ul>
                </section>

                <nav className="mt-6" aria-label="Navigation">
                  <h3 className="font-semibold mb-2">Navigation:</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-blue-600 hover:underline">
                        Home - Inflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/deflation-calculator" className="text-blue-600 hover:underline">
                        Deflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/salary-calculator" className="text-blue-600 hover:underline">
                        Salary Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/retirement-calculator" className="text-blue-600 hover:underline">
                        Retirement Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="text-blue-600 hover:underline">
                        About Us
                      </Link>
                    </li>
                  </ul>
                </nav>

                <p className="text-sm text-gray-600 mt-6">
                  This page requires JavaScript to display interactive charts. Please enable JavaScript in your browser.
                </p>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
