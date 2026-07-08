import { JsonLd } from "@/components/json-ld"
import type { Metadata } from "next"
import LifestyleInflationCalculatorPage from "./LifestyleInflationCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = "https://www.globalinflationcalculator.com"
const PAGE_PATH = "/lifestyle-inflation-calculator"

const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lifestyle Inflation Calculator",
  applicationCategory: "FinanceApplication",
  description:
    "Calculate your personal lifestyle inflation rate and lifestyle creep. See exactly how much of your income growth is going to higher spending vs real price inflation, with category breakdowns and long-term projections.",
  url: `${siteUrl}${PAGE_PATH}`,
  operatingSystem: "Web Browser",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "512",
    bestRating: "5",
    worstRating: "1",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Personal lifestyle inflation rate calculation",
    "Lifestyle creep vs real inflation breakdown",
    "Category-by-category spending analysis (housing, transport, dining, clothing, subscriptions, travel)",
    "Income growth vs spending growth comparison",
    "Future projection at 5, 10, and 20 years",
    "Savings opportunity calculator",
    "8 currency support",
  ],
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Lifestyle Inflation Calculator — Track Creep & Real Costs",
  description:
    "Calculate your personal lifestyle inflation rate. See how much of your income growth has gone to lifestyle creep vs real price inflation, with category breakdowns across 8 currencies.",
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
  datePublished: "2026-07-08T00:00:00Z",
  dateModified: "2026-07-08T00:00:00Z",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${siteUrl}${PAGE_PATH}`,
  },
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
      name: "Lifestyle Inflation Calculator",
      item: `${siteUrl}${PAGE_PATH}`,
    },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is lifestyle inflation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lifestyle inflation (also called lifestyle creep) is when your spending increases as your income rises, rather than saving or investing the extra money. It happens gradually — a nicer apartment, a newer car, more frequent dining out — until your expenses have grown to match or exceed your higher income.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between lifestyle inflation and regular inflation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Regular inflation is the general rise in prices across the economy — driven by monetary policy, supply and demand, and external shocks. Lifestyle creep is voluntary: it is your deliberate or unconscious choice to upgrade your standard of living. Your personal inflation rate is the combination of both: official price increases plus the premium you pay for consuming more or better goods.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate my personal lifestyle inflation rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compare your total spending today against your total spending in a previous year, then express the difference as an annual percentage. Subtract the official CPI rate for your currency from that percentage. The remainder is your lifestyle creep — the spending increase that cannot be explained by price inflation alone.",
      },
    },
    {
      "@type": "Question",
      name: "Is lifestyle inflation always bad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not necessarily. Deliberate, conscious upgrades — better nutrition, improved healthcare, quality childcare — are reasonable uses of higher income. The problem arises when spending increases happen unconsciously, eroding your savings rate and leaving you financially no better off than when you earned less.",
      },
    },
    {
      "@type": "Question",
      name: "Which spending categories drive lifestyle creep the most?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Housing and transport are typically the biggest drivers because they tend to lock in higher fixed costs. Dining out, subscriptions, and travel are the easiest to identify because they scale directly with discretionary income. Clothing and personal care tend to inflate more gradually but compound over time.",
      },
    },
    {
      "@type": "Question",
      name: "How much of my raise should I save vs spend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A widely recommended starting point is to save at least 50% of every raise or income increase, spending no more than 50% on lifestyle upgrades. After accounting for inflation, saving 50% of raises tends to meaningfully accelerate wealth accumulation over 10–20 year horizons.",
      },
    },
  ],
}

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Lifestyle Inflation Data — Category CPI Indices Across 8 Currencies (2000–2025)",
  description:
    "Official government CPI sub-category data for transportation, clothing & footwear, dining out (food away from home), travel (airfares, accommodation), housing, subscriptions, healthcare, and energy across USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD. Used to calculate personal lifestyle inflation rates and creep.",
  url: `${siteUrl}${PAGE_PATH}`,
  creator: {
    "@type": "Organization",
    name: "Global Inflation Calculator",
    url: siteUrl,
  },
  temporalCoverage: "2000/2025",
  spatialCoverage: {
    "@type": "Place",
    name: "Global — United States, United Kingdom, European Union, Canada, Australia, Switzerland, Japan, New Zealand",
  },
  variableMeasured: [
    "Transportation CPI (COICOP CP07)",
    "Clothing & Footwear CPI (COICOP CP03)",
    "Restaurants & Hotels CPI (COICOP CP11)",
    "Airline Fares CPI (COICOP CP073)",
    "Package Holidays CPI (COICOP CP096)",
    "Housing CPI",
    "Healthcare CPI",
    "Energy CPI",
    "Subscription Price Indices",
    "Personal Lifestyle Inflation Rate",
  ],
  license: "https://creativecommons.org/licenses/by/4.0/",
  isBasedOn: [
    {
      "@type": "Dataset",
      name: "US Bureau of Labor Statistics — CPI Sub-Categories",
      description:
        "U.S. Consumer Price Index sub-category series including food away from home (CUSR0000SEFV), transportation (CUSR0000SAT), apparel (CUSR0000SAA), shelter (CUSR0000SAH), airline fares (CUSR0000SETG01), and motor vehicle insurance. Annual index values 2000–2025. Used to compute official inflation benchmarks for USD lifestyle category spending.",
      url: "https://www.bls.gov/cpi/",
      creator: { "@type": "Organization", name: "U.S. Bureau of Labor Statistics" },
      license: "https://www.bls.gov/bls/linksite.htm",
    },
    {
      "@type": "Dataset",
      name: "UK Office for National Statistics — CPIH Sub-Categories",
      description:
        "UK Consumer Prices Index including owner occupiers' housing costs (CPIH) sub-category data covering clothing & footwear (CP03), transport (CP07), restaurants & hotels (CP11), and airfares (CP073). Annual index values 2000–2025, base year 2015=100. Used to compute official GBP inflation benchmarks per spending category.",
      url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
      creator: { "@type": "Organization", name: "UK Office for National Statistics" },
      license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    },
    {
      "@type": "Dataset",
      name: "Eurostat — HICP Sub-Categories",
      description:
        "Harmonised Index of Consumer Prices (HICP) sub-category data for the Euro area covering clothing & footwear (CP03), transport (CP07), restaurants & hotels (CP11), and package holidays (CP096). Annual index values 2000–2025, base year 2015=100. Used to compute official EUR inflation benchmarks per spending category.",
      url: "https://ec.europa.eu/eurostat/web/hicp",
      creator: { "@type": "Organization", name: "Eurostat" },
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
    {
      "@type": "Dataset",
      name: "Statistics Canada — CPI Components",
      description:
        "Statistics Canada Consumer Price Index components covering clothing & footwear, transportation, food purchased from restaurants, and travel services for Canada. Annual index values 2000–2025, base year 2002=100. Used to compute official CAD inflation benchmarks per spending category.",
      url: "https://www.statcan.gc.ca/en/subjects-start/prices_and_price_indexes/consumer_price_indexes",
      creator: { "@type": "Organization", name: "Statistics Canada" },
      license: "https://www.statcan.gc.ca/en/reference/licence",
    },
    {
      "@type": "Dataset",
      name: "Australian Bureau of Statistics — CPI Groups",
      description:
        "Australian Consumer Price Index CPI groups covering clothing & footwear, transport, food & non-alcoholic beverages (dining-out component), and recreation & culture. Annual index values 2000–2025, base year 2011–12=100. Used to compute official AUD inflation benchmarks per spending category.",
      url: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia",
      creator: { "@type": "Organization", name: "Australian Bureau of Statistics" },
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
    {
      "@type": "Dataset",
      name: "Swiss Federal Statistical Office — CPI Components",
      description:
        "Swiss Federal Statistical Office Consumer Price Index components covering clothing & footwear, transport, restaurants & hotels, and package holidays for Switzerland. Annual index values 2000–2025, base year 2020=100. Used to compute official CHF inflation benchmarks per spending category.",
      url: "https://www.bfs.admin.ch/bfs/en/home/statistics/prices/consumer-price-index.html",
      creator: { "@type": "Organization", name: "Swiss Federal Statistical Office" },
      license: "https://www.admin.ch/gov/en/start/terms-and-conditions.html",
    },
    {
      "@type": "Dataset",
      name: "Statistics Bureau of Japan — CPI by Sub-Group",
      description:
        "Statistics Bureau of Japan Consumer Price Index by sub-group covering clothing & footwear, transport & communication, food (eating out), and travel. Annual index values 2000–2025, base year 2020=100. Used to compute official JPY inflation benchmarks per spending category.",
      url: "https://www.stat.go.jp/english/data/cpi/",
      creator: { "@type": "Organization", name: "Statistics Bureau of Japan" },
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
    {
      "@type": "Dataset",
      name: "Stats NZ — CPI by Division",
      description:
        "Statistics New Zealand Consumer Price Index by division covering clothing & footwear, transport, restaurant meals & ready-to-eat food, and accommodation for New Zealand. Annual index values 2000–2025, base year 2017 Q2=1000. Used to compute official NZD inflation benchmarks per spending category.",
      url: "https://www.stats.govt.nz/topics/consumers-price-index",
      creator: { "@type": "Organization", name: "Stats NZ" },
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
  ],
}

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Calculate Your Personal Lifestyle Inflation Rate",
  description:
    "Step-by-step guide to using the Lifestyle Inflation Calculator to measure your spending creep vs real price inflation.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Select your currency",
      text: "Choose from USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD. The calculator loads the official CPI sub-category data for your country automatically.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Enter your income then and now",
      text: "Input your annual income for a past year and your current annual income. The calculator uses this to compute how much of your income growth is available for savings versus spending.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Enter your spending by category",
      text: "Fill in your past and present monthly spending across housing, transport, dining out, clothing, subscriptions, and travel. Each category is benchmarked against its official CPI sub-index.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Read your personal lifestyle inflation rate",
      text: "The calculator splits your total spending increase into two parts: the portion explained by official price inflation (unavoidable) and the portion driven by lifestyle creep (voluntary). Your personal lifestyle inflation rate is the creep component expressed as an annual percentage.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "View your projections and savings opportunity",
      text: "See how much wealth you would accumulate over 5, 10, and 20 years if you redirected your lifestyle creep spending into savings or investment instead.",
    },
  ],
}

export const metadata: Metadata = {
  // Title: 57 chars — within 0–60 char / 580px limit
  title: "Lifestyle Inflation Calculator | Track Creep & Real Costs",
  // Description: 148 chars — within 120–158 char / 920px limit
  description:
    "Calculate your personal lifestyle inflation rate free. See how much of your income growth is lifestyle creep vs real price inflation — 8 currencies.",
  keywords: [
    "lifestyle inflation calculator",
    "lifestyle creep calculator",
    "lifestyle inflation tracker",
    "calculate lifestyle creep",
    "track lifestyle inflation",
    "personal inflation rate calculator",
    "where did my raise go calculator",
    "lifestyle inflation 2026",
    "spending creep calculator",
    "income vs spending growth",
    "lifestyle creep tracker",
    "personal lifestyle inflation rate",
    "how much am I spending on lifestyle",
    "lifestyle creep vs inflation",
    "social media spending habits",
    "paycheck to paycheck calculator",
    "subscription creep calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: `${siteUrl}${PAGE_PATH}` },
  openGraph: {
    // OG title kept slightly longer for social share readability
    title: "Lifestyle Inflation Calculator 2026 — Track Creep & Real Costs",
    description:
      "See exactly how much of your income growth is going to higher spending vs real price inflation. Free calculator with category breakdowns and long-term projections across 8 currencies.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Lifestyle Inflation Calculator — Track Creep & Real Costs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lifestyle Inflation Calculator — Track Creep & Real Costs",
    description:
      "See exactly how much of your income growth is going to lifestyle creep vs real price inflation. Free, with category breakdowns and projections.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

export default function Page() {
  return (
    <>
      <JsonLd id="schema-calculator" data={calculatorSchema} />
      <JsonLd id="schema-article" data={articleSchema} />
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
      <JsonLd id="schema-dataset" data={datasetSchema} />
      <JsonLd id="schema-howto" data={howToSchema} />
      <LifestyleInflationCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Lifestyle Inflation Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate your personal lifestyle inflation rate and measure lifestyle creep across 8 major currencies.
                  See exactly how much of your income growth is going to higher spending versus real price inflation.
                </p>
                <section aria-label="Calculator features">
                  <h2 className="font-semibold mb-2">Features:</h2>
                  <ul className="space-y-2">
                    <li>Personal lifestyle inflation rate calculation</li>
                    <li>Category-by-category breakdown: housing, transport, dining, clothing, subscriptions, travel</li>
                    <li>Creep vs real inflation split</li>
                    <li>Savings opportunity from reversing creep</li>
                    <li>5, 10, and 20 year projections</li>
                    <li>Support for 8 currencies: USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD</li>
                  </ul>
                </section>
                <nav className="mt-6" aria-label="Navigation">
                  <h2 className="font-semibold mb-2">Other Tools:</h2>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-blue-600 hover:underline">Inflation Calculator</Link></li>
                    <li><Link href="/subscription-inflation-calculator" className="text-blue-600 hover:underline">Subscription Inflation Calculator</Link></li>
                    <li><Link href="/budget-calculator" className="text-blue-600 hover:underline">Budget Calculator</Link></li>
                    <li><Link href="/retirement-calculator" className="text-blue-600 hover:underline">Retirement Calculator</Link></li>
                  </ul>
                </nav>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
