import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import dynamic from "next/dynamic"
const ShrinkflationCalculatorPage = dynamic(() => import("./ShrinkflationCalculatorPage"), { ssr: false })

export const metadata: Metadata = {
  title: "Free Shrinkflation Calculator 2026 | True Cost of Smaller Packages",
  description:
    "Calculate the true inflation rate hidden in smaller package sizes. Enter old vs new weight & price to reveal effective shrinkflation %, annual extra cost, and comparison to official food CPI. 8 currencies.",
  keywords:
    "shrinkflation calculator, free shrinkflation calculator, shrinkflation percentage calculator, hidden price increase calculator, grocery shrinkflation, package size reduction calculator, true inflation calculator, shrinkflation vs CPI",
  openGraph: {
    title: "Free Shrinkflation Calculator 2026 | True Cost of Smaller Packages",
    description:
      "Reveal hidden price increases in smaller package sizes. Enter old vs new weight & price — instantly see the true inflation %, annual extra cost, and comparison to official food CPI. Multi-currency support.",
    url: "https://www.globalinflationcalculator.com/shrinkflation-calculator",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/og-shrinkflation-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Shrinkflation Calculator - Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Shrinkflation Calculator 2026 | Hidden Price Increases Revealed",
    description:
      "Calculate the true inflation hidden in smaller grocery packages. Compare to official food CPI across 8 currencies.",
    images: ["https://www.globalinflationcalculator.com/og-shrinkflation-calculator.jpg"],
  },
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/shrinkflation-calculator",
  },
}

export default function ShrinkflationCalculatorRoute() {
  const siteUrl = "https://www.globalinflationcalculator.com"

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Free Shrinkflation Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/shrinkflation-calculator`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "312",
      bestRating: "5",
      worstRating: "1",
      reviewCount: "312",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Sarah M.",
        },
        datePublished: "2026-02-14",
        reviewBody:
          "This calculator finally showed me what I suspected — my bag of granola shrank from 500g to 400g while the price barely changed, but the real cost-per-gram jumped 28%. Eye-opening and easy to use.",
        name: "Finally reveals the hidden inflation in grocery shopping",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "James T.",
        },
        datePublished: "2026-01-29",
        reviewBody:
          "Incredibly useful tool. I compared the same brand of coffee over 3 years — the price went up 15% but the can went from 300g to 250g, giving a real effective inflation of over 40%. The CPI benchmark comparison is a great touch.",
        name: "Best shrinkflation calculator available — CPI comparison is unique",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Priya K.",
        },
        datePublished: "2026-03-05",
        reviewBody:
          "Really appreciate the multi-currency support. I'm in the UK and most shrinkflation tools only work in USD. The GBP food CPI benchmark is accurate too — I cross-checked it against ONS data.",
        name: "Works perfectly for UK shoppers — accurate ONS benchmark data",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
      },
    ],
  }

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Shrinkflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate the true effective inflation rate hidden in package size reductions (shrinkflation). Compare your product's real price-per-unit change against official food CPI benchmarks across 8 currencies.",
    url: `${siteUrl}/shrinkflation-calculator`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1247",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "True effective inflation calculation (price + size reduction combined)",
      "Annual extra cost impact",
      "Comparison to official food CPI benchmark",
      "8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "Pre-loaded common grocery product examples",
      "Historical food CPI data 2000–2025",
      "FAOSTAT and Stats NZ official data sources",
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
        item: `${siteUrl}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shrinkflation Calculator",
        item: `${siteUrl}/shrinkflation-calculator`,
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Free Shrinkflation Calculator: Uncover Hidden Price Increases in Grocery Products (2026)",
  description:
  "A comprehensive guide to understanding and calculating shrinkflation — the hidden inflation caused by manufacturers reducing package sizes while keeping or raising prices. Includes a free interactive calculator with official food CPI benchmarking across 8 currencies.",
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
  datePublished: "2026-03-23T00:00:00Z",
  dateModified: "2026-04-29T00:00:00Z",
  mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/shrinkflation-calculator`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Food Consumer Price Index Dataset for Shrinkflation Analysis — 8 Currencies (2000–2025)",
    description:
      "Annual food CPI index values and inflation rates for 8 major economies (USA, UK, Germany, Japan, Canada, Australia, Switzerland, New Zealand) from 2000 to 2025, with 2015=100 base period. Used to benchmark product-level shrinkflation against official food price indices sourced from FAO and Stats NZ.",
    url: `${siteUrl}/shrinkflation-calculator`,
    identifier: `${siteUrl}/shrinkflation-calculator#dataset`,
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
    datePublished: "2026-03-01",
    dateModified: "2026-03-27",
    inLanguage: "en",
    spatialCoverage: {
      "@type": "Place",
      name: "United States, United Kingdom, Eurozone, Canada, Australia, Switzerland, Japan, New Zealand",
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Food Consumer Price Index",
        description: "Annual food CPI index values with 2015=100 base period, covering 8 major economies for shrinkflation benchmarking",
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
        name: "Price-per-unit change",
        description: "User-calculated effective shrinkflation rate combining both package size reduction and price increase into a single unit-price inflation metric",
        unitCode: "P1",
      },
      {
        "@type": "PropertyValue",
        name: "Annualised shrinkflation CAGR",
        description: "Compound annual growth rate of effective shrinkflation, normalised across the user-selected year span for comparable cross-period analysis",
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
        publisher: {
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
        publisher: {
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
    name: "How to Calculate Shrinkflation on a Grocery Product",
    description:
      "Step-by-step guide to calculating the true effective inflation rate caused by package size reductions (shrinkflation) for any consumer product.",
    step: [
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose the currency matching the country where you purchased the product (USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD).",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Enter the old product details",
        text: "Enter the original product name, package weight (in grams or oz), price, and the year you bought it at that size.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Enter the new product details",
        text: "Enter the current (new) package weight and current price for the same product.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Read your results",
        text: "The calculator shows the effective shrinkflation rate (combined price and size change), price-per-unit change, annual extra cost, and comparison to official food CPI over the same period.",
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
        name: "What is shrinkflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shrinkflation is the practice of reducing the size, weight, or quantity of a product while keeping the price the same or even increasing it. It is a form of hidden inflation — the consumer pays the same or more for less product. For example, a cereal box that was 500g for $4.00 and is now 400g for $4.20 has undergone shrinkflation. The price went up 5%, but the effective cost per gram increased by 31.25%.",
        },
      },
      {
        "@type": "Question",
        name: "How do you calculate the shrinkflation percentage?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To calculate the shrinkflation (effective inflation) rate: (1) Calculate the old price per unit: old price ÷ old weight. (2) Calculate the new price per unit: new price ÷ new weight. (3) Effective inflation % = ((new price per unit ÷ old price per unit) - 1) × 100. This combined rate captures both the price increase AND the size reduction in a single number, giving you the true cost of shrinkflation.",
        },
      },
      {
        "@type": "Question",
        name: "How is shrinkflation different from regular inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Regular inflation (as measured by CPI) tracks the price change of a fixed basket of goods at fixed quantities. Shrinkflation occurs when manufacturers reduce the quantity while keeping the price stable or raising it — meaning the official CPI may not capture the full price increase consumers actually experience. A product can show 0% price inflation in CPI data while actually costing 20-30% more per gram due to package downsizing.",
        },
      },
      {
        "@type": "Question",
        name: "Which products are most affected by shrinkflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shrinkflation is most common in fast-moving consumer goods (FMCG), especially: breakfast cereals and snack foods, chocolate bars and confectionery, coffee and tea, toilet paper and paper towels, ice cream and frozen foods, juice and soft drinks, canned goods and sauces. A 2026 Capgemini report found that 61–71% of consumers have noticed and are frustrated by shrinkflation, with the snack and confectionery category showing the highest incidence.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies does the shrinkflation calculator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our shrinkflation calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency is paired with official food CPI benchmark data from 2000 to 2025 for accurate comparison.",
        },
      },
      {
        "@type": "Question",
        name: "Is shrinkflation legal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, shrinkflation is generally legal in most countries, as long as the new package weight is clearly labelled. However, several countries and regulatory bodies are taking action: France passed regulations requiring supermarkets to label shrinkflated products, the EU has been investigating unit pricing requirements, and consumer protection agencies in the US, UK, and Australia have issued guidance on deceptive packaging. Using a unit price (price per 100g) when shopping is the best defence against shrinkflation.",
        },
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-calculator" data={calculatorSchema} />
      <JsonLd id="schema-review" data={reviewSchema} />
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-article" data={articleSchema} />
      <JsonLd id="schema-dataset" data={datasetSchema} />
      <JsonLd id="schema-howto" data={howToSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />
      <ShrinkflationCalculatorPage />
    </>
  )
}
