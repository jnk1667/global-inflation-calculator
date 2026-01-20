"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Info,
  AlertTriangle,
  CheckCircle,
  Target,
  Percent,
  Shield,
  ArrowRightLeft,
  Calendar,
  Home,
  BookOpen,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import AdBanner from "@/components/ad-banner"
import FAQ from "@/components/faq"
import { treasuryData } from "@/lib/treasury-data"
import { trackEvent } from "@/lib/analytics"
import { supabase } from "@/lib/supabase"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface ROIResult {
  totalReturn: number
  roiPercentage: number
  annualizedReturn: number
  netProfit: number
  inflationAdjustedReturn: number
  realROI: number
  afterTaxReturn: number
  afterTaxAndInflationReturn: number
  opportunityCost: number
  treasuryComparison: number
  yearlyBreakdown: Array<{
    year: number
    nominalValue: number
    realValue: number
    inflationRate: number
  }>
}

export default function ROICalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState<string>("10000")
  const [finalValue, setFinalValue] = useState<string>("15000")
  const [investmentPeriod, setInvestmentPeriod] = useState<string>("5")
  const [currency, setCurrency] = useState<string>("USD")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [essayContent, setEssayContent] = useState<string>("")
  const [taxRate, setTaxRate] = useState<string>("20")
  const [inflationRate, setInflationRate] = useState<string>("3.0")
  const [comparisonBenchmark, setComparisonBenchmark] = useState<string>("treasury_30y")

  const [result, setResult] = useState<ROIResult | null>(null)
  const [calculated, setCalculated] = useState(false)
  const [mounted, setMounted] = useState(false)
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

  const formatCurrency = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    try {
      const latestYear = treasuryData.latest_year
      const latestData = treasuryData.data[latestYear]

      setCurrentTreasuryRates({
        bills_3m: latestData.treasury_bills_3m,
        notes_10y: latestData.treasury_notes_10y,
        bonds_30y: latestData.treasury_bonds_30y,
        year: latestYear,
      })
    } catch (error) {
      console.error("Error loading Treasury rates:", error)
    }
  }, [])

  useEffect(() => {
    const loadEssayContent = async () => {
      try {
        const { data, error } = await supabase.from("seo_content").select("content").eq("id", "roi_essay").single()

        if (error || !data?.content) {
          console.log("Using default ROI essay content")
          return
        }

        setEssayContent(data.content)
      } catch (err) {
        console.log("Error loading ROI essay:", err)
      }
    }
    loadEssayContent()
  }, [])

  const calculateROI = () => {
    try {
      const initial = Number.parseFloat(initialInvestment)
      const final = Number.parseFloat(finalValue)
      const years = Number.parseFloat(investmentPeriod)
      const tax = Number.parseFloat(taxRate) / 100
      const inflation = Number.parseFloat(inflationRate) / 100

      if (isNaN(initial) || initial <= 0) {
        alert("Please enter a valid initial investment")
        return
      }

      if (isNaN(final) || final < 0) {
        alert("Please enter a valid final value")
        return
      }

      if (isNaN(years) || years <= 0) {
        alert("Please enter a valid investment period")
        return
      }

      // Basic ROI calculations
      const netProfit = final - initial
      const roiPercentage = (netProfit / initial) * 100
      const annualizedReturn = years > 0 ? (Math.pow(final / initial, 1 / years) - 1) * 100 : 0

      // Inflation adjustment
      const inflationAdjustedFinal = final / Math.pow(1 + inflation, years)
      const inflationAdjustedReturn = inflationAdjustedFinal - initial
      const realROI = (inflationAdjustedReturn / initial) * 100

      // Tax adjustment
      const afterTaxProfit = netProfit * (1 - tax)
      const afterTaxReturn = (afterTaxProfit / initial) * 100

      // Combined tax and inflation
      const afterTaxFinal = initial + afterTaxProfit
      const afterTaxInflationAdjustedFinal = afterTaxFinal / Math.pow(1 + inflation, years)
      const afterTaxAndInflationReturn = ((afterTaxInflationAdjustedFinal - initial) / initial) * 100

      // Treasury comparison
      let treasuryRate = 0
      if (currentTreasuryRates) {
        if (comparisonBenchmark === "treasury_3m") {
          treasuryRate = currentTreasuryRates.bills_3m
        } else if (comparisonBenchmark === "treasury_10y") {
          treasuryRate = currentTreasuryRates.notes_10y
        } else if (comparisonBenchmark === "treasury_30y") {
          treasuryRate = currentTreasuryRates.bonds_30y
        }
      }

      const treasuryFinalValue = initial * Math.pow(1 + treasuryRate / 100, years)
      const opportunityCost = treasuryFinalValue - initial
      const treasuryComparison = netProfit - opportunityCost

      // Yearly breakdown
      const yearlyBreakdown = []
      for (let year = 0; year <= years; year++) {
        const nominalValue = year === 0 ? initial : initial * Math.pow(final / initial, year / years)
        const realValue = nominalValue / Math.pow(1 + inflation, year)
        yearlyBreakdown.push({
          year,
          nominalValue,
          realValue,
          inflationRate: inflation * 100,
        })
      }

      const roiResult: ROIResult = {
        totalReturn: final,
        roiPercentage,
        annualizedReturn,
        netProfit,
        inflationAdjustedReturn,
        realROI,
        afterTaxReturn,
        afterTaxAndInflationReturn,
        opportunityCost,
        treasuryComparison,
        yearlyBreakdown,
      }

      setResult(roiResult)
      setCalculated(true)

      trackEvent("roi_calculated", {
        currency,
        initial_investment: initial,
        final_value: final,
        years,
        advanced_mode: advancedMode,
      })
    } catch (error) {
      console.error("Calculation error:", error)
      alert("An error occurred during calculation. Please check your inputs.")
    }
  }

  const faqs = [
    {
      question: "What is ROI and how is it calculated?",
      answer:
        "ROI (Return on Investment) is a performance measure used to evaluate the efficiency of an investment. It's calculated as: ROI = (Final Value - Initial Investment) / Initial Investment × 100. For example, if you invest $10,000 and it grows to $15,000, your ROI is 50%.",
    },
    {
      question: "What's the difference between nominal and real returns?",
      answer:
        "Nominal returns are the actual percentage gains without adjusting for inflation, while real returns account for inflation's impact on purchasing power. If your investment gained 10% but inflation was 3%, your real return is approximately 7%. Real returns show the true increase in your wealth's buying power.",
    },
    {
      question: "Why should I compare my ROI to Treasury rates?",
      answer:
        "Treasury rates represent risk-free returns backed by the government. Compare your investment to Treasuries shows your 'opportunity cost' - what you could have earned with zero risk. If your investment returned 6% but 10-year Treasuries paid 4.5%, you earned 1.5% above the risk-free rate.",
    },
    {
      question: "How does inflation erode investment returns?",
      answer:
        "Inflation reduces the purchasing power of your returns over time. A $10,000 investment that grows to $15,000 over 5 years at 3% annual inflation has real purchasing power of only about $12,900 in today's dollars. Our calculator shows both nominal and inflation-adjusted returns to reveal your true wealth gain.",
    },
    {
      question: "What is annualized return and why does it matter?",
      answer:
        "Annualized return (also called CAGR - Compound Annual Growth Rate) shows the average yearly return over the investment period. It's crucial for comparing investments of different durations. A 50% return over 5 years equals about 8.5% annualized, which is much more comparable to other investments than the total return.",
    },
    {
      question: "How should I account for taxes on investment returns?",
      answer:
        "Investment gains are typically subject to capital gains tax, which varies by country and holding period. In the US, long-term capital gains (held over 1 year) are taxed at 0%, 15%, or 20% depending on income. Short-term gains are taxed as ordinary income. Our calculator lets you input your expected tax rate to see after-tax returns.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" style={{ contain: "layout style" }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <Badge className="bg-emerald-500 text-white px-4 py-1.5">
              <TrendingUp className="mr-2 h-4 w-4 inline" />
              Advanced Investment Analysis
            </Badge>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">ROI Calculator</h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-slate-300">
            Calculate return on investment with inflation adjustment across 8 currencies. Compare your ROI against
            Treasury rates and discover your real purchasing power gains.
          </p>

          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              <Home className="h-4 w-4 inline mr-1" />
              Home
            </Link>
            <span>/</span>
            <span className="text-white">ROI Calculator</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Ad Banner */}
        <div className="mb-8 flex justify-center">
          <AdBanner slot="roi-calculator-top" format="horizontal" />
        </div>

        {/* Treasury Rates Info Card */}
        {currentTreasuryRates && (
          <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Current Treasury Rates ({currentTreasuryRates.year})
              </CardTitle>
              <CardDescription>Risk-free benchmark rates for investment comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">3-Month T-Bill</div>
                  <div className="text-2xl font-bold text-blue-600">{currentTreasuryRates.bills_3m.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Short-term safe rate</div>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">10-Year Treasury</div>
                  <div className="text-2xl font-bold text-indigo-600">{currentTreasuryRates.notes_10y.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Medium-term benchmark</div>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">30-Year Bond</div>
                  <div className="text-2xl font-bold text-purple-600">{currentTreasuryRates.bonds_30y.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Long-term safe rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Input Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  Investment Details
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Advanced Mode</span>
                  <button
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                      advancedMode ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                    aria-label="Toggle advanced mode"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        advancedMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <CardDescription>Enter your investment information to calculate ROI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Currency Selection */}
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

              {/* Initial Investment */}
              <div className="space-y-2">
                <Label htmlFor="initialInvestment">Initial Investment *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    id="initialInvestment"
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value)}
                    className="pl-8"
                    placeholder="10000"
                  />
                </div>
                <p className="text-xs text-gray-500">Amount you initially invested</p>
              </div>

              {/* Final Value */}
              <div className="space-y-2">
                <Label htmlFor="finalValue">Final Value *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    id="finalValue"
                    type="number"
                    value={finalValue}
                    onChange={(e) => setFinalValue(e.target.value)}
                    className="pl-8"
                    placeholder="15000"
                  />
                </div>
                <p className="text-xs text-gray-500">Current or final value of investment</p>
              </div>

              {/* Investment Period */}
              <div className="space-y-2">
                <Label htmlFor="investmentPeriod">Investment Period (Years) *</Label>
                <Input
                  id="investmentPeriod"
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(e.target.value)}
                  placeholder="5"
                  step="0.5"
                />
                <p className="text-xs text-gray-500">How long the investment lasted</p>
              </div>

              {/* Advanced Mode Settings */}
              {advancedMode && (
                <div className="space-y-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <h3 className="font-semibold text-sm text-emerald-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Advanced Analysis Settings
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Capital Gains Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="20"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-600">Long-term capital gains rate (0%, 15%, or 20% in US)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Annual Inflation Rate (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                      placeholder="3.0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-600">
                      Current {selectedCurrency.code} inflation: {selectedCurrency.inflationRate}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comparisonBenchmark">Comparison Benchmark</Label>
                    <Select value={comparisonBenchmark} onValueChange={setComparisonBenchmark}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treasury_3m">3-Month T-Bill (Short-term)</SelectItem>
                        <SelectItem value="treasury_10y">10-Year Treasury (Medium-term)</SelectItem>
                        <SelectItem value="treasury_30y">30-Year Bond (Long-term)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600">Compare against risk-free government rates</p>
                  </div>
                </div>
              )}

              <Button onClick={calculateROI} className="w-full" size="lg">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate ROI
              </Button>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  <strong>Tip:</strong> Enable Advanced Mode to see inflation-adjusted returns, tax impact, and Treasury
                  rate comparison.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results Section */}
          {calculated && result && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-emerald-600" />
                  Your ROI Results
                </CardTitle>
                <CardDescription>Comprehensive return analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Total ROI</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{result.roiPercentage.toFixed(2)}%</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCurrency(result.netProfit)} profit</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-gray-700">Annualized Return</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{result.annualizedReturn.toFixed(2)}%</div>
                    <div className="text-xs text-gray-600 mt-1">Average yearly gain</div>
                  </div>
                </div>

                {/* Advanced Metrics */}
                {advancedMode && (
                  <>
                    <Separator />

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Inflation-Adjusted Analysis
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-gray-700">Real ROI (After Inflation)</span>
                          <span className={`font-semibold ${result.realROI > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {result.realROI.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-gray-700">Inflation-Adjusted Return</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.inflationAdjustedReturn)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Tax & Combined Impact
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-gray-700">After-Tax Return</span>
                          <span className="font-semibold text-gray-900">{result.afterTaxReturn.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="text-sm font-medium text-amber-900">True Return (Tax + Inflation)</span>
                          <span
                            className={`font-bold ${result.afterTaxAndInflationReturn > 0 ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {result.afterTaxAndInflationReturn.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Treasury Comparison
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-gray-700">Risk-Free Alternative</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(result.opportunityCost)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-gray-700">Excess Return vs Treasury</span>
                          <span
                            className={`font-semibold ${result.treasuryComparison > 0 ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {result.treasuryComparison > 0 ? "+" : ""}
                            {formatCurrency(Math.abs(result.treasuryComparison))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Alert
                      className={
                        result.treasuryComparison > 0
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-amber-200 bg-amber-50"
                      }
                    >
                      {result.treasuryComparison > 0 ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <AlertDescription className="text-sm text-emerald-900">
                            <strong>Great!</strong> You outperformed the risk-free Treasury rate by{" "}
                            {formatCurrency(Math.abs(result.treasuryComparison))}, earning{" "}
                            {(
                              (Math.abs(result.treasuryComparison) / Number.parseFloat(initialInvestment)) *
                              100
                            ).toFixed(2)}
                            % more for taking investment risk.
                          </AlertDescription>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm text-amber-900">
                            <strong>Note:</strong> You would have earned{" "}
                            {formatCurrency(Math.abs(result.treasuryComparison))} more with risk-free Treasuries.
                            Consider whether the risk was justified.
                          </AlertDescription>
                        </>
                      )}
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chart Section */}
        {calculated && result && advancedMode && mounted && (
          <Card className="shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Nominal vs Real Returns Over Time
              </CardTitle>
              <CardDescription>See how inflation erodes purchasing power year by year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={result.yearlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: "Years", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: `Value (${selectedCurrency.symbol})`, angle: -90, position: "insideLeft" }} />
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="nominalValue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Nominal Value"
                    dot={{ fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="realValue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Real Value (Inflation-Adjusted)"
                    dot={{ fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Understanding This Chart:</strong> The blue line shows your investment's nominal value, while
                  the green line shows its real value adjusted for {Number.parseFloat(inflationRate).toFixed(1)}% annual
                  inflation. The gap between them represents purchasing power lost to inflation over time.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Educational Content */}
        <Card className="shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Understanding ROI: The Complete Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {essayContent ? (
              <MarkdownRenderer content={essayContent} />
            ) : (
              <>
                <h3>What Makes Our ROI Calculator Unique</h3>
                <p>
                  Most ROI calculators only show basic percentage returns. Our advanced calculator reveals what your
                  investment REALLY earned by accounting for:
                </p>
                <ul>
                  <li>
                    <strong>Inflation erosion</strong> - See your real purchasing power gains across 8 currencies
                  </li>
                  <li>
                    <strong>Tax impact</strong> - Calculate after-tax returns with customizable tax rates
                  </li>
                  <li>
                    <strong>Opportunity cost</strong> - Compare against risk-free Treasury rates to see if your risk was
                    rewarded
                  </li>
                  <li>
                    <strong>Multi-measure analysis</strong> - Use consensus inflation data for the most accurate real
                    returns
                  </li>
                </ul>

                <h3>Why Inflation-Adjusted ROI Matters</h3>
                <p>
                  A 50% return over 5 years sounds impressive, but if inflation averaged 3% annually during that period,
                  your real purchasing power only increased by about 35%. This is the difference between nominal returns
                  (what you see in your account) and real returns (what you can actually buy).
                </p>
                <p>Our calculator shows both, giving you a complete picture of your investment performance.</p>

                <h3>The Treasury Benchmark: Did You Beat the Risk-Free Rate?</h3>
                <p>
                  Every investment carries risk. The question is: were you properly compensated for that risk? By
                  comparing your return to Treasury rates (the "risk-free" rate), you can see whether your investment
                  justified its risk.
                </p>
                <p>
                  If you earned 8% while 10-year Treasuries paid 4.5%, you earned a 3.5% "risk premium" - your reward
                  for taking on investment risk. If you earned less than Treasuries, you took risk without being
                  rewarded.
                </p>

                <h3>Multi-Currency Inflation Analysis</h3>
                <p>
                  For international investors or expats, understanding returns in multiple currencies is crucial. A US
                  stock that gained 40% over 5 years might show different real returns when adjusted for inflation in
                  GBP, EUR, or JPY. Our calculator supports 8 major currencies with real inflation data.
                </p>

                <h3>Tax Considerations</h3>
                <p>Investment gains are taxed, and those taxes significantly impact your true return. In the US:</p>
                <ul>
                  <li>Long-term capital gains (held over 1 year): 0%, 15%, or 20% depending on income</li>
                  <li>Short-term capital gains (held less than 1 year): Taxed as ordinary income (up to 37%)</li>
                </ul>
                <p>
                  Our calculator lets you input your expected tax rate to see after-tax, inflation-adjusted returns -
                  the number that matters most.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-blue-600" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FAQ faqs={faqs} category="roi" />
          </CardContent>
        </Card>

        {/* Footer Section */}
        <footer className="bg-gray-900 text-white py-12 mt-16 rounded-lg">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">ROI Calculator</h3>
                <p className="text-gray-300 mb-6">
                  Calculate return on investment with inflation adjustment across 8 currencies and compare against
                  Treasury rates.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Data Sources</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• US Treasury Department</li>
                  <li>• Federal Reserve (FRED)</li>
                  <li>• OECD Inflation Data</li>
                  <li>• Central Banks (G8)</li>
                  <li>• BLS Economic Indicators</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
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
