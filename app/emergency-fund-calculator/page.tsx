import type { Metadata } from "next"
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
    title: "Emergency Fund Calculator - Build Financial Security for 2025",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
