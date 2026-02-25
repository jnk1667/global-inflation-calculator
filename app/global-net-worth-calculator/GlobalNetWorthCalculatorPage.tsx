"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Car,
  Briefcase,
  PiggyBank,
  CreditCard,
  Building,
  Landmark,
  BarChart3,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
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
type AssetCategory = "real_estate" | "vehicles" | "investments" | "savings" | "business" | "other_assets"
type LiabilityCategory = "mortgage" | "auto_loan" | "student_loan" | "credit_card" | "personal_loan" | "other_liabilities"
type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "CHF" | "JPY" | "NZD"

interface AssetItem {
  id: string
  name: string
  value: number
  category: AssetCategory
}

interface LiabilityItem {
  id: string
  name: string
  value: number
  category: LiabilityCategory
}

// --- Currency Data ---
const currencies: Record<Currency, { symbol: string; name: string; inflationRate: number; flag: string; source: string }> = {
  USD: { symbol: "$", name: "US Dollar", inflationRate: 2.8, flag: "🇺🇸", source: "Bureau of Labor Statistics (BLS)" },
  GBP: { symbol: "£", name: "British Pound", inflationRate: 3.2, flag: "🇬🇧", source: "Office for National Statistics (ONS)" },
  EUR: { symbol: "€", name: "Euro", inflationRate: 2.4, flag: "🇪🇺", source: "Eurostat" },
  CAD: { symbol: "CA$", name: "Canadian Dollar", inflationRate: 2.6, flag: "🇨🇦", source: "Statistics Canada" },
  AUD: { symbol: "A$", name: "Australian Dollar", inflationRate: 3.4, flag: "🇦🇺", source: "Australian Bureau of Statistics (ABS)" },
  CHF: { symbol: "Fr", name: "Swiss Franc", inflationRate: 1.1, flag: "🇨🇭", source: "Swiss Federal Statistical Office (FSO)" },
  JPY: { symbol: "¥", name: "Japanese Yen", inflationRate: 3.6, flag: "🇯🇵", source: "Statistics Bureau of Japan" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", inflationRate: 2.9, flag: "🇳🇿", source: "Stats NZ" },
}

const assetCategories: Record<AssetCategory, { label: string; icon: React.ReactNode; color: string }> = {
  real_estate: { label: "Real Estate", icon: <Home className="h-4 w-4" />, color: "text-blue-500" },
  vehicles: { label: "Vehicles", icon: <Car className="h-4 w-4" />, color: "text-purple-500" },
  investments: { label: "Investments", icon: <BarChart3 className="h-4 w-4" />, color: "text-emerald-500" },
  savings: { label: "Savings & Cash", icon: <PiggyBank className="h-4 w-4" />, color: "text-yellow-500" },
  business: { label: "Business", icon: <Briefcase className="h-4 w-4" />, color: "text-orange-500" },
  other_assets: { label: "Other Assets", icon: <DollarSign className="h-4 w-4" />, color: "text-slate-500" },
}

const liabilityCategories: Record<LiabilityCategory, { label: string; icon: React.ReactNode; color: string }> = {
  mortgage: { label: "Mortgage", icon: <Building className="h-4 w-4" />, color: "text-red-500" },
  auto_loan: { label: "Auto Loan", icon: <Car className="h-4 w-4" />, color: "text-orange-500" },
  student_loan: { label: "Student Loan", icon: <Landmark className="h-4 w-4" />, color: "text-yellow-500" },
  credit_card: { label: "Credit Cards", icon: <CreditCard className="h-4 w-4" />, color: "text-pink-500" },
  personal_loan: { label: "Personal Loan", icon: <DollarSign className="h-4 w-4" />, color: "text-purple-500" },
  other_liabilities: { label: "Other Liabilities", icon: <DollarSign className="h-4 w-4" />, color: "text-slate-500" },
}

// --- Helpers ---
const uid = () => Math.random().toString(36).slice(2, 9)

const formatCurrency = (value: number, currency: Currency, compact = false) => {
  const { symbol } = currencies[currency]
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`
    if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getInflationAdjusted = (value: number, rate: number, years: number) =>
  value / Math.pow(1 + rate / 100, years)

const getNetWorthPercentile = (netWorth: number, currency: Currency): string => {
  // Approximate USD equivalents for percentile reference
  const usdMultipliers: Record<Currency, number> = {
    USD: 1, GBP: 1.27, EUR: 1.08, CAD: 0.74, AUD: 0.64, CHF: 1.12, JPY: 0.0066, NZD: 0.59,
  }
  const usdEquivalent = netWorth * usdMultipliers[currency]
  if (usdEquivalent < 0) return "Below Average"
  if (usdEquivalent < 10_000) return "Bottom 20%"
  if (usdEquivalent < 50_000) return "Bottom 40%"
  if (usdEquivalent < 100_000) return "Average"
  if (usdEquivalent < 300_000) return "Top 40%"
  if (usdEquivalent < 750_000) return "Top 20%"
  if (usdEquivalent < 2_000_000) return "Top 10%"
  if (usdEquivalent < 11_000_000) return "Top 1%"
  return "Top 0.1%"
}

// --- Defaults ---
const defaultAssets: AssetItem[] = [
  { id: uid(), name: "Primary Home", value: 400000, category: "real_estate" },
  { id: uid(), name: "401(k) / Pension", value: 150000, category: "investments" },
  { id: uid(), name: "Savings Account", value: 25000, category: "savings" },
  { id: uid(), name: "Vehicle", value: 20000, category: "vehicles" },
]

const defaultLiabilities: LiabilityItem[] = [
  { id: uid(), name: "Home Mortgage", value: 280000, category: "mortgage" },
  { id: uid(), name: "Auto Loan", value: 12000, category: "auto_loan" },
  { id: uid(), name: "Credit Card Balance", value: 5000, category: "credit_card" },
]

// --- Sub-components ---
function AssetRow({
  item,
  currency,
  onUpdate,
  onRemove,
}: {
  item: AssetItem
  currency: Currency
  onUpdate: (id: string, field: keyof AssetItem, value: string | number) => void
  onRemove: (id: string) => void
}) {
  const cat = assetCategories[item.category]
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
      <div className={`shrink-0 ${cat.color}`}>{cat.icon}</div>
      <div className="flex-1 min-w-0">
        <Input
          value={item.name}
          onChange={(e) => onUpdate(item.id, "name", e.target.value)}
          className="h-8 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
          placeholder="Asset name"
        />
      </div>
      <Select value={item.category} onValueChange={(v) => onUpdate(item.id, "category", v)}>
        <SelectTrigger className="h-8 w-[160px] text-xs bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          {Object.entries(assetCategories).map(([key, val]) => (
            <SelectItem key={key} value={key} className="text-xs">{val.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencies[currency].symbol}</span>
        <Input
          type="number"
          value={item.value}
          onChange={(e) => onUpdate(item.id, "value", parseFloat(e.target.value) || 0)}
          className="h-8 w-[130px] pl-6 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
          min={0}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400 shrink-0"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function LiabilityRow({
  item,
  currency,
  onUpdate,
  onRemove,
}: {
  item: LiabilityItem
  currency: Currency
  onUpdate: (id: string, field: keyof LiabilityItem, value: string | number) => void
  onRemove: (id: string) => void
}) {
  const cat = liabilityCategories[item.category]
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
      <div className={`shrink-0 ${cat.color}`}>{cat.icon}</div>
      <div className="flex-1 min-w-0">
        <Input
          value={item.name}
          onChange={(e) => onUpdate(item.id, "name", e.target.value)}
          className="h-8 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
          placeholder="Liability name"
        />
      </div>
      <Select value={item.category} onValueChange={(v) => onUpdate(item.id, "category", v)}>
        <SelectTrigger className="h-8 w-[160px] text-xs bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          {Object.entries(liabilityCategories).map(([key, val]) => (
            <SelectItem key={key} value={key} className="text-xs">{val.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencies[currency].symbol}</span>
        <Input
          type="number"
          value={item.value}
          onChange={(e) => onUpdate(item.id, "value", parseFloat(e.target.value) || 0)}
          className="h-8 w-[130px] pl-6 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
          min={0}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400 shrink-0"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// --- Main Component ---
export default function GlobalNetWorthCalculatorPage() {
  const [currency, setCurrency] = useState<Currency>("USD")
  const [assets, setAssets] = useState<AssetItem[]>(defaultAssets)
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(defaultLiabilities)
  const [projectionYears, setProjectionYears] = useState(10)
  const [annualGrowthRate, setAnnualGrowthRate] = useState(5)
  const [activeTab, setActiveTab] = useState("calculator")
  const [showAssetBreakdown, setShowAssetBreakdown] = useState(true)
  const [showLiabilityBreakdown, setShowLiabilityBreakdown] = useState(true)
  const [blogEssay, setBlogEssay] = useState("")

  useEffect(() => {
    const loadBlogContent = async () => {
      const defaultContent = `## Understanding Your Global Net Worth

Your net worth is the foundation of your financial picture — the difference between everything you own and everything you owe. Our Global Net Worth Calculator helps you track this number across 8 major currencies with inflation-adjusted purchasing power analysis.`

      try {
        const content = await getCachedContent("global_net_worth_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "global_net_worth_essay")
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

  // --- Calculations ---
  const totalAssets = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets])
  const totalLiabilities = useMemo(() => liabilities.reduce((sum, l) => sum + l.value, 0), [liabilities])
  const netWorth = totalAssets - totalLiabilities
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0

  const currencyData = currencies[currency]
  const inflationRate = currencyData.inflationRate

  const realNetWorth10 = getInflationAdjusted(netWorth, inflationRate, 10)
  const realNetWorth20 = getInflationAdjusted(netWorth, inflationRate, 20)
  const realNetWorth30 = getInflationAdjusted(netWorth, inflationRate, 30)

  const projectedNominal = netWorth * Math.pow(1 + annualGrowthRate / 100, projectionYears)
  const projectedReal = getInflationAdjusted(projectedNominal, inflationRate, projectionYears)
  const inflationImpact = projectedNominal - projectedReal

  const percentile = getNetWorthPercentile(netWorth, currency)

  const renderBlogContent = (content: string) => {
    const parseInlineMarkdown = (text: string) => {
      const parts: (string | JSX.Element)[] = []
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

  const assetsByCategory = useMemo(() => {
    const grouped: Partial<Record<AssetCategory, number>> = {}
    assets.forEach((a) => {
      grouped[a.category] = (grouped[a.category] || 0) + a.value
    })
    return grouped
  }, [assets])

  const liabilitiesByCategory = useMemo(() => {
    const grouped: Partial<Record<LiabilityCategory, number>> = {}
    liabilities.forEach((l) => {
      grouped[l.category] = (grouped[l.category] || 0) + l.value
    })
    return grouped
  }, [liabilities])

  // --- Handlers ---
  const updateAsset = useCallback((id: string, field: keyof AssetItem, value: string | number) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }, [])

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const addAsset = useCallback(() => {
    setAssets((prev) => [...prev, { id: uid(), name: "New Asset", value: 0, category: "other_assets" }])
  }, [])

  const updateLiability = useCallback((id: string, field: keyof LiabilityItem, value: string | number) => {
    setLiabilities((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)))
  }, [])

  const removeLiability = useCallback((id: string) => {
    setLiabilities((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const addLiability = useCallback(() => {
    setLiabilities((prev) => [...prev, { id: uid(), name: "New Liability", value: 0, category: "other_liabilities" }])
  }, [])

  const netWorthColor = netWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
  const netWorthBg = netWorth >= 0 ? "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800/40" : "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800/40"

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
              Global Net Worth Calculator
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-pretty">
              Calculate your real net worth across 8 major currencies with inflation-adjusted purchasing power analysis.
              Track assets, liabilities, and see what your wealth is truly worth in today's money.
            </p>
          </div>

          {/* Ad Banner */}
          <div className="mb-8 flex justify-center">
            <AdBanner slot="net-worth-top" format="horizontal" />
          </div>

          {/* Currency Selector */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
              <Globe className="h-4 w-4 text-slate-500" />
              <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
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
                {inflationRate}% inflation
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <TabsTrigger value="calculator">Net Worth</TabsTrigger>
              <TabsTrigger value="inflation">Inflation Impact</TabsTrigger>
              <TabsTrigger value="projection">Projection</TabsTrigger>
            </TabsList>

            {/* ===== CALCULATOR TAB ===== */}
            <TabsContent value="calculator" className="space-y-6">

              {/* Net Worth Summary Card */}
              <Card className={`bg-gradient-to-br ${netWorthBg} border`}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Assets</p>
                      <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalAssets, currency, true)}
                      </p>
                    </div>
                    <div className="border-y md:border-y-0 md:border-x border-slate-200 dark:border-slate-600 py-4 md:py-0">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Net Worth</p>
                      <p className={`text-3xl md:text-4xl font-bold ${netWorthColor}`}>
                        {formatCurrency(netWorth, currency, true)}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                      >
                        {percentile}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Liabilities</p>
                      <p className="text-2xl md:text-3xl font-bold text-red-500 dark:text-red-400">
                        {formatCurrency(totalLiabilities, currency, true)}
                      </p>
                    </div>
                  </div>

                  {/* Debt-to-Asset Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Debt-to-Asset Ratio</span>
                      <span>{debtToAssetRatio.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          debtToAssetRatio < 30 ? "bg-emerald-500" : debtToAssetRatio < 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(debtToAssetRatio, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {debtToAssetRatio < 30 ? "Healthy — below 30% is ideal" : debtToAssetRatio < 60 ? "Moderate — aim to reduce debt" : "High — focus on paying down liabilities"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Assets Section */}
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <CardTitle className="text-slate-900 dark:text-white">Assets</CardTitle>
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-0">
                        {formatCurrency(totalAssets, currency, true)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAssetBreakdown(!showAssetBreakdown)}
                      className="text-slate-500 dark:text-slate-400"
                    >
                      {showAssetBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showAssetBreakdown && (
                  <CardContent className="space-y-3">
                    {/* Category Breakdown */}
                    {Object.entries(assetsByCategory).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {Object.entries(assetsByCategory).map(([cat, val]) => {
                          const catData = assetCategories[cat as AssetCategory]
                          const pct = totalAssets > 0 ? ((val || 0) / totalAssets) * 100 : 0
                          return (
                            <div key={cat} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                              <span className={catData.color}>{catData.icon}</span>
                              <div className="min-w-0">
                                <p className="text-slate-600 dark:text-slate-300 truncate">{catData.label}</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{pct.toFixed(1)}%</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Asset Rows */}
                    <div className="space-y-2">
                      {assets.map((asset) => (
                        <AssetRow
                          key={asset.id}
                          item={asset}
                          currency={currency}
                          onUpdate={updateAsset}
                          onRemove={removeAsset}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAsset}
                      className="w-full border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Asset
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* Liabilities Section */}
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      <CardTitle className="text-slate-900 dark:text-white">Liabilities</CardTitle>
                      <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-0">
                        {formatCurrency(totalLiabilities, currency, true)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLiabilityBreakdown(!showLiabilityBreakdown)}
                      className="text-slate-500 dark:text-slate-400"
                    >
                      {showLiabilityBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showLiabilityBreakdown && (
                  <CardContent className="space-y-3">
                    {/* Category Breakdown */}
                    {Object.entries(liabilitiesByCategory).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {Object.entries(liabilitiesByCategory).map(([cat, val]) => {
                          const catData = liabilityCategories[cat as LiabilityCategory]
                          const pct = totalLiabilities > 0 ? ((val || 0) / totalLiabilities) * 100 : 0
                          return (
                            <div key={cat} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                              <span className={catData.color}>{catData.icon}</span>
                              <div className="min-w-0">
                                <p className="text-slate-600 dark:text-slate-300 truncate">{catData.label}</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{pct.toFixed(1)}%</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Liability Rows */}
                    <div className="space-y-2">
                      {liabilities.map((liability) => (
                        <LiabilityRow
                          key={liability.id}
                          item={liability}
                          currency={currency}
                          onUpdate={updateLiability}
                          onRemove={removeLiability}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addLiability}
                      className="w-full border-dashed border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Liability
                    </Button>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* ===== INFLATION TAB ===== */}
            <TabsContent value="inflation" className="space-y-6">
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    Real Net Worth After Inflation
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Shows the purchasing power of your current net worth in future years, accounting for {currencyData.name} inflation at {inflationRate}% annually.</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Your {currencyData.flag} {currencyData.name} net worth at {inflationRate}% annual inflation — what it actually buys in future years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[
                      { label: "Today", value: netWorth, sub: "Nominal value", color: "border-l-blue-500", badge: "Now" },
                      { label: "In 10 Years", value: realNetWorth10, sub: `Equivalent today: ${formatCurrency(realNetWorth10, currency)}`, color: "border-l-yellow-500", badge: "-" + ((netWorth - realNetWorth10) / netWorth * 100).toFixed(1) + "%" },
                      { label: "In 20 Years", value: realNetWorth20, sub: `Equivalent today: ${formatCurrency(realNetWorth20, currency)}`, color: "border-l-orange-500", badge: "-" + ((netWorth - realNetWorth20) / netWorth * 100).toFixed(1) + "%" },
                      { label: "In 30 Years", value: realNetWorth30, sub: `Equivalent today: ${formatCurrency(realNetWorth30, currency)}`, color: "border-l-red-500", badge: "-" + ((netWorth - realNetWorth30) / netWorth * 100).toFixed(1) + "%" },
                    ].map((row) => (
                      <div key={row.label} className={`p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border-l-4 ${row.color}`}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{row.label}</p>
                          <Badge variant="outline" className="text-xs">{row.badge}</Badge>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(row.value, currency, true)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{row.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Purchasing Power Loss Bar */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Purchasing Power Erosion Over Time</p>
                    {[
                      { label: "10 years", real: realNetWorth10 },
                      { label: "20 years", real: realNetWorth20 },
                      { label: "30 years", real: realNetWorth30 },
                    ].map((row) => {
                      const pct = netWorth > 0 ? (row.real / netWorth) * 100 : 0
                      return (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>Purchasing power in {row.label}</span>
                            <span>{pct.toFixed(1)}% of today</span>
                          </div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-700"
                              style={{ width: `${Math.max(pct, 0)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <strong>Key insight:</strong> At {inflationRate}% annual inflation, your {currencyData.flag} net worth of {formatCurrency(netWorth, currency, true)} will only have the purchasing power of {formatCurrency(realNetWorth10, currency, true)} in 10 years — unless your assets grow to compensate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== PROJECTION TAB ===== */}
            <TabsContent value="projection" className="space-y-6">
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Future Net Worth Projection
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Project your net worth growth, then see what it is truly worth after inflation erodes purchasing power
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Annual Growth Rate: <strong className="text-blue-600 dark:text-blue-400">{annualGrowthRate}%</strong>
                      </Label>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.5}
                        value={annualGrowthRate}
                        onChange={(e) => setAnnualGrowthRate(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>0% (no growth)</span>
                        <span>20% (aggressive)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Projection Period: <strong className="text-blue-600 dark:text-blue-400">{projectionYears} years</strong>
                      </Label>
                      <input
                        type="range"
                        min={1}
                        max={40}
                        step={1}
                        value={projectionYears}
                        onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>1 year</span>
                        <span>40 years</span>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-center">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Current Net Worth</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(netWorth, currency, true)}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">Nominal in {projectionYears}yr</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(projectedNominal, currency, true)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">At {annualGrowthRate}% growth</p>
                    </div>
                    <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-center">
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">Real Value in {projectionYears}yr</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(projectedReal, currency, true)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">After {inflationRate}% inflation</p>
                    </div>
                  </div>

                  {/* Inflation Drag */}
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Inflation Drag on Your Growth</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <span>Real gains</span>
                          <span>{formatCurrency(projectedReal - netWorth, currency, true)}</span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                          {projectedNominal > netWorth && (
                            <>
                              <div
                                className="h-full bg-emerald-500 rounded-l-full"
                                style={{ width: `${((projectedReal - netWorth) / (projectedNominal - netWorth)) * 100}%` }}
                              />
                              <div
                                className="h-full bg-red-400"
                                style={{ width: `${(inflationImpact / (projectedNominal - netWorth)) * 100}%` }}
                              />
                            </>
                          )}
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-emerald-600 dark:text-emerald-400">Real growth</span>
                          <span className="text-red-500 dark:text-red-400">Lost to inflation: {formatCurrency(inflationImpact, currency, true)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benchmark comparisons */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Return Rate Benchmarks</p>
                    <div className="space-y-2">
                      {[
                        { label: "Savings Account", rate: 3.5, note: "Low risk" },
                        { label: "Bonds / Conservative Portfolio", rate: 5, note: "Low-medium risk" },
                        { label: "Balanced Portfolio (60/40)", rate: 7, note: "Medium risk" },
                        { label: "S&P 500 (historical avg)", rate: 10, note: "Higher risk" },
                      ].map((b) => {
                        const nominal = netWorth * Math.pow(1 + b.rate / 100, projectionYears)
                        const real = getInflationAdjusted(nominal, inflationRate, projectionYears)
                        return (
                          <div key={b.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm">
                            <div>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{b.label}</span>
                              <span className="ml-2 text-xs text-slate-500">({b.note}, {b.rate}%)</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-900 dark:text-white font-semibold">{formatCurrency(real, currency, true)}</span>
                              <span className="ml-1 text-xs text-slate-500">real</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ad Banner Mid */}
          <div className="flex justify-center py-8">
            <AdBanner slot="net-worth-mid" format="horizontal" />
          </div>

          {/* Methodology & Data Sources */}
          <section className="container mx-auto px-4 pb-4">
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Methodology & Data Sources
                </CardTitle>
                <CardDescription>
                  How the Global Net Worth Calculator works and where the data comes from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* How it works */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How the Calculator Works</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    The Global Net Worth Calculator uses a three-tab system to give you a complete picture of your financial position. The <strong>Net Worth tab</strong> builds your personal balance sheet by summing all assets across six categories (Real Estate, Investments, Savings, Vehicles, Business, Other) and subtracting all liabilities across six categories (Mortgage, Auto Loan, Student Loan, Credit Cards, Personal Loans, Other). The <strong>Inflation Impact tab</strong> applies each currency&apos;s official annual inflation rate to your current net worth to show its real purchasing power in 10, 20, and 30 years. The <strong>Projection tab</strong> compounds your net worth at a user-selected growth rate and benchmarks it against savings accounts, bonds, balanced portfolios, and long-run equity returns.
                  </p>
                </div>

                {/* Inflation rates */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Official Inflation Rates Used</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                    Each currency&apos;s inflation rate is sourced directly from its respective national statistical agency. These rates are used in the Inflation Impact tab to calculate real purchasing power erosion over time.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(Object.entries(currencies) as [Currency, typeof currencies[Currency]][]).map(([code, data]) => (
                      <div key={code} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{code}</span>
                          <span className="text-primary font-semibold">{data.inflationRate}%</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{data.source}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asset valuation */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Asset Valuation Methodology</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex gap-2">
                      <Home className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div><strong className="text-slate-900 dark:text-white">Real Estate:</strong> Enter current market value (not purchase price). Mortgage balance is entered separately under liabilities. Only equity contributes to net worth.</div>
                    </div>
                    <div className="flex gap-2">
                      <BarChart3 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div><strong className="text-slate-900 dark:text-white">Investments:</strong> Use current market value from your brokerage or retirement account statement — not projected future values.</div>
                    </div>
                    <div className="flex gap-2">
                      <PiggyBank className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div><strong className="text-slate-900 dark:text-white">Savings & Cash:</strong> Sum all account balances including checking, savings, money market, and physical cash.</div>
                    </div>
                    <div className="flex gap-2">
                      <Car className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div><strong className="text-slate-900 dark:text-white">Vehicles:</strong> Use current resale value (e.g. Kelley Blue Book or equivalent). Vehicles depreciate — use today&apos;s value, not purchase price.</div>
                    </div>
                    <div className="flex gap-2">
                      <Briefcase className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div><strong className="text-slate-900 dark:text-white">Business:</strong> Use a conservative estimate based on revenue multiples (1–3×) or EBITDA multiples (4–8×). Business valuations are inherently uncertain.</div>
                    </div>
                    <div className="flex gap-2">
                      <Building className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div><strong className="text-slate-900 dark:text-white">Other Assets:</strong> Include jewellery, collectibles, art, intellectual property, or any other item with verifiable resale value.</div>
                    </div>
                  </div>
                </div>

                {/* Percentile */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Wealth Percentile Benchmarks</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    The wealth percentile estimate is calculated by converting your net worth to USD equivalent using standard exchange rates and comparing against global household wealth distribution benchmarks derived from Credit Suisse Global Wealth Report data and World Bank household surveys. The thresholds are: <strong>Bottom 20%</strong> (below $10,000), <strong>Lower Middle</strong> ($10,000–$50,000), <strong>Middle</strong> ($50,000–$150,000), <strong>Upper Middle</strong> ($150,000–$500,000), <strong>Top 10%</strong> ($500,000–$1,000,000), and <strong>Top 1%</strong> (above $1,000,000). These are global benchmarks — not country-specific — and reflect net worth, not income.
                  </p>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4">
                  Last updated: January 2026 &nbsp;|&nbsp; Inflation rates are reviewed and updated as new official government data is released. This tool is for educational purposes only and does not constitute financial advice.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Blog Section */}
          {blogEssay && (
            <section className="container mx-auto px-4 pb-4">
              <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Understanding Global Net Worth
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
          <section className="container mx-auto px-4 py-12">
            <FAQ category="global_net_worth" title="Global Net Worth Calculator FAQ" />
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Global Net Worth Calculator</h3>
                  <p className="text-gray-300 dark:text-gray-50 mb-6">
                    Calculate your real net worth across 8 currencies with inflation-adjusted purchasing power analysis. Understand what your wealth is truly worth today and into the future.
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
      </div>
    </TooltipProvider>
  )
}
