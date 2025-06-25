"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import InflationCalculator from "@/components/inflation-calculator"
import CurrencyComparisonChart from "@/components/currency-comparison-chart"
import PurchasingPowerVisual from "@/components/purchasing-power-visual"
import SimpleLineChart from "@/components/simple-line-chart"
import FAQ from "@/components/faq"
import SocialShare from "@/components/social-share"
import AdBanner from "@/components/ad-banner"
import UsageStats from "@/components/usage-stats"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"

export default function HomePage() {
  const [inflationData, setInflationData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calculatorResults, setCalculatorResults] = useState<any>(null)

  useEffect(() => {
    const loadInflationData = async () => {
      try {
        setIsLoading(true)
        const currencies = ["usd", "gbp", "eur", "cad", "aud"]
        const dataPromises = currencies.map(async (currency) => {
          const response = await fetch(`/data/${currency}-inflation.json`)
          if (!response.ok) {
            throw new Error(`Failed to load ${currency.toUpperCase()} data`)
          }
          return response.json()
        })

        const results = await Promise.all(dataPromises)
        const data: any = {}

        results.forEach((result) => {
          data[result.currency] = result
        })

        setInflationData(data)
      } catch (err) {
        console.error("Error loading inflation data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadInflationData()
  }, [])

  const handleCalculatorUpdate = (results: any) => {
    setCalculatorResults(results)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Data Loading Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🌍 Global Inflation Calculator</h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Calculate how inflation affects your money over time across different currencies. See real purchasing
                power changes from 1913 to 2025.
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Usage Stats */}
          <UsageStats />

          {/* Ad Banner */}
          <AdBanner position="top" />

          {/* Main Calculator */}
          <InflationCalculator inflationData={inflationData} onUpdate={handleCalculatorUpdate} />

          {/* Results Section */}
          {calculatorResults && (
            <div className="space-y-8">
              {/* Line Chart */}
              <SimpleLineChart
                data={calculatorResults.chartData}
                currency={calculatorResults.currency}
                symbol={calculatorResults.symbol}
                fromYear={calculatorResults.fromYear}
                toYear={calculatorResults.toYear}
              />

              {/* Purchasing Power Visual */}
              <PurchasingPowerVisual
                originalAmount={calculatorResults.originalAmount}
                adjustedAmount={calculatorResults.adjustedAmount}
                currency={calculatorResults.currency}
                symbol={calculatorResults.symbol}
                fromYear={calculatorResults.fromYear}
              />

              {/* Currency Comparison */}
              <CurrencyComparisonChart
                amount={calculatorResults.originalAmount.toString()}
                fromYear={calculatorResults.fromYear}
                inflationData={inflationData}
              />
            </div>
          )}

          {/* Ad Banner */}
          <AdBanner position="middle" />

          {/* FAQ Section */}
          <FAQ />

          {/* Social Share */}
          <SocialShare />

          {/* Ad Banner */}
          <AdBanner position="bottom" />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Global Inflation Calculator</h3>
                <p className="text-gray-300">
                  Track inflation across major world currencies with historical data from 1913 to 2025.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• US Bureau of Labor Statistics</li>
                  <li>• UK Office for National Statistics</li>
                  <li>• Eurostat</li>
                  <li>• Statistics Canada</li>
                  <li>• Australian Bureau of Statistics</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Last Updated</h4>
                <p className="text-gray-300">June 2025</p>
                <p className="text-sm text-gray-400 mt-2">Data is updated monthly from official government sources.</p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Global Inflation Calculator. Educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
