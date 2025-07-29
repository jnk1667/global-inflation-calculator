import type { Metadata } from "next"
import AboutClientPage from "./AboutClientPage"

export const metadata: Metadata = {
  title: "About Us - Global Inflation Calculator",
  description:
    "Learn about our mission to democratize financial data and meet the team behind the Global Inflation Calculator. Discover our methodology and data sources.",
  keywords: ["about", "team", "methodology", "data sources", "inflation calculator"],
  openGraph: {
    title: "About Us - Global Inflation Calculator",
    description:
      "Learn about our mission to democratize financial data and meet the team behind the Global Inflation Calculator.",
    type: "website",
  },
}

export default function AboutPage() {
  return <AboutClientPage />
}
