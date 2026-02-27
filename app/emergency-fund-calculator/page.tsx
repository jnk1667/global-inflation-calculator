import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import EmergencyFundCalculatorPage from "./EmergencyFundCalculatorPage"
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
  title: "Emergency Fund Calculator | Build Financial Security",
  description:
    "Calculate 3-6 months emergency fund needs with inflation adjustment. Plan for recession using real BLS salary data by occupation nationwide.",
  keywords: [
    "emergency fund calculator",
    "emergency savings calculator",
    "3 month emergency fund",
    "6 month emergency fund",
    "recession preparation",
    "financial security calculator",
    "savings goal calculator",
    "emergency savings plan",
    "inflation adjusted emergency fund",
    "how much emergency fund do i need",
    "emergency fund recession 2025",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/emergency-fund-calculator`,
  },
  openGraph: {
    title: "Emergency Fund Calculator - Build Financial Security",
    description:
      "Calculate your emergency fund needs with inflation adjustment. Plan for 3-6 months of expenses with real salary data from BLS.",
    url: `${siteUrl}/emergency-fund-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Emergency+Fund+Calculator`,
        width: 1200,
        height: 630,
        alt: "Emergency Fund Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emergency Fund Calculator - Financial Security Planning",
    description:
      "Calculate how much you need in emergency savings for 3-6 months of expenses with inflation adjustment.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Emergency+Fund+Calculator`],
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

export default function EmergencyFundCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Emergency Fund Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate 3-6 month emergency fund needs with inflation adjustment and real BLS salary data by occupation.",
    url: `${siteUrl}/emergency-fund-calculator`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "1523",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "3-6 month emergency fund calculation",
      "Inflation-adjusted savings goals",
      "BLS salary data by occupation",
      "Personalized savings timeline",
      "Recession preparation planning",
      "Multi-currency support",
      "Treasury interest rate data",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Emergency Fund Calculator - Build Financial Security with 3-6 Month Savings",
    description:
      "Comprehensive guide to calculating emergency fund needs with inflation adjustment. Plan for recession using real BLS salary data and Treasury interest rates for optimal savings strategies.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon-96x96.png`,
      },
    },
    datePublished: "2024-02-10",
    dateModified: "2026-02-09",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/emergency-fund-calculator`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Emergency Fund Planning and Savings Rate Dataset",
    description:
      "Comprehensive dataset combining BLS occupational salary data, U.S. Treasury savings rates (3-month bills at 3.67%, I-Bonds at 4.03%), Federal Reserve economic indicators, and inflation data for emergency fund planning in 2026.",
    url: `${siteUrl}/emergency-fund-calculator`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "2023/2026",
    spatialCoverage: {
      "@type": "Place",
      name: "United States",
    },
    variableMeasured: [
      "Monthly Essential Expenses",
      "Emergency Fund Target (3-6-12 months)",
      "High-Yield Savings Account Rate",
      "Treasury I-Bond Rate",
      "Inflation-Adjusted Emergency Fund",
      "Savings Timeline",
      "Recession Risk Indicators",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "U.S. Treasury Savings Rates - February 2026",
        description:
          "Current Treasury rates including 3-month bills at 3.67%, 6-month bills at 3.58%, and 1-year bills at 3.44%. High-yield savings accounts typically track the 3-month Treasury rate, while Series I Savings Bonds offer 4.03% with inflation protection (0.9% fixed rate + 3.13% inflation rate).",
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Occupational Salary Data",
        description:
          "2024 Occupational Employment and Wage Statistics (OEWS) survey data providing mean annual wages and hourly wages for over 800 detailed occupations, used for calculating personalized emergency fund targets based on actual income.",
        url: "https://www.bls.gov/oes/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data - Savings Indicators",
        description:
          "Personal saving rate, household debt-to-income ratios, and economic indicators from FRED used to contextualize emergency fund planning in the current economic environment.",
        url: "https://fred.stlouisfed.org/categories/32991",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "Consumer Price Index for Inflation Adjustment",
        description:
          "U.S. Bureau of Labor Statistics Consumer Price Index (CPI-U) data through February 2026, used to calculate inflation-adjusted emergency fund targets and maintain real purchasing power over time.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "FDIC National Rates and Rate Caps",
        description:
          "Federal Deposit Insurance Corporation data on average interest rates for savings accounts and money market deposit accounts, used to benchmark high-yield savings account performance for emergency fund storage.",
        url: "https://www.fdic.gov/resources/bankers/national-rates/",
        creator: {
          "@type": "Organization",
          name: "Federal Deposit Insurance Corporation",
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
        name: "Emergency Fund Calculator",
        item: `${siteUrl}/emergency-fund-calculator`,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much should I have in my emergency fund?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Financial experts recommend saving 3-6 months of essential expenses. If you have dependents, irregular income, or work in a volatile industry, aim for 6-12 months. Calculate your monthly essential expenses (housing, utilities, food, insurance, minimum debt payments) and multiply by your target months.",
        },
      },
      {
        "@type": "Question",
        name: "Where should I keep my emergency fund?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Keep your emergency fund in a high-yield savings account or money market account that's FDIC-insured. The money should be easily accessible but separate from your checking account to avoid temptation. Avoid investing emergency funds in stocks or other volatile assets.",
        },
      },
      {
        "@type": "Question",
        name: "What counts as an emergency expense?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "True emergencies include job loss, medical emergencies, urgent car repairs, home repairs (broken furnace, roof leak), or unexpected family emergencies. Non-emergencies like vacations, holiday shopping, or planned purchases should come from your regular budget or separate savings.",
        },
      },
      {
        "@type": "Question",
        name: "Should I pay off debt or build an emergency fund first?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start with a small emergency fund of $500-$1,000, then focus on high-interest debt (credit cards over 15% APR). Once high-interest debt is paid, build your full 3-6 month emergency fund. Continue paying minimums on all debts while building your emergency fund.",
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
      <EmergencyFundCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Emergency Fund Calculator - Financial Security Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate how much you need in your emergency fund for 3-6 months of expenses. Build financial
                  security with inflation-adjusted emergency savings planning.
                </p>

                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Calculate 3-6 month emergency fund targets</li>
                    <li>• Inflation-adjusted emergency savings goals</li>
                    <li>• Real salary data by occupation from Bureau of Labor Statistics</li>
                    <li>• Personalized savings timeline calculator</li>
                    <li>• Recession preparation planning tools</li>
                    <li>• Multi-currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)</li>
                    <li>• Treasury interest rate data</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Why emergency funds matter">
                  <h3 className="font-semibold mb-2">Why Emergency Funds Matter in 2025:</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Economic Uncertainty</h4>
                      <p className="text-sm text-gray-600">
                        With recession concerns in 2025, emergency funds provide a critical financial buffer against job
                        loss, medical emergencies, or unexpected expenses.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Inflation Protection</h4>
                      <p className="text-sm text-gray-600">
                        Our calculator adjusts your emergency fund for inflation, ensuring your savings maintain
                        purchasing power over time.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Peace of Mind</h4>
                      <p className="text-sm text-gray-600">
                        Studies show that less than 50% of Americans have 3 months of expenses saved. Building an
                        emergency fund reduces financial stress.
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
