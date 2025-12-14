import type { Metadata } from "next"
import LegacyPlannerPage from "./LegacyPlannerPage"

export const metadata: Metadata = {
  title: "Legacy Planner | Multi-Generation Wealth Tool",
  description:
    "Calculate inflation effects on inheritance and estate planning. Free multi-generation wealth transfer calculator with healthcare cost projections.",
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
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Legacy Planner",
    applicationCategory: "FinanceApplication",
    description:
      "Multi-generation wealth planning tool to calculate inflation effects on inheritance and estate planning across generations.",
    url: "https://globalinflationcalculator.com/legacy-planner",
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
          text: "As of 2025, you can gift up to $18,000 per person per year without filing a gift tax return (annual exclusion). Married couples can jointly gift $36,000 per recipient. The lifetime gift and estate tax exemption is $13.61 million per individual ($27.22 million per couple), allowing substantial wealth transfer without federal taxes.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* </CHANGE> */}
      <LegacyPlannerPage />
    </>
  )
}
