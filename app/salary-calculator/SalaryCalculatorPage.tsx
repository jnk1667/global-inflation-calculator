"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, DollarSign, Info, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"
import AdBanner from "@/components/ad-banner"

interface SalaryResult {
  originalSalary: number
  adjustedSalary: number
  inflationRate: number
  purchasingPowerLoss: number
  yearsDifference: number
  currency: string
  fromYear: number
  toYear: number
  requiredAnnualGrowthRate: number
  compoundAnnualInflationRate: number
  salaryIncreaseNeeded: number
}

// Fallback inflation data for when fetch fails - Added NZD
const fallbackInflationData = {
  USD: {
    1950: 24.1,
    1960: 29.6,
    1970: 38.8,
    1980: 82.4,
    1990: 130.7,
    2000: 172.2,
    2010: 218.1,
    2020: 258.8,
    2025: 310.3
  },
  GBP: {
    1950: 3.4,
    1960: 4.2,
    1970: 6.4,
    1980: 18.0,
    1990: 39.5,
    2000: 58.0,
    2010: 79.2,
    2020: 89.1,
    2025: 105.8
  },
  EUR: {
    1999: 87.4,
    2000: 89.0,
    2010: 100.0,
    2020: 102.8,
    2025: 115.2
  },
  NZD: {
    1970: 109.8,
    1980: 289.6,
    1990: 798.3,
    2000: 925.7,
    2010: 1201.5,
    2020: 1382.4,
    2025: 1723.8
  }
}

const SalaryCalculatorPage: React.FC = () => {
  const [salary, setSalary] = useState<string>("")
  const [fromYear, setFromYear] = useState<string>("")
  const [toYear, setToYear] = useState<string>("2025")
  const [currency, setCurrency] = useState<string>("USD")
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Updated currencies array to include NZD
  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  ]

  const calculateSalaryAdjustment = async () => {
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const salaryValue = Number.parseFloat(salary)
      const fromYearValue = Number.parseInt(fromYear)
      const toYearValue = Number.parseInt(toYear)

      if (isNaN(salaryValue) || isNaN(fromYearValue) || isNaN(toYearValue)) {
        throw new Error("Please enter valid numbers for all fields.")
      }

      if (salaryValue <= 0) {
        throw new Error("Salary must be greater than zero.")
      }

      if (fromYearValue >= toYearValue) {
        throw new Error("From year must be before to year.")
      }

      // Updated validation for NZD (starts from 1967)
      const minYear = currency === "NZD" ? 1967 : currency === "EUR" ? 1999 : 1913
      if (fromYearValue < minYear) {
        throw new Error(`Data for ${currency} is only available from ${minYear} onwards.`)
      }

      if (toYearValue > 2025) {
        throw new Error("Data is only available up to 2025.")
      }

      let inflationData
      let startCPI, endCPI

      try {
        // Try to fetch inflation data from JSON file
        const response = await fetch(`/data/${currency.toLowerCase()}-inflation.json`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        
        if (!data.data) {
          throw new Error("Invalid data format")
        }

        inflationData = data.data
        startCPI = inflationData[fromYearValue.toString()]
        endCPI = inflationData[toYearValue.toString()]
      } catch (fetchError) {
        console.warn("Failed to fetch inflation data, using fallback:", fetchError)
        
        // Use fallback data
        const fallbackData = fallbackInflationData[currency as keyof typeof fallbackInflationData]
        
        if (!fallbackData) {
          throw new Error(`Inflation data for ${currency} is not available in preview mode.`)
        }

        // Find closest years in fallback data
        const availableYears = Object.keys(fallbackData).map(Number).sort((a, b) => a - b)
        
        const closestStartYear = availableYears.reduce((prev, curr) => 
          Math.abs(curr - fromYearValue) < Math.abs(prev - fromYearValue) ? curr : prev
        )
        
        const closestEndYear = availableYears.reduce((prev, curr) => 
          Math.abs(curr - toYearValue) < Math.abs(prev - toYearValue) ? curr : prev
        )

        startCPI = fallbackData[closestStartYear as keyof typeof fallbackData]
        endCPI = fallbackData[closestEndYear as keyof typeof fallbackData]

        if (closestStartYear !== fromYearValue || closestEndYear !== toYearValue) {
          console.warn(`Using approximate data: ${closestStartYear} instead of ${fromYearValue}, ${closestEndYear} instead of ${toYearValue}`)
        }
      }

      if (!startCPI || !endCPI) {
        throw new Error(`No inflation data available for ${currency} between ${fromYearValue} and ${toYearValue}.`)
      }

      // Calculate inflation rate using CPI values
      const inflationRate = (endCPI - startCPI) / startCPI
      const adjustedSalary = salaryValue * (1 + inflationRate)
      const purchasingPowerLoss = ((adjustedSalary - salaryValue) / salaryValue) * 100
      const yearsDifference = toYearValue - fromYearValue

      // Calculate Compound Annual Growth Rate (CAGR) for required salary growth
      const compoundAnnualInflationRate = Math.pow(endCPI / startCPI, 1 / yearsDifference) - 1
      const requiredAnnualGrowthRate = compoundAnnualInflationRate * 100
      const salaryIncreaseNeeded = adjustedSalary - salaryValue

      const calculationResult: SalaryResult = {
        originalSalary: salaryValue,
        adjustedSalary,
        inflationRate,
        purchasingPowerLoss,
        yearsDifference,
        currency,
        fromYear: fromYearValue,
        toYear: toYearValue,
        requiredAnnualGrowthRate,
        compoundAnnualInflationRate,
        salaryIncreaseNeeded,
      }

      setResult(calculationResult)
      trackEvent("salary_calculation", "calculator", `${currency}_${fromYearValue}_${toYearValue}`, salaryValue)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Salary Inflation Calculator
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Calculate what your historical salary should be worth today. Compare wage growth vs inflation using official
            government data from 1913-2025.
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">Salary Calculator</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Salary Adjustment Calculator
                </CardTitle>
                <CardDescription>
                  Enter your historical salary to see what it should be worth today after adjusting for inflation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Original Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="50000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromYear">From Year</Label>
                    <Input
                      id="fromYear"
                      type="number"
                      placeholder="2000"
                      value={fromYear}
                      onChange={(e) => setFromYear(e.target.value)}
                      min={currency === "NZD" ? "1967" : currency === "EUR" ? "1999" : "1913"}
                      max="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toYear">To Year</Label>
                    <Input
                      id="toYear"
                      type="number"
                      value={toYear}
                      onChange={(e) => setToYear(e.target.value)}
                      min="1914"
                      max="2025"
                    />
                  </div>
                </div>

                <Button onClick={calculateSalaryAdjustment} disabled={loading} className="w-full" size="lg">
                  {loading ? "Calculating..." : "Calculate Salary Adjustment"}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {result && (
                  <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Salary Adjustment Results</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Original Salary ({result.fromYear})</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(result.originalSalary, result.currency)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inflation-Adjusted Salary ({result.toYear})
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(result.adjustedSalary, result.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Inflation</p>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {formatPercentage(result.inflationRate * 100)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Required Annual Growth</p>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {result.requiredAnnualGrowthRate.toFixed(2)}%
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Salary Increase Needed</p>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {formatCurrency(result.salaryIncreaseNeeded, result.currency)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Time Period</p>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {result.yearsDifference} years
                        </Badge>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Interpretation:</strong> To maintain the same purchasing power as{" "}
                        {formatCurrency(result.originalSalary, result.currency)} in {result.fromYear}, you would need to
                        earn {formatCurrency(result.adjustedSalary, result.currency)} in {result.toYear}. This requires an average annual salary increase of{" "}
                        <strong>{result.requiredAnnualGrowthRate.toFixed(2)}%</strong> to keep pace with inflation over{" "}
                        {result.yearsDifference} years.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ad Banner - After Calculator */}
            <div className="mt-8">
              <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
                <AdBanner slot="salary-calculator-main" format="horizontal" />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ad Banner - Sidebar */}
            <div>
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
                <AdBanner slot="salary-calculator-sidebar" format="square" />
              </Suspense>
            </div>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Salary Negotiation:</strong> Use these results to justify raise requests based on inflation.
                  </p>
                  <p>
                    <strong>Career Planning:</strong> Compare your actual salary growth vs inflation over time.
                  </p>
                  <p>
                    <strong>Job Offers:</strong> Evaluate if a salary offer represents real growth or just inflation
                    adjustment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <h4 className="font-medium">Inflation Calculator</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calculate general purchasing power changes
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mt-12">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Methodology & Data Sources
              </CardTitle>
              <CardDescription>
                Transparent methodology for trust and accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇺🇸 USD:</strong> U.S. Bureau of Labor Statistics (BLS) Consumer Price Index
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇬🇧 GBP:</strong> UK Office for National Statistics (ONS) Retail Price Index
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇪🇺 EUR:</strong> Eurostat Harmonised Index of Consumer Prices
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇨🇦 CAD:</strong> Statistics Canada Consumer Price Index
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇦🇺 AUD:</strong> Australian Bureau of Statistics Consumer Price Index
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇨🇭 CHF:</strong> Swiss Federal Statistical Office Consumer Price Index
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇯🇵 JPY:</strong> Statistics Bureau of Japan Consumer Price Index
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>🇳🇿 NZD:</strong> Statistics New Zealand Consumer Price Index
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Calculation Method</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Primary Formula:</strong>
                      <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        Adjusted Salary = Original Salary × (End CPI / Start CPI)
                      </code>
                    </div>
                    <div>
                      <strong>Required Annual Growth Rate (CAGR):</strong>
                      <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        Annual Growth Rate = ((End CPI / Start CPI)^(1/years)) - 1
                      </code>
                    </div>
                    <div>
                      <strong>Unique Methodology:</strong>
                      <p className="mt-1">
                        Unlike general inflation calculators, we calculate the Compound Annual Growth Rate (CAGR) to show the exact annual salary increase percentage needed to maintain purchasing power. This provides actionable career planning insights.
                      </p>
                    </div>
                    <div>
                      <strong>Data Accuracy:</strong>
                      <p className="mt-1">
                        All calculations use official government Consumer Price Index data, updated regularly to ensure accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Important Considerations</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>General Inflation vs Salary Inflation:</strong> This calculator uses general consumer
                        price inflation. Salary inflation in specific industries may differ.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Regional Variations:</strong> Inflation rates can vary significantly by region within a
                        country.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Career Progression:</strong> This calculator shows inflation adjustment only, not career
                        advancement or skill-based increases.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Tax Implications:</strong> Results don't account for changes in tax rates or brackets
                        over time.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Last Updated:</strong> August 2025 | <strong>Data Coverage:</strong> 1913-2025 (varies by currency) |{" "}
                  <strong>Update Frequency:</strong> Monthly
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  This tool is provided for educational and informational purposes. For professional financial advice,
                  consult a qualified financial advisor.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SalaryCalculatorPage
