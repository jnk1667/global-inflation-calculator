"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import Link from "next/link"
import { AlertTriangle, TrendingDown, Star, DollarSign, Info, BookOpen, ChevronRight } from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

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
  USD: { symbol: "$",   name: "US Dollar",         flag: "🇺🇸", iso3: "USA" },
  GBP: { symbol: "£",   name: "British Pound",      flag: "🇬🇧", iso3: "GBR" },
  EUR: { symbol: "€",   name: "Euro",               flag: "🇪🇺", iso3: "DEU" },
  CAD: { symbol: "C$",  name: "Canadian Dollar",    flag: "🇨🇦", iso3: "CAN" },
  AUD: { symbol: "A$",  name: "Australian Dollar",  flag: "🇦🇺", iso3: "AUS" },
  CHF: { symbol: "Fr",  name: "Swiss Franc",        flag: "🇨🇭", iso3: "CHE" },
  JPY: { symbol: "¥",   name: "Japanese Yen",       flag: "🇯🇵", iso3: "JPN" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", iso3: "NZL" },
} as const

type CurrencyCode = keyof typeof CURRENCIES

// ─── Quality dimension types ──────────────────────────────────────────────────

type QualityUnit =
  | "stars"       // 1–5 star rating (e.g. hotel, restaurant)
  | "percent"     // ingredient/material percentage (e.g. cotton %, juice %)
  | "count"       // item count (e.g. thread count, pieces in pack)
  | "minutes"     // service duration (e.g. 60-min massage → 50-min)
  | "grams"       // ingredient weight (e.g. meat content in ready meal)
  | "custom"      // any user-defined unit

const QUALITY_UNIT_LABELS: Record<QualityUnit, string> = {
  stars:   "Star rating (e.g. 4.5 → 3.8)",
  percent: "Material / ingredient % (e.g. 100% cotton → 60% cotton)",
  count:   "Count (e.g. thread count 400 → 280)",
  minutes: "Duration in minutes (e.g. 60-min service → 45-min)",
  grams:   "Ingredient weight in grams (e.g. 80g meat → 55g meat)",
  custom:  "Custom unit",
}

// ─── Preset examples (locale-aware per currency) ──────────────────────────────

type Preset = {
  label: string
  productName: string
  oldQuality: number
  newQuality: number
  oldPrice: number
  newPrice: number
  oldYear: number
  newYear: number
  qualityUnit: QualityUnit
  purchasesPerYear: number
}

const PRESETS_BY_CURRENCY: Record<CurrencyCode, Preset[]> = {
  USD: [
    { label: "Fast Food Portion",    productName: "McDonald's Large Fries",        oldQuality: 180, newQuality: 145, oldPrice: 3.29,  newPrice: 4.29,  oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 52 },
    { label: "Grocery Chicken",      productName: "Store-Brand Rotisserie Chicken",oldQuality: 1400,newQuality: 1100,oldPrice: 4.99,  newPrice: 6.99,  oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Hotel Room",           productName: "Mid-Range Hotel Night",          oldQuality: 4.2, newQuality: 3.5, oldPrice: 139,   newPrice: 169,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Streaming Quality",    productName: "Cable Internet Service",         oldQuality: 100, newQuality: 65,  oldPrice: 59.99, newPrice: 79.99, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 12 },
    { label: "Cotton T-Shirt",       productName: "Department Store Cotton Tee",    oldQuality: 100, newQuality: 62,  oldPrice: 24.99, newPrice: 27.99, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "Gym Membership",       productName: "National Chain Gym Session",     oldQuality: 60,  newQuality: 45,  oldPrice: 39.99, newPrice: 49.99, oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
  ],
  GBP: [
    { label: "Ready Meal",           productName: "Supermarket Beef Ready Meal",    oldQuality: 115, newQuality: 75,  oldPrice: 3.50,  newPrice: 3.99,  oldYear: 2018, newYear: 2024, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Hotel B&B",            productName: "Budget Hotel Breakfast",         oldQuality: 4.3, newQuality: 3.4, oldPrice: 89,    newPrice: 109,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Bed Sheets",           productName: "High Street Cotton Bed Sheets",  oldQuality: 400, newQuality: 260, oldPrice: 45,    newPrice: 49,    oldYear: 2019, newYear: 2024, qualityUnit: "count",   purchasesPerYear: 2  },
    { label: "Pub Meal Portion",     productName: "Pub Carvery Meat Serving",       oldQuality: 280, newQuality: 210, oldPrice: 12.50, newPrice: 15.99, oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 12 },
    { label: "Train Seat Quality",   productName: "Standard Class Rail Journey",    oldQuality: 100, newQuality: 58,  oldPrice: 42,    newPrice: 59,    oldYear: 2019, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 12 },
    { label: "Orange Juice",         productName: "Supermarket Fresh Orange Juice", oldQuality: 100, newQuality: 38,  oldPrice: 1.89,  newPrice: 2.15,  oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 52 },
  ],
  EUR: [
    { label: "Supermarkt Wurst",     productName: "Supermarkt Fleischwurst",        oldQuality: 250, newQuality: 190, oldPrice: 2.99,  newPrice: 3.49,  oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Brasserie Meal",       productName: "Brasserie Plat du Jour",         oldQuality: 100, newQuality: 62,  oldPrice: 13.50, newPrice: 17.50, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 24 },
    { label: "Hotel Rating",         productName: "City Centre Hotel Night",        oldQuality: 4.1, newQuality: 3.3, oldPrice: 110,   newPrice: 135,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Baumwoll-T-Shirt",     productName: "Baumwoll-T-Shirt Mittelklasse",  oldQuality: 100, newQuality: 60,  oldPrice: 19.99, newPrice: 22.99, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "Fitnessstudio",        productName: "Fitnessstudio Monatsbeitrag",    oldQuality: 60,  newQuality: 45,  oldPrice: 29.90, newPrice: 39.90, oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
    { label: "Orangensaft",          productName: "Supermarkt Orangensaft frisch",  oldQuality: 100, newQuality: 42,  oldPrice: 1.79,  newPrice: 1.99,  oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 52 },
  ],
  CAD: [
    { label: "Tim Hortons Coffee",   productName: "Tim Hortons Large Coffee",       oldQuality: 454, newQuality: 400, oldPrice: 2.29,  newPrice: 2.99,  oldYear: 2019, newYear: 2025, qualityUnit: "ml",      purchasesPerYear: 104},
    { label: "Grocery Beef",         productName: "Superstore Ground Beef Pack",    oldQuality: 900, newQuality: 700, oldPrice: 8.99,  newPrice: 12.99, oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Hotel Stay",           productName: "Downtown Hotel Night",           oldQuality: 4.2, newQuality: 3.4, oldPrice: 149,   newPrice: 179,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Cotton T-Shirt",       productName: "Hudson&apos;s Bay Cotton Shirt", oldQuality: 100, newQuality: 65,  oldPrice: 34.99, newPrice: 39.99, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "Gym Session",          productName: "GoodLife Fitness Class",         oldQuality: 60,  newQuality: 45,  oldPrice: 44.99, newPrice: 54.99, oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
    { label: "Maple Syrup",          productName: "Store Brand Pure Maple Syrup",   oldQuality: 540, newQuality: 400, oldPrice: 8.49,  newPrice: 10.99, oldYear: 2020, newYear: 2025, qualityUnit: "ml",      purchasesPerYear: 12 },
  ],
  AUD: [
    { label: "Meat Pie",             productName: "Supermarket Meat Pie",           oldQuality: 175, newQuality: 130, oldPrice: 3.50,  newPrice: 4.50,  oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 52 },
    { label: "Woolworths Steak",     productName: "Woolworths Beef Scotch Fillet",  oldQuality: 400, newQuality: 300, oldPrice: 14.99, newPrice: 19.99, oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Hotel Accommodation",  productName: "City Hotel Night",               oldQuality: 4.1, newQuality: 3.3, oldPrice: 169,   newPrice: 199,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Cotton T-Shirt",       productName: "Kmart Basic Cotton Tee",         oldQuality: 100, newQuality: 58,  oldPrice: 15.00, newPrice: 17.00, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "Gym Membership",       productName: "Fitness First Monthly Pass",     oldQuality: 60,  newQuality: 45,  oldPrice: 49.99, newPrice: 64.99, oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
    { label: "Vegemite",             productName: "Vegemite Jar",                   oldQuality: 380, newQuality: 290, oldPrice: 5.50,  newPrice: 6.99,  oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 12 },
  ],
  CHF: [
    { label: "Migros Cervelat",      productName: "Migros Cervelat Wurst",          oldQuality: 250, newQuality: 190, oldPrice: 3.20,  newPrice: 3.80,  oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Hotelzimmer",          productName: "Stadthotel Übernachtung",        oldQuality: 4.3, newQuality: 3.6, oldPrice: 180,   newPrice: 215,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Baumwoll-Shirt",       productName: "Manor Baumwoll T-Shirt",         oldQuality: 100, newQuality: 64,  oldPrice: 29.90, newPrice: 34.90, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "Fitnesscenter",        productName: "Migros Fitnesscenter Abo",       oldQuality: 60,  newQuality: 48,  oldPrice: 75,    newPrice: 89,    oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
    { label: "Orangensaft",          productName: "Denner Frischorangensaft",       oldQuality: 100, newQuality: 45,  oldPrice: 2.40,  newPrice: 2.80,  oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 52 },
    { label: "Fondue-Käse",          productName: "Emmentaler Raclette Käse",       oldQuality: 400, newQuality: 310, oldPrice: 8.90,  newPrice: 11.50, oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 12 },
  ],
  JPY: [
    { label: "コンビニ弁当",           productName: "セブンイレブン幕の内弁当",         oldQuality: 550, newQuality: 420, oldPrice: 498,   newPrice: 548,   oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 52 },
    { label: "回転寿司",              productName: "回転寿司 1皿あたり",               oldQuality: 25,  newQuality: 17,  oldPrice: 110,   newPrice: 130,   oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "ビジネスホテル",          productName: "ビジネスホテル素泊まり",            oldQuality: 4.1, newQuality: 3.3, oldPrice: 7800,  newPrice: 10500, oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Tシャツ",               productName: "ユニクロ 綿Tシャツ",               oldQuality: 100, newQuality: 68,  oldPrice: 1500,  newPrice: 1990,  oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "スポーツジム",            productName: "エニタイムフィットネス月会費",       oldQuality: 60,  newQuality: 48,  oldPrice: 7500,  newPrice: 9800,  oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
    { label: "カップ麺",               productName: "日清カップヌードル",                oldQuality: 80,  newQuality: 65,  oldPrice: 220,   newPrice: 278,   oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 52 },
  ],
  NZD: [
    { label: "Meat Pie",             productName: "Four'n Twenty Meat Pie",         oldQuality: 175, newQuality: 130, oldPrice: 3.99,  newPrice: 5.49,  oldYear: 2019, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 52 },
    { label: "Countdown Beef",       productName: "Countdown Beef Mince 500g",      oldQuality: 500, newQuality: 390, oldPrice: 6.99,  newPrice: 9.99,  oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 24 },
    { label: "Hotel Accommodation",  productName: "City Motel Night",               oldQuality: 4.0, newQuality: 3.2, oldPrice: 159,   newPrice: 189,   oldYear: 2019, newYear: 2024, qualityUnit: "stars",   purchasesPerYear: 4  },
    { label: "Cotton T-Shirt",       productName: "Warehouse Basic Cotton Tee",     oldQuality: 100, newQuality: 60,  oldPrice: 19.99, newPrice: 22.99, oldYear: 2020, newYear: 2025, qualityUnit: "percent", purchasesPerYear: 6  },
    { label: "Gym Membership",       productName: "Les Mills Class Pass",           oldQuality: 60,  newQuality: 45,  oldPrice: 34.99, newPrice: 44.99, oldYear: 2021, newYear: 2025, qualityUnit: "minutes", purchasesPerYear: 12 },
    { label: "Manuka Honey",         productName: "Comvita Manuka Honey 250g",      oldQuality: 250, newQuality: 180, oldPrice: 22.99, newPrice: 29.99, oldYear: 2020, newYear: 2025, qualityUnit: "grams",   purchasesPerYear: 6  },
  ],
}

const MAX_YEAR = 2025

// ─── Severity helpers ─────────────────────────────────────────────────────────

const getSeverity = (pct: number) => {
  if (pct >= 50) return { label: "Extreme",  color: "text-red-700 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800" }
  if (pct >= 25) return { label: "Severe",   color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800" }
  if (pct >= 12) return { label: "High",     color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-800" }
  if (pct >= 5)  return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" }
  return               { label: "Low",       color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SkimpflationCalculatorPage() {
  const [currency, setCurrency]           = useState<CurrencyCode>("USD")
  const [productName, setProductName]     = useState("")
  const [qualityUnit, setQualityUnit]     = useState<QualityUnit>("percent")
  const [customUnitLabel, setCustomUnitLabel] = useState("")
  const [oldQuality, setOldQuality]       = useState("")
  const [newQuality, setNewQuality]       = useState("")
  const [oldPrice, setOldPrice]           = useState("")
  const [newPrice, setNewPrice]           = useState("")
  const [oldYear, setOldYear]             = useState(String(MAX_YEAR - 5))
  const [newYear, setNewYear]             = useState(String(MAX_YEAR))
  const [purchasesPerYear, setPurchasesPerYear] = useState("12")
  const [blogContent, setBlogContent]     = useState("")
  const [blogLoading, setBlogLoading]     = useState(true)
  const [faoData, setFaoData]             = useState<FaostatData | null>(null)
  const [dataLoaded, setDataLoaded]       = useState(false)

  // ─── Load blog essay from Supabase ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const defaultContent = `## Skimpflation: When Less Quality Costs You More\n\nSkimpflation happens when companies reduce the quality of a product or service while keeping the price the same or increasing it. Unlike shrinkflation — where you get less quantity — skimpflation gives you the same amount of something, just worse. This calculator reveals the true cost of that quality cut.`
      try {
        const content = await getCachedContent("skimpflation_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "skimpflation_essay")
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
    load()
  }, [])

  // ─── Lazy-load CPI data ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (dataLoaded) return
    try {
      const res = await fetch("/data/faostat-food-cpi.json")
      const json = await res.json()
      setFaoData(json)
      setDataLoaded(true)
    } catch {
      setDataLoaded(true)
    }
  }, [dataLoaded])

  const applyPreset = useCallback((preset: Preset) => {
    setProductName(preset.productName)
    setOldQuality(String(preset.oldQuality))
    setNewQuality(String(preset.newQuality))
    setOldPrice(String(preset.oldPrice))
    setNewPrice(String(preset.newPrice))
    setOldYear(String(preset.oldYear))
    setNewYear(String(preset.newYear))
    setQualityUnit(preset.qualityUnit)
    setPurchasesPerYear(String(preset.purchasesPerYear))
    loadData()
  }, [loadData])

  // ─── Core calculations ─────────────────────────────────────────────────────

  const results = useMemo(() => {
    const oq  = parseFloat(oldQuality)
    const nq  = parseFloat(newQuality)
    const op  = parseFloat(oldPrice)
    const np  = parseFloat(newPrice)
    const oy  = parseInt(oldYear, 10)
    const ny  = parseInt(newYear, 10)
    const ppy = parseInt(purchasesPerYear, 10)

    if (!oq || !nq || !op || !np || oq <= 0 || nq <= 0 || op <= 0 || np <= 0) return null
    if (ny <= oy) return { yearError: true } as { yearError: boolean }

    // Quality-adjusted price: what you'd pay at old quality per unit
    // Effective inflation = how much more you pay per quality-unit
    const oldPricePerQualityUnit = op / oq          // price per 1 unit of quality (e.g. $/star, $/%)
    const newPricePerQualityUnit = np / nq
    const qualityDegradation     = ((1 - nq / oq)) * 100          // how much quality fell (%)
    const priceOnlyInflation     = ((np / op) - 1) * 100           // sticker price change
    const effectiveInflation     = ((newPricePerQualityUnit / oldPricePerQualityUnit) - 1) * 100
    const yearsBetween           = ny - oy

    // Fair price: what the new product would cost at the old quality-per-price ratio
    const fairNewPrice           = oldPricePerQualityUnit * nq
    const overchargePerPurchase  = np - fairNewPrice
    const annualOvercharge       = overchargePerPurchase * ppy

    // CAGR of quality-adjusted price
    const cagr = (Math.pow(newPricePerQualityUnit / oldPricePerQualityUnit, 1 / yearsBetween) - 1) * 100

    // CPI benchmark
    let foodCpiOverPeriod: number | null    = null
    let generalCpiOverPeriod: number | null = null

    if (faoData) {
      const iso3        = CURRENCIES[currency].iso3
      const countryData = faoData.data[iso3]
      if (countryData) {
        const startIdx = countryData.foodCpiIndex[String(oy)]
        const endIdx   = countryData.foodCpiIndex[String(ny)]
        if (startIdx && endIdx) foodCpiOverPeriod = ((endIdx / startIdx) - 1) * 100

        const gStart = countryData.generalCpiIndex?.[String(oy)]
        const gEnd   = countryData.generalCpiIndex?.[String(ny)]
        if (gStart && gEnd) generalCpiOverPeriod = ((gEnd / gStart) - 1) * 100
      }
    }

    const excessOverFood = foodCpiOverPeriod !== null ? effectiveInflation - foodCpiOverPeriod : null

    return {
      yearError: false,
      effectiveInflation,
      priceOnlyInflation,
      qualityDegradation,
      oldPricePerQualityUnit,
      newPricePerQualityUnit,
      overchargePerPurchase,
      annualOvercharge,
      cagr,
      yearsBetween,
      oy, ny,
      foodCpiOverPeriod,
      generalCpiOverPeriod,
      excessOverFood,
      fairNewPrice,
    }
  }, [oldQuality, newQuality, oldPrice, newPrice, oldYear, newYear, purchasesPerYear, currency, faoData])

  const sym        = CURRENCIES[currency].symbol
  const unitLabel  = qualityUnit === "custom" ? (customUnitLabel || "unit") : qualityUnit

  // ─── Chart data ────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!results || (results as { yearError: boolean }).yearError) return []
    const r = results as Exclude<typeof results, { yearError: boolean } | null>
    const bars = [
      { name: "Effective\nSkimpflation", value: parseFloat(r.effectiveInflation.toFixed(1)), fill: "#d97706" },
      { name: "Price Only\nChange",      value: parseFloat(r.priceOnlyInflation.toFixed(1)), fill: "#f59e0b" },
    ]
    if (r.foodCpiOverPeriod !== null) {
      bars.push({ name: `Official Food\nCPI ${r.yearsBetween}yr`, value: parseFloat(r.foodCpiOverPeriod.toFixed(1)), fill: "#3b82f6" })
    }
    if (r.generalCpiOverPeriod !== null) {
      bars.push({ name: `General\nCPI ${r.yearsBetween}yr`, value: parseFloat(r.generalCpiOverPeriod.toFixed(1)), fill: "#8b5cf6" })
    }
    return bars
  }, [results])

  const yearOptions    = Array.from({ length: MAX_YEAR - 1999 }, (_, i) => MAX_YEAR - i)
  const newYearOptions = Array.from({ length: MAX_YEAR - 2000 }, (_, i) => MAX_YEAR - i).filter(y => y > parseInt(oldYear, 10))

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="container mx-auto px-4 sm:px-6 pt-32 pb-12 max-w-4xl min-h-screen font-sans">

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 mb-4">
          <TrendingDown className="w-3.5 h-3.5" />
          Quality degradation exposed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3 text-balance leading-tight">
          Free Skimpflation Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-pretty">
          Reveal the true inflation hidden in lower-quality products and services. Enter old vs new quality and price
          — instantly see your effective inflation rate vs. official CPI. 8 currencies.
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
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-amber-400"
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
          {(PRESETS_BY_CURRENCY[currency] ?? PRESETS_BY_CURRENCY.USD).map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 border border-gray-200 dark:border-gray-600 hover:border-amber-300 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Enter product or service details
        </h2>

        {/* Product name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Product or service name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Hotel Room, Cotton T-Shirt, Ready Meal…"
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Quality dimension selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            What quality dimension changed?
          </label>
          <select
            value={qualityUnit}
            onChange={(e) => setQualityUnit(e.target.value as QualityUnit)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {(Object.keys(QUALITY_UNIT_LABELS) as QualityUnit[]).map((u) => (
              <option key={u} value={u}>{QUALITY_UNIT_LABELS[u]}</option>
            ))}
          </select>
          {qualityUnit === "custom" && (
            <input
              type="text"
              value={customUnitLabel}
              onChange={(e) => setCustomUnitLabel(e.target.value)}
              placeholder="Enter your unit label (e.g. thread count, lumens, km/h)"
              className="mt-2 w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          )}
        </div>

        {/* Old vs New grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Old */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Original (then)</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Quality value ({unitLabel})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={oldQuality}
                  onChange={(e) => { setOldQuality(e.target.value); loadData() }}
                  placeholder={qualityUnit === "stars" ? "e.g. 4.5" : qualityUnit === "percent" ? "e.g. 100" : "e.g. 60"}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  placeholder="e.g. 29.99"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
                <select
                  value={oldYear}
                  onChange={(e) => setOldYear(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* New */}
          <div className="bg-amber-50/60 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Current (now)</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Quality value ({unitLabel})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newQuality}
                  onChange={(e) => { setNewQuality(e.target.value); loadData() }}
                  placeholder={qualityUnit === "stars" ? "e.g. 3.8" : qualityUnit === "percent" ? "e.g. 60" : "e.g. 45"}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  placeholder="e.g. 32.99"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {newYearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Purchases per year */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Purchases per year
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={purchasesPerYear}
            onChange={(e) => setPurchasesPerYear(e.target.value)}
            className="w-24 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">Used to calculate annual extra cost</span>
        </div>
      </div>

      {/* Results */}
      {(() => {
        if (!results) return (
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-8 text-center mb-6">
            <TrendingDown className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter quality values and prices above to see your skimpflation result.</p>
          </div>
        )

        if ((results as { yearError: boolean }).yearError) return (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-5 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">The &quot;Current&quot; year must be later than the &quot;Original&quot; year.</p>
          </div>
        )

        const r        = results as Exclude<typeof results, { yearError: boolean } | null>
        const severity = getSeverity(r.effectiveInflation)

        return (
          <>
            {/* Primary result banner */}
            <div className={`rounded-2xl border p-6 mb-4 ${severity.bg} ${severity.border}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Effective skimpflation rate
                    {productName ? ` — ${productName}` : ""}
                  </p>
                  <div className={`text-5xl font-bold ${severity.color}`}>
                    +{r.effectiveInflation.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    {r.oy} → {r.ny} ({r.yearsBetween} year{r.yearsBetween !== 1 ? "s" : ""}) &nbsp;·&nbsp; {r.cagr.toFixed(2)}%/yr annualised
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
                  icon: <TrendingDown className="w-4 h-4 text-amber-500" />,
                  label: "Quality degradation",
                  value: `-${r.qualityDegradation.toFixed(1)}%`,
                  sub: `${unitLabel} reduction`,
                },
                {
                  icon: <DollarSign className="w-4 h-4 text-orange-500" />,
                  label: "Price-only change",
                  value: `+${r.priceOnlyInflation.toFixed(1)}%`,
                  sub: "sticker price increase",
                },
                {
                  icon: <DollarSign className="w-4 h-4 text-red-500" />,
                  label: "Extra per purchase",
                  value: `${sym}${Math.abs(r.overchargePerPurchase).toFixed(2)}`,
                  sub: "vs fair quality price",
                },
                {
                  icon: <DollarSign className="w-4 h-4 text-red-600" />,
                  label: "Annual extra cost",
                  value: `${sym}${Math.abs(r.annualOvercharge).toFixed(2)}`,
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

            {/* Price per quality unit breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                Price-per-{unitLabel} breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Old price per {unitLabel}</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {sym}{r.oldPricePerQualityUnit.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{r.oy}</p>
                </div>
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New price per {unitLabel}</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                    {sym}{r.newPricePerQualityUnit.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{r.ny}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fair price today</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    {sym}{r.fairNewPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">at old quality/price ratio</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compound annual skimpflation rate:{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">+{r.cagr.toFixed(2)}%/yr</span>
                </p>
              </div>
            </div>

            {/* CPI comparison chart */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                  Skimpflation vs Official CPI
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Cumulative % change {r.oy}–{r.ny} · {r.yearsBetween} yr · {CURRENCIES[currency].name}
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
                {r.excessOverFood !== null && (
                  <div className={`mt-3 rounded-lg p-3 text-sm flex items-start gap-2 ${
                    r.excessOverFood > 0
                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
                      : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {r.excessOverFood > 0
                        ? `This product's quality-adjusted inflation is ${r.excessOverFood.toFixed(1)} percentage points above official food CPI for ${CURRENCIES[currency].name} over this period.`
                        : `This product's quality-adjusted inflation is ${Math.abs(r.excessOverFood).toFixed(1)} percentage points below official food CPI — less than average.`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )
      })()}

      {/* How skimpflation works explainer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">How Skimpflation Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            {
              step: "1",
              title: "Same price, worse product",
              desc: "Manufacturers and service providers quietly reduce quality — cheaper ingredients, lower thread counts, thinner materials, shorter service durations — while the price tag stays flat or rises only slightly.",
            },
            {
              step: "2",
              title: "Invisible to standard CPI",
              desc: "Official inflation indices measure price per unit of a fixed basket, not quality per price. A 100% cotton shirt becoming 60% cotton at the same price shows as 0% inflation while your value received has fallen 40%.",
            },
            {
              step: "3",
              title: "Compounds across categories",
              desc: "Hotels cut room amenities. Ready meals dilute meat content. Gym classes shorten. The compounding effect across your entire spending basket can add up to hundreds of pounds or dollars per year in lost value.",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800/40">
          <span className="font-semibold">Key distinction:</span> Skimpflation and shrinkflation are siblings. Shrinkflation reduces quantity (smaller pack). Skimpflation reduces quality (lower-grade materials, less of the good stuff). Both result in the same outcome — you pay more per unit of real value.
        </div>
      </div>

      {/* Blog / Essay Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          Understanding Skimpflation
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          How quality cuts quietly inflate your true cost of living
        </p>
        {blogLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${i === 4 ? "w-3/4" : ""}`} />
            ))}
          </div>
        ) : (
          <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
            {blogContent.split("\n").map((line, index) => {
              const trimmedLine = line.trim()
              if (!trimmedLine) return null
              if (trimmedLine.startsWith("## ")) {
                return <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{trimmedLine.substring(3)}</h3>
              }
              if (trimmedLine.startsWith("### ")) {
                return <h4 key={index} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-5 mb-2">{trimmedLine.substring(4)}</h4>
              }
              const parseBold = (text: string) => {
                const parts: (string | React.JSX.Element)[] = []
                const boldRegex = /\*\*(.+?)\*\*/g
                let lastIndex = 0, match, key = 0
                while ((match = boldRegex.exec(text)) !== null) {
                  if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index))
                  parts.push(<strong key={`bold-${key++}`} className="font-semibold text-gray-900 dark:text-white">{match[1]}</strong>)
                  lastIndex = match.index + match[0].length
                }
                if (lastIndex < text.length) parts.push(text.substring(lastIndex))
                return parts.length > 0 ? parts : text
              }
              return <p key={index} className="text-base leading-7">{parseBold(trimmedLine)}</p>
            })}
          </div>
        )}
      </div>

      {/* Methodology & Data Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Methodology &amp; Data Sources</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">How this calculator measures skimpflation and where the benchmark data comes from</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Primary Data Sources</h3>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: "FAO Food Price Index (FAOSTAT)",
                  body: "Official food CPI index values for the USA (BLS), UK (ONS), Eurozone (Eurostat), Canada (Statistics Canada), Australia (ABS), Switzerland (SFSO), and Japan (Statistics Bureau of Japan). Data covers 2000–2025 and is used to benchmark quality-adjusted inflation against each country's actual food price history.",
                },
                {
                  title: "Stats NZ (New Zealand)",
                  body: "Food CPI data for New Zealand (NZD) sourced from Statistics New Zealand, covering annual food price changes from 2000 to 2025.",
                },
                {
                  title: "User-entered quality data",
                  body: "The quality metrics and prices you enter are not stored or transmitted. All calculations run entirely in your browser.",
                },
              ].map((s) => (
                <div key={s.title} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">{s.title}</strong>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Calculation Methodology</h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Effective Skimpflation (cumulative):</strong>
                <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                  ((New Price ÷ New Quality) ÷ (Old Price ÷ Old Quality) − 1) × 100
                </div>
                <p className="mt-1.5 leading-relaxed">Captures the true cost-per-quality-unit change — combining both the price increase and the quality reduction into a single comparable figure.</p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Annualised Rate (CAGR):</strong>
                <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                  (New Price-per-quality ÷ Old Price-per-quality) ^ (1 ÷ Years) − 1
                </div>
                <p className="mt-1.5 leading-relaxed">Normalises the total skimpflation rate across the year span so results are directly comparable across different time periods.</p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Fair Price Comparison:</strong>
                <p className="mt-1 leading-relaxed">The &quot;fair price&quot; is what the current product would cost if its price-per-quality-unit had stayed the same as the original. The difference between the actual price and the fair price is your skimpflation overcharge per purchase.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Technical Notes</h3>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
            <li>Quality values must use the same unit for old and new — consistency between old and new is all that matters</li>
            <li>The year range affects the CAGR figure but not the cumulative total</li>
            <li>CPI benchmarks cover calendar years 2000–2025 only</li>
            <li>All 8 supported currencies use their respective national food CPI</li>
            <li>Annual extra cost is calculated as: (New Price − Fair Price) × Purchases per Year</li>
            <li>This calculator is for educational purposes and does not constitute financial or consumer advice</li>
          </ul>
        </div>
      </div>

      {/* Related: Shrinkflation callout */}
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-5 mb-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Also try: Shrinkflation Calculator
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Skimpflation cuts quality. Shrinkflation cuts quantity. Use our sister calculator to measure the hidden inflation from smaller package sizes.
          </p>
          <Link
            href="/shrinkflation-calculator"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Go to Shrinkflation Calculator &rarr;
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <FAQ category="skimpflation" />
      </div>

      {/* Internal links */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
          Related calculators
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/shrinkflation-calculator",    label: "Shrinkflation Calculator"       },
            { href: "/",                             label: "Global Inflation Calculator"    },
            { href: "/energy-inflation-calculator",  label: "Energy Inflation Calculator"    },
            { href: "/budget-calculator",            label: "50/30/20 Budget Calculator"    },
            { href: "/salary-calculator",            label: "Salary & Real Wages"           },
            { href: "/ppp-calculator",               label: "Purchasing Power Parity"       },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-amber-300 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Skimpflation Calculator</h3>
              <p className="text-gray-300 dark:text-gray-50 mb-6">
                Reveal the true inflation hidden in declining product and service quality. Compare price-per-quality-unit across any two years for 8 major currencies using official CPI benchmarks.
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Related Tools</h4>
                <ul className="text-gray-300 dark:text-gray-50 space-y-2 text-sm">
                  {[
                    { href: "/shrinkflation-calculator",     label: "Shrinkflation Calculator"    },
                    { href: "/energy-inflation-calculator",  label: "Energy Inflation Calculator"  },
                    { href: "/insurance-inflation-calculator",label: "Insurance Inflation Calculator"},
                    { href: "/",                             label: "Global Inflation Calculator"  },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-amber-400 transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
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
                  { href: "/mortgage-calculator",                              label: "Mortgage Calculator"            },
                  { href: "/home-affordability-calculator/inflation-adjusted", label: "Home Affordability Calculator"  },
                  { href: "/deflation-calculator",                             label: "Deflation Calculator"           },
                  { href: "/shrinkflation-calculator",                         label: "Shrinkflation Calculator"       },
                  { href: "/skimpflation-calculator",                          label: "Skimpflation Calculator"        },
                  { href: "/energy-inflation-calculator",                      label: "Energy Inflation Calculator"    },
                  { href: "/charts",                                           label: "Charts & Analytics"             },
                  { href: "/investment-race-calculator",                       label: "Investment Race Calculator"     },
                  { href: "/global-compound-interest",                         label: "Compound Interest Calculator"   },
                  { href: "/global-net-worth-calculator",                      label: "Global Net Worth Calculator"    },
                  { href: "/ppp-calculator",                                   label: "PPP Calculator"                 },
                  { href: "/auto-loan-calculator",                             label: "Auto Loan Calculator"           },
                  { href: "/salary-calculator",                                label: "Salary Calculator"              },
                  { href: "/retirement-calculator",                            label: "Retirement Calculator"          },
                  { href: "/student-loan-calculator",                         label: "Student Loan Calculator"        },
                  { href: "/budget-calculator",                                label: "Budget Calculator"              },
                  { href: "/emergency-fund-calculator",                        label: "Emergency Fund Calculator"      },
                  { href: "/roi-calculator",                                   label: "ROI Calculator"                 },
                  { href: "/insurance-inflation-calculator",                   label: "Insurance Inflation Calculator" },
                  { href: "/legacy-planner",                                   label: "Legacy Planner"                 },
                  { href: "/about",                                            label: "About Us"                       },
                  { href: "/privacy",                                          label: "Privacy Policy"                 },
                  { href: "/terms",                                            label: "Terms of Service"               },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-4">Last Updated: April 2026</p>
            </div>
          </div>
          <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
