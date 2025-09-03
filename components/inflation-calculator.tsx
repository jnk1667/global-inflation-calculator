"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, TrendingUp, TrendingDown } from "lucide-react"
import { currencies } from "@/data/currencies"

interface InflationData {
  year: number
  rate: number
}

interface CalculationResult {
  futureValue: number
  totalInflation: number
  averageInflation: number
  purchasingPowerLoss: number
}

export default function InflationCalculator() {
  const [amount, setAmount] = useState<string>("1000")
  const [startYear, setStartYear] = useState<string>("2020")
  const [endYear, setEndYear] = useState<string>("2024")
  const [currency, setCurrency] = useState<string>("USD")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [inflationData, setInflationData] = useState<{ [key: string]: InflationData[] }>({})

  useEffect(() => {
    const loadInflationData = async () => {
      try {
        const dataPromises = currencies.map(async (curr) => {
          const response = await fetch(`/data/${curr.code.toLowerCase()}-inflation.json`)
          const data = await response.json()
          return { code: curr.code, data }
        })

        const results = await Promise.all(dataPromises)
        const dataMap: { [key: string]: InflationData[] } = {}

        results.forEach(({ code, data }) => {
          dataMap[code] = data
        })

        setInflationData(dataMap)
      } catch (error) {
        console.error("Error loading inflation data:", error)
        setError("Failed to load inflation data")
      }
    }

    loadInflationData()
  }, [])

  const calculateInflation = () => {
    setLoading(true)
    setError("")

    try {
      const startYearNum = Number.parseInt(startYear)
      const endYearNum = Number.parseInt(endYear)
      const amountNum = Number.parseFloat(amount)

      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (startYearNum >= endYearNum) {
        throw new Error("End year must be after start year")
      }

      const currencyData = inflationData[currency]
      if (!currencyData) {
        throw new Error("Inflation data not available for selected currency")
      }

      // Filter data for the selected period
      const periodData = currencyData.filter((item) => item.year >= startYearNum && item.year <= endYearNum)

      if (periodData.length === 0) {
        throw new Error("No data available for the selected period")
      }

      // Calculate compound inflation
      let futureValue = amountNum
      let totalInflationRate = 1

      periodData.forEach((item) => {
        const inflationFactor = 1 + item.rate / 100
        futureValue *= inflationFactor
        totalInflationRate *= inflationFactor
      })

      const totalInflation = (totalInflationRate - 1) * 100
      const averageInflation = periodData.reduce((sum, item) => sum + item.rate, 0) / periodData.length
      const purchasingPowerLoss = (1 - amountNum / futureValue) * 100

      setResult({
        futureValue,
        totalInflation,
        averageInflation,
        purchasingPowerLoss,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const selectedCurrency = currencies.find((c) => c.code === currency)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Inflation Calculator
          </CardTitle>
          <CardDescription>Calculate how inflation affects the value of money over time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.flag} {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year</Label>
              <Input
                id="startYear"
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                min="1960"
                max="2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear">End Year</Label>
              <Input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                min="1960"
                max="2024"
              />
            </div>
          </div>

          <Button onClick={calculateInflation} className="w-full" disabled={loading}>
            {loading ? "Calculating..." : "Calculate Inflation"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
            <CardDescription>
              Inflation impact from {startYear} to {endYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Original Value ({startYear})</Label>
                <div className="text-2xl font-bold">{formatCurrency(Number.parseFloat(amount))}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Equivalent Value ({endYear})</Label>
                <div className="text-2xl font-bold text-primary">{formatCurrency(result.futureValue)}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Total Inflation</Label>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-xl font-semibold text-red-500">{result.totalInflation.toFixed(2)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Average Annual Inflation</Label>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-xl font-semibold text-orange-500">{result.averageInflation.toFixed(2)}%</span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Purchasing Power Loss</Label>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-xl font-semibold text-red-600">{result.purchasingPowerLoss.toFixed(2)}%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your {formatCurrency(Number.parseFloat(amount))} from {startYear} has the same purchasing power as{" "}
                  {formatCurrency(result.futureValue)} in {endYear}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
