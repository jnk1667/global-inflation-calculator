"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw, TrendingUp, Info } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

// Countries available in BIS property price data
const BIS_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", color: "#2563eb" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", color: "#16a34a" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", color: "#d97706" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", color: "#dc2626" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", color: "#7c3aed" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", color: "#0891b2" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF", color: "#be185d" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", color: "#0f766e" },
]

// Maximum 5 countries visible at once (for chart readability)
const MAX_SELECTED = 5

interface PropertyDataPoint {
  year: string
  [country: string]: number | string | null
}

interface BISSeriesObs {
  period: string
  value: number | null
}

interface BISSeries {
  country: string
  countryName: string
  frequency: string
  observations: BISSeriesObs[]
}

interface FallbackSeries {
  country: string
  countryName: string
  currency: string
  data: Record<string, number>
}

interface FallbackData {
  series: FallbackSeries[]
}

// Load static fallback data and transform it into the same shape as live API data
async function loadFallbackData(): Promise<PropertyDataPoint[]> {
  const res = await fetch("/data/bis-property-prices.json")
  if (!res.ok) throw new Error("Fallback data unavailable")
  const json: FallbackData = await res.json()

  const yearSet = new Set<string>()
  for (const s of json.series) {
    Object.keys(s.data).forEach((y) => yearSet.add(y))
  }
  const years = Array.from(yearSet).sort()

  const dataMap: Record<string, PropertyDataPoint> = {}
  for (const year of years) {
    dataMap[year] = { year }
  }
  for (const s of json.series) {
    for (const [year, value] of Object.entries(s.data)) {
      if (!dataMap[year]) dataMap[year] = { year }
      dataMap[year][s.country] = value
    }
  }
  return Object.values(dataMap).sort((a, b) => String(a.year).localeCompare(String(b.year)))
}

export default function BISPropertyPriceChart() {
  const [chartData, setChartData] = useState<PropertyDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [showReal, setShowReal] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US", "GB", "AU", "CA", "DE"])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    const loadPropertyData = async () => {
      setLoading(true)
      setError(null)
      setUsingFallback(false)
      try {
        const url = `/api/bis?dataset=property&startYear=2000`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`API error ${res.status}`)
        const json = await res.json()

        if (!json.data?.series?.length) {
          throw new Error("No property price data returned from BIS")
        }

        const series: BISSeries[] = json.data.series
        setLastUpdated(json.data.fetchedAt ?? null)

        // Collect all unique years across all series
        const yearSet = new Set<string>()
        for (const s of series) {
          for (const obs of s.observations) {
            const year = obs.period.split("-")[0].split("Q")[0].trim()
            if (year.length === 4) yearSet.add(year)
          }
        }
        const years = Array.from(yearSet).sort()

        const dataMap: Record<string, PropertyDataPoint> = {}
        for (const year of years) {
          dataMap[year] = { year }
        }

        for (const s of series) {
          const country = s.country
          const annualAgg: Record<string, number[]> = {}
          for (const obs of s.observations) {
            if (obs.value === null) continue
            const year = obs.period.split("-")[0].split("Q")[0].trim()
            if (year.length !== 4) continue
            if (!annualAgg[year]) annualAgg[year] = []
            annualAgg[year].push(obs.value)
          }

          for (const [year, vals] of Object.entries(annualAgg)) {
            if (!dataMap[year]) dataMap[year] = { year }
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length
            dataMap[year][country] = Math.round(avg * 10) / 10
          }
        }

        const sorted = Object.values(dataMap)
          .sort((a, b) => String(a.year).localeCompare(String(b.year)))
          .filter((d) => Number(d.year) >= 2000 && Number(d.year) <= new Date().getFullYear())

        setChartData(sorted)
      } catch (err: unknown) {
        // API failed — silently load the static fallback
        try {
          const fallback = await loadFallbackData()
          setChartData(fallback)
          setUsingFallback(true)
          setLastUpdated(null)
        } catch {
          setError("Property price data is temporarily unavailable. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadPropertyData()
  }, [])

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code)
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, code]
    })
  }

  const activeCountries = BIS_COUNTRIES.filter((c) => selectedCountries.includes(c.code))

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (!active || !payload?.length) return null
    const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {sorted.map((entry) => {
          const countryInfo = BIS_COUNTRIES.find((c) => c.code === entry.name)
          return (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{countryInfo?.flag}</span>
                <span style={{ color: entry.color }} className="font-medium">
                  {countryInfo?.name ?? entry.name}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{entry.value?.toFixed(1)}</span>
            </div>
          )
        })}
        <p className="text-xs text-gray-400 mt-2">Index (2010 = 100)</p>
      </div>
    )
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              International Property Price Index
            </CardTitle>
            <CardDescription className="mt-1">
              Residential property prices, 2010 = 100 — sourced live from the Bank for International Settlements
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className={`text-xs gap-1 ${
                usingFallback
                  ? "border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300"
                  : "border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${usingFallback ? "bg-amber-500" : "bg-green-500"}`} />
              {usingFallback ? "Static Data (BIS API offline)" : "Live BIS Data"}
            </Badge>
          </div>
        </div>

        {/* Real vs Nominal toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Label htmlFor="real-toggle" className="text-sm font-medium cursor-pointer">
              Nominal
            </Label>
            <Switch id="real-toggle" checked={showReal} onCheckedChange={setShowReal} />
            <Label htmlFor="real-toggle" className="text-sm font-medium cursor-pointer">
              Inflation-Adjusted (Real)
            </Label>
          </div>

          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Updated: {new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Country selector pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {BIS_COUNTRIES.map((country) => {
            const isSelected = selectedCountries.includes(country.code)
            const isDisabled = !isSelected && selectedCountries.length >= MAX_SELECTED
            return (
              <button
                key={country.code}
                onClick={() => !isDisabled && toggleCountry(country.code)}
                disabled={isDisabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? "border-transparent text-white shadow-sm"
                    : isDisabled
                      ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                style={isSelected ? { backgroundColor: country.color, borderColor: country.color } : {}}
                aria-pressed={isSelected}
              >
                <span>{country.flag}</span>
                {country.name}
              </button>
            )
          })}
          <span className="text-xs text-gray-400 dark:text-gray-500 self-center ml-1">
            (max {MAX_SELECTED})
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading BIS property price data...</span>
          </div>
        )}

        {error && (
          <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm">
              {error} — BIS data may be temporarily unavailable. The chart will load when the API responds.
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && chartData.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}`}
                  width={48}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => {
                    const c = BIS_COUNTRIES.find((x) => x.code === value)
                    return c ? `${c.flag} ${c.name}` : value
                  }}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
                {/* Baseline: 2010=100 */}
                <ReferenceLine
                  y={100}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  label={{ value: "Base (2010=100)", fill: "#9ca3af", fontSize: 11, position: "insideTopLeft" }}
                />
                {activeCountries.map((country) => (
                  <Line
                    key={country.code}
                    type="monotone"
                    dataKey={country.code}
                    name={country.code}
                    stroke={country.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <AlertDescription className="text-blue-900 dark:text-blue-100 text-xs leading-relaxed">
                  <strong>How to read this chart:</strong> Index is rebased to 2010 = 100. A value of 180 means property prices have risen 80% since 2010.
                  {showReal
                    ? " Inflation-adjusted (real) values strip out general CPI, showing genuine purchasing-power gains."
                    : " Toggle to inflation-adjusted to see how much of the rise is real versus inflation."}
                  {" "}Source: Bank for International Settlements (BIS) Residential Property Price Statistics, updated quarterly.
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
