"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Car, DollarSign, TrendingUp, Fuel, InfoIcon, Calculator, PiggyBank } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"

interface LoanData {
  vehiclePrice: number
  downPayment: number
  tradeInValue: number
  amountOwed: number
  interestRate: number
  loanTerm: number
  salesTax: number
  otherFees: number
}

interface LoanResults {
  monthlyPayment: number
  totalLoanAmount: number
  totalInterest: number
  totalCost: number
  upfrontPayment: number
}

interface AdvancedResults {
  inflationAdjustedPrice: number
  realMonthlyPayment: number
  gasCosts: {
    year: number
    nominal: number
    inflationAdjusted: number
  }[]
  totalOwnershipCost: number
  carPriceInflation: {
    year: number
    price: number
  }[]
}

const CHART_COLORS = {
  principal: "#3b82f6",
  interest: "#ef4444",
  gas: "#10b981",
  inflation: "#8b5cf6",
}

export default function AutoLoanCalculatorPage() {
  const [advancedMode, setAdvancedMode] = useState(false)
  const [data, setData] = useState<LoanData>({
    vehiclePrice: 35000,
    downPayment: 7000,
    tradeInValue: 0,
    amountOwed: 0,
    interestRate: 6.5,
    loanTerm: 60,
    salesTax: 7,
    otherFees: 1500,
  })

  const [results, setResults] = useState<LoanResults | null>(null)
  const [advancedResults, setAdvancedResults] = useState<AdvancedResults | null>(null)
  const [loading, setLoading] = useState(false)

  // Advanced mode inputs
  const [milesPerYear, setMilesPerYear] = useState(12000)
  const [mpg, setMpg] = useState(25)
  const [currentGasPrice, setCurrentGasPrice] = useState(3.5)
  const [inflationRate, setInflationRate] = useState(3.0)

  // Dynamic essay content loaded from database
  const [essayContent, setEssayContent] = useState("")

  useEffect(() => {
    const loadEssayContent = async () => {
      try {
        const { data, error } = await supabase
          .from("seo_content")
          .select("content")
          .eq("id", "auto_loan_essay")
          .single()

        if (error) {
          console.error("Error loading auto loan essay content:", error)
          // Set default content if database fetch fails
          setEssayContent(`
# Understanding Auto Loans and Vehicle Affordability in 2025

Auto loans are one of the most common forms of consumer debt in America, with millions of people financing their vehicle purchases each year. Understanding how auto loans work and how inflation affects both car prices and ownership costs is crucial for making informed financial decisions.

## The True Cost of Vehicle Ownership

When calculating whether you can afford a car, the monthly payment is just the beginning. The true cost of ownership includes insurance, maintenance, fuel, registration, and depreciation. Our advanced calculator helps you understand these comprehensive costs, adjusted for inflation's impact over the life of your loan.

## How Inflation Impacts Auto Financing

Inflation affects auto loans in several ways. First, vehicle prices themselves have increased significantly due to inflation - new cars today cost 50%+ more than they did just five years ago. Second, fuel costs are highly volatile and tend to rise with inflation. Third, maintenance and insurance costs also increase over time.

## Making Smart Auto Loan Decisions

The key to affordable auto financing is finding the right balance between loan term, interest rate, and down payment. While longer loan terms reduce monthly payments, they result in paying significantly more interest over time. Similarly, a larger down payment reduces both your monthly payment and total interest costs.
          `)
          return
        }

        if (data?.content) {
          setEssayContent(data.content)
        } else {
          // Set default content if no content found
          setEssayContent(`
# Understanding Auto Loans and Vehicle Affordability in 2025

Auto loans are one of the most common forms of consumer debt in America, with millions of people financing their vehicle purchases each year. Understanding how auto loans work and how inflation affects both car prices and ownership costs is crucial for making informed financial decisions.

## The True Cost of Vehicle Ownership

When calculating whether you can afford a car, the monthly payment is just the beginning. The true cost of ownership includes insurance, maintenance, fuel, registration, and depreciation. Our advanced calculator helps you understand these comprehensive costs, adjusted for inflation's impact over the life of your loan.

## How Inflation Impacts Auto Financing

Inflation affects auto loans in several ways. First, vehicle prices themselves have increased significantly due to inflation - new cars today cost 50%+ more than they did just five years ago. Second, fuel costs are highly volatile and tend to rise with inflation. Third, maintenance and insurance costs also increase over time.

## Making Smart Auto Loan Decisions

The key to affordable auto financing is finding the right balance between loan term, interest rate, and down payment. While longer loan terms reduce monthly payments, they result in paying significantly more interest over time. Similarly, a larger down payment reduces both your monthly payment and total interest costs.
          `)
        }
      } catch (err) {
        console.error("Error loading auto loan essay content:", err)
        // Set default content on error
        setEssayContent(`
# Understanding Auto Loans and Vehicle Affordability in 2025

Auto loans are one of the most common forms of consumer debt in America, with millions of people financing their vehicle purchases each year. Understanding how auto loans work and how inflation affects both car prices and ownership costs is crucial for making informed financial decisions.

## The True Cost of Vehicle Ownership

When calculating whether you can afford a car, the monthly payment is just the beginning. The true cost of ownership includes insurance, maintenance, fuel, registration, and depreciation. Our advanced calculator helps you understand these comprehensive costs, adjusted for inflation's impact over the life of your loan.

## How Inflation Impacts Auto Financing

Inflation affects auto loans in several ways. First, vehicle prices themselves have increased significantly due to inflation - new cars today cost 50%+ more than they did just five years ago. Second, fuel costs are highly volatile and tend to rise with inflation. Third, maintenance and insurance costs also increase over time.

## Making Smart Auto Loan Decisions

The key to affordable auto financing is finding the right balance between loan term, interest rate, and down payment. While longer loan terms reduce monthly payments, they result in paying significantly more interest over time. Similarly, a larger down payment reduces both your monthly payment and total interest costs.
        `)
      }
    }

    loadEssayContent()
  }, [])

  const [pieData, setPieData] = useState([])

  useEffect(() => {
    if (results) {
      setPieData([
        { name: "Principal", value: results.totalLoanAmount, color: CHART_COLORS.principal },
        { name: "Interest", value: results.totalInterest, color: CHART_COLORS.interest },
      ])
    } else {
      setPieData([])
    }
  }, [results])

  // Calculate basic loan
  const calculateLoan = async () => {
    setLoading(true)

    try {
      // Calculate basic loan details
      const netTradeIn = data.tradeInValue - data.amountOwed
      const taxableAmount = data.vehiclePrice - netTradeIn
      const salesTaxAmount = (taxableAmount * data.salesTax) / 100
      const totalUpfront = data.downPayment + data.otherFees + salesTaxAmount - netTradeIn
      const loanAmount = data.vehiclePrice + salesTaxAmount + data.otherFees - data.downPayment - netTradeIn

      const monthlyRate = data.interestRate / 100 / 12
      const numPayments = data.loanTerm

      let monthlyPayment = 0
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / numPayments
      } else {
        monthlyPayment =
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
      }

      const totalInterest = monthlyPayment * numPayments - loanAmount
      const totalCost = data.vehiclePrice + salesTaxAmount + data.otherFees + totalInterest

      setResults({
        monthlyPayment,
        totalLoanAmount: loanAmount,
        totalInterest,
        totalCost,
        upfrontPayment: totalUpfront,
      })

      // Calculate advanced results if in advanced mode
      if (advancedMode) {
        const loanYears = data.loanTerm / 12

        // Calculate inflation-adjusted car price
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, loanYears)
        const futurePrice = data.vehiclePrice * inflationMultiplier
        const realMonthlyPayment = monthlyPayment / Math.pow(1 + inflationRate / 100, loanYears / 2)

        // Calculate gas costs over loan period
        const gasCosts = []
        const milesPerMonth = milesPerYear / 12
        const gallonsPerMonth = milesPerMonth / mpg
        const monthlyGasCost = gallonsPerMonth * currentGasPrice

        for (let year = 1; year <= loanYears; year++) {
          const gasInflationMultiplier = Math.pow(1 + inflationRate / 100, year)
          const nominalYearlyGas = monthlyGasCost * 12 * gasInflationMultiplier
          const realYearlyGas = monthlyGasCost * 12

          gasCosts.push({
            year,
            nominal: nominalYearlyGas,
            inflationAdjusted: realYearlyGas,
          })
        }

        // Calculate car price inflation trajectory
        const carPriceInflation = []
        const currentYear = new Date().getFullYear()
        for (let i = 0; i <= 10; i++) {
          const year = currentYear - 10 + i
          const priceMultiplier = Math.pow(1 + 0.04, i) // 4% annual car price inflation
          carPriceInflation.push({
            year,
            price: Math.round((data.vehiclePrice / Math.pow(1 + 0.04, 10)) * priceMultiplier),
          })
        }

        const totalGasCost = gasCosts.reduce((sum, year) => sum + year.nominal, 0)
        const totalOwnershipCost = totalCost + totalGasCost

        setAdvancedResults({
          inflationAdjustedPrice: futurePrice,
          realMonthlyPayment,
          gasCosts,
          totalOwnershipCost,
          carPriceInflation,
        })
      } else {
        setAdvancedResults(null)
      }
    } catch (error) {
      console.error("Error calculating loan:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculateLoan()
  }, [data, advancedMode, milesPerYear, mpg, currentGasPrice, inflationRate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-32 pb-16" style={{ contain: "layout style" }}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Car className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Auto Loan Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Calculate your monthly car payment and discover the true cost of ownership with inflation-adjusted analysis
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Auto Loan Calculator</span>
        </nav>

        {/* Mode Toggle */}
        <Card className="mb-8 border-l-4 border-l-blue-600 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <Label htmlFor="advanced-mode" className="text-base font-semibold cursor-pointer">
                    {advancedMode ? "Advanced Mode: Inflation Analysis Active" : "Basic Mode: Standard Loan Calculator"}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {advancedMode
                      ? "See car price inflation, gas costs, and true ownership costs"
                      : "Switch to advanced mode for comprehensive cost analysis"}
                  </p>
                </div>
              </div>
              <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} className="ml-4" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Loan Details
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Enter your vehicle and financing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehiclePrice">Vehicle Price ($)</Label>
                    <Input
                      id="vehiclePrice"
                      type="number"
                      value={data.vehiclePrice}
                      onChange={(e) => setData({ ...data, vehiclePrice: Number.parseFloat(e.target.value) || 0 })}
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Down Payment ($)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={data.downPayment}
                      onChange={(e) => setData({ ...data, downPayment: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={data.interestRate}
                      onChange={(e) => setData({ ...data, interestRate: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">Loan Term (months)</Label>
                    <Select
                      value={data.loanTerm.toString()}
                      onValueChange={(val) => setData({ ...data, loanTerm: Number.parseInt(val) })}
                    >
                      <SelectTrigger id="loanTerm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="36">36 months (3 years)</SelectItem>
                        <SelectItem value="48">48 months (4 years)</SelectItem>
                        <SelectItem value="60">60 months (5 years)</SelectItem>
                        <SelectItem value="72">72 months (6 years)</SelectItem>
                        <SelectItem value="84">84 months (7 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salesTax">Sales Tax (%)</Label>
                    <Input
                      id="salesTax"
                      type="number"
                      step="0.1"
                      value={data.salesTax}
                      onChange={(e) => setData({ ...data, salesTax: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherFees">Title/Registration/Fees ($)</Label>
                    <Input
                      id="otherFees"
                      type="number"
                      value={data.otherFees}
                      onChange={(e) => setData({ ...data, otherFees: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Trade-In (Optional)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tradeInValue">Trade-In Value ($)</Label>
                      <Input
                        id="tradeInValue"
                        type="number"
                        value={data.tradeInValue}
                        onChange={(e) => setData({ ...data, tradeInValue: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amountOwed">Amount Owed ($)</Label>
                      <Input
                        id="amountOwed"
                        type="number"
                        value={data.amountOwed}
                        onChange={(e) => setData({ ...data, amountOwed: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Mode Inputs */}
            {advancedMode && (
              <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Ownership Cost Factors
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Calculate comprehensive costs including fuel and inflation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="milesPerYear">Miles Driven/Year</Label>
                      <Input
                        id="milesPerYear"
                        type="number"
                        value={milesPerYear}
                        onChange={(e) => setMilesPerYear(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mpg">Fuel Economy (MPG)</Label>
                      <Input
                        id="mpg"
                        type="number"
                        value={mpg}
                        onChange={(e) => setMpg(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentGasPrice">Current Gas Price ($/gal)</Label>
                      <Input
                        id="currentGasPrice"
                        type="number"
                        step="0.01"
                        value={currentGasPrice}
                        onChange={(e) => setCurrentGasPrice(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inflationRate">Expected Inflation Rate (%)</Label>
                      <Input
                        id="inflationRate"
                        type="number"
                        step="0.1"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <InfoIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <AlertDescription className="text-purple-900 dark:text-purple-100 text-sm">
                      These factors help calculate the true cost of ownership including fuel expenses and inflation's
                      impact on your purchasing power
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Basic Results */}
            <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Payment Summary
                </CardTitle>
                <CardDescription>Your loan breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {results ? (
                  <>
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Monthly Payment</p>
                      <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                        ${results.monthlyPayment.toFixed(2)}
                      </p>
                      <Badge className="mt-3" variant="secondary">
                        {data.loanTerm} month term
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Loan Amount</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          ${results.totalLoanAmount.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Interest</p>
                        <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                          ${results.totalInterest.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Upfront Payment</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          ${results.upfrontPayment.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Cost</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          ${results.totalCost.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                        Principal vs Interest
                      </p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={(entry) => entry.name}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `$${value.toFixed(0)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-12">
                    <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Enter loan details to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advanced Results */}
            {advancedMode && advancedResults && results && (
              <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    True Ownership Cost Analysis
                  </CardTitle>
                  <CardDescription>Inflation-adjusted costs and comprehensive analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <InfoIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-900 dark:text-green-100">
                      <strong>Good News:</strong> Inflation works in your favor! Your fixed monthly payment will feel
                      lighter over time as your income grows with inflation.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Real Monthly Payment</p>
                      <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                        ${advancedResults.realMonthlyPayment.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">In today's dollars</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Ownership Cost</p>
                      <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                        ${advancedResults.totalOwnershipCost.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Loan + fuel costs</p>
                    </div>
                  </div>

                  {/* Car Price Inflation Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Car Price Inflation (10-Year Trend)
                    </p>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={advancedResults.carPriceInflation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: "12px" }} />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: "12px" }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip formatter={(value: any) => `$${value.toFixed(0)}`} />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={CHART_COLORS.inflation}
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Historical trend shows ~4% annual car price inflation
                    </p>
                  </div>

                  {/* Gas Cost Projection */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Fuel Cost Projection</p>
                    <div className="space-y-2">
                      {advancedResults.gasCosts.slice(0, Math.min(5, advancedResults.gasCosts.length)).map((year) => (
                        <div
                          key={year.year}
                          className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400">Year {year.year}</span>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              ${year.nominal.toFixed(0)}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              ${year.inflationAdjusted.toFixed(0)} real
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        <strong>Total Fuel Cost:</strong> $
                        {advancedResults.gasCosts.reduce((sum, y) => sum + y.nominal, 0).toFixed(0)} over loan term (
                        {milesPerYear.toLocaleString()} miles/year at {mpg} MPG)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Key Insights Alert */}
        <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> A larger down payment reduces both your monthly payment and total interest paid. Aim
            for at least 20% down to avoid being underwater on your loan. Consider the trade-off between loan term
            length (lower monthly payments) and total interest cost.
          </AlertDescription>
        </Alert>

        {/* Essay Content */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Understanding Auto Loans and Vehicle Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={essayContent} />
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <FAQ category="auto-loan" />
        </div>

        {/* Footer Section */}
        <footer className="mt-12 bg-slate-900 text-white rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-3 gap-8 p-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">Auto Loan Calculator</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Calculate your monthly car payment and discover the true cost of ownership with inflation-adjusted
                analysis. Track vehicle price trends and gas price impacts from 1913 to 2025.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Federal Reserve Economic Data (FRED)</li>
                <li>• Bureau of Labor Statistics (BLS)</li>
                <li>• Energy Information Administration (EIA)</li>
                <li>• Consumer Price Index Records</li>
                <li>• Historical Vehicle Price Data</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    Home - Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/deflation-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="text-slate-300 hover:text-white transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/ppp-calculator" className="text-slate-300 hover:text-white transition-colors">
                    PPP Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/auto-loan-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Auto Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/salary-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/retirement-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/student-loan-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Student Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/mortgage-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Mortgage Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Budget Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-fund-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Emergency Fund Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/roi-calculator" className="text-slate-300 hover:text-white transition-colors">
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/legacy-planner" className="text-slate-300 hover:text-white transition-colors">
                    Legacy Planner
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 px-8 py-6 text-center">
            <p className="text-sm text-slate-400">© 2025 Global Inflation Calculator. Educational purposes only.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
