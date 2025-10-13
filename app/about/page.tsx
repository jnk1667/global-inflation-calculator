import type { Metadata } from "next"
import AboutClientPage from "./AboutClientPage"
import Link from "next/link"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "About Us - Global Inflation Calculator | Our Mission",
  description:
    "Learn about the Global Inflation Calculator project, our mission to provide accurate historical inflation data to everyone for free.",
  keywords: [
    "about global inflation calculator",
    "inflation calculator team",
    "best inflation calculator online",
    "best inflation calculator 2025 accurate",
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
  return (
    <div>
      <AboutClientPage />

      <footer className="mt-12 pt-8 border-t border-border bg-muted/30 rounded-lg p-6" role="contentinfo">
        <nav aria-label="Footer navigation">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Calculator Tools</h4>
              <ul className="space-y-2" role="list">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/deflation-calculator"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/salary-calculator"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/retirement-calculator"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="text-muted-foreground hover:text-primary transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Information</h4>
              <ul className="space-y-2" role="list">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2" role="list">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact</h4>
              <ul className="space-y-2" role="list">
                <li>
                  <a
                    href="mailto:admin@globalinflationcalculator.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Global Inflation Calculator. All rights reserved.</p>
        </div>
      </footer>
      {/* End of changes */}
    </div>
  )
}
