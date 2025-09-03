"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, BarChart3 } from "lucide-react"

interface ChartDataPoint {
  year: number
  value: number
}

interface SimpleLineChartProps {
  data?: ChartDataPoint[]
  currency?: string
  fromYear?: number
  selectedCurrency?: string
  originalAmount?: number
  allInflationData?: any
}

const defaultCurrencies = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", color: "#3B82F6" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", color: "#EF4444" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", color: "#F59E0B" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", color: "#8B5CF6" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", color: "#10B981" },
  CHF: { symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", color: "#06B6D4" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", color: "#22C55E" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", color: "#A855F7" },
}

// Multi-currency comparison data (2020-2025)
const multiCurrencyData = [
  { year: 2020, USD: 100, GBP: 100, EUR: 100, CAD: 100, AUD: 100, CHF: 100, JPY: 100, NZD: 100 },
  { year: 2021, USD: 104.7, GBP: 102.56, EUR: 102.55, CAD: 103.4, AUD: 102.86, CHF: 100.58, JPY: 99.75, NZD: 103.93 },
  {
    year: 2022,
    USD: 113.08,
    GBP: 111.84,
    EUR: 111.15,
    CAD: 110.43,
    AUD: 109.64,
    CHF: 103.44,
    JPY: 102.24,
    NZD: 111.38,
  },
  {
    year: 2023,
    USD: 117.74,
    GBP: 120.01,
    EUR: 117.18,
    CAD: 114.74,
    AUD: 115.56,
    CHF: 105.65,
    JPY: 105.58,
    NZD: 117.73,
  },
  { year: 2024, USD: 121.48, GBP: 122.7, EUR: 120.23, CAD: 118.07, AUD: 119.95, CHF: 107.02, JPY: 108.54, NZD: 121.62 },
  { year: 2025, USD: 124.4, GBP: 125.28, EUR: 122.75, CAD: 120.67, AUD: 123.31, CHF: 108.2, JPY: 110.49, NZD: 124.66 },
]

export default function SimpleLineChart({
  data = [],
  currency = "$",
  fromYear = 2020,
  selectedCurrency = "USD",
  originalAmount = 100,
  allInflationData = {},
}: SimpleLineChartProps) {
  const [isComparing, setIsComparing] = useState(false)

  // Safe data validation
  const safeSelectedCurrency = selectedCurrency && typeof selectedCurrency === "string" ? selectedCurrency : "USD"
  const safeOriginalAmount = typeof originalAmount === "number" && isFinite(originalAmount) ? originalAmount : 100
  const safeFromYear = typeof fromYear === "number" && isFinite(fromYear) ? fromYear : 2020

  // Generate chart data based on mode
  const chartData = useMemo(() => {
    if (isComparing) {
      // Use multi-currency data for comparison
      return multiCurrencyData
    } else {
      // Use single currency data (either provided data or extract from multi-currency data)
      if (Array.isArray(data) && data.length > 0) {
        return data.map((point) => ({
          year: point.year,
          [safeSelectedCurrency]: point.value,
        }))
      } else {
        // Extract single currency from multi-currency data
        return multiCurrencyData.map((point) => ({
          year: point.year,
          [safeSelectedCurrency]: point[safeSelectedCurrency as keyof typeof point] || 100,
        }))
      }
    }
  }, [isComparing, data, safeSelectedCurrency])

  // Get currency info safely
  const getCurrencyInfo = (code: string) => {
    if (!code || typeof code !== "string") return defaultCurrencies.USD
    return defaultCurrencies[code as keyof typeof defaultCurrencies] || defaultCurrencies.USD
  }

  const selectedCurrencyInfo = getCurrencyInfo(safeSelectedCurrency)

  // Format currency safely
  const formatCurrency = (value: number, symbol: string = currency) => {
    if (typeof value !== "number" || !isFinite(value) || isNaN(value)) return `${symbol}0.00`

    // Multi-character symbols need spacing
    if (symbol.length > 1 || symbol === "Fr") {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && Array.isArray(payload) && payload.length > 0) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{`Year: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            const currencyInfo = getCurrencyInfo(entry.dataKey)
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

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading chart data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {isComparing ? "Multi-Currency Comparison" : `${selectedCurrencyInfo.name} Inflation Trend Over Time`}
          </CardTitle>
          <Button
            variant={isComparing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsComparing(!isComparing)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {isComparing ? "✓ Comparing" : "Compare"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {isComparing
            ? "Compare inflation across all major currencies"
            : `How ${formatCurrency(safeOriginalAmount, selectedCurrencyInfo.symbol)} grows over time`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={{ stroke: "#666" }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#666" }}
                domain={["dataMin - 5", "dataMax + 5"]}
                tickFormatter={(value) => `$${Math.round(value)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {isComparing && <Legend />}

              {isComparing ? (
                // Show all currencies when comparing
                Object.keys(defaultCurrencies).map((code) => {
                  const currencyInfo = getCurrencyInfo(code)
                  const hasData = chartData.some((point) => {
                    const value = point[code]
                    return value !== undefined && typeof value === "number" && isFinite(value)
                  })

                  if (!hasData) return null

                  return (
                    <Line
                      key={code}
                      type="monotone"
                      dataKey={code}
                      stroke={currencyInfo.color}
                      strokeWidth={code === safeSelectedCurrency ? 3 : 2}
                      dot={{ fill: currencyInfo.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: currencyInfo.color, strokeWidth: 2 }}
                      name={`${currencyInfo.flag} ${code}`}
                    />
                  )
                })
              ) : (
                // Show only selected currency
                <Line
                  type="monotone"
                  dataKey={safeSelectedCurrency}
                  stroke={selectedCurrencyInfo.color}
                  strokeWidth={3}
                  dot={{ fill: selectedCurrencyInfo.color, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: selectedCurrencyInfo.color, strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Currency Legend - Only show when comparing */}
        {isComparing && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Currency Legend:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(defaultCurrencies).map(([code, info]) => (
                <div key={code} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                  <span className="text-xs">
                    {info.flag} {code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Currency Info - Only show when NOT comparing */}
        {!isComparing && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCurrencyInfo.flag}</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Your selected currency ({safeSelectedCurrency}) is highlighted with a thicker line and darker legend
                item.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
