import type { Metadata } from "next"
import AboutClientPage from "./AboutClientPage"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "About Us - Global Inflation Calculator | Our Mission",
  description:
    "Learn about the Global Inflation Calculator project, our mission to provide accurate historical inflation data to everyone for free.",
  keywords: [
    "about global inflation calculator",
    "inflation calculator team",
    "economic data experts",
    "financial calculator mission",
    "inflation research team",
    "purchasing power analysis experts",
  ],
  authors: [{ name: "Global Inflation Calculator Team" }],
  creator: "Global Inflation Calculator",
  publisher: "Global Inflation Calculator",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About Us - Global Inflation Calculator",
    description:
      "Learn about our mission to provide accurate historical inflation data and meet our team of economics experts.",
    url: `${siteUrl}/about`,
    siteName: "Global Inflation Calculator",
    images: [
      {
        url: "/images/globe-icon.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator Team",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - Global Inflation Calculator",
    description:
      "Learn about our mission to provide accurate historical inflation data and meet our team of economics experts.",
    images: ["/images/globe-icon.png"],
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
}

export default function AboutPage() {
  return <AboutClientPage />
}
