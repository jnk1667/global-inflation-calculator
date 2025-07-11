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
  const lossPercentage = ((adjustedAmount - originalAmount) / originalAmount) * 100

  const formatCurrency = (value: number) => {
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  const getExampleItems = (amount: number, year: number) => {
    // Simplified example items based on historical prices
    if (year >= 2020) {
      return [
        { item: "Coffee", count: Math.floor(amount / 5.5), price: 5.5 },
        { item: "Movie tickets", count: Math.floor(amount / 12.5), price: 12.5 },
        { item: "Gallons of gas", count: Math.floor(amount / 3.45), price: 3.45 },
      ]
    } else if (year >= 2000) {
      return [
        { item: "Coffee", count: Math.floor(amount / 1.25), price: 1.25 },
        { item: "Movie tickets", count: Math.floor(amount / 5.39), price: 5.39 },
        { item: "Gallons of gas", count: Math.floor(amount / 1.51), price: 1.51 },
      ]
    } else if (year >= 1980) {
      return [
        { item: "Coffee", count: Math.floor(amount / 0.45), price: 0.45 },
        { item: "Movie tickets", count: Math.floor(amount / 2.69), price: 2.69 },
        { item: "Gallons of gas", count: Math.floor(amount / 1.19), price: 1.19 },
      ]
    } else if (year >= 1960) {
      return [
        { item: "Coffee", count: Math.floor(amount / 0.15), price: 0.15 },
        { item: "Movie tickets", count: Math.floor(amount / 0.69), price: 0.69 },
        { item: "Gallons of gas", count: Math.floor(amount / 0.31), price: 0.31 },
      ]
    } else {
      return [
        { item: "Coffee", count: Math.floor(amount / 0.05), price: 0.05 },
        { item: "Movie tickets", count: Math.floor(amount / 0.15), price: 0.15 },
        { item: "Gallons of gas", count: Math.floor(amount / 0.2), price: 0.2 },
      ]
    }
  }

  const pastItems = getExampleItems(originalAmount, fromYear)
  const currentItems = getExampleItems(originalAmount, currentYear)

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">🛒 Purchasing Power Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Past purchasing power */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              What {formatCurrency(originalAmount)} could buy in {fromYear}:
            </h3>
            <div className="space-y-3">
              {pastItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-green-700">
                    {item.count} {item.item}
                  </span>
                  <span className="text-sm text-green-600">@ {formatCurrency(item.price)} each</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current purchasing power */}
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              What {formatCurrency(originalAmount)} can buy in {currentYear}:
            </h3>
            <div className="space-y-3">
              {currentItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-red-700">
                    {item.count} {item.item}
                  </span>
                  <span className="text-sm text-red-600">@ {formatCurrency(item.price)} each</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-800 mb-2">Purchasing Power Impact</div>
            <div className="text-blue-700">
              Your money has {lossPercentage > 0 ? "lost" : "gained"} {Math.abs(lossPercentage).toFixed(1)}% of its
              purchasing power over {currentYear - fromYear} years.
            </div>
            <div className="text-sm text-blue-600 mt-2">
              You need {formatCurrency(adjustedAmount)} today to buy what {formatCurrency(originalAmount)} could buy in{" "}
              {fromYear}.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PurchasingPowerVisual
