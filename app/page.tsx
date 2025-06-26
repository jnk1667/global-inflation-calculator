"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"
import SimpleLineChart from "@/components/simple-line-chart"
import PurchasingPowerVisual from "@/components/purchasing-power-visual"
import CurrencyComparisonChart from "@/components/currency-comparison-chart"
import FAQ from "@/components/faq"
import SocialShare from "@/components/social-share"
import UsageStats from "@/components/usage-stats"
import AdBanner from "@/components/ad-banner"

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
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const currentYear = 2025

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

        if (successCount > 0) {
          setInflationData(loadedData)
          // Set initial fromYear based on USD data
          if (loadedData.USD) {
            setFromYear(loadedData.USD.startYear)
          }
        } else {
          throw new Error("No inflation data could be loaded")
        }

        // Load timestamp
        try {
          const timestampResponse = await fetch("/data/last-updated.json")
          if (timestampResponse.ok) {
            const timestampData = await timestampResponse.json()
            setLastUpdated(timestampData.lastUpdated || "")
          }
        } catch (err) {
          console.warn("Could not load timestamp:", err)
        }
      } catch (err) {
        setError("Failed to load inflation data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadInflationData()
  }, [])

  // Handle currency change - reset year to currency's start year
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    const currencyData = inflationData[currency]
    if (currencyData) {
      setFromYear(currencyData.startYear)
    }
  }

  // Get current currency data
  const currentCurrencyData = inflationData[selectedCurrency]
  const minYear = currentCurrencyData?.startYear || 1913
  const maxYear = currentCurrencyData?.endYear || currentYear

  // Generate accurate year markers for slider
  const generateYearMarkers = () => {
    const markers = []
    const range = maxYear - minYear

    // Always include start and end
    markers.push(minYear)

    if (range > 100) {
      // For long ranges, show key decades
      const decades = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]
      decades.forEach((year) => {
        if (year > minYear && year < maxYear) {
          markers.push(year)
        }
      })
    } else if (range > 50) {
      // For medium ranges, show every 10-20 years
      for (let year = minYear + 10; year < maxYear; year += 10) {
        markers.push(year)
      }
    } else {
      // For short ranges, show every 5-10 years
      for (let year = minYear + 5; year < maxYear; year += 5) {
        markers.push(year)
      }
    }

    markers.push(maxYear)
    return [...new Set(markers)].sort((a, b) => a - b)
  }

  const yearMarkers = generateYearMarkers()

  // Calculate inflation
  const calculateInflation = () => {
    if (!currentCurrencyData || !currentCurrencyData.data) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const fromInflation = currentCurrencyData.data[fromYear.toString()]
    const currentInflation = currentCurrencyData.data[currentYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const adjustedAmount = (Number.parseFloat(amount) * currentInflation) / fromInflation
    const totalInflation = ((adjustedAmount - Number.parseFloat(amount)) / Number.parseFloat(amount)) * 100
    const years = currentYear - fromYear
    const annualRate = years > 0 ? Math.pow(adjustedAmount / Number.parseFloat(amount), 1 / years) - 1 : 0

    // Generate chart data
    const chartData = []
    for (let year = fromYear; year <= currentYear; year += Math.max(1, Math.floor((currentYear - fromYear) / 20))) {
      const yearInflation = currentCurrencyData.data[year.toString()]
      if (yearInflation && yearInflation > 0) {
        const yearValue = (Number.parseFloat(amount) * yearInflation) / fromInflation
        chartData.push({ year, value: yearValue })
      }
    }

    // Always include the final year
    if (chartData.length === 0 || chartData[chartData.length - 1].year !== currentYear) {
      chartData.push({ year: currentYear, value: adjustedAmount })
    }

    return { adjustedAmount, totalInflation, annualRate: annualRate * 100, chartData }
  }

  const { adjustedAmount, totalInflation, annualRate, chartData } = calculateInflation()
  const yearsAgo = currentYear - fromYear

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
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🌍 Global Inflation Calculator</h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Calculate how inflation affects your money over time across different currencies. See real purchasing
                power changes from 1913 to 2025.
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

                {/* Year Slider with accurate positioning */}
                <div className="px-4">
                  <Slider
                    value={[fromYear]}
                    onValueChange={(value) => setFromYear(value[0])}
                    min={minYear}
                    max={maxYear - 1}
                    step={1}
                    className="w-full"
                  />

                  {/* Accurate year markers */}
                  <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                    {yearMarkers.map((year, index) => (
                      <button
                        key={year}
                        onClick={() => setFromYear(year)}
                        className="hover:text-blue-600 cursor-pointer transition-colors"
                        style={{
                          position:
                            index === 0 ? "absolute" : index === yearMarkers.length - 1 ? "absolute" : "relative",
                          left: index === 0 ? "0%" : index === yearMarkers.length - 1 ? "auto" : "auto",
                          right: index === yearMarkers.length - 1 ? "0%" : "auto",
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info text */}
                <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                  💡 Drag the slider or tap the year buttons above • Data available from {minYear} to {maxYear} •
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

                <div className="text-5xl font-bold mb-4">
                  {currentCurrencyData?.symbol}
                  {adjustedAmount.toFixed(2)}
                </div>

                <div className="text-xl mb-8 opacity-90">
                  {currentCurrencyData?.symbol}
                  {amount} in {fromYear} equals {currentCurrencyData?.symbol}
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
                      if (currentCurrencyData) {
                        setFromYear(currentCurrencyData.startYear)
                      }
                    }}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analysis Tabs */}
          {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chart">📈 Chart</TabsTrigger>
                <TabsTrigger value="purchasing">🛒 Purchasing Power</TabsTrigger>
                <TabsTrigger value="comparison">🌍 Compare</TabsTrigger>
                <TabsTrigger value="stats">📊 Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="space-y-4">
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      📈 {currencies[selectedCurrency]?.name} Inflation Trend Over Time ({fromYear} - {currentYear})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 md:h-80">
                      <SimpleLineChart
                        data={chartData}
                        currency={currentCurrencyData?.symbol || "$"}
                        fromYear={fromYear}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-4">
                      This chart shows how {currentCurrencyData?.symbol}
                      {amount} from {fromYear} would grow due to inflation over time
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchasing" className="space-y-4">
                <PurchasingPowerVisual
                  originalAmount={Number.parseFloat(amount)}
                  adjustedAmount={adjustedAmount}
                  currency={selectedCurrency}
                  symbol={currentCurrencyData?.symbol || "$"}
                  fromYear={fromYear}
                />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <CurrencyComparisonChart amount={amount} fromYear={fromYear} inflationData={inflationData} />
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <UsageStats />
              </TabsContent>
            </Tabs>
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
