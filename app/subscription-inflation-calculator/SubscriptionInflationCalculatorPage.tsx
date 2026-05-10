"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import Link from "next/link"
import {
  TrendingUp,
  Plus,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Layers,
} from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricePoint {
  year: number
  month: number
  price: number
  note: string
}

interface Tier {
  tierId: string
  tierName: string
  description: string
  priceHistory: PricePoint[]
}

interface Service {
  id: string
  name: string
  category: string
  country: string
  launchYear: number
  url: string
  description: string
  tiers: Tier[]
}

interface SummaryStats {
  id: string
  name: string
  defaultTierId: string
  launchYear: number
  launchPrice: number
  currentPrice: number
  totalIncreasePct: number
  cpiIncreasePct: number
  vsInflationMultiple: number
  currentTierName: string
}

interface SubscriptionData {
  metadata: { lastUpdated: string; currency: string; sources: string[]; notes: string }
  cpiBaseline: {
    description: string
    index_base_year: number
    data: { year: number; cpi: number }[]
  }
  services: Service[]
  summaryStats: SummaryStats[]
}

interface SelectedSubscription {
  uid: string
  serviceId: string
  tierId: string
  startYear: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  streaming_video: "Streaming Video",
  music_audio: "Music & Audio",
  retail_streaming: "Retail & Streaming",
  productivity: "Productivity & Software",
  fitness: "Fitness",
  cloud_storage: "Cloud Storage",
  professional: "Professional",
  education: "Education & News",
}

const CATEGORY_COLORS: Record<string, string> = {
  streaming_video: "#3b82f6",
  music_audio: "#22c55e",
  retail_streaming: "#f97316",
  productivity: "#8b5cf6",
  fitness: "#ef4444",
  cloud_storage: "#06b6d4",
  professional: "#f59e0b",
  education: "#ec4899",
}

const LINE_COLORS = [
  "#3b82f6", "#22c55e", "#f97316", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f59e0b", "#ec4899",
  "#10b981", "#6366f1",
]

function getPriceForYear(tier: Tier, year: number): number | null {
  const sorted = [...tier.priceHistory].sort((a, b) => a.year - b.year || a.month - b.month)
  if (year < sorted[0].year) return null
  let last = sorted[0].price
  for (const p of sorted) {
    if (p.year <= year) last = p.price
    else break
  }
  return last
}

function getCpiForYear(cpiData: { year: number; cpi: number }[], year: number): number {
  const entry = cpiData.find((d) => d.year === year)
  if (entry) return entry.cpi
  const sorted = [...cpiData].sort((a, b) => a.year - b.year)
  return sorted[sorted.length - 1].cpi
}

function formatCurrency(val: number): string {
  return `$${val.toFixed(2)}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubscriptionInflationCalculatorPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSubs, setSelectedSubs] = useState<SelectedSubscription[]>([
    { uid: "init-1", serviceId: "netflix", tierId: "standard", startYear: 2015 },
    { uid: "init-2", serviceId: "spotify", tierId: "individual", startYear: 2015 },
  ])
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addServiceId, setAddServiceId] = useState("")
  const [addTierId, setAddTierId] = useState("")
  const [addStartYear, setAddStartYear] = useState(2015)
  const [showInflationLine, setShowInflationLine] = useState(true)
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)
  const [expandedService, setExpandedService] = useState<string | null>(null)

  // Load JSON data
  useEffect(() => {
    fetch("/data/subscription-inflation.json")
      .then((r) => r.json())
      .then((d: SubscriptionData) => {
        setData(d)
        setLoadingData(false)
      })
      .catch(() => setLoadingData(false))
  }, [])

  // Load blog essay from Supabase
  useEffect(() => {
    const loadBlog = async () => {
      const defaultContent = `## The Subscription Inflation Nobody Talks About\n\nSubscription prices have risen far faster than official inflation — this calculator shows exactly how much.`
      try {
        const content = await getCachedContent("subscription_inflation_essay", async () => {
          const { data: row, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "subscription_inflation_essay")
            .single()
          if (error || !row?.content) return defaultContent
          return row.content
        })
        setBlogContent(content)
      } catch {
        setBlogContent(defaultContent)
      } finally {
        setBlogLoading(false)
      }
    }
    loadBlog()
  }, [])

  // Set default tier when service changes in add panel
  useEffect(() => {
    if (!data || !addServiceId) { setAddTierId(""); return }
    const svc = data.services.find((s) => s.id === addServiceId)
    if (svc?.tiers?.length) setAddTierId(svc.tiers[0].tierId)
  }, [addServiceId, data])

  const services = useMemo(() => data?.services ?? [], [data])
  const cpiData = useMemo(() => data?.cpiBaseline.data ?? [], [data])
  const summaryStats = useMemo(() => data?.summaryStats ?? [], [data])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category)))
    return cats
  }, [services])

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services
    return services.filter((s) => s.category === selectedCategory)
  }, [services, selectedCategory])

  // Year range covered by all selected subs
  const yearRange = useMemo(() => {
    if (!selectedSubs.length || !data) return { min: 2015, max: 2026 }
    const min = Math.min(...selectedSubs.map((s) => s.startYear))
    const max = 2026
    return { min, max }
  }, [selectedSubs, data])

  // Build chart data: one row per year, one column per sub + inflation baseline
  const chartData = useMemo(() => {
    if (!data) return []
    const years = Array.from(
      { length: yearRange.max - yearRange.min + 1 },
      (_, i) => yearRange.min + i
    )

    return years.map((year) => {
      const row: Record<string, number | string> = { year }

      selectedSubs.forEach((sel) => {
        const svc = services.find((s) => s.id === sel.serviceId)
        const tier = svc?.tiers.find((t) => t.tierId === sel.tierId)
        if (!tier) return
        if (year < sel.startYear) return
        const price = getPriceForYear(tier, year)
        if (price !== null) {
          const key = `${sel.uid}`
          row[key] = price
        }
      })

      // CPI-adjusted baseline for each sub (what the start price would cost at CPI growth)
      if (showInflationLine) {
        selectedSubs.forEach((sel) => {
          const svc = services.find((s) => s.id === sel.serviceId)
          const tier = svc?.tiers.find((t) => t.tierId === sel.tierId)
          if (!tier) return
          if (year < sel.startYear) return
          const startPrice = getPriceForYear(tier, sel.startYear)
          if (startPrice === null) return
          const baseCpi = getCpiForYear(cpiData, sel.startYear)
          const currCpi = getCpiForYear(cpiData, year)
          row[`${sel.uid}_cpi`] = parseFloat(((startPrice * currCpi) / baseCpi).toFixed(2))
        })
      }

      return row
    })
  }, [data, selectedSubs, yearRange, services, cpiData, showInflationLine])

  // Monthly totals per year
  const monthlyTotals = useMemo(() => {
    if (!data) return []
    const latest = chartData[chartData.length - 1]
    if (!latest) return []
    return selectedSubs.map((sel) => {
      const svc = services.find((s) => s.id === sel.serviceId)
      const tier = svc?.tiers.find((t) => t.tierId === sel.tierId)
      const startPrice = tier ? getPriceForYear(tier, sel.startYear) ?? 0 : 0
      const currentPrice = tier ? getPriceForYear(tier, 2026) ?? 0 : 0
      const cpiStart = getCpiForYear(cpiData, sel.startYear)
      const cpiNow = getCpiForYear(cpiData, 2026)
      const ifCpiOnly = parseFloat(((startPrice * cpiNow) / cpiStart).toFixed(2))
      const overcharge = parseFloat((currentPrice - ifCpiOnly).toFixed(2))
      return {
        uid: sel.uid,
        name: svc?.name ?? "",
        tierName: tier?.tierName ?? "",
        startYear: sel.startYear,
        startPrice,
        currentPrice,
        ifCpiOnly,
        overcharge,
        pctIncrease: startPrice > 0 ? (((currentPrice - startPrice) / startPrice) * 100) : 0,
        annualCost: currentPrice * 12,
        annualExtra: overcharge * 12,
      }
    })
  }, [data, selectedSubs, chartData, services, cpiData])

  const totalMonthly = useMemo(
    () => monthlyTotals.reduce((s, r) => s + r.currentPrice, 0),
    [monthlyTotals]
  )
  const totalMonthlyIfCpi = useMemo(
    () => monthlyTotals.reduce((s, r) => s + r.ifCpiOnly, 0),
    [monthlyTotals]
  )
  const totalOvercharge = useMemo(
    () => monthlyTotals.reduce((s, r) => s + r.overcharge, 0),
    [monthlyTotals]
  )

  const addSubscription = useCallback(() => {
    if (!addServiceId || !addTierId) return
    const uid = `sub-${Date.now()}`
    setSelectedSubs((prev) => [...prev, { uid, serviceId: addServiceId, tierId: addTierId, startYear: addStartYear }])
    setShowAddPanel(false)
    setAddServiceId("")
    setAddTierId("")
  }, [addServiceId, addTierId, addStartYear])

  const removeSubscription = useCallback((uid: string) => {
    setSelectedSubs((prev) => prev.filter((s) => s.uid !== uid))
  }, [])

  const getLabelForSub = useCallback(
    (sel: SelectedSubscription) => {
      const svc = services.find((s) => s.id === sel.serviceId)
      const tier = svc?.tiers.find((t) => t.tierId === sel.tierId)
      return `${svc?.name ?? sel.serviceId} — ${tier?.tierName ?? sel.tierId}`
    },
    [services]
  )

  const faqs = [
    {
      question: "How does this calculator measure subscription inflation?",
      answer:
        "For each subscription you add, we plot its real price history from your chosen start year through to today. We then show the CPI-adjusted equivalent — what that starting price would cost if it had only risen with official US inflation. The gap between the two lines is the 'subscription inflation premium' you are paying above and beyond general price rises.",
    },
    {
      question: "Why does Spotify show less inflation than Netflix?",
      answer:
        "Spotify held its Individual plan at $9.99 for 12 years (2011–2023) before raising it — one of the longest price freezes of any major subscription service. Netflix raised prices seven times over the same period. So even though Spotify has also started hiking, its cumulative increase is much smaller relative to how long it has existed.",
    },
    {
      question: "What does 'if only CPI' mean in the results?",
      answer:
        "The 'If CPI Only' figure shows what your subscription would cost today if its price had grown at exactly the rate of general US inflation (measured by the Bureau of Labor Statistics CPI) from the year you started subscribing. The difference between this and the actual price is the amount the company has raised prices above and beyond what inflation alone would justify.",
    },
    {
      question: "Why is Amazon Prime shown as a monthly equivalent?",
      answer:
        "Amazon Prime is billed annually. We convert it to a monthly equivalent (annual price ÷ 12) so it can be compared fairly with monthly-billed services. The actual charge to your account is annual.",
    },
    {
      question: "Are UK, Australian, or Canadian prices included?",
      answer:
        "The price data in this calculator is US pricing (USD). Most services charge different prices in different countries — often adjusted for local market conditions, purchasing power, and competition. We plan to add multi-currency subscription data in a future update.",
    },
    {
      question: "How often is this data updated?",
      answer:
        "We update the subscription price data whenever a major service announces a price change. The dataset was last updated in May 2026 and includes all confirmed price changes up to that date.",
    },
  ]

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 pt-28 sm:pt-36 pb-12 space-y-8">

        {/* ── Title ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            Subscription Creep Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-balance">
            Subscription Inflation Calculator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-balance leading-relaxed">
            See exactly how much your streaming and software subscriptions have risen above
            inflation since you started paying — and how much extra you are paying vs what CPI alone would justify.
          </p>
        </div>

        {/* ── Summary stats strip ── */}
        {summaryStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Fastest rising",
                value: summaryStats.sort((a, b) => b.totalIncreasePct - a.totalIncreasePct)[0]?.name,
                sub: `+${summaryStats[0]?.totalIncreasePct?.toFixed(0) ?? 0}% since launch`,
                color: "text-red-600 dark:text-red-400",
                bg: "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900",
              },
              {
                label: "Most vs inflation",
                value: summaryStats.sort((a, b) => b.vsInflationMultiple - a.vsInflationMultiple)[0]?.name,
                sub: `${summaryStats.sort((a, b) => b.vsInflationMultiple - a.vsInflationMultiple)[0]?.vsInflationMultiple?.toFixed(1) ?? 0}x faster than CPI`,
                color: "text-orange-600 dark:text-orange-400",
                bg: "bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900",
              },
              {
                label: "Best price discipline",
                value: summaryStats.sort((a, b) => a.totalIncreasePct - b.totalIncreasePct)[0]?.name,
                sub: `+${summaryStats.sort((a, b) => a.totalIncreasePct - b.totalIncreasePct)[0]?.totalIncreasePct?.toFixed(0) ?? 0}% since launch`,
                color: "text-green-600 dark:text-green-400",
                bg: "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900",
              },
              {
                label: "Services tracked",
                value: `${services.length}`,
                sub: "with full price history",
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900",
              },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg}`}>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
                <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Main calculator card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

          {/* Selected subscriptions */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Your Subscriptions
              </h2>
              <button
                onClick={() => setShowAddPanel((p) => !p)}
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add subscription
              </button>
            </div>

            {/* Add panel */}
            {showAddPanel && (
              <div className="mb-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Add a subscription</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Service picker */}
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-medium">Service</label>
                    <select
                      value={addServiceId}
                      onChange={(e) => setAddServiceId(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select service...</option>
                      {categories.map((cat) => (
                        <optgroup key={cat} label={CATEGORY_LABELS[cat] ?? cat}>
                          {services
                            .filter((s) => s.category === cat)
                            .map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Tier picker */}
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-medium">Plan / Tier</label>
                    <select
                      value={addTierId}
                      onChange={(e) => setAddTierId(e.target.value)}
                      disabled={!addServiceId}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {addServiceId && services.find((s) => s.id === addServiceId)?.tiers.map((t) => (
                        <option key={t.tierId} value={t.tierId}>{t.tierName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start year */}
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-medium">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      I started paying in
                    </label>
                    <select
                      value={addStartYear}
                      onChange={(e) => setAddStartYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 2026 - 2005 + 1 }, (_, i) => 2026 - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={addSubscription}
                    disabled={!addServiceId || !addTierId}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add to calculator
                  </button>
                  <button
                    onClick={() => setShowAddPanel(false)}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Active subscriptions list */}
            {selectedSubs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                No subscriptions added yet. Click &ldquo;Add subscription&rdquo; to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSubs.map((sel, idx) => {
                  const svc = services.find((s) => s.id === sel.serviceId)
                  const tier = svc?.tiers.find((t) => t.tierId === sel.tierId)
                  const totals = monthlyTotals.find((m) => m.uid === sel.uid)
                  const color = LINE_COLORS[idx % LINE_COLORS.length]
                  return (
                    <div
                      key={sel.uid}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3"
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {svc?.name} — {tier?.tierName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Since {sel.startYear} &nbsp;·&nbsp;
                          {totals && (
                            <>
                              Started at {formatCurrency(totals.startPrice)}/mo &nbsp;·&nbsp;
                              Now {formatCurrency(totals.currentPrice)}/mo &nbsp;·&nbsp;
                              <span className={totals.overcharge > 0 ? "text-red-500" : "text-green-500"}>
                                {totals.overcharge > 0 ? "+" : ""}{formatCurrency(totals.overcharge)} above CPI
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSubscription(sel.uid)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        aria-label="Remove subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chart */}
          {selectedSubs.length > 0 && (
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Price history — actual vs CPI-adjusted baseline
                </h2>
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showInflationLine}
                    onChange={(e) => setShowInflationLine(e.target.checked)}
                    className="rounded"
                  />
                  Show CPI baselines
                </label>
              </div>
              <div className="h-72 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fontSize: 11 }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        `$${Number(value).toFixed(2)}/mo`,
                        name,
                      ]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {selectedSubs.map((sel, idx) => {
                      const color = LINE_COLORS[idx % LINE_COLORS.length]
                      const label = getLabelForSub(sel)
                      return [
                        <Line
                          key={sel.uid}
                          type="monotone"
                          dataKey={sel.uid}
                          stroke={color}
                          strokeWidth={2.5}
                          name={label}
                          dot={false}
                          connectNulls
                        />,
                        showInflationLine && (
                          <Line
                            key={`${sel.uid}_cpi`}
                            type="monotone"
                            dataKey={`${sel.uid}_cpi`}
                            stroke={color}
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            name={`${label} (if CPI only)`}
                            dot={false}
                            connectNulls
                            opacity={0.55}
                          />
                        ),
                      ]
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">
                Solid lines = actual prices &nbsp;·&nbsp; Dashed lines = what prices would be if only CPI inflation applied
              </p>
            </div>
          )}

          {/* Results summary */}
          {selectedSubs.length > 0 && (
            <div className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                Your subscription inflation breakdown
              </h2>

              {/* Per-service breakdown */}
              <div className="space-y-3 mb-6">
                {monthlyTotals.map((row, idx) => {
                  const color = LINE_COLORS[idx % LINE_COLORS.length]
                  const pctInc = row.pctIncrease.toFixed(1)
                  return (
                    <div key={row.uid} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {row.name} — {row.tierName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Since {row.startYear}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(row.currentPrice)}<span className="text-xs font-normal text-gray-400">/mo</span></div>
                          <div className={`text-xs font-semibold ${row.overcharge > 0 ? "text-red-500" : "text-green-500"}`}>
                            {row.overcharge > 0 ? "+" : ""}{formatCurrency(row.overcharge)} above CPI/mo
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">Started at</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(row.startPrice)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">If CPI only</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(row.ifCpiOnly)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">Actual increase</div>
                          <div className="text-sm font-semibold text-red-500">+{pctInc}%</div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            backgroundColor: color,
                            width: `${Math.min(100, (row.currentPrice / Math.max(row.currentPrice, ...monthlyTotals.map((m) => m.currentPrice))) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total summary card */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 text-sm">
                  Total subscription burden
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly total (now)</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthly)}</div>
                    <div className="text-xs text-gray-400">/month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Annual total</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthly * 12)}</div>
                    <div className="text-xs text-gray-400">/year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">If CPI only</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalMonthlyIfCpi)}</div>
                    <div className="text-xs text-gray-400">/month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Extra above inflation</div>
                    <div className="text-2xl font-bold text-red-500">{formatCurrency(totalOvercharge)}</div>
                    <div className="text-xs text-gray-400">/month &nbsp;·&nbsp; {formatCurrency(totalOvercharge * 12)}/yr</div>
                  </div>
                </div>
                {totalOvercharge > 0 && (
                  <div className="mt-4 flex items-start gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      You are paying <strong>{formatCurrency(totalOvercharge)}/month</strong> ({formatCurrency(totalOvercharge * 12)}/year) more
                      than you would be if your subscriptions had only risen with official inflation since you started each one.
                      Over 5 years that compounds to approximately <strong>{formatCurrency(totalOvercharge * 12 * 5)}</strong> in extra charges.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Browse all services ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Browse all tracked services</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                }`}
              >
                All services
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredServices.map((svc) => {
              const stats = summaryStats.find((s) => s.id === svc.id)
              const isExpanded = expandedService === svc.id
              const catColor = CATEGORY_COLORS[svc.category] ?? "#6b7280"

              return (
                <div key={svc.id}>
                  <button
                    onClick={() => setExpandedService(isExpanded ? null : svc.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: catColor }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{svc.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{svc.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                      {stats && (
                        <div className="text-right hidden sm:block">
                          <div className="text-xs text-gray-400 dark:text-gray-500">Total increase</div>
                          <div className="text-sm font-bold text-red-500">+{stats.totalIncreasePct.toFixed(0)}%</div>
                        </div>
                      )}
                      {stats && (
                        <div className="text-right hidden sm:block">
                          <div className="text-xs text-gray-400 dark:text-gray-500">vs CPI</div>
                          <div className="text-sm font-bold text-orange-500">{stats.vsInflationMultiple.toFixed(1)}x</div>
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 bg-gray-50 dark:bg-gray-800/50">
                      {svc.tiers.map((tier) => (
                        <div key={tier.tierId} className="mb-4 last:mb-0">
                          <div className="flex items-center justify-between mb-2 pt-3">
                            <div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tier.tierName}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{tier.description}</span>
                            </div>
                            <button
                              onClick={() => {
                                const uid = `sub-${Date.now()}-${tier.tierId}`
                                setSelectedSubs((prev) => [
                                  ...prev,
                                  { uid, serviceId: svc.id, tierId: tier.tierId, startYear: tier.priceHistory[0]?.year ?? 2015 },
                                ])
                              }}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 ml-2"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-gray-400 dark:text-gray-500">
                                  <th className="text-left font-medium pb-1 pr-4">Year</th>
                                  <th className="text-left font-medium pb-1 pr-4">Month</th>
                                  <th className="text-left font-medium pb-1 pr-4">Price/mo</th>
                                  <th className="text-left font-medium pb-1">Note</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tier.priceHistory.map((p, i) => {
                                  const prev = tier.priceHistory[i - 1]
                                  const change = prev ? p.price - prev.price : 0
                                  return (
                                    <tr key={`${p.year}-${p.month}`} className="text-gray-700 dark:text-gray-300">
                                      <td className="py-1 pr-4">{p.year}</td>
                                      <td className="py-1 pr-4">
                                        {new Date(2000, p.month - 1).toLocaleString("default", { month: "short" })}
                                      </td>
                                      <td className="py-1 pr-4 font-semibold">${p.price.toFixed(2)}</td>
                                      <td className="py-1">
                                        <span className="text-gray-400 dark:text-gray-500">{p.note}</span>
                                        {change > 0 && (
                                          <span className="ml-2 text-red-500 font-semibold">+${change.toFixed(2)}</span>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Blog essay ── */}
        {!blogLoading && blogContent && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Understanding Subscription Inflation</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed prose-a:text-blue-600">
              {blogContent.split("\n").map((line, i) => {
                if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{line.replace("## ", "")}</h2>
                if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">{line.replace("### ", "")}</h3>
                if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{line.replace("# ", "")}</h1>
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-gray-600 dark:text-gray-400">{line.replace("- ", "")}</li>
                if (line.trim() === "---") return <hr key={i} className="border-gray-200 dark:border-gray-700 my-4" />
                if (line.trim() === "") return <br key={i} />
                return <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{line}</p>
              })}
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          <FAQ items={faqs} />
        </div>

        {/* ── Related tools ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Related tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/shrinkflation-calculator", label: "Shrinkflation Calculator" },
              { href: "/skimpflation-calculator", label: "Skimpflation Calculator" },
              { href: "/sneakflation-calculator", label: "Sneakflation Calculator" },
              { href: "/investment-race-calculator", label: "Investment Race" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2.5 text-center font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
