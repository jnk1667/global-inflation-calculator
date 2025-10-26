import type { Metadata } from "next"
import RetirementCalculatorPage from "./RetirementCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Retirement Calculator - Complete Planning Tool | Global Inflation Calculator",
  description:
    "Comprehensive retirement calculator with lifestyle maintenance, crisis analysis, generation gap comparison, and healthcare cost projections. Plan your retirement with accurate inflation-adjusted calculations.",
  keywords: [
    "retirement calculator",
    "retirement planning",
    "lifestyle maintenance calculator",
    "retirement crisis calculator",
    "generation retirement gap",
    "healthcare retirement costs",
    "401k calculator",
    "retirement savings",
    "purchasing power retirement",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
    "inflation adjusted retirement",
  ],
  openGraph: {
    title: "Complete Retirement Calculator - Plan Your Financial Future",
    description:
      "Calculate retirement needs with lifestyle maintenance, crisis analysis, and healthcare cost projections. Compare generational retirement requirements.",
    url: "/retirement-calculator",
    type: "website",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200&text=Retirement+Calculator",
        width: 1200,
        height: 630,
        alt: "Comprehensive Retirement Planning Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete Retirement Calculator - Plan Your Financial Future",
    description:
      "Calculate retirement needs with lifestyle maintenance, crisis analysis, and healthcare cost projections.",
  },
  alternates: {
    canonical: "/retirement-calculator",
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
        name: "Retirement Calculator",
        item: "https://www.globalinflationcalculator.com/retirement-calculator",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <RetirementCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Retirement Calculator - Complete Planning Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Comprehensive retirement planning calculator with lifestyle maintenance analysis, crisis scenarios,
                  generation gap comparison, and healthcare cost projections.
                </p>

                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Lifestyle Maintenance Calculator - Maintain your current standard of living</li>
                    <li>• Retirement Crisis Calculator - Assess financial risks and vulnerabilities</li>
                    <li>• Generation Gap Calculator - Compare retirement needs across generations</li>
                    <li>• Healthcare Cost Projections - Plan for medical expenses in retirement</li>
                    <li>• Inflation-adjusted calculations using real CPI data</li>
                    <li>• Multiple retirement scenarios and stress testing</li>
                    <li>• Social Security integration and benefit optimization</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Planning considerations">
                  <h3 className="font-semibold mb-2">Key Planning Considerations:</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Lifestyle Maintenance</h4>
                      <p className="text-sm text-gray-600">
                        Calculate how much you need to maintain your current lifestyle in retirement, accounting for
                        inflation and changing expenses.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Healthcare Costs</h4>
                      <p className="text-sm text-gray-600">
                        Healthcare inflation typically runs 2-3% higher than general inflation. Plan for increasing
                        medical expenses as you age.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Longevity Risk</h4>
                      <p className="text-sm text-gray-600">
                        With increasing life expectancy, plan for 25-30 years of retirement to avoid outliving your
                        savings.
                      </p>
                    </div>
                  </div>
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
                      <Link href="/charts" className="text-blue-600 hover:underline">
                        Charts & Analytics
                      </Link>
                    </li>
                    <li>
                      <Link href="/legacy-planner" className="text-blue-600 hover:underline">
                        Legacy Planner
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
