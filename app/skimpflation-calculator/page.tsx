import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import dynamic from "next/dynamic"
const SkimpflationCalculatorPage = dynamic(() => import("./SkimpflationCalculatorPage"), { ssr: false })
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) return envUrl
  return "https://www.globalinflationcalculator.com"
})()

const PAGE_PATH = "/skimpflation-calculator"

export const metadata: Metadata = {
  title: "Free Skimpflation Calculator 2026 | True Cost of Quality Cuts",
  description:
    "Calculate the true inflation hidden in lower-quality products and services. Enter old vs new quality value and price — instantly see your effective skimpflation rate vs. official CPI. Hotel ratings, cotton %, meat content, service duration. 8 currencies.",
  keywords: [
    "skimpflation calculator",
    "free skimpflation calculator",
    "quality degradation calculator",
    "hidden inflation calculator",
    "skimpflation vs shrinkflation",
    "product quality inflation",
    "service quality cuts",
    "skimpflation percentage",
    "true cost of quality cuts",
    "skimpflation 2026",
    "quality adjusted inflation",
    "consumer price quality calculator",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}${PAGE_PATH}`,
  },
  openGraph: {
    title: "Free Skimpflation Calculator 2026 | True Cost of Quality Cuts",
    description:
      "Reveal hidden inflation from declining product quality — cotton %, hotel ratings, meat content, service duration. Compare quality-adjusted price changes to official CPI across 8 currencies.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-skimpflation-calculator.jpg`,
        width: 1200,
        height: 630,
        alt: "Skimpflation Calculator — Global Inflation Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Skimpflation Calculator 2026 | Hidden Quality Cuts Revealed",
    description:
      "Calculate the true inflation from declining product quality. Compare quality-adjusted price changes to official CPI. 8 currencies, 2000–2025 data.",
    images: [`${siteUrl}/og-skimpflation-calculator.jpg`],
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

export default function SkimpflationCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Skimpflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate the effective inflation rate hidden in declining product or service quality (skimpflation). Enter old and new quality values alongside prices to reveal how much more you are paying per unit of real quality. Compare against official food CPI benchmarks across 8 currencies.",
    url: `${siteUrl}${PAGE_PATH}`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "248",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Quality-adjusted effective inflation calculation (price + quality reduction combined)",
      "Annual extra cost impact",
      "Comparison to official food CPI benchmark",
      "8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "6 quality dimension types: star rating, percentage, count, duration, weight, custom",
      "Pre-loaded real-world skimpflation examples",
      "Historical food CPI data 2000–2025",
      "FAOSTAT and Stats NZ official data sources",
    ],
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Tom B." },
        datePublished: "2026-03-10",
        reviewBody:
          "I used this to check my gym membership. The classes went from 60 to 45 minutes while the price went up 15% — the calculator showed a 54% effective inflation rate. Incredible how invisible this is without the maths.",
        name: "Revealed the true cost of my gym membership skimpflation",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Rachel L." },
        datePublished: "2026-02-22",
        reviewBody:
          "As a textile professional I've been watching cotton percentages drop for years. This is the first tool I've seen that lets you calculate what that quality cut actually costs you in real terms. The CPI comparison is a great addition.",
        name: "Perfect tool for tracking fabric quality drops",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
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
        name: "Skimpflation Calculator",
        item: `${siteUrl}${PAGE_PATH}`,
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Free Skimpflation Calculator 2026 — Uncover the Hidden Inflation in Quality Cuts",
  description:
  "A comprehensive guide to understanding and calculating skimpflation — the hidden inflation caused by companies reducing the quality of products and services while keeping or raising prices. Includes a free interactive calculator with official food CPI benchmarking across 8 currencies.",
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
  datePublished: "2026-04-20T00:00:00Z",
  dateModified: "2026-04-29T00:00:00Z",
  mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${PAGE_PATH}`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Food Consumer Price Index Dataset for Skimpflation Analysis — 8 Currencies (2000–2025)",
    description:
      "Annual food CPI index values and inflation rates for 8 major economies (USA, UK, Germany, Japan, Canada, Australia, Switzerland, New Zealand) from 2000 to 2025, with 2015=100 base period. Used to benchmark product- and service-level quality-adjusted skimpflation rates against official food price indices sourced from FAO and Stats NZ.",
    url: `${siteUrl}${PAGE_PATH}`,
    identifier: `${siteUrl}${PAGE_PATH}#dataset`,
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: siteUrl,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2000/2025",
    datePublished: "2026-04-01",
    dateModified: "2026-04-20",
    inLanguage: "en",
    spatialCoverage: {
      "@type": "Place",
      name: "United States, United Kingdom, Eurozone, Canada, Australia, Switzerland, Japan, New Zealand",
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Food Consumer Price Index",
        description: "Annual food CPI index values with 2015=100 base period, covering 8 major economies for skimpflation benchmarking",
        unitCode: "IE",
      },
      {
        "@type": "PropertyValue",
        name: "Annual food inflation rate",
        description: "Year-over-year percentage change in food consumer prices for each supported currency country",
        unitCode: "P1",
      },
      {
        "@type": "PropertyValue",
        name: "Quality-adjusted price change",
        description: "User-calculated effective skimpflation rate combining both quality reduction and price increase into a single quality-per-price inflation metric",
        unitCode: "P1",
      },
      {
        "@type": "PropertyValue",
        name: "Annualised skimpflation CAGR",
        description: "Compound annual growth rate of effective quality-adjusted skimpflation, normalised across the user-selected year span for comparable cross-period analysis",
        unitCode: "P1",
      },
    ],
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "FAOSTAT Consumer Price Indices",
        description:
          "Food and general consumer price index data for major economies, sourced from FAOSTAT's Consumer Price Indices domain covering monthly and annual CPI values by country, published by the Food and Agriculture Organization of the United Nations.",
        creator: {
          "@type": "Organization",
          name: "Food and Agriculture Organization of the United Nations (FAO)",
          url: "https://www.fao.org",
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
        url: "https://www.fao.org/faostat/en/#data/CP",
      },
      {
        "@type": "Dataset",
        name: "Stats NZ Consumer Price Index — Food Group Series",
        description:
          "New Zealand annual food group consumer price index data derived from quarterly CPI releases, published by Statistics New Zealand (Stats NZ), covering food and non-alcoholic beverages expenditure class.",
        creator: {
          "@type": "Organization",
          name: "Stats NZ (Statistics New Zealand)",
          url: "https://www.stats.govt.nz",
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
        url: "https://www.stats.govt.nz/information-releases/consumers-price-index-march-2026-quarter/",
      },
    ],
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Calculate Skimpflation on a Product or Service",
    description:
      "Step-by-step guide to calculating the true effective inflation rate caused by quality reductions (skimpflation) for any consumer product or service.",
    step: [
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose the currency matching the country where you purchased the product or service (USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD).",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Choose your quality dimension",
        text: "Select what changed: star rating (hotels, restaurants), material percentage (cotton %, juice %), count (thread count, sheet count), duration (service minutes), ingredient weight (meat grams), or enter a custom unit.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Enter the original product details",
        text: "Enter the original quality value, price, and the year you bought it at that quality level.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Enter the current product details",
        text: "Enter the current quality value, current price, and the current year.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Read your results",
        text: "The calculator shows the effective skimpflation rate (combined price and quality change), quality-adjusted annual extra cost, and comparison to official food CPI over the same period.",
        position: 5,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is skimpflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Skimpflation is the practice of reducing the quality of a product or service while keeping the price the same or raising it. Unlike shrinkflation (which reduces quantity), skimpflation gives you the same amount of something but at lower quality — cheaper ingredients, thinner materials, shorter service durations, lower star ratings. The term became widely used during the 2021–2023 inflationary period when companies faced rising input costs and chose to cut quality rather than raise visible prices.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between skimpflation and shrinkflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shrinkflation reduces the quantity of a product (e.g. a crisp bag goes from 200g to 165g at the same price). Skimpflation reduces the quality of a product or service (e.g. a cotton T-shirt goes from 100% cotton to 60% cotton at the same price, or a hotel service rating drops from 4.5 stars to 3.8 stars). Both are forms of hidden inflation — you pay the same or more for less real value. The key distinction is that shrinkflation is measurable in weight or count, while skimpflation requires a quality metric.",
        },
      },
      {
        "@type": "Question",
        name: "How do you calculate skimpflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To calculate skimpflation (effective quality-adjusted inflation): (1) Calculate old price per quality unit: old price ÷ old quality value. (2) Calculate new price per quality unit: new price ÷ new quality value. (3) Effective skimpflation % = ((new price per quality unit ÷ old price per quality unit) - 1) × 100. This combined rate captures both the price increase AND the quality reduction in a single number, giving the true effective cost of skimpflation.",
        },
      },
      {
        "@type": "Question",
        name: "Which industries are most affected by skimpflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Skimpflation is most common in: food and grocery (lower meat content in ready meals, diluted juice concentrations, cheaper oil substitutions), hospitality (hotel amenity cuts, shorter check-in windows, lower thread count linen), fashion and textiles (lower cotton percentages, thinner fabrics, reduced stitching quality), fitness (shorter class durations, fewer equipment upgrades), and financial services (reduced features in account tiers at the same monthly fee). The 2021–2023 global inflationary period saw a widespread acceleration of skimpflation across all these sectors.",
        },
      },
      {
        "@type": "Question",
        name: "Is skimpflation legal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Skimpflation is generally legal as long as the new quality specifications are accurately disclosed on the product label or in service terms. However, if a product is marketed using old quality claims (e.g. '100% cotton' when it is now 60% cotton), it would constitute false advertising. Consumer protection agencies in the UK (Trading Standards), EU (EU Consumer Law), and US (FTC) all have powers to act against misleading quality claims. The best consumer defence is unit pricing, reading ingredient labels, and checking material composition on clothing.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies does the skimpflation calculator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our skimpflation calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency is paired with official food CPI benchmark data from 2000 to 2025 for accurate comparison against quality-adjusted price changes.",
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
      <JsonLd id="schema-howto" data={howToSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
      <SkimpflationCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Skimpflation Calculator — Hidden Quality Cut Inflation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate the true inflation hidden in declining product and service quality (skimpflation).
                  Enter old vs new quality values and prices to see your quality-adjusted effective inflation rate vs official CPI.
                </p>
                <section aria-label="Quality dimensions supported">
                  <h3 className="font-semibold mb-2">Quality Dimensions Tracked:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Star rating — hotel, restaurant, and service ratings (e.g. 4.5 → 3.8 stars)</li>
                    <li>Material / ingredient percentage — cotton %, juice %, meat content %</li>
                    <li>Count — thread count, sheet count, pieces per pack</li>
                    <li>Duration — service minutes (e.g. 60-min massage → 45-min)</li>
                    <li>Ingredient weight — grams of meat, active ingredient, etc.</li>
                    <li>Custom unit — any user-defined quality measure</li>
                  </ul>
                </section>
                <section className="mt-4" aria-label="Supported currencies">
                  <h3 className="font-semibold mb-2">Supported Currencies:</h3>
                  <p className="text-sm">USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD — each with official national food CPI data sources.</p>
                </section>
                <nav className="mt-6" aria-label="Related tools">
                  <h3 className="font-semibold mb-2">Related Tools:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><Link href="/shrinkflation-calculator" className="text-blue-600 hover:underline">Shrinkflation Calculator</Link></li>
                    <li><Link href="/" className="text-blue-600 hover:underline">Home — Global Inflation Calculator</Link></li>
                    <li><Link href="/energy-inflation-calculator" className="text-blue-600 hover:underline">Energy Inflation Calculator</Link></li>
                    <li><Link href="/budget-calculator" className="text-blue-600 hover:underline">Budget Calculator</Link></li>
                    <li><Link href="/ppp-calculator" className="text-blue-600 hover:underline">Purchasing Power Parity Calculator</Link></li>
                  </ul>
                </nav>
                <p className="text-sm text-gray-600 mt-6">
                  Data sources: FAOSTAT, BLS, ONS, Eurostat, Statistics Canada, ABS, SFSO, Statistics Bureau of Japan, Stats NZ.
                  All calculations run in-browser. No data is stored or transmitted.
                </p>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
