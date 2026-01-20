"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  HomeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  InfoIcon,
  CalendarIcon,
  DollarSignIcon,
} from "lucide-react"
import Link from "next/link"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import FAQ from "@/components/faq"

interface AffordabilityData {
  year: number
  homePrice: number
  medianIncome: number
  priceToIncomeRatio: number
  yearsOfIncome: number
  affordabilityIndex: number
  realHomePrice?: number
  realMedianIncome?: number
  realPriceToIncomeRatio?: number
}

interface ComparisonResult {
  currentYear: number
  compareYear: number
  currentData: AffordabilityData
  compareData: AffordabilityData
  priceDifference: number
  incomeDifference: number
  ratioDifference: number
  affordabilityChange: string
}

export default function MortgageCalculatorPage() {
  const [currentYear, setCurrentYear] = useState("2024")
  const [compareYear, setCompareYear] = useState("2006")
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [historicalData, setHistoricalData] = useState<{ [key: string]: AffordabilityData }>({})
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [inflationAdjusted, setInflationAdjusted] = useState(false)
  const [inflationData, setInflationData] = useState<{ [key: string]: number }>({})

  const essayContent = `
# Understanding Mortgage Affordability

Mortgage affordability has become one of the most pressing economic issues of our time. This calculator helps you understand how mortgage costs have changed relative to income over the past several decades.

## The Price-to-Income Ratio

The price-to-income ratio is a key metric for understanding mortgage affordability. It represents how many years of median household income it would take to purchase a median-priced home with a mortgage. Historically, a ratio of 3-4x has been considered affordable, while ratios above 5x indicate mortgage stress.

## Historical Context

### The 1990s: Affordable Mortgage Era
During the 1990s, mortgages were relatively affordable with price-to-income ratios around 3.5-4x. This period represented a healthy mortgage market where homeownership was accessible to middle-class families.

### 2006: The Mortgage Bubble Peak
The mid-2000s saw an unprecedented mortgage bubble, with price-to-income ratios reaching 5.3x by 2006. This unsustainable growth was fueled by loose lending standards and speculation, ultimately leading to the 2008 financial crisis.

### 2012: Post-Crash Recovery
Following the housing crash, mortgage affordability improved significantly. By 2012, ratios had fallen back to more sustainable levels around 4.8x, creating opportunities for buyers who had been priced out during the bubble.

### 2020-2024: The New Mortgage Crisis
The COVID-19 pandemic triggered another mortgage boom, driven by low interest rates, remote work, and limited supply. By 2022, price-to-income ratios had surged to 5.75x, exceeding even the 2006 bubble peak in many markets.

## Why This Matters

Mortgage affordability affects:
- **Homeownership rates**: Higher ratios make it harder for first-time buyers to enter the market
- **Economic mobility**: Mortgage costs consume a larger share of household budgets
- **Wealth inequality**: Those who already own homes benefit from appreciation, while renters fall further behind
- **Geographic mobility**: High mortgage costs in job-rich areas limit where people can afford to live

## Data Sources

This calculator uses official data from:
- **Case-Shiller U.S. National Home Price Index**: The most widely-followed measure of U.S. home prices
- **Federal Reserve Economic Data (FRED)**: Median household income statistics
- **Historical records**: Dating back to 1987 for comprehensive trend analysis
`

  useEffect(() => {
    const loadData = async () => {
      try {
        const [housingResponse, inflationResponse] = await Promise.all([
          fetch("/data/housing-affordability.json"),
          fetch("/data/usd-inflation.json"),
        ])

        const housingJsonData = await housingResponse.json()
        const inflationJsonData = await inflationResponse.json()

        setInflationData(inflationJsonData.data)

        const transformedData: { [key: string]: AffordabilityData } = {}
        housingJsonData.forEach((item: any) => {
          transformedData[item.year] = {
            year: Number.parseInt(item.year),
            homePrice: item.approximateHomePrice,
            medianIncome: item.medianIncome,
            priceToIncomeRatio: item.priceToIncomeRatio,
            yearsOfIncome: item.priceToIncomeRatio,
            affordabilityIndex: Math.round((4 / item.priceToIncomeRatio) * 100),
          }
        })

        setHistoricalData(transformedData)
        const years = Object.keys(transformedData).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
        setAvailableYears(years)
        setDataLoaded(true)
      } catch (error) {
        console.error("Error loading housing data:", error)
        setDataLoaded(true)
      }
    }

    loadData()
  }, [])

  const adjustForInflation = (value: number, fromYear: number, toYear: number): number => {
    const fromCPI = inflationData[fromYear.toString()]
    const toCPI = inflationData[toYear.toString()]

    if (!fromCPI || !toCPI) return value

    return (value * toCPI) / fromCPI
  }

  const getAdjustedData = (data: AffordabilityData, baseYear: number): AffordabilityData => {
    if (!inflationAdjusted) return data

    const realHomePrice = adjustForInflation(data.homePrice, data.year, baseYear)
    const realMedianIncome = adjustForInflation(data.medianIncome, data.year, baseYear)
    const realPriceToIncomeRatio = realHomePrice / realMedianIncome

    return {
      ...data,
      realHomePrice,
      realMedianIncome,
      realPriceToIncomeRatio,
    }
  }

  const calculateAffordability = () => {
    if (!dataLoaded || !historicalData[currentYear] || !historicalData[compareYear]) {
      return
    }

    setLoading(true)

    setTimeout(() => {
      const baseYear = Number.parseInt(currentYear)
      const currentData = getAdjustedData(historicalData[currentYear], baseYear)
      const compareData = getAdjustedData(historicalData[compareYear], baseYear)

      if (!currentData || !compareData) {
        setLoading(false)
        return
      }

      const currentPrice = inflationAdjusted
        ? currentData.realHomePrice || currentData.homePrice
        : currentData.homePrice
      const comparePrice = inflationAdjusted
        ? compareData.realHomePrice || compareData.homePrice
        : compareData.homePrice
      const currentIncome = inflationAdjusted
        ? currentData.realMedianIncome || currentData.medianIncome
        : currentData.medianIncome
      const compareIncome = inflationAdjusted
        ? compareData.realMedianIncome || compareData.medianIncome
        : compareData.medianIncome
      const currentRatio = inflationAdjusted
        ? currentData.realPriceToIncomeRatio || currentData.priceToIncomeRatio
        : currentData.priceToIncomeRatio
      const compareRatio = inflationAdjusted
        ? compareData.realPriceToIncomeRatio || compareData.priceToIncomeRatio
        : compareData.priceToIncomeRatio

      const priceDifference = ((currentPrice - comparePrice) / comparePrice) * 100
      const incomeDifference = ((currentIncome - compareIncome) / compareIncome) * 100
      const ratioDifference = currentRatio - compareRatio

      let affordabilityChange = "similar"
      if (ratioDifference > 0.5) affordabilityChange = "less affordable"
      else if (ratioDifference < -0.5) affordabilityChange = "more affordable"

      setResult({
        currentYear: Number.parseInt(currentYear),
        compareYear: Number.parseInt(compareYear),
        currentData: {
          ...currentData,
          homePrice: currentPrice,
          medianIncome: currentIncome,
          priceToIncomeRatio: currentRatio,
          yearsOfIncome: currentRatio,
        },
        compareData: {
          ...compareData,
          homePrice: comparePrice,
          medianIncome: compareIncome,
          priceToIncomeRatio: compareRatio,
          yearsOfIncome: compareRatio,
        },
        priceDifference,
        incomeDifference,
        ratioDifference,
        affordabilityChange,
      })

      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    if (dataLoaded) {
      calculateAffordability()
    }
  }, [currentYear, compareYear, dataLoaded, inflationAdjusted])

  const getAffordabilityStatus = (ratio: number) => {
    if (ratio < 4) return { label: "Affordable", color: "bg-green-500", textColor: "text-green-700" }
    if (ratio < 5) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-700" }
    if (ratio < 6) return { label: "Stressed", color: "bg-orange-500", textColor: "text-orange-700" }
    return { label: "Crisis", color: "bg-red-500", textColor: "text-red-700" }
  }

  const mostAffordableYear =
    availableYears.length > 0
      ? availableYears.reduce((min, year) => {
          return historicalData[year]?.priceToIncomeRatio < historicalData[min]?.priceToIncomeRatio ? year : min
        }, availableYears[0])
      : "1987"

  const data2006 = historicalData["2006"]
  const data2024 = historicalData["2024"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-32 pb-16" style={{ contain: "layout style" }}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-4">
            <HomeIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Mortgage Calculator</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Mortgage Calculator</span>
        </nav>

        {/* Inflation adjustment toggle */}
        <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Label htmlFor="inflation-toggle" className="text-base font-semibold cursor-pointer">
            Show Nominal Values
          </Label>
          <Switch id="inflation-toggle" checked={inflationAdjusted} onCheckedChange={setInflationAdjusted} />
          <Label htmlFor="inflation-toggle" className="text-base font-semibold cursor-pointer">
            Show Inflation-Adjusted Values
          </Label>
          <InfoIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>

        {/* Explanation alert for inflation adjustment - uses opacity to prevent CLS */}
        <div style={{ minHeight: inflationAdjusted ? "auto" : "0", overflow: "hidden", transition: "min-height 0.2s ease-out" }}>
          <Alert className={`mb-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 transition-opacity duration-200 ${inflationAdjusted ? "opacity-100" : "opacity-0 h-0 mb-0 p-0 border-0 overflow-hidden"}`}>
            <InfoIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="text-purple-900 dark:text-purple-100">
              <strong>Inflation-Adjusted Mode:</strong> All values are adjusted to {currentYear} dollars, showing the
              "real" purchasing power. This reveals how much mortgage affordability has truly changed after accounting
              for inflation's impact on both home prices and incomes.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Calculator */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Input Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Years to Compare
              </CardTitle>
              <CardDescription className="text-blue-100">
                Choose two years to compare mortgage affordability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="currentYear" className="text-base font-semibold">
                  Current Year
                </Label>
                <Select value={currentYear} onValueChange={setCurrentYear}>
                  <SelectTrigger id="currentYear" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareYear" className="text-base font-semibold">
                  Compare to Year
                </Label>
                <Select value={compareYear} onValueChange={setCompareYear}>
                  <SelectTrigger id="compareYear" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-100">
                  <strong>Key Periods:</strong> Compare 2024 to 2006 (bubble peak), 2012 (post-crash), or 1987
                  (affordable era)
                </AlertDescription>
              </Alert>

              <Button
                onClick={calculateAffordability}
                className="w-full h-12"
                size="lg"
                disabled={loading || !dataLoaded}
              >
                {loading ? "Calculating..." : "Compare Affordability"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Quick Facts
              </CardTitle>
              <CardDescription>Key mortgage affordability insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Affordable Period</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mostAffordableYear && historicalData[mostAffordableYear] ? mostAffordableYear : "1987"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ~
                  {mostAffordableYear && historicalData[mostAffordableYear]
                    ? historicalData[mostAffordableYear].priceToIncomeRatio.toFixed(2)
                    : "4.2"}
                  x income ratio
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">2006 Bubble Peak</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {data2006 ? data2006.priceToIncomeRatio.toFixed(2) : "6.22"}x
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pre-financial crisis high</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current (2024)</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data2024 ? data2024.priceToIncomeRatio.toFixed(2) : "6.80"}x
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Worst affordability on record</p>
              </div>

              <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <AlertTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm">
                  Mortgage is currently at the worst affordability level in recorded history, exceeding even the 2006
                  bubble
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Mortgage Calculator Data Sources Info Card */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-l-4 border-l-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  This calculator helps you understand how home prices have changed relative to household incomes over
                  the past several decades, revealing long-term trends in housing affordability and mortgage
                  qualification requirements.
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Data Sources:</p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>
                      • <span className="font-medium">Case-Shiller U.S. National Home Price Index</span> - The most
                      widely-followed measure of U.S. home prices
                    </li>
                    <li>
                      • <span className="font-medium">Federal Reserve Economic Data (FRED)</span> - Median household
                      income statistics from the U.S. Census Bureau
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Comparison Overview */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="text-2xl">
                  {result.currentYear} vs {result.compareYear} Comparison
                  {inflationAdjusted && (
                    <Badge className="ml-3 bg-purple-200 text-purple-900">Inflation-Adjusted to {currentYear}</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Mortgage is{" "}
                  <strong className="text-white">
                    {result.affordabilityChange === "less affordable"
                      ? "LESS AFFORDABLE"
                      : result.affordabilityChange === "more affordable"
                        ? "MORE AFFORDABLE"
                        : "SIMILARLY AFFORDABLE"}
                  </strong>{" "}
                  in {result.currentYear} compared to {result.compareYear}
                  {inflationAdjusted && (
                    <span className="block mt-2 text-sm">
                      (After adjusting for inflation's impact on purchasing power)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Year Data */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{result.currentYear}</h3>
                      <Badge className={getAffordabilityStatus(result.currentData.priceToIncomeRatio).color}>
                        {getAffordabilityStatus(result.currentData.priceToIncomeRatio).label}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Median Home Price {inflationAdjusted && `(${currentYear} dollars)`}
                        </p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${result.currentData.homePrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Median Household Income {inflationAdjusted && `(${currentYear} dollars)`}
                        </p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          ${result.currentData.medianIncome.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Price-to-Income Ratio</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {result.currentData.priceToIncomeRatio.toFixed(2)}x
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {result.currentData.yearsOfIncome.toFixed(1)} years of income needed
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Compare Year Data */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{result.compareYear}</h3>
                      <Badge className={getAffordabilityStatus(result.compareData.priceToIncomeRatio).color}>
                        {getAffordabilityStatus(result.compareData.priceToIncomeRatio).label}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Median Home Price {inflationAdjusted && `(${currentYear} dollars)`}
                        </p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${result.compareData.homePrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Median Household Income {inflationAdjusted && `(${currentYear} dollars)`}
                        </p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          ${result.compareData.medianIncome.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Price-to-Income Ratio</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {result.compareData.priceToIncomeRatio.toFixed(2)}x
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {result.compareData.yearsOfIncome.toFixed(1)} years of income needed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Change Analysis */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSignIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Home Price Change {inflationAdjusted && "(Real)"}
                      </p>
                    </div>
                    <p
                      className={`text-2xl font-bold ${result.priceDifference > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {result.priceDifference > 0 ? "+" : ""}
                      {result.priceDifference.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${Math.abs(result.currentData.homePrice - result.compareData.homePrice).toLocaleString()} change
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Income Change {inflationAdjusted && "(Real)"}
                      </p>
                    </div>
                    <p
                      className={`text-2xl font-bold ${result.incomeDifference > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {result.incomeDifference > 0 ? "+" : ""}
                      {result.incomeDifference.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${Math.abs(result.currentData.medianIncome - result.compareData.medianIncome).toLocaleString()}{" "}
                      change
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {result.ratioDifference > 0 ? (
                        <TrendingUpIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <TrendingDownIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ratio Change</p>
                    </div>
                    <p
                      className={`text-2xl font-bold ${result.ratioDifference > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {result.ratioDifference > 0 ? "+" : ""}
                      {result.ratioDifference.toFixed(2)}x
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.abs(result.ratioDifference).toFixed(2)} years {result.ratioDifference > 0 ? "more" : "less"}{" "}
                      income needed
                    </p>
                  </div>
                </div>

                {/* Insight Alert */}
                <Alert
                  className={`mt-6 ${
                    result.affordabilityChange === "less affordable"
                      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                      : result.affordabilityChange === "more affordable"
                        ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                        : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {result.affordabilityChange === "less affordable" ? (
                    <AlertTriangleIcon
                      className={`h-4 w-4 ${result.affordabilityChange === "less affordable" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    />
                  ) : (
                    <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <AlertDescription
                    className={
                      result.affordabilityChange === "less affordable"
                        ? "text-red-900 dark:text-red-100"
                        : result.affordabilityChange === "more affordable"
                          ? "text-green-900 dark:text-green-100"
                          : "text-blue-900 dark:text-blue-100"
                    }
                  >
                    <strong>Analysis {inflationAdjusted && "(Inflation-Adjusted)"}:</strong>{" "}
                    {result.affordabilityChange === "less affordable"
                      ? `Mortgage has become significantly less affordable. ${inflationAdjusted ? "In real terms, after accounting for inflation, " : ""}While incomes grew ${result.incomeDifference.toFixed(1)}%, home prices increased ${result.priceDifference.toFixed(1)}%, requiring ${Math.abs(result.ratioDifference).toFixed(1)} more years of income to purchase a home with a mortgage.`
                      : result.affordabilityChange === "more affordable"
                        ? `Mortgage has become more affordable. ${inflationAdjusted ? "In real terms, after accounting for inflation, " : ""}Income growth of ${result.incomeDifference.toFixed(1)}% has outpaced home price growth of ${result.priceDifference.toFixed(1)}%, reducing the years of income needed by ${Math.abs(result.ratioDifference).toFixed(1)}.`
                        : `Mortgage affordability has remained relatively stable between these periods, with similar price-to-income ratios.`}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Historical Timeline */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Historical Affordability Timeline</CardTitle>
                <CardDescription>Price-to-income ratios across decades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableYears
                    .slice()
                    .reverse()
                    .map((year) => {
                      const data = historicalData[year]
                      const status = getAffordabilityStatus(data.priceToIncomeRatio)
                      return (
                        <div
                          key={year}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                            year === currentYear || year === compareYear
                              ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-gray-900 dark:text-white w-16">{year}</span>
                            <div className={`w-3 h-3 rounded-full ${status.color}`} />
                            <Badge variant="outline" className={status.textColor}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Ratio</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {data.priceToIncomeRatio.toFixed(2)}x
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Home Price</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${(data.homePrice / 1000).toFixed(0)}k
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${(data.medianIncome / 1000).toFixed(0)}k
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Educational Content */}
        {essayContent && (
          <Card className="shadow-xl border-0 mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Understanding Mortgage Affordability</CardTitle>
              <CardDescription>Historical context and economic analysis</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <MarkdownRenderer content={essayContent} />
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <div className="mt-16 mb-8">
          <FAQ category="mortgage-affordability" />
        </div>

        {/* Cross-Promotion */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link
            href="/retirement-calculator"
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrendingUpIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Retirement Calculator</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plan your retirement with inflation-adjusted calculations
            </p>
          </Link>

          <Link
            href="/salary-calculator"
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSignIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Salary Calculator</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adjust your salary for inflation across different years
            </p>
          </Link>

          <Link
            href="/charts"
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrendingUpIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Charts & Analytics</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visualize inflation trends and economic data</p>
          </Link>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16 rounded-lg">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Mortgage Calculator</h3>
                <p className="text-gray-300 mb-6">
                  Compare mortgage costs across decades using real Case-Shiller and median income data.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Case-Shiller Home Price Index</li>
                  <li>• Federal Reserve Economic Data</li>
                  <li>• U.S. Census Bureau</li>
                  <li>• Bureau of Labor Statistics</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>
                    <Link href="/" className="hover:text-blue-400 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/deflation-calculator" className="hover:text-blue-400 transition-colors">
                      Deflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/charts" className="hover:text-blue-400 transition-colors">
                      Charts & Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/ppp-calculator" className="hover:text-blue-400 transition-colors">
                      PPP Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/salary-calculator" className="hover:text-blue-400 transition-colors">
                      Salary Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/retirement-calculator" className="hover:text-blue-400 transition-colors">
                      Retirement Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/student-loan-calculator" className="hover:text-blue-400 transition-colors">
                      Student Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/mortgage-calculator" className="hover:text-blue-400 transition-colors">
                      Mortgage Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/budget-calculator" className="hover:text-blue-400 transition-colors">
                      Budget Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/emergency-fund-calculator" className="hover:text-blue-400 transition-colors">
                      Emergency Fund Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/roi-calculator" className="hover:text-blue-400 transition-colors">
                      ROI Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/legacy-planner" className="hover:text-blue-400 transition-colors">
                      Legacy Planner
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-blue-400 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Global Inflation Calculator. Data for educational purposes.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
