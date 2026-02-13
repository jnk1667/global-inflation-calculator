"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, DollarSign, Calculator, AlertCircle, Info } from "lucide-react"
import FAQ from "@/components/faq"
import { treasuryData } from "@/lib/treasury-data"
import Link from "next/link"

// Currency symbols and names
const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  GBP: { symbol: "£", name: "British Pound" },
  EUR: { symbol: "€", name: "Euro" },
  CAD: { symbol: "C$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  CHF: { symbol: "Fr", name: "Swiss Franc" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar" },
}

// Investment strategy presets
const investmentStrategies = {
  "high-yield-savings": { name: "High-Yield Savings", rate: 3.67, risk: "Very Low" },
  "i-bonds": { name: "I-Bonds (Inflation Protected)", rate: 4.03, risk: "Very Low" },
  bonds: { name: "Bond Portfolio", rate: 5.0, risk: "Low" },
  balanced: { name: "Balanced (60/40)", rate: 7.0, risk: "Moderate" },
  stocks: { name: "Stock Portfolio (S&P 500)", rate: 10.5, risk: "High" },
  custom: { name: "Custom Rate", rate: 7.0, risk: "Variable" },
}

// Default inflation rates by currency (February 2026)
const defaultInflationRates = {
  USD: 2.8,
  GBP: 3.5,
  EUR: 2.5,
  CAD: 3.0,
  AUD: 3.5,
  CHF: 1.5,
  JPY: 1.0,
  NZD: 2.5,
}

interface CalculatorData {
  principal: number
  monthlyContribution: number
  annualReturn: number
  years: number
  currency: keyof typeof currencies
  investmentStrategy: keyof typeof investmentStrategies
  inflationRate: number
}

interface ChartDataPoint {
  year: number
  nominalValue: number
  realValue: number
  contributions: number
  interest: number
}

export default function GlobalCompoundInterestPage() {
  const [data, setData] = useState<CalculatorData>({
    principal: 10000,
    monthlyContribution: 500,
    annualReturn: 7.0,
    years: 20,
    currency: "USD",
    investmentStrategy: "balanced",
    inflationRate: 2.8,
  })

  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [results, setResults] = useState({
    nominalFinalValue: 0,
    realFinalValue: 0,
    totalContributions: 0,
    totalInterest: 0,
    realInterest: 0,
    inflationErosion: 0,
  })

  const [inflationRates, setInflationRates] = useState(defaultInflationRates)

  // Load real inflation data from aggregated files for all currencies
  useEffect(() => {
    const loadInflationData = async () => {
      try {
        const updatedRates = { ...defaultInflationRates }

        // Load inflation data for each currency
        const currencies = ["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY", "NZD"]

        await Promise.all(
          currencies.map(async (code) => {
            try {
              const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`, {
                headers: { Accept: "application/json" },
              })

              if (response.ok) {
                const inflationData = await response.json()
                // Get the latest year's inflation rate
                const years = Object.keys(inflationData).sort().reverse()
                const latestYear = years[0]

                if (inflationData[latestYear]?.inflation) {
                  updatedRates[code as keyof typeof defaultInflationRates] = inflationData[latestYear].inflation / 100
                }
              }
            } catch (err) {
              console.error(`Error loading ${code} inflation data:`, err)
              // Keep default value for this currency
            }
          })
        )

        setInflationRates(updatedRates)
        setData((prev) => ({
          ...prev,
          inflationRate: updatedRates[prev.currency],
        }))
      } catch (error) {
        console.error("Error loading inflation data:", error)
        // Keep default values if loading fails
      }
    }

    loadInflationData()
  }, [])

  // Update inflation rate when currency changes
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      inflationRate: inflationRates[prev.currency],
    }))
  }, [data.currency, inflationRates])

  // Update return rate when investment strategy changes
  const handleStrategyChange = (strategy: keyof typeof investmentStrategies) => {
    setData({
      ...data,
      investmentStrategy: strategy,
      annualReturn: strategy !== "custom" ? investmentStrategies[strategy].rate : data.annualReturn,
    })
  }

  // Calculate compound interest with monthly contributions
  useEffect(() => {
    const { principal, monthlyContribution, annualReturn, years, inflationRate } = data

    const monthlyRate = annualReturn / 100 / 12
    const months = years * 12
    const inflationRateDecimal = inflationRate / 100

    const dataPoints: ChartDataPoint[] = []
    let currentValue = principal
    let totalContributions = principal

    // Calculate for each year
    for (let year = 0; year <= years; year++) {
      const monthsElapsed = year * 12

      // Future value with monthly contributions
      // FV = P(1+r)^t + PMT × [((1+r)^t - 1) / r]
      const principalGrowth = principal * Math.pow(1 + monthlyRate, monthsElapsed)
      const contributionGrowth =
        monthsElapsed > 0
          ? monthlyContribution * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate)
          : 0

      const nominalValue = principalGrowth + contributionGrowth
      const contributionsThisYear = principal + monthlyContribution * monthsElapsed
      const interestEarned = nominalValue - contributionsThisYear

      // Adjust for inflation to get real value
      const realValue = nominalValue / Math.pow(1 + inflationRateDecimal, year)

      dataPoints.push({
        year,
        nominalValue: Math.round(nominalValue),
        realValue: Math.round(realValue),
        contributions: Math.round(contributionsThisYear),
        interest: Math.round(interestEarned),
      })
    }

    setChartData(dataPoints)

    // Calculate final results
    const finalPoint = dataPoints[dataPoints.length - 1]
    const inflationErosion = finalPoint.nominalValue - finalPoint.realValue

    setResults({
      nominalFinalValue: finalPoint.nominalValue,
      realFinalValue: finalPoint.realValue,
      totalContributions: finalPoint.contributions,
      totalInterest: finalPoint.interest,
      realInterest: finalPoint.realValue - finalPoint.contributions,
      inflationErosion,
    })
  }, [data])

  const formatCurrency = (value: number) => {
    const { symbol } = currencies[data.currency]
    return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 mt-16 md:mt-24">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Global Compound Interest Calculator</h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Calculate compound interest with inflation adjustment across 8 currencies. See real returns vs nominal
            returns using official Bureau of Labor Statistics data from 1913-2026.
          </p>
        </div>

        {/* Main Calculator */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Input Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Calculator Settings
              </CardTitle>
              <CardDescription>Enter your investment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Selection */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={data.currency} onValueChange={(value) => setData({ ...data, currency: value as keyof typeof currencies })}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, { name, symbol }]) => (
                      <SelectItem key={code} value={code}>
                        {symbol} {name} ({code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Investment */}
              <div className="space-y-2">
                <Label htmlFor="principal">Initial Investment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencies[data.currency].symbol}
                  </span>
                  <Input
                    id="principal"
                    type="number"
                    value={data.principal}
                    onChange={(e) => setData({ ...data, principal: Number(e.target.value) })}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Monthly Contribution */}
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencies[data.currency].symbol}
                  </span>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={data.monthlyContribution}
                    onChange={(e) => setData({ ...data, monthlyContribution: Number(e.target.value) })}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Investment Strategy */}
              <div className="space-y-2">
                <Label htmlFor="strategy">Investment Strategy</Label>
                <Select value={data.investmentStrategy} onValueChange={(value) => handleStrategyChange(value as keyof typeof investmentStrategies)}>
                  <SelectTrigger id="strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(investmentStrategies).map(([key, { name, rate, risk }]) => (
                      <SelectItem key={key} value={key}>
                        {name} - {rate}% ({risk} Risk)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Annual Return */}
              <div className="space-y-2">
                <Label htmlFor="annualReturn">Annual Return Rate (%)</Label>
                <Input
                  id="annualReturn"
                  type="number"
                  step="0.1"
                  value={data.annualReturn}
                  onChange={(e) => setData({ ...data, annualReturn: Number(e.target.value), investmentStrategy: "custom" })}
                  disabled={data.investmentStrategy !== "custom"}
                />
              </div>

              {/* Time Period */}
              <div className="space-y-2">
                <Label htmlFor="years">Investment Period (Years)</Label>
                <Input
                  id="years"
                  type="number"
                  value={data.years}
                  onChange={(e) => setData({ ...data, years: Number(e.target.value) })}
                />
              </div>

              {/* Inflation Rate */}
              <div className="space-y-2">
                <Label htmlFor="inflationRate" className="flex items-center gap-2">
                  Inflation Rate (%)
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Label>
                <Input
                  id="inflationRate"
                  type="number"
                  step="0.1"
                  value={data.inflationRate}
                  onChange={(e) => setData({ ...data, inflationRate: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Current {data.currency} inflation: {formatPercent(inflationRates[data.currency])} (Feb 2026)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Nominal Value
                  </CardTitle>
                  <CardDescription>What you'll see in your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(results.nominalFinalValue)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    After {data.years} years at {formatPercent(data.annualReturn)} annual return
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Real Value (Inflation-Adjusted)
                  </CardTitle>
                  <CardDescription>Actual purchasing power</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(results.realFinalValue)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    In today's {data.currency} purchasing power
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Inflation Impact Warning */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Inflation Erosion</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Inflation will erode <span className="font-bold">{formatCurrency(results.inflationErosion)}</span>{" "}
                      ({((results.inflationErosion / results.nominalFinalValue) * 100).toFixed(1)}%) of your nominal
                      returns. Your real return is {formatPercent(data.annualReturn - data.inflationRate)} after
                      inflation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Contributions</p>
                    <p className="text-xl font-semibold">{formatCurrency(results.totalContributions)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nominal Interest</p>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(results.totalInterest)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Real Interest Earned</p>
                    <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(results.realInterest)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Inflation Loss</p>
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(results.inflationErosion)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Over Time: Real vs Nominal Returns</CardTitle>
                <CardDescription>
                  Blue line shows nominal value, green shows inflation-adjusted purchasing power
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: "Years", position: "insideBottom", offset: -5 }} />
                    <YAxis
                      label={{ value: "Value", angle: -90, position: "insideLeft" }}
                      tickFormatter={(value) => formatCurrency(value)}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      stackId="1"
                      stroke="#94a3b8"
                      fill="#cbd5e1"
                      name="Total Contributions"
                    />
                    <Area
                      type="monotone"
                      dataKey="nominalValue"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      name="Nominal Value"
                    />
                    <Line
                      type="monotone"
                      dataKey="realValue"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={false}
                      name="Real Value (Inflation-Adjusted)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Real vs Nominal Returns</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                <strong>Nominal returns</strong> are what you see in your investment account - the actual dollar (or
                currency) amount that grows over time.
              </p>
              <p>
                <strong>Real returns</strong> adjust for inflation to show your true purchasing power growth. This is
                what matters for long-term wealth building.
              </p>
              <p className="text-sm text-muted-foreground">
                Example: With 7% nominal returns and 2.8% inflation, your real return is only ~4.2%. Over 20 years,
                $100,000 grows to $387,000 nominally, but only $235,000 in today's purchasing power.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Multi-Currency Matters</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Different currencies experience different inflation rates. As of February 2026:
              </p>
              <ul className="text-sm space-y-1">
                <li>JPY (Japan): 1.0% inflation - Best purchasing power preservation</li>
                <li>CHF (Switzerland): 1.5% - Very stable, low erosion</li>
                <li>EUR (Eurozone): 2.5% - Moderate inflation</li>
                <li>USD (United States): 2.8% - Current inflation rate</li>
                <li>GBP (UK) & AUD (Australia): 3.5% - Higher erosion</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Our calculator uses official BLS and central bank data to show accurate real returns across all 8
                currencies.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <FAQ category="global-compound-interest" />
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t bg-slate-900 dark:bg-slate-950 text-white py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* About Section */}
              <div>
                <h3 className="text-xl font-bold mb-4">Global Compound Interest Calculator</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Calculate compound interest with inflation adjustment across 8 major currencies. See real returns vs
                  nominal returns using official data from 1913 to 2026.
                </p>
              </div>

              {/* Data Sources */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• US Bureau of Labor Statistics</li>
                  <li>• UK Office for National Statistics</li>
                  <li>• Eurostat</li>
                  <li>• Statistics Canada</li>
                  <li>• Australian Bureau of Statistics</li>
                  <li>• Swiss Federal Statistical Office</li>
                  <li>• Statistics Bureau of Japan</li>
                  <li>• Statistics New Zealand</li>
                  <li>• US Treasury Department</li>
                  <li>• Federal Reserve Economic Data</li>
                </ul>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Home - Inflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/deflation-calculator" className="hover:text-white transition-colors">
                      Deflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/charts" className="hover:text-white transition-colors">
                      Charts & Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/ppp-calculator" className="hover:text-white transition-colors">
                      PPP Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/auto-loan-calculator" className="hover:text-white transition-colors">
                      Auto Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/salary-calculator" className="hover:text-white transition-colors">
                      Salary Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/retirement-calculator" className="hover:text-white transition-colors">
                      Retirement Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/student-loan-calculator" className="hover:text-white transition-colors">
                      Student Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/mortgage-calculator" className="hover:text-white transition-colors">
                      Mortgage Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/budget-calculator" className="hover:text-white transition-colors">
                      Budget Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/emergency-fund-calculator" className="hover:text-white transition-colors">
                      Emergency Fund Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/roi-calculator" className="hover:text-white transition-colors">
                      ROI Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/insurance-inflation-calculator" className="hover:text-white transition-colors">
                      Insurance Inflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/legacy-planner" className="hover:text-white transition-colors">
                      Legacy Planner
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
              © 2026 Global Inflation Calculator. Educational purposes only.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
