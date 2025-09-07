import type { Metadata } from "next"
import ClientPage from "./ClientPage"

export const metadata: Metadata = {
  title: "Global Inflation Calculator - Historical Currency Purchasing Power 1913-2025",
  description:
    "Calculate historical inflation and purchasing power across 8 major currencies from 1913 to present. Compare USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD with real government data.",
  keywords: [
    "inflation calculator",
    "gdp deflator",
    "purchasing power calculator",
    "historical inflation rates",
    "currency inflation comparison",
    "CPI calculator",
    "money value over time",
    "inflation rate by year",
    "cost of living calculator",
    "economic inflation data",
    "financial planning tool",
  ],
  openGraph: {
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description:
      "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present. Compare USD, GBP, EUR, CAD, AUD, CHF, JPY with real government data.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200&text=Global+Inflation+Calculator",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator - Historical Currency Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Inflation Calculator - Track Currency Purchasing Power 1913-2025",
    description: "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present.",
    images: ["/placeholder.svg?height=630&width=1200&text=Global+Inflation+Calculator"],
  },
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  return <ClientPage />
}
