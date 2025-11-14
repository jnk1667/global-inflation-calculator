import type { Metadata } from "next"
import ChartsPage from "./ChartsPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Charts & Analytics - Global Inflation Calculator",
  description:
    "Comprehensive inflation charts and analytics across many currencies. Visualize the purchasing power erosion, inflation and healthcare trends with data graphs.",
  keywords: [
    "inflation charts",
    "currency analytics",
    "inflation calculator usd",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
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
    title: "Inflation Charts & Analytics - Global Inflation Calculator",
    description:
      "Comprehensive inflation charts and analytics across multiple currencies from 1913-2025. Interactive visualizations of purchasing power erosion, currency stability, and healthcare inflation trends.",
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
    title: "Inflation Charts & Analytics - Global Inflation Calculator",
    description: "Interactive inflation charts across multiple currencies from 1913-2025",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
