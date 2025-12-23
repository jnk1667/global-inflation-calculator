import type { Metadata } from "next"
import PPPCalculatorPage from "./PPPCalculatorPage"

export const metadata: Metadata = {
  title: "PPP Calculator | Compare Purchasing Power Globally",
  description:
    "Calculate purchasing power parity across major economies. Compare real value of money using World Bank data with historical trends and sector breakdowns.",
  keywords:
    "PPP calculator, purchasing power parity, currency comparison, cost of living, salary comparison, World Bank PPP, international cost comparison",
  openGraph: {
    title: "PPP Calculator - Purchasing Power Parity Comparison",
    description:
      "Compare the real purchasing power of money across major economies using official World Bank PPP data. Historical trends, sector breakdowns, and unique insights.",
    url: "https://globalinflationcalculator.com/ppp-calculator",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://globalinflationcalculator.com/og-ppp-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "PPP Calculator - Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPP Calculator - Purchasing Power Parity Comparison",
    description: "Compare purchasing power across major economies with official World Bank PPP data.",
    images: ["https://globalinflationcalculator.com/og-ppp-calculator.jpg"],
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/ppp-calculator",
  },
}

export default function PPPCalculatorRoute() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PPP Calculator",
    applicationCategory: "FinanceApplication",
    description:
      "Calculate purchasing power parity across major global economies using World Bank data. Compare real value of money with historical trends and sector-specific breakdowns.",
    url: "https://globalinflationcalculator.com/ppp-calculator",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "PPP calculations for major economies",
      "Historical PPP trends (1990-2023)",
      "Sector-specific comparisons",
      "Multi-country comparison matrix",
      "Salary purchasing power analysis",
      "Official World Bank and OECD data",
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
        item: "https://globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "PPP Calculator",
        item: "https://globalinflationcalculator.com/ppp-calculator",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Purchasing Power Parity (PPP)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Purchasing Power Parity (PPP) is an economic measurement that compares different currencies through a basket of goods approach. It shows how much the same amount of money can buy in different countries. For example, if the PPP conversion factor is 2.0, it means 2 units of local currency have the same purchasing power as 1 US dollar in America.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is PPP for comparing salaries across countries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PPP provides a much more accurate comparison than simple exchange rates because it accounts for local price levels. However, it has limitations: it uses average baskets of goods, doesn't account for quality differences, and varies by spending category. For salary comparisons, combining PPP with cost of living indices and tax considerations gives the most accurate picture.",
        },
      },
      {
        "@type": "Question",
        name: "Why is PPP different from exchange rates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Exchange rates reflect market trading of currencies and can be influenced by speculation, interest rates, and financial flows. PPP reflects the actual cost of living and purchasing power in each country. A country may have a weak currency on exchange markets but strong purchasing power for local goods and services, or vice versa.",
        },
      },
      {
        "@type": "Question",
        name: "What countries does this PPP calculator cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our calculator covers 200+ countries using official World Bank PPP conversion factors. We provide data from 1990 to 2023, allowing historical comparisons. For 38 OECD countries, we also offer detailed sector-specific PPP breakdowns for housing, healthcare, education, and other categories.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PPPCalculatorPage />
    </>
  )
}
