"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InflationCalculator() {
  const [amount, setAmount] = useState("100")
  const [fromYear, setFromYear] = useState("2000")
  const [toYear, setToYear] = useState("2025")
  const [currency, setCurrency] = useState("USD")

  const calculateInflation = () => {
    // Simple calculation for demo
    const inflationRate = 0.03 // 3% per year
    const years = Number.parseInt(toYear) - Number.parseInt(fromYear)
    const futureValue = Number.parseFloat(amount) * Math.pow(1 + inflationRate, years)
    return futureValue.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Global Inflation Calculator</h1>
          <p className="text-lg text-gray-600">Calculate how inflation affects your money over time</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Calculate Inflation Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Year</label>
                <Input
                  type="number"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  min="1990"
                  max="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Year</label>
                <Input type="number" value={toYear} onChange={(e) => setToYear(e.target.value)} min="1991" max="2025" />
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">
                {currency} {amount} in {fromYear} would be worth:
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {currency} {calculateInflation()}
              </p>
              <p className="text-sm text-gray-600 mt-2">in {toYear}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
