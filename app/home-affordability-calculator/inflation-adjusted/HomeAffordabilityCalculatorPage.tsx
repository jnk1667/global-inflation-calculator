"use client"

import React, { useState, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Home,
  TrendingDown,
  Info,
  DollarSign,
  Calculator,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Percent,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

const AdBanner = lazy(() => import("@/components/ad-banner"))
const FAQ = lazy(() => import("@/components/faq"))

// Per-currency config: symbol, DTI rules, max loan multiples, stress test, down payment min
const CURRENCY_CONFIG: Record<
  string,
  {
    symbol: string
    flag: string
    name: string
    country: string
    frontEndDTI: number // max housing expense / gross income
    backEndDTI: number // max total debt / gross income
    maxIncomeMultiple: number // lender income multiple cap
    stressTestRate: number // qualifying rate above actual rate
    minDownPaymentPct: number
    mortgageTerm: number // years
    avgRate2000: number
    avgRate2010: number
    avgRateNow: number
    inflationFile: string
    medianIncome2000: number // in local currency
    medianIncomeNow: number
  }
> = {
  USD: {
    symbol: "$",
    flag: "🇺🇸",
    name: "US Dollar",
    country: "United States",
    frontEndDTI: 0.28,
    backEndDTI: 0.36,
    maxIncomeMultiple: 4.5,
    stressTestRate: 0,
    minDownPaymentPct: 0.035,
    mortgageTerm: 30,
    avgRate2000: 8.05,
    avgRate2010: 4.69,
    avgRateNow: 6.9,
    inflationFile: "usd-inflation.json",
    medianIncome2000: 42148,
    medianIncomeNow: 80610,
  },
  GBP: {
    symbol: "£",
    flag: "🇬🇧",
    name: "British Pound",
    country: "United Kingdom",
    frontEndDTI: 0.35,
    backEndDTI: 0.43,
    maxIncomeMultiple: 4.5,
    stressTestRate: 0,
    minDownPaymentPct: 0.05,
    mortgageTerm: 25,
    avgRate2000: 7.74,
    avgRate2010: 4.5,
    avgRateNow: 4.75,
    inflationFile: "gbp-inflation.json",
    medianIncome2000: 18800,
    medianIncomeNow: 34963,
  },
  EUR: {
    symbol: "€",
    flag: "🇪🇺",
    name: "Euro",
    country: "Eurozone",
    frontEndDTI: 0.35,
    backEndDTI: 0.4,
    maxIncomeMultiple: 4.0,
    stressTestRate: 0,
    minDownPaymentPct: 0.1,
    mortgageTerm: 25,
    avgRate2000: 6.5,
    avgRate2010: 4.1,
    avgRateNow: 3.8,
    inflationFile: "eur-inflation.json",
    medianIncome2000: 20000,
    medianIncomeNow: 30000,
  },
  CAD: {
    symbol: "C$",
    flag: "🇨🇦",
    name: "Canadian Dollar",
    country: "Canada",
    frontEndDTI: 0.32,
    backEndDTI: 0.44,
    maxIncomeMultiple: 4.5,
    stressTestRate: 2.0, // CMHC stress test: contract rate + 2%
    minDownPaymentPct: 0.05,
    mortgageTerm: 25,
    avgRate2000: 8.0,
    avgRate2010: 5.25,
    avgRateNow: 5.2,
    inflationFile: "cad-inflation.json",
    medianIncome2000: 55000,
    medianIncomeNow: 92000,
  },
  AUD: {
    symbol: "A$",
    flag: "🇦🇺",
    name: "Australian Dollar",
    country: "Australia",
    frontEndDTI: 0.3,
    backEndDTI: 0.4,
    maxIncomeMultiple: 6.0,
    stressTestRate: 3.0, // APRA buffer
    minDownPaymentPct: 0.05,
    mortgageTerm: 30,
    avgRate2000: 7.8,
    avgRate2010: 7.4,
    avgRateNow: 6.1,
    inflationFile: "aud-inflation.json",
    medianIncome2000: 43000,
    medianIncomeNow: 98218,
  },
  CHF: {
    symbol: "Fr",
    flag: "🇨🇭",
    name: "Swiss Franc",
    country: "Switzerland",
    frontEndDTI: 0.33,
    backEndDTI: 0.4,
    maxIncomeMultiple: 5.0,
    stressTestRate: 0,
    minDownPaymentPct: 0.2,
    mortgageTerm: 15,
    avgRate2000: 4.5,
    avgRate2010: 2.5,
    avgRateNow: 1.5,
    inflationFile: "chf-inflation.json",
    medianIncome2000: 70000,
    medianIncomeNow: 95000,
  },
  JPY: {
    symbol: "¥",
    flag: "🇯🇵",
    name: "Japanese Yen",
    country: "Japan",
    frontEndDTI: 0.35,
    backEndDTI: 0.4,
    maxIncomeMultiple: 7.0,
    stressTestRate: 0,
    minDownPaymentPct: 0.1,
    mortgageTerm: 35,
    avgRate2000: 2.5,
    avgRate2010: 2.3,
    avgRateNow: 1.0,
    inflationFile: "jpy-inflation.json",
    medianIncome2000: 4800000,
    medianIncomeNow: 4680000,
  },
  NZD: {
    symbol: "NZ$",
    flag: "🇳🇿",
    name: "New Zealand Dollar",
    country: "New Zealand",
    frontEndDTI: 0.3,
    backEndDTI: 0.4,
    maxIncomeMultiple: 5.0,
    stressTestRate: 2.0,
    minDownPaymentPct: 0.05,
    mortgageTerm: 30,
    avgRate2000: 8.5,
    avgRate2010: 7.0,
    avgRateNow: 6.8,
    inflationFile: "nzd-inflation.json",
    medianIncome2000: 38000,
    medianIncomeNow: 73000,
  },
}

interface AffordabilityResult {
  maxPurchasePrice: number
  maxLoanAmount: number
  downPayment: number
  monthlyPayment: number
  monthlyIncome: number
  frontEndRatio: number
  backEndRatio: number
  limitingFactor: "front-end-dti" | "back-end-dti" | "income-multiple" | "stress-test"
  equivalentPurchasePriceIn2000: number
  purchasingPowerLostPct: number
  rateIn2000: number
  maxPurchasePriceAt2000Rate: number
  affordabilityStatus: "comfortable" | "moderate" | "stretched" | "critical"
}

function calcMonthlyPayment(principal: number, annualRatePct: number, termYears: number): number {
  if (annualRatePct <= 0) return principal / (termYears * 12)
  const r = annualRatePct / 100 / 12
  const n = termYears * 12
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function calcMaxLoanFromPayment(monthlyPayment: number, annualRatePct: number, termYears: number): number {
  if (annualRatePct <= 0) return monthlyPayment * termYears * 12
  const r = annualRatePct / 100 / 12
  const n = termYears * 12
  return (monthlyPayment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
}

const DEFAULT_HOME_AFFORDABILITY_ESSAY = [
  "## What Is an Inflation-Adjusted Home Affordability Calculator?",
  "",
  "Most affordability calculators tell you the maximum home price you can afford **today** — but they ignore a critical variable: inflation. This calculator goes further by showing how your buying power has changed since 2000, factoring in rising prices, shifting interest rates, and country-specific lending rules.",
  "",
  "## How the 28/36 Rule Works (and Why It Varies by Country)",
  "",
  "In the United States, lenders use the **28/36 rule**: your monthly housing costs should not exceed 28% of gross income, and total debt payments should not exceed 36%. But this rule is not universal.",
  "",
  "- **UK lenders** cap mortgages at 4.5x annual income, with a stress test at the Bank of England base rate plus 3%",
  "- **Canada** uses the CMHC stress test — you must qualify at your contract rate plus 2%, or 5.25%, whichever is higher",
  "- **Australia** applies APRA's 3% serviceability buffer above the actual rate",
  "- **Switzerland** uses a conservative 33% housing cost ratio with an imputed 5% rate for stress testing",
  "- **Japan and New Zealand** apply their own regional DTI thresholds",
  "",
  "Understanding which rules apply to your country changes your maximum purchase price significantly.",
  "",
  "## Why Inflation Matters More Than You Think",
  "",
  "Between 2000 and 2024, cumulative inflation in the US was approximately 82%. That means a $400,000 budget today had the purchasing power of roughly $220,000 in 2000. At the same time, the average 30-year mortgage rate in 2000 was 8.5% — today it sits near 6.8%.",
  "",
  "**The rate difference alone accounts for a large portion of the affordability gap.** A buyer in 2000 with your same income and down payment would have faced a higher rate but benefited from dramatically lower home prices and a stronger real-income position relative to housing costs.",
  "",
  "## What Counts Toward Monthly Debt Payments?",
  "",
  "When calculating your back-end DTI (total debt-to-income ratio), lenders include:",
  "",
  "- Car loans and auto leases",
  "- Student loan minimum payments",
  "- Credit card minimum payments",
  "- Personal loans",
  "- Any other recurring debt obligations",
  "",
  "They do **not** count utility bills, insurance, groceries, or subscriptions. Leave this field blank if you have no recurring debt obligations.",
  "",
  "## How to Improve Your Affordability Score",
  "",
  "If your result shows a tight DTI or limited purchase price, consider:",
  "",
  "- **Increasing your down payment** — a larger down payment reduces the loan principal and monthly payment",
  "- **Paying down existing debts** — reducing monthly obligations frees up DTI capacity",
  "- **Choosing a longer mortgage term** — a 30-year term produces lower monthly payments than a 25-year term",
  "- **Waiting for rate changes** — a 1% drop in mortgage rates can increase your maximum purchase price by 8-10%",
  "",
  "## Multi-Currency Support: 8 Countries, 8 Lending Frameworks",
  "",
  "This calculator supports USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD — each with its own country-specific lending rules, stress test rates, and minimum down payment requirements sourced from official government and central bank data.",
].join("\n")

type LimitingFactorLabels = { [K in AffordabilityResult["limitingFactor"]]: string }

export default function HomeAffordabilityCalculatorPage() {
  const [currency, setCurrency] = useState("USD")
  const [annualIncome, setAnnualIncome] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [monthlyDebts, setMonthlyDebts] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [result, setResult] = useState<AffordabilityResult | null>(null)
  const [inflationData, setInflationData] = useState<Record<string, number>>({})
  const [hasCalculated, setHasCalculated] = useState(false)
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({})
  const [blogEssay, setBlogEssay] = useState("")

  const cfg = CURRENCY_CONFIG[currency]

  // Pre-fill rate when currency changes
  useEffect(() => {
    setInterestRate(cfg.avgRateNow.toString())
    setResult(null)
    setHasCalculated(false)
  }, [currency])

  // Load inflation data for selected currency
  useEffect(() => {
    const file = cfg.inflationFile
    fetch(`/data/${file}`)
      .then((r) => r.json())
      .then((d) => setInflationData(d.data || d))
      .catch(() => setInflationData({}))
  }, [currency])

  // Load blog essay from Supabase
  useEffect(() => {
    const loadBlogContent = async () => {
      try {
        const content = await getCachedContent("home_affordability_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "home_affordability_essay")
            .single()
          if (error || !data?.content) return DEFAULT_HOME_AFFORDABILITY_ESSAY
          return data.content
        })
        setBlogEssay(content)
      } catch {
        setBlogEssay(DEFAULT_HOME_AFFORDABILITY_ESSAY)
      }
    }
    loadBlogContent()
  }, [])

  const renderBlogContent = (content: string) => {
    const parseInlineMarkdown = (text: string) => {
      const parts: (string | React.ReactNode)[] = []
      const boldRegex = /\*\*(.+?)\*\*/g
      let lastIndex = 0
      let key = 0
      let match
      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index))
        parts.push(<strong key={`bold-${key++}`} className="font-semibold text-gray-900 dark:text-white">{match[1]}</strong>)
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < text.length) parts.push(text.substring(lastIndex))
      return parts.length > 0 ? parts : text
    }

    return content.split("\n").map((line, index) => {
      if (line.startsWith("## "))
        return <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">{line.substring(3)}</h3>
      if (line.startsWith("### "))
        return <h4 key={index} className="text-lg font-medium text-gray-800 dark:text-gray-100 mt-4 mb-2">{line.substring(4)}</h4>
      if (line.trim().startsWith("- "))
        return <li key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed ml-6 mb-2">{parseInlineMarkdown(line.trim().substring(2))}</li>
      if (line.trim() === "")
        return <br key={index} />
      return <p key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">{parseInlineMarkdown(line)}</p>
    })
  }

  const validate: () => boolean = () => {
    const errors: Record<string, string> = {}
    const inc = parseFloat(annualIncome.replace(/,/g, ""))
    const dp = parseFloat(downPayment.replace(/,/g, ""))
    const debts = parseFloat(monthlyDebts.replace(/,/g, "") || "0")
    const rate = parseFloat(interestRate)

    if (!annualIncome || isNaN(inc) || inc <= 0) errors.annualIncome = "Please enter a valid annual income"
    if (!downPayment || isNaN(dp) || dp < 0) errors.downPayment = "Please enter a valid down payment"
    if (isNaN(debts) || debts < 0) errors.monthlyDebts = "Please enter a valid monthly debt amount"
    if (!interestRate || isNaN(rate) || rate < 0 || rate > 30) errors.interestRate = "Please enter a rate between 0–30%"

    setInputErrors(errors)
    return Object.keys(errors).length === 0
  }

  const calculate = () => {
    if (!validate()) return

    const inc = parseFloat(annualIncome.replace(/,/g, ""))
    const dp = parseFloat(downPayment.replace(/,/g, ""))
    const debts = parseFloat(monthlyDebts.replace(/,/g, "") || "0")
    const rate = parseFloat(interestRate)

    const monthlyIncome = inc / 12
    const qualifyingRate = cfg.stressTestRate > 0 ? rate + cfg.stressTestRate : rate

    // Front-end DTI limit: max housing payment
    const maxHousingPayment = monthlyIncome * cfg.frontEndDTI

    // Back-end DTI limit: max housing payment after existing debts
    const maxHousingPaymentBackEnd = monthlyIncome * cfg.backEndDTI - debts

    // Effective max monthly payment
    const effectiveMaxPayment = Math.min(maxHousingPayment, maxHousingPaymentBackEnd)

    // Max loan from DTI
    const maxLoanDTI = calcMaxLoanFromPayment(effectiveMaxPayment, qualifyingRate, cfg.mortgageTerm)

    // Income multiple cap
    const maxLoanIncomeMultiple = inc * cfg.maxIncomeMultiple - dp

    // Actual max loan
    const maxLoan = Math.min(maxLoanDTI, maxLoanIncomeMultiple)
    const maxPurchasePrice = maxLoan + dp

    // Actual monthly payment on real rate (not stress test)
    const actualMonthlyPayment = calcMonthlyPayment(maxLoan, rate, cfg.mortgageTerm)

    // What's actually limiting this buyer?
    let limitingFactor: AffordabilityResult["limitingFactor"] = "front-end-dti"
    if (maxHousingPaymentBackEnd < maxHousingPayment) limitingFactor = "back-end-dti"
    if (maxLoan >= maxLoanDTI && maxLoanIncomeMultiple < maxLoanDTI) limitingFactor = "income-multiple"
    if (cfg.stressTestRate > 0 && qualifyingRate > rate) limitingFactor = "stress-test"

    // Inflation adjustment: what does this purchase price equal in year-2000 money?
    const cpi2000 = inflationData["2000"]
    const cpiNow = inflationData["2024"] || inflationData["2025"] || inflationData["2023"]
    const equivalentIn2000 = cpi2000 && cpiNow ? (maxPurchasePrice * cpi2000) / cpiNow : maxPurchasePrice

    const purchasingPowerLostPct = cpi2000 && cpiNow ? ((cpiNow - cpi2000) / cpi2000) * 100 : 0

    // What could they afford in 2000 at the 2000 rate with same income?
    const maxPaymentAt2000 = monthlyIncome * cfg.frontEndDTI
    const maxLoanAt2000Rate = calcMaxLoanFromPayment(maxPaymentAt2000, cfg.avgRate2000, cfg.mortgageTerm)
    const maxPurchasePriceAt2000Rate = maxLoanAt2000Rate + dp

    // Affordability status
    const actualFrontEnd = actualMonthlyPayment / monthlyIncome
    let affordabilityStatus: AffordabilityResult["affordabilityStatus"] = "comfortable"
    if (actualFrontEnd > 0.36) affordabilityStatus = "critical"
    else if (actualFrontEnd > 0.28) affordabilityStatus = "stretched"
    else if (actualFrontEnd > 0.22) affordabilityStatus = "moderate"

    setResult({
      maxPurchasePrice,
      maxLoanAmount: maxLoan,
      downPayment: dp,
      monthlyPayment: actualMonthlyPayment,
      monthlyIncome,
      frontEndRatio: actualMonthlyPayment / monthlyIncome,
      backEndRatio: (actualMonthlyPayment + debts) / monthlyIncome,
      limitingFactor,
      equivalentPurchasePriceIn2000: equivalentIn2000,
      purchasingPowerLostPct,
      rateIn2000: cfg.avgRate2000,
      maxPurchasePriceAt2000Rate,
      affordabilityStatus,
    })
    setHasCalculated(true)
  }

  const formatCurrency = (val: number) => {
    if (currency === "JPY") return `${cfg.symbol}${Math.round(val).toLocaleString()}`
    return `${cfg.symbol}${Math.round(val).toLocaleString()}`
  }

  const affordabilityColors = {
    comfortable: { bg: "bg-green-50 dark:bg-green-950", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-300", badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    moderate: { bg: "bg-yellow-50 dark:bg-yellow-950", border: "border-yellow-200 dark:border-yellow-800", text: "text-yellow-700 dark:text-yellow-300", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    stretched: { bg: "bg-orange-50 dark:bg-orange-950", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    critical: { bg: "bg-red-50 dark:bg-red-950", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-300", badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  }

  const limitingFactorLabels: LimitingFactorLabels = {
    "front-end-dti": cfg.country + " housing expense limit (" + (cfg.frontEndDTI * 100).toFixed(0) + "% of gross income)",
    "back-end-dti": cfg.country + " total debt limit (" + (cfg.backEndDTI * 100).toFixed(0) + "% of gross income)",
    "income-multiple": cfg.country + " lender income multiple cap (" + cfg.maxIncomeMultiple + "x income)",
    "stress-test": cfg.country + " stress test (+" + cfg.stressTestRate + "% qualifying rate)",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-2xl">
              <Home className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-balance">
              Inflation-Adjusted Home Affordability Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl text-pretty">
              Find your maximum home purchase price based on income, debts, and rates — then see how inflation has eroded your buying power since 2000.
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/home-affordability-calculator/inflation-adjusted" className="text-gray-900 dark:text-white">Home Affordability Calculator</Link>
        </nav>

        <Suspense fallback={null}>
          <AdBanner size="medium" position="top" slot="5048747585" />
        </Suspense>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Input card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Your Financial Details
              </CardTitle>
              <CardDescription className="text-blue-100">
                Enter your details to calculate your max purchase price
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">

              {/* Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Country / Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCY_CONFIG).map(([code, c]) => (
                      <SelectItem key={code} value={code}>
                        {c.flag} {c.country} ({code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Annual income */}
              <div className="space-y-2">
                <Label htmlFor="income" className="text-sm font-semibold">
                  Annual Gross Income ({cfg.symbol})
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="income"
                    className={`h-12 pl-9 ${inputErrors.annualIncome ? "border-red-500" : ""}`}
                    placeholder={currency === "JPY" ? "e.g. 4,500,000" : "e.g. 85,000"}
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                  />
                </div>
                {inputErrors.annualIncome && (
                  <p className="text-xs text-red-500">{inputErrors.annualIncome}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cfg.country} median: {formatCurrency(cfg.medianIncomeNow)}/yr
                </p>
              </div>

              {/* Down payment */}
              <div className="space-y-2">
                <Label htmlFor="downpayment" className="text-sm font-semibold">
                  Down Payment ({cfg.symbol})
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="downpayment"
                    className={`h-12 pl-9 ${inputErrors.downPayment ? "border-red-500" : ""}`}
                    placeholder={currency === "JPY" ? "e.g. 1,000,000" : "e.g. 40,000"}
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                </div>
                {inputErrors.downPayment && (
                  <p className="text-xs text-red-500">{inputErrors.downPayment}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum: {(cfg.minDownPaymentPct * 100).toFixed(0)}% of purchase price in {cfg.country}
                </p>
              </div>

              {/* Monthly debts */}
              <div className="space-y-2">
                <Label htmlFor="debts" className="text-sm font-semibold">
                  Monthly Debt Payments ({cfg.symbol})
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="debts"
                    className={`h-12 pl-9 ${inputErrors.monthlyDebts ? "border-red-500" : ""}`}
                    placeholder="e.g. 500 (car, student loans...)"
                    value={monthlyDebts}
                    onChange={(e) => setMonthlyDebts(e.target.value)}
                  />
                </div>
                {inputErrors.monthlyDebts && (
                  <p className="text-xs text-red-500">{inputErrors.monthlyDebts}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Car loans, student loans, credit cards — leave blank if none
                </p>
              </div>

              {/* Interest rate */}
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-sm font-semibold">
                  Mortgage Interest Rate (%)
                </Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="rate"
                    className={`h-12 pl-9 ${inputErrors.interestRate ? "border-red-500" : ""}`}
                    placeholder={cfg.avgRateNow.toString()}
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                {inputErrors.interestRate && (
                  <p className="text-xs text-red-500">{inputErrors.interestRate}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current {cfg.country} avg: {cfg.avgRateNow}% · 2010 avg: {cfg.avgRate2010}% · 2000 avg: {cfg.avgRate2000}%
                </p>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                  Uses {cfg.country} lending rules: {(cfg.frontEndDTI * 100).toFixed(0)}/{(cfg.backEndDTI * 100).toFixed(0)} DTI,
                  {cfg.maxIncomeMultiple}x income cap
                  {cfg.stressTestRate > 0 ? `, +${cfg.stressTestRate}% stress test` : ""}.
                  {cfg.mortgageTerm}-year term.
                </AlertDescription>
              </Alert>

              <Button onClick={calculate} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Calculate Affordability
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Results card */}
          <div className="space-y-5">
            {!hasCalculated ? (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 h-full flex flex-col justify-center">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl w-fit mx-auto shadow">
                    <Home className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your results will appear here</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    Fill in your income, down payment, and debts to see your maximum home purchase price — and how much inflation has eroded your buying power since 2000.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-left mt-4">
                    {[
                      "Max purchase price",
                      "Monthly payment",
                      "Inflation impact since 2000",
                      "Affordability rating",
                      "What rates cost you",
                      "DTI breakdown",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <>
                {/* Max price */}
                <Card className={`shadow-xl border-0 border ${affordabilityColors[result.affordabilityStatus].border} ${affordabilityColors[result.affordabilityStatus].bg}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum Purchase Price</p>
                      <Badge className={affordabilityColors[result.affordabilityStatus].badge}>
                        {result.affordabilityStatus.charAt(0).toUpperCase() + result.affordabilityStatus.slice(1)}
                      </Badge>
                    </div>
                    <p className={`text-4xl sm:text-5xl font-bold mb-1 ${affordabilityColors[result.affordabilityStatus].text}`}>
                      {formatCurrency(result.maxPurchasePrice)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(result.maxLoanAmount)} loan + {formatCurrency(result.downPayment)} down
                    </p>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Payment</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.monthlyPayment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Housing-to-Income</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{(result.frontEndRatio * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Debt-to-Income</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{(result.backEndRatio * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Limiting Factor</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{limitingFactorLabels[result.limitingFactor]}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inflation impact */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-purple-900 dark:text-purple-100">
                      <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Inflation Has Eroded Your Buying Power
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your {formatCurrency(result.maxPurchasePrice)} budget equals in 2000 money</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {formatCurrency(result.equivalentPurchasePriceIn2000)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Purchasing power {result.purchasingPowerLostPct > 0 ? "lost" : "gained"}: {Math.abs(result.purchasingPowerLostPct).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">At year-2000 rates ({cfg.avgRate2000}%) your budget would be</p>
                        <p className={`text-2xl font-bold ${result.maxPurchasePriceAt2000Rate > result.maxPurchasePrice ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {formatCurrency(result.maxPurchasePriceAt2000Rate)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {result.maxPurchasePriceAt2000Rate > result.maxPurchasePrice
                            ? `${formatCurrency(result.maxPurchasePriceAt2000Rate - result.maxPurchasePrice)} more buying power`
                            : `${formatCurrency(result.maxPurchasePrice - result.maxPurchasePriceAt2000Rate)} less buying power`}
                        </p>
                      </div>
                    </div>

                    <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                      <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <AlertDescription className="text-purple-900 dark:text-purple-100 text-sm">
                        A buyer with identical income and down payment in 2000 faced a {cfg.avgRate2000}% rate vs your {interestRate}% today.
                        That rate difference alone accounts for a large portion of the affordability gap.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Affordability gauge */}
                <Card className="shadow-xl border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {result.affordabilityStatus === "comfortable" || result.affordabilityStatus === "moderate" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                      DTI Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Housing expense ratio</span>
                        <span className="font-semibold">{(result.frontEndRatio * 100).toFixed(1)}% <span className="text-gray-400 font-normal">/ {(cfg.frontEndDTI * 100).toFixed(0)}% max</span></span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${result.frontEndRatio / cfg.frontEndDTI >= 0.9 ? "bg-orange-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min((result.frontEndRatio / cfg.frontEndDTI) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total debt ratio</span>
                        <span className="font-semibold">{(result.backEndRatio * 100).toFixed(1)}% <span className="text-gray-400 font-normal">/ {(cfg.backEndDTI * 100).toFixed(0)}% max</span></span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${result.backEndRatio / cfg.backEndDTI >= 0.9 ? "bg-orange-500" : "bg-indigo-500"}`}
                          style={{ width: `${Math.min((result.backEndRatio / cfg.backEndDTI) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>

        {/* How It Works */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              How This Calculator Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">1</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Country-Specific Lending Rules</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Each country uses different debt-to-income ratios and income multiples. The US uses a 28/36 rule, the UK caps loans at 4.5x income, Canada applies a stress test, and Australia uses APRA's 3% serviceability buffer.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">2</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">The 28/36 Rule Explained</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Lenders check two ratios: front-end (housing costs should not exceed 28% of gross income) and back-end (all debts should not exceed 36%). We apply both and your maximum price is determined by whichever is more restrictive.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">3</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">How Inflation Affects Buying Power</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  We use official CPI data to convert your maximum purchase price into its 2000 equivalent, showing how much purchasing power inflation has consumed. We also recalculate what your same income and down payment could have bought at year-2000 mortgage rates.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Why Rates Matter More Than Home Prices</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                A $500,000 home at 7% costs $3,327/month. The same home at 4% costs $2,387/month — a $940/month difference. Over 30 years that is $338,400 in additional interest. This is why your affordability ceiling in 2026 is dramatically lower than it would have been in 2020, even if your income is identical.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Inflation compounds this by eroding the real value of your savings and down payment simultaneously, while home prices in many markets have risen faster than wages over the past two decades.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cross-links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-0 shadow-lg">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mortgage Affordability History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">See how the price-to-income ratio has changed from 1987 to today.</p>
              <Link href="/mortgage-calculator">
                <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-700">
                  Mortgage Calculator <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-900 border-0 shadow-lg">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Salary Inflation Calculator</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Check if your salary has kept up with inflation — a key input for affordability.</p>
              <Link href="/salary-calculator">
                <Button variant="outline" size="sm" className="border-green-300 dark:border-green-700">
                  Salary Calculator <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<div className="h-32" />}>
          <AdBanner size="medium" position="bottom" slot="5048747585" />
        </Suspense>

        {/* Blog Section */}
        {blogEssay && (
          <section className="container mx-auto px-4 pb-4">
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Understanding Home Affordability & Inflation
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <div className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  {renderBlogContent(blogEssay)}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Methodology & Data Sources */}
        <section className="container mx-auto px-4 py-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
            <CardHeader className="px-8 pt-8 pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Methodology & Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10 text-gray-700 dark:text-gray-200 px-8 pt-6 pb-10">

              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">Consumer Price Index (CPI) — Inflation Adjustment</h3>
                <p className="leading-relaxed">
                  Inflation adjustment across all 8 currencies is calculated using official Consumer Price Index data sourced from government statistical agencies: the <strong className="font-semibold">US Bureau of Labor Statistics</strong> (CPIAUCSL series, All Urban Consumers) for USD, the <strong className="font-semibold">UK Office for National Statistics</strong> (CPIH index) for GBP, <strong className="font-semibold">Eurostat</strong> (Harmonised Index of Consumer Prices) for EUR, <strong className="font-semibold">Statistics Canada</strong> (Table 18-10-0004-01) for CAD, the <strong className="font-semibold">Australian Bureau of Statistics</strong> (CPI All Groups) for AUD, the <strong className="font-semibold">Swiss Federal Statistical Office</strong> (Landesindex der Konsumentenpreise) for CHF, the <strong className="font-semibold">Statistics Bureau of Japan</strong> (CPI All Items) for JPY, and <strong className="font-semibold">Stats NZ</strong> (Consumers Price Index) for NZD. CPI data is accessed via the Federal Reserve Economic Data (FRED) API maintained by the Federal Reserve Bank of St. Louis, which aggregates and standardizes data from these primary sources.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">Mortgage Rate Data</h3>
                <p className="leading-relaxed">
                  Historical and current mortgage rate benchmarks are sourced from central bank and government publications. US 30-year fixed mortgage rates are drawn from the <strong className="font-semibold">Freddie Mac Primary Mortgage Market Survey</strong> (PMMS), accessed via the FRED API (series MORTGAGE30US). UK rates reference the <strong className="font-semibold">Bank of England</strong> quoted household mortgage rate data. Canadian rates reference the <strong className="font-semibold">Bank of Canada</strong> chartered bank mortgage rate publications. Australian rates reference the <strong className="font-semibold">Reserve Bank of Australia</strong> (RBA) lending rate statistics. Swiss, Japanese, Eurozone, and New Zealand rates reference their respective central bank published benchmark lending rates.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">Lending Rules & Stress Tests</h3>
                <p className="leading-relaxed">
                  Country-specific affordability rules are based on official regulatory guidance. The US 28/36 debt-to-income rule follows <strong className="font-semibold">Fannie Mae and Freddie Mac</strong> conventional loan underwriting guidelines. The UK 4.5x income cap and stress test methodology follows <strong className="font-semibold">Financial Conduct Authority (FCA)</strong> Mortgage Conduct of Business (MCOB) rules and <strong className="font-semibold">Prudential Regulation Authority (PRA)</strong> supervisory guidance. Canada's stress test rate (contract rate plus 2%, minimum 5.25%) follows <strong className="font-semibold">Office of the Superintendent of Financial Institutions (OSFI)</strong> Guideline B-20. Australia's 3% serviceability buffer follows <strong className="font-semibold">APRA</strong> Prudential Practice Guide APG 223. Switzerland's imputed 5% stress rate follows <strong className="font-semibold">FINMA</strong> self-regulatory guidelines. Japan's DTI thresholds follow <strong className="font-semibold">Japan Housing Finance Agency (JHF)</strong> lending standards. New Zealand's 30/40 DTI limits follow <strong className="font-semibold">Reserve Bank of New Zealand</strong> debt-to-income restriction guidance.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">Median Income Benchmarks</h3>
                <p className="leading-relaxed">
                  Median household income figures used as contextual benchmarks are sourced from national statistical agencies: the <strong className="font-semibold">US Census Bureau</strong> (Current Population Survey) for USD, the <strong className="font-semibold">ONS Annual Survey of Hours and Earnings</strong> for GBP, <strong className="font-semibold">Eurostat EU-SILC</strong> survey data for EUR, <strong className="font-semibold">Statistics Canada</strong> for CAD, the <strong className="font-semibold">ABS Survey of Income and Housing</strong> for AUD, the <strong className="font-semibold">Swiss Federal Statistical Office</strong> (SAKE survey) for CHF, the <strong className="font-semibold">Statistics Bureau of Japan</strong> (National Survey of Family Income and Expenditure) for JPY, and <strong className="font-semibold">Stats NZ</strong> (Household Economic Survey) for NZD.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">Calculation Methodology</h3>
                <p className="leading-relaxed">
                  Maximum purchase price is derived from the standard mortgage affordability formula, constrained by the binding DTI limit for each country. Monthly payment capacity is first established from gross income using the applicable front-end ratio. This is then checked against the back-end DTI limit after subtracting existing monthly debt obligations. The lower of the two resulting loan amounts sets the maximum loan, to which the user's down payment is added to produce the maximum purchase price. The inflation comparison is calculated by deflating the nominal maximum purchase price using the cumulative CPI change between the base year (year 2000) and the current period, then recalculating the same buyer's affordability at the prevailing mortgage rate for that base year.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
                This calculator is for informational and educational purposes only. Results are estimates based on standardized lending rules and do not constitute financial advice. Actual loan approval depends on individual credit history, lender policies, property type, and other factors not captured here.
              </p>

            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <Suspense fallback={null}>
          <FAQ category="home-affordability" limit={6} />
        </Suspense>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Home Affordability Calculator</h3>
              <p className="text-gray-300 dark:text-gray-50 mb-6">
                Find your true maximum home purchase price across 8 currencies. Factor in income, down payment, debts, and country-specific lending rules — then see how inflation has eroded your buying power since 2000.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <ul className="text-gray-300 dark:text-gray-50 space-y-2">
                <li>• US Bureau of Labor Statistics</li>
                <li>• UK Office for National Statistics</li>
                <li>• Eurostat</li>
                <li>• Statistics Canada</li>
                <li>• Australian Bureau of Statistics</li>
                <li>• Swiss Federal Statistical Office</li>
                <li>• Statistics Bureau of Japan</li>
                <li>• Statistics New Zealand</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="text-gray-300 dark:text-gray-50 space-y-2">
                <li>
                  <Link href="/" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Home - Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/deflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/global-compound-interest" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Compound Interest Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/global-net-worth-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Global Net Worth Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/ppp-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    PPP Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/auto-loan-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Auto Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/salary-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/retirement-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/student-loan-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Student Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/mortgage-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Mortgage Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Budget Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-fund-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Emergency Fund Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/roi-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/insurance-inflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Insurance Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/legacy-planner" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Legacy Planner
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-4">Last Updated: February 2026</p>
            </div>
          </div>
          <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
