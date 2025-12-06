"use client"

import type React from "react"
import { useState, Suspense, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Shield,
  Clock,
  Target,
} from "lucide-react"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"
import AdBanner from "@/components/ad-banner"
import ErrorBoundary from "@/components/error-boundary"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import FAQ from "@/components/faq"
import { treasuryData } from "@/lib/treasury-data"

interface EmergencyFundResult {
  targetAmount: number
  currentSavings: number
  savingsGap: number
  monthsToGoal: number
  recommendedMonthly: number
  inflationAdjustedTarget: number
  purchasingPowerLoss: number
  currency: string
  monthsOfCoverage: number
  riskLevel: "low" | "medium" | "high"
  category: string
}

const EmergencyFundCalculatorPage: React.FC = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("")
  const [currentSavings, setCurrentSavings] = useState<string>("")
  const [monthlyIncome, setMonthlyIncome] = useState<string>("")
  const [monthlySavingsCapacity, setMonthlySavingsCapacity] = useState<string>("")
  const [monthsOfCoverage, setMonthsOfCoverage] = useState<string>("6")
  const [dependents, setDependents] = useState<string>("0")
  const [employmentStatus, setEmploymentStatus] = useState<string>("stable")
  const [currency, setCurrency] = useState<string>("USD")
  const [result, setResult] = useState<EmergencyFundResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [essayContent, setEssayContent] = useState<string>("")
  const [inflationData, setInflationData] = useState<any>(null)
  const [currentTreasuryRates, setCurrentTreasuryRates] = useState<any>(null)

  const currencies = [
    { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar", inflationRate: 3.0 },
    { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound", inflationRate: 3.8 },
    { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro", inflationRate: 2.1 },
    { code: "CAD", symbol: "C$", flag: "🇨🇦", name: "Canadian Dollar", inflationRate: 2.8 },
    { code: "AUD", symbol: "A$", flag: "🇦🇺", name: "Australian Dollar", inflationRate: 3.2 },
    { code: "CHF", symbol: "CHF", flag: "🇨🇭", name: "Swiss Franc", inflationRate: 1.7 },
    { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "Japanese Yen", inflationRate: 2.5 },
    { code: "NZD", symbol: "NZ$", flag: "🇳🇿", name: "New Zealand Dollar", inflationRate: 3.3 },
  ]

  const selectedCurrency = currencies.find((c) => c.code === currency) || currencies[0]

  const formatCurrency = (amount: number, currencyCode: string) => {
    const curr = currencies.find((c) => c.code === currencyCode) || currencies[0]
    return `${curr.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  useEffect(() => {
    try {
      const latestYear = treasuryData.latest_year
      const latestData = treasuryData.data[latestYear]
      const savingsBondsI = treasuryData.savings_bonds.series_i.data[latestYear]

      setCurrentTreasuryRates({
        highYieldSavings: latestData.treasury_bills_3m, // HYSA rates track 3-month T-Bills
        iBonds: savingsBondsI.composite_rate,
        moneyMarket: latestData.treasury_bills_6m,
        year: latestYear,
      })
    } catch (error) {
      console.error("Error loading Treasury rates:", error)
    }
  }, [])

  useEffect(() => {
    const essayText = `## Why Emergency Funds Are Critical in 2025

In today's economic climate, building an emergency fund is more important than ever. With recession concerns, rising inflation, and economic uncertainty, having 3-6 months of expenses saved can be the difference between financial stability and crisis.

### The 2025 Economic Landscape

Recent data shows that less than 50% of Americans have enough emergency savings to cover three months of expenses. Even more concerning, 33% of U.S. adults have more credit card debt than emergency savings. This leaves millions of families vulnerable to financial shocks.

### How Much Do You Really Need?

The traditional rule of thumb suggests 3-6 months of expenses, but the right amount depends on your situation:

**3 Months Coverage:** Suitable for dual-income households with stable employment and minimal debt.

**6 Months Coverage:** Recommended for single-income households, freelancers, or those with dependents.

**9-12 Months Coverage:** Advisable for self-employed individuals, those in volatile industries, or families with special medical needs.

### Inflation's Impact on Emergency Funds

One critical factor often overlooked is inflation. At the current rate of 3% annual inflation, the purchasing power of your emergency fund decreases each year. A $10,000 emergency fund today will only have the purchasing power of $9,700 next year.

This is why our calculator includes inflation adjustments - to help you understand how much you need to save not just for today, but to maintain real purchasing power over time.

### Where to Keep Your Emergency Fund

Your emergency fund should be:
- **Liquid:** Accessible within 24-48 hours
- **Safe:** FDIC-insured savings accounts or money market accounts
- **Separate:** In a different account from your checking to avoid temptation

${currentTreasuryRates ? `High-yield savings accounts currently offer around ${currentTreasuryRates.highYieldSavings.toFixed(2)}% interest rates (tracking the 3-month Treasury rate of ${currentTreasuryRates.highYieldSavings}%), while Treasury I-Bonds offer ${currentTreasuryRates.iBonds.toFixed(2)}% with inflation protection. These rates help your emergency fund grow while remaining accessible.` : "High-yield savings accounts currently offer 4-5% interest rates, helping your emergency fund grow while remaining accessible."}

### Building Your Fund: A Practical Timeline

The key to building an emergency fund is consistency, not speed. Even small, regular contributions add up:

• **$100/month** builds to $3,600 in 3 years
• **$200/month** builds to $7,200 in 3 years
• **$500/month** builds to $18,000 in 3 years

### The Peace of Mind Factor

Beyond the numbers, emergency funds provide psychological benefits. Financial stress is one of the leading causes of anxiety and health problems. Knowing you have a buffer against unexpected expenses reduces stress and improves overall well-being.

Studies show that people with emergency funds report:
- 40% less financial anxiety
- Better sleep quality
- Improved job performance
- Healthier relationships

### Getting Started Today

If you don't have an emergency fund, start small:
1. Set an initial goal of $1,000
2. Automate savings transfers each payday
3. Gradually increase contributions as income grows
4. Reassess and adjust your target annually

Remember: Some emergency fund is always better than no emergency fund. Start where you are, use what you have, do what you can.`

    setEssayContent(essayText)
  }, [])

  const calculateEmergencyFund = () => {
    try {
      setLoading(true)
      setError(null)

      const expenses = Number.parseFloat(monthlyExpenses)
      const savings = Number.parseFloat(currentSavings)
      const months = Number.parseFloat(monthsOfCoverage)
      const savingsCapacity = Number.parseFloat(monthlySavingsCapacity)

      if (isNaN(expenses) || expenses <= 0) {
        setError("Please enter valid monthly expenses")
        setLoading(false)
        return
      }

      if (isNaN(months) || months < 1 || months > 12) {
        setError("Months of coverage must be between 1 and 12")
        setLoading(false)
        return
      }

      const targetAmount = expenses * months
      const inflationRate = selectedCurrency.inflationRate / 100
      const inflationAdjustedTarget = targetAmount * Math.pow(1 + inflationRate, 5)
      const savingsGap = Math.max(0, targetAmount - (savings || 0))
      let monthsToGoal = 0
      if (savingsGap > 0 && savingsCapacity > 0) {
        monthsToGoal = Math.ceil(savingsGap / savingsCapacity)
      }
      const recommendedMonthly = savingsGap > 0 ? Math.ceil(savingsGap / 36) : 0
      let riskLevel: "low" | "medium" | "high" = "low"
      const currentMonths = savings / expenses
      if (currentMonths < 1) {
        riskLevel = "high"
      } else if (currentMonths < 3) {
        riskLevel = "medium"
      }
      const purchasingPowerLoss = ((inflationAdjustedTarget - targetAmount) / targetAmount) * 100

      const result: EmergencyFundResult = {
        targetAmount,
        currentSavings: savings || 0,
        savingsGap,
        monthsToGoal,
        recommendedMonthly,
        inflationAdjustedTarget,
        purchasingPowerLoss,
        currency,
        monthsOfCoverage: months,
        riskLevel,
        category: employmentStatus,
      }

      setResult(result)

      trackEvent("emergency_fund_calculated", {
        currency,
        target_amount: targetAmount,
        months_coverage: months,
      })
    } catch (err) {
      console.error("Calculation error:", err)
      setError("An error occurred during calculation. Please check your inputs.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full mb-4">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Protect Your Financial Future</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Emergency Fund Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Calculate how much you need to save for 3-6 months of expenses. Build financial security with
              inflation-adjusted emergency savings planning.
            </p>
          </div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
              <AdBanner slot="emergency-fund-top" format="horizontal" />
            </Suspense>
          </div>

          {currentTreasuryRates && (
            <Card className="shadow-lg border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Current Safe Savings Rates (As of {currentTreasuryRates.year})
                </CardTitle>
                <CardDescription>
                  Based on U.S. Treasury data - these are safe, government-backed options for your emergency fund
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">High-Yield Savings</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {currentTreasuryRates.highYieldSavings.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">FDIC-insured, instant access</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Treasury I-Bonds</h4>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">{currentTreasuryRates.iBonds.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Inflation-protected, 1-year lock</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Money Market</h4>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{currentTreasuryRates.moneyMarket.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Check-writing, FDIC-insured</p>
                  </div>
                </div>
                <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Pro Tip:</strong> High-yield savings rates typically track the 3-month Treasury Bill rate.
                    When the Federal Reserve changes rates, HYSA rates follow within 1-2 months.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="h-6 w-6 text-blue-600" />
                Calculate Your Emergency Fund
              </CardTitle>
              <CardDescription>
                Enter your monthly expenses and savings capacity to determine your emergency fund target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.flag} {curr.name} ({curr.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthsOfCoverage">Target Months of Coverage</Label>
                  <Select value={monthsOfCoverage} onValueChange={setMonthsOfCoverage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months (Minimum)</SelectItem>
                      <SelectItem value="6">6 Months (Recommended)</SelectItem>
                      <SelectItem value="9">9 Months (Conservative)</SelectItem>
                      <SelectItem value="12">12 Months (Maximum Security)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Total Monthly Expenses *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      placeholder="5000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Include rent, utilities, food, insurance, debt payments</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentSavings">Current Emergency Savings</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="currentSavings"
                      type="number"
                      placeholder="2000"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500">How much you currently have saved for emergencies</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlySavingsCapacity">Monthly Savings Capacity</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="monthlySavingsCapacity"
                      type="number"
                      placeholder="500"
                      value={monthlySavingsCapacity}
                      onChange={(e) => setMonthlySavingsCapacity(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500">How much you can save each month</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Situation</Label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stable">Stable Full-Time</SelectItem>
                      <SelectItem value="contract">Contract/Freelance</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="variable">Variable Income</SelectItem>
                      <SelectItem value="dual-income">Dual Income Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Select value={dependents} onValueChange={setDependents}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Just me</SelectItem>
                    <SelectItem value="1">1 Dependent</SelectItem>
                    <SelectItem value="2">2 Dependents</SelectItem>
                    <SelectItem value="3">3 Dependents</SelectItem>
                    <SelectItem value="4">4+ Dependents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={calculateEmergencyFund} className="w-full" size="lg" disabled={loading}>
                {loading ? "Calculating..." : "Calculate Emergency Fund"}
              </Button>

              {result && (
                <div className="mt-8 space-y-6">
                  <Separator />

                  <Alert
                    className={
                      result.riskLevel === "high"
                        ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                        : result.riskLevel === "medium"
                          ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                          : "border-green-200 bg-green-50 dark:bg-green-900/20"
                    }
                  >
                    <Shield
                      className={`h-4 w-4 ${
                        result.riskLevel === "high"
                          ? "text-red-600"
                          : result.riskLevel === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    />
                    <AlertDescription>
                      <strong>Risk Level: {result.riskLevel.toUpperCase()}</strong>
                      <p className="text-sm mt-1">
                        {result.riskLevel === "high" &&
                          "You currently have less than 1 month of expenses saved. This leaves you vulnerable to financial emergencies."}
                        {result.riskLevel === "medium" &&
                          "You have 1-3 months of expenses saved. Consider building this up to 6 months for better security."}
                        {result.riskLevel === "low" &&
                          "Great job! You have adequate emergency savings. Continue maintaining this safety net."}
                      </p>
                    </AlertDescription>
                  </Alert>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Target Amount</h4>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(result.targetAmount, currency)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {result.monthsOfCoverage} months of expenses
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Savings Gap</h4>
                      <p className="text-3xl font-bold text-amber-600">{formatCurrency(result.savingsGap, currency)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Amount needed to reach goal</p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Time to Goal</h4>
                      <p className="text-3xl font-bold text-green-600">
                        {result.monthsToGoal > 0 ? `${result.monthsToGoal} mo` : "Complete!"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        At {formatCurrency(Number.parseFloat(monthlySavingsCapacity), currency)}/month
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Progress to Goal</Label>
                      <Badge variant="secondary">
                        {((result.currentSavings / result.targetAmount) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (result.currentSavings / result.targetAmount) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Inflation Impact:</strong> Due to {selectedCurrency.inflationRate}% annual inflation, in 5
                      years you'll need {formatCurrency(result.inflationAdjustedTarget, currency)} to have the same
                      purchasing power as {formatCurrency(result.targetAmount, currency)} today. That's a{" "}
                      {result.purchasingPowerLoss.toFixed(1)}% increase needed to maintain real value.
                    </AlertDescription>
                  </Alert>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-purple-900 dark:text-purple-100">Your Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Immediate Goal:</strong> Save {formatCurrency(result.recommendedMonthly, currency)}{" "}
                          per month to reach your target in 3 years
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Best Accounts:</strong> Use high-yield savings accounts (4-5% APY) to earn interest
                          while keeping funds accessible
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Automation:</strong> Set up automatic transfers on payday to build your fund
                          consistently
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Review Schedule:</strong> Reassess your emergency fund needs every 6 months as your
                          expenses change
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-8">
            <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
              <AdBanner slot="emergency-fund-middle" format="horizontal" />
            </Suspense>
          </div>

          <div className="mb-12">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Understanding Emergency Funds
                </CardTitle>
                <CardDescription>Why emergency funds matter in 2025 and how to build yours effectively</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                <MarkdownRenderer content={essayContent} />
              </CardContent>
            </Card>
          </div>

          <div className="mb-12">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Methodology & Data Sources
                </CardTitle>
                <CardDescription>How we calculate your emergency fund needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Calculation Method</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Target Amount Formula:</strong>
                        <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          Target = Monthly Expenses × Months of Coverage
                        </code>
                      </div>
                      <div>
                        <strong>Inflation Adjustment (5-year projection):</strong>
                        <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          Adjusted Target = Target × (1 + Inflation Rate)^5
                        </code>
                      </div>
                      <div>
                        <strong>Savings Timeline:</strong>
                        <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          Months to Goal = Savings Gap / Monthly Savings Capacity
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Inflation Data:</strong> Official CPI data from central banks and statistical offices
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Economic Indicators:</strong> Current 2025 recession preparation data from Federal
                          Reserve and BLS
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Recommendations:</strong> Based on financial planning best practices and consumer
                          research
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Important Considerations</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Personal Circumstances:</strong> Adjust recommendations based on your specific
                        employment situation, industry, and family needs
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Regional Variations:</strong> Cost of living varies significantly by location - adjust
                        your target accordingly
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Insurance Coverage:</strong> Adequate insurance can reduce the emergency fund needed for
                        medical or property emergencies
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Debt Considerations:</strong> Balance emergency fund building with high-interest debt
                        repayment strategies
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <strong>Last Updated:</strong> November 2025 | <strong>Update Frequency:</strong> Monthly
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12">
            <FAQ category="emergency-fund" />
          </div>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-12">
            <CardHeader>
              <CardTitle>Related Financial Tools</CardTitle>
              <CardDescription>Continue your financial planning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/"
                  className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                >
                  <Calculator className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold mb-1">Inflation Calculator</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Calculate how inflation affects your money over time
                  </p>
                </Link>
                <Link
                  href="/salary-calculator"
                  className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                >
                  <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-1">Salary Calculator</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adjust your salary for inflation and compare purchasing power
                  </p>
                </Link>
                <Link
                  href="/retirement-calculator"
                  className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                >
                  <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold mb-1">Retirement Calculator</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Plan for retirement with comprehensive calculations
                  </p>
                </Link>
                <Link
                  href="/mortgage-calculator"
                  className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                >
                  <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-1">Mortgage Calculator</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Calculate your mortgage payments and affordability
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>

          <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 rounded-lg">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-100 mb-3">Calculator Tools</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Inflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/salary-calculator" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Salary Calculator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/retirement-calculator"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        Retirement Calculator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/student-loan-calculator"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        Student Loan Calculator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/housing-affordability-calculator"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        Housing Affordability Calculator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/deflation-calculator"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        Deflation Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/legacy-planner" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Legacy Planner
                      </Link>
                    </li>
                    <li>
                      <Link href="/charts" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Charts & Analytics
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-100 mb-3">Information</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-100 mb-3">Contact</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="my-8 bg-gray-700" />

              <div className="text-center text-gray-400 text-sm">
                <p>© 2025 Global Inflation Calculator. All rights reserved.</p>
                <p className="mt-2">Educational purposes only. Not financial advice.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default EmergencyFundCalculatorPage
