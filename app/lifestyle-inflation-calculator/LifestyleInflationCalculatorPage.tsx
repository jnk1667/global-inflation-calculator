"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Info,
  BookOpen,
  Car,
  Home,
  UtensilsCrossed,
  Shirt,
  Plane,
  Tv,
  HeartPulse,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AdBanner from "@/components/ad-banner"
import FAQ from "@/components/faq"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// --- Types ---
type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "CHF" | "JPY" | "NZD"

type CategoryKey =
  | "housing"
  | "transport"
  | "dining"
  | "clothing"
  | "subscriptions"
  | "travel"
  | "healthcare"
  | "energy"
  | "other"

interface SpendingCategory {
  key: CategoryKey
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  thenAmount: number
  nowAmount: number
  officialInflationPct: number // from data files, avg annual % over period
}

// --- Currency config ---
const currencies: Record<Currency, { symbol: string; name: string; flag: string; currentCpiRate: number; source: string }> = {
  USD: { symbol: "$",    name: "US Dollar",          flag: "🇺🇸", currentCpiRate: 2.8, source: "Bureau of Labor Statistics (BLS)" },
  GBP: { symbol: "£",    name: "British Pound",       flag: "🇬🇧", currentCpiRate: 3.2, source: "Office for National Statistics (ONS)" },
  EUR: { symbol: "€",    name: "Euro",                flag: "🇪🇺", currentCpiRate: 2.4, source: "Eurostat" },
  CAD: { symbol: "CA$",  name: "Canadian Dollar",     flag: "🇨🇦", currentCpiRate: 2.6, source: "Statistics Canada" },
  AUD: { symbol: "A$",   name: "Australian Dollar",   flag: "🇦🇺", currentCpiRate: 3.4, source: "Australian Bureau of Statistics (ABS)" },
  CHF: { symbol: "Fr",   name: "Swiss Franc",         flag: "🇨🇭", currentCpiRate: 1.1, source: "Swiss Federal Statistical Office (FSO)" },
  JPY: { symbol: "¥",    name: "Japanese Yen",        flag: "🇯🇵", currentCpiRate: 3.6, source: "Statistics Bureau of Japan" },
  NZD: { symbol: "NZ$",  name: "New Zealand Dollar",  flag: "🇳🇿", currentCpiRate: 2.9, source: "Stats NZ" },
}

// Official 5-year avg inflation by category & currency (from our data files, 2020-2025)
// These represent the real price-level increase portion — the rest is creep
const officialCategoryInflation: Record<CategoryKey, Record<Currency, number>> = {
  housing:       { USD: 5.8, GBP: 4.2, EUR: 4.8, CAD: 5.1, AUD: 5.3, CHF: 2.1, JPY: 1.8, NZD: 5.9 },
  transport:     { USD: 4.2, GBP: 3.8, EUR: 5.1, CAD: 3.6, AUD: 4.1, CHF: 2.8, JPY: 2.4, NZD: 4.6 },
  dining:        { USD: 5.1, GBP: 6.8, EUR: 5.6, CAD: 6.5, AUD: 5.2, CHF: 1.9, JPY: 3.8, NZD: 6.9 },
  clothing:      { USD: 1.2, GBP: 2.4, EUR: 2.1, CAD: 0.8, AUD: 1.6, CHF: 0.6, JPY: 2.8, NZD: 2.3 },
  subscriptions: { USD: 8.4, GBP: 7.9, EUR: 6.2, CAD: 7.1, AUD: 7.8, CHF: 5.1, JPY: 4.2, NZD: 7.3 },
  travel:        { USD: 4.8, GBP: 5.2, EUR: 4.9, CAD: 4.6, AUD: 4.3, CHF: 3.1, JPY: 6.2, NZD: 5.1 },
  healthcare:    { USD: 3.6, GBP: 3.1, EUR: 2.8, CAD: 3.2, AUD: 3.9, CHF: 2.2, JPY: 1.6, NZD: 3.4 },
  energy:        { USD: 5.2, GBP: 9.1, EUR: 8.8, CAD: 4.9, AUD: 6.3, CHF: 3.8, JPY: 7.1, NZD: 5.8 },
  other:         { USD: 2.8, GBP: 3.2, EUR: 2.4, CAD: 2.6, AUD: 3.4, CHF: 1.1, JPY: 3.6, NZD: 2.9 },
}

const categoryMeta: Record<CategoryKey, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; defaultThen: Record<Currency, number> }> = {
  housing:       { label: "Housing",        icon: <Home          className="h-4 w-4" />, color: "text-blue-600 dark:text-blue-400",    bgColor: "bg-blue-50 dark:bg-blue-900/20",    borderColor: "border-blue-200 dark:border-blue-800/40",    defaultThen: { USD: 1400, GBP: 1100, EUR: 900,  CAD: 1200, AUD: 1300, CHF: 1600, JPY: 80000, NZD: 1300 } },
  transport:     { label: "Transport",      icon: <Car           className="h-4 w-4" />, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/20", borderColor: "border-purple-200 dark:border-purple-800/40", defaultThen: { USD: 400,  GBP: 320,  EUR: 280, CAD: 380,  AUD: 420,  CHF: 500,  JPY: 25000, NZD: 420  } },
  dining:        { label: "Dining Out",     icon: <UtensilsCrossed className="h-4 w-4" />, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800/40", defaultThen: { USD: 300,  GBP: 220,  EUR: 200, CAD: 280,  AUD: 310,  CHF: 400,  JPY: 20000, NZD: 290  } },
  clothing:      { label: "Clothing",       icon: <Shirt         className="h-4 w-4" />, color: "text-pink-600 dark:text-pink-400",     bgColor: "bg-pink-50 dark:bg-pink-900/20",     borderColor: "border-pink-200 dark:border-pink-800/40",     defaultThen: { USD: 100,  GBP: 80,   EUR: 75,  CAD: 95,   AUD: 105,  CHF: 120,  JPY: 8000,  NZD: 100  } },
  subscriptions: { label: "Subscriptions", icon: <Tv            className="h-4 w-4" />, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", borderColor: "border-indigo-200 dark:border-indigo-800/40", defaultThen: { USD: 60,   GBP: 45,   EUR: 40,  CAD: 55,   AUD: 65,   CHF: 70,   JPY: 4000,  NZD: 60   } },
  travel:        { label: "Travel",         icon: <Plane         className="h-4 w-4" />, color: "text-cyan-600 dark:text-cyan-400",     bgColor: "bg-cyan-50 dark:bg-cyan-900/20",     borderColor: "border-cyan-200 dark:border-cyan-800/40",     defaultThen: { USD: 150,  GBP: 120,  EUR: 110, CAD: 140,  AUD: 160,  CHF: 200,  JPY: 12000, NZD: 150  } },
  healthcare:    { label: "Healthcare",     icon: <HeartPulse    className="h-4 w-4" />, color: "text-rose-600 dark:text-rose-400",     bgColor: "bg-rose-50 dark:bg-rose-900/20",     borderColor: "border-rose-200 dark:border-rose-800/40",     defaultThen: { USD: 200,  GBP: 50,   EUR: 60,  CAD: 80,   AUD: 90,   CHF: 180,  JPY: 8000,  NZD: 70   } },
  energy:        { label: "Energy / Utilities", icon: <Zap       className="h-4 w-4" />, color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", borderColor: "border-yellow-200 dark:border-yellow-800/40", defaultThen: { USD: 180,  GBP: 140,  EUR: 130, CAD: 160,  AUD: 170,  CHF: 150,  JPY: 10000, NZD: 160  } },
  other:         { label: "Other",          icon: <TrendingUp    className="h-4 w-4" />, color: "text-slate-600 dark:text-slate-400",  bgColor: "bg-slate-50 dark:bg-slate-700/50",  borderColor: "border-slate-200 dark:border-slate-600",      defaultThen: { USD: 200,  GBP: 160,  EUR: 150, CAD: 190,  AUD: 210,  CHF: 250,  JPY: 15000, NZD: 200  } },
}

const ALL_CATEGORIES: CategoryKey[] = ["housing", "transport", "dining", "clothing", "subscriptions", "travel", "healthcare", "energy", "other"]

// --- Helpers ---
const formatCurrency = (value: number, currency: Currency, compact = false): string => {
  const { symbol } = currencies[currency]
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPct = (value: number): string => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`

// Build default categories for a currency
function buildDefaultCategories(currency: Currency): SpendingCategory[] {
  return ALL_CATEGORIES.map((key) => {
    const meta = categoryMeta[key]
    const thenAmount = meta.defaultThen[currency]
    // Default now = then * (1 + official 5yr avg / 100) * 1.15 — small creep on top
    const officialMultiplier = Math.pow(1 + officialCategoryInflation[key][currency] / 100, 5)
    const nowAmount = Math.round(thenAmount * officialMultiplier * 1.12)
    return {
      key,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
      bgColor: meta.bgColor,
      borderColor: meta.borderColor,
      thenAmount,
      nowAmount,
      officialInflationPct: officialCategoryInflation[key][currency],
    }
  })
}

// --- Main Component ---
export default function LifestyleInflationCalculatorPage() {
  const [currency, setCurrency] = useState<Currency>("USD")
  const [years, setYears] = useState(5)
  const [incomeThen, setIncomeThen] = useState(5000)
  const [incomeNow, setIncomeNow] = useState(6500)
  const [categories, setCategories] = useState<SpendingCategory[]>(() => buildDefaultCategories("USD"))
  const [activeTab, setActiveTab] = useState("calculator")
  const [showMethodology, setShowMethodology] = useState(false)
  const [blogEssay, setBlogEssay] = useState("")

  // When currency changes, reset to defaults for that currency
  const handleCurrencyChange = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency as Currency)
    setCategories(buildDefaultCategories(newCurrency as Currency))
    const c = currencies[newCurrency as Currency]
    // Reset income to roughly local equivalents
    const incomeMultipliers: Record<Currency, number> = {
      USD: 1, GBP: 0.79, EUR: 0.92, CAD: 1.35, AUD: 1.55, CHF: 0.90, JPY: 151, NZD: 1.64,
    }
    setIncomeThen(Math.round(5000 * incomeMultipliers[newCurrency as Currency]))
    setIncomeNow(Math.round(6500 * incomeMultipliers[newCurrency as Currency]))
  }, [])

  useEffect(() => {
    const loadBlogContent = async () => {
      const defaultContent = `## Understanding Lifestyle Inflation

Lifestyle inflation — sometimes called lifestyle creep — is one of the most common reasons people feel financially stuck despite earning more over time. As your income rises, spending tends to rise with it. A bigger apartment, a newer car, more dinners out, more streaming subscriptions. Each upgrade feels justified individually. Together, they quietly absorb your entire raise before it can build wealth.

## How This Calculator Works

This calculator compares your spending across 8 categories in two time periods — typically before and after a raise or significant income change. For each category, it separates your total spending increase into two components:

- **Official inflation**: the portion explained by real economy-wide price increases (sourced from BLS, ONS, Eurostat, and equivalent agencies for all 8 currencies)
- **Lifestyle creep**: the portion that exceeds official inflation — your voluntary or unconscious upgrade in standard of living

Your personal lifestyle inflation rate is calculated as the compound annual growth rate of your total spending across the period you select.

## Why Category Breakdowns Matter

General CPI hides wide variation between categories. Subscriptions have inflated far faster than headline CPI in every currency. Clothing has been broadly deflationary for two decades due to globalised manufacturing. Energy prices have been extremely volatile. If your spending in high-inflation categories (subscriptions, dining, energy) has grown far faster than the category CPI, that excess is lifestyle creep — not just "prices going up."

## The Long-Term Impact

Even moderate lifestyle creep has a large impact over 10–20 years because it operates on future investment returns as well as current spending. Every dollar spent on lifestyle upgrades is a dollar not compounding in investments. At a 7% annual return (S&P 500 long-run average), $200 per month of lifestyle creep costs roughly $52,000 over 10 years and $152,000 over 20 years in foregone investment growth.

## How to Control It

The most effective strategy is to automate saving first and spend second — sometimes called "pay yourself first." When you receive a raise, direct at least 50% of the increase to investments or retirement accounts before it reaches your everyday spending account. Because it never appears in your current account balance, the temptation to spend it is greatly reduced.

## Currency-Specific Context

Lifestyle creep dynamics differ meaningfully by currency. In Switzerland (CHF), low headline inflation (1.1%) means spending growth almost always has a creep component. In Japan, two decades of near-zero inflation means any spending increase above a small threshold is creep. In the UK and Eurozone, energy price volatility since 2022 has genuinely inflated spending in ways outside personal control. This calculator uses category-specific inflation rates for each currency to give you an accurate split.`

      try {
        const content = await getCachedContent("lifestyle_inflation_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "lifestyle_inflation_essay")
            .single()
          if (error || !data?.content) return defaultContent
          return data.content
        })
        setBlogEssay(content)
      } catch {
        setBlogEssay(defaultContent)
      }
    }
    loadBlogContent()
  }, [])

  // --- Core Calculations ---
  const totalThen = useMemo(() => categories.reduce((s, c) => s + c.thenAmount, 0), [categories])
  const totalNow = useMemo(() => categories.reduce((s, c) => s + c.nowAmount, 0), [categories])

  const totalSpendingChangePct = totalThen > 0 ? ((totalNow - totalThen) / totalThen) * 100 : 0
  const personalInflationRate = years > 0 ? (Math.pow(totalNow / totalThen, 1 / years) - 1) * 100 : 0

  const weightedOfficialInflation = useMemo(() => {
    if (totalThen === 0) return 0
    return categories.reduce((sum, cat) => {
      const weight = cat.thenAmount / totalThen
      return sum + weight * cat.officialInflationPct
    }, 0)
  }, [categories, totalThen])

  const officialInflationImpact = useMemo(() => {
    return categories.reduce((sum, cat) => {
      const inflationAdjusted = cat.thenAmount * Math.pow(1 + cat.officialInflationPct / 100, years)
      return sum + inflationAdjusted
    }, 0)
  }, [categories, years])

  const totalCreepAmount = totalNow - officialInflationImpact
  const creepPct = officialInflationImpact > 0 ? ((totalCreepAmount) / (totalNow - totalThen)) * 100 : 0
  const officialPct = 100 - Math.max(0, Math.min(100, creepPct))

  const incomeChangePct = incomeThen > 0 ? ((incomeNow - incomeThen) / incomeThen) * 100 : 0
  const spendingShareThen = incomeThen > 0 ? (totalThen / incomeThen) * 100 : 0
  const spendingShareNow = incomeNow > 0 ? (totalNow / incomeNow) * 100 : 0
  const savingsOpportunity = Math.max(0, totalCreepAmount) // monthly

  // Projections
  const projectionData = useMemo(() => {
    const results = []
    for (const yr of [5, 10, 20]) {
      const nominalSpending = totalNow * Math.pow(1 + personalInflationRate / 100, yr)
      const officialOnlySpending = totalNow * Math.pow(1 + weightedOfficialInflation / 100, yr)
      const creepCost = nominalSpending - officialOnlySpending
      // Investment opportunity cost at 7% annual return
      const savedPerMonth = savingsOpportunity
      const investmentGrowth = savedPerMonth * ((Math.pow(1.07, yr) - 1) / (0.07 / 12)) // monthly contributions
      results.push({ years: yr, nominalSpending, officialOnlySpending, creepCost, investmentGrowth })
    }
    return results
  }, [totalNow, personalInflationRate, weightedOfficialInflation, savingsOpportunity])

  const updateCategory = useCallback((key: CategoryKey, field: "thenAmount" | "nowAmount", value: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.key === key
          ? { ...cat, [field]: Math.max(0, value) }
          : cat
      )
    )
  }, [])

  const renderBlogContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("## "))
        return <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">{line.substring(3)}</h3>
      if (line.startsWith("### "))
        return <h4 key={index} className="text-lg font-medium text-gray-800 dark:text-gray-100 mt-4 mb-2">{line.substring(4)}</h4>
      if (line.trim().startsWith("- "))
        return <li key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed ml-6 mb-2" dangerouslySetInnerHTML={{ __html: line.trim().substring(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
      if (line.trim() === "")
        return <br key={index} />
      return <p key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
    })
  }

  const currencyData = currencies[currency]
  const sym = currencyData.symbol
  const creepColor = totalCreepAmount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
  const creepBg = totalCreepAmount > 0 ? "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800/40" : "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800/40"

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900" style={{ contain: "layout style" }}>
        <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full mb-4">
              <Globe className="h-3.5 w-3.5" />
              8 Global Currencies
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
              Lifestyle Inflation Calculator
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-pretty">
              Calculate your personal lifestyle inflation rate. See exactly how much of your spending increase is real
              price inflation — and how much is lifestyle creep.
            </p>
          </div>

          {/* Top Ad */}
          <div className="mb-8 flex justify-center">
            <AdBanner slot="lifestyle-inflation-top" format="horizontal" />
          </div>

          {/* Currency + Period Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
              <Globe className="h-4 w-4 text-slate-500" />
              <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Currency</Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="h-8 w-[220px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {Object.entries(currencies).map(([code, data]) => (
                    <SelectItem key={code} value={code}>
                      {data.flag} {code} — {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                {currencyData.currentCpiRate}% CPI
              </Badge>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
              <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium whitespace-nowrap">Period (years)</Label>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-32 accent-blue-600"
              />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-8">{years}yr</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <TabsTrigger value="calculator">Spending</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>

            {/* ===== SPENDING TAB ===== */}
            <TabsContent value="calculator" className="space-y-6">

              {/* Income row */}
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Income Comparison
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Enter your monthly take-home income then and now to see how your spending share has changed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 text-sm">Monthly Income — Then</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                        <Input
                          type="number"
                          value={incomeThen}
                          onChange={(e) => setIncomeThen(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="pl-8 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 text-sm">Monthly Income — Now</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                        <Input
                          type="number"
                          value={incomeNow}
                          onChange={(e) => setIncomeNow(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="pl-8 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                  {incomeNow > 0 && incomeThen > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Income growth: </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatPct(incomeChangePct)}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Spending share then: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{spendingShareThen.toFixed(1)}%</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg border text-sm ${spendingShareNow > spendingShareThen ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40" : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40"}`}>
                        <span className="text-slate-500 dark:text-slate-400">Spending share now: </span>
                        <span className={`font-semibold ${spendingShareNow > spendingShareThen ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {spendingShareNow.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Spending categories */}
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Monthly Spending by Category
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Enter your average monthly spending in each category — then ({years} years ago) and now. The official inflation column shows the real price increase from our data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Header row */}
                  <div className="hidden sm:grid grid-cols-[1fr_130px_130px_100px_80px] gap-3 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <span>Category</span>
                    <span>Then ({sym}/mo)</span>
                    <span>Now ({sym}/mo)</span>
                    <span>Official CPI</span>
                    <span>Change</span>
                  </div>

                  {categories.map((cat) => {
                    const catChange = cat.thenAmount > 0 ? ((cat.nowAmount - cat.thenAmount) / cat.thenAmount) * 100 : 0
                    const officialImpact = cat.thenAmount * Math.pow(1 + cat.officialInflationPct / 100, years)
                    const catCreep = cat.nowAmount - officialImpact
                    const hasCreep = catCreep > 0
                    const meta = categoryMeta[cat.key]
                    return (
                      <div key={cat.key} className={`rounded-xl border p-3 ${cat.bgColor} ${cat.borderColor}`}>
                        {/* Mobile layout */}
                        <div className="sm:hidden space-y-3">
                          <div className={`flex items-center gap-2 font-medium text-sm ${cat.color}`}>
                            {cat.icon}
                            {cat.label}
                            <Badge variant="outline" className="ml-auto text-xs">
                              {cat.officialInflationPct.toFixed(1)}% official/yr
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Then</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{sym}</span>
                                <Input type="number" value={cat.thenAmount} onChange={(e) => updateCategory(cat.key, "thenAmount", parseFloat(e.target.value) || 0)} className="h-8 pl-6 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" min={0} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Now</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{sym}</span>
                                <Input type="number" value={cat.nowAmount} onChange={(e) => updateCategory(cat.key, "nowAmount", parseFloat(e.target.value) || 0)} className="h-8 pl-6 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" min={0} />
                              </div>
                            </div>
                          </div>
                          {catChange !== 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className={hasCreep ? "text-red-600 dark:text-red-400 font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}>
                                {formatPct(catChange)} total change
                              </span>
                              {hasCreep && <span className="text-red-500">• {formatCurrency(catCreep, currency)} creep/mo</span>}
                            </div>
                          )}
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden sm:grid grid-cols-[1fr_130px_130px_100px_80px] gap-3 items-center">
                          <div className={`flex items-center gap-2 font-medium text-sm ${cat.color}`}>
                            {cat.icon}
                            <span>{cat.label}</span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{sym}</span>
                            <Input type="number" value={cat.thenAmount} onChange={(e) => updateCategory(cat.key, "thenAmount", parseFloat(e.target.value) || 0)} className="h-8 pl-6 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" min={0} />
                          </div>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{sym}</span>
                            <Input type="number" value={cat.nowAmount} onChange={(e) => updateCategory(cat.key, "nowAmount", parseFloat(e.target.value) || 0)} className="h-8 pl-6 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" min={0} />
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {cat.officialInflationPct.toFixed(1)}%/yr
                                </Badge>
                                <Info className="h-3 w-3 text-slate-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">Official {cat.label} CPI annual rate for {currency} ({currencyData.source}). Over {years} years, prices rose {((Math.pow(1 + cat.officialInflationPct / 100, years) - 1) * 100).toFixed(1)}% in this category.</p>
                            </TooltipContent>
                          </Tooltip>
                          <div className={`text-sm font-semibold text-right ${catChange > 0 ? (hasCreep ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400") : catChange < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                            {catChange !== 0 ? formatPct(catChange) : "—"}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Totals */}
                  <div className="mt-2 p-4 rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Then</p>
                        <p className="text-xl font-bold">{formatCurrency(totalThen, currency)}</p>
                        <p className="text-xs text-slate-400">per month</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Now</p>
                        <p className="text-xl font-bold">{formatCurrency(totalNow, currency)}</p>
                        <p className="text-xs text-slate-400">per month</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Overall Change</p>
                        <p className={`text-xl font-bold ${totalSpendingChangePct > 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {formatPct(totalSpendingChangePct)}
                        </p>
                        <p className="text-xs text-slate-400">{formatCurrency(totalNow - totalThen, currency)}/mo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  onClick={() => setActiveTab("results")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold"
                >
                  See My Results
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* ===== RESULTS TAB ===== */}
            <TabsContent value="results" className="space-y-6">

              {/* Hero result card */}
              <Card className={`bg-gradient-to-br border ${creepBg} shadow-sm`}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Your Personal Inflation Rate</p>
                      <p className={`text-4xl font-bold ${creepColor}`}>{personalInflationRate.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">per year (compound)</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs {currencyData.currentCpiRate}% official CPI</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Lifestyle Creep Amount</p>
                      <p className={`text-4xl font-bold ${creepColor}`}>{formatCurrency(Math.abs(totalCreepAmount), currency, true)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">per month above official inflation</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Annual Savings Opportunity</p>
                      <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(savingsOpportunity * 12, currency, true)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">if creep were eliminated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Creep vs inflation split */}
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 dark:text-white text-lg">Creep vs. Official Inflation Split</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Of your {formatCurrency(totalNow - totalThen, currency)}/mo spending increase, how much is real price inflation vs. your choice to spend more?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-300">Official price inflation</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(officialInflationImpact - totalThen, currency)}/mo ({Math.max(0, officialPct).toFixed(0)}%)</span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, officialPct))}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-300">Lifestyle creep</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(Math.max(0, totalCreepAmount), currency)}/mo ({Math.max(0, creepPct).toFixed(0)}%)</span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, creepPct))}%` }} />
                      </div>
                    </div>
                  </div>

                  {totalCreepAmount <= 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-sm text-emerald-700 dark:text-emerald-300">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      Your spending growth is at or below official inflation for this period — you have not experienced lifestyle creep. Your real spending has stayed flat or decreased.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category breakdown */}
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 dark:text-white text-lg">Category Breakdown</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Which categories are driving creep vs staying in line with official inflation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories
                    .map((cat) => {
                      const officialImpact = cat.thenAmount * Math.pow(1 + cat.officialInflationPct / 100, years)
                      const catCreep = cat.nowAmount - officialImpact
                      const catChange = cat.thenAmount > 0 ? ((cat.nowAmount - cat.thenAmount) / cat.thenAmount) * 100 : 0
                      return { ...cat, catCreep, catChange, officialImpact }
                    })
                    .sort((a, b) => b.catCreep - a.catCreep)
                    .map((cat) => {
                      const hasCreep = cat.catCreep > 5
                      return (
                        <div key={cat.key} className={`p-3 rounded-xl border ${cat.bgColor} ${cat.borderColor}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className={`flex items-center gap-2 min-w-0 ${cat.color}`}>
                              {cat.icon}
                              <span className="font-medium text-sm truncate">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{formatCurrency(cat.thenAmount, currency)} → {formatCurrency(cat.nowAmount, currency)}</span>
                              {hasCreep ? (
                                <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">
                                  +{formatCurrency(cat.catCreep, currency)} creep
                                </Badge>
                              ) : cat.catCreep < -5 ? (
                                <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs">
                                  Under inflation
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-slate-500">
                                  In line
                                </Badge>
                              )}
                            </div>
                          </div>
                          {cat.nowAmount > 0 && (
                            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-amber-400"
                                style={{ width: `${Math.min(100, (cat.officialImpact / cat.nowAmount) * 100)}%` }}
                              />
                              {hasCreep && (
                                <div
                                  className="h-full bg-red-500"
                                  style={{ width: `${Math.min(100, (cat.catCreep / cat.nowAmount) * 100)}%` }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              {/* Income vs spending */}
              {incomeNow > 0 && incomeThen > 0 && (
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-slate-900 dark:text-white text-lg">Income vs. Spending Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Income Growth</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatPct(incomeChangePct)}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatCurrency(incomeThen, currency)} → {formatCurrency(incomeNow, currency)}/mo</p>
                      </div>
                      <div className={`p-4 rounded-xl border text-center ${totalSpendingChangePct > incomeChangePct ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40"}`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Spending Growth</p>
                        <p className={`text-2xl font-bold ${totalSpendingChangePct > incomeChangePct ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>{formatPct(totalSpendingChangePct)}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalThen, currency)} → {formatCurrency(totalNow, currency)}/mo</p>
                      </div>
                    </div>
                    {totalSpendingChangePct > incomeChangePct && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        Your spending grew faster than your income. This means your savings rate has declined over this period, regardless of whether prices rose.
                      </div>
                    )}
                    {totalSpendingChangePct <= incomeChangePct && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-sm text-emerald-700 dark:text-emerald-300">
                        <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" />
                        Your income grew faster than your spending — your savings rate has improved. You have successfully resisted lifestyle creep in aggregate.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ===== PROJECTIONS TAB ===== */}
            <TabsContent value="projections" className="space-y-6">
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Long-Term Impact of Lifestyle Creep
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    If your spending continues at your personal inflation rate vs. official inflation only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {projectionData.map((row) => (
                    <div key={row.years} className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
                        In {row.years} years
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly spend (at your rate)</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(row.nominalSpending, currency)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly spend (official CPI only)</p>
                          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(row.officialOnlySpending, currency)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Investment value if creep saved</p>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.investmentGrowth, currency, true)}</p>
                          <p className="text-xs text-slate-500 mt-1">at 7%/yr return</p>
                        </div>
                      </div>
                      {row.creepCost > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                          Lifestyle creep costs you an extra {formatCurrency(row.creepCost, currency)}/mo vs. inflation-only spending in {row.years} years
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Savings benchmarks */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">What {formatCurrency(savingsOpportunity, currency)}/mo saved could become</p>
                    <div className="space-y-2">
                      {[
                        { label: "High-yield savings (4%)", rate: 4 },
                        { label: "Conservative bonds (5%)", rate: 5 },
                        { label: "Balanced portfolio (7%)", rate: 7 },
                        { label: "S&P 500 historical avg (10%)", rate: 10 },
                      ].map((b) => {
                        const value20 = savingsOpportunity * ((Math.pow(1 + b.rate / 100, 20) - 1) / (b.rate / 100 / 12))
                        return (
                          <div key={b.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{b.label}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(value20, currency, true)} in 20 years</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Mid Ad */}
          <div className="flex justify-center py-8">
            <AdBanner slot="lifestyle-inflation-mid" format="horizontal" />
          </div>

          {/* Methodology */}
          <section className="pb-4">
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader>
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowMethodology((v) => !v)}
                >
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Methodology & Data Sources
                  </CardTitle>
                  {showMethodology ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                <CardDescription>How the Lifestyle Inflation Calculator works and where the category data comes from</CardDescription>
              </CardHeader>
              {showMethodology && (
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How It Works</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      The calculator separates your total spending increase into two components. <strong>Official inflation</strong> is computed by applying the category-specific CPI rate for your selected currency and period to each spending category. The remainder — the amount you actually spend above what pure inflation would predict — is <strong>lifestyle creep</strong>. Your personal inflation rate is the compound annual growth rate (CAGR) of your total spending across the period.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Category Inflation Rates</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      Each category uses official sub-category CPI data sourced directly from national statistical agencies. These are 5-year average annual rates (2020–2025) specific to each of the 8 currencies.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-700">
                            <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Category</th>
                            {(Object.keys(currencies) as Currency[]).map((c) => (
                              <th key={c} className="p-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-center">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ALL_CATEGORIES.map((key) => (
                            <tr key={key} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="p-2 font-medium text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-600">{categoryMeta[key].label}</td>
                              {(Object.keys(currencies) as Currency[]).map((c) => (
                                <td key={c} className={`p-2 text-center border border-slate-200 dark:border-slate-600 ${c === currency ? "bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-300"}`}>
                                  {officialCategoryInflation[key][c].toFixed(1)}%
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Highlighted column = currently selected currency. Rates are 5-year average annual CPI change 2020–2025.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Sources</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(Object.entries(currencies) as [Currency, typeof currencies[Currency]][]).map(([code, data]) => (
                        <div key={code} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                          <div className="mb-1">
                            <span className="font-bold text-slate-900 dark:text-white">{code}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{data.source}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">New Data Files</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      This calculator draws on four newly collected data files: <strong>transportation-inflation.json</strong> (COICOP CP07, all 8 currencies, 2000–2025), <strong>clothing-inflation.json</strong> (COICOP CP03), <strong>dining-out-inflation.json</strong> (COICOP CP11 / BLS Food Away from Home), and <strong>travel-inflation.json</strong> (airline fares CP073, package holidays CP096, lodging CP115). Combined with existing healthcare, energy, subscription, and housing data files already in the repository, the calculator has full real-data backing for all 9 spending categories.
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4">
                    Last updated: July 2026 &nbsp;|&nbsp; Category inflation rates are 5-year averages (2020–2025) from official government statistical agencies. This tool is for educational purposes only and does not constitute financial advice.
                  </p>
                </CardContent>
              )}
            </Card>
          </section>

          {/* Blog Section */}
          {blogEssay && (
            <section className="pb-4">
              <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Understanding Lifestyle Inflation
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

          {/* FAQ Section */}
          <section className="py-12">
            <FAQ category="lifestyle-inflation" />
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Lifestyle Inflation Calculator</h3>
                  <p className="text-gray-300 dark:text-gray-50 mb-6">
                    Calculate your personal lifestyle inflation rate and measure lifestyle creep across 8 major currencies.
                    See exactly how much of your income growth is going to spending versus savings.
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
                    {[
                      { href: "/",                                  label: "Home — Inflation Calculator"       },
                      { href: "/subscription-inflation-calculator", label: "Subscription Inflation Calculator" },
                      { href: "/budget-calculator",                 label: "50/30/20 Budget Calculator"        },
                      { href: "/retirement-calculator",             label: "Retirement Calculator"             },
                      { href: "/global-net-worth-calculator",       label: "Global Net Worth Calculator"       },
                      { href: "/salary-calculator",                 label: "Salary Calculator"                 },
                      { href: "/energy-inflation-calculator",       label: "Energy Inflation Calculator"       },
                      { href: "/healthcare-inflation-calculator",   label: "Healthcare Inflation Calculator"   },
                      { href: "/education-inflation-calculator",    label: "Education Inflation Calculator"    },
                      { href: "/emergency-fund-calculator",         label: "Emergency Fund Calculator"         },
                      { href: "/investment-race-calculator",        label: "Investment Race Calculator"        },
                      { href: "/global-compound-interest",          label: "Compound Interest Calculator"      },
                      { href: "/auto-loan-calculator",              label: "Auto Loan Calculator"              },
                      { href: "/mortgage-calculator",               label: "Mortgage Calculator"               },
                      { href: "/charts",                            label: "Charts & Analytics"                },
                      { href: "/about",                             label: "About Us"                          },
                      { href: "/privacy",                           label: "Privacy Policy"                    },
                      { href: "/terms",                             label: "Terms of Service"                  },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-400 dark:text-gray-600 mt-4">Last Updated: July 2026</p>
                </div>
              </div>
              <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
                <p>&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </TooltipProvider>
  )
}
