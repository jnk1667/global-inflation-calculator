"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"
import SimpleLineChart from "@/components/simple-line-chart"
import PurchasingPowerVisual from "@/components/purchasing-power-visual"
import CurrencyComparisonChart from "@/components/currency-comparison-chart"
import FAQ from "@/components/faq"
import SocialShare from "@/components/social-share"
import AdBanner from "@/components/ad-banner"
import UsageStats from "@/components/usage-stats"

interface InflationData {
  [year: string]: number
}

interface CurrencyData {
  data: InflationData
  symbol: string
  name: string
  flag: string
  startYear: number
  endYear: number
}

interface AllInflationData {
  [currency: string]: CurrencyData
}

// Currency definitions with proper spacing
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
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [hasCalculated, setHasCalculated] = useState(false)

  const currentYear = new Date().getFullYear()
  const maxYear = currentYear

  // Load inflation data
  useEffect(() => {
    let isMounted = true

    const loadInflationData = async () => {
      if (!isMounted) return

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
              const inflationYears = Object.keys(data.data || {})
                .map(Number)
                .filter((year) => !isNaN(year))

              if (inflationYears.length > 0) {
                const startYear = Math.min(...inflationYears)
                const endYear = Math.max(...inflationYears)

                loadedData[code] = {
                  data: data.data || {},
                  symbol: info.symbol,
                  name: info.name,
                  flag: info.flag,
                  startYear,
                  endYear,
                }
                successCount++
              }
            }
          } catch (err) {
            console.warn(`Error loading ${code} data:`, err)
          }
        }

        if (isMounted) {
          if (successCount > 0) {
            setInflationData(loadedData)
            setFromYear(2020)
          } else {
            throw new Error("No inflation data could be loaded")
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load inflation data. Please try again later.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInflationData()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle currency change
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    setFromYear(2020)
    setHasCalculated(false) // Reset calculation state
  }

  // Handle input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string, numbers, and decimal points
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === "" || (numValue >= 0 && numValue <= 1000000000000)) {
        setAmount(value)
        setHasCalculated(false)
      }
    }
  }

  const handleYearChange = (value: number[]) => {
    setFromYear(value[0])
    setHasCalculated(false) // Reset calculation state
  }

  // Get current currency data
  const currentCurrencyData = inflationData[selectedCurrency]
  const minYear = currentCurrencyData?.startYear || 1913

  // Generate currency-specific year markers
  const generateYearMarkers = () => {
    const markers = []

    if (selectedCurrency === "USD") {
      // USD: 1913-2025, 20-year spacing: 1920, 1940, 1960, 1980, 2000, 2020
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "CAD") {
      // CAD: 1914-2025, 20-year spacing: 1920, 1940, 1960, 1980, 2000, 2020
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "GBP") {
      // GBP: 1947-2025, 10-year spacing: 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "AUD") {
      // AUD: 1948-2025, 10-year spacing: 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "EUR") {
      // EUR: 1996-2025, 10-year spacing: 2000, 2010, 2020
      markers.push(2000, 2010, 2020)
    }

    // Filter markers to only show those within the valid range (excluding start/end years)
    return markers.filter((year) => year > minYear && year < maxYear)
  }

  const yearMarkers = generateYearMarkers()

  // Calculate inflation
  const calculateInflation = () => {
    if (!currentCurrencyData || !currentCurrencyData.data) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const fromInflation = currentCurrencyData.data[fromYear.toString()]
    const currentInflation = currentCurrencyData.data[currentYear.toString()]

    // Add additional safety checks
    if (!fromInflation || !currentInflation || fromInflation <= 0 || currentInflation <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const adjustedAmount = (amountValue * currentInflation) / fromInflation
    const totalInflation = ((adjustedAmount - amountValue) / amountValue) * 100
    const years = currentYear - fromYear
    const annualRate = years > 0 ? Math.pow(adjustedAmount / amountValue, 1 / years) - 1 : 0

    // Generate chart data with better error handling
    const chartData = []
    const stepSize = Math.max(1, Math.floor((currentYear - fromYear) / 20))

    for (let year = fromYear; year <= currentYear; year += stepSize) {
      const yearInflation = currentCurrencyData.data[year.toString()]
      if (yearInflation && yearInflation > 0 && fromInflation > 0) {
        const yearValue = (amountValue * yearInflation) / fromInflation
        if (isFinite(yearValue) && yearValue > 0) {
          chartData.push({ year, value: yearValue })
        }
      }
    }

    // Ensure we have the final year
    if (chartData.length === 0 || chartData[chartData.length - 1].year !== currentYear) {
      if (isFinite(adjustedAmount) && adjustedAmount > 0) {
        chartData.push({ year: currentYear, value: adjustedAmount })
      }
    }

    return {
      adjustedAmount: isFinite(adjustedAmount) ? adjustedAmount : 0,
      totalInflation: isFinite(totalInflation) ? totalInflation : 0,
      annualRate: isFinite(annualRate) ? annualRate * 100 : 0,
      chartData,
    }
  }

  const { adjustedAmount, totalInflation, annualRate, chartData } = calculateInflation()
  const yearsAgo = currentYear - fromYear

  // Effect to increment stats when a valid calculation is shown
  useEffect(() => {
    if (Number.parseFloat(amount) > 0 && adjustedAmount > 0 && !hasCalculated) {
      // Only increment once per calculation change
      if (typeof window !== "undefined" && (window as any).incrementCalculation) {
        ;(window as any).incrementCalculation()
      }
      setHasCalculated(true)
    }
  }, [amount, fromYear, selectedCurrency, adjustedAmount, hasCalculated])

  // Get proper currency symbol with spacing
  const getCurrencyDisplay = (value: number) => {
    const symbol = currentCurrencyData?.symbol || "$"
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Usage Stats - Top Right Corner */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200">
            <UsageStats />
          </div>
        </div>

        {/* Header */}
        <header className="bg-white shadow-sm border-b pt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🌍 Global Inflation Calculator</h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Calculate how inflation affects your money over time across different currencies. See real purchasing
                power changes from 1913 to {currentYear}.
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(lastUpdated).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </header>

        {/* Top Ad */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <AdBanner slot="header" format="horizontal" className="max-w-full" />
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Calculator Card */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 space-y-8">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Enter Amount ($0.0 - $1,000,000,000,000)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                    {currentCurrencyData?.symbol || "$"}
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`text-lg h-12 border-gray-300 ${
                      currentCurrencyData?.symbol && currentCurrencyData.symbol.length > 1 ? "pl-12" : "pl-8"
                    }`}
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Currency Selection */}
              <div className="space-y-3">
                <label className="text-sm text-gray-600 font-medium">Select Currency</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(currencies).map(([code, info]) => {
                    const currencyData = inflationData[code]
                    const isAvailable = !!currencyData

                    return (
                      <Card
                        key={code}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCurrency === code
                            ? "border-blue-500 border-2 bg-blue-50"
                            : isAvailable
                              ? "border-gray-200 hover:border-gray-300"
                              : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                        }`}
                        onClick={() => isAvailable && handleCurrencyChange(code)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-lg font-bold text-gray-900">{info.code}</div>
                          <div className="text-xs text-blue-600 font-medium">{code}</div>
                          <div className="text-xs text-gray-500 mt-1">{info.name}</div>
                        </CardContent>
                      </Card>
                    )
                  })}
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

                {/* Currency-specific Year Slider */}
                <div className="px-4">
                  <Slider
                    value={[fromYear]}
                    onValueChange={handleYearChange}
                    min={minYear}
                    max={maxYear}
                    step={1}
                    className="w-full"
                  />

                  {/* Currency-specific year markers */}
                  <div className="relative mt-8 px-2">
                    {yearMarkers.map((year) => {
                      const position = ((year - minYear) / (maxYear - minYear)) * 100
                      return (
                        <button
                          key={year}
                          onClick={() => {
                            setFromYear(year)
                            setHasCalculated(false)
                          }}
                          className="absolute text-xs text-gray-400 hover:text-blue-600 cursor-pointer transition-colors transform -translate-x-1/2 font-medium"
                          style={{ left: `${position}%` }}
                        >
                          {year}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Info text */}
                <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded mt-80">
                  💡 Drag the slider or tap the year buttons above • Data available from {minYear} to {currentYear} •
                  Updated June 2025
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg text-white p-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">🔥</span>
                  <h2 className="text-2xl font-bold">Inflation Impact</h2>
                </div>

                <div className="text-5xl font-bold mb-4">{getCurrencyDisplay(adjustedAmount)}</div>

                <div className="text-xl mb-8 opacity-90">
                  {getCurrencyDisplay(Number.parseFloat(amount))} in {fromYear} equals{" "}
                  {getCurrencyDisplay(adjustedAmount)} in {currentYear}
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
                      setHasCalculated(false)
                    }}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Currency Comparison Section */}
          {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
            <CurrencyComparisonChart amount={amount} fromYear={fromYear} inflationData={inflationData} />
          )}

          {/* Line Chart Section */}
          {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">
                  📈 {currencies[selectedCurrency]?.name} Inflation Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <SimpleLineChart data={chartData} currency={currentCurrencyData?.symbol || "$"} fromYear={fromYear} />
                </div>
                <p className="text-sm text-gray-600 text-center mt-4">
                  This chart shows how {getCurrencyDisplay(Number.parseFloat(amount))} from {fromYear} would grow due to
                  inflation over time
                </p>
              </CardContent>
            </Card>
          )}

          {/* Purchasing Power Section */}
          {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
            <PurchasingPowerVisual
              originalAmount={Number.parseFloat(amount)}
              adjustedAmount={adjustedAmount}
              currency={selectedCurrency}
              symbol={currentCurrencyData?.symbol || "$"}
              fromYear={fromYear}
            />
          )}

          {/* Historical Context Section */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">📚 Historical Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What was happening in {fromYear}:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• COVID-19 pandemic</li>
                    <li>• Remote work boom</li>
                    <li>• Supply chain disruptions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Price comparisons:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• $3.19 Movie ticket</li>
                    <li>• $2.17 Gallon of gas</li>
                    <li>• $2.50 Loaf of bread</li>
                    <li>• $27.95 New CD</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  Track inflation across major world currencies with historical data from 1913 to {currentYear}.
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
