"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import Link from "next/link"
import { loadCurrencyMeasuresWithFallback } from "@/lib/data-loader"
import { calculateConsensusInflation } from "@/lib/inflation-measures"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import FAQ from "@/components/faq"

interface SalaryData {
  [key: string]: {
    code: string
    title: string
    annualMeanWage: number
    hourlyMeanWage: number
    employmentLevel: number
  }
}

interface EarningsData {
  [key: string]: {
    cipCode: string
    title: string
    medianEarnings: number
    percentile25: number
    percentile75: number
    sampleSize: number
  }
}

interface BlogContent {
  title: string
  content: string
  methodology: string
}

export default function StudentLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState("30000")
  const [interestRate, setInterestRate] = useState("5.5")
  const [loanTerm, setLoanTerm] = useState("10")
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null)
  const [totalInterest, setTotalInterest] = useState<number | null>(null)
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null)
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  const [advancedMode, setAdvancedMode] = useState(false)
  const [inflationAdjustedTotal, setInflationAdjustedTotal] = useState<number | null>(null)
  const [realBurden, setRealBurden] = useState<Array<{ year: number; nominal: number; real: number }> | null>(null)
  const [inflationRate, setInflationRate] = useState<number | null>(null)
  const [loadingInflation, setLoadingInflation] = useState(false)
  const [inflationData, setInflationData] = useState<{ [year: string]: number } | null>(null)
  const [blogContent, setBlogContent] = useState<BlogContent | null>(null)
  const [loadingBlog, setLoadingBlog] = useState(true)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [salariesRes, earningsRes, inflationRes, blogRes] = await Promise.all([
          fetch("/data/student-loans/salaries-by-occupation.json"),
          fetch("/data/student-loans/earnings-by-major.json"),
          fetch("/data/usd-inflation.json"),
          fetch("/api/student-loan-blog"),
        ])

        const salaries = await salariesRes.json()
        const earnings = await earningsRes.json()
        const inflation = await inflationRes.json()
        const blog = await blogRes.json()

        setSalaryData(salaries)
        setEarningsData(earnings)
        setInflationData(inflation.data)

        if (blog.success && blog.data) {
          setBlogContent(blog.data)
        }
      } catch (error) {
        console.error("Error loading student loan data:", error)
      } finally {
        setLoading(false)
        setLoadingBlog(false)
      }
    }

    loadData()
  }, [])

  const calculateLoan = async () => {
    const principal = Number.parseFloat(loanAmount)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const payments = Number.parseFloat(loanTerm) * 12

    if (principal && rate && payments) {
      const monthly = (principal * rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1)
      const total = monthly * payments
      const interest = total - principal

      setMonthlyPayment(monthly)
      setTotalInterest(interest)

      if (advancedMode) {
        setLoadingInflation(true)
        try {
          // Load USD inflation data
          const { measures } = await loadCurrencyMeasuresWithFallback("USD")

          // Get current year and calculate future year
          const currentYear = new Date().getFullYear()
          const futureYear = currentYear + Number.parseInt(loanTerm)

          // Calculate consensus inflation projection
          const inflationResult = calculateConsensusInflation(
            measures,
            "USD",
            currentYear - 10, // Use last 10 years for projection
            currentYear,
            100, // Base amount for rate calculation
          )

          const avgInflationRate = inflationResult.consensusAnnualAverage / 100
          setInflationRate(avgInflationRate)

          // Calculate year-by-year real burden
          const burdenData: Array<{ year: number; nominal: number; real: number }> = []
          let inflationAdjustedSum = 0

          for (let year = 1; year <= Number.parseInt(loanTerm); year++) {
            const nominalAnnualPayment = monthly * 12
            const inflationFactor = Math.pow(1 + avgInflationRate, year)
            const realAnnualPayment = nominalAnnualPayment / inflationFactor

            burdenData.push({
              year,
              nominal: nominalAnnualPayment,
              real: realAnnualPayment,
            })

            inflationAdjustedSum += realAnnualPayment
          }

          setRealBurden(burdenData)
          setInflationAdjustedTotal(inflationAdjustedSum)
        } catch (error) {
          console.error("Error calculating inflation adjustment:", error)
        } finally {
          setLoadingInflation(false)
        }
      } else {
        setInflationAdjustedTotal(null)
        setRealBurden(null)
        setInflationRate(null)
      }
    }
  }

  const calculateInflationAdjusted = (currentValue: number, yearsAgo: number) => {
    if (!inflationData) return null

    const currentYear = 2024 // BLS data is from 2024
    const pastYear = currentYear - yearsAgo
    const currentInflation = inflationData[currentYear.toString()]
    const pastInflation = inflationData[pastYear.toString()]

    if (!currentInflation || !pastInflation) return null

    // Calculate what the current salary would be worth in past year dollars
    const adjustedValue = currentValue * (pastInflation / currentInflation)
    return adjustedValue
  }

  const calculateRealWageGrowth = (currentValue: number, yearsAgo: number) => {
    if (!inflationData) return null

    const currentYear = 2024
    const pastYear = currentYear - yearsAgo
    const currentInflation = inflationData[currentYear.toString()]
    const pastInflation = inflationData[pastYear.toString()]

    if (!currentInflation || !pastInflation) return null

    // Assume nominal wage grew at 3% annually (conservative estimate)
    const nominalGrowthRate = 0.03
    const pastNominalValue = currentValue / Math.pow(1 + nominalGrowthRate, yearsAgo)

    // Adjust past value to current dollars
    const pastValueInCurrentDollars = pastNominalValue * (currentInflation / pastInflation)

    // Calculate real growth percentage
    const realGrowth = ((currentValue - pastValueInCurrentDollars) / pastValueInCurrentDollars) * 100
    return realGrowth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 pt-32 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Student Loan Calculator</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Calculate your monthly payments, total interest costs, and compare repayment options with real salary data
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="salaries">Salaries</TabsTrigger>
            <TabsTrigger value="majors">By Major</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                  <CardDescription>Enter your student loan information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="30000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="5.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">Loan Term (years)</Label>
                    <Select value={loanTerm} onValueChange={setLoanTerm}>
                      <SelectTrigger id="loanTerm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="15">15 years</SelectItem>
                        <SelectItem value="20">20 years</SelectItem>
                        <SelectItem value="25">25 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <Label htmlFor="advancedMode" className="font-semibold text-blue-900 dark:text-blue-100">
                          Advanced Mode
                        </Label>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Adjust for inflation using real data</p>
                      </div>
                    </div>
                    <Switch id="advancedMode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
                  </div>

                  <Button onClick={calculateLoan} className="w-full" size="lg" disabled={loadingInflation}>
                    {loadingInflation ? "Calculating..." : "Calculate Payment"}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Card */}
              <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Your estimated loan costs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {monthlyPayment !== null ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                          ${monthlyPayment.toFixed(2)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          ${totalInterest?.toFixed(2)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount Paid (Nominal)</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          ${(monthlyPayment * Number.parseFloat(loanTerm) * 12).toFixed(2)}
                        </p>
                      </div>

                      {advancedMode && inflationAdjustedTotal !== null && inflationRate !== null && (
                        <>
                          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                              <TrendingDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <AlertDescription className="text-green-900 dark:text-green-100">
                                <strong>Good News:</strong> Inflation works in your favor! Your loan payments will feel
                                lighter over time.
                              </AlertDescription>
                            </Alert>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Real Cost (Today's Dollars)</p>
                            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                              ${inflationAdjustedTotal.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Adjusted for {(inflationRate * 100).toFixed(2)}% annual inflation
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Inflation Savings</p>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                              ${(monthlyPayment * Number.parseFloat(loanTerm) * 12 - inflationAdjustedTotal).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              You effectively pay less due to inflation
                            </p>
                          </div>

                          <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                            <TrendingUpIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-900 dark:text-amber-100">
                              <strong>The Trade-off:</strong> While inflation reduces your real loan burden, it also
                              erodes your purchasing power and savings.
                            </AlertDescription>
                          </Alert>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        Enter your loan details and click Calculate to see your payment summary
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {advancedMode && realBurden && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Year-by-Year Real Burden</CardTitle>
                  <CardDescription>
                    How inflation affects your loan payments over time (in today's dollars)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realBurden.map((yearData) => (
                      <div
                        key={yearData.year}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">Year {yearData.year}</span>
                        <div className="flex gap-6 items-center">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nominal</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${yearData.nominal.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Real Value</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              ${yearData.real.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Savings</p>
                            <p className="font-semibold text-blue-600 dark:text-blue-400">
                              ${(yearData.nominal - yearData.real).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Federal Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Direct Subsidized and Unsubsidized loans with fixed interest rates and flexible repayment options
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Private Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bank and credit union loans with variable or fixed rates based on creditworthiness
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Repayment Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Standard, graduated, extended, and income-driven repayment options available
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="salaries" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Salaries by Occupation</CardTitle>
                <CardDescription>Real salary data from Bureau of Labor Statistics (May 2024 OEWS)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading salary data...</p>
                ) : salaryData ? (
                  <div className="space-y-4">
                    {Object.values(salaryData).map((occupation) => {
                      const valueIn2013 = calculateInflationAdjusted(occupation.annualMeanWage, 10)
                      const realGrowth = calculateRealWageGrowth(occupation.annualMeanWage, 10)

                      return (
                        <div
                          key={occupation.code}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{occupation.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {occupation.employmentLevel.toLocaleString()} employed
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                ${occupation.annualMeanWage.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ${occupation.hourlyMeanWage.toFixed(2)}/hr
                              </p>
                            </div>
                          </div>

                          {valueIn2013 && realGrowth !== null && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                                    Purchasing Power (2014)
                                  </p>
                                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                    ${valueIn2013.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    What this salary was worth 10 years ago
                                  </p>
                                </div>
                                <div
                                  className={`p-3 rounded-lg ${
                                    realGrowth >= 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                                  }`}
                                >
                                  <p
                                    className={`text-xs mb-1 ${
                                      realGrowth >= 0
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-red-700 dark:text-red-300"
                                    }`}
                                  >
                                    Real Wage Growth (10yr)
                                  </p>
                                  <p
                                    className={`text-lg font-semibold flex items-center gap-1 ${
                                      realGrowth >= 0
                                        ? "text-green-900 dark:text-green-100"
                                        : "text-red-900 dark:text-red-100"
                                    }`}
                                  >
                                    {realGrowth >= 0 ? (
                                      <TrendingUpIcon className="h-4 w-4" />
                                    ) : (
                                      <TrendingDownIcon className="h-4 w-4" />
                                    )}
                                    {realGrowth >= 0 ? "+" : ""}
                                    {realGrowth.toFixed(1)}%
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      realGrowth >= 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {realGrowth >= 0 ? "Beating inflation" : "Losing to inflation"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-red-500 py-8">Failed to load salary data</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="majors" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Earnings by Major</CardTitle>
                <CardDescription>Median earnings data from College Scorecard (2024)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading earnings data...</p>
                ) : earningsData ? (
                  <div className="space-y-4">
                    {Object.values(earningsData).map((major) => {
                      const valueIn2013 = calculateInflationAdjusted(major.medianEarnings, 10)
                      const realGrowth = calculateRealWageGrowth(major.medianEarnings, 10)

                      return (
                        <div
                          key={major.cipCode}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{major.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sample size: {major.sampleSize.toLocaleString()} graduates
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${major.medianEarnings.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Median</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600 dark:text-gray-400">
                              25th: ${major.percentile25.toLocaleString()}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              75th: ${major.percentile75.toLocaleString()}
                            </span>
                          </div>

                          {valueIn2013 && realGrowth !== null && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                                  <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                                    Purchasing Power (2014)
                                  </p>
                                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                    ${valueIn2013.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    What graduates earned 10 years ago
                                  </p>
                                </div>
                                <div
                                  className={`p-3 rounded-lg ${
                                    realGrowth >= 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                                  }`}
                                >
                                  <p
                                    className={`text-xs mb-1 ${
                                      realGrowth >= 0
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-red-700 dark:text-red-300"
                                    }`}
                                  >
                                    Real Earnings Growth (10yr)
                                  </p>
                                  <p
                                    className={`text-lg font-semibold flex items-center gap-1 ${
                                      realGrowth >= 0
                                        ? "text-green-900 dark:text-green-100"
                                        : "text-red-900 dark:text-red-100"
                                    }`}
                                  >
                                    {realGrowth >= 0 ? (
                                      <TrendingUpIcon className="h-4 w-4" />
                                    ) : (
                                      <TrendingDownIcon className="h-4 w-4" />
                                    )}
                                    {realGrowth >= 0 ? "+" : ""}
                                    {realGrowth.toFixed(1)}%
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      realGrowth >= 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {realGrowth >= 0 ? "Outpacing inflation" : "Lagging inflation"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-red-500 py-8">Failed to load earnings data</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Blog Section */}
        {!loadingBlog && blogContent && (
          <div className="mt-16 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">{blogContent.title}</CardTitle>
                <CardDescription>
                  A comprehensive guide to understanding student loans and how inflation affects your repayment
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                <MarkdownRenderer content={blogContent.content} className="text-gray-700 dark:text-gray-300" />
              </CardContent>
            </Card>

            {/* Methodology Section */}
            <Card className="shadow-lg bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <InfoIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Our Methodology
                </CardTitle>
                <CardDescription>How we calculate your student loan payments and projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <MarkdownRenderer content={blogContent.methodology} className="text-gray-700 dark:text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 mb-8">
          <FAQ category="student-loan" />
        </div>

        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Student Loan Calculator</h3>
                <p className="text-gray-300 mb-6">
                  Calculate student loan payments with real salary data from BLS and College Scorecard.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Bureau of Labor Statistics (BLS)</li>
                  <li>• College Scorecard API</li>
                  <li>• Federal Student Aid</li>
                  <li>• HHS Poverty Guidelines</li>
                  <li>• IRS Tax Brackets</li>
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
                    <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-blue-400 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Global Inflation Calculator. Educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
