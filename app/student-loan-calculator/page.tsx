import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import StudentLoanCalculatorPage from "./StudentLoanCalculatorPage"
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
  title: "Student Loan Calculator | Repayment Plan Comparison",
  description:
    "Calculate student loan payments and total interest costs. Compare federal and private loan options with real BLS salary data by occupation.",
  keywords: [
    "student loan calculator",
    "loan repayment calculator",
    "federal student loan calculator",
    "private student loan calculator",
    "monthly payment calculator",
    "student debt calculator",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
    "loan interest calculator",
    "education loan calculator",
    "repayment plan comparison",
    "student loan cost estimator",
    "income-driven repayment calculator",
    "loan forgiveness calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/student-loan-calculator`,
  },
  openGraph: {
    title: "Student Loan Calculator - Compare Repayment Plans",
    description:
      "Calculate student loan payments, total interest costs, and compare repayment options. Real salary data by occupation and major from BLS and College Scorecard.",
    url: `${siteUrl}/student-loan-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Student+Loan+Calculator`,
        width: 1200,
        height: 630,
        alt: "Student Loan Repayment Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Loan Calculator - Compare Repayment Plans",
    description: "Calculate student loan payments and total interest costs. Compare federal and private loan options.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Student+Loan+Calculator`],
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

export default function StudentLoanCalculator() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Student Loan Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate student loan payments, compare repayment plans, and estimate total costs with real salary data by occupation and major.",
    url: `${siteUrl}/student-loan-calculator`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      ratingCount: "1892",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Federal and private loan calculations",
      "Standard, graduated, and income-driven repayment plans",
      "Total interest cost estimation",
      "BLS salary data by occupation",
      "College Scorecard earnings by major",
      "Federal interest rates and poverty guidelines",
      "Tax bracket analysis",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Student Loan Calculator - Compare Repayment Plans & Income-Driven Options",
    description:
      "Comprehensive guide to calculating student loan payments with real BLS salary data by occupation and College Scorecard earnings by major. Compare federal and private loan repayment plans.",
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/og-image.png`,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon-96x96.png`,
      },
    },
    datePublished: "2024-01-18T00:00:00Z",
    dateModified: "2026-04-29T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/student-loan-calculator`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Student Loan Repayment and Salary Dataset",
    description:
      "Comprehensive dataset combining federal student loan interest rates (2013-2026), BLS occupational salary data, College Scorecard earnings by major, and HHS poverty guidelines for income-driven repayment calculations.",
    url: `${siteUrl}/student-loan-calculator`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "2013/2026",
    spatialCoverage: {
      "@type": "Place",
      name: "United States",
    },
    variableMeasured: [
      "Federal Student Loan Interest Rate",
      "Occupational Mean Salary",
      "Median Earnings by College Major",
      "Federal Poverty Guideline",
      "Monthly Loan Payment",
      "Total Interest Cost",
      "Discretionary Income",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Occupational Employment and Wage Statistics",
        description:
          "Comprehensive salary data by occupation from the 2024 Occupational Employment and Wage Statistics (OEWS) survey, including mean annual wages, hourly wages, and employment levels for over 800 detailed occupations.",
        url: "https://www.bls.gov/oes/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "U.S. Department of Education College Scorecard",
        description:
          "Median earnings data by college major (CIP code) 10 years after enrollment, including 25th and 75th percentile earnings and sample sizes for over 1,000 fields of study from the College Scorecard API.",
        url: "https://collegescorecard.ed.gov/data/",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of Education",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Student Aid Interest Rates",
        description:
          "Official federal student loan interest rates for Direct Subsidized Loans (6.39%), Direct Unsubsidized Loans for undergraduates (6.39%) and graduate students (7.94%), and Direct PLUS Loans (8.94%) for the 2025-2026 academic year, with historical rates from 2013 onwards.",
        url: "https://studentaid.gov/understand-aid/types/loans/interest-rates",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of Education - Federal Student Aid",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "HHS Federal Poverty Guidelines",
        description:
          "Annual poverty guidelines issued by the Department of Health and Human Services for the 48 contiguous states and DC, Alaska, and Hawaii, used to calculate discretionary income for income-driven repayment plans.",
        url: "https://aspe.hhs.gov/poverty-guidelines",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of Health and Human Services",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "IRS Federal Tax Brackets",
        description:
          "Current federal income tax brackets and rates for single filers, married filing jointly, and head of household, used for calculating after-tax income in repayment planning.",
        url: "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
        creator: {
          "@type": "Organization",
          name: "Internal Revenue Service",
        },
        license: "https://www.usa.gov/government-works",
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
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Student Loan Calculator",
        item: `${siteUrl}/student-loan-calculator`,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the average student loan payment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The average monthly student loan payment is around $200-$300, but this varies widely based on loan amount, interest rate, and repayment plan. For the average borrower with $30,000 in loans at 5% interest on a 10-year plan, payments are approximately $318/month.",
        },
      },
      {
        "@type": "Question",
        name: "Should I pay off student loans early?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It depends on your interest rate and financial situation. If your rate is above 6%, prioritize paying extra toward loans. If below 4%, you might benefit more from investing. Always pay high-interest debt (credit cards) first and maintain an emergency fund before making extra loan payments.",
        },
      },
      {
        "@type": "Question",
        name: "What is an income-driven repayment plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Income-driven repayment (IDR) plans cap monthly payments at 10-20% of discretionary income based on family size and poverty guidelines. After 20-25 years of payments, remaining balances may be forgiven. Popular IDR plans include SAVE (formerly REPAYE), PAYE, and IBR.",
        },
      },
      {
        "@type": "Question",
        name: "How is student loan interest calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Student loan interest is calculated daily based on your outstanding principal balance and interest rate. Formula: (Principal × Interest Rate) ÷ 365 = daily interest. Monthly interest is the daily amount multiplied by the number of days in the month. Interest compounds, meaning you pay interest on accumulated interest.",
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
      <StudentLoanCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Student Loan Calculator - Repayment Planning Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate student loan repayment plans, monthly payments, and total interest costs. Compare federal
                  and private loan options with real salary data from BLS and College Scorecard.
                </p>

                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Calculate monthly payments for federal and private student loans</li>
                    <li>• Compare standard, graduated, and income-driven repayment plans</li>
                    <li>• Estimate total interest costs over the life of the loan</li>
                    <li>• Real salary data by occupation from Bureau of Labor Statistics</li>
                    <li>• Earnings by college major from College Scorecard</li>
                    <li>• Federal loan interest rates and poverty guidelines</li>
                    <li>• Tax bracket analysis for income-driven repayment</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Data sources">
                  <h3 className="font-semibold mb-2">Data Sources:</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Bureau of Labor Statistics (BLS)</h4>
                      <p className="text-sm text-gray-600">
                        Real salary data by occupation from the 2025 Occupational Employment and Wage Statistics (OEWS)
                        survey.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">College Scorecard API</h4>
                      <p className="text-sm text-gray-600">
                        Median earnings by college major from the U.S. Department of Education College Scorecard.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Federal Student Aid</h4>
                      <p className="text-sm text-gray-600">
                        Current federal student loan interest rates for Direct Subsidized, Unsubsidized, and PLUS loans.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">HHS Poverty Guidelines</h4>
                      <p className="text-sm text-gray-600">
                        Federal poverty guidelines used for income-driven repayment plan calculations.
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
                      <Link href="/retirement-calculator" className="text-blue-600 hover:underline">
                        Retirement Calculator
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
