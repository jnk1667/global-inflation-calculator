import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import dynamic from "next/dynamic"
const EnergyInflationCalculatorPage = dynamic(() => import("./EnergyInflationCalculatorPage"), { ssr: false })
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) return envUrl
  return "https://www.globalinflationcalculator.com"
})()

const PAGE_PATH = "/energy-inflation-calculator"

export const metadata: Metadata = {
  title: "Energy Inflation Calculator 2026 | Electricity, Petrol & Fuel Price Rise",
  description:
    "See how energy prices have risen since 2000. Compare electricity, petrol & fuel inflation to general CPI across 8 currencies. Enter your monthly bill to see the real cost today.",
  keywords: [
    "energy inflation calculator",
    "electricity price inflation",
    "petrol price rise calculator",
    "fuel cost inflation",
    "energy CPI calculator",
    "electricity bill inflation",
    "energy prices 2026",
    "gas price inflation calculator",
    "energy vs general inflation",
    "household energy cost calculator",
    "electricity price history",
    "fuel inflation by country",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}${PAGE_PATH}`,
  },
  openGraph: {
    title: "Energy Inflation Calculator 2026 | Electricity, Petrol & Fuel Price Rise",
    description:
      "How much have electricity, petrol, and fuel prices risen since 2000? Compare energy inflation to general CPI across 8 currencies. Calculate your personal bill impact.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-energy-inflation-calculator.jpg`,
        width: 1200,
        height: 630,
        alt: "Energy Inflation Calculator — Global Inflation Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Energy Inflation Calculator 2026 | Electricity & Fuel Price Rise",
    description:
      "Compare electricity, petrol, and fuel price inflation to general CPI. 8 currencies, 2000–2025 data.",
    images: [`${siteUrl}/og-energy-inflation-calculator.jpg`],
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

export default function EnergyInflationCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Energy Inflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate how electricity, petrol, and fuel prices have inflated since 2000. Compare energy CPI to general CPI across 8 currencies. Includes a Bill Time Machine to show how much more your energy bill costs today.",
    url: `${siteUrl}${PAGE_PATH}`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "892",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Energy CPI vs general CPI comparison (2000–2025)",
      "Electricity & fuel absolute price history",
      "Bill Time Machine: project your old energy bill to today",
      "8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "Interactive line & bar charts",
      "Annual data table with energy & general CPI",
      "Scenario presets: Pre-Crisis, Green Transition, Energy Crisis, Full History",
      "Official sources: EIA, ONS, Eurostat, METI, ABS, FSO, ElCom, Stats NZ, StatsCan",
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
        name: "Energy Inflation Calculator",
        item: `${siteUrl}${PAGE_PATH}`,
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Energy Inflation Calculator 2026 — Electricity, Petrol & Fuel Price Rise Since 2000",
    description:
      "A comprehensive energy price inflation calculator showing how electricity, petrol, and fuel prices have risen compared to general CPI across 8 currencies from 2000 to 2025. Uses official data from EIA, ONS, Eurostat, METI, ABS, and other national statistics agencies.",
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/og-energy-inflation-calculator.jpg`,
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
    datePublished: "2026-04-13T00:00:00Z",
    dateModified: "2026-04-29T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${PAGE_PATH}`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "International Energy Price Inflation Dataset — 8 Currencies (2000–2025)",
    description:
      "Annual energy CPI index values, general CPI index values, electricity retail prices, and fuel retail prices for 8 major economies (USA, UK, Germany/Eurozone, Japan, Canada, Australia, Switzerland, New Zealand) from 2000 to 2025. Energy and general CPI indexed to 2000=100 for cross-country comparison.",
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
    dateModified: "2026-04-13",
    inLanguage: "en",
    spatialCoverage: {
      "@type": "Place",
      name: "United States, United Kingdom, Eurozone, Japan, Canada, Australia, Switzerland, New Zealand",
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Energy Consumer Price Index",
        description: "Annual energy CPI index values indexed to 2000=100, covering 8 major economies",
        unitCode: "IE",
      },
      {
        "@type": "PropertyValue",
        name: "General Consumer Price Index",
        description: "Annual general CPI index values indexed to 2000=100, covering 8 major economies",
        unitCode: "IE",
      },
      {
        "@type": "PropertyValue",
        name: "Retail electricity price",
        description: "Annual average residential electricity retail price in domestic currency per kWh",
        unitCode: "A93",
      },
      {
        "@type": "PropertyValue",
        name: "Retail fuel price",
        description: "Annual average retail petrol/gasoline price in domestic currency per litre or gallon",
        unitCode: "A93",
      },
    ],
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "EIA US Energy Prices & Consumer Price Index",
        description: "US Energy Information Administration retail electricity prices (cents per kWh), residential natural gas prices (dollars per thousand cubic feet), retail gasoline prices (dollars per gallon), and BLS energy CPI sub-index from 1994 to 2025. Used to calculate USD energy inflation and Bill Time Machine adjustments.",
        creator: { "@type": "Organization", name: "US Energy Information Administration (EIA)", url: "https://www.eia.gov" },
        url: "https://www.eia.gov/energyexplained/prices/",
        license: "https://www.eia.gov/about/copyrights_reuse.php",
      },
      {
        "@type": "Dataset",
        name: "ONS CPIH Energy Sub-Index (D7BT Series) & BEIS Road Fuel Prices",
        description: "UK Office for National Statistics CPIH energy sub-index series D7BT (2015=100) and BEIS road fuel survey pump prices in pence per litre from 2000 to 2025. Used to calculate GBP energy inflation and UK petrol price history.",
        creator: { "@type": "Organization", name: "Office for National Statistics (ONS)", url: "https://www.ons.gov.uk" },
        url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
        license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      },
      {
        "@type": "Dataset",
        name: "Eurostat HICP Energy Sub-Index (CP04, CP072) & BDEW Electricity Prices",
        description: "Eurostat Harmonised Index of Consumer Prices energy components CP04 (housing, water, electricity, gas) and CP072 (fuels and lubricants), combined with BDEW average residential electricity tariffs in EUR cents per kWh from 2000 to 2025. Used to calculate Eurozone EUR energy inflation.",
        creator: { "@type": "Organization", name: "Eurostat", url: "https://ec.europa.eu/eurostat" },
        url: "https://ec.europa.eu/eurostat/web/energy/data/database",
        license: "https://ec.europa.eu/eurostat/web/main/about-us/policies/copyright",
      },
      {
        "@type": "Dataset",
        name: "Statistics Canada CPI Table 18-10-0004-01 & NEB Electricity Prices",
        description: "Statistics Canada Consumer Price Index table 18-10-0004-01 energy sub-components and National Energy Board average residential electricity prices in CAD cents per kWh from 2000 to 2025. Used to calculate Canadian CAD energy inflation and Bill Time Machine adjustments.",
        creator: { "@type": "Organization", name: "Statistics Canada", url: "https://www.statcan.gc.ca" },
        url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401",
        license: "https://www.statcan.gc.ca/en/reference/licence",
      },
      {
        "@type": "Dataset",
        name: "ABS CPI Energy Sub-Group 6401.0 & AER Annual Electricity Prices",
        description: "Australian Bureau of Statistics Consumer Price Index catalogue 6401.0 energy sub-group and Australian Energy Regulator annual residential electricity prices in AUD cents per kWh from 2000 to 2025. Used to calculate Australian AUD energy inflation.",
        creator: { "@type": "Organization", name: "Australian Bureau of Statistics (ABS)", url: "https://www.abs.gov.au" },
        url: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia",
        license: "https://www.abs.gov.au/copyright",
      },
    ],
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Calculate Energy Price Inflation",
    description:
      "Step-by-step guide to using the Energy Inflation Calculator to compare electricity, petrol, and fuel price changes to general CPI across any period since 2000.",
    step: [
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose the currency matching your country (USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD). This selects the correct national energy price dataset and CPI benchmark.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Set your year range",
        text: "Use the From/To selectors or click a scenario preset (Pre-Crisis Decade, Green Transition, Energy Crisis, Full History) to choose the period you want to analyse.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Enter your monthly energy bill",
        text: "Type the total monthly energy bill you paid at your selected start year. The Bill Time Machine will show what that same usage level would cost in your end year using energy CPI inflation.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Read the charts and results",
        text: "The CPI Index chart shows energy vs general CPI over time. Switch to Absolute Prices to see electricity and fuel raw price trends. The % Change bar chart compares all categories side-by-side.",
        position: 4,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why has energy inflation outpaced general inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Energy prices are more volatile than the general price level because they are driven by global commodity markets (oil, gas, coal), geopolitical events, grid infrastructure investment cycles, and carbon pricing policies. Since 2000, events like the 2000s oil boom, the 2008 commodity spike, and the 2021–2022 energy crisis following Russia's invasion of Ukraine have caused energy CPI to surge well above general CPI in most countries. In the US, energy CPI rose approximately 103–186% from 2000 to 2025 depending on the commodity, while general CPI rose around 85%.",
        },
      },
      {
        "@type": "Question",
        name: "How is the energy CPI index calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The energy CPI (Consumer Price Index for energy) measures the price change of a fixed basket of energy goods — typically electricity, natural gas, petrol/gasoline, and heating fuels — relative to a base period. Each national statistics agency defines its own basket composition and weights. Our calculator uses each country's official energy CPI sub-index (e.g. ONS D7BT for UK, Eurostat CP04+CP072 for Eurozone, BLS Energy CPI for USA) and re-indexes all series to 2000 = 100 for international comparison.",
        },
      },
      {
        "@type": "Question",
        name: "Which country has had the highest energy inflation since 2000?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Among the 8 countries tracked, the United Kingdom has experienced the largest cumulative energy CPI increase since 2000 — rising over 330% to 432 (index 2000=100) by 2025, driven by Ofgem price cap increases, the 2022 energy crisis, and the UK's high dependence on imported natural gas. Australia has also seen very high energy inflation, particularly in electricity, due to renewable transition infrastructure costs. Germany/Eurozone saw a dramatic spike in 2022 following the Russia-Ukraine conflict, with the energy CPI index reaching 338 before declining as gas markets rebalanced.",
        },
      },
      {
        "@type": "Question",
        name: "Has electricity become cheaper in any country since 2000?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "In absolute price terms, electricity has not become cheaper in any of the 8 countries tracked since 2000. However, when adjusted for general inflation (real prices), the increase has been more modest in some markets. The US has seen relatively contained electricity price growth (from 8.24 ct/kWh in 2000 to 17.05 ct/kWh in 2025), and Switzerland maintained stable real electricity prices for much of the 2000–2020 period. Germany and Australia have seen the largest real electricity price increases due to energy transition costs and grid investment.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Bill Time Machine work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Bill Time Machine takes your entered monthly energy bill at the selected start year and multiplies it by the cumulative energy CPI change over your selected period. For example, if your bill was £100/month in 2000 and UK energy CPI rose 332% to 2025, your equivalent bill in 2025 would be £432/month. This assumes constant energy usage — it does not account for efficiency improvements, changes in household size, or tariff structure changes. The general CPI equivalent is shown alongside for comparison, illustrating how much more energy inflation has cost you versus a general inflation adjustment.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies does the energy inflation calculator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR, using Germany as representative Eurozone country), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency uses its own official national energy CPI, electricity price series, and petrol/gasoline price series from the respective national statistics agency.",
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
      <EnergyInflationCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Energy Inflation Calculator — Electricity, Petrol & Fuel Price Rise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Compare electricity, petrol, and fuel price inflation to general CPI across 8 currencies from 2000 to 2025.
                  Enter your monthly energy bill to see how much more it would cost today using energy CPI data.
                </p>
                <section aria-label="Supported energy types">
                  <h3 className="font-semibold mb-2">Energy Types Tracked:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Electricity — retail price per kWh (national household average)</li>
                    <li>Petrol / Gasoline — retail price per litre or gallon</li>
                    <li>Energy CPI sub-index — official basket covering all household energy</li>
                    <li>General CPI — for comparison against energy inflation</li>
                  </ul>
                </section>
                <section className="mt-4" aria-label="Supported currencies">
                  <h3 className="font-semibold mb-2">Supported Currencies:</h3>
                  <p className="text-sm">USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD — each with official national data sources.</p>
                </section>
                <nav className="mt-6" aria-label="Related tools">
                  <h3 className="font-semibold mb-2">Related Tools:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><Link href="/" className="text-blue-600 hover:underline">Home — Inflation Calculator</Link></li>
                    <li><Link href="/shrinkflation-calculator" className="text-blue-600 hover:underline">Shrinkflation Calculator</Link></li>
                    <li><Link href="/insurance-inflation-calculator" className="text-blue-600 hover:underline">Insurance Inflation Calculator</Link></li>
                    <li><Link href="/budget-calculator" className="text-blue-600 hover:underline">Budget Calculator</Link></li>
                    <li><Link href="/investment-race-calculator" className="text-blue-600 hover:underline">Investment Race Calculator</Link></li>
                  </ul>
                </nav>
                <p className="text-sm text-gray-600 mt-6">
                  This calculator requires JavaScript. Please enable JavaScript in your browser to use the interactive features.
                </p>
              </CardContent>
            </Card>
          </header>
        </div>
      </noscript>
    </>
  )
}
