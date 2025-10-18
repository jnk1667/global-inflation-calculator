import type { Metadata } from "next"
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
  title: "Student Loan Calculator - Calculate Repayment Plans | Global Inflation Calculator",
  description:
    "Calculate student loan repayment plans, monthly payments, and total interest costs. Compare federal and private loan options with real salary data by occupation and major.",
  keywords: [
    "student loan calculator",
    "loan repayment calculator",
    "federal student loan calculator",
    "private student loan calculator",
    "monthly payment calculator",
    "student debt calculator",
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
    title: "Student Loan Calculator - Compare Repayment Plans & Calculate Costs",
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
  return (
    <>
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
                        Real salary data by occupation from the 2023 Occupational Employment and Wage Statistics (OEWS)
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
