"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"
import FAQ from "@/components/faq"
import SocialShare from "@/components/social-share"
import AdBanner from "@/components/ad-banner"

interface InflationData {
  [year: string]: number
}

interface CurrencyData {
  data: InflationData
  symbol: string
  name: string
  flag: string
}

interface AllInflationData {
  [currency: string]: CurrencyData
}

// Currency definitions
const currencies = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", code: "US" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", code: "GB" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", code: "EU" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", code: "CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", code: "AU" },
}

export default function Home() {
  const [amount, setAmount] = useState("100")
  const [fromYear, setFromYear] = useState(2020)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [inflationData, setInflationData] = useState<AllInflationData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentYear = 2025
  const minYear = 1913
  const maxYear = currentYear

  // Load inflation data
  useEffect(() => {
    const loadInflationData = async () => {
      setLoading(true)
      setError(null)

      try {
        const loadedData: AllInflationData = {}
        let successCount = 0

        for (const [code, info] of Object.entries(currencies)) {
          try {
            const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`)
            if (response.ok) {
              const data = await response.json()
              loadedData[code] = {
                data: data.data || {},
                symbol: info.symbol,
                name: info.name,
                flag: info.flag,
              }
              successCount++
            }
          } catch (err) {
            console.warn(`Error loading ${code} data:`, err)
          }
        }

        if (successCount > 0) {
          setInflationData(loadedData)
        } else {
          throw new Error("No inflation data could be loaded")
        }
      } catch (err) {
        setError("Failed to load inflation data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadInflationData()
  }, [])

  // Calculate inflation
  const calculateInflation = () => {
    const currencyData = inflationData[selectedCurrency]
    if (!currencyData || !currencyData.data) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0 }
    }

    const fromInflation = currencyData.data[fromYear.toString()]
    const currentInflation = currencyData.data[currentYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0 }
    }

    const adjustedAmount = (Number.parseFloat(amount) * currentInflation) / fromInflation
    const totalInflation = ((adjustedAmount - Number.parseFloat(amount)) / Number.parseFloat(amount)) * 100
    const years = currentYear - fromYear
    const annualRate = years > 0 ? Math.pow(adjustedAmount / Number.parseFloat(amount), 1 / years) - 1 : 0

    return { adjustedAmount, totalInflation, annualRate: annualRate * 100 }
  }

  const { adjustedAmount, totalInflation, annualRate } = calculateInflation()
  const yearsAgo = currentYear - fromYear

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🌍 Global Inflation Calculator</h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Calculate how inflation affects your money over time across different currencies.
              </p>
            </div>
          </div>
        </header>

        {/* Top Ad */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <AdBanner slot="header" format="horizontal" className="max-w-full" />
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {error && (
            <Alert className="bg-red-50 border-red-200 mb-6">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Enter Amount ($0.0 - $1,000,000,000,000)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  {inflationData[selectedCurrency]?.symbol || "$"}
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-lg h-12 border-gray-300"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <label className="text-sm text-gray-600 font-medium">Select Currency</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(currencies).map(([code, info]) => (
                  <Card
                    key={code}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCurrency === code
                        ? "border-blue-500 border-2 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCurrency(code)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-gray-900">{info.code}</div>
                      <div className="text-xs text-blue-600 font-medium">{code}</div>
                      <div className="text-xs text-gray-500 mt-1">{info.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            <div className="space-y-4">
              <label className="text-sm text-gray-600 font-medium">From Year</label>

              {/* Large Year Display */}
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{fromYear}</div>
                <div className="text-gray-500">{yearsAgo} years ago</div>
              </div>

              {/* Year Slider */}
              <div className="px-4">
                <Slider
                  value={[fromYear]}
                  onValueChange={(value) => setFromYear(value[0])}
                  min={minYear}
                  max={maxYear - 1}
                  step={1}
                  className="w-full"
                />

                {/* Year markers */}
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                  <span>1913</span>
                  <span>1970</span>
                  <span>1990</span>
                  <span>2000</span>
                  <span>2010</span>
                  <span>2015</span>
                  <span>2020</span>
                  <span>2025</span>
                </div>
              </div>

              {/* Info text */}
              <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                💡 Drag the slider or tap the year buttons above • Data available from 1913 to 2025 • Updated June 2025
              </div>
            </div>
          </div>

          {/* Results Section */}
          {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg text-white p-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">🔥</span>
                  <h2 className="text-2xl font-bold">Inflation Impact</h2>
                </div>

                <div className="text-5xl font-bold mb-4">
                  {inflationData[selectedCurrency]?.symbol}
                  {adjustedAmount.toFixed(2)}
                </div>

                <div className="text-xl mb-8 opacity-90">
                  {inflationData[selectedCurrency]?.symbol}
                  {amount} in {fromYear} equals {inflationData[selectedCurrency]?.symbol}
                  {adjustedAmount.toFixed(2)} in {currentYear}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-2xl font-bold">{totalInflation.toFixed(1)}%</div>
                    <div className="text-sm opacity-80">Total Inflation</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-2xl font-bold">{annualRate.toFixed(2)}%</div>
                    <div className="text-sm opacity-80">Annual Average</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-2xl font-bold">{yearsAgo}</div>
                    <div className="text-sm opacity-80">Years</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-50">
                    📤 Share Result
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white text-blue-600 hover:bg-gray-50"
                    onClick={() => {
                      setAmount("100")
                      setFromYear(2020)
                      setSelectedCurrency("USD")
                    }}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Middle Ad */}
          <div className="flex justify-center my-8">
            <AdBanner slot="middle" format="square" />
          </div>

          {/* Social Share */}
          <SocialShare />

          {/* FAQ */}
          <FAQ />

          {/* Bottom Ad */}
          <div className="flex justify-center mt-8">
            <AdBanner slot="footer" format="horizontal" />
          </div>
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
