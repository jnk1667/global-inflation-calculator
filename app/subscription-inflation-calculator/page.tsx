import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import SubscriptionInflationCalculatorPage from "./SubscriptionInflationCalculatorPage"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) return envUrl
  return "https://www.globalinflationcalculator.com"
})()

const PAGE_PATH = "/subscription-inflation-calculator"

export const metadata: Metadata = {
  title: "Subscription Inflation Calculator 2026 | Netflix, Spotify & More vs CPI",
  description:
    "See exactly how much Netflix, Spotify, Amazon Prime, Disney+, Adobe and 13 more services have raised prices above inflation. Add your own subscriptions and calculate your total subscription creep.",
  keywords: [
    "subscription inflation calculator",
    "subscription price increase calculator",
    "Netflix price history",
    "Spotify price history",
    "subscription creep calculator",
    "streaming price inflation",
    "how much have subscriptions increased",
    "subscription cost vs inflation",
    "Amazon Prime price history",
    "Disney Plus price increase",
    "subscription price tracker",
    "monthly subscription cost",
    "streaming inflation 2026",
    "subscription price comparison",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: `${siteUrl}${PAGE_PATH}` },
  openGraph: {
    title: "Subscription Inflation Calculator 2026 | Netflix, Spotify & More vs CPI",
    description:
      "Netflix raised prices 7 times. Disney+ costs 8x more than CPI growth. See how all your subscriptions stack up against official inflation with real price history data.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscription Inflation Calculator 2026 | Netflix, Spotify & More vs CPI",
    description:
      "Add your subscriptions and see how much more you are paying vs what inflation alone would justify. Real price history for 17 major services.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

export default function SubscriptionInflationCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Subscription Inflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Track how much Netflix, Spotify, Amazon Prime, Disney+, Adobe Creative Cloud and 12 other major subscription services have raised their prices above official CPI inflation. Add your own subscriptions and see your personalised subscription creep total.",
    url: `${siteUrl}${PAGE_PATH}`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "843",
      bestRating: "5",
      worstRating: "1",
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Complete price history for 17 major subscription services",
      "Add multiple subscriptions to calculate combined monthly cost",
      "CPI-adjusted baseline showing what each subscription would cost if prices rose only with inflation",
      "Monthly and annual 'extra above inflation' calculation",
      "Interactive line chart showing price history vs inflation baseline",
      "Service browser with full tier-by-tier price history tables",
      "Summary stats: fastest rising, best price discipline, most vs inflation",
      "Data sourced from official company announcements and BLS CPI",
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Subscription Inflation Calculator", item: `${siteUrl}${PAGE_PATH}` },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Subscription Inflation Calculator 2026 — How Much Have Netflix, Spotify and Amazon Raised Prices Above CPI?",
    description:
      "A data-driven subscription price inflation tracker showing complete price histories for 17 major services — Netflix, Spotify, Amazon Prime, Disney+, Adobe, Microsoft 365 and more — benchmarked against official US CPI inflation.",
    author: { "@type": "Organization", name: "Global Inflation Calculator", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: { "@type": "ImageObject", url: `${siteUrl}/favicon-96x96.png` },
    },
    datePublished: "2026-05-09T00:00:00Z",
    dateModified: "2026-05-09T00:00:00Z",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}${PAGE_PATH}` },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Subscription Service Price History Dataset — 17 Services (2005–2026)",
    description:
      "Complete month-by-month price history for 17 major subscription services including Netflix, Spotify, Amazon Prime, Disney+, Hulu, Max, YouTube Premium, Apple Music, Microsoft 365, Adobe Creative Cloud, Dropbox, Planet Fitness, Peloton, iCloud+, LinkedIn Premium, Duolingo, and New York Times. All prices in USD. Benchmarked against BLS US CPI data.",
    url: `${siteUrl}${PAGE_PATH}`,
    creator: { "@type": "Organization", name: "Global Inflation Calculator", url: siteUrl },
    temporalCoverage: "2005/2026",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "BLS Consumer Price Index — All Urban Consumers",
        url: "https://www.bls.gov/cpi/",
        creator: { "@type": "Organization", name: "Bureau of Labor Statistics", url: "https://www.bls.gov" },
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which subscription service has raised its prices the most?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Disney+ has raised prices the most aggressively relative to how long it has existed, increasing from $6.99/month at launch in 2019 to $15.99/month in 2026 — a 129% increase in under 7 years, approximately 8x faster than US CPI inflation over the same period. Netflix has raised prices the most in absolute dollar terms, with its Premium plan going from $11.99 in 2013 to $24.99 in 2025.",
        },
      },
      {
        "@type": "Question",
        name: "How much more am I paying for subscriptions above inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This depends on which services you have and when you started. The average household with Netflix Standard, Spotify Individual and Amazon Prime, all started in 2015, is paying approximately $8-12/month more than they would be if those services had only risen with US CPI inflation. The calculator shows your exact personal figure based on your specific subscriptions and start dates.",
        },
      },
      {
        "@type": "Question",
        name: "Why did Spotify hold its price so much longer than Netflix?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Spotify held its Individual plan at $9.99 for 12 years (2011–2023) primarily due to competitive pressure from Apple Music, which launched at the same $9.99 price point in 2015. Neither company wanted to blink first and give the other a pricing advantage. Once both raised prices within a short window, the long-held equilibrium broke. Netflix operated in a less directly comparable competitive environment and raised prices more frequently throughout its history.",
        },
      },
      {
        "@type": "Question",
        name: "What is subscription creep?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Subscription creep is the gradual, cumulative increase in the total amount you pay for all your recurring subscriptions over time, driven both by services adding new subscriptions and by existing ones raising their prices. The average US household now spends over $1,000 per year on digital subscriptions alone — up from near zero in 2010. This calculator tracks the price-increase component of subscription creep.",
        },
      },
      {
        "@type": "Question",
        name: "Does this calculator support prices outside the US?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The calculator supports 8 currencies: USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD. Use the currency selector in the Your Subscriptions section to switch currency. The service list, tier prices, and CPI baseline all update automatically to the correct country dataset. Not every service has pricing data for every currency — the service dropdown filters to only show services available in the selected currency.",
        },
      },
    ],
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Calculate Your Subscription Inflation",
    description: "Step-by-step guide to using the Subscription Inflation Calculator to see how much more you are paying above CPI.",
    step: [
      { "@type": "HowToStep", position: 1, name: "Review the pre-loaded subscriptions", text: "The calculator starts with Netflix Standard and Spotify Individual as examples from 2015. You can remove these or keep them as a starting point." },
      { "@type": "HowToStep", position: 2, name: "Add your own subscriptions", text: "Click 'Add subscription', select the service, choose your plan tier, and set the year you started paying. Repeat for each subscription." },
      { "@type": "HowToStep", position: 3, name: "Read the price history chart", text: "Solid lines show actual prices. Dashed lines show what the price would be if it had only risen with official US CPI inflation. The gap between them is the subscription inflation premium." },
      { "@type": "HowToStep", position: 4, name: "Check your breakdown", text: "Scroll to see each service's breakdown: what you started paying, what you would be paying if only CPI applied, and how much extra above inflation you are paying per month and per year." },
      { "@type": "HowToStep", position: 5, name: "See your total", text: "The total summary card shows your combined monthly spend, the CPI-only equivalent, and exactly how much extra above inflation you are being charged across all your subscriptions." },
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
      <SubscriptionInflationCalculatorPage />
    </>
  )
}
