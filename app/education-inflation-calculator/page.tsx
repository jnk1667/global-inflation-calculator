import type { Metadata } from "next"
import EducationInflationCalculatorPage from "./EducationInflationCalculatorPage"

export const metadata: Metadata = {
  title: "Education Inflation Calculator | Global Inflation Calculator",
  description: "Calculate how much more expensive education has become. Compare your tuition costs across 25+ years and see education inflation vs official CPI in 8 currencies.",
  openGraph: {
    title: "Education Inflation Calculator",
    description: "See how education inflation outpaces general CPI in your country. Calculate real tuition cost increases.",
    url: "https://globalinflationcalculator.com/education-inflation-calculator",
  },
}

export default function Page() {
  return <EducationInflationCalculatorPage />
}
