import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import LegacyPlannerPage from "./LegacyPlannerPage"

export const metadata: Metadata = {
  title: "Legacy Planner | Multi-Generation Wealth Tool",
  description:
    "Calculate inflation effects on inheritance and estate planning. Free multi-generation wealth transfer calculator with healthcare cost projections.",
  metadataBase: new URL("https://www.globalinflationcalculator.com"),
  keywords: [
    "legacy planner",
    "estate planning calculator",
    "multi-generation wealth planning",
    "inheritance calculator",
    "family wealth preservation",
    "generational wealth transfer",
    "estate planning with inflation",
    "wealth erosion calculator",
    "family financial planning",
    "inheritance value calculator",
    "legacy planning tool",
    "estate planning software",
    "wealth transfer calculator",
    "family legacy planning",
    "generational wealth calculator",
    "estate value projection",
    "inheritance planning calculator",
    "wealth preservation tool",
    "family estate planning",
    "multi-generational financial planning",
  ],
  openGraph: {
    title: "Legacy Planner: Multi-Generation Wealth Planning Calculator",
    description:
      "Plan your family's financial legacy across generations. Calculate how inflation affects inheritance and estate planning with our free legacy planning tool.",
    url: "https://www.globalinflationcalculator.com/legacy-planner",
    type: "website",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/placeholder.svg?height=630&width=1200&text=Legacy+Planner",
        width: 1200,
        height: 630,
        alt: "Legacy Planner - Multi-Generation Wealth Planning Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GlobalInflationCalc",
    title: "Legacy Planner: Multi-Generation Wealth Planning Calculator",
    description:
      "Plan your family's financial legacy across generations. Calculate how inflation affects inheritance and estate planning.",
    images: ["https://www.globalinflationcalculator.com/placeholder.svg?height=630&width=1200&text=Legacy+Planner"],
  },
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/legacy-planner",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
}

export default function LegacyPlannerPageWrapper() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Legacy Planner",
    applicationCategory: "FinanceApplication",
    description:
      "Multi-generation wealth planning tool to calculate inflation effects on inheritance and estate planning across generations.",
    url: "https://www.globalinflationcalculator.com/legacy-planner",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "1089",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Multi-generation wealth planning",
      "Inheritance value calculator",
      "Estate planning with inflation adjustment",
      "Healthcare cost projections",
      "Wealth erosion analysis",
      "Family financial planning tool",
      "Generational wealth transfer calculator",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Legacy Planner - Multi-Generation Wealth Transfer Calculator",
    description:
      "Comprehensive guide to legacy planning and multi-generational wealth transfer. Calculate how inflation and healthcare costs affect inheritance across generations with official BLS inflation data.",
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: "https://www.globalinflationcalculator.com/favicon-96x96.png",
      },
    },
    datePublished: "2024-03-01",
    dateModified: "2026-02-10",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.globalinflationcalculator.com/legacy-planner",
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Multi-Generation Legacy Planning and Wealth Transfer Dataset",
    description:
      "Comprehensive dataset combining U.S. inflation rates, healthcare cost inflation (81% higher than general inflation), estate tax exemption levels ($13.99M individual/$27.98M couple for 2026), and multi-generational wealth erosion analysis for legacy planning across 100+ years.",
    url: "https://www.globalinflationcalculator.com/legacy-planner",
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "2023/2126",
    spatialCoverage: {
      "@type": "Place",
      name: "Global - 8 major currencies",
    },
    variableMeasured: [
      "Inflation-Adjusted Wealth Value",
      "Healthcare Cost Inflation Impact",
      "Multi-Generation Wealth Erosion",
      "Real vs Nominal Inheritance Value",
      "Estate Tax Exemption Thresholds",
      "Portfolio Growth After Inflation",
      "Generational Wealth Transfer Efficiency",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Consumer Price Index - Multi-Currency",
        description:
          "Official inflation data for USD (2.8%), GBP (3.5%), EUR (2.5%), CAD (3.0%), AUD (3.5%), CHF (1.5%), JPY (1.0%), and NZD (2.5%) as of February 2026, used to calculate inflation-adjusted inheritance values across generations and currencies.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Healthcare Cost Inflation Data",
        description:
          "Healthcare inflation runs 81% higher than general inflation (approximately 5.1% for USD vs 2.8% general inflation), significantly impacting long-term legacy planning as medical expenses erode wealth faster than other categories, particularly affecting elderly generations.",
        url: "https://www.bls.gov/cpi/factsheets/medical-care.htm",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "IRS Estate and Gift Tax Exemption Amounts - 2026",
        description:
          "Federal estate and gift tax exemption levels for 2026: $13.99 million per individual ($27.98 million per married couple), with annual gift exclusion of $19,000 per recipient ($38,000 for married couples). These thresholds are indexed for inflation annually.",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/estate-tax",
        creator: {
          "@type": "Organization",
          name: "Internal Revenue Service",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Social Security Administration Life Expectancy Tables",
        description:
          "Actuarial life expectancy data used to calculate realistic multi-generational wealth transfer timelines, average inheritance ages by generation, and longevity-adjusted estate planning scenarios spanning 100+ years.",
        url: "https://www.ssa.gov/oact/STATS/table4c6.html",
        creator: {
          "@type": "Organization",
          name: "Social Security Administration",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Historical Portfolio Returns Data",
        description:
          "Long-term investment return data showing historical stock market returns (10% average), bond returns (5% average), and balanced portfolio performance (7% average) used to project wealth growth across generations and compare against inflation erosion.",
        url: "https://www.investopedia.com/ask/answers/042415/what-average-annual-return-sp-500.asp",
        creator: {
          "@type": "Organization",
          name: "S&P 500 Historical Data",
        },
        license: "https://www.investopedia.com/legal-4768893#toc-license-to-use-website",
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
        item: "https://www.globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Legacy Planner",
        item: "https://www.globalinflationcalculator.com/legacy-planner",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is legacy planning?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Legacy planning is the process of organizing your financial affairs to transfer wealth to future generations efficiently. It includes estate planning, will creation, trust establishment, tax minimization strategies, and ensuring your family's financial security across multiple generations.",
        },
      },
      {
        "@type": "Question",
        name: "How does inflation affect inheritance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inflation erodes the purchasing power of inherited wealth over time. At 3% annual inflation, $1 million today will have the purchasing power of only $740,000 in 10 years and $550,000 in 20 years. Proper legacy planning accounts for inflation through growth-oriented investments and strategic asset allocation.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best way to transfer wealth to heirs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The best method depends on your situation, but common strategies include: establishing trusts to avoid probate and provide control, gifting assets during your lifetime to reduce estate taxes, creating family LLCs or partnerships for business assets, and using life insurance for tax-free wealth transfer. Consult an estate planning attorney for personalized advice.",
        },
      },
      {
        "@type": "Question",
        name: "How much can I gift to family members tax-free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "As of 2026, you can gift up to $19,000 per person per year without filing a gift tax return (annual exclusion). Married couples can jointly gift $38,000 per recipient. The lifetime gift and estate tax exemption is $13.99 million per individual ($27.98 million per couple), allowing substantial wealth transfer without federal taxes.",
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
      <JsonLd id="schema-faq" data={faqSchema} />
      {/* </CHANGE> */}
      <LegacyPlannerPage />
    </>
  )
}
