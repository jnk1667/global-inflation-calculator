"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts"
import Link from "next/link"
import {
  Heart, TrendingUp, DollarSign, Info, AlertTriangle,
  ChevronDown, ChevronUp, Calendar, Coffee, Utensils, Zap,
  Beer, Home, ShieldCheck, ShieldAlert,
} from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CpiEntry { year: number; index: number }
interface CpiData  { data: CpiEntry[]; seriesName: string; source: string; sourceUrl: string }
interface CpiFile  { USD: CpiData; GBP: CpiData; CAD: CpiData; AUD: CpiData; JPY: CpiData }

interface SurveyPoint {
  year: number
  averageCostPerDate: number
  isDirectSurvey: boolean
}
interface SurveyCurrency {
  dataQuality: "solid" | "thin"
  surveyDataPoints: SurveyPoint[]
  cpiBackfilledDataPoints: SurveyPoint[]
  primarySource: string
}
interface SurveyFile {
  USD: SurveyCurrency; GBP: SurveyCurrency; CAD: SurveyCurrency
  AUD: SurveyCurrency; JPY: SurveyCurrency
}

// ─── Currency config ──────────────────────────────────────────────────────────

const CURRENCIES = {
  USD: { symbol: "$",    name: "US Dollar",        flag: "🇺🇸", dataQuality: "solid" as const, badge: "High Confidence" },
  GBP: { symbol: "£",   name: "British Pound",     flag: "🇬🇧", dataQuality: "solid" as const, badge: "High Confidence" },
  CAD: { symbol: "CA$", name: "Canadian Dollar",   flag: "🇨🇦", dataQuality: "thin"  as const, badge: "Estimated Baseline" },
  AUD: { symbol: "A$",  name: "Australian Dollar", flag: "🇦🇺", dataQuality: "thin"  as const, badge: "Estimated Baseline" },
  JPY: { symbol: "¥",   name: "Japanese Yen",      flag: "🇯🇵", dataQuality: "solid" as const, badge: "High Confidence" },
} as const

type CurrencyCode = keyof typeof CURRENCIES

// ─── Date type presets ────────────────────────────────────────────────────────

interface DateTypePreset {
  id: string
  label: string
  icon: React.ReactNode
  costs: Record<CurrencyCode, number>
}

const DATE_TYPES: DateTypePreset[] = [
  {
    id: "dinner_and_drinks",
    label: "Dinner & Drinks",
    icon: <Utensils className="w-4 h-4" />,
    costs: { USD: 190, GBP: 120, CAD: 173, AUD: 185, JPY: 14000 },
  },
  {
    id: "coffee_and_walk",
    label: "Coffee & Walk",
    icon: <Coffee className="w-4 h-4" />,
    costs: { USD: 40, GBP: 28, CAD: 34, AUD: 36, JPY: 3500 },
  },
  {
    id: "activity_date",
    label: "Activity Date",
    icon: <Zap className="w-4 h-4" />,
    costs: { USD: 175, GBP: 120, CAD: 160, AUD: 190, JPY: 15000 },
  },
  {
    id: "drinks_only",
    label: "Drinks Only",
    icon: <Beer className="w-4 h-4" />,
    costs: { USD: 120, GBP: 82, CAD: 110, AUD: 125, JPY: 8000 },
  },
  {
    id: "home_date",
    label: "Home / Cook Together",
    icon: <Home className="w-4 h-4" />,
    costs: { USD: 97, GBP: 62, CAD: 80, AUD: 90, JPY: 6000 },
  },
]

// Survey year anchors (2026 current costs for presets) ─ from data files
const CURRENT_COSTS_2026: Record<CurrencyCode, number> = {
  USD: 189, GBP: 120, CAD: 174, AUD: 184, JPY: 12500,
}

const MAX_YEAR = 2026
const MIN_YEAR = 2015

// ─── Helper: format currency ──────────────────────────────────────────────────

function fmt(value: number, currency: CurrencyCode) {
  const { symbol } = CURRENCIES[currency]
  if (currency === "JPY") return `${symbol}${Math.round(value).toLocaleString()}`
  return `${symbol}${value.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DateflationCalculatorPage() {
  const [currency, setCurrency]           = useState<CurrencyCode>("USD")
  const [dateType, setDateType]           = useState<DateTypePreset>(DATE_TYPES[0])
  const [oldYear, setOldYear]             = useState(2019)
  const [oldCostInput, setOldCostInput]   = useState("")
  const [currentCostInput, setCurrentCostInput] = useState("")
  const [datesPerMonth, setDatesPerMonth] = useState(1)
  const [includePreDate, setIncludePreDate] = useState(false)
  const [groomingCost, setGroomingCost]   = useState("")
  const [transportCost, setTransportCost] = useState("")
  const [appCost, setAppCost]             = useState("")
  const [hasCalculated, setHasCalculated] = useState(false)
  const [openSection, setOpenSection]     = useState<string | null>(null)

  // Data
  const [cpiData, setCpiData]       = useState<CpiFile | null>(null)
  const [surveyData, setSurveyData] = useState<SurveyFile | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Blog
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)

  // Load blog
  useEffect(() => {
    const defaultContent = "## The Dateflation Nobody Budgeted For\n\nDating costs have risen far faster than official inflation over the past decade."
    const load = async () => {
      try {
        const content = await getCachedContent("dateflation_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "dateflation_essay")
            .single()
          if (error || !data?.content) return defaultContent
          return data.content
        })
        setBlogContent(content)
      } catch { setBlogContent(defaultContent) }
      finally  { setBlogLoading(false) }
    }
    load()
  }, [])

  // Load data files
  const loadData = useCallback(async () => {
    if (dataLoaded) return
    try {
      const [cpiRes, surveyRes] = await Promise.all([
        fetch("/data/dateflation-cpi-indices.json"),
        fetch("/data/dateflation-survey-data.json"),
      ])
      const [cpi, survey] = await Promise.all([cpiRes.json(), surveyRes.json()])
      setCpiData(cpi)
      setSurveyData(survey)
      setDataLoaded(true)
    } catch { setDataLoaded(true) }
  }, [dataLoaded])

  // Auto-fill old cost from survey data when currency or oldYear changes
  useEffect(() => {
    if (!surveyData) return
    const currData = surveyData[currency]
    if (!currData) return
    const allPoints = [...currData.surveyDataPoints, ...currData.cpiBackfilledDataPoints]
    const match = allPoints.find(p => p.year === oldYear)
    if (match) {
      setOldCostInput(String(match.averageCostPerDate))
    }
  }, [currency, oldYear, surveyData])

  // Auto-fill current cost from preset on currency/dateType change
  useEffect(() => {
    setCurrentCostInput(String(CURRENT_COSTS_2026[currency]))
  }, [currency])

  // Apply date type preset costs
  const applyDateType = (dt: DateTypePreset) => {
    setDateType(dt)
    setCurrentCostInput(String(dt.costs[currency]))
    loadData()
  }

  // Switch currency
  const switchCurrency = (code: CurrencyCode) => {
    setCurrency(code)
    setCurrentCostInput(String(DATE_TYPES.find(d => d.id === dateType.id)?.costs[code] ?? ""))
    loadData()
  }

  // ─── Core calculations ──────────────────────────────────────────────────────

  const results = useMemo(() => {
    const oldCost = parseFloat(oldCostInput)
    const currentCost = parseFloat(currentCostInput)
    const grooming = includePreDate ? (parseFloat(groomingCost) || 0) : 0
    const transport = includePreDate ? (parseFloat(transportCost) || 0) : 0
    const apps = includePreDate ? (parseFloat(appCost) || 0) : 0

    if (!oldCost || !currentCost || oldCost <= 0 || currentCost <= 0) return null
    if (MAX_YEAR <= oldYear) return null

    const totalOldCostPerDate = oldCost
    const totalCurrentCostPerDate = currentCost + grooming + transport + (apps / 12)
    const yearsBetween = MAX_YEAR - oldYear

    // Total dateflation
    const dateflationPct = ((totalCurrentCostPerDate / totalOldCostPerDate) - 1) * 100
    const annualizedRate = (Math.pow(totalCurrentCostPerDate / totalOldCostPerDate, 1 / yearsBetween) - 1) * 100

    // Annual spend
    const datesPerYear = datesPerMonth * 12
    const annualOld     = totalOldCostPerDate * datesPerYear
    const annualCurrent = totalCurrentCostPerDate * datesPerYear
    const annualExtra   = annualCurrent - annualOld

    // CPI benchmark
    let cpiOverPeriod: number | null = null
    let excessOverCpi: number | null = null

    if (cpiData) {
      const series = cpiData[currency]?.data
      if (series) {
        const startEntry = series.find(e => e.year === oldYear)
        const endEntry   = series.find(e => e.year === MAX_YEAR) || series[series.length - 1]
        if (startEntry && endEntry) {
          cpiOverPeriod = ((endEntry.index / startEntry.index) - 1) * 100
          excessOverCpi = dateflationPct - cpiOverPeriod
        }
      }
    }

    // Inflation tax (total overpayment above CPI-adjusted baseline)
    let inflationTaxPerDate: number | null = null
    let annualInflationTax: number | null  = null
    if (cpiOverPeriod !== null) {
      const cpiAdjustedCost = totalOldCostPerDate * (1 + cpiOverPeriod / 100)
      inflationTaxPerDate = totalCurrentCostPerDate - cpiAdjustedCost
      annualInflationTax  = inflationTaxPerDate * datesPerYear
    }

    // Forward projections at current annualized rate
    const proj3yr = totalCurrentCostPerDate * Math.pow(1 + annualizedRate / 100, 3)
    const proj5yr = totalCurrentCostPerDate * Math.pow(1 + annualizedRate / 100, 5)

    return {
      totalOldCostPerDate,
      totalCurrentCostPerDate,
      dateflationPct,
      annualizedRate,
      datesPerYear,
      annualOld,
      annualCurrent,
      annualExtra,
      cpiOverPeriod,
      excessOverCpi,
      inflationTaxPerDate,
      annualInflationTax,
      yearsBetween,
      proj3yr,
      proj5yr,
    }
  }, [
    oldCostInput, currentCostInput, oldYear, datesPerMonth,
    includePreDate, groomingCost, transportCost, appCost,
    currency, cpiData,
  ])

  // ─── Chart data ─────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!results || !cpiData || !surveyData) return []

    const currCpi = cpiData[currency]?.data
    const currSurvey = surveyData[currency]
    if (!currCpi || !currSurvey) return []

    const allSurveyPoints: Record<number, number> = {}
    ;[...currSurvey.surveyDataPoints, ...currSurvey.cpiBackfilledDataPoints].forEach(p => {
      allSurveyPoints[p.year] = p.averageCostPerDate
    })

    // Build from oldYear to MAX_YEAR
    const startEntry = currCpi.find(e => e.year === oldYear)
    const startCost  = parseFloat(oldCostInput) || allSurveyPoints[oldYear] || 0
    if (!startEntry || !startCost) return []

    return currCpi
      .filter(e => e.year >= oldYear && e.year <= MAX_YEAR)
      .map(e => {
        const cpiAdjusted = startCost * (e.index / startEntry.index)
        const actual = allSurveyPoints[e.year] ?? null
        return {
          year: e.year,
          "CPI-Adjusted Baseline": parseFloat(cpiAdjusted.toFixed(0)),
          "Actual Date Cost": actual,
        }
      })
  }, [results, cpiData, surveyData, currency, oldYear, oldCostInput])

  // ─── Severity helper ─────────────────────────────────────────────────────────

  const getSeverity = (pct: number) => {
    if (pct >= 50) return { label: "Extreme",  color: "text-red-700 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800"     }
    if (pct >= 25) return { label: "High",     color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" }
    if (pct >= 10) return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400",  bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" }
    return               { label: "Low",       color: "text-green-600 dark:text-green-400",    bg: "bg-green-50 dark:bg-green-900/20",   border: "border-green-200 dark:border-green-800"  }
  }

  const sym = CURRENCIES[currency].symbol
  const isJPY = currency === "JPY"
  const isThin = CURRENCIES[currency].dataQuality === "thin"

  const yearOptions = Array.from({ length: MAX_YEAR - MIN_YEAR }, (_, i) => MIN_YEAR + i)

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="container mx-auto px-4 sm:px-6 pt-[152px] sm:pt-28 pb-12 max-w-4xl min-h-screen font-sans">

      {/* ── Hero ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-semibold px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800 mb-4">
          <Heart className="w-3.5 h-3.5" />
          Dating costs are rising faster than inflation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3 text-balance leading-tight">
          Free Dateflation Calculator 2026
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-pretty">
          How much more expensive has dating become? Enter your old vs current date costs and see
          your personal dateflation rate, annual extra spend, and how far it outpaces official CPI.
        </p>
      </div>

      {/* ── Currency selector ── */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
          <button
            key={code}
            onClick={() => { switchCurrency(code); loadData() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              currency === code
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-rose-400"
            }`}
          >
            <span>{CURRENCIES[code].flag}</span>
            <span>{code}</span>
          </button>
        ))}
      </div>

      {/* ── Data quality badge ── */}
      <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 mb-6 ${
        isThin
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
      }`}>
        {isThin
          ? <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          : <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        }
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            isThin ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
          }`}>
            {CURRENCIES[currency].badge}
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
            {currency === "USD" && "Based on the BMO Real Financial Progress Index (Ipsos, n=2,500 US adults, 2025–2026). CPI trend from BLS 'Food Away From Home' sub-index — the most accurate US proxy for dining-out costs."}
            {currency === "GBP" && "Based on the Velloy Dating Index 2024 (n=4,000 UK adults) and Barclays 2025 cost-of-dating report. CPI trend from ONS CPIH 'Restaurants & Cafes' sub-index (series L557, 2015=100)."}
            {currency === "CAD" && "Direct survey data for 2025–2026 from BMO Canada (Ipsos, n=2,500). Years prior to 2025 are estimated using Statistics Canada 'Food Purchased from Restaurants' CPI sub-index. CPI trend is official; earlier per-date costs are calculated estimates."}
            {currency === "AUD" && "One direct data point: AUD $154 (Yahoo Finance AUS, July 2022). All other years estimated using ABS 'Meals Out and Take Away Foods' CPI sub-index. CPI trend is official; per-date baseline is from a single survey source."}
            {currency === "JPY" && "Multiple independent Japanese surveys: trami.jp 2023, kanetohonne.jp 2024, laskoi.jp 2025. CPI from Statistics Bureau of Japan 'Eating Out' (外食) sub-index. Note: Japanese costs shown are the man's typical share — men traditionally pay more."}
          </p>
        </div>
      </div>

      {/* ── Date type selector ── */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2 uppercase tracking-wide font-medium">
          What kind of dates do you go on?
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {DATE_TYPES.map((dt) => (
            <button
              key={dt.id}
              onClick={() => applyDateType(dt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                dateType.id === dt.id
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-rose-400"
              }`}
            >
              {dt.icon}
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calculator card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600" />
          Your date costs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

          {/* Old */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Then</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Year
                </label>
                <select
                  value={oldYear}
                  onChange={(e) => { setOldYear(Number(e.target.value)); loadData() }}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Cost per date ({sym})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={oldCostInput}
                  onChange={(e) => setOldCostInput(e.target.value)}
                  placeholder={isJPY ? "e.g. 8000" : "e.g. 80"}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Pre-filled from survey data — edit freely
                </p>
              </div>
            </div>
          </div>

          {/* Current */}
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Now (2026)</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Cost per date ({sym})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentCostInput}
                onChange={(e) => setCurrentCostInput(e.target.value)}
                placeholder={isJPY ? "e.g. 12500" : "e.g. 150"}
                className="w-full border border-rose-200 dark:border-rose-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Pre-filled from 2026 survey data
              </p>
            </div>
          </div>
        </div>

        {/* Dates per month */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How many dates per month?
          </label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 6, 8].map((n) => (
              <button
                key={n}
                onClick={() => setDatesPerMonth(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  datesPerMonth === n
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-rose-400"
                }`}
              >
                {n}x
              </button>
            ))}
          </div>
        </div>

        {/* Pre-date costs toggle */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <button
            onClick={() => setIncludePreDate(!includePreDate)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-600 transition-colors"
          >
            {includePreDate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Include pre-date costs (grooming, transport, apps)
          </button>

          {includePreDate && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                { label: `Grooming per date (${sym})`, value: groomingCost, set: setGroomingCost, placeholder: isJPY ? "2000" : "25" },
                { label: `Transport per date (${sym})`, value: transportCost, set: setTransportCost, placeholder: isJPY ? "800" : "15" },
                { label: `Dating apps / month (${sym})`, value: appCost, set: setAppCost, placeholder: isJPY ? "3000" : "15" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculate button */}
        <button
          onClick={() => { setHasCalculated(true); loadData() }}
          className="mt-5 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
        >
          Calculate My Dateflation Rate
        </button>
      </div>

      {/* ── Results ── */}
      {hasCalculated && results && (
        <>
          {(() => {
            const sev = getSeverity(Math.abs(results.dateflationPct))
            return (
              <div className={`rounded-2xl border ${sev.border} ${sev.bg} p-6 mb-6`}>
                {/* Headline */}
                <div className="text-center mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Your Dateflation Rate ({results.yearsBetween}-year total)
                  </p>
                  <div className={`text-5xl font-bold mb-2 ${sev.color}`}>
                    {results.dateflationPct >= 0 ? "+" : ""}{results.dateflationPct.toFixed(1)}%
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sev.bg} ${sev.color} border ${sev.border}`}>
                    {sev.label}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {oldYear} → 2026 &bull; {results.annualizedRate.toFixed(1)}% annualised CAGR
                  </p>
                </div>

                {/* 4 stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    {
                      label: "Cost Per Date Then",
                      value: fmt(results.totalOldCostPerDate, currency),
                      sub: String(oldYear),
                      icon: <Calendar className="w-4 h-4 text-blue-500" />,
                      bg: "bg-white dark:bg-gray-800",
                    },
                    {
                      label: "Cost Per Date Now",
                      value: fmt(results.totalCurrentCostPerDate, currency),
                      sub: "2026",
                      icon: <DollarSign className="w-4 h-4 text-rose-500" />,
                      bg: "bg-white dark:bg-gray-800",
                    },
                    {
                      label: "Annual Extra Spend",
                      value: fmt(results.annualExtra, currency),
                      sub: `${results.datesPerYear} dates/year`,
                      icon: <TrendingUp className="w-4 h-4 text-orange-500" />,
                      bg: "bg-white dark:bg-gray-800",
                    },
                    {
                      label: "Annual Dating Spend",
                      value: fmt(results.annualCurrent, currency),
                      sub: "at current rate",
                      icon: <Heart className="w-4 h-4 text-rose-500" />,
                      bg: "bg-white dark:bg-gray-800",
                    },
                  ].map(({ label, value, sub, icon, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100 dark:border-gray-700`}>
                      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-xs text-gray-500 dark:text-gray-400">{label}</span></div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* CPI comparison */}
                {results.cpiOverPeriod !== null && results.excessOverCpi !== null && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Dateflation vs Official CPI
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Your dateflation rate", value: `${results.dateflationPct >= 0 ? "+" : ""}${results.dateflationPct.toFixed(1)}%`, color: "text-rose-600 dark:text-rose-400" },
                        { label: `Eating-out CPI (${oldYear}–2026)`, value: `+${results.cpiOverPeriod.toFixed(1)}%`, color: "text-blue-600 dark:text-blue-400" },
                        { label: "Excess above CPI", value: `${results.excessOverCpi >= 0 ? "+" : ""}${results.excessOverCpi.toFixed(1)}%`, color: results.excessOverCpi > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                          <span className={`text-sm font-semibold ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    {results.annualInflationTax !== null && (
                      <div className={`mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between`}>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Your Dating Inflation Tax</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Extra paid per year above CPI-adjusted cost</p>
                        </div>
                        <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {fmt(results.annualInflationTax, currency)}/yr
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Forward projections */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    Forward Projection (at current annualised rate)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "3 years from now", value: fmt(results.proj3yr, currency), sub: "per date in 2029" },
                      { label: "5 years from now", value: fmt(results.proj5yr, currency), sub: "per date in 2031" },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── Chart ── */}
          {chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Date Cost Trajectory vs CPI-Adjusted Baseline
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Red line = actual survey/estimated costs. Blue dashed = what costs would be if they only rose with the eating-out CPI.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => isJPY ? `¥${(v/1000).toFixed(0)}k` : `${sym}${v}`} width={isJPY ? 52 : 42} />
                  <Tooltip
                    formatter={(value: number, name: string) => [fmt(value, currency), name]}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine x={MAX_YEAR} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "2026", fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="Actual Date Cost"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="CPI-Adjusted Baseline"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* ── Global key stats ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-600" />
          Dateflation by the Numbers — 2026
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { stat: "$189", label: "Average US date cost in 2026, up from $168 in 2025 (+12.5%)", source: "BMO RFPI 2026", flag: "🇺🇸" },
            { stat: "47%", label: "of American singles say dating is not financially worth it", source: "BMO RFPI 2026", flag: "🇺🇸" },
            { stat: "CA$174", label: "Average Canadian date cost in 2026. 50% say dating not worth it.", source: "BMO Canada 2026", flag: "🇨🇦" },
            { stat: "55%", label: "of single Canadians had zero dates in the past 12 months", source: "BMO Canada 2025", flag: "🇨🇦" },
            { stat: "+50%", label: "UK restaurant prices rose 50% between 2015 and 2025 (ONS CPIH)", source: "ONS L557", flag: "🇬🇧" },
            { stat: "+38.7%", label: "Australian meals-out prices since 2017, outpacing general CPI", source: "ABS CPI", flag: "🇦🇺" },
            { stat: "+19.2%", label: "Japan eating-out CPI rise 2020–2025, after a decade of near-zero change", source: "Statistics Bureau Japan", flag: "🇯🇵" },
            { stat: "169%", label: "Hinge Preferred rose from $12.99 to $34.99/mo since 2019", source: "Match Group filings", flag: "🇺🇸" },
          ].map(({ stat, label, source, flag }) => (
            <div key={stat + label} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
              <span className="text-lg">{flag}</span>
              <div>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{stat}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Average date costs table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Average Date Costs in 2026 by Country
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country</th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Date Cost</th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Since 2019</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {[
                { flag: "🇺🇸", country: "United States", cost: "$189", change: "+57%", source: "BMO RFPI 2026", quality: "solid" },
                { flag: "🇬🇧", country: "United Kingdom", cost: "£120", change: "+35%", source: "Velloy 2024 / ONS", quality: "solid" },
                { flag: "🇨🇦", country: "Canada", cost: "CA$174", change: "+28% est.", source: "BMO Canada 2026", quality: "thin" },
                { flag: "🇦🇺", country: "Australia", cost: "A$184", change: "+31% est.", source: "ABS CPI / Yahoo AUS", quality: "thin" },
                { flag: "🇯🇵", country: "Japan (men)", cost: "¥9,500", change: "+20%", source: "kanetohonne 2024", quality: "solid" },
              ].map(({ flag, country, cost, change, source, quality }) => (
                <tr key={country}>
                  <td className="py-2.5 pr-4">
                    <span className="mr-2">{flag}</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{country}</span>
                    {quality === "thin" && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">est.</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-gray-900 dark:text-gray-100">{cost}</td>
                  <td className="py-2.5 pr-4 text-right text-rose-600 dark:text-rose-400 font-medium">{change}</td>
                  <td className="py-2.5 text-xs text-gray-400 dark:text-gray-500">{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          "est." = estimated from official eating-out CPI sub-index, not directly survey-measured. All costs are approximate.
        </p>
      </div>

      {/* ── How to use ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          How to Use the Dateflation Calculator
        </h2>
        <ol className="space-y-3">
          {[
            { n: "1", title: "Select your currency", text: "Choose from USD, GBP, CAD, AUD, or JPY. The calculator auto-fills 2026 survey data for that country." },
            { n: "2", title: "Pick your date type", text: "Select Dinner & Drinks, Coffee & Walk, Activity, Drinks Only, or Home Date — costs auto-fill based on that country's data." },
            { n: "3", title: "Set your start year", text: "Choose the year you started dating. The 'Then' cost field pre-fills from survey data or CPI back-calculation for that year." },
            { n: "4", title: "Edit costs if needed", text: "Override the pre-filled figures with your actual spending — your personal numbers always give the most accurate result." },
            { n: "5", title: "Set dates per month", text: "Select how often you date. This scales your annual extra spend and Dating Inflation Tax figures." },
            { n: "6", title: "Optionally add pre-date costs", text: "Toggle on grooming, transport, and dating app costs to get a fully-loaded dateflation figure." },
          ].map(({ n, title, text }) => (
            <li key={n} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Internal links ── */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Explore more inflation calculators
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/subscription-inflation-calculator", label: "Subscription Inflation" },
            { href: "/shrinkflation-calculator", label: "Shrinkflation" },
            { href: "/skimpflation-calculator", label: "Skimpflation" },
            { href: "/sneakflation-calculator", label: "Sneakflation" },
            { href: "/energy-inflation-calculator", label: "Energy Inflation" },
            { href: "/", label: "Global Inflation Calculator" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Blog essay ── always visible, never collapsible */}
      {!blogLoading && blogContent && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            The Dateflation Nobody Budgeted For
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {blogContent.split("\n\n").map((para, i) => {
              if (para.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">{para.replace("## ", "")}</h2>
              if (para.startsWith("# "))  return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2">{para.replace("# ", "")}</h2>
              return <p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{para}</p>
            })}
          </div>
        </div>
      )}

      {/* ── Data Sources & Methodology ── upgraded, above FAQs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Data Sources &amp; Methodology
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          All date cost figures are sourced from independent consumer surveys and official government price indices.
          CPI back-calculation is used to estimate historical costs where direct survey data is unavailable.
          Data quality is rated per currency — see the badge shown when you select a currency.
        </p>

        <div className="space-y-4">

          {/* USD */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇺🇸</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">USD — United States</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">High Confidence</span>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Survey data:</span> BMO Real Financial Progress Index 2025 &amp; 2026 (Ipsos, n=2,500 US adults). Direct per-date cost: $168 (2025), $189 (2026).</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">CPI benchmark:</span> BLS Food Away From Home CPI, series CUUS0000SEFV — annual averages 2010–2025.</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Corroborating sources:</span> Investopedia, NerdWallet, LendingTree annual dating cost surveys.</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Historical back-fill:</span> 2015–2024 costs derived by applying BLS FAFH CPI index ratios to the 2025 anchor.</li>
            </ul>
          </div>

          {/* GBP */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇬🇧</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">GBP — United Kingdom</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">High Confidence</span>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Survey data:</span> Velloy Dating Index 2024 (n=4,000 UK adults, £114.40 avg per date); Barclays UK Unlocked 2025 (Gen Z dating spend £120/date).</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">CPI benchmark:</span> ONS CPIH sub-index 11.1.1 Restaurants &amp; Cafes, series L557 (2015=100) — annual averages 2015–2025.</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Historical back-fill:</span> 2015–2023 costs derived from ONS L557 index ratios applied to 2024 Velloy anchor.</li>
            </ul>
          </div>

          {/* CAD */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇨🇦</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">CAD — Canada</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">Estimated Baseline</span>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Survey data:</span> BMO Real Financial Progress Index Canada 2025 &amp; 2026 (Ipsos, n=2,500 Canadians). Per-date cost: CA$173 (2025), CA$174 (2026).</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">CPI benchmark:</span> Statistics Canada Food Purchased from Restaurants CPI, series v41692930 — annual averages 2015–2025.</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Note:</span> Direct Canadian per-date survey data only available from 2025. Pre-2025 figures are CPI back-calculated estimates. Treat pre-2025 results as directional, not precise.</li>
            </ul>
          </div>

          {/* AUD */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇦🇺</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">AUD — Australia</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">Estimated Baseline</span>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Survey data:</span> Yahoo Finance Australia (July 2022, A$154.16 avg first date); Sydney Morning Herald 2023 (A$170 avg date night); Relationships Australia 2024 (A$180–200 range).</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">CPI benchmark:</span> ABS Meals Out and Take Away Foods CPI, series A2325807C — annual averages 2015–2025.</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Note:</span> No single definitive annual Australian dating-cost survey exists. Baseline is anchored to the July 2022 Yahoo Finance figure and projected using ABS CPI. Results are directional estimates.</li>
            </ul>
          </div>

          {/* JPY */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇯🇵</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">JPY — Japan</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">High Confidence</span>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Survey data:</span> trami.jp 2023 (¥12,491 avg per date, n=1,000+); kanetohonne.jp 2024 (¥7,000–12,000 men); laskoi.jp 2025 (¥9,500 men avg).</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">CPI benchmark:</span> Statistics Bureau of Japan Eating Out CPI (2020=100) — annual averages 2015–2025. Series from the Consumer Price Index Japan Yearly Average.</li>
              <li><span className="font-medium text-gray-700 dark:text-gray-300">Historical back-fill:</span> Pre-2023 costs derived from Statistics Bureau CPI ratios applied to 2023 trami.jp anchor.</li>
            </ul>
          </div>

        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 leading-relaxed">
          All calculations run entirely in your browser. No personal data is stored or transmitted.
          Methodology: actual cost growth is compared against the official eating-out CPI sub-index for each country
          to isolate the portion of cost increase that exceeds general restaurant price inflation.
        </p>
      </div>

      {/* ── FAQ ── */}
      <FAQ category="dateflation" />

      {/* ── Footer ── */}
      <footer className="mt-8 bg-gray-900 text-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

          {/* Col 1 — Tool name + description */}
          <div>
            <h3 className="text-xl font-bold mb-3">Dateflation Calculator</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Calculate how much more expensive dating has become since you started. Compare your actual date costs against official eating-out CPI benchmarks across 5 currencies — USD, GBP, CAD, AUD, and JPY.
            </p>
          </div>

          {/* Col 2 — Data Sources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• BMO Real Financial Progress Index (Ipsos, n=2,500)</li>
              <li>• Velloy Dating Index 2024 (n=4,000)</li>
              <li>• Barclays UK Unlocked 2025</li>
              <li>• US Bureau of Labor Statistics — FAFH CPI</li>
              <li>• UK Office for National Statistics — CPIH L557</li>
              <li>• Statistics Canada — Food from Restaurants CPI</li>
              <li>• Australian Bureau of Statistics — Meals Out CPI</li>
              <li>• Statistics Bureau of Japan — Eating Out CPI</li>
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/mortgage-calculator",                              label: "Mortgage Calculator"             },
                { href: "/home-affordability-calculator/inflation-adjusted", label: "Home Affordability Calculator"   },
                { href: "/deflation-calculator",                             label: "Deflation Calculator"            },
                { href: "/shrinkflation-calculator",                         label: "Shrinkflation Calculator"        },
                { href: "/skimpflation-calculator",                          label: "Skimpflation Calculator"         },
                { href: "/sneakflation-calculator",                          label: "Sneakflation Calculator"         },
                { href: "/subscription-inflation-calculator",                label: "Subscription Inflation Calculator"},
                { href: "/energy-inflation-calculator",                      label: "Energy Inflation Calculator"     },
                { href: "/charts",                                           label: "Charts & Analytics"              },
                { href: "/investment-race-calculator",                       label: "Investment Race Calculator"      },
                { href: "/global-compound-interest",                         label: "Compound Interest Calculator"    },
                { href: "/global-net-worth-calculator",                      label: "Global Net Worth Calculator"     },
                { href: "/ppp-calculator",                                   label: "PPP Calculator"                  },
                { href: "/auto-loan-calculator",                             label: "Auto Loan Calculator"            },
                { href: "/salary-calculator",                                label: "Salary Calculator"               },
                { href: "/retirement-calculator",                            label: "Retirement Calculator"           },
                { href: "/student-loan-calculator",                          label: "Student Loan Calculator"         },
                { href: "/budget-calculator",                                label: "Budget Calculator"               },
                { href: "/emergency-fund-calculator",                        label: "Emergency Fund Calculator"       },
                { href: "/roi-calculator",                                   label: "ROI Calculator"                  },
                { href: "/insurance-inflation-calculator",                   label: "Insurance Inflation Calculator"  },
                { href: "/legacy-planner",                                   label: "Legacy Planner"                  },
                { href: "/about",                                            label: "About Us"                        },
                { href: "/privacy",                                          label: "Privacy Policy"                  },
                { href: "/terms",                                            label: "Terms of Service"                },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-300 hover:text-pink-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-4">Last Updated: May 2026</p>
          </div>

        </div>
        <div className="border-t border-gray-700 px-8 py-6 text-center">
          <p className="text-sm text-gray-400">&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
        </div>
      </footer>

    </main>
  )
}
