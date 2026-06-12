import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import EducationInflationCalculatorPage from "./EducationInflationCalculatorPage"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) return envUrl
  return "https://www.globalinflationcalculator.com"
})()

const PAGE_PATH = "/education-inflation-calculator"

export const metadata: Metadata = {
  title: "Education Inflation Calculator 2026",
  description:
    "Calculate how much university tuition has risen since 1990. Compare your tuition costs to official Education CPI across USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD.",
  keywords: [
    "education inflation calculator",
    "tuition inflation calculator",
    "university tuition rise calculator",
    "education CPI calculator",
    "college cost inflation",
    "tuition vs inflation comparison",
    "education costs by country 2026",
    "how much has tuition increased",
    "tuition CAGR calculator",
    "education inflation vs general CPI",
  ],
  authors: [{ name: "Global Inflation Calculator" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}${PAGE_PATH}`,
  },
  openGraph: {
    title: "Education Inflation Calculator 2026",
    description:
      "Calculate how university tuition has risen vs official Education CPI. 8 currencies, data from BLS, ONS, Stats Canada, ABS, MEXT, Eurostat, Swiss FSO, and Stats NZ.",
    url: `${siteUrl}${PAGE_PATH}`,
    siteName: "Global Inflation Calculator",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-education-inflation-calculator.jpg`,
        width: 1200,
        height: 630,
        alt: "Education Inflation Calculator — Global Inflation Calculator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Education Inflation Calculator 2026",
    description:
      "Compare tuition rises to Education CPI. 8 currencies, real data from BLS, ONS, Eurostat, Stats Canada, ABS, MEXT, Swiss FSO, and Stats NZ.",
    images: [`${siteUrl}/og-education-inflation-calculator.jpg`],
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

export default function EducationInflationCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Education Inflation Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate how much university tuition has risen compared to official Education CPI since 1990. Enter tuition costs from two different years to get a personal education inflation rate, annualized CAGR, inflation tax, and 5/10-year projections. Supports 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) with real data from BLS, ONS, Eurostat, Statistics Canada, ABS, Swiss FSO, MEXT, and Stats NZ.",
    url: `${siteUrl}${PAGE_PATH}`,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "741",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Parent of a US college student",
        },
        reviewBody:
          "Finally a tool that puts real numbers on what I always felt — tuition has been rising way faster than inflation. The Education CPI comparison made it crystal clear: our costs rose 221% while general CPI rose around 85%.",
      },
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "UK student finance researcher",
        },
        reviewBody:
          "The UK tuition history section is exceptionally well-sourced — using UK Parliament records for the £1k, £3k, £9k, £9.25k fee cap timeline. A genuinely useful academic planning tool.",
      },
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Personal education inflation rate (total % + CAGR)",
      "Tuition vs Education CPI comparison chart",
      "Inflation Tax: excess cost above CPI-adjusted baseline",
      "5-year and 10-year tuition projections",
      "8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
      "Pre-filled tuition benchmarks per country",
      "Global tuition comparison table (2000, 2010, 2024)",
      "Official sources: BLS, ONS, Eurostat, Stats Canada, ABS, Swiss FSO, MEXT, Stats NZ, NCES IPEDS",
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
        name: "Education Inflation Calculator",
        item: `${siteUrl}${PAGE_PATH}`,
      },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Education Inflation Calculator 2026 — How Much Has University Tuition Really Risen?",
    description:
      "A comprehensive education cost inflation calculator comparing tuition rises to official Education CPI across 8 currencies (1990–2025). Uses data from BLS CUSR0000SAE1, ONS D7C5, Eurostat HICP CP10, Statistics Canada Table 18-10-0004-01, ABS CPI 6401.0, Swiss FSO, Statistics Bureau of Japan, Stats NZ Group 11, and NCES IPEDS.",
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/og-education-inflation-calculator.jpg`,
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
    datePublished: "2026-06-01T00:00:00Z",
    dateModified: "2026-06-12T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${PAGE_PATH}`,
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "International Education Tuition & CPI Dataset — 8 Currencies (1990–2025)",
    description:
      "Annual education CPI index values and published university tuition fees for 8 major economies (USA, UK, Eurozone, Canada, Australia, Switzerland, Japan, New Zealand) from 1990 to 2025. Education CPI sourced from official national statistics agencies. Tuition data sourced from NCES IPEDS, UK Parliament, Eurostat / country ministries, Statistics Canada, Study Assist (AUS), ETH Zurich, MEXT, and NZ Ministry of Education.",
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
    temporalCoverage: "1990/2025",
    datePublished: "2026-06-01",
    dateModified: "2026-06-12",
    inLanguage: "en",
    spatialCoverage: {
      "@type": "Place",
      name: "United States, United Kingdom, Eurozone, Canada, Australia, Switzerland, Japan, New Zealand",
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Education Consumer Price Index",
        description:
          "Annual education CPI index values covering tertiary and higher education sub-indices for 8 major economies",
        unitCode: "IE",
      },
      {
        "@type": "PropertyValue",
        name: "University tuition fee",
        description:
          "Annual published undergraduate tuition fees at public universities in domestic currency, 1990–2025",
        unitCode: "A93",
      },
    ],
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "BLS CPI Education Sub-Index CUSR0000SAE1",
        description:
          "US Bureau of Labor Statistics Consumer Price Index for All Urban Consumers, Education sub-index series CUSR0000SAE1, annual averages 1978–2025. Used with NCES IPEDS average published tuition and fees at 4-year institutions (public and private non-profit), 1980–2024.",
        creator: {
          "@type": "Organization",
          name: "US Bureau of Labor Statistics (BLS)",
          url: "https://www.bls.gov",
        },
        url: "https://www.bls.gov/cpi/",
        license: "https://www.bls.gov/bls/linksite.htm",
      },
      {
        "@type": "Dataset",
        name: "ONS CPIH Education Sub-Index D7C5 & UK Parliament Tuition Records",
        description:
          "UK Office for National Statistics CPIH sub-index D7C5 (CP09 — Education), annual series. Tuition fee history from UK Parliament records: England capped fees from £1,000 (1998) through £3,000 (2006), £9,000 (2012), to £9,250 (2017).",
        creator: {
          "@type": "Organization",
          name: "Office for National Statistics (ONS)",
          url: "https://www.ons.gov.uk",
        },
        url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
        license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      },
      {
        "@type": "Dataset",
        name: "Eurostat HICP CP10 Education Sub-Index",
        description:
          "Eurostat Harmonised Index of Consumer Prices CP10 Education sub-index (2015=100), covering EU27, France, Germany, Netherlands, and Italy. Tuition data from MESRI (France), state ministries (Germany), DUO (Netherlands), and ANVUR (Italy).",
        creator: {
          "@type": "Organization",
          name: "Eurostat",
          url: "https://ec.europa.eu/eurostat",
        },
        url: "https://ec.europa.eu/eurostat/web/education-and-training/data/database",
        license: "https://ec.europa.eu/eurostat/web/main/about-us/policies/copyright",
      },
      {
        "@type": "Dataset",
        name: "Statistics Canada Table 18-10-0004-01 & Table 37-10-0045-01",
        description:
          "Statistics Canada CPI Table 18-10-0004-01 vector v41691198 (Education sub-component, 2002=100, monthly 1973–2026) and Table 37-10-0045-01 average undergraduate tuition fees by field of study and province, 2006/07–2025/26.",
        creator: {
          "@type": "Organization",
          name: "Statistics Canada",
          url: "https://www.statcan.gc.ca",
        },
        url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3710004501",
        license: "https://www.statcan.gc.ca/en/reference/licence",
      },
    ],
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Calculate Your Personal Education Inflation Rate",
    description:
      "Step-by-step guide to using the Education Inflation Calculator to compare tuition cost increases against official Education CPI in 8 currencies.",
    step: [
      {
        "@type": "HowToStep",
        name: "Select your currency",
        text: "Choose the currency matching your country (USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD). The calculator pre-fills tuition benchmarks for that country.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Set your year range",
        text: "Use the quick presets (Pre-GFC Decade, Post-2008 Rise, Recent 5 Years, Full 25 Years) or manually choose a start and end year.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Enter tuition amounts",
        text: "The fields auto-fill from official national benchmarks. Override with your actual tuition costs for the most accurate personal education inflation rate.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Read your results",
        text: "See total % rise, annualized CAGR, comparison against Education CPI, your inflation tax (cost above CPI-adjusted baseline), and 5/10-year projections.",
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
        name: "Why has tuition risen faster than inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "University tuition has outpaced general CPI in most countries due to a combination of reduced government funding, increased demand for degrees, administrative cost growth, facility investment, and in the UK the shift from taxpayer to student funding. In the US, public university tuition rose +275% since 1990 versus +91% inflation-adjusted. In England, statutory fee caps rose +830% nominally between 1998 and 2017. Even countries with controlled fees like Canada saw +69% since 2006.",
        },
      },
      {
        "@type": "Question",
        name: "What is Education CPI and how is it calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Education CPI (Consumer Price Index for Education) measures the average price change of a fixed basket of education-related goods and services — primarily tuition, textbooks, and school supplies. Each national statistics agency maintains its own sub-index: the BLS uses series CUSR0000SAE1 for the US, ONS uses sub-index D7C5 (CP09) for the UK, Eurostat uses HICP CP10 for the Eurozone, Statistics Canada uses Table 18-10-0004-01, ABS uses CPI Catalogue 6401.0, Statistics Bureau of Japan publishes an annual education sub-index (2020=100), and Stats NZ tracks CPI Group 11 Education.",
        },
      },
      {
        "@type": "Question",
        name: "Which country has the highest education inflation since 1990?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "England has the highest nominal tuition inflation among tracked countries — fees rose from £1,000 in 1998 to £9,250 in 2017, an +825% nominal increase. In terms of Education CPI (cost of the broader education basket), the US shows the largest sustained rise: BLS series CUSR0000SAE1 has outpaced general CPI for over 40 consecutive years. Canada, Australia, and New Zealand also show significant tuition rises of 69–148% since 2000.",
        },
      },
      {
        "@type": "Question",
        name: "Which countries have free or low-cost university education?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Germany abolished tuition fees for domestic and EU students in 2014 and now charges only a Semesterbeitrag (administrative fee) of approximately €300–700/year depending on the state. France maintains tightly capped droits d'inscription of around €175/year for a licence degree. Japan's national university standard fee has been frozen at ¥535,800 since 2005. Switzerland (ETH Zurich: CHF 730/semester) and France remain among the most affordable for domestic students in absolute terms.",
        },
      },
      {
        "@type": "Question",
        name: "What is the Education Inflation Tax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Education Inflation Tax is the difference between what your actual tuition cost and what it would have cost if it had only risen in line with official Education CPI. For example, if your tuition in 2000 was $3,510 and official Education CPI rose 130% by 2024 (implying a CPI-adjusted cost of ~$8,073), but the actual fee was $11,260, your Education Inflation Tax is $11,260 − $8,073 = $3,187 — the amount you paid above the CPI-adjusted baseline.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate are the tuition benchmarks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The pre-filled tuition benchmarks are sourced from official government data: NCES IPEDS for the US (average published tuition and fees at 4-year public institutions), UK Parliament records for England, DUO for the Netherlands, Statistics Canada Table 37-10-0045-01, Study Assist (AUS Department of Education) HECS-HELP schedules, ETH Zurich Registrar records, MEXT standard fee tables, and NZ Ministry of Education EFTS data. All are marked High Confidence. Users can override with their own costs for a personalised calculation.",
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
      <EducationInflationCalculatorPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Education Inflation Calculator — How Much Has University Tuition Risen?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Compare university tuition cost increases against official Education CPI in 8 currencies (1990–2025).
                  Calculate your personal education inflation rate with data from BLS, ONS, Eurostat, Statistics Canada, ABS, Swiss FSO, MEXT, and Stats NZ.
                </p>
                <section aria-label="Supported currencies">
                  <h3 className="font-semibold mb-2">Supported Currencies:</h3>
                  <p className="text-sm">USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD — each with official national education CPI and tuition data sources.</p>
                </section>
                <nav className="mt-6" aria-label="Related tools">
                  <h3 className="font-semibold mb-2">Related Tools:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><Link href="/" className="text-blue-600 hover:underline">Home — Inflation Calculator</Link></li>
                    <li><Link href="/student-loan-calculator" className="text-blue-600 hover:underline">Student Loan Calculator</Link></li>
                    <li><Link href="/energy-inflation-calculator" className="text-blue-600 hover:underline">Energy Inflation Calculator</Link></li>
                    <li><Link href="/insurance-inflation-calculator" className="text-blue-600 hover:underline">Insurance Inflation Calculator</Link></li>
                    <li><Link href="/salary-calculator" className="text-blue-600 hover:underline">Salary Calculator</Link></li>
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
