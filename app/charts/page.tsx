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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What inflation charts are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our charts include USD Century of Inflation (1913-2025), Healthcare vs General Inflation, Real Estate vs Inflation, Wage Growth vs Inflation, Multi-Currency Comparison across 8 major currencies, Currency Stability Rankings, Regional Inflation Analysis, and more. All charts use official government data from central banks and statistical agencies.",
        },
      },
      {
        "@type": "Question",
        name: "How often are inflation charts updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Charts are updated monthly when new official inflation statistics are released by government agencies like the Bureau of Labor Statistics (BLS), Office for National Statistics (ONS), and Eurostat. Historical data is also reviewed and corrected when revisions are published.",
        },
      },
      {
        "@type": "Question",
        name: "Which currency has the most stable inflation rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Historically, the Swiss Franc (CHF) has shown the most stable inflation rates among major currencies, often maintaining rates near or below 2%. The Euro (EUR) and Japanese Yen (JPY) have also demonstrated relative stability in recent decades. Currency stability depends on central bank policy, economic fundamentals, and geopolitical factors.",
        },
      },
      {
        "@type": "Question",
        name: "How does healthcare inflation compare to general inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Healthcare inflation consistently runs 2-3 percentage points higher than general CPI inflation. Over the past 30 years, healthcare costs have increased at roughly 5-6% annually while general inflation averaged 2-3%. This means healthcare expenses double approximately every 12-15 years, making it a critical consideration for retirement planning.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
