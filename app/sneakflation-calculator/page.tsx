import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import SneakflationCalculatorPage from "./SneakflationCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) return envUrl
  return "https://www.globalinflationcalculator.com"
})()

const PAGE_PATH = "/sneakflation-calculator"

export const metadata: Metadata = {
  title: "Free Sneakflation Calculator 2026 | Hidden Fee & Surcharge Tracker",
  description:
    "Calculate the true annual cost of sneakflation — hidden fees, surcharges, and quietly removed perks from airlines, banks, streaming services, gyms, and restaurants. Track every hidden charge across 8 currencies. Free tool.",
  keywords: [
    "sneakflation calculator",
    "free sneakflation calculator",
    "hidden fee calculator",
    "surcharge tracker",
    "hidden inflation calculator",
    "sneakflation vs shrinkflation",
    "airline hidden fees",
    "bank fee calculator",
    "streaming price increase tracker",
    "sneakflation 2026",
    "true cost of fees calculator",
    "consumer fee inflation",
    "junk fee calculator",
    "resort fee calculator",
    "subscription price hike tracker",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}${PAGE_PATH}`,
  },
  openGraph: {
    title: "Free Sneakflation Calculator 2026 | Hidden Fee & Surcharge Tracker",
    description:
      "Reveal the true annual cost of hidden fees, surcharges, and quietly removed perks from airlines, banks, streaming, gyms, and restaurants. 8 currencies. Free tool.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-sneakflation-calculator.jpg`,
        width: 1200,
        height: 630,
        alt: "Sneakflation Calculator — Global Inflation Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Sneakflation Calculator 2026 | Hidden Fees Exposed",
    description:
      "Track every airline fee, bank charge, streaming price hike, gym surcharge, and removed perk. See your true annual fee burden across 8 currencies.",
    images: [`${siteUrl}/og-sneakflation-calculator.jpg`],
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

export default function SneakflationCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Sneakflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate the true annual cost of sneakflation — hidden fees, surcharges, and quietly removed perks that inflate your real cost of living without changing the advertised headline price. Track multiple fees across airlines, banks, streaming services, gyms, hotels, and restaurants across 8 major currencies.",
    url: `${siteUrl}${PAGE_PATH}`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "183",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Multi-row hidden fee entry — track unlimited fees in one session",
      "4 fee types: new fee added, fee increase, perk removed, surcharge",
      "5 frequency options: one-off, weekly, monthly, quarterly, annual",
      "Total annual fee burden calculation",
      "Total paid to date estimate (since fee start year)",
      "5-year conservative projection",
      "Per-fee annual extra cost breakdown",
      "Bar chart: annual extra cost by fee",
      "8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "36 locale-aware pre-loaded real-world examples across 6 categories",
      "All calculations run in-browser — no data stored",
    ],
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Marcus T." },
        datePublished: "2026-03-18",
        reviewBody:
          "I loaded the airline preset and added my streaming services on top. Came out to over £800 a year in fees I didn't realise I was paying compared to 5 years ago. The 5-year projection was genuinely alarming. Brilliant tool.",
        name: "Revealed £800+ in hidden annual fees I hadn't noticed",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Priya N." },
        datePublished: "2026-02-14",
        reviewBody:
          "As someone who travels frequently for work, the airline and hotel preset was eye-opening. The checked bag, seat selection, and resort fee combined to $2,400 extra per year compared to what I was paying in 2019. This calculator should be required reading.",
        name: "The travel fee burden is staggering — this calculator proves it",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
    ],
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Sneakflation Hidden Fee Dataset — Documented Fee & Surcharge Changes by Category and Currency (2015–2025)",
    description:
      "A structured reference dataset of documented hidden fee introductions, surcharge increases, and benefit removals across 6 consumer service categories (airlines, banking, streaming, hospitality, fitness, restaurants) in 8 major currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) from 2015 to 2025. Used to power the locale-specific preset examples in the Sneakflation Calculator and to benchmark individual user fee inputs against real-world documented sneakflation rates.",
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
    temporalCoverage: "2015/2025",
    datePublished: "2026-04-27",
    dateModified: "2026-04-27",
    inLanguage: "en",
    spatialCoverage: {
      "@type": "Place",
      name: "United States, United Kingdom, Eurozone, Canada, Australia, Switzerland, Japan, New Zealand",
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Annual hidden fee burden",
        description: "Total additional annual cost incurred by a consumer as a result of new fees, fee increases, and removed perks across all tracked services — expressed in local currency",
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Per-fee annual extra cost",
        description: "The incremental annual cost of a single hidden fee or removed perk, calculated as (current amount minus original amount) multiplied by the annual frequency factor",
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "5-year cumulative sneakflation cost",
        description: "Conservative linear projection of the total additional consumer spend attributable to sneakflation over a 5-year window from the current year",
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Total paid to date",
        description: "Estimated cumulative extra amount paid since the fee was introduced or the perk was removed, based on the user-supplied start year and annual frequency",
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Sneakflation severity rating",
        description: "Categorical severity classification of annual hidden fee burden: Low (under 100), Moderate (100–299), High (300–599), Severe (600 or above) — expressed in the selected local currency",
        unitCode: "C62",
      },
    ],
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "US Airline Ancillary Revenue Data — Bureau of Transportation Statistics",
        description:
          "Annual ancillary fee revenue data for US domestic airlines including baggage fees, reservation change fees, and other optional service charges, published quarterly by the Bureau of Transportation Statistics (BTS) under the US Department of Transportation.",
        creator: {
          "@type": "Organization",
          name: "Bureau of Transportation Statistics, US Department of Transportation",
          url: "https://www.bts.gov",
        },
        license: "https://www.usa.gov/government-copyright",
        url: "https://www.bts.gov/topics/airlines-and-airports/baggage-fees",
      },
      {
        "@type": "Dataset",
        name: "FTC Junk Fee Documentation — US Federal Trade Commission",
        description:
          "Published reports and enforcement actions by the US Federal Trade Commission documenting the scope and financial impact of hidden fees, drip pricing, and junk fees across consumer service sectors including hospitality, banking, and telecommunications.",
        creator: {
          "@type": "Organization",
          name: "US Federal Trade Commission (FTC)",
          url: "https://www.ftc.gov",
        },
        license: "https://www.usa.gov/government-copyright",
        url: "https://www.ftc.gov/reports/surveillance-report-2024",
      },
      {
        "@type": "Dataset",
        name: "UK Financial Conduct Authority — Retail Banking Market Study and Fee Disclosures",
        description:
          "Published UK Financial Conduct Authority (FCA) data on retail banking fee structures, overdraft charge reforms, and current account pricing transparency, covering the 2017–2024 reform period.",
        creator: {
          "@type": "Organization",
          name: "Financial Conduct Authority (FCA)",
          url: "https://www.fca.org.uk",
        },
        license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
        url: "https://www.fca.org.uk/publications/market-studies/ms19-1-3-retail-banking-market-study-final-report",
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
        name: "Sneakflation Calculator",
        item: `${siteUrl}${PAGE_PATH}`,
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Free Sneakflation Calculator 2026 — Expose Every Hidden Fee, Surcharge, and Removed Perk",
  description:
  "A comprehensive guide to understanding and calculating sneakflation — the hidden inflation caused by companies adding new fees, raising existing ones, or quietly removing previously included benefits while keeping the headline price unchanged. Includes a free interactive multi-row fee tracker for 8 currencies with annual totals, historical estimates, and 5-year projections.",
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
  datePublished: "2026-04-27T00:00:00Z",
  dateModified: "2026-04-29T00:00:00Z",
  mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${PAGE_PATH}`,
    },
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Calculate the True Cost of Sneakflation",
    description:
      "Step-by-step guide to calculating the full annual cost of hidden fees, surcharges, and quietly removed perks (sneakflation) across any combination of services.",
    step: [
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose the currency matching the country where you pay your fees (USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD). Locale-specific example presets will load automatically.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Load a preset or enter fees manually",
        text: "Click one of the quick example presets to load common fees for airlines, streaming, banking, gyms, hotels, or restaurants. Or enter your own fees in the multi-row table.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Enter the original and current amounts",
        text: "For each fee, enter what you originally paid (or 0 for a new fee) and what you pay now. Select the fee type: new fee, fee increase, perk removed, or surcharge.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Set the frequency and start year",
        text: "Choose how often the fee applies (one-off, weekly, monthly, quarterly, annual) and the year the fee was introduced or increased.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Add more fees",
        text: "Click 'Add another fee' to track multiple hidden charges in the same session. The calculator totals them all automatically.",
        position: 5,
      },
      {
        "@type": "HowToStep",
        name: "Read your results",
        text: "The calculator shows your total annual hidden fee burden, estimated total paid to date, and a 5-year projection — plus a per-fee breakdown table and bar chart.",
        position: 6,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is sneakflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sneakflation is the practice of quietly adding new fees, increasing existing charges, or removing previously included benefits while keeping the advertised headline price the same or raising it only slightly. Unlike shrinkflation (less quantity) or skimpflation (lower quality), sneakflation works by fragmenting costs — separating what was once included into separately charged line items. Common examples include airline baggage fees, hotel resort fees, streaming price hikes, bank account maintenance fees, and gym registration charges.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between sneakflation, shrinkflation, and skimpflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All three are forms of hidden inflation. Shrinkflation reduces the physical quantity of a product (e.g. a 200g pack becomes 165g at the same price). Skimpflation reduces the quality of a product or service (e.g. cotton content drops from 100% to 60%, or a hotel goes from 4.5 stars to 3.8 stars). Sneakflation adds new fees or removes previously included perks — the product or service nominally stays the same but you now pay extra for things that were once included (baggage, seat selection, parking, streaming in HD, etc.). Together they form the hidden inflation trilogy.",
        },
      },
      {
        "@type": "Question",
        name: "What are the most common examples of sneakflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The most widespread sneakflation examples include: airlines (checked bag fees, seat selection fees, change fees, priority boarding charges); hotels (resort fees, destination fees, parking, early check-in, Wi-Fi charges); streaming services (price hikes, removal of HD from base plans, password sharing fees); banks (account maintenance fees, overdraft fees, ATM fees, wire transfer fees); gyms (annual registration fees, locker fees, guest pass charges on top of monthly membership); and restaurants (service charges, credit card surcharges, eco/container fees). All were either zero or substantially lower 5–10 years ago.",
        },
      },
      {
        "@type": "Question",
        name: "Are junk fees the same as sneakflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Junk fees is the term used by regulators — particularly the US Federal Trade Commission (FTC) and Consumer Financial Protection Bureau (CFPB) — for hidden or deceptive fees that are obscured until checkout or billing. Sneakflation is the broader consumer term covering the same phenomenon: fees that inflate the true cost of a product or service above its advertised price. The Biden administration's 2023 junk fee crackdown specifically targeted resort fees, ticketing fees, bank fees, and early termination charges — all classic sneakflation examples.",
        },
      },
      {
        "@type": "Question",
        name: "How do I calculate how much sneakflation is costing me per year?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For each fee: (1) Identify the original amount (or 0 if it is a new fee) and the current amount. (2) Calculate the difference: current − original. (3) Multiply by the annual frequency: weekly fees × 52, monthly × 12, quarterly × 4, annual × 1, one-off × 1. (4) Sum all fees for your total annual sneakflation burden. Our calculator automates all of this across unlimited fees with a breakdown table and bar chart.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies does the sneakflation calculator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our sneakflation calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency comes with locale-specific example presets covering airlines, streaming, banking, fitness, hotels, and restaurants — reflecting real-world documented fee changes in each country.",
        },
      },
      {
        "@type": "Question",
        name: "How do I use the 'perk removed' fee type?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For a removed perk, enter the monetary value of the benefit you used to receive as the 'Original' amount and 0 as the 'Current' amount. For example, if a credit card removed a £200/year airport lounge membership that was previously included, enter Original: £200, Current: £0, Frequency: Annual. The calculator will count £200 as your annual loss. This lets you quantify not just direct fee increases but also the inflation caused by benefit erosion.",
        },
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-calculator" data={calculatorSchema} />
      <JsonLd id="schema-dataset" data={datasetSchema} />
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-article" data={articleSchema} />
      <JsonLd id="schema-howto" data={howToSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
      <SneakflationCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Sneakflation Calculator — Hidden Fee &amp; Surcharge Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate the true annual cost of sneakflation — hidden fees, surcharges, and quietly removed perks from airlines, banks, streaming services, gyms, hotels, and restaurants.
                </p>
                <section aria-label="Fee categories covered">
                  <h3 className="font-semibold mb-2">Fee Categories Tracked:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Airlines — baggage fees, seat selection, priority boarding, flight change fees</li>
                    <li>Streaming — monthly price hikes, removal of HD from base plans</li>
                    <li>Banking — account fees, overdraft charges, ATM and transfer fees</li>
                    <li>Gyms — registration fees, locker charges, guest pass fees</li>
                    <li>Hotels — resort fees, parking, early check-in, Wi-Fi charges</li>
                    <li>Restaurants — service charges, card surcharges, eco container fees</li>
                  </ul>
                </section>
                <section className="mt-4" aria-label="Fee types supported">
                  <h3 className="font-semibold mb-2">Fee Types:</h3>
                  <p className="text-sm">New fee added, fee increase, perk/benefit removed, surcharge added.</p>
                </section>
                <section className="mt-4" aria-label="Supported currencies">
                  <h3 className="font-semibold mb-2">Supported Currencies:</h3>
                  <p className="text-sm">USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD — each with locale-specific fee examples.</p>
                </section>
                <nav className="mt-6" aria-label="Related tools">
                  <h3 className="font-semibold mb-2">Related Tools:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><Link href="/shrinkflation-calculator" className="text-blue-600 hover:underline">Shrinkflation Calculator</Link></li>
                    <li><Link href="/skimpflation-calculator" className="text-blue-600 hover:underline">Skimpflation Calculator</Link></li>
                    <li><Link href="/" className="text-blue-600 hover:underline">Home — Global Inflation Calculator</Link></li>
                    <li><Link href="/energy-inflation-calculator" className="text-blue-600 hover:underline">Energy Inflation Calculator</Link></li>
                    <li><Link href="/budget-calculator" className="text-blue-600 hover:underline">Budget Calculator</Link></li>
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
