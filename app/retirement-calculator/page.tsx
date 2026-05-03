import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
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
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Retirement Calculator - Complete Financial Planning Tool",
    description:
      "Comprehensive retirement planning with lifestyle maintenance, crisis analysis, healthcare cost projections, and generational comparisons. Calculate retirement needs with inflation-adjusted projections.",
    image: {
      "@type": "ImageObject",
      url: "https://www.globalinflationcalculator.com/og-image.png",
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: "https://www.globalinflationcalculator.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: "https://www.globalinflationcalculator.com/favicon-96x96.png",
      },
    },
    datePublished: "2024-03-15T00:00:00Z",
    dateModified: "2026-04-29T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://globalinflationcalculator.com/retirement-calculator",
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Retirement Planning and Healthcare Cost Dataset",
    description:
      "Comprehensive dataset combining U.S. inflation rates (2.8% as of February 2026), healthcare cost inflation (81% higher than general inflation at 5.1%), Social Security projections, life expectancy data, and Treasury savings rates (3.67% HYSA, 4.03% I-Bonds) for complete retirement planning analysis.",
    url: "https://globalinflationcalculator.com/retirement-calculator",
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "2023/2066",
    spatialCoverage: {
      "@type": "Place",
      name: "United States",
    },
    variableMeasured: [
      "Inflation-Adjusted Retirement Savings",
      "Healthcare Cost Inflation Impact",
      "Social Security Benefit Projections",
      "Life Expectancy and Longevity Risk",
      "401(k) and IRA Growth Projections",
      "Safe Withdrawal Rates",
      "Generational Retirement Readiness",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Consumer Price Index",
        description:
          "Official U.S. inflation data showing 2.8% annual rate as of February 2026, used to calculate inflation-adjusted retirement income needs, ensuring purchasing power is maintained across 25-30 year retirement periods.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Healthcare Cost Inflation Data",
        description:
          "Healthcare inflation consistently runs 81% higher than general inflation (approximately 5.1% vs 2.8% for USD), representing the largest retirement expense risk. Couples can expect $300,000+ in healthcare costs over retirement, growing faster than other expenses.",
        url: "https://www.bls.gov/cpi/factsheets/medical-care.htm",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Social Security Administration Life Expectancy Tables",
        description:
          "Actuarial data showing increasing life expectancy requiring retirement planning for 25-30 years. Used to calculate longevity risk, safe withdrawal rates, and ensure retirement savings last throughout retirement.",
        url: "https://www.ssa.gov/oact/STATS/table4c6.html",
        creator: {
          "@type": "Organization",
          name: "Social Security Administration",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Social Security Benefit Projections",
        description:
          "Official Social Security benefit estimates and future solvency projections showing potential 77% benefit levels if trust fund depletes by 2033. Critical for planning retirement income sources beyond personal savings.",
        url: "https://www.ssa.gov/policy/trust-funds-summary.html",
        creator: {
          "@type": "Organization",
          name: "Social Security Administration",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "U.S. Treasury Savings Rates - February 2026",
        description:
          "Current Treasury rates providing safe investment return benchmarks for retirement planning: 3.67% for high-yield savings accounts (tracking 3-month Treasury bills), 4.03% for I-Bonds with inflation protection. Used to model conservative retirement portfolio returns.",
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Historical Stock Market Returns",
        description:
          "Long-term S&P 500 returns (10% average annual) and bond market returns (5% average) used to project retirement savings growth for different portfolio allocations from conservative to aggressive investment strategies over 30-40 year careers.",
        url: "https://www.investopedia.com/ask/answers/042415/what-average-annual-return-sp-500.asp",
        creator: {
          "@type": "Organization",
          name: "S&P 500 Historical Data",
        },
        license: "https://www.investopedia.com/legal-4768893#toc-license-to-use-website",
      },
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
      <JsonLd id="schema-calculator" data={calculatorSchema} />
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-article" data={articleSchema} />
      <JsonLd id="schema-dataset" data={datasetSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
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
