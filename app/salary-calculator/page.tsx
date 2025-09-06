import type { Metadata } from "next"
import SalaryCalculatorPage from "./SalaryCalculatorPage"

export const metadata: Metadata = {
  title: "Salary Calculator - Adjust for Inflation | Global Inflation Calculator",
  description:
    "Calculate how inflation affects your salary over time. Compare purchasing power and real wages across different years and regions with our comprehensive salary inflation calculator.",
  keywords: "salary calculator, inflation adjustment, real wages, purchasing power, salary inflation, wage calculator",
  openGraph: {
    title: "Salary Calculator - Adjust for Inflation",
    description:
      "Calculate how inflation affects your salary over time. Compare purchasing power and real wages across different years.",
    url: "https://globalinflationcalculator.com/salary-calculator",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://globalinflationcalculator.com/og-salary-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Salary Calculator - Global Inflation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Calculator - Adjust for Inflation",
    description: "Calculate how inflation affects your salary over time. Compare purchasing power and real wages.",
    images: ["https://globalinflationcalculator.com/og-salary-calculator.jpg"],
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/salary-calculator",
  },
}

export default function SalaryCalculatorPageRoute() {
  return <SalaryCalculatorPage />
}
