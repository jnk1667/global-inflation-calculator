"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CurrencyData {
  code: string
  name: string
  flag: string
  symbol: string
  value: number
  change: number
  color: string
}

interface CurrencyComparisonChartProps {
  data?: CurrencyData[]
  currencies?: string[]
  fromYear?: number
  toYear?: number
  originalAmount?: number
  amount?: string
  inflationData?: any
  currentYear?: number
}

const defaultCurrencies: CurrencyData[] = [
  { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£", value: 174.36, change: 74.36, color: "#8B5CF6" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$", value: 128.25, change: 28.25, color: "#10B981" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$", value: 125.88, change: 25.88, color: "#F59E0B" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", symbol: "NZ$", value: 124.7, change: 24.7, color: "#EF4444" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$", value: 119.61, change: 19.61, color: "#3B82F6" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€", value: 123.14, change: 23.14, color: "#F97316" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥", value: 111.57, change: 11.57, color: "#22C55E" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", symbol: "Fr", value: 105.18, change: 5.18, color: "#06B6D4" },
]

export default function CurrencyComparisonChart({
  data,
  currencies = [],
  fromYear,
  toYear,
  originalAmount,
  amount,
  inflationData,
  currentYear: propCurrentYear,
}: CurrencyComparisonChartProps) {
  const currentYear = propCurrentYear || new Date().getFullYear()

  const [selectedFromYear, setSelectedFromYear] = useState(fromYear || 2020)
  const [selectedToYear, setSelectedToYear] = useState(toYear || currentYear)
  const [isComparing, setIsComparing] = useState(true)
  const [showUSDOnly, setShowUSDOnly] = useState(false)

  useEffect(() => {
    if (fromYear) {
      setSelectedFromYear(fromYear)
    }
  }, [fromYear])

  useEffect(() => {
    if (toYear) {
      setSelectedToYear(toYear)
    }
  }, [toYear])

  const calculatedData = useMemo(() => {
    if (!inflationData || !amount) return data || defaultCurrencies

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return data || defaultCurrencies

    const currencies = [
      { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$", color: "#3B82F6" },
      { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£", color: "#8B5CF6" },
      { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€", color: "#F97316" },
      { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$", color: "#10B981" },
      { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$", color: "#F59E0B" },
      { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", symbol: "Fr", color: "#06B6D4" },
      { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥", color: "#22C55E" },
      { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", symbol: "NZ$", color: "#EF4444" },
    ]

    const result: CurrencyData[] = []

    currencies.forEach((currency) => {
      const currencyData = inflationData[currency.code]
      if (!currencyData?.data) return

      // Check if currency has data for both selected years
      const fromInflation = currencyData.data[selectedFromYear.toString()]
      const toInflation = currencyData.data[selectedToYear.toString()]

      // Only include currency if it has valid data for both years
      if (!fromInflation || !toInflation || fromInflation <= 0 || toInflation <= 0) {
        console.log(`[v0] Excluding ${currency.code}: missing data for ${selectedFromYear}-${selectedToYear}`)
        return
      }

      const adjustedValue = (amountValue * toInflation) / fromInflation
      const changePercent = ((adjustedValue - amountValue) / amountValue) * 100

      result.push({
        code: currency.code,
        name: currency.name,
        flag: currency.flag,
        symbol: currency.symbol,
        value: adjustedValue,
        change: changePercent,
        color: currency.color,
      })
    })

    console.log(`[v0] Showing ${result.length} currencies with data for ${selectedFromYear}-${selectedToYear}`)
    return result.length > 0 ? result : data || defaultCurrencies
  }, [inflationData, amount, selectedFromYear, selectedToYear, data])

  const lineChartData = useMemo(() => {
    if (!inflationData || !amount) return []

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return []

    const currencies = [
      { code: "USD", color: "#3B82F6" },
      { code: "GBP", color: "#8B5CF6" },
      { code: "EUR", color: "#F97316" },
      { code: "CAD", color: "#10B981" },
      { code: "AUD", color: "#F59E0B" },
      { code: "CHF", color: "#06B6D4" },
      { code: "JPY", color: "#22C55E" },
      { code: "NZD", color: "#EF4444" },
    ]

    const dataByYear: { [year: number]: any } = {}

    // Build data for each year in the selected range
    for (let year = selectedFromYear; year <= selectedToYear; year++) {
      dataByYear[year] = { year }

      currencies.forEach((currency) => {
        const currencyData = inflationData[currency.code]
        if (!currencyData?.data) return

        const fromInflation = currencyData.data[selectedFromYear.toString()]
        const currentInflation = currencyData.data[year.toString()]

        if (fromInflation && currentInflation && fromInflation > 0 && currentInflation > 0) {
          const adjustedValue = (amountValue * currentInflation) / fromInflation
          dataByYear[year][currency.code] = adjustedValue
        }
      })
    }

    return Object.values(dataByYear)
  }, [inflationData, amount, selectedFromYear, selectedToYear])

  const safeData = Array.isArray(calculatedData) && calculatedData.length > 0 ? calculatedData : defaultCurrencies
  const safeOriginalAmount = originalAmount || (amount ? Number.parseFloat(amount) : 100)

  const stats = useMemo(() => {
    const validData = safeData.filter((item) => item && typeof item.change === "number" && isFinite(item.change))

    if (validData.length === 0) {
      return {
        currenciesCompared: 0,
        yearsAnalyzed: 0,
        avgAnnualInflation: 0,
      }
    }

    const totalInflation = validData.reduce((sum, item) => sum + item.change, 0)
    const avgInflation = totalInflation / validData.length
    const yearsDiff = selectedToYear - selectedFromYear
    const avgAnnualInflation = yearsDiff > 0 ? avgInflation / yearsDiff : 0

    return {
      currenciesCompared: validData.length,
      yearsAnalyzed: yearsDiff,
      avgAnnualInflation: Math.max(0, avgAnnualInflation),
    }
  }, [safeData, selectedFromYear, selectedToYear])

  const formatCurrency = (value: number, symbol: string) => {
    if (!isFinite(value) || isNaN(value)) return `${symbol}0.00`

    // Multi-character symbols need spacing
    if (symbol.length > 1 || symbol === "Fr") {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && Array.isArray(payload) && payload.length > 0) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{`Year: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            const currencyInfo = safeData.find((c) => c.code === entry.dataKey)
            if (!currencyInfo) return null
            const value = entry.value
            if (typeof value === "number" && isFinite(value)) {
              return (
                <p key={index} style={{ color: entry.color }} className="text-sm">
                  {`${currencyInfo.flag} ${entry.dataKey}: ${formatCurrency(value, currencyInfo.symbol)}`}
                </p>
              )
            }
            return null
          })}
        </div>
      )
    }
    return null
  }

  if (!isComparing) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
        <CardContent className="p-6 text-center">
          <Button
            onClick={() => setIsComparing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
          >
            📊 Compare Across Currencies
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            See how inflation affects {formatCurrency(safeOriginalAmount, "$")} across 8 major currencies
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">🌍 Multi-Currency Comparison</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Compare inflation across all major currencies
            </p>
          </div>
          <Button onClick={() => setIsComparing(false)} variant="outline" size="sm" className="text-sm">
            ✓ Comparing
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              From Year: {selectedFromYear}
            </label>
            <Slider
              value={[selectedFromYear]}
              onValueChange={(value) => setSelectedFromYear(value[0])}
              min={1913}
              max={currentYear - 1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">To Year: {selectedToYear}</label>
            <Slider
              value={[selectedToYear]}
              onValueChange={(value) => setSelectedToYear(value[0])}
              min={selectedFromYear + 1}
              max={currentYear}
              step={1}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Adjust the sliders to see how different time periods affect each currency. Currencies without data for
            the selected range will be automatically hidden.
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
          <strong>📅 Comparing:</strong> {formatCurrency(safeOriginalAmount, "$")} from {selectedFromYear} to{" "}
          {selectedToYear} ({stats.yearsAnalyzed} years) • Showing {stats.currenciesCompared} currencies with complete
          data
        </div>

        {/* Currency Bars */}
        <div className="space-y-3">
          {safeData.map((currency, index) => {
            const progressValue = Math.min(100, (currency.change / 80) * 100) // Scale to 80% max for visual

            return (
              <div key={currency.code} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{currency.flag}</span>
                    <div>
                      <div className="font-medium text-sm">
                        {currency.code} {currency.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(currency.value, currency.symbol)}</div>
                    <Badge
                      variant={currency.change > 20 ? "destructive" : currency.change > 10 ? "secondary" : "default"}
                      className="text-xs"
                    >
                      +{currency.change.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="relative">
                  <Progress
                    value={progressValue}
                    className="h-2"
                    style={{
                      background: `linear-gradient(to right, ${currency.color}22 0%, ${currency.color} 100%)`,
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progressValue}%`,
                      backgroundColor: currency.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.currenciesCompared}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Currencies Compared</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.yearsAnalyzed}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Years Analyzed</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.avgAnnualInflation.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Annual Inflation</div>
          </div>
        </div>

        {/* Line Chart */}
        {lineChartData.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📈 Multi-Currency Comparison</h3>
              <Button
                onClick={() => setShowUSDOnly(!showUSDOnly)}
                variant={showUSDOnly ? "default" : "outline"}
                size="sm"
                className={showUSDOnly ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              >
                {showUSDOnly ? "🇺🇸 USD Only" : "Compare"}
              </Button>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={{ stroke: "#666" }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "#666" }}
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickFormatter={(value) => `$${Math.round(value)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {safeData
                    .filter((currency) => !showUSDOnly || currency.code === "USD")
                    .map((currency) => (
                      <Line
                        key={currency.code}
                        type="monotone"
                        dataKey={currency.code}
                        stroke={currency.color}
                        strokeWidth={2}
                        dot={{ fill: currency.color, strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: currency.color, strokeWidth: 2 }}
                        name={`${currency.flag} ${currency.code}`}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Currency Legend */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">
                {showUSDOnly ? "Showing USD Only:" : "Currency Legend:"}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {safeData
                  .filter((currency) => !showUSDOnly || currency.code === "USD")
                  .map((currency) => (
                    <div key={currency.code} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currency.color }} />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {currency.flag} {currency.code}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          * Currencies are automatically filtered based on data availability. For example, EUR only shows from 1999
          onwards, while USD and CAD have data back to 1913.
        </div>
      </CardContent>
    </Card>
  )
}
