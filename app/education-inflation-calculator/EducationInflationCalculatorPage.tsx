"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, BarChart, Bar, Cell } from "recharts"
import Link from "next/link"
import { GraduationCap, TrendingUp, DollarSign, Info, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EducationCPIData {
  education: {
    annual: Record<number, number>
    firstYear: number
    lastYear: number
  }
}

interface TuitionData {
  tuitionPrices?: Record<number, number>
  tuitionHistory?: Record<number, number> | Record<string, number>
  history?: Record<number, number> | Record<string, number>
  canada?: { education: { annual: Record<number, number> } }
  USA?: { tuitionPrices: Record<number, number> }
  GBR?: { tuitionPrices: Record<number, number> }
  CAN?: { tuitionPrices: Record<number, number> }
  AUS?: { tuitionPrices: Record<number, number> }
  DEU?: { tuitionPrices: Record<number, number> }
  FRA?: { tuitionPrices: Record<number, number> }
  NLD?: { tuitionPrices: Record<number, number> }
  ITA?: { tuitionPrices: Record<number, number> }
  CHE?: { tuitionPrices: Record<number, number> }
  JPN?: { tuitionPrices: Record<number, number> }
  NZL?: { tuitionPrices: Record<number, number> }
}

// ─── Currency config ──────────────────────────────────────────────────────────

const CURRENCIES = {
  USD: { symbol: "$",    name: "US Dollar",         flag: "🇺🇸", country: "USA", iso3: "USA" },
  GBP: { symbol: "£",    name: "British Pound",     flag: "🇬🇧", country: "United Kingdom", iso3: "GBR" },
  EUR: { symbol: "€",    name: "Euro",              flag: "🇪🇺", country: "Germany", iso3: "DEU" },
  CAD: { symbol: "C$",   name: "Canadian Dollar",   flag: "🇨🇦", country: "Canada", iso3: "CAN" },
  AUD: { symbol: "A$",   name: "Australian Dollar", flag: "🇦🇺", country: "Australia", iso3: "AUS" },
  CHF: { symbol: "Fr",   name: "Swiss Franc",       flag: "🇨🇭", country: "Switzerland", iso3: "CHE" },
  JPY: { symbol: "¥",    name: "Japanese Yen",      flag: "🇯🇵", country: "Japan", iso3: "JPN" },
  NZD: { symbol: "NZ$",  name: "New Zealand Dollar",flag: "🇳🇿", country: "New Zealand", iso3: "NZL" },
} as const

type CurrencyCode = keyof typeof CURRENCIES

const MAX_YEAR = 2025
const MIN_YEAR = 1990

// ─── Helper: format currency ──────────────────────────────────────────────────

function fmt(value: number, currency: CurrencyCode) {
  const { symbol } = CURRENCIES[currency]
  if (currency === "JPY") return `${symbol}${Math.round(value).toLocaleString()}`
  return `${symbol}${value.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EducationInflationCalculatorPage() {
  const [currency, setCurrency]           = useState<CurrencyCode>("USD")
  const [oldYear, setOldYear]             = useState(2000)
  const [currentYear, setCurrentYear]     = useState(MAX_YEAR)
  const [oldTuitionInput, setOldTuitionInput] = useState("")
  const [currentTuitionInput, setCurrentTuitionInput] = useState("")
  const [hasCalculated, setHasCalculated] = useState(false)
  const [blogContent, setBlogContent]     = useState("")
  const [blogLoading, setBlogLoading]     = useState(true)

  // Data
  const [cpiData, setCpiData]             = useState<Record<CurrencyCode, EducationCPIData | null> | null>(null)
  const [tuitionData, setTuitionData]     = useState<Record<CurrencyCode, TuitionData> | null>(null)
  const [dataLoaded, setDataLoaded]       = useState(false)

  // Load blog
  useEffect(() => {
    const defaultContent = "## The Education Inflation Nobody Tracks\n\nDegree costs have risen far faster than official CPI in most countries. See how education inflation compares to general inflation in your country."
    const load = async () => {
      try {
        const content = await getCachedContent("education_inflation_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "education_inflation_essay")
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
      const cpiFiles = {
        USD: fetch("/data/education-inflation.json"),
        GBP: fetch("/data/ons-uk-education-cpi.json"),
        EUR: fetch("/data/eurostat-hicp-education.json"),
        CAD: fetch("/data/canada-education-cpi.json"),
        AUD: fetch("/data/abs-education-cpi.json"),
        CHF: fetch("/data/education-cpi-international.json"),
        JPY: fetch("/data/japan-education-cpi.json"),
        NZD: fetch("/data/nz-education-cpi.json"),
      }

      const tuitionFiles = {
        USD: fetch("/data/education-inflation.json"),
        GBP: fetch("/data/uk-tuition-history.json"),
        EUR: fetch("/data/eurozone-tuition-fees.json"),
        CAD: fetch("/data/canada-tuition.json"),
        AUD: fetch("/data/australia-tuition-hecs.json"),
        CHF: fetch("/data/switzerland-tuition-fees.json"),
        JPY: fetch("/data/japan-tuition-mext.json"),
        NZD: fetch("/data/nz-tuition-fees.json"),
      }

      const [cpiRes, tuitionRes] = await Promise.all([
        Promise.all(Object.values(cpiFiles)),
        Promise.all(Object.values(tuitionFiles)),
      ])

      const cpiCodes = Object.keys(cpiFiles) as CurrencyCode[]
      const tuitionCodes = Object.keys(tuitionFiles) as CurrencyCode[]
      
      const cpi: Record<CurrencyCode, EducationCPIData | null> = {} as any
      const tuition: Record<CurrencyCode, TuitionData> = {} as any

      for (let i = 0; i < cpiCodes.length; i++) {
        try {
          cpi[cpiCodes[i]] = await cpiRes[i].json()
        } catch {
          cpi[cpiCodes[i]] = null
        }
      }

      for (let i = 0; i < tuitionCodes.length; i++) {
        try {
          tuition[tuitionCodes[i]] = await tuitionRes[i].json()
        } catch {
          tuition[tuitionCodes[i]] = {}
        }
      }

      setCpiData(cpi)
      setTuitionData(tuition)
      setDataLoaded(true)
    } catch { setDataLoaded(true) }
  }, [dataLoaded])

  // ─── Core calculations ──────────────────────────────────────────────────────

  const results = useMemo(() => {
    const oldTuition = parseFloat(oldTuitionInput)
    const currentTuition = parseFloat(currentTuitionInput)

    if (!oldTuition || !currentTuition || oldTuition <= 0 || currentTuition <= 0) return null
    if (currentYear <= oldYear) return null

    const yearsBetween = currentYear - oldYear
    const tuitionInflationPct = ((currentTuition / oldTuition) - 1) * 100
    const annualizedRate = (Math.pow(currentTuition / oldTuition, 1 / yearsBetween) - 1) * 100

    // CPI benchmark
    let cpiOverPeriod: number | null = null
    let excessOverCpi: number | null = null

    if (cpiData && cpiData[currency]) {
      const series = cpiData[currency]
      if (series && series.education && series.education.annual) {
        const startVal = series.education.annual[oldYear]
        const endVal = series.education.annual[currentYear]
        if (startVal && endVal) {
          cpiOverPeriod = ((endVal / startVal) - 1) * 100
          excessOverCpi = tuitionInflationPct - cpiOverPeriod
        }
      }
    }

    // Projections
    const proj5yr = currentTuition * Math.pow(1 + annualizedRate / 100, 5)
    const proj10yr = currentTuition * Math.pow(1 + annualizedRate / 100, 10)

    return {
      oldTuition,
      currentTuition,
      tuitionInflationPct,
      annualizedRate,
      cpiOverPeriod,
      excessOverCpi,
      yearsBetween,
      proj5yr,
      proj10yr,
    }
  }, [oldTuitionInput, currentTuitionInput, oldYear, currentYear, currency, cpiData])

  // ─── Chart data ─────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!results || !cpiData || !cpiData[currency]) return []

    const series = cpiData[currency]
    if (!series || !series.education || !series.education.annual) return []

    const startVal = series.education.annual[oldYear]
    if (!startVal) return []

    const data = []
    for (let y = oldYear; y <= currentYear; y++) {
      const cpiVal = series.education.annual[y]
      if (cpiVal) {
        const cpiAdjusted = results.oldTuition * (cpiVal / startVal)
        const actual = y === oldYear ? results.oldTuition : (y === currentYear ? results.currentTuition : null)
        data.push({
          year: y,
          "CPI-Adjusted Baseline": parseFloat(cpiAdjusted.toFixed(0)),
          "Your Tuition": actual,
        })
      }
    }
    return data
  }, [results, cpiData, currency, oldYear, currentYear])

  // ─── Severity helper ─────────────────────────────────────────────────────────

  const getSeverity = (pct: number) => {
    if (pct >= 100) return { label: "Extreme",  color: "text-red-700 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800" }
    if (pct >= 50)  return { label: "Very High", color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800" }
    if (pct >= 25)  return { label: "High",     color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" }
    if (pct >= 10)  return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" }
    return               { label: "Low",       color: "text-green-600 dark:text-green-400",    bg: "bg-green-50 dark:bg-green-900/20",   border: "border-green-200 dark:border-green-800" }
  }

  const sym = CURRENCIES[currency].symbol

  const yearOptions = Array.from({ length: MAX_YEAR - MIN_YEAR }, (_, i) => MIN_YEAR + i)
  const currentYearOptions = yearOptions.filter(y => y > oldYear)

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="container mx-auto px-4 sm:px-6 pt-[152px] sm:pt-28 pb-12 max-w-4xl min-h-screen font-sans">

      {/* ── Hero ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 mb-4">
          <GraduationCap className="w-3.5 h-3.5" />
          Education inflation outpaces general CPI
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3 text-balance leading-tight">
          Education Inflation Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-pretty">
          How much more expensive has getting an education become? Enter your old vs current tuition costs and see your personal education inflation rate compared to official CPI.
        </p>
      </div>

      {/* ── Currency selector ── */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
          <button
            key={code}
            onClick={() => { setCurrency(code); loadData() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              currency === code
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400"
            }`}
          >
            <span>{CURRENCIES[code].flag}</span>
            <span>{code}</span>
          </button>
        ))}
      </div>

      {/* ── Calculator card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Your education costs
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
                  onChange={(e) => setOldYear(Number(e.target.value))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} disabled={y >= currentYear}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Tuition cost ({sym})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={oldTuitionInput}
                  onChange={(e) => setOldTuitionInput(e.target.value)}
                  placeholder={currency === "JPY" ? "e.g. 535800" : "e.g. 5000"}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onFocus={loadData}
                />
              </div>
            </div>
          </div>

          {/* Current */}
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Now</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Year
                </label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currentYearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Tuition cost ({sym})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentTuitionInput}
                  onChange={(e) => setCurrentTuitionInput(e.target.value)}
                  placeholder={currency === "JPY" ? "e.g. 1000000" : "e.g. 30000"}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onFocus={loadData}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Calculate button */}
        <button
          onClick={() => setHasCalculated(true)}
          disabled={!results}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate Education Inflation
        </button>
      </div>

      {/* ── Results ── */}
      {hasCalculated && results && (
        <div className="space-y-6">

          {/* Main metric */}
          <div className={`rounded-2xl border p-6 ${
            getSeverity(results.tuitionInflationPct).bg
          } ${getSeverity(results.tuitionInflationPct).border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                  Education Inflation
                </p>
                <p className={`text-4xl font-bold ${getSeverity(results.tuitionInflationPct).color}`}>
                  +{results.tuitionInflationPct.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total increase over {results.yearsBetween} years ({oldYear}–{currentYear})
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">ANNUALIZED</p>
                <p className={`text-2xl font-bold ${getSeverity(results.annualizedRate).color}`}>
                  {results.annualizedRate.toFixed(2)}%/yr
                </p>
              </div>
            </div>
          </div>

          {/* Comparison to CPI */}
          {results.cpiOverPeriod !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Education CPI</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">+{results.tuitionInflationPct.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your actual tuition increase</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">General CPI</span>
                </div>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">+{results.cpiOverPeriod.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Official inflation benchmark</p>
              </div>
            </div>
          )}

          {/* Excess */}
          {results.excessOverCpi !== null && (
            <div className={`rounded-2xl border p-6 ${
              results.excessOverCpi >= 10
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
            }`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                Excess over CPI
              </p>
              <p className={`text-3xl font-bold ${
                results.excessOverCpi >= 10 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
              }`}>
                +{results.excessOverCpi.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Tuition is growing {Math.abs(results.excessOverCpi).toFixed(1)} percentage points {results.excessOverCpi > 0 ? "faster" : "slower"} than general inflation.
              </p>
            </div>
          )}

          {/* Projections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">5-Year Projection</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{fmt(results.proj5yr, currency)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">At current rate ({results.annualizedRate.toFixed(2)}%/yr)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">10-Year Projection</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{fmt(results.proj10yr, currency)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">At current rate ({results.annualizedRate.toFixed(2)}%/yr)</p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">CPI-Adjusted vs Your Actual Cost</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }} />
                  <Legend />
                  <Line type="monotone" dataKey="CPI-Adjusted Baseline" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Your Tuition" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      )}

      {/* ── Blog section ── */}
      {!blogLoading && blogContent && (
        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: blogContent }} />
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <div className="mt-12">
        <FAQ slug="education_inflation_calculator" />
      </div>

    </main>
  )
}
