import type { Metadata } from "next"
import SalaryCalculatorPage from "./SalaryCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Salary Calculator | Inflation Adjustment Calculator",
  description:
    "Calculate how inflation affects your salary over time. Compare purchasing power and real wages from 1913-2025 with official CPI data.",
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
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salary Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate inflation-adjusted salary and purchasing power changes from 1913-2025 across multiple currencies.",
    url: "https://globalinflationcalculator.com/salary-calculator",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Inflation-adjusted salary calculations",
      "Real wage vs nominal wage comparison",
      "Purchasing power analysis",
      "Multi-currency support (8 currencies)",
      "Historical salary data from 1913",
      "Regional cost of living adjustments",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I calculate my inflation-adjusted salary?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To calculate your inflation-adjusted salary, enter your current or historical salary, select the year it was earned, and choose a comparison year. The calculator uses Consumer Price Index (CPI) data to show what that salary is worth in today's dollars or any other year you choose.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between real wages and nominal wages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nominal wages are the actual dollar amounts you earn without any adjustments. Real wages account for inflation, showing your true purchasing power. For example, a $50,000 salary in 2000 had more purchasing power than $50,000 in 2024 due to cumulative inflation.",
        },
      },
      {
        "@type": "Question",
        name: "Why has my purchasing power decreased even though my salary increased?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If your salary increases don't keep pace with inflation, your purchasing power decreases. For example, a 3% salary raise when inflation is 5% actually results in a 2% decrease in real purchasing power. This is why inflation-adjusted comparisons are crucial for understanding true wage growth.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is historical salary data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our salary calculator uses official Consumer Price Index (CPI) data from government sources like the Bureau of Labor Statistics. CPI is the standard measure for inflation calculations and provides reliable historical comparisons dating back to 1913.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
    </>
  )
}
