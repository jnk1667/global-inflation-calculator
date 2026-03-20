import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const BudgetCalculatorPage = dynamic(() => import("./BudgetCalculatorPage"), {
  loading: () => (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <div className="h-10 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-2/3 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="grid gap-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    </div>
  ),
})

export const metadata: Metadata = {
  title: "50/30/20 Budget Calculator | Income Budgeting",
  description:
    "Free 50/30/20 budget calculator splits income: 50% needs, 30% wants, 20% savings. Simple budgeting with inflation adjustment included.",
  keywords: [
    "50/30/20 budget calculator",
    "50 30 20 rule",
    "budget calculator",
    "personal budget planner",
    "spending plan calculator",
    "budgeting tool",
    "financial planning calculator",
    "50 30 20 budget rule",
    "income budgeting",
    "monthly budget calculator",
  ],
  openGraph: {
    title: "50/30/20 Budget Calculator - Income Budgeting Tool",
    description:
      "Split your income the smart way: 50% needs, 30% wants, 20% savings. Free budget calculator with inflation adjustment.",
    type: "website",
    url: "https://www.globalinflationcalculator.com/budget-calculator",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/og-budget-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "50/30/20 Budget Calculator - Global Inflation Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "50/30/20 Budget Calculator - Simple Budgeting Tool",
    description:
      "Split your income: 50% needs, 30% wants, 20% savings. Free budget calculator with inflation adjustment.",
    images: ["https://www.globalinflationcalculator.com/og-budget-calculator.jpg"],
  },
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/budget-calculator",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Page() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "50/30/20 Budget Calculator - Master the Simple Budgeting Rule",
    description:
      "Comprehensive guide to the 50/30/20 budget rule with inflation-adjusted planning. Split your income into 50% needs, 30% wants, and 20% savings using official BLS and Federal Reserve data.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: "https://www.globalinflationcalculator.com/favicon-96x96.png",
      },
    },
    datePublished: "2024-02-15",
    dateModified: "2026-02-09",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.globalinflationcalculator.com/budget-calculator",
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Personal Budget Planning and Inflation Dataset",
    description:
      "Comprehensive dataset combining U.S. inflation rates (2.8% as of February 2026), Treasury savings rates, median household income data, and consumer spending patterns from BLS and Federal Reserve for effective 50/30/20 budget planning.",
    url: "https://www.globalinflationcalculator.com/budget-calculator",
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
      "Monthly Income Allocation (50/30/20 Split)",
      "Consumer Price Index (CPI)",
      "Inflation-Adjusted Budget Projections",
      "Savings Rate Benchmarks",
      "Treasury Savings Account Rates",
      "Consumer Spending Categories",
      "Long-term Budget Growth with Inflation",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Consumer Price Index",
        description:
          "Official U.S. inflation data showing 2.8% annual rate as of February 2026, used to calculate inflation-adjusted budget projections and ensure purchasing power maintenance across spending categories over time.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "BLS Consumer Expenditure Survey",
        description:
          "Annual survey data on household spending patterns across housing, transportation, food, healthcare, and entertainment categories, providing real-world benchmarks for validating 50/30/20 budget allocations against average American spending.",
        url: "https://www.bls.gov/cex/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "U.S. Census Bureau Median Household Income",
        description:
          "Current median household income statistics ($83,730 for 2024) used as baseline for budget calculations, enabling personalized budget plans based on real income distributions across U.S. households.",
        url: "https://www.census.gov/data/tables/time-series/demo/income-poverty/historical-income-households.html",
        creator: {
          "@type": "Organization",
          name: "U.S. Census Bureau",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Federal Reserve Economic Data - Personal Saving Rate",
        description:
          "Historical personal saving rate data from FRED showing how American households allocate income to savings versus consumption, validating the 20% savings target in the 50/30/20 rule.",
        url: "https://fred.stlouisfed.org/series/PSAVERT",
        creator: {
          "@type": "Organization",
          name: "Federal Reserve Bank of St. Louis",
        },
        license: "https://fred.stlouisfed.org/legal/",
      },
      {
        "@type": "Dataset",
        name: "U.S. Treasury Savings Rates - February 2026",
        description:
          "Current savings account rates (3.67% for high-yield savings tracking 3-month Treasury bills, 4.03% for I-Bonds) used to calculate growth potential of the 20% savings allocation over time with compound interest.",
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury",
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
        item: "https://www.globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "50/30/20 Budget Calculator",
        item: "https://www.globalinflationcalculator.com/budget-calculator",
      },
    ],
  }

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "50/30/20 Budget Calculator",
    description:
      "Free budget calculator that splits your income into needs (50%), wants (30%), and savings (20%) with inflation adjustment.",
    url: "https://www.globalinflationcalculator.com/budget-calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1654",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the budget calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The budget calculator helps you create and manage a comprehensive household budget by tracking your income, fixed expenses, variable expenses, and savings goals. It provides a clear picture of your financial health and helps identify areas for improvement.",
        },
      },
      {
        "@type": "Question",
        name: "How do I create an effective budget?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start by listing all sources of income, then categorize your expenses into fixed (rent, insurance) and variable (groceries, entertainment). Aim to allocate at least 20% to savings and investments, 50% to needs, and 30% to wants. Adjust these percentages based on your financial goals and circumstances.",
        },
      },
      {
        "@type": "Question",
        name: "What expenses should I track in my budget?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Track all expenses including housing (rent/mortgage, utilities, insurance), transportation (car payments, gas, maintenance), food (groceries, dining out), healthcare, debt payments, entertainment, personal care, and savings. Don't forget irregular expenses like annual subscriptions or seasonal costs.",
        },
      },
      {
        "@type": "Question",
        name: "How often should I review my budget?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Review your budget monthly to track spending patterns and make adjustments. Conduct a more thorough review quarterly to assess progress toward financial goals. Annual reviews help you plan for the coming year and adjust for major life changes like job transitions, marriage, or having children.",
        },
      },
      {
        "@type": "Question",
        name: "What is the 50/30/20 budgeting rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The 50/30/20 budget rule suggests allocating 50% of after-tax income to needs (housing, utilities, groceries), 30% to wants (entertainment, dining out, hobbies), and 20% to savings and debt repayment. This provides a simple framework, though you may need to adjust percentages based on your cost of living and financial goals.",
        },
      },
      {
        "@type": "Question",
        name: "How can inflation affect my budget?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inflation reduces your purchasing power over time, meaning your money buys less. As prices rise, you may need to adjust your budget allocations, reduce discretionary spending, or seek ways to increase income. Regular budget reviews help you adapt to inflationary pressures and maintain financial stability.",
        },
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-calculator" data={calculatorSchema} />
      <JsonLd id="schema-article" data={articleSchema} />
      <JsonLd id="schema-dataset" data={datasetSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
      {/* */}
      <BudgetCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">50/30/20 Budget Calculator - Simple Income Budgeting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Split your income the smart way with the 50/30/20 budgeting rule: 50% for needs, 30% for wants, and
                  20% for savings. Our free calculator helps you create a balanced budget with inflation adjustment.
                </p>

                <section aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Automatic 50/30/20 budget split calculation</li>
                    <li>• Monthly and annual income support</li>
                    <li>• Detailed spending category breakdowns</li>
                    <li>• Visual pie chart representation</li>
                    <li>• Inflation-adjusted budgeting recommendations</li>
                    <li>• Real-time calculation updates</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="How it works">
                  <h3 className="font-semibold mb-2">How the 50/30/20 Rule Works:</h3>
                  <p className="mb-3">
                    The 50/30/20 budget rule is a simple, proven method for managing your money. It divides your
                    after-tax income into three categories:
                  </p>
                  <ul className="space-y-2 mb-3">
                    <li>
                      <strong>50% Needs:</strong> Essential expenses like housing, utilities, groceries, insurance, and
                      minimum debt payments
                    </li>
                    <li>
                      <strong>30% Wants:</strong> Discretionary spending like dining out, entertainment, subscriptions,
                      and hobbies
                    </li>
                    <li>
                      <strong>20% Savings:</strong> Emergency fund, retirement contributions, investments, and extra
                      debt payments
                    </li>
                  </ul>
                  <p className="mb-3">
                    <strong>Example:</strong> With a $5,000 monthly income, you would allocate $2,500 to needs, $1,500
                    to wants, and $1,000 to savings and debt repayment.
                  </p>
                </section>

                <section className="mt-6" aria-label="Budget categories">
                  <h3 className="font-semibold mb-2">Category Examples:</h3>
                  <div className="space-y-3">
                    <div>
                      <strong>Needs (50%):</strong> Rent/mortgage, utilities, groceries, insurance, transportation,
                      minimum loan payments
                    </div>
                    <div>
                      <strong>Wants (30%):</strong> Dining out, entertainment, streaming services, gym membership,
                      travel, hobbies
                    </div>
                    <div>
                      <strong>Savings (20%):</strong> Emergency fund, retirement (401k/IRA), investments, extra debt
                      payments, education savings
                    </div>
                  </div>
                </section>

                <nav className="mt-6" aria-label="Navigation">
                  <h3 className="font-semibold mb-2">Other Financial Tools:</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-blue-600 hover:underline">
                        Home - Inflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/emergency-fund-calculator" className="text-blue-600 hover:underline">
                        Emergency Fund Calculator
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
                  </ul>
                </nav>

                <p className="text-sm text-gray-600 mt-6">
                  This calculator requires JavaScript to function. Please enable JavaScript in your browser to use the
                  interactive budget planning features.
                </p>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
