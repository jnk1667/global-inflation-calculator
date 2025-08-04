"use client"

import type React from "react"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PurchasingPowerVisualProps {
  originalAmount: number
  adjustedAmount: number
  currency: string
  symbol: string
  fromYear: number
  inflationData?: {
    data: { [year: string]: number }
    symbol: string
    name: string
    flag: string
    startYear: number
    endYear: number
  }
}

const PurchasingPowerVisual: React.FC<PurchasingPowerVisualProps> = ({
  originalAmount,
  adjustedAmount,
  currency,
  symbol,
  fromYear,
  inflationData,
}) => {
  const currentYear = new Date().getFullYear()

  // Calculate purchasing power metrics
  const purchasingPowerMetrics = useMemo(() => {
    if (!inflationData?.data) {
      // Fallback calculation based on adjusted amount
      const totalInflation = ((adjustedAmount - originalAmount) / originalAmount) * 100
      const purchasingPowerLost = totalInflation > 0 ? (totalInflation / (100 + totalInflation)) * 100 : 0
      const purchasingPowerRemaining = 100 - purchasingPowerLost

      return {
        remainingPower: Math.max(0, Math.min(100, purchasingPowerRemaining)),
        lostPower: Math.max(0, Math.min(100, purchasingPowerLost)),
        equivalentToday: originalAmount * (purchasingPowerRemaining / 100),
        annualInflationRate: (Math.pow(adjustedAmount / originalAmount, 1 / (currentYear - fromYear)) - 1) * 100,
      }
    }

    const baseCPI = inflationData.data[fromYear.toString()]
    const currentCPI = inflationData.data[currentYear.toString()]

    if (!baseCPI || !currentCPI || baseCPI <= 0 || currentCPI <= 0) {
      return {
        remainingPower: 50,
        lostPower: 50,
        equivalentToday: originalAmount * 0.5,
        annualInflationRate: 2.5,
      }
    }

    // Calculate what $1 from base year is worth today
    const dollarValueToday = baseCPI / currentCPI
    const remainingPower = dollarValueToday * 100
    const lostPower = 100 - remainingPower
    const equivalentToday = originalAmount * dollarValueToday
    const annualInflationRate = (Math.pow(currentCPI / baseCPI, 1 / (currentYear - fromYear)) - 1) * 100

    return {
      remainingPower: Math.max(0, Math.min(100, remainingPower)),
      lostPower: Math.max(0, Math.min(100, lostPower)),
      equivalentToday: Math.max(0, equivalentToday),
      annualInflationRate: Math.max(0, annualInflationRate),
    }
  }, [inflationData, fromYear, currentYear, originalAmount, adjustedAmount])

  // Get currency display helper
  const getCurrencyDisplay = (value: number) => {
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  return (
    <Card className="bg-white shadow-lg border-0 mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">📉 Purchasing Power Comparison</CardTitle>
        <p className="text-sm text-gray-600">Visual representation of how your money's buying power has changed</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {getCurrencyDisplay(originalAmount)} in {fromYear}
            </h3>
            <div className="text-6xl mb-3">💰</div>
            <p className="text-sm text-blue-700 font-medium">Original purchasing power</p>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg border-2 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {getCurrencyDisplay(originalAmount)} in {currentYear}
            </h3>
            <div className="text-6xl mb-3">💸</div>
            <p className="text-sm text-red-700 font-medium">
              Only worth {getCurrencyDisplay(purchasingPowerMetrics.equivalentToday)} today
            </p>
          </div>
        </div>

        {/* Purchasing Power Breakdown */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Purchasing Power Breakdown</h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Remaining purchasing power</span>
                <span className="text-sm font-bold text-green-700">
                  {purchasingPowerMetrics.remainingPower.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${purchasingPowerMetrics.remainingPower}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">Lost to inflation</span>
                <span className="text-sm font-bold text-red-700">{purchasingPowerMetrics.lostPower.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${purchasingPowerMetrics.lostPower}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Simple Visual Representation */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Purchasing Power Over Time</h4>

          {/* Simple timeline visualization */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{fromYear}</div>
              <div className="text-xs text-gray-600">Start Year</div>
            </div>
            <div className="flex-1 mx-4 relative">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 rounded-full w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{currentYear}</div>
              <div className="text-xs text-gray-600">Current Year</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-700">
              Over {currentYear - fromYear} years, inflation has reduced purchasing power by{" "}
              <span className="font-bold text-red-600">{purchasingPowerMetrics.lostPower.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{purchasingPowerMetrics.remainingPower.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Power Remaining</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{purchasingPowerMetrics.lostPower.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Power Lost</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {purchasingPowerMetrics.annualInflationRate.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-600">Annual Rate</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{currentYear - fromYear}</div>
            <div className="text-xs text-gray-600">Years</div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">💡 Key Insights</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>
              • {getCurrencyDisplay(originalAmount)} in {fromYear} had the same buying power as{" "}
              <strong>{getCurrencyDisplay(adjustedAmount)}</strong> today
            </li>
            <li>
              • Inflation has eroded <strong>{purchasingPowerMetrics.lostPower.toFixed(1)}%</strong> of the original
              purchasing power
            </li>
            <li>
              • Only <strong>{purchasingPowerMetrics.remainingPower.toFixed(1)}%</strong> of the original buying power
              remains
            </li>
            <li>
              • This represents an average annual inflation rate of{" "}
              <strong>{purchasingPowerMetrics.annualInflationRate.toFixed(2)}%</strong>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default PurchasingPowerVisual
