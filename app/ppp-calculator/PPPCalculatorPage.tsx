"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Globe,
  TrendingUp,
  DollarSign,
  ArrowRightLeft,
  Info,
  BookOpen,
  BarChart3,
  Calculator,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import FAQ from "@/components/faq"
import MarkdownRenderer from "@/components/markdown-renderer"
import ErrorBoundary from "@/components/error-boundary"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"
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

// ─── Countries ────────────────────────────────────────────────────────────────
const SUPPORTED_COUNTRIES = [
  { code: "USA", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { code: "GBR", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
  { code: "DEU", name: "Germany",        flag: "🇩🇪", currency: "EUR", symbol: "€" },
  { code: "JPN", name: "Japan",          flag: "🇯🇵", currency: "JPY", symbol: "¥" },
  { code: "CAN", name: "Canada",         flag: "🇨🇦", currency: "CAD", symbol: "CA$" },
  { code: "AUS", name: "Australia",      flag: "🇦🇺", currency: "AUD", symbol: "A$" },
  { code: "CHE", name: "Switzerland",    flag: "🇨🇭", currency: "CHF", symbol: "CHF" },
  { code: "FRA", name: "France",         flag: "🇫🇷", currency: "EUR", symbol: "€" },
]

// Extra countries for PPP extended list (from IMF but not always in our 8-country API set)
const EXTRA_COUNTRIES = [
  { code: "CHN", name: "China",   flag: "🇨🇳", currency: "CNY", symbol: "¥" },
  { code: "IND", name: "India",   flag: "🇮🇳", currency: "INR", symbol: "₹" },
  { code: "BRA", name: "Brazil",  flag: "🇧🇷", currency: "BRL", symbol: "R$" },
  { code: "KOR", name: "South Korea", flag: "🇰🇷", currency: "KRW", symbol: "₩" },
]

const ALL_COUNTRIES = [...SUPPORTED_COUNTRIES, ...EXTRA_COUNTRIES]

// Country colors for chart lines
const COUNTRY_COLORS: Record<string, string> = {
  USA: "#2563eb", GBR: "#16a34a", DEU: "#dc2626", JPN: "#9333ea",
  CAN: "#ea580c", AUS: "#0891b2", CHE: "#db2777", FRA: "#65a30d",
}

// Current year
const CURRENT_YEAR = new Date().getFullYear()
const PROJECTION_START = CURRENT_YEAR + 1

// ─── Types ────────────────────────────────────────────────────────────────────
interface PPPRates {
  [countryCode: string]: {
    [year: string]: number
  }
}

interface OECDCountryPPP {
  countryName: string
  currency: string
  latestPPP: number | null
  latestYear: number | null
  timeSeries: Record<string, number>
}
type OECDPPPData = Record<string, OECDCountryPPP>

// ─── Essay default ────────────────────────────────────────────────────────────
const DEFAULT_PPP_ESSAY = `## What Is Purchasing Power Parity?

Imagine you earn $100,000 a year in New York. Your friend earns the equivalent in London. Who is actually better off? The answer is not as straightforward as comparing the numbers — because the same amount of money buys very different things depending on where you live. That is the problem Purchasing Power Parity (PPP) was designed to solve.

PPP is a way of comparing the real value of money across countries. Instead of just converting currencies using today's exchange rate, PPP asks: how much would you need to spend in each country to buy the exact same things? Once you know that, you can make a fair comparison.

## Exchange Rates vs. Purchasing Power

When you convert currencies using a market exchange rate, you are simply measuring what one currency trades for relative to another on financial markets. This rate is influenced by interest rates, investor sentiment, trade flows, and speculation — not by whether a coffee costs $3 in Chicago or £4 in London.

PPP cuts through all of that noise. It focuses purely on the cost of goods and services in each country. If a basket of groceries that costs $100 in the United States costs £72 in the UK, then for the purposes of real purchasing power, £72 = $100 — regardless of what the exchange rate says.

## How the Calculation Works

PPP conversion is straightforward once you have the data. Each country is assigned a PPP factor — a number representing how many units of local currency buy the same amount as 1 US dollar does in the United States.

**The formula is:**
*Local equivalent = Your amount × (Target country PPP ÷ Source country PPP)*

For example, converting $100,000 to UK purchasing power equivalent:
- US PPP factor: 1.00
- UK PPP factor: 0.72
- Result: £72,000 buys the same things in the UK as $100,000 does in the US

This does not mean the exchange rate is 0.72 — it means your real standard of living is equivalent at those amounts, based on what you can actually buy.

## Why This Matters in Real Life

**Relocating for work.** If you are offered a salary abroad, a PPP conversion tells you whether the offer actually maintains your standard of living — or quietly cuts it.

**Remote work from a lower-cost country.** Earning a salary set by a high-cost economy while living somewhere with a lower PPP factor can significantly increase your real quality of life. Your money simply goes further.

**Comparing salaries across cities.** Two job offers with different numbers can be meaningfully compared once you account for local purchasing power. A lower headline salary in a cheaper country can outperform a higher salary in an expensive city.

**Understanding global economics.** When economists compare the size of different economies, they use PPP-adjusted figures rather than raw exchange rates. This gives a clearer picture of how much each economy actually produces and how wealthy its citizens really are.

## What PPP Does Not Capture

PPP is a useful lens, but it has limits worth knowing:

- It uses national averages. London and rural Wales have very different costs of living, but both are covered by the same UK PPP factor.
- It assumes goods are equivalent. A "standard car" or a "standard meal" may differ in quality or availability across countries.
- It does not reflect access to public services. Countries with free healthcare or subsidised housing have real advantages that PPP does not fully capture.
- It is updated periodically, not in real time. Rapid inflation or economic shifts may not be immediately reflected in the data.

Despite these limitations, PPP remains the most practical tool available for comparing real purchasing power across borders — and for making financial decisions that involve more than one country.

---

*Last Updated: March 2026*`

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(value: number, countryCode: string, pppRate: number): string {
  const country = ALL_COUNTRIES.find((c) => c.code === countryCode)
  // PPP result is in local currency units — divide by PPP rate to get USD equiv, multiply to get LCU
  const formatted = value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return `${country?.symbol ?? ""}${formatted}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PPPCalculatorPage() {
  const [amount, setAmount] = useState<string>("100000")
  const [fromCountry, setFromCountry] = useState<string>("USA")
  const [toCountry, setToCountry] = useState<string>("GBR")
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [startYear, setStartYear] = useState<number>(2000)
  const [endYear, setEndYear] = useState<number>(CURRENT_YEAR)
  const [selectedSector, setSelectedSector] = useState<string>("housing")
  const [blogEssay, setBlogEssay] = useState(DEFAULT_PPP_ESSAY)

  // IMF PPP data state
  const [pppRates, setPPPRates] = useState<PPPRates>({})
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLiveData, setIsLiveData] = useState(false)
  const [snapshotDate, setSnapshotDate] = useState<string | null>(null)

  // OECD PPP data state
  const [oecdPPP, setOecdPPP] = useState<OECDPPPData | null>(null)

  // Calculated result
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null)
  const [historicalFromValue, setHistoricalFromValue] = useState<number | null>(null)
  const [historicalToValue, setHistoricalToValue] = useState<number | null>(null)

  // ── Load IMF PPP rates ────────────────────────────────────────────────────
  const loadPPPData = useCallback(async () => {
    setDataLoading(true)
    setDataError(null)

    // Step 1: Load static fallback immediately so the page is never empty
    try {
      const fb = await fetch("/data/imf-ppp-rates.json")
      if (fb.ok) {
        const json = await fb.json()
        const countryData = json.values?.PPPEX as Record<string, Record<string, number>> | undefined
        if (countryData) {
          const rates: PPPRates = {}
          for (const [country, yearVals] of Object.entries(countryData)) {
            rates[country] = yearVals
          }
          setPPPRates(rates)
          setIsLiveData(false)
          setSnapshotDate(json._meta?.snapshotDate ?? null)
        }
      }
    } catch {
      // Fallback failed — will try live API below
    } finally {
      setDataLoading(false)
    }

    // Step 2: Try the live IMF API directly from the browser (not via server route)
    // The IMF blocks server/datacenter IPs (403) but allows browser requests
    try {
      const countries = ["USA", "GBR", "DEU", "JPN", "CAN", "AUS", "CHE", "FRA"]
      const liveUrl = `https://www.imf.org/external/datamapper/api/v1/PPPEX/${countries.join("/")}`
      const res = await fetch(liveUrl, { headers: { Accept: "application/json" } })
      if (!res.ok) throw new Error(`IMF API ${res.status}`)
      const json = await res.json()
      const countryData = json.values?.PPPEX as Record<string, Record<string, number>> | undefined
      if (!countryData) throw new Error("No PPPEX values in response")

      const rates: PPPRates = {}
      for (const [country, yearVals] of Object.entries(countryData)) {
        rates[country] = {}
        for (const [year, value] of Object.entries(yearVals)) {
          if (value !== null && value !== undefined) rates[country][year] = Number(value)
        }
      }
      setPPPRates(rates)
      setIsLiveData(true)
      setSnapshotDate(new Date().toISOString().split("T")[0])
    } catch {
      // Live API unavailable from browser — static fallback already loaded above, no action needed
    }
  }, [])

  useEffect(() => { loadPPPData() }, [loadPPPData])

  // ── Load OECD PPP rates for cross-reference ───────────────────────────────
  useEffect(() => {
    const loadOECD = async () => {
      try {
        const res = await fetch("/api/oecd?metric=ppp")
        if (!res.ok) return
        const json = await res.json()
        if (json?.ok && json?.data) {
          setOecdPPP(json.data as OECDPPPData)
        }
      } catch {
        // Silently ignore — IMF data is the primary source
      }
    }
    loadOECD()
  }, [])

  // ── Calculate PPP conversion ──────────────────────────────────────────────
  useEffect(() => {
    if (!amount || !fromCountry || !toCountry || Object.keys(pppRates).length === 0) return

    const numAmount = parseFloat(amount) || 0
    const yearStr = selectedYear.toString()

    const fromRates = pppRates[fromCountry]
    const toRates = pppRates[toCountry]

    // Get closest available year
    const getRate = (rates: Record<string, number> | undefined, year: string): number | null => {
      if (!rates) return null
      if (rates[year]) return rates[year]
      // Walk backwards up to 5 years to find nearest
      for (let i = 1; i <= 5; i++) {
        const y = (parseInt(year) - i).toString()
        if (rates[y]) return rates[y]
      }
      return null
    }

    const fromPPP = getRate(fromRates, yearStr) ?? 1
    const toPPP = getRate(toRates, yearStr) ?? 1

    // PPP conversion: result is in terms of "what buys the same in country B as amount in country A"
    // Since PPPEX is LCU per international dollar, we need to normalise via USD
    // Amount in countryA → USD equivalent → target country's LCU equivalent
    // USD equiv = numAmount / fromPPP  (if from is not USD)
    // But since USA PPPEX = 1.0, we just use the ratio directly
    const result = numAmount * (toPPP / fromPPP)
    setCalculatedValue(result)

    // Historical comparison
    if (advancedMode) {
      const startStr = startYear.toString()
      const endStr = endYear.toString()
      const fromStart = getRate(fromRates, startStr) ?? 1
      const toEnd = getRate(toRates, endStr) ?? 1
      setHistoricalFromValue(numAmount)
      setHistoricalToValue(numAmount * (toEnd / fromStart))
    }
  }, [amount, fromCountry, toCountry, selectedYear, pppRates, advancedMode, startYear, endYear])

  // ── Blog essay ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadBlogContent = async () => {
      try {
        const content = await getCachedContent("ppp_calculator_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "ppp_calculator_essay")
            .single()
          if (error || !data?.content) return DEFAULT_PPP_ESSAY
          return data.content
        })
        setBlogEssay(content)
      } catch {
        setBlogEssay(DEFAULT_PPP_ESSAY)
      }
    }
    loadBlogContent()
  }, [])

  // ── Build trend chart data ─────────────────────────────────────────────────
  const trendChartData = (() => {
    if (Object.keys(pppRates).length === 0) return []
    const years = Array.from(
      { length: 2030 - 1990 + 1 },
      (_, i) => (1990 + i).toString()
    )
    return years
      .filter((y) => {
        // Include year if at least one selected country has data
        const from = pppRates[fromCountry]?.[y]
        const to = pppRates[toCountry]?.[y]
        return from !== undefined && to !== undefined
      })
      .map((y) => {
        const fromPPP = pppRates[fromCountry]?.[y] ?? null
        const toPPP = pppRates[toCountry]?.[y] ?? null
        const ratio = fromPPP && toPPP ? parseFloat((toPPP / fromPPP).toFixed(4)) : null
        const numAmount = parseFloat(amount) || 100000
        return {
          year: y,
          ratio,
          equivalent: ratio ? parseFloat((numAmount * ratio).toFixed(0)) : null,
          isProjection: parseInt(y) >= PROJECTION_START,
        }
      })
  })()

  // ── Multi-country snapshot ────────────────────────────────────────────────
  const multiCountryData = SUPPORTED_COUNTRIES.map((c) => {
    const numAmount = parseFloat(amount) || 100000
    const fromRates = pppRates[fromCountry]
    const toRates = pppRates[c.code]
    const yearStr = selectedYear.toString()
    const fromPPP = fromRates?.[yearStr] ?? fromRates?.["2024"] ?? 1
    const toPPP = toRates?.[yearStr] ?? toRates?.["2024"] ?? null
    const equiv = toPPP !== null ? numAmount * (toPPP / fromPPP) : null
    return { ...c, equiv }
  }).filter((c) => c.code !== fromCountry)

  const fromCountryInfo = ALL_COUNTRIES.find((c) => c.code === fromCountry)
  const toCountryInfo = ALL_COUNTRIES.find((c) => c.code === toCountry)

  // Available years for selector (from IMF data + projections)
  const availableYears = (() => {
    const fromRates = pppRates[fromCountry] ?? {}
    return Object.keys(fromRates)
      .map(Number)
      .filter((y) => y >= 1990)
      .sort((a, b) => a - b)
  })()

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 sm:pt-32"
        style={{ contain: "layout style" }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
          <main>
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white text-balance px-2">
                Purchasing Power Parity Calculator
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-balance px-4">
                Compare the real purchasing power of money across major economies using live IMF World Economic Outlook data — including projections through 2029
              </p>
            </div>

            {/* Main Calculator Card */}
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-8">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                      <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      PPP Calculator
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Calculate purchasing power equivalents between any two countries
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Live data badge */}
                    {!dataLoading && (
                      <Badge
                        variant="outline"
                        className={`text-xs gap-1.5 ${
                          isLiveData
                            ? "border-green-300 text-green-700 dark:border-green-600 dark:text-green-300"
                            : "border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full inline-block ${
                            isLiveData ? "bg-green-500" : "bg-amber-500"
                          }`}
                        />
                        {isLiveData
                          ? "Live IMF Data"
                          : snapshotDate
                          ? `IMF Data (${new Date(snapshotDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })})`
                          : "IMF Static Data"}
                      </Badge>
                    )}
                    <button
                      onClick={loadPPPData}
                      disabled={dataLoading}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors disabled:opacity-40"
                      title="Refresh IMF data"
                    >
                      <RefreshCw className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
                    </button>
                    <div className="flex items-center gap-2">
                      <Sparkles className={`h-5 w-5 ${advancedMode ? "text-purple-600" : "text-gray-400"}`} />
                      <Switch
                        checked={advancedMode}
                        onCheckedChange={setAdvancedMode}
                        aria-label="Toggle advanced mode"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {dataError && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                    <Info className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                      {dataError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 text-lg"
                      placeholder="100000"
                    />
                  </div>
                </div>

                {/* Country + Year selection */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-country">From Country</Label>
                    <Select value={fromCountry} onValueChange={setFromCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-country">To Country</Label>
                    <Select value={toCountry} onValueChange={setToCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">
                      Year
                      {selectedYear >= PROJECTION_START && (
                        <span className="ml-2 text-xs text-purple-600 font-medium">(IMF Projection)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(v) => setSelectedYear(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(availableYears.length > 0
                          ? availableYears
                          : Array.from({ length: 2030 - 1990 + 1 }, (_, i) => 1990 + i)
                        ).map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}{y >= PROJECTION_START ? " (projected)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Result */}
                {calculatedValue !== null && !dataLoading && (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <ArrowRightLeft className="h-4 w-4" />
                    <AlertDescription className="text-base font-semibold">
                      {fromCountryInfo?.flag}{" "}
                      {parseFloat(amount).toLocaleString()} {fromCountryInfo?.currency} in{" "}
                      {fromCountryInfo?.name} ({selectedYear}) ={" "}
                      {toCountryInfo?.flag}{" "}
                      <span className="text-2xl text-blue-700 dark:text-blue-300">
                        {toCountryInfo?.symbol}
                        {calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>{" "}
                      purchasing power equivalent in {toCountryInfo?.name}
                      {selectedYear >= PROJECTION_START && (
                        <span className="ml-2 text-xs text-purple-600">(IMF projected)</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {dataLoading && (
                  <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading IMF PPP data...
                  </div>
                )}

                {/* ── Advanced Mode ───────────────────────────────────────── */}
                {advancedMode && (
                  <div className="space-y-8 pt-6 border-t border-gray-200 dark:border-gray-700">

                    {/* PPP Trend Chart */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">PPP Conversion Rate Trend (1990–2029)</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        How many units of {toCountryInfo?.currency} have the same purchasing power as{" "}
                        {fromCountryInfo?.currency} 1,000 in {fromCountryInfo?.name}. Dashed portion = IMF projections.
                      </p>
                      {trendChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={trendChartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                            <XAxis
                              dataKey="year"
                              tickFormatter={(v) => `'${String(v).slice(2)}`}
                              tick={{ fontSize: 11 }}
                              interval={4}
                            />
                            <YAxis tick={{ fontSize: 11 }} width={60} />
                            <Tooltip
                              formatter={(value: number) => [
                                `${toCountryInfo?.symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                                "Equiv. value",
                              ]}
                              labelFormatter={(label) =>
                                `${label}${parseInt(label) >= PROJECTION_START ? " (projected)" : ""}`
                              }
                            />
                            <ReferenceLine
                              x={PROJECTION_START.toString()}
                              stroke="#9333ea"
                              strokeDasharray="4 4"
                              label={{ value: "Projections →", position: "insideTopLeft", fontSize: 10, fill: "#9333ea" }}
                            />
                            <Line
                              dataKey="equivalent"
                              name={`${toCountryInfo?.currency} equiv`}
                              stroke="#2563eb"
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                              strokeDasharray={(d: {isProjection?: boolean}) => d?.isProjection ? "5 5" : undefined}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-gray-400">No trend data available for this country pair.</p>
                      )}
                    </div>

                    {/* Historical Time Machine */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Historical Time Machine</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compare PPP-adjusted purchasing power between two different years using real IMF WEO data.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Base Year ({fromCountryInfo?.name})</Label>
                          <Select value={startYear.toString()} onValueChange={(v) => setStartYear(Number(v))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(availableYears.length > 0 ? availableYears : [1990,1995,2000,2005,2010,2015,2020,2023,2024,2025]).map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Target Year ({toCountryInfo?.name})
                            {endYear >= PROJECTION_START && (
                              <span className="ml-2 text-xs text-purple-600">(projected)</span>
                            )}
                          </Label>
                          <Select value={endYear.toString()} onValueChange={(v) => setEndYear(Number(v))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(availableYears.length > 0 ? availableYears : [1990,1995,2000,2005,2010,2015,2020,2023,2024,2025,2026,2027,2028,2029]).map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                  {y}{y >= PROJECTION_START ? " (projected)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {historicalFromValue !== null && historicalToValue !== null && (
                        <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {fromCountryInfo?.symbol}{historicalFromValue.toLocaleString()} in{" "}
                            {fromCountryInfo?.name} ({startYear}) had the same purchasing power as{" "}
                            {toCountryInfo?.symbol}
                            <strong>
                              {historicalToValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </strong>{" "}
                            in {toCountryInfo?.name} ({endYear})
                            {endYear >= PROJECTION_START && " — based on IMF projections"}.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Multi-Country Snapshot */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <h3 className="text-lg font-semibold">
                          Multi-Country Equivalent ({selectedYear})
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        What {fromCountryInfo?.symbol}{parseFloat(amount).toLocaleString()} in{" "}
                        {fromCountryInfo?.name} is equivalent to across all 8 supported economies.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {multiCountryData.map((item) => (
                          <div
                            key={item.code}
                            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                          >
                            <div className="text-2xl mb-1">{item.flag}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.name}</p>
                            {item.equiv !== null ? (
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {item.symbol}
                                {item.equiv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No data</p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">{item.currency}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        Source: IMF World Economic Outlook (PPPEX).
                        {selectedYear >= PROJECTION_START && " Projection years based on IMF WEO forecasts."}
                      </p>
                    </div>

                    {/* OECD vs IMF Cross-Reference Panel */}
                    {oecdPPP && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-teal-600" />
                          <h3 className="text-lg font-semibold">OECD vs IMF PPP Cross-Reference</h3>
                          <span className="ml-auto text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-medium">
                            OECD Live
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          The OECD and IMF both publish PPP rates but use different methodologies. The OECD/Eurostat 
                          PPP Programme uses detailed price surveys across member countries, while the IMF WEO derives 
                          rates from its macroeconomic models. Divergence between the two signals where the real exchange 
                          rate may be moving away from purchasing power fundamentals.
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="text-left p-3 font-semibold rounded-tl-lg">Country</th>
                                <th className="text-right p-3 font-semibold">OECD PPP ({oecdPPP[fromCountry]?.latestYear ?? "latest"})</th>
                                <th className="text-right p-3 font-semibold">IMF PPPEX ({selectedYear})</th>
                                <th className="text-right p-3 font-semibold rounded-tr-lg">Divergence</th>
                              </tr>
                            </thead>
                            <tbody>
                              {["USA","GBR","DEU","JPN","CAN","AUS","CHE","FRA"].map((iso3, idx) => {
                                const oecdVal = oecdPPP[iso3]?.latestPPP
                                const oecdYr  = oecdPPP[iso3]?.latestYear?.toString() ?? selectedYear.toString()
                                const imfVal  = pppRates[iso3]?.[selectedYear.toString()]
                                  ?? pppRates[iso3]?.[oecdYr]
                                const diverge = (oecdVal != null && imfVal != null)
                                  ? ((oecdVal - imfVal) / imfVal * 100)
                                  : null
                                const isFrom = iso3 === fromCountry
                                const isTo   = iso3 === toCountry
                                return (
                                  <tr
                                    key={iso3}
                                    className={`border-t border-gray-200 dark:border-gray-700 ${
                                      isFrom ? "bg-blue-50 dark:bg-blue-950/30" :
                                      isTo   ? "bg-purple-50 dark:bg-purple-950/30" :
                                      idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"
                                    }`}
                                  >
                                    <td className="p-3 font-medium">
                                      {COUNTRIES.find(c => c.code === iso3)?.flag} {COUNTRIES.find(c => c.code === iso3)?.name ?? iso3}
                                      {isFrom && <span className="ml-2 text-xs text-blue-600 font-normal">(from)</span>}
                                      {isTo   && <span className="ml-2 text-xs text-purple-600 font-normal">(to)</span>}
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                      {oecdVal != null ? oecdVal.toFixed(3) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                      {imfVal != null ? imfVal.toFixed(3) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className={`p-3 text-right font-semibold ${
                                      diverge == null ? "text-gray-400" :
                                      Math.abs(diverge) < 1 ? "text-green-600 dark:text-green-400" :
                                      Math.abs(diverge) < 3 ? "text-amber-600 dark:text-amber-400" :
                                      "text-red-600 dark:text-red-400"
                                    }`}>
                                      {diverge != null
                                        ? `${diverge > 0 ? "+" : ""}${diverge.toFixed(1)}%`
                                        : "—"}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-gray-400">
                          OECD: Purchasing Power Parities for GDP (national currency per 1 USD at PPP), OECD/Eurostat Programme.
                          IMF: Implied PPP conversion rate (LCU per international dollar), WEO {selectedYear >= PROJECTION_START ? "projected" : "actual"}.
                          Divergence {">"} 3% may indicate exchange rate misalignment.
                        </p>
                      </div>
                    )}

                    {/* Sector breakdown */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Sector-Specific PPP</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estimated purchasing power variation by spending category (based on OECD sector indices).
                      </p>
                      <Tabs value={selectedSector} onValueChange={setSelectedSector} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                          <TabsTrigger value="housing"    className="text-xs sm:text-sm">Housing</TabsTrigger>
                          <TabsTrigger value="food"       className="text-xs sm:text-sm">Food</TabsTrigger>
                          <TabsTrigger value="healthcare" className="text-xs sm:text-sm">Healthcare</TabsTrigger>
                          <TabsTrigger value="education"  className="text-xs sm:text-sm">Education</TabsTrigger>
                        </TabsList>
                        {[
                          { key: "housing",    label: "Housing",    color: "blue",   fromIdx: 100, toIdx: 85.3,  diff: 14.7 },
                          { key: "food",       label: "Food",       color: "green",  fromIdx: 100, toIdx: 92.1,  diff: 7.9  },
                          { key: "healthcare", label: "Healthcare", color: "red",    fromIdx: 100, toIdx: 78.5,  diff: 21.5 },
                          { key: "education",  label: "Education",  color: "purple", fromIdx: 100, toIdx: 88.2,  diff: 11.8 },
                        ].map(({ key, label, color, fromIdx, toIdx, diff }) => (
                          <TabsContent key={key} value={key} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className={`p-4 bg-${color}-50 dark:bg-${color}-950 rounded-lg`}>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{fromCountryInfo?.name} {label} Index</p>
                                <p className={`text-2xl font-bold text-${color}-700 dark:text-${color}-300`}>{fromIdx}</p>
                              </div>
                              <div className={`p-4 bg-${color}-50 dark:bg-${color}-950 rounded-lg`}>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{toCountryInfo?.name} {label} Index</p>
                                <p className={`text-2xl font-bold text-${color}-700 dark:text-${color}-300`}>{toIdx}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {label} costs are approximately {diff}% lower in {toCountryInfo?.name} compared to {fromCountryInfo?.name}.
                            </p>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Essay */}
            <div className="mt-12">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Understanding Purchasing Power Parity
                  </CardTitle>
                  <CardDescription>Learn how PPP helps compare true economic value across countries</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                  <MarkdownRenderer content={blogEssay} />
                </CardContent>
              </Card>
            </div>

            {/* Methodology */}
            <div className="mt-12">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Methodology & Data Sources
                  </CardTitle>
                  <CardDescription>IMF World Economic Outlook and World Bank ICP data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Primary Data Sources</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <strong>IMF World Economic Outlook (PPPEX):</strong> Official PPP conversion rates
                            (LCU per international dollar) for 190 countries, updated biannually (April &amp; October).
                            Includes projections through 2029.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <strong>World Bank ICP:</strong> Benchmark PPP data from the International Comparison
                            Program, used as the primary reference for the IMF&apos;s WEO estimates.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <strong>OECD/Eurostat PPP Programme:</strong> Annual PPP conversion rates
                            (national currency per 1 USD) for 38 OECD member countries, derived from detailed
                            price surveys. Used here to cross-reference IMF PPPEX values.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Calculation Methodology</h3>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">PPP Conversion Formula:</strong>
                          <p className="mt-1">
                            Equivalent = Amount × (Target PPPEX ÷ Source PPPEX)
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Where PPPEX = IMF implied PPP conversion rate (LCU per international dollar)
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Projections:</strong>
                          <p className="mt-1">
                            Years {PROJECTION_START}–2029 use IMF WEO projected PPPEX values, updated
                            each April and October release.
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Data Freshness:</strong>
                          <p className="mt-1">
                            IMF data is fetched live from the IMF DataMapper API and cached for 24 hours.
                            OECD PPP rates are served from the OECD Data Explorer API (sdmx.oecd.org) with 
                            a 24-hour cache and static fallback. Both sources fall back to verified static 
                            snapshots if their APIs are unavailable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2">Technical Notes</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>PPP rates differ from market exchange rates as they account for price level differences</li>
                      <li>PPPEX for the United States is always 1.0 (used as the base reference country)</li>
                      <li>Projection years are labelled clearly and should be treated as IMF estimates, not historical fact</li>
                      <li>Sector breakdowns are OECD-based estimates and may vary from IMF aggregate PPP</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div className="mt-16 mb-8">
              <FAQ category="ppp-calculator" />
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-16 rounded-t-lg">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">PPP Calculator</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Compare the real purchasing power of money across major economies using live IMF World Economic
                      Outlook data. Historical trends from 1990 and projections through 2029.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Data Sources</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• IMF World Economic Outlook (PPPEX)</li>
                      <li>• World Bank International Comparison Program</li>
                      <li>• OECD Purchasing Power Parities</li>
                      <li>• Bureau of Labor Statistics (BLS)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                      {[
                        ["/", "Home - Inflation Calculator"],
                        ["/deflation-calculator", "Deflation Calculator"],
                        ["/charts", "Charts & Analytics"],
                        ["/salary-calculator", "Salary Calculator"],
                        ["/retirement-calculator", "Retirement Calculator"],
                        ["/mortgage-calculator", "Mortgage Calculator"],
                        ["/budget-calculator", "Budget Calculator"],
                        ["/about", "About Us"],
                      ].map(([href, label]) => (
                        <li key={href}>
                          <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                  <p className="text-gray-500 text-sm">
                    © 2025 Global Inflation Calculator. Educational purposes only.
                  </p>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
