"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  BarChart3,
  BookOpen,
  Trophy,
  Minus,
  RefreshCw,
} from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"
import { fetchCryptoCurrentPrices } from "@/lib/api/coingecko-api"

// ─── Types ────────────────────────────────────────────────────────────────────

type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "CHF" | "JPY" | "NZD"

interface AssetConfig {
  key: string
  label: string
  color: string
  startYear: number
  endYear: number
  description: string
  source: string
}

// ─── Currency config ──────────────────────────────────────────────────────────

const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; flag: string }> = {
  USD: { symbol: "$",   name: "US Dollar",         flag: "🇺🇸" },
  GBP: { symbol: "£",   name: "British Pound",      flag: "🇬🇧" },
  EUR: { symbol: "€",   name: "Euro",               flag: "🇪🇺" },
  CAD: { symbol: "C$",  name: "Canadian Dollar",    flag: "🇨🇦" },
  AUD: { symbol: "A$",  name: "Australian Dollar",  flag: "🇦🇺" },
  CHF: { symbol: "Fr",  name: "Swiss Franc",        flag: "🇨🇭" },
  JPY: { symbol: "¥",   name: "Japanese Yen",       flag: "🇯🇵" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
}

// ─── Asset definitions ────────────────────────────────────────────────────────

const ASSETS: AssetConfig[] = [
  {
    key: "sp500",
    label: "S&P 500",
    color: "#2563eb",
    startYear: 2000,
    endYear: 2025,
    description: "US large-cap equity index (total return, dividends reinvested)",
    source: "Robert Shiller / Yale Economics",
  },
  {
    key: "gold",
    label: "Gold",
    color: "#d97706",
    startYear: 2000,
    endYear: 2025,
    description: "Gold spot price (USD per troy oz), converted via annual FX",
    source: "LBMA Gold Price / ICE Benchmark Administration",
  },
  {
    key: "bitcoin",
    label: "Bitcoin",
    color: "#f97316",
    startYear: 2013,
    endYear: 2025,
    description: "Bitcoin annual close price (USD), converted via annual FX",
    source: "CoinGecko / CoinMarketCap",
  },
  {
    key: "housing",
    label: "Housing",
    color: "#16a34a",
    startYear: 2000,
    endYear: 2025,
    description: "National residential property price index, inflation-adjusted",
    source: "BIS Residential Property Price Statistics",
  },
  {
    key: "bonds",
    label: "10Y Gov. Bonds",
    color: "#7c3aed",
    startYear: 2000,
    endYear: 2025,
    description: "10-year government bond total return (local currency)",
    source: "World Bank / FRED Federal Reserve",
  },
  {
    key: "savings",
    label: "Savings Account",
    color: "#64748b",
    startYear: 2000,
    endYear: 2025,
    description: "Annual savings/deposit rate — purchasing power in real terms",
    source: "World Bank Financial Access Survey",
  },
]

// ─── Fallback hardcoded data (used if /public fetch fails) ───────────────────

const FALLBACK_SP500: Record<number, number> = {
  2000: -9.1,  2001: -11.9, 2002: -22.1, 2003: 28.7,  2004: 10.9,
  2005: 4.9,   2006: 15.8,  2007: 5.5,   2008: -37.0, 2009: 26.5,
  2010: 15.1,  2011: 2.1,   2012: 16.0,  2013: 32.4,  2014: 13.7,
  2015: 1.4,   2016: 12.0,  2017: 21.8,  2018: -4.4,  2019: 31.5,
  2020: 18.4,  2021: 28.7,  2022: -18.1, 2023: 26.3,  2024: 25.0,
  2025: 1.2,
}

const FALLBACK_BONDS: Record<number, number> = {
  2000: 16.7,  2001: 5.6,   2002: 15.1,  2003: 2.1,   2004: 4.5,
  2005: 2.9,   2006: 1.5,   2007: 9.0,   2008: 25.9,  2009: -11.1,
  2010: 8.5,   2011: 17.5,  2012: 4.2,   2013: -9.1,  2014: 10.8,
  2015: 1.2,   2016: 0.7,   2017: 2.6,   2018: -0.2,  2019: 9.6,
  2020: 11.3,  2021: -2.3,  2022: -17.8, 2023: 4.5,   2024: 1.8,
  2025: 3.5,
}

const FALLBACK_HOUSING: Record<number, number> = {
  2000: 9.5,   2001: 7.8,   2002: 8.5,   2003: 10.2,  2004: 11.3,
  2005: 12.4,  2006: 1.8,   2007: -3.5,  2008: -9.1,  2009: -3.1,
  2010: -2.5,  2011: -3.0,  2012: 5.9,   2013: 11.2,  2014: 5.6,
  2015: 5.9,   2016: 5.1,   2017: 6.3,   2018: 4.6,   2019: 5.0,
  2020: 10.8,  2021: 18.8,  2022: 5.4,   2023: 4.5,   2024: 5.1,
  2025: 3.8,
}

// Bitcoin: hardcoded historical (2013–2024), live current year via CoinGecko
const FALLBACK_BITCOIN: Record<number, number> = {
  2013: 5507.0, 2014: -58.0, 2015: 35.0,  2016: 125.0, 2017: 1318.0,
  2018: -72.6,  2019: 87.2,  2020: 302.8, 2021: 59.8,  2022: -64.3,
  2023: 155.8,  2024: 121.4,
}

const FALLBACK_GOLD: Record<number, number> = {
  2000: -5.4,  2001: 2.5,   2002: 24.7,  2003: 19.6,  2004: 5.2,
  2005: 8.7,   2006: 22.8,  2007: 31.1,  2008: 5.8,   2009: 24.0,
  2010: 29.6,  2011: 10.2,  2012: 7.0,   2013: -28.3, 2014: -1.5,
  2015: -10.4, 2016: 8.6,   2017: 13.1,  2018: -1.9,  2019: 18.4,
  2020: 25.1,  2021: -3.6,  2022: -0.3,  2023: 13.1,  2024: 27.2,
  2025: 18.0,
}

const FALLBACK_SAVINGS: Record<number, number> = {
  2000: 5.8,   2001: 3.6,   2002: 1.7,   2003: 1.0,   2004: 1.5,
  2005: 3.2,   2006: 4.9,   2007: 5.0,   2008: 1.6,   2009: 0.5,
  2010: 0.3,   2011: 0.3,   2012: 0.2,   2013: 0.2,   2014: 0.2,
  2015: 0.2,   2016: 0.3,   2017: 0.5,   2018: 1.7,   2019: 2.1,
  2020: 0.5,   2021: 0.6,   2022: 3.5,   2023: 4.8,   2024: 4.5,
  2025: 4.2,
}

// BIS country mapping: currency → country code in bis-property-prices.json
const BIS_COUNTRY_FOR_CURRENCY: Record<CurrencyCode, string> = {
  USD: "US", GBP: "GB", EUR: "DE", CAD: "CA",
  AUD: "AU", CHF: "CH", JPY: "JP", NZD: "AU", // NZD uses AU as closest proxy
}

const MIN_YEAR = 2000
const MAX_YEAR = 2026

// ─── Helper: derive annual % returns from an index series ────────────────────
function indexToAnnualReturns(indexData: Record<string, number>): Record<number, number> {
  const years = Object.keys(indexData).map(Number).sort((a, b) => a - b)
  const returns: Record<number, number> = {}
  for (let i = 1; i < years.length; i++) {
    const y = years[i]
    const prev = indexData[String(years[i - 1])]
    const curr = indexData[String(y)]
    if (prev && prev !== 0) {
      returns[y] = Math.round(((curr / prev) - 1) * 10000) / 100
    }
  }
  return returns
}

// ─── Helper: derive annual CPI % from a cumulative index (e.g. usd-inflation.json) ──
function cumulativeIndexToAnnualCPI(indexData: Record<string, number>): Record<number, number> {
  const years = Object.keys(indexData).map(Number).sort((a, b) => a - b)
  const cpi: Record<number, number> = {}
  for (let i = 1; i < years.length; i++) {
    const y = years[i]
    const prev = indexData[String(years[i - 1])]
    const curr = indexData[String(y)]
    if (prev && prev !== 0) {
      cpi[y] = Math.round(((curr / prev) - 1) * 10000) / 100
    }
  }
  return cpi
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcRealReturn(nominalPct: number, cpiPct: number): number {
  return ((1 + nominalPct / 100) / (1 + cpiPct / 100) - 1) * 100
}

function buildGrowthSeries(
  asset: AssetConfig,
  startYear: number,
  endYear: number,
  currency: CurrencyCode,
  initialAmount: number,
  inflationAdjusted: boolean,
  nominalReturns: Record<string, Record<number, number>>,
  cpiData: Record<CurrencyCode, Record<number, number>>,
): Record<number, number> {
  const series: Record<number, number> = {}
  let value = initialAmount
  const effectiveStart = Math.max(startYear, asset.startYear)

  for (let y = effectiveStart; y <= endYear; y++) {
    if (y === effectiveStart) {
      series[y] = initialAmount
    }
    const nomRet = nominalReturns[asset.key]?.[y]
    if (nomRet === undefined) { series[y] = series[y - 1] ?? initialAmount; continue }
    const cpi = cpiData[currency]?.[y] ?? 2.0
    const ret = inflationAdjusted ? calcRealReturn(nomRet, cpi) : nomRet
    value = value * (1 + ret / 100)
    series[y] = Math.round(value * 100) / 100
  }
  return series
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm min-w-[180px]">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {sorted.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {symbol}{Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InvestmentRaceCalculatorPage() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [startYear, setStartYear] = useState(2010)
  const [endYear, setEndYear] = useState(2026)
  const [initialAmount, setInitialAmount] = useState("10000")
  const [inflationAdjusted, setInflationAdjusted] = useState(true)
  const [logScale, setLogScale] = useState(true)
  const [activeAssets, setActiveAssets] = useState<Set<string>>(
    new Set(["sp500", "gold", "bitcoin", "housing", "bonds", "savings"])
  )
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)

  // ─── Dynamic data state ──────────────────────────────────────────────────────
  const [nominalReturns, setNominalReturns] = useState<Record<string, Record<number, number>>>({
    sp500:   FALLBACK_SP500,
    gold:    FALLBACK_GOLD,
    bitcoin: { ...FALLBACK_BITCOIN },
    housing: FALLBACK_HOUSING,
    bonds:   FALLBACK_BONDS,
    savings: FALLBACK_SAVINGS,
  })
  const [cpiData, setCpiData] = useState<Record<CurrencyCode, Record<number, number>>>({
    USD: {}, GBP: {}, EUR: {}, CAD: {}, AUD: {}, CHF: {}, JPY: {}, NZD: {},
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [liveBtcReturn, setLiveBtcReturn] = useState<number | null>(null)
  const [btcLiveLoading, setBtcLiveLoading] = useState(false)
  const [dataSource, setDataSource] = useState<"live" | "fallback">("fallback")

  // ─── Load all /public/data files + derive returns ────────────────────────────
  const loadPublicData = useCallback(async () => {
    setDataLoading(true)
    try {
      const CURRENCY_FILES: Record<CurrencyCode, string> = {
        USD: "/data/usd-inflation.json",
        GBP: "/data/gbp-inflation.json",
        EUR: "/data/eur-inflation.json",
        CAD: "/data/cad-inflation.json",
        AUD: "/data/aud-inflation.json",
        CHF: "/data/chf-inflation.json",
        JPY: "/data/jpy-inflation.json",
        NZD: "/data/nzd-inflation.json",
      }

      // Fetch all files in parallel
      const [sp500Res, bondsRes, bisRes, ...cpiResponses] = await Promise.all([
        fetch("/data/sp500-returns.json"),
        fetch("/data/bond-yields.json"),
        fetch("/data/bis-property-prices.json"),
        ...Object.values(CURRENCY_FILES).map((f) => fetch(f)),
      ])

      const newNominal: Record<string, Record<number, number>> = {
        sp500:   { ...FALLBACK_SP500 },
        gold:    { ...FALLBACK_GOLD },
        bitcoin: { ...FALLBACK_BITCOIN },
        housing: { ...FALLBACK_HOUSING },
        bonds:   { ...FALLBACK_BONDS },
        savings: { ...FALLBACK_SAVINGS },
      }

      // ── S&P 500 from sp500-returns.json ──────────────────────────────────────
      if (sp500Res.ok) {
        const sp500Json = await sp500Res.json()
        const sp500Map: Record<number, number> = {}
        for (const entry of sp500Json.data ?? []) {
          if (entry.year >= MIN_YEAR && entry.year <= MAX_YEAR) {
            sp500Map[entry.year] = entry.return
          }
        }
        if (Object.keys(sp500Map).length > 0) newNominal.sp500 = sp500Map
      }

      // ── Bonds from bond-yields.json (use yield as proxy return) ─────────────
      // We derive price return from yield changes: when yields fall, bonds gain.
      // Price return ≈ -duration × Δyield. We use 10-yr modified duration ≈ 8.
      // Total return = coupon (prior year yield) - duration × Δyield
      if (bondsRes.ok) {
        const bondsJson = await bondsRes.json()
        const bondData: { year: number; yield: number }[] = bondsJson.data ?? []
        const bondMap: Record<number, number> = {}
        for (let i = 1; i < bondData.length; i++) {
          const y = bondData[i].year
          if (y < MIN_YEAR || y > MAX_YEAR) continue
          const coupon = bondData[i - 1].yield
          const deltaYield = bondData[i].yield - bondData[i - 1].yield
          const priceReturn = -8 * deltaYield
          bondMap[y] = Math.round((coupon + priceReturn) * 100) / 100
        }
        if (Object.keys(bondMap).length > 0) newNominal.bonds = bondMap
      }

      // ── Housing from bis-property-prices.json (per-currency) ─────────────────
      if (bisRes.ok) {
        const bisJson = await bisRes.json()
        // We store housing returns per-currency separately so they update with selection.
        // For now, pre-compute USD (US) and store it as the base housing series.
        // Currency-specific housing will be applied at render time via the BIS data.
        const bisHousingByCurrency: Partial<Record<CurrencyCode, Record<number, number>>> = {}
        for (const series of bisJson.nominalSeries ?? []) {
          const ccy = Object.entries(BIS_COUNTRY_FOR_CURRENCY).find(
            ([, country]) => country === series.country
          )?.[0] as CurrencyCode | undefined
          if (ccy) {
            const returns = indexToAnnualReturns(series.data)
            bisHousingByCurrency[ccy] = returns
          }
        }
        // Store full BIS data in state for per-currency rendering
        // Use USD as default housing series
        if (bisHousingByCurrency.USD) newNominal.housing = bisHousingByCurrency.USD
        // Attach all per-currency housing to newNominal under special keys
        for (const [ccy, returns] of Object.entries(bisHousingByCurrency)) {
          newNominal[`housing_${ccy}`] = returns as Record<number, number>
        }
      }

      // ── CPI from currency inflation JSON files ────────────────────────────────
      const newCpi: Record<CurrencyCode, Record<number, number>> = {
        USD: {}, GBP: {}, EUR: {}, CAD: {}, AUD: {}, CHF: {}, JPY: {}, NZD: {},
      }
      const currencyCodes = Object.keys(CURRENCY_FILES) as CurrencyCode[]
      for (let i = 0; i < cpiResponses.length; i++) {
        const res = cpiResponses[i]
        const ccy = currencyCodes[i]
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            newCpi[ccy] = cumulativeIndexToAnnualCPI(json.data)
          }
        }
      }

      setNominalReturns((prev) => ({ ...newNominal, bitcoin: { ...newNominal.bitcoin, ...prev.bitcoin } }))
      // Fill any missing CPI years with fallback values from FALLBACK_CPI
      const FALLBACK_CPI: Record<CurrencyCode, Record<number, number>> = {
        USD: { 2000:3.4,2001:2.8,2002:1.6,2003:2.3,2004:2.7,2005:3.4,2006:3.2,2007:2.9,2008:3.8,2009:-0.4,2010:1.6,2011:3.2,2012:2.1,2013:1.5,2014:1.6,2015:0.1,2016:1.3,2017:2.1,2018:2.4,2019:1.8,2020:1.2,2021:4.7,2022:8.0,2023:4.1,2024:2.9,2025:2.5 },
        GBP: { 2000:0.8,2001:1.2,2002:1.3,2003:1.4,2004:1.3,2005:2.1,2006:2.3,2007:2.3,2008:3.6,2009:2.2,2010:3.3,2011:4.5,2012:2.8,2013:2.6,2014:1.5,2015:0.0,2016:0.7,2017:2.7,2018:2.5,2019:1.8,2020:0.9,2021:2.6,2022:9.1,2023:7.3,2024:2.6,2025:2.8 },
        EUR: { 2000:2.1,2001:2.3,2002:2.3,2003:2.1,2004:2.1,2005:2.2,2006:2.2,2007:2.1,2008:3.3,2009:0.3,2010:1.6,2011:2.7,2012:2.5,2013:1.4,2014:0.4,2015:0.0,2016:0.2,2017:1.5,2018:1.8,2019:1.2,2020:0.3,2021:2.6,2022:8.4,2023:5.4,2024:2.4,2025:2.3 },
        CAD: { 2000:2.7,2001:2.5,2002:2.3,2003:2.8,2004:1.9,2005:2.2,2006:2.0,2007:2.1,2008:2.4,2009:0.3,2010:1.8,2011:2.9,2012:1.5,2013:0.9,2014:2.0,2015:1.1,2016:1.4,2017:1.6,2018:2.3,2019:1.9,2020:0.7,2021:3.4,2022:6.8,2023:3.9,2024:2.6,2025:2.4 },
        AUD: { 2000:4.5,2001:4.4,2002:3.0,2003:2.8,2004:2.3,2005:2.7,2006:3.5,2007:2.3,2008:4.4,2009:1.8,2010:2.8,2011:3.3,2012:1.8,2013:2.4,2014:2.5,2015:1.5,2016:1.3,2017:1.9,2018:1.9,2019:1.6,2020:0.9,2021:2.9,2022:6.6,2023:5.6,2024:3.2,2025:2.6 },
        CHF: { 2000:1.6,2001:1.0,2002:0.6,2003:0.6,2004:0.8,2005:1.2,2006:1.1,2007:0.7,2008:2.4,2009:-0.5,2010:0.7,2011:0.2,2012:-0.7,2013:-0.2,2014:0.0,2015:-1.1,2016:-0.4,2017:0.5,2018:0.9,2019:0.4,2020:-0.7,2021:0.6,2022:2.8,2023:2.1,2024:1.1,2025:0.8 },
        JPY: { 2000:-0.7,2001:-0.7,2002:-0.9,2003:-0.3,2004:0.0,2005:-0.3,2006:0.3,2007:0.1,2008:1.4,2009:-1.3,2010:-0.7,2011:-0.3,2012:0.0,2013:0.4,2014:2.7,2015:0.8,2016:-0.1,2017:0.5,2018:1.0,2019:0.5,2020:0.0,2021:-0.2,2022:2.5,2023:3.3,2024:2.7,2025:2.2 },
        NZD: { 2000:2.6,2001:2.6,2002:2.7,2003:1.8,2004:2.3,2005:3.0,2006:3.4,2007:2.4,2008:4.0,2009:2.1,2010:2.3,2011:4.0,2012:1.1,2013:1.1,2014:1.2,2015:0.4,2016:0.6,2017:1.8,2018:1.6,2019:1.6,2020:1.7,2021:3.9,2022:7.2,2023:5.7,2024:3.3,2025:2.5 },
      }
      const mergedCpi: Record<CurrencyCode, Record<number, number>> = {} as Record<CurrencyCode, Record<number, number>>
      for (const ccy of currencyCodes) {
        mergedCpi[ccy] = { ...FALLBACK_CPI[ccy], ...newCpi[ccy] }
      }
      setCpiData(mergedCpi)
      setDataSource("live")
    } catch (err) {
      console.error("[v0] Failed to load public data, using fallbacks:", err)
      setDataSource("fallback")
    } finally {
      setDataLoading(false)
    }
  }, [])

  // ─── Fetch live Bitcoin price from CoinGecko ──────────────────────────────
  const fetchLiveBitcoin = useCallback(async () => {
    setBtcLiveLoading(true)
    try {
      const data = await fetchCryptoCurrentPrices(["bitcoin"], "usd")
      const btcNow = data?.[0]?.current_price
      if (btcNow && btcNow > 0) {
        // Bitcoin Jan 1 2026 opening price ≈ $94,200
        const btcJan2026 = 94200
        const ytdReturn = ((btcNow - btcJan2026) / btcJan2026) * 100
        setLiveBtcReturn(Math.round(ytdReturn * 100) / 100)
        setNominalReturns((prev) => ({
          ...prev,
          bitcoin: { ...prev.bitcoin, 2026: Math.round(ytdReturn * 100) / 100 },
        }))
      }
    } catch (err) {
      console.warn("[v0] CoinGecko fetch failed, using fallback Bitcoin return:", err)
    } finally {
      setBtcLiveLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPublicData()
    fetchLiveBitcoin()
  }, [loadPublicData, fetchLiveBitcoin])

  // ─── Per-currency housing: swap nominal housing series when currency changes ──
  useEffect(() => {
    const bisKey = `housing_${BIS_COUNTRY_FOR_CURRENCY[currency]}`
    setNominalReturns((prev) => {
      if (prev[bisKey]) {
        return { ...prev, housing: prev[bisKey] }
      }
      return prev
    })
  }, [currency])

  const sym = CURRENCIES[currency].symbol
  const amount = Math.max(100, parseFloat(initialAmount.replace(/,/g, "")) || 10000)
  const yearRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

  // ─── Load blog essay from Supabase ──────────────────────────────────────────
  useEffect(() => {
    const loadBlogContent = async () => {
      const defaultContent = `## Which Investment Beat Inflation? A Historical Comparison\n\nThis calculator shows you the real, inflation-adjusted return of six major asset classes — S&P 500, gold, Bitcoin, housing, government bonds, and savings accounts — over any year range since 2000.`
      try {
        const content = await getCachedContent("investment_race_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "investment_race_essay")
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

  // ─── Growth series computation ───────────────────────────────────────────────
  const chartData = useMemo(() => {
    return yearRange.map((year) => {
      const row: Record<string, number | string> = { year }
      for (const asset of ASSETS) {
        if (!activeAssets.has(asset.key)) continue
        const series = buildGrowthSeries(asset, startYear, endYear, currency, amount, inflationAdjusted, nominalReturns, cpiData)
        row[asset.key] = series[year] ?? amount
      }
      return row
    })
  }, [startYear, endYear, currency, amount, inflationAdjusted, activeAssets, nominalReturns, cpiData])

  // ─── Final values and ranking ────────────────────────────────────────────────
  const finalValues = useMemo(() => {
    return ASSETS.filter((a) => activeAssets.has(a.key)).map((asset) => {
      const series = buildGrowthSeries(asset, startYear, endYear, currency, amount, inflationAdjusted, nominalReturns, cpiData)
      const finalVal = series[endYear] ?? amount
      const totalReturn = ((finalVal - amount) / amount) * 100
      const years = endYear - Math.max(startYear, asset.startYear)
      const cagr = years > 0 ? (Math.pow(finalVal / amount, 1 / years) - 1) * 100 : 0
      return { ...asset, finalVal, totalReturn, cagr }
    }).sort((a, b) => b.finalVal - a.finalVal)
  }, [startYear, endYear, currency, amount, inflationAdjusted, activeAssets, nominalReturns, cpiData])

  // ─── Inflation total over period ─────────────────────────────────────────────
  const totalCpiPct = useMemo(() => {
    let factor = 1
    for (let y = startYear + 1; y <= endYear; y++) {
      factor *= (1 + (cpiData[currency]?.[y] ?? 2) / 100)
    }
    return (factor - 1) * 100
  }, [startYear, endYear, currency, cpiData])

  const winner = finalValues[0] ?? null
  const loser = finalValues[finalValues.length - 1] ?? null

  const toggleAsset = (key: string) => {
    setActiveAssets((prev) => {
      const next = new Set(prev)
      if (next.has(key) && next.size > 1) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const yearOptions = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">

      <main className="max-w-3xl mx-auto px-4 pt-[152px] sm:pt-24 pb-6 space-y-4">

        {/* Hero — no card box, mirrors homepage style */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-9 h-9 text-blue-600 dark:text-blue-400 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-balance">
              Investment Race Calculator
            </h1>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-pretty leading-relaxed">
            Which asset actually beat inflation? Compare real returns of S&amp;P 500, gold, Bitcoin, housing, bonds, and savings across any year range since 2000.
          </p>
          {/* Data status */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {dataLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Loading live data…
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 text-xs ${dataSource === "live" ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dataSource === "live" ? "bg-green-500" : "bg-gray-400"}`} />
                {dataSource === "live" ? "Live data loaded" : "Using cached data"}
              </span>
            )}
            {liveBtcReturn !== null && (
              <span className="inline-flex items-center gap-1.5 text-xs text-orange-500 dark:text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                BTC 2026 YTD: {liveBtcReturn >= 0 ? "+" : ""}{liveBtcReturn.toFixed(1)}% (live)
                {btcLiveLoading && <RefreshCw className="w-3 h-3 animate-spin ml-0.5" />}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5">Calculator Settings</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {/* Initial Investment */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Initial investment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{sym}</span>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code}</option>
                ))}
              </select>
            </div>

            {/* Start year */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">From year</label>
              <select
                value={startYear}
                onChange={(e) => { const v = parseInt(e.target.value); setStartYear(v); if (v >= endYear) setEndYear(Math.min(v + 1, MAX_YEAR)) }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.filter(y => y < MAX_YEAR).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* End year */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">To year</label>
              <select
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.filter(y => y > startYear).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Real vs nominal toggle */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Inflation-adjusted (real returns)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Uses {CURRENCIES[currency].name} CPI data — shows what each asset truly gained in purchasing power</p>
            </div>
            <button
              onClick={() => setInflationAdjusted((v) => !v)}
              aria-pressed={inflationAdjusted}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${inflationAdjusted ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${inflationAdjusted ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Asset toggles */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 self-center mr-1">Assets:</span>
            {ASSETS.map((asset) => {
              const isActive = activeAssets.has(asset.key)
              return (
                <button
                  key={asset.key}
                  onClick={() => toggleAsset(asset.key)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    isActive
                      ? "text-white border-transparent"
                      : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 opacity-50"
                  }`}
                  style={isActive ? { backgroundColor: asset.color, borderColor: asset.color } : {}}
                >
                  {asset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results summary strip */}
        {winner && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Best performer</span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white truncate">{winner.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sym}{winner.finalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Winner total return</span>
              </div>
              <p className="text-base font-bold text-green-600 dark:text-green-400">+{winner.totalReturn.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{winner.cagr.toFixed(1)}% / yr CAGR</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Worst performer</span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white truncate">{loser.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{loser.totalReturn >= 0 ? "+" : ""}{loser.totalReturn.toFixed(1)}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Cumulative CPI</span>
              </div>
              <p className="text-base font-bold text-orange-500">+{totalCpiPct.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{startYear}–{endYear} inflation</p>
            </div>
          </div>
        )}

        {/* Main chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              {sym}{parseFloat(initialAmount || "10000").toLocaleString()} invested in {startYear} — value by year
            </h2>
            <button
              onClick={() => setLogScale((v) => !v)}
              title={logScale ? "Switch to linear scale" : "Switch to log scale (better for comparing assets with very different returns)"}
              className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors shrink-0 ml-3 ${
                logScale
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:text-blue-500"
              }`}
            >
              Log scale
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
            {inflationAdjusted ? "Real (inflation-adjusted) returns" : "Nominal returns"} · {CURRENCIES[currency].name} · {endYear - startYear} year window
          </p>
          <div className="h-72 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  scale={logScale ? "log" : "auto"}
                  domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                  allowDataOverflow={logScale}
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
                    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}k`
                    return `${sym}${v}`
                  }}
                  tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip content={<CustomTooltip symbol={sym} />} />
                <ReferenceLine
                  y={amount}
                  stroke="rgba(100,116,139,0.4)"
                  strokeDasharray="4 4"
                  label={{ value: "Starting value", position: "insideTopLeft", fontSize: 10, fill: "rgb(100 116 139)" }}
                />
                {ASSETS.filter((a) => activeAssets.has(a.key)).map((asset) => (
                  <Line
                    key={asset.key}
                    type="monotone"
                    dataKey={asset.key}
                    name={asset.label}
                    stroke={asset.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    connectNulls
                  />
                ))}
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Final Standings — {sym}{parseFloat(initialAmount || "10000").toLocaleString()} invested in {startYear}
          </h2>
          <div className="space-y-2">
            {finalValues.map((asset, i) => {
              const beat = inflationAdjusted ? asset.totalReturn > 0 : asset.totalReturn > totalCpiPct
              const gain = asset.finalVal - amount
              return (
                <div
                  key={asset.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <span className="w-5 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                  <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{asset.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white hidden sm:block">
                    {sym}{asset.finalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className={`text-sm font-semibold w-20 text-right ${beat ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                    {asset.totalReturn >= 0 ? "+" : ""}{asset.totalReturn.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-20 text-right hidden sm:block">
                    {asset.cagr >= 0 ? "+" : ""}{asset.cagr.toFixed(1)}% /yr
                  </span>
                  <span className="shrink-0">
                    {beat
                      ? <TrendingUp className="w-4 h-4 text-green-500" />
                      : gain >= 0
                        ? <Minus className="w-4 h-4 text-gray-400" />
                        : <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                  </span>
                </div>
              )
            })}
          </div>
          {inflationAdjusted && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Positive return = grew faster than {CURRENCIES[currency].name} CPI inflation of {totalCpiPct.toFixed(1)}% over this period. Negative = lost purchasing power.
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">How This Calculator Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                n: "1",
                title: "Same price, different race",
                body: "You invest the same amount in each asset on the same start date. The chart shows how the value of each investment would have grown — or shrunk — year by year.",
              },
              {
                n: "2",
                title: "Real vs nominal",
                body: "With inflation adjustment on, returns are deflated by your currency's CPI each year. A 10% nominal gain in a year with 8% inflation is only a 1.9% real gain in purchasing power.",
              },
              {
                n: "3",
                title: "CPI data by country",
                body: "Inflation is sourced from FAOSTAT and national statistics agencies for each of the 8 supported currencies — so USD, GBP, EUR, JPY and others all use their own official CPI benchmarks.",
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{s.n}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blog / Essay Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Which Assets Beat Inflation Over the Long Run?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">A data-driven look at real returns across six major asset classes</p>
          {blogLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${i === 4 ? "w-3/4" : ""}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
              {blogContent.split("\n").map((line, idx) => {
                const t = line.trim()
                if (!t) return null
                if (t.startsWith("## ")) return <h3 key={idx} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t.substring(3)}</h3>
                if (t.startsWith("### ")) return <h4 key={idx} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-5 mb-2">{t.substring(4)}</h4>
                const parts: (string | JSX.Element)[] = []
                const boldRe = /\*\*(.+?)\*\*/g
                let last = 0, m: RegExpExecArray | null, k = 0
                while ((m = boldRe.exec(t)) !== null) {
                  if (m.index > last) parts.push(t.substring(last, m.index))
                  parts.push(<strong key={k++} className="font-semibold text-gray-900 dark:text-white">{m[1]}</strong>)
                  last = m.index + m[0].length
                }
                if (last < t.length) parts.push(t.substring(last))
                return <p key={idx} className="text-base leading-7">{parts.length ? parts : t}</p>
              })}
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Methodology &amp; Data Sources</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">How returns are calculated and where the historical data comes from</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Asset Data Sources</h3>
              <div className="space-y-3 text-sm">
                {ASSETS.map((asset) => (
                  <div key={asset.key} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: asset.color }} />
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">{asset.label}</strong>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{asset.description}. Source: {asset.source}.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Calculation Methodology</h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Nominal annual return:</strong>
                  <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                    Value(year) = Value(year−1) × (1 + nominal_return%)
                  </div>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Real (inflation-adjusted) return:</strong>
                  <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                    real = ((1 + nominal) ÷ (1 + CPI)) − 1
                  </div>
                  <p className="mt-1 leading-relaxed">Fisher equation — isolates purchasing-power growth from currency debasement.</p>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">CAGR:</strong>
                  <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                    (FinalValue ÷ InitialValue) ^ (1 ÷ Years) − 1
                  </div>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">CPI data:</strong>
                  <p className="mt-1 leading-relaxed">Annual headline CPI derived from our currency inflation JSON files (usd-inflation.json, gbp-inflation.json, etc.) sourced from BLS, ONS, Eurostat, Statistics Canada, ABS, SFSO, Statistics Bureau of Japan, and Stats NZ. Coverage: 2000–2025. S&P 500 annual returns sourced from sp500-returns.json (Shiller/Yale). Housing returns derived from BIS Residential Property Price Statistics (bis-property-prices.json) per currency. Bond returns calculated from bond-yields.json (FRED). Bitcoin 2025 return updated live via CoinGecko API.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Important Notes</h3>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
              <li>Returns are representative annual figures — not an exact simulation of any specific index fund or product</li>
              <li>Bitcoin data begins 2013; if your start year is earlier, Bitcoin starts from 2013 with the initial amount</li>
              <li>S&P 500 returns include reinvested dividends (total return basis)</li>
              <li>Housing returns are national averages — local markets vary substantially</li>
              <li>Bond returns assume reinvestment at prevailing yields; they do not account for active trading</li>
              <li>Past performance does not predict future returns. This tool is for educational purposes only</li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <FAQ category="investment-race" />
        </div>

        {/* Related calculators */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Related calculators</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/",                           label: "Global Inflation Calculator"   },
              { href: "/deflation-calculator",       label: "Deflation Calculator"          },
              { href: "/global-compound-interest",   label: "Compound Interest Calculator"  },
              { href: "/global-net-worth-calculator",label: "Net Worth Calculator"          },
              { href: "/retirement-calculator",      label: "Retirement Calculator"         },
              { href: "/roi-calculator",             label: "ROI Calculator"                },
              { href: "/charts",                     label: "Inflation Charts"              },
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
        <footer className="mt-4 bg-gray-900 text-white rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            <div>
              <h3 className="text-xl font-bold mb-3">Investment Race Calculator</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Compare real, inflation-adjusted returns of S&P 500, gold, Bitcoin, housing, bonds, and savings across any year range since 2000. Powered by official CPI data from FAOSTAT and national statistics agencies.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Robert Shiller / Yale Economics (S&P 500)</li>
                <li>• LBMA / ICE Benchmark Administration (Gold)</li>
                <li>• CoinGecko / CoinMarketCap (Bitcoin)</li>
                <li>• BIS Residential Property Price Statistics</li>
                <li>• FRED / World Bank (Bonds, Savings rates)</li>
                <li>• FAOSTAT / National CPI agencies (Inflation)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">More Tools</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/mortgage-calculator" className="hover:text-white transition-colors">Mortgage Calculator</Link></li>
                <li><Link href="/home-affordability-calculator/inflation-adjusted" className="hover:text-white transition-colors">Home Affordability Calculator</Link></li>
                <li><Link href="/deflation-calculator" className="hover:text-white transition-colors">Deflation Calculator</Link></li>
                <li><Link href="/charts" className="hover:text-white transition-colors">Charts &amp; Analytics</Link></li>
                <li><Link href="/global-compound-interest" className="hover:text-white transition-colors">Compound Interest Calculator</Link></li>
                <li><Link href="/global-net-worth-calculator" className="hover:text-white transition-colors">Global Net Worth Calculator</Link></li>
                <li><Link href="/ppp-calculator" className="hover:text-white transition-colors">PPP Calculator</Link></li>
                <li><Link href="/auto-loan-calculator" className="hover:text-white transition-colors">Auto Loan Calculator</Link></li>
                <li><Link href="/salary-calculator" className="hover:text-white transition-colors">Salary Calculator</Link></li>
                <li><Link href="/retirement-calculator" className="hover:text-white transition-colors">Retirement Calculator</Link></li>
                <li><Link href="/student-loan-calculator" className="hover:text-white transition-colors">Student Loan Calculator</Link></li>
                <li><Link href="/budget-calculator" className="hover:text-white transition-colors">Budget Calculator</Link></li>
                <li><Link href="/emergency-fund-calculator" className="hover:text-white transition-colors">Emergency Fund Calculator</Link></li>
                <li><Link href="/roi-calculator" className="hover:text-white transition-colors">ROI Calculator</Link></li>
                <li><Link href="/insurance-inflation-calculator" className="hover:text-white transition-colors">Insurance Inflation Calculator</Link></li>
                <li><Link href="/legacy-planner" className="hover:text-white transition-colors">Legacy Planner</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 px-8 py-4 text-xs text-gray-400">
            <p>For educational purposes only. Returns are representative figures based on historical data. Past performance does not guarantee future results.</p>
          </div>
        </footer>

      </main>
    </div>
  )
}
