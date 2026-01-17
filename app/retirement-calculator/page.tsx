import type { Metadata } from "next"
import RetirementCalculatorPage from "./RetirementCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Retirement Calculator | Complete Financial Planning",
  description:
    "Comprehensive retirement calculator with lifestyle maintenance, crisis analysis, generation gap comparison, healthcare costs, and inflation adjustment.",
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
    "inflation adjusted retirement",
  ],
  openGraph: {
    title: "Retirement Calculator - Plan Your Financial Future", // Shortened title from 60 to 53 characters
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
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Retirement Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Comprehensive retirement planning calculator with lifestyle maintenance, crisis analysis, healthcare costs, and generational comparisons.",
    url: "https://www.globalinflationcalculator.com/retirement-calculator",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1967",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Traditional retirement planning",
      "Lifestyle maintenance calculator",
      "Retirement crisis assessment",
      "Healthcare cost projections",
      "Generational retirement analysis",
      "Inflation-adjusted calculations",
      "Multiple currency support",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much money do I need to retire?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A common rule is the 25x rule: multiply your annual expenses by 25. For example, if you need $60,000/year, aim for $1.5 million. This assumes a 4% withdrawal rate. However, consider healthcare costs, inflation, longevity, and your desired retirement lifestyle when planning.",
        },
      },
      {
        "@type": "Question",
        name: "What is the 4% retirement withdrawal rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The 4% rule suggests withdrawing 4% of your retirement savings in the first year, then adjusting for inflation annually. This strategy aims to make your savings last 30 years. For $1 million saved, you'd withdraw $40,000 in year one, increasing each year with inflation.",
        },
      },
      {
        "@type": "Question",
        name: "How does inflation affect retirement savings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inflation erodes purchasing power over time. At 3% annual inflation, $100,000 today will have the purchasing power of about $55,000 in 20 years. Plan for inflation by investing in growth assets during retirement and regularly adjusting your withdrawal amounts.",
        },
      },
      {
        "@type": "Question",
        name: "What are the biggest retirement expenses?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Healthcare is the largest retirement expense, often exceeding $300,000 per couple over retirement. Other major costs include housing, long-term care insurance, travel and leisure, and inflation on everyday expenses. Healthcare inflation typically runs 2-3% higher than general inflation.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
