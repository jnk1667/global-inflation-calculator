"use client"

import { useState, useMemo, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts"
import Link from "next/link"
import { Zap, Flame, Car, TrendingUp, TrendingDown, Info, BookOpen, BarChart3 } from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// ─── Types ─────────────────────────────────────────────────────────────────────

type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "CHF" | "JPY" | "NZD"
type EnergyType = "electricity" | "fuel" | "all"
type ViewMode = "cost" | "index"

// ─── Currency config ──────────────────────────────────────────────────────────

const CURRENCIES: Record<CurrencyCode, {
  symbol: string
  name: string
  flag: string
  electricityUnit: string
  fuelUnit: string
  fuelLabel: string
  electricityKey: string
  fuelKey: string
}> = {
  USD: { symbol: "$",   name: "US Dollar",         flag: "🇺🇸", electricityUnit: "ct/kWh",  fuelUnit: "$/gal",   fuelLabel: "Gasoline",  electricityKey: "electricityCentskWh",    fuelKey: "gasolineDollarGallon"  },
  GBP: { symbol: "£",   name: "British Pound",      flag: "🇬🇧", electricityUnit: "p/kWh",   fuelUnit: "p/litre", fuelLabel: "Petrol",    electricityKey: "electricityPencekWh",    fuelKey: "petrolPenceLitre"      },
  EUR: { symbol: "€",   name: "Euro",               flag: "🇪🇺", electricityUnit: "ct/kWh",  fuelUnit: "€/litre", fuelLabel: "Petrol",    electricityKey: "electricityCentskWh",    fuelKey: "petrolEurLitre"        },
  CAD: { symbol: "C$",  name: "Canadian Dollar",    flag: "🇨🇦", electricityUnit: "ct/kWh",  fuelUnit: "C$/L",    fuelLabel: "Petrol",    electricityKey: "electricityCentskWh",    fuelKey: "petrolCadLitre"        },
  AUD: { symbol: "A$",  name: "Australian Dollar",  flag: "🇦🇺", electricityUnit: "ct/kWh",  fuelUnit: "ct/L",    fuelLabel: "Petrol",    electricityKey: "electricityCentskWh",    fuelKey: "petrolCentsLitre"      },
  CHF: { symbol: "Fr",  name: "Swiss Franc",        flag: "🇨🇭", electricityUnit: "ct/kWh",  fuelUnit: "ct/L",    fuelLabel: "Petrol",    electricityKey: "electricityCentskWh",    fuelKey: "petrolCentsLitre"      },
  JPY: { symbol: "¥",   name: "Japanese Yen",       flag: "🇯🇵", electricityUnit: "¥/kWh",   fuelUnit: "¥/L",     fuelLabel: "Petrol",    electricityKey: "electricityYenkWh",      fuelKey: "petrolYenLitre"        },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", electricityUnit: "ct/kWh",  fuelUnit: "ct/L",    fuelLabel: "Petrol",    electricityKey: "electricityCentskWh",    fuelKey: "petrolCentsLitre"      },
}

const MIN_YEAR = 2000
const MAX_YEAR = 2025

// ─── Scenario presets ─────────────────────────────────────────────────────────

const SCENARIOS = [
  { label: "Pre-Crisis Decade",   fromYear: 2000, toYear: 2010, description: "Energy in the 2000s boom" },
  { label: "Green Transition",    fromYear: 2010, toYear: 2020, description: "Renewables rise, shale boom" },
  { label: "Energy Crisis",       fromYear: 2020, toYear: 2025, description: "Post-COVID & Ukraine shock" },
  { label: "Full History",        fromYear: 2000, toYear: 2025, description: "All 25 years of data" },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function EnergyInflationCalculatorPage() {
  const [currency, setCurrency]     = useState<CurrencyCode>("USD")
  const [fromYear, setFromYear]     = useState(2000)
  const [toYear, setToYear]         = useState(2025)
  const [monthlyBill, setMonthlyBill] = useState("150")
  const [energyType, setEnergyType] = useState<EnergyType>("all")
  const [viewMode, setViewMode]     = useState<ViewMode>("index")
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)

  // ─── Data state ────────────────────────────────────────────────────────────
  const [intlData, setIntlData] = useState<Record<string, any> | null>(null)
  const [usData, setUsData] = useState<any[] | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // ─── Load data files ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setDataLoading(true)
      try {
        const [intlRes, usRes] = await Promise.all([
          fetch("/data/energy-prices-international.json"),
          fetch("/data/energy-inflation.json"),
        ])
        if (intlRes.ok) {
          const j = await intlRes.json()
          setIntlData(j.countries ?? null)
        }
        if (usRes.ok) {
          const j = await usRes.json()
          setUsData(j.data ?? null)
        }
      } catch (e) {
        console.error("[v0] Energy data fetch error:", e)
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [])

  // ─── Load blog essay from Supabase ────────────────────────────────────────
  useEffect(() => {
    const loadBlogContent = async () => {
      const defaultContent = `## Energy Inflation: Why Your Bills Keep Rising\n\nEnergy inflation consistently outpaces general CPI in most countries. From electricity deregulation to geopolitical supply shocks, understanding the drivers behind rising energy costs is essential for household planning.`
      try {
        const content = await getCachedContent("energy_inflation_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "energy_inflation_essay")
            .single()
          if (error || !data?.content) return defaultContent
          return data.content
        })
        setBlogContent(content)
      } catch {
        setBlogContent(defaultContent)
      } finally {
        setBlogLoading(false)
      }
    }
    loadBlogContent()
  }, [])

  // ─── Get country data for selected currency ────────────────────────────────
  const countryData = useMemo(() => {
    if (!intlData) return null
    return intlData[currency] ?? null
  }, [intlData, currency])

  const cfg = CURRENCIES[currency]

  // ─── Build chart data ──────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!countryData) return []
    const rows: any[] = []
    for (let y = fromYear; y <= toYear; y++) {
      const yr = String(y)
      const energyCPI  = countryData.energyCPI?.[yr]  ?? null
      const generalCPI = countryData.generalCPI?.[yr] ?? null
      const elec       = countryData[cfg.electricityKey]?.[yr] ?? null
      const fuel       = countryData[cfg.fuelKey]?.[yr] ?? null

      if (energyCPI === null) continue

      rows.push({
        year: y,
        energyCPI:  energyCPI  !== null ? Math.round(energyCPI  * 10) / 10 : null,
        generalCPI: generalCPI !== null ? Math.round(generalCPI * 10) / 10 : null,
        electricity: elec !== null ? Math.round(elec * 100) / 100 : null,
        fuel:        fuel !== null ? Math.round(fuel * 100) / 100 : null,
      })
    }
    return rows
  }, [countryData, cfg, fromYear, toYear])

  // ─── Bill impact calculator ────────────────────────────────────────────────
  const billImpact = useMemo(() => {
    if (!countryData || chartData.length < 2) return null
    const start = chartData[0]
    const end   = chartData[chartData.length - 1]
    if (!start || !end) return null

    const energyChange  = end.energyCPI  && start.energyCPI  ? ((end.energyCPI  / start.energyCPI)  - 1) * 100 : null
    const generalChange = end.generalCPI && start.generalCPI ? ((end.generalCPI / start.generalCPI) - 1) * 100 : null

    const bill = parseFloat(monthlyBill) || 150
    const adjustedBill = energyChange !== null ? bill * (1 + energyChange / 100) : null
    const generalBill  = generalChange !== null ? bill * (1 + generalChange / 100) : null

    return {
      originalBill: bill,
      adjustedBill: adjustedBill ? Math.round(adjustedBill * 100) / 100 : null,
      generalBill:  generalBill  ? Math.round(generalBill  * 100) / 100 : null,
      energyChange:  energyChange  !== null ? Math.round(energyChange  * 10) / 10 : null,
      generalChange: generalChange !== null ? Math.round(generalChange * 10) / 10 : null,
      extraPerMonth: adjustedBill ? Math.round((adjustedBill - bill) * 100) / 100 : null,
      extraPerYear:  adjustedBill ? Math.round((adjustedBill - bill) * 12 * 100) / 100 : null,
      yearsElapsed:  end.year - start.year,
      startYear:     start.year,
      endYear:       end.year,
    }
  }, [countryData, chartData, monthlyBill])

  // ─── Summary stats ─────────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    if (chartData.length < 2) return null
    const start = chartData[0]
    const end   = chartData[chartData.length - 1]

    const energyPct  = start.energyCPI  && end.energyCPI  ? ((end.energyCPI  / start.energyCPI)  - 1) * 100 : null
    const generalPct = start.generalCPI && end.generalCPI ? ((end.generalCPI / start.generalCPI) - 1) * 100 : null
    const elecPct    = start.electricity && end.electricity ? ((end.electricity / start.electricity) - 1) * 100 : null
    const fuelPct    = start.fuel && end.fuel ? ((end.fuel / start.fuel) - 1) * 100 : null

    const years = end.year - start.year || 1
    const energyCAGR = energyPct !== null ? (Math.pow(1 + energyPct / 100, 1 / years) - 1) * 100 : null

    return {
      energyPct:  energyPct  !== null ? Math.round(energyPct  * 10) / 10 : null,
      generalPct: generalPct !== null ? Math.round(generalPct * 10) / 10 : null,
      elecPct:    elecPct    !== null ? Math.round(elecPct    * 10) / 10 : null,
      fuelPct:    fuelPct    !== null ? Math.round(fuelPct    * 10) / 10 : null,
      energyCAGR: energyCAGR !== null ? Math.round(energyCAGR * 100) / 100 : null,
      outpacing:  energyPct !== null && generalPct !== null ? energyPct > generalPct : null,
      gap:        energyPct !== null && generalPct !== null ? Math.round((energyPct - generalPct) * 10) / 10 : null,
    }
  }, [chartData])

  // ─── Bar chart for % change by type ───────────────────────────────────────
  const barData = useMemo(() => {
    if (!summaryStats) return []
    const items = [
      { name: "Energy CPI",   value: summaryStats.energyPct,  fill: "#f97316" },
      { name: "General CPI",  value: summaryStats.generalPct, fill: "#6b7280" },
    ]
    if (summaryStats.elecPct !== null) items.push({ name: "Electricity", value: summaryStats.elecPct, fill: "#eab308" })
    if (summaryStats.fuelPct !== null) items.push({ name: cfg.fuelLabel, value: summaryStats.fuelPct, fill: "#3b82f6" })
    return items.filter(d => d.value !== null)
  }, [summaryStats, cfg.fuelLabel])

  // ─── Formatted values for the absolute price chart ────────────────────────
  const priceChartData = useMemo(() => {
    if (!countryData) return []
    return chartData.map(row => ({
      year:        row.year,
      electricity: row.electricity,
      fuel:        row.fuel,
    })).filter(r => r.electricity !== null || r.fuel !== null)
  }, [chartData, countryData])

  const fmt = (n: number | null, decimals = 1) =>
    n === null ? "N/A" : n.toFixed(decimals)

  const fmtCurrency = (n: number | null) =>
    n === null ? "N/A" : `${cfg.symbol}${Math.abs(n).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const parseBoldAndLinks = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match
    let key = 0
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index))
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex))
    return parts.length > 0 ? parts : [text]
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-orange-50 to-background dark:from-orange-950/20 dark:to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 pt-32 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Zap className="w-3 h-3" />
            Live Energy Data 2000–2025
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-balance mb-3">
            Energy Inflation Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            See how electricity, petrol, and fuel prices have outpaced general inflation since 2000. Enter your monthly energy bill to find out how much more you would pay today. 8 currencies.
          </p>
        </div>
      </section>

      {/* ─── Currency selector ────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">Currency:</span>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  currency === code
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                <span>{CURRENCIES[code].flag}</span>
                {code}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ─── Controls row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Year range */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 sm:col-span-2">
            <h2 className="text-sm font-semibold">Year Range</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <select
                  value={fromYear}
                  onChange={e => setFromYear(Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                >
                  {Array.from({ length: MAX_YEAR - MIN_YEAR }, (_, i) => MIN_YEAR + i).map(y => (
                    <option key={y} value={y} disabled={y >= toYear}>{y}</option>
                  ))}
                </select>
              </div>
              <span className="text-muted-foreground mt-5">→</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <select
                  value={toYear}
                  onChange={e => setToYear(Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                >
                  {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + 1 + i).map(y => (
                    <option key={y} value={y} disabled={y <= fromYear}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Scenario presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SCENARIOS.map(s => (
                <button
                  key={s.label}
                  onClick={() => { setFromYear(s.fromYear); setToYear(s.toYear) }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    fromYear === s.fromYear && toYear === s.toYear
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly bill */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold">Monthly Energy Bill</h2>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Your bill in {fromYear} ({cfg.symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">{cfg.symbol}</span>
                <input
                  type="number"
                  value={monthlyBill}
                  onChange={e => setMonthlyBill(e.target.value)}
                  min="1"
                  step="10"
                  className="w-full border border-border rounded-lg pl-8 pr-3 py-2 text-sm bg-background"
                  placeholder="150"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We calculate what your {fromYear} bill would cost in {toYear} using energy CPI inflation.
            </p>
          </div>
        </div>

        {/* ─── Summary stats cards ────────────────────────────────────────────── */}
        {!dataLoading && summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Energy CPI</span>
              </div>
              <p className={`text-2xl font-bold ${(summaryStats.energyPct ?? 0) >= 0 ? "text-orange-500" : "text-green-600"}`}>
                {summaryStats.energyPct !== null ? `+${fmt(summaryStats.energyPct)}%` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{fromYear}–{toYear}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">General CPI</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summaryStats.generalPct !== null ? `+${fmt(summaryStats.generalPct)}%` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{fromYear}–{toYear}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Electricity</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {summaryStats.elecPct !== null ? `+${fmt(summaryStats.elecPct)}%` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{cfg.electricityUnit}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">{cfg.fuelLabel}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summaryStats.fuelPct !== null ? `+${fmt(summaryStats.fuelPct)}%` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{cfg.fuelUnit}</p>
            </div>
          </div>
        )}

        {dataLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-muted rounded w-2/3 mb-3" />
                <div className="h-7 bg-muted rounded w-1/2 mb-2" />
                <div className="h-2 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* ─── Outpacing banner ──────────────────────────────────────────────── */}
        {summaryStats !== null && summaryStats.outpacing !== null && summaryStats.gap !== null && (
          <div className={`rounded-xl p-4 flex items-start gap-3 ${
            summaryStats.outpacing
              ? "bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
              : "bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800"
          }`}>
            {summaryStats.outpacing
              ? <TrendingUp className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              : <TrendingDown className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            }
            <div>
              <p className="text-sm font-semibold">
                {summaryStats.outpacing
                  ? `Energy inflation outpaced general inflation by ${Math.abs(summaryStats.gap)}% over this period`
                  : `Energy inflation was ${Math.abs(summaryStats.gap)}% below general inflation over this period`
                }
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Energy CPI: +{fmt(summaryStats.energyPct)}% &nbsp;·&nbsp; General CPI: +{fmt(summaryStats.generalPct)}% &nbsp;·&nbsp; CAGR: {fmt(summaryStats.energyCAGR, 2)}%/yr
              </p>
            </div>
          </div>
        )}

        {/* ─── Bill impact calculator ────────────────────────────────────────── */}
        {billImpact && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-sm">Bill Time Machine</h2>
              <span className="text-xs text-muted-foreground ml-1">
                What does your {billImpact.startYear} energy bill cost in {billImpact.endYear}?
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="px-5 py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Your {billImpact.startYear} bill</p>
                <p className="text-3xl font-bold">{fmtCurrency(billImpact.originalBill)}</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
              <div className="px-5 py-4 text-center bg-orange-50 dark:bg-orange-950/20">
                <p className="text-xs text-muted-foreground mb-1">Energy-adjusted ({billImpact.endYear})</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{fmtCurrency(billImpact.adjustedBill)}</p>
                <p className="text-xs text-orange-500 mt-1">+{fmt(billImpact.energyChange)}% energy inflation</p>
              </div>
              <div className="px-5 py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Extra per year</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{fmtCurrency(billImpact.extraPerYear)}</p>
                <p className="text-xs text-muted-foreground mt-1">vs general CPI: {fmtCurrency(billImpact.generalBill)}/mo</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── CPI Index chart ───────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-sm">Energy CPI vs General CPI</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Index: {fromYear} = 100</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("index")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${viewMode === "index" ? "bg-orange-500 text-white border-orange-500" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                CPI Index
              </button>
              <button
                onClick={() => setViewMode("cost")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${viewMode === "cost" ? "bg-orange-500 text-white border-orange-500" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                Absolute Prices
              </button>
            </div>
          </div>

          {dataLoading ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">Loading chart data…</div>
          ) : viewMode === "index" ? (
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name]}
                    labelFormatter={l => `Year: ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={100} stroke="var(--border)" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="energyCPI"
                    name="Energy CPI"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="generalCPI"
                    name="General CPI"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground px-1 mb-2">
                Electricity ({cfg.electricityUnit}) &amp; {cfg.fuelLabel} ({cfg.fuelUnit}) — absolute prices over time
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      name === "electricity" ? `Electricity (${cfg.electricityUnit})` : `${cfg.fuelLabel} (${cfg.fuelUnit})`,
                    ]}
                    labelFormatter={l => `Year: ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend
                    formatter={name =>
                      name === "electricity"
                        ? `Electricity (${cfg.electricityUnit})`
                        : `${cfg.fuelLabel} (${cfg.fuelUnit})`
                    }
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="electricity"
                    name="electricity"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fuel"
                    name="fuel"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ─── % Change bar chart ────────────────────────────────────────────── */}
        {barData.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">Total % Change Comparison</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{fromYear} → {toYear}</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Change"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <ReferenceLine y={0} stroke="var(--border)" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─── Data table ────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Annual Energy Price Data</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {CURRENCIES[currency].name} — {fromYear} to {toYear}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Year</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Energy CPI</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">General CPI</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Electricity<br/><span className="font-normal opacity-70">({cfg.electricityUnit})</span></th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">{cfg.fuelLabel}<br/><span className="font-normal opacity-70">({cfg.fuelUnit})</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {chartData.map((row, i) => (
                  <tr key={row.year} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-2 font-medium">{row.year}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.energyCPI?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.generalCPI?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-yellow-600 dark:text-yellow-400">{row.electricity ?? "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">{row.fuel ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Blog essay ────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">About Energy Inflation</h2>
          </div>
          <div className="px-5 py-5">
            {blogLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-3 bg-muted rounded" style={{ width: `${[92,85,76,60][i-1]}%` }} />)}
              </div>
            ) : (
              <div className="space-y-5 text-foreground/90 leading-relaxed text-sm">
                {blogContent.split("\n").map((line, index) => {
                  const trimmedLine = line.trim()
                  if (!trimmedLine) return null

                  // Table rows — skip (render as plain text would be messy; the table is inline in a paragraph)
                  if (trimmedLine.startsWith("|")) return null

                  // H1
                  if (trimmedLine.startsWith("# ") && !trimmedLine.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-xl font-bold text-foreground mt-6 mb-3">
                        {trimmedLine.substring(2)}
                      </h2>
                    )
                  }

                  // H2
                  if (trimmedLine.startsWith("## ") && !trimmedLine.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-lg font-bold text-foreground mt-6 mb-3">
                        {trimmedLine.substring(3)}
                      </h3>
                    )
                  }

                  // H3
                  if (trimmedLine.startsWith("### ")) {
                    return (
                      <h4 key={index} className="text-base font-semibold text-foreground mt-5 mb-2">
                        {trimmedLine.substring(4)}
                      </h4>
                    )
                  }

                  // List items
                  if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
                    return (
                      <li key={index} className="ml-4 list-disc text-foreground/90">
                        {parseBoldAndLinks(trimmedLine.substring(2))}
                      </li>
                    )
                  }

                  // Regular paragraphs
                  return (
                    <p key={index} className="text-sm leading-7">
                      {parseBoldAndLinks(trimmedLine)}
                    </p>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Methodology ──────────────��────────────────────────────────────── */}
        <div className="bg-muted/30 border border-border rounded-xl p-5">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <h2 className="font-semibold text-sm">Data Sources & Methodology</h2>
          </div>
          <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p><strong className="text-foreground">Energy CPI & General CPI:</strong> Indexed to 2000 = 100 for cross-country comparability. Sources: ONS CPIH energy sub-index D7BT (UK), Eurostat HICP CP04+CP072 (EUR), Stats Japan CPI energy (JPY), Statistics Canada CPI table 18-10-0004-01 (CAD), ABS CPI energy sub-group 6401.0 (AUD), Swiss FSO energy sub-index (CHF), Stats NZ CPI group 4 (NZD), EIA Energy CPI via BLS (USD).</p>
            <p><strong className="text-foreground">Electricity prices:</strong> Ofgem/BEIS domestic p/kWh (UK), BDEW domestic ct/kWh (DE), METI retail ¥/kWh (JP), NEB/StatsCan ct/kWh (CA), AER/AEMC ct/kWh (AU), ElCom H2 household tariff ct/kWh (CH), Electricity Authority NZ ct/kWh (NZ), EIA residential ct/kWh (US).</p>
            <p><strong className="text-foreground">Fuel prices:</strong> BEIS road fuel survey p/litre (UK), ADAC monthly EUR/litre (DE), MLIT weekly JPY/litre (JP), NRCan weekly CAD/litre (CA), AIP/ACCC ct/litre (AU), TCS/AVENERGY ct/litre (CH), MBIE weekly NZD ct/litre (NZ), EIA retail $/gallon (US).</p>
            <p><strong className="text-foreground">Bill Time Machine:</strong> Applies the cumulative energy CPI change from your selected start year to end year to your entered monthly bill. General CPI equivalent is shown for comparison. Does not account for usage changes, home efficiency improvements, or tariff structures.</p>
          </div>
        </div>

        {/* ─── Related tools ──────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-3">Related Calculators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { href: "/",                           label: "Inflation Calculator"          },
              { href: "/deflation-calculator",        label: "Deflation Calculator"         },
              { href: "/shrinkflation-calculator",    label: "Shrinkflation Calculator"     },
              { href: "/insurance-inflation-calculator", label: "Insurance Inflation"        },
              { href: "/budget-calculator",           label: "Budget Calculator"            },
              { href: "/investment-race-calculator",  label: "Investment Race Calculator"   },
            ].map(t => (
              <Link
                key={t.href}
                href={t.href}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <FAQ category="energy" limit={6} />
        </div>

        {/* ─── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="mt-8 bg-gray-900 text-white rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

            {/* Col 1 — Tool name + description */}
            <div>
              <h3 className="text-xl font-bold mb-3">Energy Inflation Calculator</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Track how energy costs — electricity, gas, and fuel — have outpaced or lagged general inflation across 8 currencies since 2000. Powered by official CPI energy sub-indices and IEA/national energy price data.
              </p>
            </div>

            {/* Col 2 — Data Sources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• EIA Energy CPI &amp; Retail Prices (USD)</li>
                <li>• ONS CPIH Energy Sub-index D7BT (GBP)</li>
                <li>• Eurostat HICP CP04+CP072 (EUR)</li>
                <li>• Statistics Canada CPI Table 18-10-0004 (CAD)</li>
                <li>• ABS CPI Energy Sub-group 6401.0 (AUD)</li>
                <li>• Swiss FSO Energy Sub-index (CHF)</li>
                <li>• Statistics Bureau of Japan CPI (JPY)</li>
                <li>• Stats NZ CPI Group 4 (NZD)</li>
              </ul>
            </div>

            {/* Col 3 — Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/",                                                label: "Home - Inflation Calculator"      },
                  { href: "/mortgage-calculator",                              label: "Mortgage Calculator"              },
                  { href: "/home-affordability-calculator/inflation-adjusted", label: "Home Affordability Calculator"    },
                  { href: "/deflation-calculator",                             label: "Deflation Calculator"             },
                  { href: "/shrinkflation-calculator",                         label: "Shrinkflation Calculator"         },
                  { href: "/skimpflation-calculator",                          label: "Skimpflation Calculator"          },
                  { href: "/sneakflation-calculator",                          label: "Sneakflation Calculator"          },
                  { href: "/subscription-inflation-calculator",                label: "Subscription Inflation Calculator" },
                  { href: "/charts",                                           label: "Charts & Analytics"               },
                  { href: "/investment-race-calculator",                       label: "Investment Race Calculator"       },
                  { href: "/global-compound-interest",                         label: "Compound Interest Calculator"     },
                  { href: "/global-net-worth-calculator",                      label: "Global Net Worth Calculator"      },
                  { href: "/ppp-calculator",                                   label: "PPP Calculator"                   },
                  { href: "/auto-loan-calculator",                             label: "Auto Loan Calculator"             },
                  { href: "/salary-calculator",                                label: "Salary Calculator"                },
                  { href: "/salary-calculator/regional-cost-of-living",        label: "Regional Cost of Living"          },
                  { href: "/retirement-calculator",                            label: "Retirement Calculator"            },
                  { href: "/student-loan-calculator",                          label: "Student Loan Calculator"          },
                  { href: "/budget-calculator",                                label: "Budget Calculator"                },
                  { href: "/emergency-fund-calculator",                        label: "Emergency Fund Calculator"        },
                  { href: "/roi-calculator",                                   label: "ROI Calculator"                   },
                  { href: "/insurance-inflation-calculator",                   label: "Insurance Inflation Calculator"   },
                  { href: "/legacy-planner",                                   label: "Legacy Planner"                   },
                  { href: "/education-inflation-calculator",                   label: "Education Inflation Calculator"   },
                  { href: "/dateflation-calculator",                           label: "Dateflation Calculator"           },
                  { href: "/about",                                            label: "About Us"                         },
                  { href: "/privacy",                                          label: "Privacy Policy"                   },
                  { href: "/terms",                                            label: "Terms of Service"                 },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-300 hover:text-blue-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-4">Last Updated: April 2026</p>
            </div>

          </div>
          <div className="border-t border-gray-700 px-8 py-6 text-center">
            <p className="text-sm text-gray-400">&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
          </div>
        </footer>

      </div>
    </main>
  )
}
