import type { Metadata } from "next"
import InflationCalculator from "@/components/inflation-calculator"
import AdBanner from "@/components/ad-banner"
import FAQ from "@/components/faq"
import SocialShare from "@/components/social-share"
import UsageStats from "@/components/usage-stats"

export const metadata: Metadata = {
  title: "Global Inflation Calculator - Compare Currency Values Since 1913 | Free Tool",
  description:
    "Free inflation calculator for USD, GBP, EUR, CAD, AUD. See what $100 from any year is worth today with 100+ years of official government data. Updated June 2025.",
  keywords:
    "inflation calculator, currency inflation, historical prices, cost of living, inflation rate, USD GBP EUR CAD AUD 2025",
  openGraph: {
    title: "See What Your Money Was Worth Decades Ago",
    description: "$100 in 1950 = $1,200 today! Try our free global inflation calculator - Updated June 2025.",
    type: "website",
    url: "https://your-domain.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Global Inflation Calculator 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Inflation Calculator - Free Tool 2025",
    description: "Calculate inflation impact across 5 major currencies with 100+ years of data - Updated June 2025",
    images: ["/og-image.png"],
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with branding */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌍 Global Inflation Calculator</h1>
              <p className="text-sm text-gray-600">Compare currency values across 100+ years</p>
            </div>
            <UsageStats />
          </div>
        </div>
      </header>

      {/* Top Banner Ad */}
      <AdBanner slot="top-banner" format="horizontal" className="max-w-7xl mx-auto px-4 py-4" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Make your money <span className="text-blue-600">time travel</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover what your money was worth in the past with our free inflation calculator. Compare prices across 5
            major currencies using official government data dating back over 100 years.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Official Data</h3>
              <p className="text-gray-600 text-sm">Government sources updated monthly</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-semibold text-gray-900">5 Currencies</h3>
              <p className="text-gray-600 text-sm">USD, GBP, EUR, CAD, AUD supported</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900">Instant Results</h3>
              <p className="text-gray-600 text-sm">Real-time calculations as you type</p>
            </div>
          </div>
        </div>

        {/* Main Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calculator - Takes 3 columns */}
          <div className="lg:col-span-3">
            <InflationCalculator />
          </div>

          {/* Sidebar with ads - Takes 1 column */}
          <div className="space-y-6">
            <AdBanner slot="sidebar-1" format="vertical" className="sticky top-4" />

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">💡 Did You Know?</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• A $0.05 Coca-Cola in 1950 costs $0.60 today</p>
                <p>• The average house price in 1970 was $17,000</p>
                <p>• Minimum wage in 1968 had more buying power than today</p>
                <p>• College tuition has inflated 8x faster than wages</p>
              </div>
            </div>

            <AdBanner slot="sidebar-2" format="square" />
          </div>
        </div>

        {/* Social Share Section */}
        <div className="mt-12 text-center">
          <SocialShare />
        </div>

        {/* Bottom Banner Ad */}
        <div className="mt-12">
          <AdBanner slot="bottom-banner" format="horizontal" className="max-w-4xl mx-auto" />
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <FAQ />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Data sources: US Bureau of Labor Statistics, UK ONS, Statistics Canada, Australian Bureau of Statistics,
              Eurostat
            </p>
            <p className="text-sm">
              © 2025 Global Inflation Calculator. Free tool for educational purposes. Data updated monthly from official
              government sources. Last updated: June 2025.
            </p>
          </div>
        </footer>
      </main>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Global Inflation Calculator",
            description: "Free inflation calculator for comparing currency values across 100+ years",
            url: "https://your-domain.com",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "5 major currencies supported",
              "100+ years of historical data",
              "Real-time calculations",
              "Mobile-friendly interface",
              "Official government data sources",
            ],
          }),
        }}
      />
    </div>
  )
}
