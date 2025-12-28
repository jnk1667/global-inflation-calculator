import type { Metadata } from "next"
import AboutClientPage from "./AboutClientPage"
import Link from "next/link"

const siteUrl = "https://www.globalinflationcalculator.com"

export const metadata: Metadata = {
  title: "About Us | Global Inflation Calculator Mission",
  description:
    "Learn about Global Inflation Calculator's mission to provide accurate historical inflation data for free to everyone worldwide.",
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
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: `${siteUrl}/about`,
      },
    ],
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AboutClientPage />

      <footer className="mt-12 bg-slate-900 text-white rounded-lg overflow-hidden" role="contentinfo">
        <div className="grid md:grid-cols-3 gap-8 p-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Learn about Global Inflation Calculator's mission to provide accurate historical inflation data for free
              to everyone worldwide.
            </p>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Bureau of Labor Statistics (BLS)</li>
              <li>• Federal Reserve Economic Data</li>
              <li>• US Treasury Department</li>
              <li>• OECD Economic Indicators</li>
              <li>• Global Central Banks</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/deflation-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Deflation Calculator
                </Link>
              </li>
              <li>
                <Link href="/charts" className="text-slate-300 hover:text-white transition-colors">
                  Charts & Analytics
                </Link>
              </li>
              <li>
                <Link href="/ppp-calculator" className="text-slate-300 hover:text-white transition-colors">
                  PPP Calculator
                </Link>
              </li>
              <li>
                <Link href="/salary-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Salary Calculator
                </Link>
              </li>
              <li>
                <Link href="/retirement-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Retirement Calculator
                </Link>
              </li>
              <li>
                <Link href="/student-loan-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Student Loan Calculator
                </Link>
              </li>
              <li>
                <Link href="/mortgage-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link href="/budget-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Budget Calculator
                </Link>
              </li>
              <li>
                <Link href="/emergency-fund-calculator" className="text-slate-300 hover:text-white transition-colors">
                  Emergency Fund Calculator
                </Link>
              </li>
              <li>
                <Link href="/roi-calculator" className="text-slate-300 hover:text-white transition-colors">
                  ROI Calculator
                </Link>
              </li>
              <li>
                <Link href="/legacy-planner" className="text-slate-300 hover:text-white transition-colors">
                  Legacy Planner
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 px-8 py-6 text-center">
          <p className="text-sm text-slate-400">© 2025 Global Inflation Calculator. All rights reserved.</p>
        </div>
      </footer>
      {/* End of changes */}
    </div>
  )
}
