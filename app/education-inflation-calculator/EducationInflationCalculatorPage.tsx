"use client"

import { useState, useMemo, useEffect } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, BarChart, Bar, Cell,
} from "recharts"
import Link from "next/link"
import {
  GraduationCap, TrendingUp, TrendingDown, Info, BookOpen,
  ShieldCheck, ShieldAlert, BarChart3, Calculator,
} from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// ─── Types ─────────────────────────────────────────────────────────────────────

type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "CHF" | "JPY" | "NZD"

// ─── Currency + country config ─────────────────────────────────────────────────

const CURRENCIES: Record<CurrencyCode, {
  symbol: string
  name: string
  flag: string
  country: string
  dataNote: string
  dataQuality: "solid" | "estimated"
  badge: string
}> = {
  USD: {
    symbol: "$", name: "US Dollar", flag: "🇺🇸", country: "United States",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from BLS (series CUSR0000SAE1, All Urban Consumers). Tuition data from NCES IPEDS: average published tuition + fees at 4-year public and private non-profit institutions, 1980–2024.",
  },
  GBP: {
    symbol: "£", name: "British Pound", flag: "🇬🇧", country: "United Kingdom",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from ONS CPIH sub-index D7C5 (series CP09 — Education). Tuition fee history from UK Parliament records: England capped at £1,000 (1998), £3,000 (2006), £9,000 (2012), £9,250 (2017). Scotland, Wales, NI shown separately in data file.",
  },
  EUR: {
    symbol: "€", name: "Euro", flag: "🇪🇺", country: "Eurozone",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from Eurostat HICP CP10 Education sub-index (annual, 2015=100). Tuition data covers France (droits d'inscription: €143–178/yr), Germany (free since 2014, Semesterbeitrag ~€300–700/yr), Netherlands (wettelijk collegegeld: €1,452–2,694/yr), and Italy (income-based average: €450–1,000/yr).",
  },
  CAD: {
    symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", country: "Canada",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from Statistics Canada Table 18-10-0004-01, vector v41691198 (Education sub-component, 2002=100, monthly 1973–2026). Tuition data from Statistics Canada Table 37-10-0045-01: average undergraduate tuition fees by field of study and province, 2006/07–2025/26.",
  },
  AUD: {
    symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", country: "Australia",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from ABS CPI Catalogue 6401.0 — tertiary education, secondary education, and preschool/primary sub-groups (quarterly, 1980–2025). Tuition data from Department of Education (Study Assist): maximum student contribution (HECS-HELP) by band 1989–2026, including 2021 Job-Ready Graduates Package restructure.",
  },
  CHF: {
    symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", country: "Switzerland",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from Swiss FSO (BFS) monthly CPI education sub-index via education-cpi-international.json. Tuition data from ETH Zurich Registrar: semester fee CHF 452 (pre-2000) → CHF 580 (2000–2019) → CHF 660 (2019) → CHF 730 (2020–present). University of Zurich approx CHF 1,200–1,540/yr.",
  },
  JPY: {
    symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", country: "Japan",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from Statistics Bureau of Japan annual CPI education sub-index (2020=100, 1970–2025). Tuition data from MEXT (文部科学省): standard national university fee frozen at ¥535,800 since 2005. Free before 1975. Admission fee standard ¥282,000 since 2005.",
  },
  NZD: {
    symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", country: "New Zealand",
    dataQuality: "solid", badge: "High Confidence",
    dataNote: "Education CPI from Stats NZ quarterly CPI Group 11 Education (2006–2026). Tuition data from NZ Ministry of Education: average domestic fee per EFTS, 2000–2024. Fees First Year Free (FFF) policy from 2018 means many students pay zero in first year.",
  },
}

// ─── Period presets ───────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Pre-GFC Decade",   fromYear: 2000, toYear: 2010, description: "2000s tuition explosion" },
  { label: "Post-2008 Rise",   fromYear: 2010, toYear: 2020, description: "Austerity & fee hikes"   },
  { label: "Recent 5 Years",   fromYear: 2019, toYear: 2024, description: "COVID & post-COVID era"  },
  { label: "Full 25 Years",    fromYear: 2000, toYear: 2025, description: "All available data"      },
]

// ─── Tuition benchmarks per currency (annual, local currency) ─────────────────
// Used to pre-fill the calculator when user selects a currency

const TUITION_BENCHMARKS: Record<CurrencyCode, { year: number; amount: number; label: string }[]> = {
  USD: [
    { year: 2000, amount: 3510,  label: "Avg public 4-yr (2000)" },
    { year: 2010, amount: 7605,  label: "Avg public 4-yr (2010)" },
    { year: 2024, amount: 11260, label: "Avg public 4-yr (2024)" },
  ],
  GBP: [
    { year: 2005, amount: 1175,  label: "England capped fee (2005)" },
    { year: 2012, amount: 9000,  label: "England tripling (2012)" },
    { year: 2024, amount: 9250,  label: "England max fee (2024)" },
  ],
  EUR: [
    { year: 2000, amount: 143,   label: "France licence (2000)" },
    { year: 2012, amount: 1771,  label: "Netherlands (2012/13)" },
    { year: 2024, amount: 2530,  label: "Netherlands (2024/25)" },
  ],
  CAD: [
    { year: 2006, amount: 4400,  label: "National avg (2006/07)" },
    { year: 2015, amount: 6191,  label: "National avg (2015/16)" },
    { year: 2025, amount: 7437,  label: "National avg (2025/26)" },
  ],
  AUD: [
    { year: 1997, amount: 3330,  label: "Band 1 max (1997)" },
    { year: 2010, amount: 4355,  label: "Band 1 max (2010)" },
    { year: 2026, amount: 4738,  label: "Band 3 max (2026)" },
  ],
  CHF: [
    { year: 2000, amount: 1160,  label: "ETH annual (2000)" },
    { year: 2019, amount: 1160,  label: "ETH annual (2019)" },
    { year: 2024, amount: 1460,  label: "ETH annual (2024)" },
  ],
  JPY: [
    { year: 1975, amount: 36000,  label: "National univ. (1975)" },
    { year: 2004, amount: 520800, label: "National univ. (2004)" },
    { year: 2024, amount: 535800, label: "National univ. (2024)" },
  ],
  NZD: [
    { year: 2000, amount: 3200,  label: "Avg domestic EFTS (2000)" },
    { year: 2012, amount: 5330,  label: "Avg domestic EFTS (2012)" },
    { year: 2024, amount: 7050,  label: "Avg domestic EFTS (2024)" },
  ],
}

// ─── Global key education inflation stats ─────────────────────────────────────

const KEY_STATS = [
  { stat: "+275%", label: "Average US public 4-year tuition since 1990 (inflation-adjusted: +91%)", source: "NCES IPEDS", flag: "🇺🇸" },
  { stat: "+830%", label: "England university fees since 1998: £1,000 → £9,250 (nominal)", source: "UK Parliament", flag: "🇬🇧" },
  { stat: "21 yrs", label: "Japan national university fee frozen at ¥535,800 since 2005 — zero increase", source: "MEXT", flag: "🇯🇵" },
  { stat: "+69%", label: "Canada undergraduate fees since 2006/07: C$4,400 → C$7,437 (2025/26)", source: "Stats Canada", flag: "🇨🇦" },
  { stat: "Free", label: "Germany university tuition for domestic/EU students since 2014. Semesterbeitrag ~€350/yr only.", source: "State ministries", flag: "🇩🇪" },
  { stat: "+85%", label: "Netherlands collegegeld since 2000/01: €1,452 → €2,694 (2026/27)", source: "DUO", flag: "🇳🇱" },
  { stat: "+120%", label: "New Zealand average domestic fee since 2000: NZ$3,200 → NZ$7,050 (2024)", source: "MOE NZ", flag: "🇳🇿" },
  { stat: "CHF 730", label: "ETH Zurich semester fee — only 57% increase since 1995 (CHF 452 → CHF 730)", source: "ETH Zurich", flag: "🇨🇭" },
]

const MIN_YEAR = 1990
const MAX_YEAR = 2025

// ─── Markdown renderer (same pattern as other calculators) ────────────────────

function renderMarkdown(content: string) {
  return content.split("\n").map((line, index) => {
    const t = line.trim()
    if (!t) return null
    if (t.startsWith("|")) return null
    if (t.startsWith("# ") && !t.startsWith("## ")) {
      return <h2 key={index} className="text-xl font-bold text-foreground mt-6 mb-3">{t.slice(2)}</h2>
    }
    if (t.startsWith("## ") && !t.startsWith("### ")) {
      return <h3 key={index} className="text-lg font-bold text-foreground mt-6 mb-3">{t.slice(3)}</h3>
    }
    if (t.startsWith("### ")) {
      return <h4 key={index} className="text-base font-semibold text-foreground mt-5 mb-2">{t.slice(4)}</h4>
    }
    if (t.startsWith("- ") || t.startsWith("* ")) {
      return <li key={index} className="ml-4 list-disc text-foreground/90 text-sm">{parseBold(t.slice(2))}</li>
    }
    return <p key={index} className="text-sm leading-7 text-foreground/90">{parseBold(t)}</p>
  })
}

function parseBold(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const boldRegex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  let key = 0
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index))
    parts.push(<strong key={`b-${key++}`} className="font-semibold text-foreground">{match[1]}</strong>)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex))
  return parts.length > 0 ? parts : [text]
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EducationInflationCalculatorPage() {
  const [currency, setCurrency]       = useState<CurrencyCode>("USD")
  const [fromYear, setFromYear]       = useState(2000)
  const [toYear, setToYear]           = useState(2024)
  const [oldTuition, setOldTuition]   = useState("3510")
  const [newTuition, setNewTuition]   = useState("11260")
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)

  // Data
  const [cpiData,        setCpiData]        = useState<Record<string, any> | null>(null)
  const [generalCpiData, setGeneralCpiData] = useState<Record<string, any> | null>(null)
  const [tuitionData,    setTuitionData]    = useState<Record<string, any> | null>(null)
  const [dataLoading,    setDataLoading]    = useState(true)

  // ─── Helper: convert any CPI series to a plain { year: index } map ─────────

  function normaliseToYearMap(raw: any): Record<number, number> | null {
    if (!raw) return null
    // Already a plain object with numeric or string year keys e.g. { 2000: 93.1 }
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const first = Object.keys(raw)[0]
      if (!isNaN(Number(first))) {
        const out: Record<number, number> = {}
        for (const [k, v] of Object.entries(raw)) {
          if (!isNaN(Number(k)) && typeof v === "number") out[Number(k)] = v
        }
        return Object.keys(out).length > 0 ? out : null
      }
    }
    // Array of [year_string, value] pairs e.g. [["2007", 699.1], ...]
    if (Array.isArray(raw)) {
      const out: Record<number, number> = {}
      for (const item of raw) {
        if (Array.isArray(item) && item.length === 2) {
          const yr = Number(item[0]); const val = Number(item[1])
          if (!isNaN(yr) && !isNaN(val)) out[yr] = val
        }
      }
      return Object.keys(out).length > 0 ? out : null
    }
    return null
  }

  // ─── Load all data on mount ───────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setDataLoading(true)
      try {
        const [
          usdEduRaw, gbpEduRaw, eurEduRaw, cadEduRaw, audEduRaw, chfEduRaw, jpyEduRaw, nzdEduRaw,
          usdGenRaw, gbpGenRaw, eurGenRaw, cadGenRaw, audGenRaw, chfGenRaw, jpyGenRaw, nzdGenRaw,
        ] = await Promise.all([
          fetch("/data/education-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/ons-uk-education-cpi.json").then(r => r.json()).catch(() => null),
          fetch("/data/eurostat-hicp-education.json").then(r => r.json()).catch(() => null),
          fetch("/data/canada-education-cpi.json").then(r => r.json()).catch(() => null),
          fetch("/data/abs-education-cpi.json").then(r => r.json()).catch(() => null),
          fetch("/data/education-cpi-international.json").then(r => r.json()).catch(() => null),
          fetch("/data/japan-education-cpi.json").then(r => r.json()).catch(() => null),
          fetch("/data/nz-education-cpi.json").then(r => r.json()).catch(() => null),
          // General (all-items) CPI per currency
          fetch("/data/usd-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/gbp-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/eur-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/cad-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/aud-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/chf-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/jpy-inflation.json").then(r => r.json()).catch(() => null),
          fetch("/data/nzd-inflation.json").then(r => r.json()).catch(() => null),
        ])

        // ── Education CPI: extract to normalised { year: index } maps ────────

        // USD: data is array [{year, educationCPI, generalCPI}]
        const usdEduSeries: Record<number, number> = {}
        if (Array.isArray(usdEduRaw?.data)) {
          for (const row of usdEduRaw.data) {
            if (row.year && row.educationCPI) usdEduSeries[Number(row.year)] = row.educationCPI
          }
        }

        // GBP: series.D7C5.annualAvg keyed by number year
        const gbpEduSeries = normaliseToYearMap(gbpEduRaw?.series?.D7C5?.annualAvg)

        // EUR: countries.EU27_2020.annualIndex is array of [year_string, value]
        const eurCountry = eurEduRaw?.countries?.["EU27_2020"] ??
                           eurEduRaw?.countries?.["EA19"] ??
                           eurEduRaw?.countries?.["DE"] ??
                           Object.values(eurEduRaw?.countries ?? {})[0] as any
        const eurEduSeries = normaliseToYearMap(eurCountry?.annualIndex)

        // CAD: education.annual keyed by number year ✓
        const cadEduSeries = normaliseToYearMap(cadEduRaw?.education?.annual)

        // AUD: nationalSeries.totalEducation.annual keyed by string year
        const audEduSeries = normaliseToYearMap(
          audEduRaw?.nationalSeries?.totalEducation?.annual ??
          audEduRaw?.nationalSeries?.tertiary?.annual
        )

        // CHF: countries.CHE.annualAvg keyed by number year (starts 2010)
        const chfEduSeries = normaliseToYearMap(chfEduRaw?.countries?.CHE?.annualAvg)

        // JPY: education.annual keyed by number year ✓
        const jpyEduSeries = normaliseToYearMap(jpyEduRaw?.education?.annual)

        // NZD: education.annual is array of [year_string, value] ✓
        const nzdEduSeries = normaliseToYearMap(nzdEduRaw?.education?.annual)

        setCpiData({
          USD: usdEduSeries,
          GBP: gbpEduSeries,
          EUR: eurEduSeries,
          CAD: cadEduSeries,
          AUD: audEduSeries,
          CHF: chfEduSeries,
          JPY: jpyEduSeries,
          NZD: nzdEduSeries,
        })

        // ── General CPI: all files have { data: { year: index } } ─────────
        setGeneralCpiData({
          USD: normaliseToYearMap(usdGenRaw?.data),
          GBP: normaliseToYearMap(gbpGenRaw?.data),
          EUR: normaliseToYearMap(eurGenRaw?.data),
          CAD: normaliseToYearMap(cadGenRaw?.data),
          AUD: normaliseToYearMap(audGenRaw?.data),
          CHF: normaliseToYearMap(chfGenRaw?.data),
          JPY: normaliseToYearMap(jpyGenRaw?.data),
          NZD: normaliseToYearMap(nzdGenRaw?.data),
        })

        setTuitionData({ USD: usdEduRaw, GBP: gbpEduRaw })
      } catch {
        // silent fail — calculator still works with user-entered values
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [])

  // ─── Load blog essay ──────────────────────────────────────────────────────

  useEffect(() => {
    const defaultContent = `## The Education Inflation Nobody Tracks\n\nDegree costs have risen far faster than official CPI in most countries. In the US, public university tuition has risen 275% since 1990 — more than three times the rate of general inflation. In England, fees jumped 830% in nominal terms between 1998 and 2017. Understanding education inflation matters for every family planning a child's future.`
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

  // ─── Auto-fill benchmarks when currency changes ───────────────────────────

  useEffect(() => {
    const benchmarks = TUITION_BENCHMARKS[currency]
    // Pick the two closest to current fromYear/toYear
    const sorted = [...benchmarks].sort((a, b) => a.year - b.year)
    if (sorted.length >= 2) {
      setFromYear(sorted[0].year)
      setToYear(sorted[sorted.length - 1].year)
      setOldTuition(String(sorted[0].amount))
      setNewTuition(String(sorted[sorted.length - 1].amount))
    }
  }, [currency])

  // ─── Get normalised CPI series for selected currency ─────────────────────
  // cpiData[currency] is already a normalised { year: index } map after load

  const educationCpiSeries = useMemo((): Record<number, number> | null => {
    if (!cpiData) return null
    return (cpiData[currency] as Record<number, number>) ?? null
  }, [cpiData, currency])

  const generalCpiSeries = useMemo((): Record<number, number> | null => {
    if (!generalCpiData) return null
    return (generalCpiData[currency] as Record<number, number>) ?? null
  }, [generalCpiData, currency])

  // ─── Helper: get % change from a series between two years ────────────────

  function seriesPct(series: Record<number, number> | null, y1: number, y2: number): number | null {
    if (!series) return null
    const start = series[y1]
    const end   = series[y2] ?? series[y2 - 1]
    if (!start || !end) return null
    return ((end / start) - 1) * 100
  }

  // ─── Core calculations ────────────────────────────────────────────────────

  const results = useMemo(() => {
    const old = parseFloat(oldTuition)
    const curr = parseFloat(newTuition)
    if (!old || !curr || old <= 0 || curr <= 0 || toYear <= fromYear) return null

    const years = toYear - fromYear
    const totalPct = ((curr / old) - 1) * 100
    const cagr = (Math.pow(curr / old, 1 / years) - 1) * 100

    // Education CPI comparison
    const cpiPct = seriesPct(educationCpiSeries, fromYear, toYear)
    const excessOverCpi = cpiPct !== null ? totalPct - cpiPct : null

    // General (all-items) CPI comparison
    const generalCpiPct = seriesPct(generalCpiSeries, fromYear, toYear)
    const excessOverGeneral = generalCpiPct !== null ? totalPct - generalCpiPct : null

    // CPI-adjusted cost baseline (what tuition should cost if it had only risen with education CPI)
    const cpiAdjustedCost = (() => {
      if (!educationCpiSeries) return null
      const start = educationCpiSeries[fromYear]
      const end   = educationCpiSeries[toYear] ?? educationCpiSeries[toYear - 1]
      if (!start || !end) return null
      return old * (end / start)
    })()

    // General-CPI-adjusted baseline
    const generalAdjustedCost = (() => {
      if (!generalCpiSeries) return null
      const start = generalCpiSeries[fromYear]
      const end   = generalCpiSeries[toYear] ?? generalCpiSeries[toYear - 1]
      if (!start || !end) return null
      return old * (end / start)
    })()

    // Projections at historical CAGR
    const proj5yr  = curr * Math.pow(1 + cagr / 100, 5)
    const proj10yr = curr * Math.pow(1 + cagr / 100, 10)

    // Education Inflation Tax = how much you paid above what education CPI alone justifies
    const inflationTax = cpiAdjustedCost !== null ? curr - cpiAdjustedCost : null

    return {
      old, curr, totalPct, cagr,
      cpiPct, excessOverCpi, cpiAdjustedCost, inflationTax,
      generalCpiPct, excessOverGeneral, generalAdjustedCost,
      years, proj5yr, proj10yr
    }
  }, [oldTuition, newTuition, fromYear, toYear, educationCpiSeries, generalCpiSeries])

  // ─── Summary stats (Education CPI change over selected period) ───────────

  const summaryStats = useMemo(() => {
    if (!educationCpiSeries) return null
    const pct = seriesPct(educationCpiSeries, fromYear, toYear)
    if (pct === null) return null
    const yrs = toYear - fromYear || 1
    const startIdx = educationCpiSeries[fromYear]
    const endIdx   = educationCpiSeries[toYear] ?? educationCpiSeries[toYear - 1]
    if (!startIdx || !endIdx) return null
    const cagr = (Math.pow(endIdx / startIdx, 1 / yrs) - 1) * 100
    return {
      pct:  Math.round(pct  * 10) / 10,
      cagr: Math.round(cagr * 100) / 100,
    }
  }, [educationCpiSeries, fromYear, toYear])

  // ─── Line chart: CPI-adjusted baseline vs general CPI vs actual ──────────

  const lineChartData = useMemo(() => {
    if (!results) return []
    const eduStart = educationCpiSeries?.[fromYear]
    const genStart = generalCpiSeries?.[fromYear]

    const out: any[] = []
    for (let y = fromYear; y <= toYear; y++) {
      const entry: any = { year: y }

      // Education CPI trajectory
      if (eduStart && educationCpiSeries?.[y]) {
        entry["Edu CPI Baseline"] = Math.round(results.old * (educationCpiSeries[y] / eduStart))
      }
      // General CPI trajectory
      if (genStart && generalCpiSeries?.[y]) {
        entry["General CPI Baseline"] = Math.round(results.old * (generalCpiSeries[y] / genStart))
      }
      // Actual tuition (only mark start and end, interpolate linearly for visual)
      if (y === fromYear) entry["Your Tuition"] = results.old
      else if (y === toYear) entry["Your Tuition"] = results.curr
      else {
        // Linear interpolation for a clean line
        const frac = (y - fromYear) / (toYear - fromYear)
        entry["Your Tuition"] = Math.round(results.old + frac * (results.curr - results.old))
      }

      out.push(entry)
    }
    return out
  }, [results, educationCpiSeries, generalCpiSeries, fromYear, toYear])

  // ─── Bar chart: 3-bar % change comparison ────────────────────────────────

  const barData = useMemo(() => {
    if (!results) return []
    const items: { name: string; value: number; fill: string }[] = [
      { name: "Your Tuition", value: Math.round(results.totalPct * 10) / 10, fill: "#2563eb" },
    ]
    if (results.cpiPct !== null) {
      items.push({ name: "Education CPI", value: Math.round(results.cpiPct * 10) / 10, fill: "#6b7280" })
    }
    if (results.generalCpiPct !== null) {
      items.push({ name: "General CPI", value: Math.round(results.generalCpiPct * 10) / 10, fill: "#9ca3af" })
    }
    return items
  }, [results])

  // ─── Severity helper ──────────────────────────────────────────────────────

  const getSeverity = (pct: number) => {
    if (pct >= 200) return { label: "Extreme",  color: "text-red-700 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-900/20",         border: "border-red-200 dark:border-red-800"     }
    if (pct >= 100) return { label: "Very High", color: "text-red-600 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-900/20",         border: "border-red-200 dark:border-red-800"     }
    if (pct >= 50)  return { label: "High",      color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20",   border: "border-orange-200 dark:border-orange-800" }
    if (pct >= 20)  return { label: "Moderate",  color: "text-yellow-600 dark:text-yellow-400",  bg: "bg-yellow-50 dark:bg-yellow-900/20",   border: "border-yellow-200 dark:border-yellow-800" }
    return                 { label: "Low",        color: "text-green-600 dark:text-green-400",    bg: "bg-green-50 dark:bg-green-900/20",     border: "border-green-200 dark:border-green-800"  }
  }

  const cfg = CURRENCIES[currency]
  const sym = cfg.symbol
  const isJPY = currency === "JPY"

  const fmt = (n: number) =>
    isJPY ? `${sym}${Math.round(n).toLocaleString()}` : `${sym}${Math.round(n).toLocaleString("en")}`

  const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`

  const allYears = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ─── Hero ────────────────────────���─────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 pt-32 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <GraduationCap className="w-3 h-3" />
            Education inflation outpaces general CPI in 7 of 8 currencies
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-balance mb-3">
            Education Inflation Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            How much has the cost of education really risen? Enter tuition costs from two different years to calculate your personal education inflation rate — and see how it compares to official CPI. 8 currencies. Real data from BLS, ONS, Stats Canada, ABS, MEXT, and more.
          </p>
        </div>
      </section>

      {/* ─── Sticky currency bar ─────────────────────────────────────────── */}
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
                    ? "bg-blue-600 text-white border-blue-600"
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

        {/* ─── Calculator card ────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-sm">Your Education Costs</h2>
          </div>

          {/* Period presets */}
          <div className="px-5 pt-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Quick presets</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map(s => (
                <button
                  key={s.label}
                  onClick={() => { setFromYear(s.fromYear); setToYear(s.toYear) }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    fromYear === s.fromYear && toYear === s.toYear
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

              {/* Then */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-semibold">Then</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
                    <select
                      value={fromYear}
                      onChange={e => setFromYear(Number(e.target.value))}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {allYears.filter(y => y < toYear).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Annual tuition ({sym})
                    </label>
                    <input
                      type="number" min="0" step="any"
                      value={oldTuition}
                      onChange={e => setOldTuition(e.target.value)}
                      placeholder={isJPY ? "e.g. 535800" : "e.g. 5000"}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Pre-filled from {cfg.country} benchmark — edit freely
                    </p>
                  </div>
                </div>
              </div>

              {/* Now */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-sm font-semibold">Now</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
                    <select
                      value={toYear}
                      onChange={e => setToYear(Number(e.target.value))}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {allYears.filter(y => y > fromYear).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Annual tuition ({sym})
                    </label>
                    <input
                      type="number" min="0" step="any"
                      value={newTuition}
                      onChange={e => setNewTuition(e.target.value)}
                      placeholder={isJPY ? "e.g. 535800" : "e.g. 15000"}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Pre-filled from {cfg.country} benchmark — edit freely
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tuition benchmarks helper */}
            <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {cfg.flag} {cfg.country} — real tuition benchmarks (click to use)
              </p>
              <div className="flex flex-wrap gap-2">
                {TUITION_BENCHMARKS[currency].map(b => (
                  <button
                    key={b.year}
                    onClick={() => {
                      if (b.year < toYear) { setFromYear(b.year); setOldTuition(String(b.amount)) }
                      else { setToYear(b.year); setNewTuition(String(b.amount)) }
                    }}
                    className="text-xs px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted transition-colors"
                  >
                    {b.year}: {fmt(b.amount)} — {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CPI data quality badge */}
            <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 mb-4 ${
              cfg.dataQuality === "solid"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
            }`}>
              {cfg.dataQuality === "solid"
                ? <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                : <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              }
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wide ${
                  cfg.dataQuality === "solid" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                }`}>{cfg.badge}</span>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cfg.dataNote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Results ─────────────────────────────────────────────────────── */}
        {results ? (() => {
          const sev = getSeverity(results.totalPct)
          return (
            <>
              {/* Main metric banner */}
              <div className={`rounded-xl border p-6 ${sev.bg} ${sev.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Education Inflation {fromYear}–{toYear} ({cfg.country})
                    </p>
                    <p className={`text-5xl font-bold ${sev.color}`}>
                      {fmtPct(results.totalPct)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tuition rose from {fmt(results.old)} to {fmt(results.curr)} over {results.years} years
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${sev.bg} ${sev.border} ${sev.color} mb-3`}>
                      {sev.label} inflation
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Annualized (CAGR)</p>
                      <p className={`text-2xl font-bold ${sev.color}`}>{results.cagr.toFixed(2)}%/yr</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat cards — row 1: your tuition / edu CPI / general CPI / inflation tax */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-muted-foreground">Your Tuition Rise</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{fmtPct(results.totalPct)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fromYear}–{toYear}</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-muted-foreground">Education CPI</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {results.cpiPct !== null ? fmtPct(results.cpiPct) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Official edu benchmark</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">General CPI</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {results.generalCpiPct !== null ? fmtPct(results.generalCpiPct) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">All-items inflation</p>
                </div>

                {results.inflationTax !== null && results.inflationTax > 0 ? (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Inflation Tax</span>
                    </div>
                    <p className="text-2xl font-bold text-red-500">{fmt(results.inflationTax)}</p>
                    <p className="text-xs text-muted-foreground mt-1">above CPI-adjusted cost</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Annual Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{results.cagr.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">CAGR per year</p>
                  </div>
                )}
              </div>

              {/* CPI comparison panel */}
              {(results.cpiPct !== null || results.generalCpiPct !== null) && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    How Your Education Inflation Compares — {fromYear} to {toYear}
                  </h3>
                  <div className="space-y-3">
                    {/* Your tuition */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 text-xs text-muted-foreground shrink-0">Your Tuition</div>
                      <div className="flex-1 bg-muted rounded-full h-3 relative overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-blue-600"
                          style={{ width: `${Math.min(100, Math.max(2, results.totalPct / Math.max(results.totalPct, results.cpiPct ?? 0, results.generalCpiPct ?? 0, 1) * 100))}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-bold text-blue-600">{fmtPct(results.totalPct)}</div>
                    </div>
                    {/* Education CPI */}
                    {results.cpiPct !== null && (
                      <div className="flex items-center gap-3">
                        <div className="w-32 text-xs text-muted-foreground shrink-0">Education CPI</div>
                        <div className="flex-1 bg-muted rounded-full h-3 relative overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-slate-500"
                            style={{ width: `${Math.min(100, Math.max(2, results.cpiPct / Math.max(results.totalPct, results.cpiPct, results.generalCpiPct ?? 0, 1) * 100))}%` }}
                          />
                        </div>
                        <div className="w-20 text-right text-sm font-bold text-slate-600 dark:text-slate-400">{fmtPct(results.cpiPct)}</div>
                      </div>
                    )}
                    {/* General CPI */}
                    {results.generalCpiPct !== null && (
                      <div className="flex items-center gap-3">
                        <div className="w-32 text-xs text-muted-foreground shrink-0">General CPI</div>
                        <div className="flex-1 bg-muted rounded-full h-3 relative overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-gray-400"
                            style={{ width: `${Math.min(100, Math.max(2, results.generalCpiPct / Math.max(results.totalPct, results.cpiPct ?? 0, results.generalCpiPct, 1) * 100))}%` }}
                          />
                        </div>
                        <div className="w-20 text-right text-sm font-bold text-gray-500 dark:text-gray-400">{fmtPct(results.generalCpiPct)}</div>
                      </div>
                    )}
                  </div>
                  {results.excessOverGeneral !== null && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                      Your tuition rose <strong className="text-foreground">{results.excessOverGeneral > 0 ? "+" : ""}{results.excessOverGeneral.toFixed(1)} percentage points</strong> {results.excessOverGeneral > 0 ? "faster" : "slower"} than general inflation — meaning education absorbed {results.excessOverGeneral > 0 ? "a disproportionately larger" : "a smaller"} share of a typical household budget.
                    </p>
                  )}
                </div>
              )}

              {/* Projections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">If Trend Continues — 5-Year Projection</p>
                  <p className="text-3xl font-bold text-foreground">{fmt(results.proj5yr)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    In {toYear + 5} at current {results.cagr.toFixed(1)}% annual rate
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">10-Year Projection</p>
                  <p className="text-3xl font-bold text-foreground">{fmt(results.proj10yr)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    In {toYear + 10} at current {results.cagr.toFixed(1)}% annual rate
                  </p>
                </div>
              </div>

              {/* CPI comparison summary */}
              {results.cpiPct !== null && results.cpiAdjustedCost !== null && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-sm">What Tuition Would Cost if it Only Rose with CPI</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Education CPI benchmark comparison</p>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Starting tuition ({fromYear})</p>
                      <p className="text-2xl font-bold text-foreground">{fmt(results.old)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">CPI-adjusted ({toYear})</p>
                      <p className="text-2xl font-bold text-blue-600">{fmt(results.cpiAdjustedCost)}</p>
                      <p className="text-xs text-muted-foreground">if only CPI inflation applied</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Actual ({toYear})</p>
                      <p className={`text-2xl font-bold ${results.curr > results.cpiAdjustedCost ? "text-red-500" : "text-green-600"}`}>
                        {fmt(results.curr)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {results.curr > results.cpiAdjustedCost
                          ? `${fmt(results.curr - results.cpiAdjustedCost)} above CPI`
                          : `${fmt(results.cpiAdjustedCost - results.curr)} below CPI`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Line chart */}
              {lineChartData.length > 2 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-sm">Tuition vs Education CPI-Adjusted Baseline</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{fromYear} → {toYear} — {cfg.country}</p>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => isJPY ? `¥${(v/1000).toFixed(0)}k` : `${sym}${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(v: number, name: string) => [fmt(v), name]}
                          labelFormatter={l => `Year: ${l}`}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line
                          type="monotone"
                          dataKey="General CPI Baseline"
                          stroke="#9ca3af"
                          strokeWidth={1.5}
                          strokeDasharray="3 3"
                          dot={false}
                          activeDot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Edu CPI Baseline"
                          stroke="#64748b"
                          strokeWidth={2}
                          strokeDasharray="6 3"
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Your Tuition"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Blue = your tuition. Dark dashed = Education CPI baseline. Light dashed = General CPI (all-items) baseline.
                    </p>
                  </div>
                </div>
              )}

              {/* Bar chart */}
              {barData.length > 0 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-sm">Total % Change Comparison</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{fromYear} → {toYear}</p>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                          axisLine={{ stroke: "var(--border)" }}
                          tickLine={{ stroke: "var(--border)" }}
                          interval={0}
                          height={50}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickFormatter={v => `${v}%`}
                          axisLine={false}
                          tickLine={false}
                          width={50}
                        />
                        <Tooltip
                          formatter={(v: number) => [`${v.toFixed(1)}%`, "Total Change"]}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                        />
                        <ReferenceLine y={0} stroke="var(--border)" />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                          {barData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Blue = your tuition change &nbsp;|&nbsp; Dark gray = Education CPI &nbsp;|&nbsp; Light gray = General (all-items) CPI
                    </p>
                  </div>
                </div>
              )}
            </>
          )
        })() : (
          <div className="bg-muted/20 border border-border rounded-xl p-8 text-center">
            <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Enter tuition costs in both year fields above to calculate your personal education inflation rate.
            </p>
          </div>
        )}

        {/* ─── Education CPI summary stats (always visible) ──────────────── */}
        {summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Edu CPI Change</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">+{summaryStats.pct}%</p>
              <p className="text-xs text-muted-foreground mt-1">{fromYear}–{toYear}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">CPI Annual Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.cagr}%</p>
              <p className="text-xs text-muted-foreground mt-1">avg per year</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{cfg.flag}</span>
                <span className="text-xs text-muted-foreground">Country</span>
              </div>
              <p className="text-lg font-bold text-foreground">{cfg.country}</p>
              <p className="text-xs text-muted-foreground mt-1">{cfg.name}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Period</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{toYear - fromYear}yr</p>
              <p className="text-xs text-muted-foreground mt-1">{fromYear}–{toYear}</p>
            </div>
          </div>
        )}

        {/* ─── Global key stats panel ─────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-sm">Education Inflation by the Numbers</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KEY_STATS.map(({ stat, label, source, flag }) => (
              <div key={stat + label} className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-lg shrink-0">{flag}</span>
                <div>
                  <span className="text-lg font-bold text-blue-600">{stat}</span>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{label}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tuition by country table ───────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Annual University Tuition Fees by Country — 2024</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Domestic students at public universities</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Country</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">~2000</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">~2010</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">~2024</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { flag: "🇺🇸", country: "USA",         c2000: "$3,510",      c2010: "$7,605",   c2024: "$11,260",    change: "+221%",  note: "Public 4-yr avg" },
                  { flag: "🇬🇧", country: "UK (England)", c2000: "£1,000",     c2010: "£3,290",   c2024: "£9,250",     change: "+825%",  note: "Capped fee" },
                  { flag: "🇨🇦", country: "Canada",       c2000: "C$3,800",    c2010: "C$4,942",  c2024: "C$7,360",    change: "+94%",   note: "National avg" },
                  { flag: "🇦🇺", country: "Australia",    c2000: "A$3,612",    c2010: "A$4,355",  c2024: "A$8,948",    change: "+148%",  note: "Band 2 HECS" },
                  { flag: "🇳🇱", country: "Netherlands",  c2000: "€1,452",     c2010: "€1,713",   c2024: "€2,530",     change: "+74%",   note: "Statutory fee" },
                  { flag: "🇩🇪", country: "Germany",      c2000: "€0",         c2010: "~€1,000",  c2024: "€0",         change: "Free",   note: "Abolished 2014" },
                  { flag: "🇫🇷", country: "France",       c2000: "€143",       c2010: "€174",     c2024: "€175",       change: "+22%",   note: "Droits d'inscription" },
                  { flag: "🇨🇭", country: "Switzerland",  c2000: "Fr 1,160",   c2010: "Fr 1,160", c2024: "Fr 1,460",   change: "+26%",   note: "ETH Zurich annual" },
                  { flag: "🇯🇵", country: "Japan",        c2000: "¥478,800",   c2010: "¥535,800", c2024: "¥535,800",   change: "+12%",   note: "National univ. standard" },
                  { flag: "🇳🇿", country: "New Zealand",  c2000: "NZ$3,200",   c2010: "NZ$5,050", c2024: "NZ$7,050",   change: "+120%",  note: "Avg domestic EFTS" },
                ].map(row => (
                  <tr key={row.country} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="mr-2">{row.flag}</span>
                      <span className="font-medium">{row.country}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{row.note}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{row.c2000}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{row.c2010}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{row.c2024}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${
                      row.change === "Free" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                    }`}>{row.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-muted/20 border-t border-border">
            <p className="text-xs text-muted-foreground">All nominal figures. Sources: NCES, UK Parliament, Statistics Canada, Study Assist, DUO, MESRI, ETH Zurich, MEXT, MOE NZ. Figures are indicative benchmarks.</p>
          </div>
        </div>

        {/* ─── How to use ─────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">How to Use This Calculator</h2>
          </div>
          <div className="p-5">
            <ol className="space-y-3">
              {[
                { n: "1", title: "Select your currency",    text: "Choose from USD, GBP, EUR, CAD, AUD, CHF, JPY, or NZD. The calculator auto-populates tuition benchmarks for that country." },
                { n: "2", title: "Set your year range",     text: "Use the quick presets or manually select your start and end year. The longer the period, the more pronounced the compounding effect." },
                { n: "3", title: "Enter tuition amounts",   text: "The fields auto-fill from official benchmarks for your country. Override with your actual tuition costs for the most accurate personal result." },
                { n: "4", title: "Read your results",       text: "See total % rise, annualized CAGR, comparison against official Education CPI, your inflation tax, and 5/10-year projections." },
                { n: "5", title: "Explore the chart",       text: "The line chart shows what your tuition would cost if it only grew with official Education CPI vs your actual cost." },
              ].map(({ n, title, text }) => (
                <li key={n} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ─── Blog essay ──────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">About Education Inflation</h2>
          </div>
          <div className="px-5 py-5">
            {blogLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-3 bg-muted rounded" style={{ width: `${[92,85,76,60][i-1]}%` }} />)}
              </div>
            ) : (
              <div className="space-y-4">{renderMarkdown(blogContent)}</div>
            )}
          </div>
        </div>

        {/* ─── Data Sources & Methodology ─────────────────────────────────── */}
        <div className="bg-muted/30 border border-border rounded-xl p-5">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <h2 className="font-semibold text-sm">Data Sources &amp; Methodology</h2>
          </div>
          <div className="space-y-4">
            {([
              { flag: "🇺🇸", code: "USD", title: "USD — United States", quality: "solid",
                items: [
                  "Education CPI: BLS Consumer Price Index for All Urban Consumers, series CUSR0000SAE1 (Education), annual averages 1978–2025.",
                  "Tuition prices: NCES IPEDS average published tuition and fees at 4-year institutions (public and private non-profit), 1980–2024.",
                  "Sources: bls.gov, nces.ed.gov/ipeds",
                ]
              },
              { flag: "🇬🇧", code: "GBP", title: "GBP — United Kingdom", quality: "solid",
                items: [
                  "Education CPI: ONS CPIH sub-index D7C5 (CP09 Education), annual series from Consumer Price Inflation tables.",
                  "Tuition fees: UK Parliament records and HESA data. England capped fees: £1,000 (1998), £3,000 (2006), £9,000 (2012), £9,250 (2017–present). Scotland free for Scottish domiciled students.",
                  "Sources: ons.gov.uk, parliament.uk, hesa.ac.uk",
                ]
              },
              { flag: "🇪🇺", code: "EUR", title: "EUR — Eurozone", quality: "solid",
                items: [
                  "Education CPI: Eurostat HICP CP10 Education sub-index (2015=100). Countries covered: EU27, France, Germany, Netherlands, Italy, and others.",
                  "Tuition data: France (MESRI droits d'inscription decrees 2000–2025). Germany (state ministry records, abolished 2014). Netherlands (DUO wettelijk collegegeld 2000–2027). Italy (ANVUR average tasse universitarie, income-based).",
                  "Sources: ec.europa.eu/eurostat, enseignementsup.gouv.fr, duo.nl, anvur.it",
                ]
              },
              { flag: "🇨🇦", code: "CAD", title: "CAD — Canada", quality: "solid",
                items: [
                  "Education CPI: Statistics Canada Table 18-10-0004-01, vector v41691198 (Education sub-component, 2002=100). Monthly data 1973–April 2026. Annual averages computed from monthly values.",
                  "Tuition data: Statistics Canada Table 37-10-0045-01. Average undergraduate tuition by field of study and province, 2006/07–2025/26.",
                  "Sources: statcan.gc.ca tables 18-10-0004-01 and 37-10-0045-01",
                ]
              },
              { flag: "🇦🇺", code: "AUD", title: "AUD — Australia", quality: "solid",
                items: [
                  "Education CPI: ABS Consumer Price Index Catalogue 6401.0 — tertiary education, secondary education, and preschool sub-groups. Quarterly 1980–2025.",
                  "Tuition data: Australian Department of Education (Study Assist). Maximum student contribution (HECS-HELP) by band 1989–2026, including 2021 Job-Ready Graduates Package restructure.",
                  "Sources: abs.gov.au, studyassist.gov.au, legislation.gov.au",
                ]
              },
              { flag: "🇨🇭", code: "CHF", title: "CHF — Switzerland", quality: "solid",
                items: [
                  "Education CPI: Swiss Federal Statistical Office (FSO/BFS) monthly CPI education sub-index, 2005–2025.",
                  "Tuition data: ETH Zurich Registrar semester fee history. CHF 452 (pre-2000) → CHF 580 (2000–2018) → CHF 660 (autumn 2019) → CHF 730 (autumn 2020–present). University of Zurich cantonal fees approximately CHF 1,200–1,540/year.",
                  "Sources: bfs.admin.ch, ethz.ch, uzh.ch",
                ]
              },
              { flag: "🇯🇵", code: "JPY", title: "JPY — Japan", quality: "solid",
                items: [
                  "Education CPI: Statistics Bureau of Japan annual CPI Education sub-index (2020=100), 1970–2025.",
                  "Tuition data: MEXT (Ministry of Education, Culture, Sports, Science and Technology). Standard national university tuition (授業料標準額): free until 1975, rising to ¥535,800 by 2005, frozen since. Admission fee standard ¥282,000 since 2005.",
                  "Sources: stat.go.jp, mext.go.jp",
                ]
              },
              { flag: "🇳🇿", code: "NZD", title: "NZD — New Zealand", quality: "solid",
                items: [
                  "Education CPI: Stats NZ quarterly CPI Group 11 Education (2006Q2–2026Q1). Annual averages computed.",
                  "Tuition data: NZ Ministry of Education (Education Counts). Average domestic fee per EFTS 2000–2024. Fee freeze 2000–2003; FCCM cap from 2004; Fees First Year Free (FFF) policy from 2018.",
                  "Sources: stats.govt.nz, educationcounts.govt.nz, tec.govt.nz",
                ]
              },
            ] as const).map(src => (
              <div key={src.code} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{src.flag}</span>
                  <span className="text-sm font-semibold">{src.title}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium border ${
                    src.quality === "solid"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  }`}>High Confidence</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  {src.items.map((item, i) => (
                    <li key={i}><span className="font-medium text-foreground">{["Education CPI:", "Tuition data:", "Tuition fees:", "Sources:"][i] ?? ""}</span> {item.replace(/^(Education CPI:|Tuition data:|Tuition fees:|Sources:)\s?/, "")}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            All calculations run entirely in your browser. No personal data is stored or transmitted. This calculator is for educational purposes only and does not constitute financial advice. Education CPI indices are rebased to start year = 100 for the comparison chart. Annualized rate uses compound annual growth rate (CAGR) formula.
          </p>
        </div>

        {/* ─── Related calculators ────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-3">Related Calculators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { href: "/",                                label: "Inflation Calculator"         },
              { href: "/deflation-calculator",            label: "Deflation Calculator"         },
              { href: "/energy-inflation-calculator",     label: "Energy Inflation"             },
              { href: "/insurance-inflation-calculator",  label: "Insurance Inflation"          },
              { href: "/shrinkflation-calculator",        label: "Shrinkflation Calculator"     },
              { href: "/student-loan-calculator",         label: "Student Loan Calculator"      },
              { href: "/salary-calculator",               label: "Salary Calculator"            },
              { href: "/budget-calculator",               label: "Budget Calculator"            },
              { href: "/investment-race-calculator",      label: "Investment Race"              },
              { href: "/retirement-calculator",           label: "Retirement Calculator"        },
              { href: "/mortgage-calculator",             label: "Mortgage Calculator"          },
              { href: "/charts",                          label: "Charts & Analytics"           },
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

        {/* ─── FAQ (education category — empty until FAQs are added) ──────── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <FAQ category="education" limit={8} />
        </div>

        {/* ─── Footer ─────────────────────────────────────────────────────── */}
        <footer className="mt-8 bg-gray-900 text-white rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

            {/* Col 1 */}
            <div>
              <h3 className="text-xl font-bold mb-3">Education Inflation Calculator</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Track how the cost of university education has risen against official CPI across 8 currencies — USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD. Powered by real data from BLS, ONS, Stats Canada, ABS, MEXT, Eurostat, Swiss FSO, and Stats NZ.
              </p>
            </div>

            {/* Col 2 — Data Sources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• BLS Education CPI CUSR0000SAE1 (USD)</li>
                <li>• ONS CPIH Sub-index D7C5 / CP09 (GBP)</li>
                <li>• Eurostat HICP CP10 Education (EUR)</li>
                <li>• Statistics Canada Table 18-10-0004-01 (CAD)</li>
                <li>• ABS CPI Catalogue 6401.0 (AUD)</li>
                <li>• Swiss FSO CPI Education Sub-index (CHF)</li>
                <li>• Statistics Bureau of Japan CPI (JPY)</li>
                <li>• Stats NZ CPI Group 11 Education (NZD)</li>
                <li>• NCES IPEDS Tuition Database (USD)</li>
                <li>• MEXT Standard University Fee (JPY)</li>
                <li>• Study Assist HECS-HELP Schedule (AUD)</li>
                <li>• DUO Wettelijk Collegegeld (EUR/NL)</li>
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
                  { href: "/shrinkflation-calculator",                         label: "Shrinkflation Calculator"         },
                  { href: "/skimpflation-calculator",                          label: "Skimpflation Calculator"          },
                  { href: "/sneakflation-calculator",                          label: "Sneakflation Calculator"          },
                  { href: "/energy-inflation-calculator",                      label: "Energy Inflation Calculator"      },
                  { href: "/charts",                                           label: "Charts & Analytics"               },
                  { href: "/investment-race-calculator",                       label: "Investment Race Calculator"       },
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
              <p className="text-sm text-gray-500 mt-4">Last Updated: June 2026</p>
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
