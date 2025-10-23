import type { Metadata } from "next"
import LegacyPlannerPage from "./LegacyPlannerPage"

export const metadata: Metadata = {
  title: "Legacy Planner | Estate Planning Tool",
  description:
    "Calculate how inflation affects inheritance, estate planning and wealth transfer. Free multi-generation wealth planning calculator with healthcare cost.",
  metadataBase: new URL("https://globalinflationcalculator.com"),
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
    url: "https://globalinflationcalculator.com/legacy-planner",
    type: "website",
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "https://globalinflationcalculator.com/placeholder.svg?height=630&width=1200&text=Legacy+Planner",
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
    images: ["https://globalinflationcalculator.com/placeholder.svg?height=630&width=1200&text=Legacy+Planner"],
  },
  alternates: {
    canonical: "https://globalinflationcalculator.com/legacy-planner",
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
        name: "Legacy Planner",
        item: "https://globalinflationcalculator.com/legacy-planner",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <LegacyPlannerPage />
    </>
  )
}
