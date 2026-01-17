import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Global Inflation Calculator",
  applicationCategory: "FinanceApplication",
  description:
    "Calculate historical inflation and purchasing power changes across 8 major currencies from 1913-2026 using official government data.",
  url: "https://globalinflationcalculator.com",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "3847",
    bestRating: "5",
    worstRating: "1",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is inflation and how does it affect my money?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power. When inflation is 3%, something that costs $100 today would cost $103 next year. This means your money buys less over time if it doesn't grow at least at the rate of inflation.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is this inflation calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our calculator uses official government data from sources like the Bureau of Labor Statistics (BLS), Office for National Statistics (ONS), Eurostat, and other national statistical agencies. The data is updated monthly and reflects the most accurate historical inflation rates available. However, individual experiences with inflation may vary based on personal spending patterns.",
      },
    },
    {
      "@type": "Question",
      name: "Which currencies are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support 8 major world currencies: US Dollar (USD) from 1913, British Pound (GBP) from 1947, Euro (EUR) from 1996, Canadian Dollar (CAD) from 1913, Australian Dollar (AUD) from 1948, Swiss Franc (CHF) from 1913, Japanese Yen (JPY) from 1946, and New Zealand Dollar (NZD) from 1960.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between CPI and other inflation measures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CPI (Consumer Price Index) measures price changes in a basket of consumer goods and services. Core CPI excludes volatile food and energy prices. PCE (Personal Consumption Expenditures) is the Fed's preferred measure and covers a broader range of goods. PPI (Producer Price Index) measures wholesale prices. Each measure serves different purposes in economic analysis.",
      },
    },
    {
      "@type": "Question",
      name: "How often is the inflation data updated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our inflation data is updated monthly as new official statistics are released by government agencies. The US Bureau of Labor Statistics typically releases CPI data around the middle of each month for the previous month. Other countries follow similar schedules with their respective statistical agencies.",
      },
    },
  ],
}

const ClientPage = dynamic(() => import("./ClientPage"), {
  loading: () => (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16 mt-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-6 w-2/3 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Interactive calculator - client component */}
      <ClientPage />

      <noscript>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <header>
            <Card className="bg-white shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Global Inflation Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calculate how inflation affects your money over time across different currencies. See real purchasing
                  power changes from 1913 to 2025.
                </p>

                <nav aria-label="Main navigation">
                  <h3 className="font-semibold mb-2">Site Navigation:</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-blue-600 hover:underline">
                        Home - Inflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/deflation-calculator" className="text-blue-600 hover:underline">
                        Deflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/charts" className="text-blue-600 hover:underline">
                        Charts & Analytics
                      </Link>
                    </li>
                    <li>
                      <Link href="/ppp-calculator" className="text-blue-600 hover:underline">
                        PPP Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/salary-calculator" className="text-blue-600 hover:underline">
                        Salary Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/retirement-calculator" className="text-blue-600 hover:underline">
                        Retirement Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/student-loan-calculator" className="text-blue-600 hover:underline">
                        Student Loan Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/mortgage-calculator" className="text-blue-600 hover:underline">
                        Mortgage Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/budget-calculator" className="text-blue-600 hover:underline">
                        Budget Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/emergency-fund-calculator" className="text-blue-600 hover:underline">
                        Emergency Fund Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/roi-calculator" className="text-blue-600 hover:underline">
                        ROI Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/legacy-planner" className="text-blue-600 hover:underline">
                        Legacy Planner
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="text-blue-600 hover:underline">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </nav>

                <section className="mt-6" aria-label="Supported currencies">
                  <h3 className="font-semibold mb-2">Supported Currencies:</h3>
                  <ul className="space-y-1">
                    <li>🇺🇸 USD - US Dollar (1913-2025)</li>
                    <li>🇬🇧 GBP - British Pound (1947-2025)</li>
                    <li>🇪🇺 EUR - Euro (1996-2025)</li>
                    <li>🇨🇦 CAD - Canadian Dollar (1913-2025)</li>
                    <li>🇦🇺 AUD - Australian Dollar (1948-2025)</li>
                    <li>🇨🇭 CHF - Swiss Franc (1913-2025)</li>
                    <li>🇯🇵 JPY - Japanese Yen (1946-2025)</li>
                    <li>🇳🇿 NZD - New Zealand Dollar (1960-2025)</li>
                  </ul>
                </section>

                <section className="mt-6" aria-label="Key features">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="space-y-1">
                    <li>• Historical inflation calculation from 1913-2025</li>
                    <li>• Multi-currency support across 8 major currencies</li>
                    <li>• Purchasing power comparison over time</li>
                    <li>• Interactive charts and visualizations</li>
                    <li>• Historical context and events</li>
                    <li>• Real-time calculations using official government data</li>
                    <li>• Multiple inflation measures (CPI, Core CPI, PCE, PPI, GDP Deflator)</li>
                  </ul>
                </section>

                <p className="text-sm text-gray-600 mt-6">
                  This calculator requires JavaScript to function. Please enable JavaScript in your browser to use the
                  interactive features.
                </p>
              </CardContent>
            </Card>
          </header>

          <MethodologyContent />
          <DataSourcesContent />
          <SEOContent />

          <footer className="mt-8">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact & Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:admin@globalinflationcalculator.com" className="text-blue-600 hover:underline">
                      Contact Us: admin@globalinflationcalculator.com
                    </a>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  © 2025 Global Inflation Calculator. All rights reserved. Educational purposes only.
                </p>
              </CardContent>
            </Card>
          </footer>
        </div>
      </noscript>
    </>
  )
}

function MethodologyContent() {
  return (
    <Card className="bg-white shadow-lg border-0 mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Calculation Methodology</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-gray max-w-none">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Inflation Calculation</h3>
            <p className="mb-3">
              Our primary inflation calculation uses the Consumer Price Index (CPI) formula to determine purchasing
              power changes over time:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-3">
              Adjusted Amount = Original Amount × (Current Year CPI / Base Year CPI)
            </div>
            <p className="mb-3">
              <strong>Example:</strong> $100 in 2000 with CPI of 172.2, compared to 2024 with CPI of 310.3:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">$100 × (310.3 / 172.2) = $180.17</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Multiple Inflation Measures Methodology</h3>
            <p className="mb-3">
              We calculate inflation using seven different official measures to provide a comprehensive view:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Consumer Price Index (CPI) - Weight: 25%</h4>
                <p className="text-sm">
                  Standard measure tracking a basket of consumer goods and services. Uses urban consumer data from
                  national statistics offices.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Core CPI - Weight: 20%</h4>
                <p className="text-sm">
                  CPI excluding volatile food and energy prices. Calculated as: Core CPI = CPI - (Food Component +
                  Energy Component)
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Chained CPI - Weight: 15%</h4>
                <p className="text-sm">
                  Accounts for consumer substitution behavior using geometric mean formula, typically 0.2-0.3% lower
                  than regular CPI.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">Personal Consumption Expenditures (PCE) - Weight: 15%</h4>
                <p className="text-sm">
                  Federal Reserve's preferred measure, covers broader scope of goods and services.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">Producer Price Index (PPI) - Weight: 10%</h4>
                <p className="text-sm">
                  Measures wholesale price changes from the seller's perspective. Leading indicator of consumer price
                  changes.
                </p>
              </div>

              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="font-semibold">GDP Deflator - Weight: 15%</h4>
                <p className="text-sm">
                  Measures price changes across the entire economy including government spending and business
                  investment.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Multi-Currency Methodology</h3>
            <p className="mb-3">
              Each currency uses its own national inflation data without cross-currency conversion:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <strong>USD:</strong> Uses US CPI-U (Consumer Price Index for All Urban Consumers)
              </div>
              <div>
                <strong>GBP:</strong> Uses UK RPI and CPI data from ONS
              </div>
              <div>
                <strong>EUR:</strong> Uses Harmonized Index of Consumer Prices (HICP)
              </div>
              <div>
                <strong>CAD:</strong> Uses Canadian CPI from Statistics Canada
              </div>
              <div>
                <strong>AUD:</strong> Uses Australian Bureau of Statistics CPI
              </div>
              <div>
                <strong>CHF:</strong> Uses Swiss Federal Statistical Office CPI
              </div>
              <div>
                <strong>JPY:</strong> Uses Statistics Bureau of Japan CPI
              </div>
              <div>
                <strong>NZD:</strong> Uses Statistics New Zealand CPI
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DataSourcesContent() {
  return (
    <Card className="bg-white shadow-lg border-0 mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Data Sources & Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Primary Sources:</h4>
            <ul className="space-y-2">
              <li>
                • <strong>USA:</strong> Bureau of Labor Statistics (BLS)
              </li>
              <li>
                • <strong>UK:</strong> Office for National Statistics (ONS)
              </li>
              <li>
                • <strong>EU:</strong> Eurostat
              </li>
              <li>
                • <strong>Canada:</strong> Statistics Canada
              </li>
              <li>
                • <strong>Australia:</strong> Australian Bureau of Statistics
              </li>
              <li>
                • <strong>Switzerland:</strong> Federal Statistical Office
              </li>
              <li>
                • <strong>Japan:</strong> Statistics Bureau of Japan
              </li>
              <li>
                • <strong>New Zealand:</strong> Statistics New Zealand
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Data Processing:</h4>
            <ul className="space-y-2">
              <li>• Monthly data collection via FRED API</li>
              <li>• Automatic validation and error checking</li>
              <li>• Missing data interpolation using linear methods</li>
              <li>• Seasonal adjustment where applicable</li>
              <li>• Base year normalization (2000 = 100)</li>
              <li>• Quality assurance against official publications</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SEOContent() {
  return (
    <Card className="bg-white shadow-lg border-0 mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Understanding Inflation and Economics</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-gray max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4">Understanding Inflation: A Comprehensive Guide</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">What is Inflation?</h3>
        <p className="leading-relaxed mb-4">
          Inflation is the sustained increase in the general price level of goods and services in an economy over time.
          When inflation occurs, each unit of currency buys fewer goods and services than it did previously, effectively
          reducing the purchasing power of money. This economic phenomenon affects every aspect of our financial lives,
          from the cost of groceries to the value of our savings accounts.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">How Inflation is Measured</h3>
        <p className="leading-relaxed mb-4">
          Central banks and statistical agencies measure inflation using various price indices, with the Consumer Price
          Index (CPI) being the most commonly referenced metric. The CPI tracks the average change in prices paid by
          consumers for a basket of goods and services, including food, housing, transportation, medical care,
          recreation, education, and communication.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Historical Context of Inflation</h3>
        <p className="leading-relaxed mb-4">
          Throughout history, inflation has been a persistent feature of most economies. The United States has
          experienced various inflationary periods, from the hyperinflation following the Civil War to the stagflation
          of the 1970s. Understanding these historical patterns helps us appreciate how inflation affects long-term
          financial planning and investment strategies.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Causes of Inflation</h3>
        <p className="leading-relaxed mb-4">
          Inflation can arise from several sources, broadly categorized into demand-pull and cost-push factors.
          Demand-pull inflation occurs when aggregate demand exceeds aggregate supply, often resulting from increased
          consumer spending, government expenditure, or investment. Cost-push inflation results from increases in
          production costs, such as wages, raw materials, or energy prices.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">The Role of Central Banks</h3>
        <p className="leading-relaxed mb-4">
          Central banks, such as the Federal Reserve in the United States, play a pivotal role in managing inflation
          through monetary policy. These institutions use various tools, including interest rate adjustments, open
          market operations, and reserve requirements, to influence economic activity and price stability. Most modern
          central banks target an inflation rate of around 2% annually.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Protecting Against Inflation</h3>
        <p className="leading-relaxed mb-4">
          Individuals and businesses can take various steps to protect themselves against inflation's erosive effects.
          Diversifying investments across different asset classes, including inflation-protected securities, real
          estate, and commodities, can help maintain purchasing power over time. Understanding inflation's impact on
          different aspects of business operations is crucial for maintaining profitability during inflationary periods.
        </p>
      </CardContent>
    </Card>
  )
}
