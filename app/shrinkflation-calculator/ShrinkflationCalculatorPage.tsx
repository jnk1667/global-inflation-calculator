"use client"

import { useState, useCallback, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import Link from "next/link"
import { AlertTriangle, TrendingUp, Package, DollarSign, Info, ChevronDown, ChevronUp } from "lucide-react"
import FAQ from "@/components/faq"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoodCpiData {
  foodInflation: Record<string, number>
  generalInflation: Record<string, number>
  foodCpiIndex: Record<string, number>
}

interface FaostatData {
  data: Record<string, FoodCpiData>
}

// ─── Currency config ──────────────────────────────────────────────────────────

const CURRENCIES = {
  USD: { symbol: "$",   name: "US Dollar",           flag: "🇺🇸", iso3: "USA", unit: "oz" },
  GBP: { symbol: "£",   name: "British Pound",        flag: "🇬🇧", iso3: "GBR", unit: "g"  },
  EUR: { symbol: "€",   name: "Euro",                 flag: "🇪🇺", iso3: "DEU", unit: "g"  },
  CAD: { symbol: "C$",  name: "Canadian Dollar",      flag: "🇨🇦", iso3: "CAN", unit: "g"  },
  AUD: { symbol: "A$",  name: "Australian Dollar",    flag: "🇦🇺", iso3: "AUS", unit: "g"  },
  CHF: { symbol: "Fr",  name: "Swiss Franc",          flag: "🇨🇭", iso3: "CHE", unit: "g"  },
  JPY: { symbol: "¥",   name: "Japanese Yen",         flag: "🇯🇵", iso3: "JPN", unit: "g"  },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar",   flag: "🇳🇿", iso3: "NZL", unit: "g"  },
} as const

type CurrencyCode = keyof typeof CURRENCIES

// ─── Preset examples ──────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Potato Chips",     oldWeight: 200,  newWeight: 165,  oldYear: 2019, newYear: 2024, oldPrice: 2.49,  newPrice: 2.99  },
  { label: "Breakfast Cereal", oldWeight: 500,  newWeight: 420,  oldYear: 2020, newYear: 2025, oldPrice: 3.99,  newPrice: 4.49  },
  { label: "Chocolate Bar",    oldWeight: 200,  newWeight: 170,  oldYear: 2018, newYear: 2024, oldPrice: 1.99,  newPrice: 2.29  },
  { label: "Orange Juice",     oldWeight: 1000, newWeight: 850,  oldYear: 2021, newYear: 2025, oldPrice: 2.99,  newPrice: 3.49  },
  { label: "Coffee (ground)",  oldWeight: 500,  newWeight: 400,  oldYear: 2020, newYear: 2025, oldPrice: 6.99,  newPrice: 7.99  },
  { label: "Ice Cream",        oldWeight: 1000, newWeight: 750,  oldYear: 2019, newYear: 2024, oldPrice: 4.99,  newPrice: 5.49  },
  { label: "Toilet Paper (8)", oldWeight: 800,  newWeight: 680,  oldYear: 2020, newYear: 2025, oldPrice: 6.49,  newPrice: 7.49  },
  { label: "Butter",           oldWeight: 500,  newWeight: 400,  oldYear: 2021, newYear: 2025, oldPrice: 3.49,  newPrice: 4.29  },
]

const MAX_YEAR = 2025

// ─── Main component ───────────────────────────────────────────────────────────

export default function ShrinkflationCalculatorPage() {
  const [currency, setCurrency]     = useState<CurrencyCode>("USD")
  const [productName, setProductName] = useState("")
  const [oldWeight, setOldWeight]   = useState("")
  const [newWeight, setNewWeight]   = useState("")
  const [oldPrice, setOldPrice]     = useState("")
  const [newPrice, setNewPrice]     = useState("")
  const [oldYear, setOldYear]       = useState(String(MAX_YEAR - 5))
  const [newYear, setNewYear]       = useState(String(MAX_YEAR))
  const [purchasesPerYear, setPurchasesPerYear] = useState("12")
  const [openFaq, setOpenFaq]       = useState<number | null>(null) // kept for legacy, unused after FAQ component migration
  const [faoData, setFaoData]       = useState<FaostatData | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Lazy-load CPI data once on first interaction
  const loadData = useCallback(async () => {
    if (dataLoaded) return
    try {
      const res = await fetch("/data/faostat-food-cpi.json")
      const json = await res.json()
      setFaoData(json)
      setDataLoaded(true)
    } catch {
      setDataLoaded(true) // proceed without benchmark
    }
  }, [dataLoaded])

  const applyPreset = useCallback((preset: typeof PRESETS[number]) => {
    setProductName(preset.label)
    setOldWeight(String(preset.oldWeight))
    setNewWeight(String(preset.newWeight))
    setOldPrice(String(preset.oldPrice))
    setNewPrice(String(preset.newPrice))
    setOldYear(String(preset.oldYear))
    setNewYear(String(preset.newYear))
    loadData()
  }, [loadData])

  // ─── Core calculations ─────────────────────────────────────────────────────

  const results = useMemo(() => {
    const ow = parseFloat(oldWeight)
    const nw = parseFloat(newWeight)
    const op = parseFloat(oldPrice)
    const np = parseFloat(newPrice)
    const oy = parseInt(oldYear, 10)
    const ny = parseInt(newYear, 10)
    const ppy = parseInt(purchasesPerYear, 10)

    if (!ow || !nw || !op || !np || ow <= 0 || nw <= 0 || op <= 0 || np <= 0) return null
    if (ny <= oy) return { yearError: true } as { yearError: boolean }

    const oldPricePerUnit = op / ow
    const newPricePerUnit = np / nw
    const effectiveInflation = ((newPricePerUnit / oldPricePerUnit) - 1) * 100
    const priceOnlyInflation = ((np / op) - 1) * 100
    const sizeReduction = ((1 - nw / ow)) * 100
    const yearsBetween = ny - oy

    // What you would pay at the old price-per-unit
    const fairNewPrice = oldPricePerUnit * nw
    const overchargePerPurchase = np - fairNewPrice
    const annualOvercharge = overchargePerPurchase * ppy

    // Compound annual rate
    const cagr = (Math.pow(newPricePerUnit / oldPricePerUnit, 1 / yearsBetween) - 1) * 100

    // CPI benchmark
    let foodCpiOverPeriod: number | null = null
    let generalCpiOverPeriod: number | null = null

    if (faoData) {
      const iso3 = CURRENCIES[currency].iso3
      const countryData = faoData.data[iso3]
      if (countryData) {
        const startIdx = countryData.foodCpiIndex[String(oy)]
        const endIdx   = countryData.foodCpiIndex[String(ny)]
        if (startIdx && endIdx) {
          foodCpiOverPeriod = ((endIdx / startIdx) - 1) * 100
        }
        const gStartIdx = countryData.generalCpiIndex[String(oy)]
        const gEndIdx   = countryData.generalCpiIndex[String(ny)]
        if (gStartIdx && gEndIdx) {
          generalCpiOverPeriod = ((gEndIdx / gStartIdx) - 1) * 100
        }
      }
    }

    const excessOverFood = foodCpiOverPeriod !== null ? effectiveInflation - foodCpiOverPeriod : null

    return {
      yearError: false,
      effectiveInflation,
      priceOnlyInflation,
      sizeReduction,
      oldPricePerUnit,
      newPricePerUnit,
      overchargePerPurchase,
      annualOvercharge,
      cagr,
      yearsBetween,
      oy,
      ny,
      foodCpiOverPeriod,
      generalCpiOverPeriod,
      excessOverFood,
      fairNewPrice,
    }
  }, [oldWeight, newWeight, oldPrice, newPrice, oldYear, newYear, purchasesPerYear, currency, faoData])

  const sym = CURRENCIES[currency].symbol
  const unit = CURRENCIES[currency].unit

  // ─── Chart data ────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!results || results.yearError) return []
    const bars = [
      { name: "Effective\nShrinkflation", value: parseFloat(results.effectiveInflation.toFixed(1)), fill: "#ef4444" },
      { name: "Price Only\nChange", value: parseFloat(results.priceOnlyInflation.toFixed(1)), fill: "#f97316" },
    ]
    if (results.foodCpiOverPeriod !== null) {
      bars.push({ name: `Official Food\nCPI ${results.yearsBetween}yr`, value: parseFloat(results.foodCpiOverPeriod.toFixed(1)), fill: "#3b82f6" })
    }
    if (results.generalCpiOverPeriod !== null) {
      bars.push({ name: `General\nCPI ${results.yearsBetween}yr`, value: parseFloat(results.generalCpiOverPeriod.toFixed(1)), fill: "#8b5cf6" })
    }
    return bars
  }, [results])

  // ─── Rating label ──────────────────────────────────────────────────────────

  const getSeverity = (pct: number) => {
    if (pct >= 40) return { label: "Extreme",  color: "text-red-700 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20",   border: "border-red-200 dark:border-red-800" }
    if (pct >= 20) return { label: "Severe",   color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20",   border: "border-red-200 dark:border-red-800" }
    if (pct >= 10) return { label: "High",     color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" }
    if (pct >= 5)  return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" }
    return               { label: "Low",       color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" }
  }


  const yearOptions    = Array.from({ length: MAX_YEAR - 1999 }, (_, i) => MAX_YEAR - i)
  const newYearOptions = Array.from({ length: MAX_YEAR - 2000 }, (_, i) => MAX_YEAR - i).filter(y => y > parseInt(oldYear, 10))

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="container mx-auto px-4 sm:px-6 pt-[152px] sm:pt-28 pb-12 max-w-4xl min-h-screen font-sans">

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold px-3 py-1 rounded-full border border-red-200 dark:border-red-800 mb-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          Hidden inflation exposed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3 text-balance leading-tight">
          Free Shrinkflation Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-pretty">
          Reveal the true inflation hidden in smaller grocery packages. Enter old vs new size and price
          — instantly see your effective inflation rate vs. official food CPI.
        </p>
      </div>

      {/* Currency selector */}
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

      {/* Quick-load presets */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2 uppercase tracking-wide font-medium">
          Quick examples — click to load
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Enter product details
        </h2>

        {/* Product name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Product name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Potato Chips, Cereal Box…"
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Old vs New grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          {/* Old */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Original package</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Weight / size ({unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={oldWeight}
                  onChange={(e) => setOldWeight(e.target.value)}
                  onFocus={loadData}
                  placeholder={`e.g. ${CURRENCIES[currency].unit === "oz" ? "7" : "200"}`}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Price ({sym})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="e.g. 2.49"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Year purchased
                </label>
                <select
                  value={oldYear}
                  onChange={(e) => {
                    const y = e.target.value
                    setOldYear(y)
                    // Auto-advance newYear if it would be <= oldYear
                    if (parseInt(newYear, 10) <= parseInt(y, 10)) {
                      setNewYear(String(Math.min(parseInt(y, 10) + 1, MAX_YEAR)))
                    }
                  }}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* New */}
          <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                New package
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Weight / size ({unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder={`e.g. ${CURRENCIES[currency].unit === "oz" ? "6"  : "165"}`}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Price ({sym})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 2.99"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Year purchased
                </label>
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {newYearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Purchases per year
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={purchasesPerYear}
                  onChange={(e) => setPurchasesPerYear(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Year timeline bridge */}
        <div className="flex items-center justify-center gap-3 py-3 mb-3">
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{oldYear}</span>
          </div>
          <div className="flex-1 flex items-center gap-1 max-w-[160px]">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap px-1 font-medium">
              {parseInt(newYear, 10) > parseInt(oldYear, 10)
                ? `${parseInt(newYear, 10) - parseInt(oldYear, 10)} yr${parseInt(newYear, 10) - parseInt(oldYear, 10) !== 1 ? "s" : ""}`
                : "—"}
            </span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">{newYear}</span>
          </div>
        </div>

        {results?.yearError && (
          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            The comparison year must be later than the original year. Please adjust the year selectors.
          </div>
        )}

        {!results && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
            Fill in the fields above to see your results
          </p>
        )}
      </div>

      {/* Results */}
      {results && !results.yearError && (() => {
        const severity = getSeverity(results.effectiveInflation)
        return (
          <>
            {/* Headline result */}
            <div className={`rounded-2xl border ${severity.border} ${severity.bg} p-6 mb-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Annualised shrinkflation rate
                    {productName ? ` — ${productName}` : ""}
                  </p>
                  <div className={`text-5xl font-bold ${severity.color}`}>
                    +{results.cagr.toFixed(2)}%<span className="text-2xl font-semibold ml-1 opacity-70">/yr</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    {results.oy} → {results.ny} ({results.yearsBetween} year{results.yearsBetween !== 1 ? "s" : ""}) &nbsp;·&nbsp; {results.effectiveInflation.toFixed(1)}% cumulative total
                  </p>
                </div>
                <div className={`text-center px-5 py-3 rounded-xl border ${severity.border} bg-white/60 dark:bg-gray-800/40`}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Severity</p>
                  <p className={`text-xl font-bold ${severity.color}`}>{severity.label}</p>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                {
                  icon: <TrendingUp className="w-4 h-4 text-orange-500" />,
                  label: "Price-only change",
                  value: `+${results.priceOnlyInflation.toFixed(1)}%`,
                  sub: "sticker price increase",
                },
                {
                  icon: <Package className="w-4 h-4 text-blue-500" />,
                  label: "Size reduction",
                  value: `-${results.sizeReduction.toFixed(1)}%`,
                  sub: "package downsized",
                },
                {
                  icon: <DollarSign className="w-4 h-4 text-red-500" />,
                  label: "Extra per purchase",
                  value: `${sym}${Math.abs(results.overchargePerPurchase).toFixed(2)}`,
                  sub: "vs fair unit price",
                },
                {
                  icon: <DollarSign className="w-4 h-4 text-red-600" />,
                  label: "Annual extra cost",
                  value: `${sym}${Math.abs(results.annualOvercharge).toFixed(2)}`,
                  sub: `at ${purchasesPerYear} purchases/yr`,
                },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">{s.icon}<span className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</span></div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Price per unit breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Price-per-{unit} breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Old price per {unit}</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {sym}{results.oldPricePerUnit.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{results.oy}</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New price per {unit}</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {sym}{results.newPricePerUnit.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{results.ny}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fair price today</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    {sym}{results.fairNewPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">at old rate, new size</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compound annual shrinkflation rate:{" "}
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    +{results.cagr.toFixed(2)}%/yr
                  </span>
                </p>
              </div>
            </div>

            {/* CPI comparison chart */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Shrinkflation vs Official CPI
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Cumulative % change {results.oy}–{results.ny} · {results.yearsBetween} yr · {CURRENCIES[currency].name}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      interval={0}
                      height={55}
                      tickFormatter={(v: string) => v.replace("\\n", "\n")}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                    <ReferenceLine y={0} stroke="#9ca3af" />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {results.excessOverFood !== null && (
                  <div className={`mt-3 rounded-lg p-3 text-sm flex items-start gap-2 ${
                    results.excessOverFood > 0
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {results.excessOverFood > 0
                        ? `This product's effective inflation rate is ${results.excessOverFood.toFixed(1)} percentage points above official food CPI for ${CURRENCIES[currency].name} over this period.`
                        : `This product's effective inflation rate is ${Math.abs(results.excessOverFood).toFixed(1)} percentage points below official food CPI — less than average.`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )
      })()}

      {/* How shrinkflation works explainer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">How Shrinkflation Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { step: "1", title: "Same price, less product", desc: "Manufacturers quietly reduce package weight — by 10–25% on average — while the shelf price stays flat or rises only slightly." },
            { step: "2", title: "Invisible to standard CPI", desc: "Official inflation indices measure price per fixed unit, so a smaller pack at the same price can appear as 0% inflation while your cost per gram has soared." },
            { step: "3", title: "Compounds over time", desc: "A 15% size reduction in 2020 and another 10% in 2023 leaves you with 26.5% less product — but most consumers never notice because each cut is small." },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40">
          <span className="font-semibold">2026 stat:</span> A Capgemini consumer research report found 61–71% of shoppers across major markets have noticed shrinkflation, and a significant proportion responded by switching brands or shopping at discount retailers.
        </div>
      </div>

      {/* FAQ — loaded from Supabase via shared FAQ component */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <FAQ category="shrinkflation" />
      </div>

      {/* Internal links */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
          Related calculators
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/",                          label: "Global Inflation Calculator"  },
            { href: "/salary-calculator",         label: "Salary & Real Wages"          },
            { href: "/salary-calculator/regional-cost-of-living", label: "Cost of Living Comparison" },
            { href: "/ppp-calculator",            label: "Purchasing Power Parity"      },
            { href: "/budget-calculator",         label: "50/30/20 Budget Calculator"   },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 bg-gray-900 text-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

          {/* Col 1 — Tool name + description only */}
          <div>
            <h3 className="text-xl font-bold mb-3">Shrinkflation Calculator</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Reveal the true inflation hidden in shrinking grocery packages. Compare price-per-unit across any two years for 8 major currencies using official food CPI benchmarks.
            </p>
          </div>

          {/* Col 2 — Data Sources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• FAO Food Price Index (FAOSTAT)</li>
              <li>• US Bureau of Labor Statistics (BLS)</li>
              <li>• UK Office for National Statistics</li>
              <li>• Eurostat</li>
              <li>• Statistics Canada</li>
              <li>• Australian Bureau of Statistics</li>
              <li>• Swiss Federal Statistical Office</li>
              <li>• Statistics Bureau of Japan</li>
              <li>• Stats NZ (New Zealand)</li>
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/mortgage-calculator",                              label: "Mortgage Calculator"              },
                { href: "/home-affordability-calculator/inflation-adjusted", label: "Home Affordability Calculator"    },
                { href: "/deflation-calculator",                             label: "Deflation Calculator"             },
                { href: "/charts",                                           label: "Charts & Analytics"               },
                { href: "/global-compound-interest",                         label: "Compound Interest Calculator"     },
                { href: "/global-net-worth-calculator",                      label: "Global Net Worth Calculator"      },
                { href: "/ppp-calculator",                                   label: "PPP Calculator"                   },
                { href: "/auto-loan-calculator",                             label: "Auto Loan Calculator"             },
                { href: "/salary-calculator",                                label: "Salary Calculator"                },
                { href: "/retirement-calculator",                            label: "Retirement Calculator"            },
                { href: "/student-loan-calculator",                          label: "Student Loan Calculator"          },
                { href: "/budget-calculator",                                label: "Budget Calculator"                },
                { href: "/emergency-fund-calculator",                        label: "Emergency Fund Calculator"        },
                { href: "/roi-calculator",                                   label: "ROI Calculator"                   },
                { href: "/insurance-inflation-calculator",                   label: "Insurance Inflation Calculator"   },
                { href: "/legacy-planner",                                   label: "Legacy Planner"                   },
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
            <p className="text-sm text-gray-500 mt-4">Last Updated: March 2026</p>
          </div>

        </div>
        <div className="border-t border-gray-700 px-8 py-6 text-center">
          <p className="text-sm text-gray-400">&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
        </div>
      </footer>

    </main>
  )
}
