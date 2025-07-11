"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PurchasingPowerVisualProps {
  originalAmount: number
  adjustedAmount: number
  currency: string
  symbol: string
  fromYear: number
}

const PurchasingPowerVisual: React.FC<PurchasingPowerVisualProps> = ({
  originalAmount,
  adjustedAmount,
  currency,
  symbol,
  fromYear,
}) => {
  const currentYear = new Date().getFullYear()
  const inflationRate = ((adjustedAmount - originalAmount) / originalAmount) * 100

  const formatCurrency = (value: number) => {
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  // Calculate visual representation
  const originalBars = Math.ceil(originalAmount / 10)
  const adjustedBars = Math.ceil(adjustedAmount / 10)
  const maxBars = Math.max(originalBars, adjustedBars, 10)

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">💰 Purchasing Power Comparison</CardTitle>
        <div className="text-sm text-gray-600">Visual representation of how your money's buying power has changed</div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(originalAmount)} in {fromYear}
            </div>
            <div className="text-lg text-gray-600 mb-4">has the same buying power as</div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(adjustedAmount)} in {currentYear}
            </div>
            <div className="text-sm text-gray-500">That's a {inflationRate.toFixed(1)}% increase due to inflation</div>
          </div>
        </div>

        {/* Visual Bars */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{fromYear} Value</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(originalAmount)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: originalBars }, (_, i) => (
                <div key={i} className="w-4 h-8 bg-blue-400 rounded-sm" />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{currentYear} Equivalent</span>
              <span className="text-sm font-bold text-blue-600">{formatCurrency(adjustedAmount)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: adjustedBars }, (_, i) => (
                <div key={i} className="w-4 h-8 bg-blue-600 rounded-sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>What this means:</strong> Due to inflation over {currentYear - fromYear} years, you would need{" "}
            {formatCurrency(adjustedAmount)} today to buy the same goods and services that{" "}
            {formatCurrency(originalAmount)} could buy in {fromYear}.
          </div>
        </div>

        {/* Historical Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Then ({fromYear})</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Average car: $3,000-$5,000</li>
              <li>• Average house: $17,000</li>
              <li>• Gallon of gas: $0.36</li>
              <li>• Movie ticket: $1.55</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Now ({currentYear})</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Average car: $35,000-$45,000</li>
              <li>• Average house: $350,000</li>
              <li>• Gallon of gas: $3.45</li>
              <li>• Movie ticket: $12.50</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PurchasingPowerVisual
