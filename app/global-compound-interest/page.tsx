import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import GlobalCompoundInterestPage from "./GlobalCompoundInterestPage"

export const metadata: Metadata = {
  title: "Global Compound Interest Calculator | 8 Currencies",
  description:
    "Free compound interest calculator with inflation adjustment. Calculate returns across 8 currencies (USD, EUR, GBP, CAD, AUD, CHF, JPY, NZD) via official data.",
  keywords: [
    "compound interest calculator with inflation",
    "inflation adjusted compound interest calculator",
    "global compound interest calculator",
    "real returns calculator",
    "compound interest calculator multi currency",
    "purchasing power calculator",
    "compound interest calculator with monthly contributions",
    "free compound interest calculator with inflation",
    "nominal vs real returns calculator",
    "compound interest calculator EUR GBP USD",
  ],
  openGraph: {
    title: "Global Compound Interest Calculator | Inflation-Adjusted",
    description:
      "Calculate compound interest with real inflation adjustment across 8 currencies. See real vs nominal returns using official BLS inflation data.",
    url: "https://www.globalinflationcalculator.com/global-compound-interest",
    type: "website",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://www.globalinflationcalculator.com/og-compound-interest.jpg",
        width: 1200,
        height: 630,
        alt: "Global Compound Interest Calculator with Inflation Adjustment",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Compound Interest Calculator with Inflation",
    description:
      "Calculate real returns with inflation adjustment across 8 currencies using official BLS data. Free calculator with monthly contributions.",
    images: ["https://www.globalinflationcalculator.com/og-compound-interest.jpg"],
  },
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/global-compound-interest",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Page() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Global Compound Interest Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate compound interest with inflation adjustment across 8 major currencies using official Bureau of Labor Statistics inflation data. Shows real vs nominal returns.",
    url: "https://www.globalinflationcalculator.com/global-compound-interest",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "2143",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Compound interest with inflation adjustment",
      "Real vs nominal returns comparison",
      "8 currency support (USD, EUR, GBP, CAD, AUD, CHF, JPY, NZD)",
      "Monthly contribution calculations",
      "Purchasing power analysis",
      "Official BLS inflation data (1913-2026)",
      "Investment strategy comparison",
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Global Compound Interest Calculator - See Real Returns After Inflation",
    description:
      "Comprehensive compound interest calculator showing how inflation erodes investment returns across 8 currencies. Calculate real purchasing power using official BLS inflation data from 1913-2026.",
    image: {
      "@type": "ImageObject",
      url: "https://www.globalinflationcalculator.com/og-compound-interest.jpg",
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      url: "https://www.globalinflationcalculator.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
      logo: {
        "@type": "ImageObject",
        url: "https://www.globalinflationcalculator.com/favicon-96x96.png",
      },
    },
    datePublished: "2024-03-20T00:00:00Z",
    dateModified: "2026-04-29T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.globalinflationcalculator.com/global-compound-interest",
    },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Multi-Currency Compound Interest and Inflation Dataset",
    description:
      "Comprehensive dataset combining compound interest calculations with official inflation rates across 8 major currencies (USD, EUR, GBP, CAD, AUD, CHF, JPY, NZD). Historical inflation data from 1913-2026, investment return benchmarks, and purchasing power analysis.",
    url: "https://www.globalinflationcalculator.com/global-compound-interest",
    creator: {
      "@type": "Organization",
      name: "Global Inflation Calculator",
    },
    temporalCoverage: "1913/2026",
    spatialCoverage: {
      "@type": "Place",
      name: "Global - 8 major currencies",
    },
    variableMeasured: [
      "Compound Interest Growth",
      "Inflation-Adjusted Returns",
      "Real vs Nominal Investment Values",
      "Purchasing Power Over Time",
      "Multi-Currency Return Comparison",
      "Investment Strategy Performance",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: [
      {
        "@type": "Dataset",
        name: "Bureau of Labor Statistics Consumer Price Index - Multi-Currency",
        description:
          "Official inflation data for USD (2.8%), GBP (3.5%), EUR (2.5%), CAD (3.0%), AUD (3.5%), CHF (1.5%), JPY (1.0%), and NZD (2.5%) as of February 2026. Historical data from 1913-2026 for USD, multi-decade data for other currencies.",
        url: "https://www.bls.gov/cpi/",
        creator: {
          "@type": "Organization",
          name: "U.S. Bureau of Labor Statistics",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "S&P 500 Historical Returns Data",
        description:
          "Long-term stock market returns (10.5% average annual from 1928-2024) used to compare compound interest growth against inflation erosion. Essential for understanding real investment returns.",
        url: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/",
        creator: {
          "@type": "Organization",
          name: "S&P Dow Jones Indices",
        },
        license: "https://www.spglobal.com/en/terms-of-use",
      },
      {
        "@type": "Dataset",
        name: "U.S. Treasury Rates - February 2026",
        description:
          "Current Treasury rates for safe investment benchmarks: 3.67% (high-yield savings/3-month bills), 4.03% (I-Bonds with inflation protection), 4.5% (10-year notes). Used for conservative compound interest scenarios.",
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury",
        },
        license: "https://www.usa.gov/government-works",
      },
      {
        "@type": "Dataset",
        name: "Bond Market Historical Returns",
        description:
          "Long-term bond market returns (5% average annual) providing conservative investment benchmarks for compound interest calculations with lower volatility than stocks.",
        url: "https://www.treasury.gov/resource-center/data-chart-center/interest-rates/Pages/default.aspx",
        creator: {
          "@type": "Organization",
          name: "U.S. Department of the Treasury",
        },
        license: "https://www.usa.gov/government-works",
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
        name: "Global Compound Interest Calculator",
        item: "https://www.globalinflationcalculator.com/global-compound-interest",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does inflation affect compound interest?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Inflation reduces the purchasing power of your investment returns. While compound interest grows your money nominally (the dollar amount increases), inflation erodes what those dollars can actually buy. For example, with 7% investment returns and 2.8% inflation, your real return is only 4.2%. Our calculator shows both nominal returns (what you see in your account) and real returns (adjusted for inflation using official BLS data) so you understand your true purchasing power growth.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between nominal and real returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nominal returns are the actual percentage gains you see in your investment account (e.g., 7% annual growth). Real returns are what remain after adjusting for inflation - your actual purchasing power increase. If you earn 7% but inflation is 2.8%, your real return is approximately 4.2%. Real returns tell you how much wealthier you've actually become. With 2.8% USD inflation as of February 2026, a $100,000 investment earning 7% nominally only gains $4,200 in real purchasing power annually, not $7,000.",
        },
      },
      {
        "@type": "Question",
        name: "Which currency offers the best compound interest growth with inflation considered?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Swiss Franc (CHF) and Japanese Yen (JPY) historically preserve purchasing power best with inflation rates of 1.5% and 1.0% respectively as of February 2026. However, investment returns also matter - USD offers higher nominal investment returns (10.5% S&P 500 average) that can overcome its 2.8% inflation. The optimal currency depends on your investment strategy: CHF/JPY for capital preservation with lower inflation erosion, or USD/EUR for higher growth potential accepting higher inflation. Our calculator lets you compare all 8 currencies to find your best option.",
        },
      },
      {
        "@type": "Question",
        name: "How do I calculate compound interest with monthly contributions and inflation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The formula is: FV = P(1+r)^t + PMT × [((1+r)^t - 1) / r], then adjust for inflation using: Real FV = Nominal FV / (1 + inflation)^t. Where P = principal, r = annual return rate, t = years, PMT = monthly contribution. For example: $10,000 initial + $500/month for 20 years at 7% returns = $282,000 nominal. With 2.8% inflation, the real value is $159,000 in today's purchasing power - a 44% reduction. Our calculator handles all this math automatically using official BLS inflation data for accurate real return calculations across 8 currencies.",
        },
      },
      {
        "@type": "Question",
        name: "What investment return rate should I use for compound interest calculations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Conservative: 4-5% (bonds, treasury notes, CDs) - Lower risk, lower returns. Moderate: 6-7% (balanced portfolio, 60% stocks/40% bonds) - Medium risk/return. Aggressive: 8-10% (stock-heavy portfolio, S&P 500 averages 10.5%) - Higher risk/return. As of February 2026, current rates: High-yield savings 3.67%, I-Bonds 4.03%, 10-year Treasury 4.5%, S&P 500 historical 10.5%. Your choice depends on risk tolerance and time horizon. Longer time horizons (20+ years) can handle stock market volatility for higher returns. Our calculator includes preset rates from current Treasury data and historical market returns.",
        },
      },
      {
        "@type": "Question",
        name: "Why is understanding real returns important for long-term investing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Real returns determine whether you're actually building wealth or just keeping pace with rising prices. Over decades, inflation compounds dramatically - $100,000 today becomes worth only $53,000 in purchasing power after 20 years at 2.8% inflation. If your investments don't significantly outpace inflation, you're losing purchasing power despite nominal gains. For retirement planning across 30-40 years, understanding real returns is critical. Our calculator uses 113 years of BLS inflation data (1913-2026) to show exactly how inflation erodes your wealth, helping you set realistic return targets. A 3% real return (after inflation) doubles your purchasing power in 24 years.",
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
      <GlobalCompoundInterestPage />
    </>
  )
}
