"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

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
  data = defaultCurrencies,
  currencies = [],
  fromYear = 2020,
  toYear = 2025,
  originalAmount = 100,
}: CurrencyComparisonChartProps) {
  const [selectedFromYear, setSelectedFromYear] = useState([fromYear])
  const [selectedToYear, setSelectedToYear] = useState([toYear])

  // Safe data validation
  const safeData = Array.isArray(data) && data.length > 0 ? data : defaultCurrencies
  const safeOriginalAmount = typeof originalAmount === "number" && isFinite(originalAmount) ? originalAmount : 100

  // Calculate statistics
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
    const yearsDiff = selectedToYear[0] - selectedFromYear[0]
    const avgAnnualInflation = yearsDiff > 0 ? avgInflation / yearsDiff : 0

    return {
      currenciesCompared: validData.length,
      yearsAnalyzed: yearsDiff,
      avgAnnualInflation: Math.max(0, avgAnnualInflation),
    }
  }, [safeData, selectedFromYear, selectedToYear])

  // Format currency safely
  const formatCurrency = (value: number, symbol: string) => {
    if (!isFinite(value) || isNaN(value)) return `${symbol}0.00`

    // Multi-character symbols need spacing
    if (symbol.length > 1 || symbol === "Fr") {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  // Get progress color based on change
  const getProgressColor = (change: number) => {
    if (change < 10) return "bg-green-500"
    if (change < 20) return "bg-yellow-500"
    if (change < 30) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">🌍 Currency Inflation Comparison</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Compare how {formatCurrency(safeOriginalAmount, "$")} performs across different currencies
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Selection Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From Year: {selectedFromYear[0]}
            </label>
            <Slider
              value={selectedFromYear}
              onValueChange={setSelectedFromYear}
              min={2000}
              max={2024}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>2000</span>
              <span>Now</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Year: {selectedToYear[0]}</label>
            <Slider
              value={selectedToYear}
              onValueChange={setSelectedToYear}
              min={2001}
              max={2025}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>2001</span>
              <span>2025</span>
            </div>
          </div>
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

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          * Data may not be complete data for the selected year range and some. Currencies without data for 2020 or 2025
          are automatically excluded.
        </div>
      </CardContent>
    </Card>
  )
}
