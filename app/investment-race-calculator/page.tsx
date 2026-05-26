import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import dynamic from "next/dynamic"
const InvestmentRaceCalculatorPage = dynamic(() => import("./InvestmentRaceCalculatorPage"), { ssr: false })
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl
  }
  return "https://www.globalinflationcalculator.com"
})()

const PAGE_PATH = "/investment-race-calculator"

export const metadata: Metadata = {
  title: "Investment Race Calculator 2026 | Which Asset Beat Inflation?",
  description:
    "Compare real, inflation-adjusted returns of S&P 500, gold, Bitcoin, housing, bonds, and savings. Enter any year range since 2000 and 8 currencies — see which investment truly beat inflation.",
  keywords: [
    "investment calculator",
    "inflation adjusted returns",
    "which investment beat inflation",
    "S&P 500 vs gold vs bitcoin",
    "real returns calculator",
    "investment comparison calculator",
    "best investment against inflation",
    "gold vs stocks inflation",
    "bitcoin vs inflation calculator",
    "housing vs stock market returns",
    "real return calculator",
    "investment race",
    "multi-asset comparison",
    "inflation hedge calculator",
    "purchasing power calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}${PAGE_PATH}`,
  },
  openGraph: {
    title: "Investment Race Calculator 2026 | Which Asset Beat Inflation?",
    description:
      "Compare real inflation-adjusted returns of S&P 500, gold, Bitcoin, housing, government bonds, and savings accounts. Any year range since 2000, 8 currencies, official CPI data.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-investment-race-calculator.jpg`,
        width: 1200,
        height: 630,
        alt: "Investment Race Calculator — Global Inflation Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investment Race Calculator 2026 | Which Asset Beat Inflation?",
    description:
      "S&P 500 vs gold vs Bitcoin vs housing vs bonds. Compare real returns with official inflation data for 8 currencies.",
    images: [`${siteUrl}/og-investment-race-calculator.jpg`],
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

export default function InvestmentRaceCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Investment Race Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Compare real, inflation-adjusted historical returns of S&P 500, gold, Bitcoin, housing, government bonds, and savings accounts across any year range since 2000. Supports 8 currencies with official CPI benchmark data.",
    url: `${siteUrl}${PAGE_PATH}`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1243",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "S&P 500 vs gold vs Bitcoin vs housing vs bonds vs savings comparison",
      "Inflation-adjusted (real) returns using official CPI data",
      "Nominal vs real return toggle",
      "8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "Interactive line chart showing investment growth over time",
      "CAGR (compound annual growth rate) for each asset",
      "Year-range selector: any window from 2000–2025",
      "CPI data from FAOSTAT, BLS, ONS, Eurostat, Statistics Canada, ABS, SFSO, Statistics Japan, Stats NZ",
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
        name: "Investment Race Calculator",
        item: `${siteUrl}${PAGE_PATH}`,
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Investment Race Calculator 2026 — Which Asset Beat Inflation? S&P 500, Gold, Bitcoin, Housing, Bonds Compared",
    description:
      "A comprehensive multi-asset investment comparison calculator showing real, inflation-adjusted returns of S&P 500, gold, Bitcoin, housing, government bonds, and savings accounts. Uses official CPI data for 8 currencies covering 2000–2025.",
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/og-investment-race-calculator.jpg`,
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
    datePublished: "2026-04-01T00:00:00Z",
    dateModified: "2026-04-29T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${PAGE_PATH}`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Multi-Asset Historical Returns Dataset — Inflation-Adjusted (2000–2025)",
    description:
      "Annual nominal and real (inflation-adjusted) returns for six major asset classes — S&P 500, gold, Bitcoin, residential housing, 10-year government bonds, and savings accounts — covering 2000 to 2025. Paired with annual CPI data for 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) to compute purchasing-power-adjusted returns.",
    url: `${siteUrl}${PAGE_PATH}`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "2000/2025",
    variableMeasured: [
      "S&P 500 annual total return",
      "Gold annual price return",
      "Bitcoin annual price return",
      "National residential housing price index",
      "10-year government bond annual total return",
      "Savings deposit rate",
      "Consumer Price Index (CPI) by currency",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Robert Shiller S&P 500 Data",
        description: "Long-run stock market data for the US S&P 500 index including annual total returns with dividends reinvested, maintained by Nobel Laureate Robert Shiller at Yale University.",
        url: "http://www.econ.yale.edu/~shiller/data.htm",
        creator: { "@type": "Person", name: "Robert Shiller", affiliation: "Yale University" },
        license: "http://www.econ.yale.edu/~shiller/data.htm",
      },
      {
        "@type": "Dataset",
        name: "LBMA Gold Price",
        description: "Official daily gold price fixings from the London Bullion Market Association, the global reference price for precious metals.",
        url: "https://www.lbma.org.uk/prices-and-data/precious-metal-prices",
        creator: { "@type": "Organization", name: "ICE Benchmark Administration" },
        license: "https://www.lbma.org.uk/prices-and-data/precious-metal-prices",
      },
      {
        "@type": "Dataset",
        name: "BIS Residential Property Price Statistics",
        description: "National residential property price indices for major economies, published quarterly by the Bank for International Settlements.",
        url: "https://www.bis.org/statistics/pp_residential.htm",
        creator: { "@type": "Organization", name: "Bank for International Settlements" },
        license: "https://www.bis.org/statistics/pp_residential.htm",
      },
      {
        "@type": "Dataset",
        name: "FAOSTAT Consumer Price Indices",
        description: "Annual consumer price index data for major economies published by the Food and Agriculture Organization of the United Nations.",
        url: "https://www.fao.org/faostat/en/#data/CP",
        creator: { "@type": "Organization", name: "Food and Agriculture Organization of the United Nations" },
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which investment has historically beaten inflation the most?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Over most long time periods, equities (S&P 500) and Bitcoin (for the periods it existed) have outperformed inflation most consistently. Gold has performed well during high-inflation decades. Savings accounts and bonds have frequently failed to keep pace with inflation, especially in low-interest-rate environments. The answer depends heavily on the time window selected — this calculator lets you compare any period from 2000 to 2025.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between nominal and real returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nominal returns are the raw percentage gain of an investment before adjusting for inflation. Real returns subtract the effect of inflation (using the Fisher equation: real = ((1 + nominal) ÷ (1 + CPI)) - 1). A 10% nominal return in a year with 8% inflation is only about 1.85% in real purchasing power terms. This calculator defaults to showing real returns so you can see which assets actually grew your wealth in terms of what money can buy.",
        },
      },
      {
        "@type": "Question",
        name: "How does the S&P 500 return in this calculator compare to an index fund?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The S&P 500 returns used here are representative annual total returns (price change plus reinvested dividends) based on Robert Shiller's long-run dataset and subsequent academic references. They do not include fund expense ratios or taxes. A low-cost index fund tracking the S&P 500 would produce nearly identical returns minus a small expense ratio (typically 0.03–0.20% per year for ETFs like VOO or SPY).",
        },
      },
      {
        "@type": "Question",
        name: "Why does Bitcoin not appear before 2013?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bitcoin did not have meaningful liquid market price data before 2013. While Bitcoin was created in 2009, reliable annual price data with sufficient trading volume only begins in 2013. If your selected start year is before 2013, the calculator begins Bitcoin's growth series from 2013 using your initial investment amount.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies does the investment comparison calculator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency uses its own official headline CPI data from national statistics agencies (BLS, ONS, Eurostat, Statistics Canada, ABS, SFSO, Statistics Bureau of Japan, Stats NZ) and FAOSTAT for inflation adjustment.",
        },
      },
      {
        "@type": "Question",
        name: "Is housing a good inflation hedge?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Historically, residential housing has provided modest positive real returns over long periods, with particularly strong nominal gains in low-rate environments (2010–2021). However, housing had significant real-term losses after the 2008 financial crisis (2008–2011), and recent inflation spikes have eroded nominal gains in many markets. The returns shown are national averages — local markets can vary substantially. Housing also involves transaction costs, maintenance, and illiquidity not reflected in this calculator.",
        },
      },
    ],
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Compare Inflation-Adjusted Investment Returns",
    description:
      "Step-by-step guide to using the Investment Race Calculator to compare real returns of multiple asset classes over a custom time period.",
    step: [
      {
        "@type": "HowToStep",
        name: "Enter your investment amount",
        text: "Type the initial amount you want to compare (e.g. $10,000). The same amount will be applied to all assets simultaneously.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose the currency matching your country. This determines which CPI dataset is used for inflation adjustment.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Choose your year range",
        text: "Select a start year and end year. Any window between 2000 and 2025 is supported. Bitcoin data starts from 2013.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Toggle inflation adjustment",
        text: "Switch between real (inflation-adjusted) and nominal returns. Real returns show true purchasing power growth; nominal returns show raw price growth.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Read the results",
        text: "The line chart shows how each investment grew year by year. The leaderboard shows final values, total return %, and CAGR for each asset — ranked from best to worst performer.",
        position: 5,
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
      <JsonLd id="schema-howto" data={howToSchema} />
      <InvestmentRaceCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Investment Race Calculator — Which Asset Beat Inflation?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Compare real, inflation-adjusted returns of six major asset classes — S&P 500, gold, Bitcoin, housing,
                  government bonds, and savings accounts — across any year range since 2000. Supports 8 currencies with
                  official CPI benchmark data.
                </p>

                <section aria-label="Supported assets">
                  <h3 className="font-semibold mb-2">Assets Compared:</h3>
                  <ul className="space-y-2">
                    <li>S&P 500 — US large-cap equity total return (2000–2025)</li>
                    <li>Gold — Spot price historical return (2000–2025)</li>
                    <li>Bitcoin — Annual price return (2013–2025)</li>
                    <li>Housing — National residential property price index (2000–2025)</li>
                    <li>10Y Government Bonds — Total return (2000–2025)</li>
                    <li>Savings Account — Deposit rate real return (2000–2025)</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Calculator features">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-2">
                    <li>• Real inflation-adjusted returns using official CPI data</li>
                    <li>• 8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)</li>
                    <li>• Interactive line chart showing growth over time</li>
                    <li>• CAGR leaderboard ranking all assets</li>
                    <li>• Nominal vs real return toggle</li>
                    <li>• Any year range from 2000 to 2025</li>
                  </ul>
                </section>

                <nav className="mt-6" aria-label="Navigation">
                  <h3 className="font-semibold mb-2">Related Tools:</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-blue-600 hover:underline">Home — Inflation Calculator</Link>
                    </li>
                    <li>
                      <Link href="/deflation-calculator" className="text-blue-600 hover:underline">Deflation Calculator</Link>
                    </li>
                    <li>
                      <Link href="/global-compound-interest" className="text-blue-600 hover:underline">Compound Interest Calculator</Link>
                    </li>
                    <li>
                      <Link href="/roi-calculator" className="text-blue-600 hover:underline">ROI Calculator</Link>
                    </li>
                    <li>
                      <Link href="/charts" className="text-blue-600 hover:underline">Inflation Charts</Link>
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
