import type { Metadata } from "next"
import SalaryCalculatorPage from "./SalaryCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Salary Calculator - Adjust for Inflation | Global Inflation Calculator",
  description:
    "Calculate how inflation affects your salary over time. Compare purchasing power and real wages across different years with our comprehensive salary inflation calculator.",
  keywords: "salary calculator, inflation adjustment, real wages, purchasing power, salary inflation, wage calculator",
  openGraph: {
    title: "Salary Calculator - Adjust for Inflation",
    description:
      "Calculate how inflation affects your salary over time. Compare purchasing power and real wages across different years.",
    url: "https://globalinflationcalculator.com/salary-calculator",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://globalinflationcalculator.com/og-salary-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Salary Calculator - Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Calculator - Adjust for Inflation",
    description: "Calculate how inflation affects your salary over time. Compare purchasing power and real wages.",
    images: ["https://globalinflationcalculator.com/og-salary-calculator.jpg"],
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/salary-calculator",
  },
}

export default function SalaryCalculatorPageRoute() {
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
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SalaryCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Salary Calculator - Inflation Adjustment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate how inflation affects your salary over time. Compare purchasing power and real wages across
                  different years with accurate inflation data.
                </p>

                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Adjust salary for inflation across multiple years</li>
                    <li>• Compare real wages vs nominal wages</li>
                    <li>• Calculate purchasing power changes</li>
                    <li>• Regional cost of living adjustments</li>
                    <li>• Historical salary data analysis</li>
                    <li>• Multi-currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="How it works">
                  <h3 className="font-semibold mb-2">How It Works:</h3>
                  <p className="mb-3">
                    Our salary calculator uses official Consumer Price Index (CPI) data to adjust your salary for
                    inflation. This shows you the real purchasing power of your income over time.
                  </p>
                  <p className="mb-3">
                    <strong>Example:</strong> A $50,000 salary in 2000 would need to be $80,000 in 2024 to maintain the
                    same purchasing power, based on cumulative inflation of approximately 60%.
                  </p>
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
                      <Link href="/deflation-calculator" className="text-blue-600 hover:underline">
                        Deflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/charts" className="text-blue-600 hover:underline">
                        Charts & Analytics
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
                  This calculator requires JavaScript to function. Please enable JavaScript in your browser to use the
                  interactive features.
                </p>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
      {/* </CHANGE> */}
    </>
  )
}
