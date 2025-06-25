"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface CurrencyComparisonProps {
  amount: string
  fromYear: number
  inflationData: any
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function CurrencyComparisonChart({ amount, fromYear, inflationData }: CurrencyComparisonProps) {
  const [startYear, setStartYear] = useState(1996)
  const [endYear, setEndYear] = useState(2025)

  // Get available years based on data
  const getAvailableYears = () => {
    if (!inflationData) return { minYear: 1996, maxYear: 2025 }

    let minYear = 2025
    let maxYear = 1996

    Object.values(inflationData).forEach((data: any) => {
      if (data && data.data) {
        const years = Object.keys(data.data)
          .map(Number)
          .filter((year) => !isNaN(year))
        if (years.length > 0) {
          minYear = Math.min(minYear, Math.min(...years))
          maxYear = Math.max(maxYear, Math.max(...years))
        }
      }
    })

    return { minYear: Math.max(minYear, 1996), maxYear }
  }

  const { minYear, maxYear } = getAvailableYears()

  // Ensure valid date range on mount and when data changes
  useEffect(() => {
    if (startYear < minYear) setStartYear(minYear)
    if (endYear > maxYear) setEndYear(maxYear)
    if (startYear >= endYear) setEndYear(Math.min(startYear + 1, maxYear))
  }, [minYear, maxYear, startYear, endYear])

  if (!inflationData || !amount || Object.keys(inflationData).length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-4 sm:p-8">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <div>Loading currency comparison...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const numAmount = Number.parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-4 sm:p-8">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">⚠️</div>
            <div>Please enter a valid amount</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const comparisonData = []

  Object.entries(inflationData).forEach(([currency, data]: [string, any], index) => {
    if (!data || !data.data) return

    const fromInflation = data.data[startYear.toString()]
    const currentInflation = data.data[endYear.toString()]

    if (
      fromInflation &&
      currentInflation &&
      isFinite(fromInflation) &&
      isFinite(currentInflation) &&
      fromInflation > 0
    ) {
      const adjustedAmount = numAmount * (currentInflation / fromInflation)
      if (isFinite(adjustedAmount) && adjustedAmount > 0) {
        const totalInflation = ((adjustedAmount - numAmount) / numAmount) * 100

        comparisonData.push({
          currency,
          symbol: data.symbol || "$",
          flag: data.flag || "🏳️",
          name: data.name || currency,
          currentValue: Number(adjustedAmount.toFixed(2)),
          inflation: Number(totalInflation.toFixed(2)),
          color: COLORS[index % COLORS.length],
        })
      }
    }
  })

  // Sort by inflation rate (highest first)
  comparisonData.sort((a, b) => b.inflation - a.inflation)

  // Calculate max inflation for proper bar scaling - improved edge case handling
  const inflationValues = comparisonData.map((d) => Math.abs(d.inflation))
  const maxInflation = inflationValues.length > 0 ? Math.max(...inflationValues) : 100

  // Prevent division by zero
  const safeMaxInflation = maxInflation > 0 ? maxInflation : 100

  return (
    <Card className="bg-white shadow-lg border-0 chart-container">
      <CardContent className="p-4 sm:p-8">
        <div className="flex flex-col space-y-4 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">🌍 Currency Inflation Comparison</h3>

          {/* Enhanced Date Range Selectors with Validation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm">
            <span className="text-gray-600 font-medium">Compare from:</span>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">From:</span>
                <select
                  value={startYear}
                  onChange={(e) => {
                    const newStartYear = Number(e.target.value)
                    setStartYear(newStartYear)
                    // Ensure end year is after start year
                    if (newStartYear >= endYear) {
                      setEndYear(Math.min(newStartYear + 1, maxYear))
                    }
                  }}
                  className="flex-1 sm:w-auto px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  aria-label="Select start year"
                >
                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
                    .filter((year) => year < maxYear) // Ensure we can have at least 1 year difference
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">To:</span>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  className="flex-1 sm:w-auto px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  aria-label="Select end year"
                >
                  {Array.from({ length: maxYear - startYear }, (_, i) => startYear + i + 1).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Comparing {numAmount} {comparisonData[0]?.symbol || "$"} inflation across currencies from {startYear} to{" "}
            {endYear} ({endYear - startYear} years)
          </p>
        </div>

        {comparisonData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📊</div>
            <div>No data available for selected date range</div>
          </div>
        ) : (
          <>
            {/* Enhanced Bar Chart - Mobile Optimized */}
            <div className="h-64 sm:h-80 mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-6 border overflow-x-auto">
              <div className="h-full flex items-end justify-around space-x-2 sm:space-x-3 min-w-full">
                {comparisonData.map((item, index) => {
                  // Improved bar height calculation with better edge case handling
                  const barHeight = Math.max((Math.abs(item.inflation) / safeMaxInflation) * 85, 8) // Min 8%, max 85%
                  const isNegative = item.inflation < 0

                  return (
                    <div key={item.currency} className="flex flex-col items-center flex-1 h-full min-w-0">
                      <div className="flex-1 flex flex-col justify-end relative w-full">
                        {/* Inflation percentage label on top */}
                        <div className="text-xs font-semibold text-gray-700 mb-1 text-center">
                          {item.inflation > 0 ? "+" : ""}
                          {item.inflation.toFixed(1)}%
                        </div>

                        {/* Bar - Enhanced Mobile Friendly */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-1000 hover:opacity-80 cursor-pointer relative group touch-manipulation ${
                            isNegative ? "bg-red-500" : ""
                          }`}
                          style={{
                            height: `${barHeight}%`,
                            backgroundColor: isNegative ? "#ef4444" : item.color,
                            minHeight: "20px",
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${item.name}: ${item.inflation.toFixed(1)}% inflation`}
                        >
                          {/* Enhanced Mobile-Friendly Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                            <div className="font-semibold">{item.name}</div>
                            <div>{item.inflation.toFixed(2)}% inflation</div>
                            <div>
                              {item.symbol}
                              {item.currentValue.toFixed(0)} today
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Currency Info - Mobile Optimized */}
                      <div className="mt-2 sm:mt-3 text-center">
                        <div className="text-lg sm:text-2xl mb-1">{item.flag}</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{item.currency}</div>
                        <div className="text-xs text-gray-600 hidden sm:block truncate">{item.name}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comparison Cards - Mobile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {comparisonData.map((item, index) => (
                <div
                  key={item.currency}
                  className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center hover:shadow-md transition-shadow border touch-manipulation"
                >
                  <div className="text-xl sm:text-2xl mb-2">{item.flag}</div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.currency}</div>
                  <div className="text-base sm:text-lg font-bold text-blue-600 mt-2">
                    {item.symbol}
                    {item.currentValue.toLocaleString()}
                  </div>
                  <div className={`text-sm font-medium ${item.inflation >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {item.inflation > 0 ? "+" : ""}
                    {item.inflation.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.inflation >= 0 ? "Inflation" : "Deflation"}</div>
                </div>
              ))}
            </div>

            {/* Enhanced Insights - Mobile Friendly */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                💡 Key Insights ({startYear}-{endYear}):
              </h4>
              <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                <p>
                  • <strong>{comparisonData[0]?.name}</strong> had the highest inflation at{" "}
                  <strong>{comparisonData[0]?.inflation.toFixed(1)}%</strong>
                </p>
                <p>
                  • <strong>{comparisonData[comparisonData.length - 1]?.name}</strong> had the lowest inflation at{" "}
                  <strong>{comparisonData[comparisonData.length - 1]?.inflation.toFixed(1)}%</strong>
                </p>
                <p>
                  • Over {endYear - startYear} years, your {comparisonData[0]?.symbol}
                  {numAmount} would have the most purchasing power in{" "}
                  <strong>{comparisonData[comparisonData.length - 1]?.name}</strong>
                </p>
                {comparisonData.some((item) => item.inflation < 0) && (
                  <p>
                    • Some currencies experienced <strong>deflation</strong> (negative inflation) during this period
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
