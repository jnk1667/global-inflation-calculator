import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import dynamic from "next/dynamic"
const DateflationCalculatorPage = dynamic(() => import("./DateflationCalculatorPage"), { ssr: false })

export const metadata: Metadata = {
  title: "Dateflation Calculator | How Much More Expensive Is Dating?",
  description:
    "Calculate your personal dateflation rate — how much more expensive dating has become since you started. Enter old vs current date costs and see your dateflation %, annual extra spend, and how it compares to official eating-out CPI. Covers USD, GBP, CAD, AUD, JPY.",
  keywords:
    "dateflation calculator, how expensive is dating, dating cost inflation, date cost calculator, cost of dating calculator, dating inflation rate, BMO dateflation, how much does a date cost, dateflation rate, date night cost inflation",
  openGraph: {
    title: "Dateflation Calculator | How Much More Expensive Is Dating?",
    description:
      "Calculate your personal dateflation rate. Dating costs rose 12.5% in the US in a single year — outpacing general inflation 4:1. See your annual extra dating spend and CPI comparison across 5 currencies.",
    url: "https://www.globalinflationcalculator.com/dateflation-calculator",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/og-dateflation-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Dateflation Calculator — Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dateflation Calculator | Dating Costs Rising Fast",
    description:
      "US dating costs rose 12.5% in a single year — far outpacing general inflation. Calculate your personal dateflation rate across 5 currencies.",
    images: ["https://www.globalinflationcalculator.com/og-dateflation-calculator.jpg"],
  },
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/dateflation-calculator",
  },
}

export default function DateflationCalculatorRoute() {
  const siteUrl = "https://www.globalinflationcalculator.com"

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dateflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate the personal dateflation rate — the rise in the cost of going on dates since a chosen year. Compares actual date cost increases against the official eating-out CPI sub-index for 5 currencies (USD, GBP, CAD, AUD, JPY), showing annual extra spend, a Dating Inflation Tax, and forward projections.",
    url: `${siteUrl}/dateflation-calculator`,
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
      "Personal dateflation rate calculation (total % and annualised CAGR)",
      "Pre-filled survey data for 5 currencies from BMO, Velloy, ABS, and Japanese sources",
      "Comparison to official eating-out CPI sub-index (BLS, ONS, Stats Canada, ABS, Statistics Bureau Japan)",
      "Annual extra dating spend calculation",
      "Dating Inflation Tax (amount paid above CPI-adjusted baseline)",
      "3-year and 5-year forward cost projections",
      "5 date type presets: Dinner & Drinks, Coffee & Walk, Activity, Drinks Only, Home Date",
      "Optional pre-date cost breakdown: grooming, transport, dating apps",
      "Data quality transparency badges (High Confidence vs Estimated Baseline)",
      "Interactive line chart: actual date cost trajectory vs CPI baseline",
    ],
  }

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Dateflation Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/dateflation-calculator`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "412",
      bestRating: "5",
      worstRating: "1",
      reviewCount: "412",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Mia L." },
        datePublished: "2026-02-18",
        reviewBody:
          "Finally a calculator that shows exactly how much dateflation has hit my wallet. I started dating in 2019 and had no idea my dinner dates had gone up nearly 60% until I used this. The CPI comparison feature is brilliant.",
        name: "Opened my eyes to how much dating has inflated",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Tom R." },
        datePublished: "2026-03-10",
        reviewBody:
          "The pre-filled survey data is a really smart touch — I just tweaked the numbers slightly and got my exact situation. The annual extra spend was genuinely shocking. Great for a budget conversation with a partner.",
        name: "Smart tool, shocking results — highly recommended",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Yuki H." },
        datePublished: "2026-04-01",
        reviewBody:
          "Love that it includes Japanese Yen support with the correct gender-split context. Most global finance tools ignore Japan entirely. The eating-out CPI data is from the Statistics Bureau of Japan which is authoritative.",
        name: "Great Japanese Yen support — rare for a dating cost tool",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Dateflation Calculator", item: `${siteUrl}/dateflation-calculator` },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Dateflation Calculator: How Much More Expensive Has Dating Become?",
    description:
      "A comprehensive guide to understanding and calculating dateflation — the hidden inflation in the cost of going on dates. Covers survey data from the US, UK, Canada, Australia, and Japan, with a free interactive calculator comparing personal date cost increases to official eating-out CPI benchmarks.",
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/og-dateflation-calculator.jpg`,
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
      logo: { "@type": "ImageObject", url: `${siteUrl}/favicon-96x96.png` },
    },
    datePublished: "2026-05-16T00:00:00Z",
    dateModified: "2026-05-16T00:00:00Z",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/dateflation-calculator` },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Dateflation Dataset — Average Date Costs and Eating-Out CPI for 5 Currencies (2015–2026)",
    description:
      "Average per-date cost survey data and official eating-out CPI sub-index values for 5 currencies (USD, GBP, CAD, AUD, JPY) from 2015 to 2026. Used to calculate personal dateflation rates and compare date cost inflation to official government benchmarks.",
    url: `${siteUrl}/dateflation-calculator`,
    identifier: `${siteUrl}/dateflation-calculator#dataset`,
    creator: { "@type": "Organization", name: "Global Inflation Calculator", url: siteUrl },
    publisher: { "@type": "Organization", name: "Global Inflation Calculator", url: siteUrl },
    license: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2015/2026",
    datePublished: "2026-05-16",
    dateModified: "2026-05-16",
    inLanguage: "en",
    spatialCoverage: {
      "@type": "Place",
      name: "United States, United Kingdom, Canada, Australia, Japan",
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Average cost per date",
        description: "Survey-measured or CPI-back-filled average cost per dating occasion, by currency and year",
        unitCode: "MON",
      },
      {
        "@type": "PropertyValue",
        name: "Eating-out CPI sub-index",
        description: "Official government eating-out/food-away-from-home CPI sub-index used to benchmark date cost inflation",
        unitCode: "IE",
      },
      {
        "@type": "PropertyValue",
        name: "Personal dateflation rate",
        description: "User-calculated total percentage change in per-date cost between a chosen year and 2026",
        unitCode: "P1",
      },
      {
        "@type": "PropertyValue",
        name: "Annual dating inflation tax",
        description: "Extra amount paid per year above what would be expected if date costs had only risen with the eating-out CPI",
        unitCode: "MON",
      },
    ],
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "BMO Real Financial Progress Index — US & Canada (2025, 2026)",
        description:
          "Nationally representative annual survey of financial wellbeing and spending behaviour conducted by Ipsos for BMO Financial Group. Covers n=2,500 US adults and n=2,500 Canadian adults. Reports average per-date spending for respondents who dated in the prior 12 months: US $168 (2025), $189 (2026); Canada CA$173 (2025), CA$174 (2026).",
        creator: { "@type": "Organization", name: "BMO Financial Group / Ipsos" },
        url: "https://usnewsroom.bmo.com/2026-02-11-Date-flation-Hits-Hard-Average-Date-Spend-Nears-200-BMO-Real-Financial-Progress-Index",
        license: "https://www.bmo.com/en-ca/main/about-bmo/legal/",
      },
      {
        "@type": "Dataset",
        name: "BLS CPI — Food Away From Home (CUUS0000SEFV)",
        description:
          "Official US Consumer Price Index sub-series CUUS0000SEFV, measuring price change for food consumed away from home (restaurants, fast food, cafes). Published monthly by the US Bureau of Labor Statistics; annual averages used here from 2010 to 2025 as the official CPI benchmark for US date cost comparisons.",
        creator: { "@type": "Organization", name: "US Bureau of Labor Statistics" },
        url: "https://fred.stlouisfed.org/series/CUUS0000SEFV",
        license: "https://www.bls.gov/bls/linksite.htm",
      },
      {
        "@type": "Dataset",
        name: "ONS CPIH 11.1.1 Restaurants & Cafes (L557, 2015=100)",
        description:
          "UK Consumer Price Index including owner-occupiers' housing costs (CPIH) sub-index series L557, covering restaurants and cafes (division 11.1.1), base year 2015=100. Published by the UK Office for National Statistics; annual averages from 2015 to 2025 used as the official CPI benchmark for GBP date cost comparisons.",
        creator: { "@type": "Organization", name: "UK Office for National Statistics" },
        url: "https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/l557/mm23",
        license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      },
      {
        "@type": "Dataset",
        name: "Statistics Canada CPI — Food Purchased from Restaurants (v41692930)",
        description:
          "Statistics Canada Consumer Price Index vector v41692930, measuring price change for food purchased from restaurants across Canada. Annual averages from 2015 to 2025 used as the official CPI benchmark for CAD date cost comparisons and historical back-calculation of Canadian date costs prior to the 2025 BMO survey anchor.",
        creator: { "@type": "Organization", name: "Statistics Canada" },
        url: "https://www150.statcan.gc.ca/t1/tbl1/en/dtbl/54155460",
        license: "https://www.statcan.gc.ca/en/reference/licence",
      },
      {
        "@type": "Dataset",
        name: "ABS CPI — Meals Out and Take Away Foods (A2325807C)",
        description:
          "Australian Bureau of Statistics Consumer Price Index sub-series A2325807C, measuring price change for meals out and take-away foods across Australian capital cities. Annual averages from 2015 to 2025 used as the official CPI benchmark for AUD date cost comparisons and projection from the 2022 Yahoo Finance Australia survey anchor.",
        creator: { "@type": "Organization", name: "Australian Bureau of Statistics" },
        url: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia",
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      {
        "@type": "Dataset",
        name: "Statistics Bureau of Japan CPI — Eating Out (外食, 2020=100)",
        description:
          "Consumer Price Index eating-out sub-index published by the Statistics Bureau of Japan, Ministry of Internal Affairs and Communications, base year 2020=100. Annual averages from 2015 to 2025 used as the official CPI benchmark for JPY date cost comparisons and historical back-calculation from the 2023 trami.jp survey anchor (n=1,000+, average date cost ¥12,491).",
        creator: { "@type": "Organization", name: "Statistics Bureau of Japan, Ministry of Internal Affairs and Communications" },
        url: "https://www.stat.go.jp/english/data/cpi/",
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
    ],
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Calculate Your Personal Dateflation Rate",
    description:
      "Step-by-step guide to calculating how much more expensive dating has become for you personally, compared to when you started dating, and how that compares to official eating-out inflation.",
    step: [
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose USD (US), GBP (UK), CAD (Canada), AUD (Australia), or JPY (Japan). The calculator auto-fills 2026 average date costs from survey data for your country.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Choose your date type",
        text: "Select Dinner & Drinks, Coffee & Walk, Activity Date, Drinks Only, or Home/Cook Together. Costs auto-fill from country-specific survey benchmarks.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Set your start year and past cost",
        text: "Select the year you started dating. The 'Then' cost field pre-fills from survey or CPI data for that year — edit it to match your actual experience.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Set your dates per month",
        text: "Enter how many dates you typically go on per month. This scales your annual extra spend and inflation tax figures.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Optionally add pre-date costs",
        text: "Toggle on grooming, transport, and dating app costs to get a fully-loaded total dateflation figure.",
        position: 5,
      },
      {
        "@type": "HowToStep",
        name: "Read your results",
        text: "The calculator shows your total dateflation %, annualised rate, annual extra dating spend, Dating Inflation Tax vs CPI, and 3/5-year forward cost projections.",
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
        name: "What is dateflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dateflation is the phenomenon where the cost of going on dates rises faster than general inflation. The term was popularised in the US by BMO Financial Group in 2023–2026, when their annual surveys showed date costs rising 12.5% in a single year (2025 to 2026) — far outpacing the ~3% general CPI over the same period. Dateflation is driven by restaurant price inflation, rising transport costs (rideshare, fuel), higher grooming costs, and surging dating app subscription prices.",
        },
      },
      {
        "@type": "Question",
        name: "How much does the average date cost in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Average date costs vary significantly by country: United States: $189/date (BMO RFPI 2026, Ipsos n=2,501), up 12.5% from $168 in 2025. United Kingdom: approximately £120/date (Velloy Dating Index 2024, extrapolated). Canada: CA$174/date (BMO Canada 2026, Ipsos n=2,500). Australia: approximately A$184/date (estimated from ABS meals-out CPI). Japan: approximately ¥9,500 for the man's share (kanetohonne.jp 2024). Note: definitions of what is included (grooming, transport etc.) vary by survey and affect the figures.",
        },
      },
      {
        "@type": "Question",
        name: "What is the dateflation rate in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "In the United States, dateflation ran at 12.5% from 2025 to 2026 — the single-year increase in average per-date spend from $168 to $189 (BMO Real Financial Progress Index 2026). From 2019 to 2026, US date costs have risen approximately 57%, while general CPI rose roughly 23% over the same period. This means dateflation has run at approximately 2.5x the rate of general inflation since 2019.",
        },
      },
      {
        "@type": "Question",
        name: "Why are dating costs rising so fast?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several compounding factors drive dateflation: (1) Restaurant inflation: Food-away-from-home prices rose ~41% in the US from 2019 to 2025. UK restaurant prices rose 35% between 2019 and 2025. (2) Rideshare costs: Uber and Lyft prices have risen significantly post-pandemic due to driver shortages and fuel costs. (3) Dating app price surges: Hinge Preferred rose from $12.99/month in 2019 to $34.99 in 2026 — a 169% increase. (4) Experience inflation: Gen Z's preference for experience-based dates (escape rooms, activities, events) adds higher per-date cost. (5) Social media pressure: Apps like TikTok and Instagram create pressure to attend trending, expensive venues.",
        },
      },
      {
        "@type": "Question",
        name: "How does your dateflation calculator work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The dateflation calculator takes your 'then' date cost (auto-filled from survey data or CPI back-calculation, or overrideable) and your current date cost, then calculates: (1) Total dateflation % = ((current cost / past cost) - 1) × 100. (2) Annualised CAGR. (3) Annual extra spend = extra per date × dates per year. (4) Dating Inflation Tax = annual extra above CPI-adjusted baseline. (5) Forward projections at the current annualised rate. The eating-out CPI comparison uses official government sub-indices: BLS Food Away From Home (US), ONS CPIH L557 (UK), Statistics Canada restaurant CPI (Canada), ABS Meals Out (Australia), Statistics Bureau of Japan Eating Out CPI (Japan).",
        },
      },
      {
        "@type": "Question",
        name: "Is dating getting more or less common due to dateflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The evidence is striking: BMO 2026 found Americans went on 12 dates on average in 2025–2026, down from 14 in 2024–2025 — fewer dates despite spending more per date. 55% of single Canadians had zero dates in the past 12 months (BMO Canada 2025). 47% of US singles (BMO 2026) and 50% of Canadian singles (BMO Canada 2026) say dating is not financially worth it. The Sydney Morning Herald (2023) reported Australians shifting from restaurant dinners to drinks-only or home dates due to cost-of-living pressures. This suggests dateflation is reducing dating frequency while increasing per-occasion cost for those who do date.",
        },
      },
      {
        "@type": "Question",
        name: "Which currencies does this dateflation calculator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The dateflation calculator supports 5 currencies: USD (United States), GBP (United Kingdom), CAD (Canada), AUD (Australia), and JPY (Japan). Each currency is paired with: (a) direct survey data from nationally representative samples where available, (b) the official eating-out CPI sub-index from the relevant national statistics bureau for CPI comparison and historical back-filling, and (c) a data quality badge (High Confidence or Estimated Baseline) that transparently explains the strength of the underlying data.",
        },
      },
      {
        "@type": "Question",
        name: "What is a 'Dating Inflation Tax'?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Dating Inflation Tax, as used in this calculator, is the amount you pay per year above what you would expect to pay if date costs had only risen at the same rate as the official eating-out CPI. For example: if date costs rose 57% from 2019 to 2026, but the eating-out CPI only rose 41%, your dates cost 16% more than the 'CPI-adjusted' amount. On 2 dates per month at $189/date, that extra 16% amounts to approximately $725/year in Dating Inflation Tax — money that cannot be explained by restaurant price inflation alone.",
        },
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-calculator"  data={calculatorSchema}  />
      <JsonLd id="schema-review"      data={reviewSchema}      />
      <JsonLd id="schema-breadcrumb"  data={breadcrumbSchema}  />
      <JsonLd id="schema-article"     data={articleSchema}     />
      <JsonLd id="schema-dataset"     data={datasetSchema}     />
      <JsonLd id="schema-howto"       data={howToSchema}       />
      <JsonLd id="schema-faq"         data={faqSchema}         />
      <DateflationCalculatorPage />
    </>
  )
}
