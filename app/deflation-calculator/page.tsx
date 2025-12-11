import type { Metadata } from "next"
import DeflationCalculatorPage from "./DeflationCalculatorPage"
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
  title: "Deflation Calculator | Track Purchasing Power Growth",
  description:
    "Calculate how deflationary assets like Gold, Silver, Crude Oil preserve purchasing power. Historical data 1985-2025 with real market prices.",
  keywords: [
    "deflation calculator",
    "best inflation calculator online",
    "purchasing power",
    "purchasing power growth",
    "gold appreciation calculator",
    "silver price calculator",
    "scarce assets",
    "deflationary assets",
    "asset scarcity calculator",
    "inflation hedge",
    "wealth preservation",
    "commodity calculator",
    "gold vs inflation",
    "precious metals calculator",
    "crude oil calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/deflation-calculator`,
  },
  openGraph: {
    title: "Deflation Calculator - Track Purchasing Power Growth with Scarce Assets",
    description:
      "Calculate how deflationary assets like Gold, Silver, and Crude Oil preserve purchasing power over time. Historical data from 1985-2025.",
    url: `${siteUrl}/deflation-calculator`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/placeholder.svg?height=630&width=1200&text=Deflation+Calculator`,
        width: 1200,
        height: 630,
        alt: "Deflation Calculator - Scarce Asset Analysis",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deflation Calculator - Track Purchasing Power Growth",
    description: "Calculate how deflationary assets preserve purchasing power over time. Gold, Silver, Crude Oil data.",
    images: [`${siteUrl}/placeholder.svg?height=630&width=1200&text=Deflation+Calculator`],
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

export default function DeflationCalculator() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Deflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate purchasing power growth with deflationary assets like Gold, Silver, Crude Oil, Bitcoin, and Ethereum from 1985-2025.",
    url: `${siteUrl}/deflation-calculator`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Gold price tracking (1985-2025)",
      "Silver price tracking (1985-2025)",
      "Crude Oil (WTI) analysis (1985-2025)",
      "Bitcoin analysis (2013-2025)",
      "Ethereum analysis (2015-2025)",
      "Purchasing power growth calculator",
      "Deflation vs inflation comparison",
      "Scarcity mechanisms dashboard",
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
        name: "Deflation Calculator",
        item: `${siteUrl}/deflation-calculator`,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is deflation and how does it differ from inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Deflation is when prices decrease over time, increasing the purchasing power of money. Unlike inflation where money loses value, deflation means each dollar buys more goods and services. Deflationary assets like gold and bitcoin have limited supply, making them scarce and valuable over time.",
        },
      },
      {
        "@type": "Question",
        name: "Why are gold and silver considered deflationary assets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Gold and silver are physically scarce with limited supply. Mining becomes more expensive over time, and total reserves are finite. Unlike fiat currency that can be printed infinitely, precious metals maintain purchasing power through scarcity, making them effective inflation hedges.",
        },
      },
      {
        "@type": "Question",
        name: "How does Bitcoin's supply mechanism create deflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bitcoin has a fixed maximum supply of 21 million coins. New bitcoins are created through mining, with the reward halving approximately every 4 years. This programmatic scarcity creates deflationary pressure as demand grows but supply becomes increasingly limited.",
        },
      },
      {
        "@type": "Question",
        name: "Can crude oil be considered a deflationary asset?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Crude oil has deflationary characteristics due to finite reserves and increasing extraction costs. As easily accessible oil depletes, remaining reserves become more expensive to extract. However, oil prices are also heavily influenced by geopolitical factors and technological changes in energy production.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <DeflationCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Deflation Calculator - Purchasing Power Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate how deflationary assets like Gold, Silver, Crude Oil, Bitcoin, and Ethereum help you
                  preserve and grow the purchasing power of your wealth over time.
                </p>

                <section aria-label="Supported assets">
                  <h3 className="font-semibold mb-2">Supported Assets:</h3>
                  <ul className="space-y-2">
                    <li>🥇 Gold - Historical data from 1985-2025</li>
                    <li>🥈 Silver - Historical data from 1985-2025</li>
                    <li>🛢️ Crude Oil (WTI) - Historical data from 1985-2025</li>
                    <li>₿ Bitcoin - Historical data from 2013-2025</li>
                    <li>Ξ Ethereum - Historical data from 2015-2025</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Purchasing Power Growth Calculator - Track asset appreciation vs inflation</li>
                    <li>• Deflation vs Inflation Comparison - Compare deflationary and inflationary assets</li>
                    <li>• Scarcity Mechanisms Dashboard - Understand supply dynamics</li>
                    <li>• Historical price data and trends</li>
                    <li>• Real-time calculations using official market data</li>
                    <li>• Educational content on wealth preservation</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Understanding deflation">
                  <h3 className="font-semibold mb-2">What Are Deflationary Assets?</h3>
                  <p className="mb-3">
                    Deflationary assets are scarce resources with limited or decreasing supply. Unlike fiat currencies
                    that can be printed infinitely, these assets maintain or increase their purchasing power over time
                    due to their scarcity.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Precious Metals (Gold & Silver)</h4>
                      <p className="text-sm text-gray-600">
                        Limited supply, expensive to mine, historically used as stores of value for thousands of years.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Commodities (Crude Oil)</h4>
                      <p className="text-sm text-gray-600">
                        Finite natural resources with increasing extraction costs and declining reserves.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Cryptocurrencies (Bitcoin & Ethereum)</h4>
                      <p className="text-sm text-gray-600">
                        Programmatically limited supply with predictable issuance schedules and deflationary mechanisms.
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
                      <Link href="/charts" className="text-blue-600 hover:underline">
                        Charts & Analytics
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
