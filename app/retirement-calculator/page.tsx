import type { Metadata } from "next"
import RetirementCalculatorPage from "./RetirementCalculatorPage"

export const metadata: Metadata = {
  title: "Retirement Calculator - Complete Planning Tool | Global Inflation Calculator",
  description:
    "Comprehensive retirement calculator with lifestyle maintenance, crisis analysis, generation gap comparison, and healthcare cost projections. Plan your retirement with accurate inflation-adjusted calculations.",
  keywords: [
    "retirement calculator",
    "retirement planning",
    "lifestyle maintenance calculator",
    "retirement crisis calculator",
    "generation retirement gap",
    "healthcare retirement costs",
    "401k calculator",
    "retirement savings",
    "purchasing power retirement",
    "inflation adjusted retirement",
  ],
  openGraph: {
    title: "Complete Retirement Calculator - Plan Your Financial Future",
    description:
      "Calculate retirement needs with lifestyle maintenance, crisis analysis, and healthcare cost projections. Compare generational retirement requirements.",
    url: "/retirement-calculator",
    type: "website",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200&text=Retirement+Calculator",
        width: 1200,
        height: 630,
        alt: "Comprehensive Retirement Planning Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete Retirement Calculator - Plan Your Financial Future",
    description:
      "Calculate retirement needs with lifestyle maintenance, crisis analysis, and healthcare cost projections.",
  },
  alternates: {
    canonical: "/retirement-calculator",
  },
}

export default function Page() {
  return <RetirementCalculatorPage />
}
