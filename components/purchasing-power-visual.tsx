"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PurchasingPowerVisualProps {
  originalAmount?: number
  adjustedAmount?: number
  fromYear?: number
  toYear?: number
  currency?: string
  inflationRate?: number
}

export default function PurchasingPowerVisual({
  originalAmount = 100,
  adjustedAmount = 119.1,
  fromYear = 2020,
  toYear = 2025,
  currency = "$",
  inflationRate = 4.33,
}: PurchasingPowerVisualProps) {
  // Safe number validation
  const safeOriginalAmount = typeof originalAmount === "number" && isFinite(originalAmount) ? originalAmount : 100
  const safeAdjustedAmount = typeof adjustedAmount === "number" && isFinite(adjustedAmount) ? adjustedAmount : 119.1
  const safeFromYear = typeof fromYear === "number" && isFinite(fromYear) ? fromYear : 2020
  const safeToYear = typeof toYear === "number" && isFinite(toYear) ? toYear : 2025
  const safeInflationRate = typeof inflationRate === "number" && isFinite(inflationRate) ? inflationRate : 4.33

  // Calculate purchasing power metrics
  const purchasingPowerLoss = ((safeAdjustedAmount - safeOriginalAmount) / safeOriginalAmount) * 100
  const remainingPurchasingPower = 100 - purchasingPowerLoss
  const lostPurchasingPower = purchasingPowerLoss
  const yearsDifference = safeToYear - safeFromYear

  // Format currency safely
  const formatCurrency = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return `${currency}0.00`

    // Multi-character symbols need spacing
    if (currency.length > 1 || currency === "Fr") {
      return `${currency} ${value.toFixed(2)}`
    }
    return `${currency}${value.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Purchasing Power Comparison */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">💰 Purchasing Power Comparison</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Visual representation of how your money's buying power has changed
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Amount */}
            <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-lg text-center">
              <div className="text-4xl mb-2">💵</div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {formatCurrency(safeOriginalAmount)} in {safeFromYear}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">Original purchasing power</p>
            </div>

            {/* Adjusted Amount */}
            <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-lg text-center">
              <div className="text-4xl mb-2">💎</div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(safeAdjustedAmount)} in {safeToYear}
              </div>
              <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                Only worth {formatCurrency(safeOriginalAmount * (100 / (100 + purchasingPowerLoss)))} today
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchasing Power Breakdown */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">Purchasing Power Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Remaining Purchasing Power */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remaining purchasing power</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {Math.max(0, remainingPurchasingPower).toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.max(0, Math.min(100, remainingPurchasingPower))}
              className="h-3 bg-gray-200 dark:bg-gray-700"
            />
          </div>

          {/* Lost to Inflation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lost to inflation</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {Math.max(0, lostPurchasingPower).toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.max(0, Math.min(100, lostPurchasingPower))}
              className="h-3 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchasing Power Over Time */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">Purchasing Power Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{safeFromYear}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Start Year</div>
            </div>

            <div className="flex-1 mx-4">
              <div className="relative">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium border">
                  Over {yearsDifference} years, inflation has reduced purchasing power by{" "}
                  {lostPurchasingPower.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{safeToYear}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Year</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.max(0, remainingPurchasingPower).toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Power Remaining</div>
        </Card>

        <Card className="text-center p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {Math.max(0, lostPurchasingPower).toFixed(1)}%
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">Power Lost</div>
        </Card>

        <Card className="text-center p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{safeInflationRate.toFixed(2)}%</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Annual Rate</div>
        </Card>

        <Card className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{yearsDifference}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Years</div>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-yellow-800 dark:text-yellow-200">
            💡 Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              Your {formatCurrency(safeOriginalAmount)} from {safeFromYear} would need to be{" "}
              {formatCurrency(safeAdjustedAmount)} today
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              Inflation has eroded {lostPurchasingPower.toFixed(1)}% of the original buying power
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              Only {Math.max(0, remainingPurchasingPower).toFixed(1)}% of the original buying power remains
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              This represents an average annual inflation rate of {safeInflationRate.toFixed(2)}%
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
