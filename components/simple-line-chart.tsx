"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ChartData {
  year: number
  value: number
}

interface CurrencyData {
  data: { [year: string]: number }
  symbol: string
  name: string
  flag: string
  startYear: number
  endYear: number
}

interface AllInflationData {
  [currency: string]: CurrencyData
}

interface SimpleLineChartProps {
  data: ChartData[]
  currency: string
  fromYear: number
  selectedCurrency?: string
  originalAmount?: number
  allInflationData?: AllInflationData
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  currency,
  fromYear,
  selectedCurrency = "USD",
  originalAmount = 100,
  allInflationData = {},
}) => {
  const [compareMode, setCompareMode] = useState(false)

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">No data available for chart</div>
    )
  }

  const currentYear = new Date().getFullYear()

  // Generate comparison data for all currencies
  const generateComparisonData = () => {
    const comparisonData: { [currency: string]: ChartData[] } = {}

    Object.entries(allInflationData).forEach(([currencyCode, currencyData]) => {
      const fromInflation = currencyData.data[fromYear.toString()]
      if (!fromInflation || fromInflation <= 0) return

      const chartData: ChartData[] = []
      const stepSize = Math.max(1, Math.floor((currentYear - fromYear) / 20))

      for (let year = fromYear; year <= currentYear; year += stepSize) {
        const yearInflation = currencyData.data[year.toString()]
        if (yearInflation && yearInflation > 0 && fromInflation > 0) {
          const yearValue = (originalAmount * yearInflation) / fromInflation
          if (isFinite(yearValue) && yearValue > 0) {
            chartData.push({ year, value: yearValue })
          }
        }
      }

      // Ensure current year is included
      const currentInflation = currencyData.data[currentYear.toString()]
      if (currentInflation && currentInflation > 0 && fromInflation > 0) {
        const currentValue = (originalAmount * currentInflation) / fromInflation
        if (chartData.length === 0 || chartData[chartData.length - 1].year !== currentYear) {
          if (isFinite(currentValue) && currentValue > 0) {
            chartData.push({ year: currentYear, value: currentValue })
          }
        }
      }

      if (chartData.length > 0) {
        comparisonData[currencyCode] = chartData
      }
    })

    return comparisonData
  }

  const comparisonData = compareMode ? generateComparisonData() : {}
  const allData = compareMode ? Object.values(comparisonData).flat() : data

  const maxValue = Math.max(...allData.map((d) => d.value))
  const minValue = Math.min(...allData.map((d) => d.value))
  const valueRange = maxValue - minValue || 1

  const formatCurrency = (value: number, symbol: string) => {
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(0)}`
    }
    return `${symbol}${value.toFixed(0)}`
  }

  // Color palette for different currencies
  const colors = {
    USD: "#3b82f6", // blue
    GBP: "#ef4444", // red
    EUR: "#10b981", // green
    CAD: "#f59e0b", // amber
    AUD: "#8b5cf6", // purple
    CHF: "#06b6d4", // cyan
    JPY: "#f97316", // orange
  }

  const currencies = {
    USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧" },
    EUR: { symbol: "€", name: "Euro", flag: "🇪🇺" },
    CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
    AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
    CHF: { symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
    JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  }

  return (
    <div className="w-full h-full relative bg-white">
      {/* Header with Compare Button - Positioned outside chart */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-sm text-gray-600">
          {compareMode
            ? "Multi-Currency Comparison"
            : `${currencies[selectedCurrency as keyof typeof currencies]?.name || selectedCurrency} Only`}
        </div>
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          onClick={() => setCompareMode(!compareMode)}
          className="text-xs px-3 py-1 h-8"
        >
          {compareMode ? "✓ Comparing" : "Compare"}
        </Button>
      </div>

      {/* Chart SVG - Clean with no overlapping text */}
      <div className="w-full mb-6">
        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart area */}
          <g transform="translate(80, 20)">
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = 320 - ratio * 320
              const value = minValue + valueRange * ratio
              return (
                <g key={index}>
                  <line x1="0" y1={y} x2="640" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  <text x="-10" y={y + 5} textAnchor="end" fontSize="12" fill="#6b7280">
                    {compareMode ? `$${value.toFixed(0)}` : formatCurrency(value, currency)}
                  </text>
                </g>
              )
            })}

            {/* X-axis labels */}
            {data
              .filter((_, index) => index % Math.ceil(data.length / 6) === 0)
              .map((point, index) => {
                const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
                return (
                  <text key={index} x={x} y="350" textAnchor="middle" fontSize="12" fill="#6b7280">
                    {point.year}
                  </text>
                )
              })}

            {/* Render lines */}
            {compareMode ? (
              // Multiple currency lines
              Object.entries(comparisonData).map(([currencyCode, currencyData]) => {
                const color = colors[currencyCode as keyof typeof colors] || "#6b7280"
                const isSelected = currencyCode === selectedCurrency

                return (
                  <g key={currencyCode}>
                    {/* Line path */}
                    <path
                      d={currencyData
                        .map((point, index) => {
                          const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
                          const y = 320 - ((point.value - minValue) / valueRange) * 320
                          return `${index === 0 ? "M" : "L"} ${x} ${y}`
                        })
                        .join(" ")}
                      fill="none"
                      stroke={color}
                      strokeWidth={isSelected ? "4" : "2"}
                      strokeOpacity={isSelected ? "1" : "0.7"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {currencyData.map((point, index) => {
                      const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
                      const y = 320 - ((point.value - minValue) / valueRange) * 320
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r={isSelected ? "5" : "3"}
                          fill={color}
                          stroke="white"
                          strokeWidth="2"
                          opacity={isSelected ? "1" : "0.8"}
                        >
                          <title>{`${currencyCode} ${point.year}: ${formatCurrency(point.value, allInflationData[currencyCode]?.symbol || "$")}`}</title>
                        </circle>
                      )
                    })}
                  </g>
                )
              })
            ) : (
              // Single currency line (original behavior)
              <g>
                <path
                  d={data
                    .map((point, index) => {
                      const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
                      const y = 320 - ((point.value - minValue) / valueRange) * 320
                      return `${index === 0 ? "M" : "L"} ${x} ${y}`
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {data.map((point, index) => {
                  const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
                  const y = 320 - ((point.value - minValue) / valueRange) * 320
                  return (
                    <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2">
                      <title>{`${point.year}: ${formatCurrency(point.value, currency)}`}</title>
                    </circle>
                  )
                })}
              </g>
            )}
          </g>

          {/* Axes */}
          <g transform="translate(80, 20)">
            <line x1="0" y1="320" x2="640" y2="320" stroke="#374151" strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="320" stroke="#374151" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Legend Section - Completely separate from chart */}
      {compareMode && (
        <div className="mt-8 space-y-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Currency Legend:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
            {Object.entries(comparisonData).map(([currencyCode]) => {
              const color = colors[currencyCode as keyof typeof colors] || "#6b7280"
              const currencyInfo = currencies[currencyCode as keyof typeof currencies]
              const isSelected = currencyCode === selectedCurrency

              return (
                <div
                  key={currencyCode}
                  className={`flex items-center gap-1 text-xs p-2 rounded border ${
                    isSelected ? "bg-blue-50 border-blue-200 font-medium" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                  <span className="text-xs">
                    {currencyInfo?.flag} {currencyCode}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100">
            💡 Your selected currency ({selectedCurrency}) is highlighted with a thicker line and darker legend item
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleLineChart
