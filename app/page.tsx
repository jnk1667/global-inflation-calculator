"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import { currencies } from "@/data/currencies"

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

export default function Home() {
  const [amount, setAmount] = useState("100")
  const [fromYear, setFromYear] = useState(2000)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [inflationData, setInflationData] = useState<AllInflationData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const currentYear = 2025
  const minYear = 1913
  const maxYear = currentYear

  // Load inflation data
  useEffect(() => {
    const loadInflationData = async () => {
      setLoading(true)
      setError(null)

      try {
        const currencyPromises = Object.entries(currencies).map(async ([code, info]) => {
          try {
            const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`)
            if (!response.ok) {
              console.warn(`Failed to load ${code} data:`, response.status)
              return null
            }
            const data = await response.json()
            return [
              code,
              {
                data: data.data || {},
                symbol: info.symbol,
                name: info.name,
                flag: info.flag,
              },
            ]
          } catch (err) {
            console.warn(`Error loading ${code} data:`, err)
            return null
          }
        })

        const results = await Promise.all(currencyPromises)
        const validResults = results.filter((result): result is [string, CurrencyData] => result !== null)

        if (validResults.length === 0) {
          throw new Error("No inflation data could be loaded")
        }

        const inflationDataObj = Object.fromEntries(validResults)
        setInflationData(inflationDataObj)

        // Load last updated timestamp
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
        console.error("Error loading inflation data:", err)
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
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const fromInflation = currencyData.data[fromYear.toString()]
    const currentInflation = currencyData.data[currentYear.toString()]

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
      const yearInflation = currencyData.data[year.toString()]
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

        <main className="container mx-auto px-4 py-8 space-y-8">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Calculator */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">💰 Inflation Calculator</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Currency Selection */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-base font-semibold">
                  Currency
                </Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, info]) => (
                      <SelectItem key={code} value={code}>
                        <span className="flex items-center gap-2">
                          <span>{info.flag}</span>
                          <span>{code}</span>
                          <span className="text-gray-500">- {info.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-semibold">
                  Amount ({currencies[selectedCurrency]?.symbol || "$"})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="text-lg"
                />
              </div>

              {/* Year Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">From Year: {fromYear}</Label>
                  <Badge variant="outline" className="text-sm">
                    {currentYear - fromYear} years ago
                  </Badge>
                </div>
                <Slider
                  value={[fromYear]}
                  onValueChange={(value) => setFromYear(value[0])}
                  min={minYear}
                  max={maxYear - 1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{minYear}</span>
                  <span>{maxYear}</span>
                </div>
              </div>

              <Separator />

              {/* Results */}
              {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {currencies[selectedCurrency]?.symbol}
                      {adjustedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-gray-600">Today's Value</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {totalInflation > 0 ? "+" : ""}
                      {totalInflation.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Total Inflation</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{annualRate.toFixed(2)}%</div>
                    <div className="text-sm text-gray-600">Annual Rate</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts and Visualizations */}
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
                      📈 Inflation Over Time ({fromYear} - {currentYear})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 md:h-80">
                      <SimpleLineChart
                        data={chartData}
                        currency={currencies[selectedCurrency]?.symbol || "$"}
                        fromYear={fromYear}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchasing" className="space-y-4">
                <PurchasingPowerVisual
                  originalAmount={Number.parseFloat(amount)}
                  adjustedAmount={adjustedAmount}
                  currency={selectedCurrency}
                  symbol={currencies[selectedCurrency]?.symbol || "$"}
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
