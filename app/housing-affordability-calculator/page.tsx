import type { Metadata } from "next"
import HousingAffordabilityCalculatorPage from "./HousingAffordabilityCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl
  }
  return "https://www.globalinflationcalculator.com"
})()

export const metadata: Metadata = {
  title: "Housing Affordability Calculator - Compare Home Prices to Income | Global Inflation Calculator",
  description:
    "Calculate housing affordability across decades. Compare house price-to-income ratios from 1987 to today using Case-Shiller index and median income data. See how affordable housing is now vs historical periods.",
  keywords: [
    "housing affordability calculator",
    "house price to income ratio",
    "housing affordability index",
    "home affordability calculator",
    "housing market affordability",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
    "median home price calculator",
    "housing cost calculator",
    "real estate affordability",
    "home buying affordability",
    "housing inflation calculator",
    "case shiller index",
    "housing bubble comparison",
    "historical housing prices",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/housing-affordability-calculator`,
  },
  openGraph: {
    title: "Housing Affordability Calculator - Historical Home Price Analysis",
    description:
      "Compare housing affordability across decades. Calculate house price-to-income ratios using real Case-Shiller and median income data from 1987 to today.",
    url: `${siteUrl}/housing-affordability-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Housing+Affordability+Calculator`,
        width: 1200,
        height: 630,
        alt: "Housing Affordability Calculator - Compare Home Prices Across Decades",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Housing Affordability Calculator - Historical Analysis",
    description:
      "Compare housing affordability from 1987 to today. See how house price-to-income ratios have changed over decades.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Housing+Affordability+Calculator`],
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

export default function HousingAffordabilityCalculator() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Housing Affordability Calculator",
        item: `${siteUrl}/housing-affordability-calculator`,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <HousingAffordabilityCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Housing Affordability Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate and compare housing affordability across different time periods using real Case-Shiller Home
                  Price Index and median household income data from 1987 to present.
                </p>

                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Compare house price-to-income ratios across decades</li>
                    <li>• Historical data from 1987 to present using Case-Shiller index</li>
                    <li>• Real median household income data from Federal Reserve</li>
                    <li>• Compare current affordability to housing bubble (2006) and post-crash (2012)</li>
                    <li>• Calculate how many years of income needed to buy a median home</li>
                    <li>• Interactive timeline showing affordability trends</li>
                    <li>• Data-driven insights on housing market conditions</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Key insights">
                  <h3 className="font-semibold mb-2">Key Historical Periods:</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">1990s - Affordable Era</h4>
                      <p className="text-sm text-gray-600">
                        Housing required approximately 3-4 years of median household income, considered historically
                        affordable.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">2006 - Housing Bubble Peak</h4>
                      <p className="text-sm text-gray-600">
                        Price-to-income ratios reached 5-6x, marking the peak of the housing bubble before the 2008
                        financial crisis.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">2012 - Post-Crash Bottom</h4>
                      <p className="text-sm text-gray-600">
                        Housing became most affordable in decades at approximately 3x income, creating buying
                        opportunities.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">2020-2025 - Current Crisis</h4>
                      <p className="text-sm text-gray-600">
                        Price-to-income ratios have reached 6-7x, exceeding even the 2006 bubble peak, making housing
                        less affordable than ever.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mt-6" aria-label="Data sources">
                  <h3 className="font-semibold mb-2">Data Sources:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Case-Shiller U.S. National Home Price Index (FRED: CSUSHPISA)</li>
                    <li>• Median Household Income (FRED: MEHOINUSA672N)</li>
                    <li>• Federal Reserve Economic Data (FRED)</li>
                    <li>• Historical data from 1987 to present</li>
                  </ul>
                </section>

                <nav className="mt-6" aria-label="Navigation">
                  <h3 className="font-semibold mb-2">Other Tools:</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-blue-600 hover:underline">
                        Home - Inflation Calculator
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
                      <Link href="/student-loan-calculator" className="text-blue-600 hover:underline">
                        Student Loan Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/charts" className="text-blue-600 hover:underline">
                        Charts & Analytics
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
                  This calculator requires JavaScript to function. Please enable JavaScript in your browser to use the
                  interactive features.
                </p>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
