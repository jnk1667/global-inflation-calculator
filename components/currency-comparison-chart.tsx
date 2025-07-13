"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

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

interface CurrencyComparisonChartProps {
  amount: string
  fromYear: number
  inflationData: AllInflationData
}

const CurrencyComparisonChart: React.FC<CurrencyComparisonChartProps> = ({ amount, fromYear, inflationData }) => {
  const [selectedFromYear, setSelectedFromYear] = useState(fromYear)
  const [selectedToYear, setSelectedToYear] = useState(new Date().getFullYear())

  const currentYear = new Date().getFullYear()
  const minYear = 1913
  const maxYear = currentYear

  const comparisonData = useMemo(() => {
    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return []

    const data: any[] = []

    Object.entries(inflationData).forEach(([currency, currencyData]) => {
      // Check if currency has data for both selected years
      const fromInflation = currencyData.data[selectedFromYear.toString()]
      const toInflation = currencyData.data[selectedToYear.toString()]

      // Only include currencies that have data for both years
      if (fromInflation && toInflation && fromInflation > 0 && toInflation > 0) {
        const adjustedAmount = (amountValue * toInflation) / fromInflation
        const totalInflation = ((adjustedAmount - amountValue) / amountValue) * 100
        const years = selectedToYear - selectedFromYear
        const annualRate = years > 0 ? (Math.pow(adjustedAmount / amountValue, 1 / years) - 1) * 100 : 0

        data.push({
          currency,
          name: currencyData.name,
          flag: currencyData.flag,
          symbol: currencyData.symbol,
          adjustedAmount: isFinite(adjustedAmount) ? adjustedAmount : 0,
          totalInflation: isFinite(totalInflation) ? totalInflation : 0,
          annualRate: isFinite(annualRate) ? annualRate : 0,
        })
      }
    })

    return data.sort((a, b) => b.adjustedAmount - a.adjustedAmount)
  }, [amount, selectedFromYear, selectedToYear, inflationData])

  const formatCurrency = (value: number, symbol: string) => {
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  const maxValue = comparisonData.length > 0 ? Math.max(...comparisonData.map((d) => d.adjustedAmount)) : 0

  if (comparisonData.length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl">🌍 Currency Inflation Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              No currency data available for the selected year range ({selectedFromYear} - {selectedToYear}).
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Try selecting a different year range where more currencies have available data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">🌍 Currency Inflation Comparison</CardTitle>
        <div className="text-sm text-gray-600">
          Compare how {formatCurrency(Number.parseFloat(amount), "$")} performs across different currencies
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Range Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">From Year: {selectedFromYear}</label>
            <Slider
              value={[selectedFromYear]}
              onValueChange={(value) => setSelectedFromYear(value[0])}
              min={minYear}
              max={maxYear - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{minYear}</span>
              <span>{maxYear - 1}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">To Year: {selectedToYear}</label>
            <Slider
              value={[selectedToYear]}
              onValueChange={(value) => setSelectedToYear(value[0])}
              min={selectedFromYear + 1}
              max={maxYear}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{selectedFromYear + 1}</span>
              <span>{maxYear}</span>
            </div>
          </div>
        </div>

        {/* Quick Year Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFromYear(2020)
              setSelectedToYear(currentYear)
            }}
          >
            2020 - Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFromYear(2010)
              setSelectedToYear(currentYear)
            }}
          >
            2010 - Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFromYear(2000)
              setSelectedToYear(currentYear)
            }}
          >
            2000 - Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFromYear(1990)
              setSelectedToYear(currentYear)
            }}
          >
            1990 - Now
          </Button>
        </div>

        {/* Custom Bar Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-4">
            {comparisonData.map((item, index) => {
              const barWidth = maxValue > 0 ? (item.adjustedAmount / maxValue) * 100 : 0
              const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-orange-500"]
              const color = colors[index % colors.length]

              return (
                <div key={item.currency} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.flag}</span>
                      <span className="font-medium">{item.currency}</span>
                      <span className="text-gray-500">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{formatCurrency(item.adjustedAmount, item.symbol)}</div>
                      <div className="text-xs text-gray-500">{item.totalInflation.toFixed(1)}% total</div>
                    </div>
                  </div>
                  <div className="relative bg-gray-200 rounded-full h-6">
                    <div
                      className={`${color} h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500`}
                      style={{ width: `${Math.max(barWidth, 5)}%` }}
                    >
                      {item.annualRate.toFixed(1)}%/yr
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{comparisonData.length}</div>
            <div className="text-sm text-gray-600">Currencies Compared</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{selectedToYear - selectedFromYear}</div>
            <div className="text-sm text-gray-600">Years Analyzed</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {comparisonData.length > 0
                ? `${(comparisonData.reduce((sum, item) => sum + item.annualRate, 0) / comparisonData.length).toFixed(1)}%`
                : "0%"}
            </div>
            <div className="text-sm text-gray-600">Avg Annual Inflation</div>
          </div>
        </div>

        {/* Note */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          💡 Only currencies with complete data for the selected year range are shown. Currencies without data for{" "}
          {selectedFromYear} or {selectedToYear} are automatically excluded.
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrencyComparisonChart
