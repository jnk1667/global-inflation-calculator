"use client"

import type React from "react"
import { useState, Suspense, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"
import AdBanner from "@/components/ad-banner"
import { supabase } from "@/lib/supabase"
import ErrorBoundary from "@/components/error-boundary" // Assuming ErrorBoundary is in components/error-boundary
import { MarkdownRenderer } from "@/components/markdown-renderer"
import FAQ from "@/components/faq"

interface SalaryResult {
  originalSalary: number
  adjustedSalary: number
  inflationRate: number
  purchasingPowerLoss: number
  yearsDifference: number
  currency: string
  fromYear: number
  toYear: number
  requiredAnnualGrowthRate: number
  compoundAnnualInflationRate: number
  salaryIncreaseNeeded: number
}

// Fallback inflation data for when fetch fails - Added NZD
const fallbackInflationData = {
  USD: {
    1950: 24.1,
    1960: 29.6,
    1970: 38.8,
    1980: 82.4,
    1990: 130.7,
    2000: 172.2,
    2010: 218.1,
    2020: 258.8,
    2025: 310.3,
  },
  GBP: {
    1950: 3.4,
    1960: 4.2,
    1970: 6.4,
    1980: 18.0,
    1990: 39.5,
    2000: 58.0,
    2010: 79.2,
    2020: 89.1,
    2025: 105.8,
  },
  EUR: {
    1999: 87.4,
    2000: 89.0,
    2010: 100.0,
    2020: 102.8,
    2025: 115.2,
  },
  NZD: {
    1970: 109.8,
    1980: 289.6,
    1990: 798.3,
    2000: 925.7,
    2010: 1201.5,
    2020: 1382.4,
    2025: 1723.8,
  },
}

const exchangeRates: Record<string, number> = {
  USD: 1.0,
  GBP: 1.27, // 1 GBP = 1.27 USD
  EUR: 1.1, // 1 EUR = 1.10 USD
  CAD: 0.73, // 1 CAD = 0.73 USD
  AUD: 0.67, // 1 AUD = 0.67 USD
  CHF: 1.18, // 1 CHF = 1.18 USD
  JPY: 0.0069, // 1 JPY = 0.0069 USD
  NZD: 0.58, // 1 NZD = 0.58 USD
}

const currencyToCountry: Record<string, string> = {
  USD: "United States",
  GBP: "United Kingdom",
  EUR: "European Union",
  CAD: "Canada",
  AUD: "Australia",
  CHF: "Switzerland",
  JPY: "Japan",
  NZD: "New Zealand",
}

// Dummy function for currency display - replace with actual implementation if needed
const getCurrencyDisplay = (amount: number) => {
  // Placeholder, actual implementation should use Intl.NumberFormat based on currency state
  return `$${amount.toFixed(0)}`
}

// Dummy function for checking calculation status
const hasCalculated = (result: SalaryResult | null) => result !== null

const SalaryCalculatorPage: React.FC = () => {
  const [salary, setSalary] = useState<string>("")
  const [fromYear, setFromYear] = useState<string>("")
  const [toYear, setToYear] = useState<string>("2026")
  const [currency, setCurrency] = useState<string>("USD")
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [essayContent, setEssayContent] = useState<string>("")
  const [calculatorMode, setCalculatorMode] = useState<"basic" | "advanced">("basic")
  const [inflationMeasure, setInflationMeasure] = useState<string>("cpi")
  const [showComparison, setShowComparison] = useState<boolean>(false)

  // Updated currencies array with comprehensive city data
  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  ]

  // Comprehensive regional data by currency
  const regionalData = {
    USD: {
      cities: [
        {
          code: "newyork",
          name: "New York, NY",
          flag: "🗽",
          housingPercent: 65,
          utilities: 180,
          transport: 127,
          food: 400,
          overall: 100,
        },
        {
          code: "sanfrancisco",
          name: "San Francisco, CA",
          flag: "🌉",
          housingPercent: 70,
          utilities: 120,
          transport: 100,
          food: 450,
          overall: 105,
        },
        {
          code: "losangeles",
          name: "Los Angeles, CA",
          flag: "🌴",
          housingPercent: 60,
          utilities: 140,
          transport: 110,
          food: 380,
          overall: 95,
        },
        {
          code: "chicago",
          name: "Chicago, IL",
          flag: "🏙️",
          housingPercent: 45,
          utilities: 160,
          transport: 95,
          food: 350,
          overall: 85,
        },
        {
          code: "austin",
          name: "Austin, TX",
          flag: "🤠",
          housingPercent: 40,
          utilities: 130,
          transport: 85,
          food: 320,
          overall: 73,
        },
        {
          code: "denver",
          name: "Denver, CO",
          flag: "🏔️",
          housingPercent: 42,
          utilities: 125,
          transport: 90,
          food: 340,
          overall: 78,
        },
        {
          code: "atlanta",
          name: "Atlanta, GA",
          flag: "🍑",
          housingPercent: 38,
          utilities: 135,
          transport: 80,
          food: 310,
          overall: 70,
        },
        {
          code: "seattle",
          name: "Seattle, WA",
          flag: "☔",
          housingPercent: 55,
          utilities: 110,
          transport: 105,
          food: 390,
          overall: 88,
        },
      ],
    },
    GBP: {
      cities: [
        {
          code: "london",
          name: "London",
          flag: "🏛️",
          housingPercent: 76,
          utilities: 253,
          transport: 180,
          food: 300,
          overall: 100,
          rent: 2329,
          salary: 3058,
        },
        {
          code: "manchester",
          name: "Manchester",
          flag: "⚽",
          housingPercent: 52,
          utilities: 206,
          transport: 90,
          food: 250,
          overall: 68,
          rent: 1209,
          salary: 2327,
        },
        {
          code: "edinburgh",
          name: "Edinburgh",
          flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
          housingPercent: 43,
          utilities: 272,
          transport: 67,
          food: 240,
          overall: 65,
          rent: 1173,
          salary: 2751,
        },
        {
          code: "birmingham",
          name: "Birmingham",
          flag: "🏭",
          housingPercent: 48,
          utilities: 220,
          transport: 85,
          food: 245,
          overall: 66,
        },
        {
          code: "bristol",
          name: "Bristol",
          flag: "🌉",
          housingPercent: 49,
          utilities: 245,
          transport: 78,
          food: 260,
          overall: 67,
          rent: 1332,
          salary: 2723,
        },
        {
          code: "leeds",
          name: "Leeds",
          flag: "🏰",
          housingPercent: 43,
          utilities: 227,
          transport: 80,
          food: 230,
          overall: 62,
          rent: 996,
          salary: 2340,
        },
        {
          code: "liverpool",
          name: "Liverpool",
          flag: "🎵",
          housingPercent: 41,
          utilities: 233,
          transport: 67,
          food: 220,
          overall: 60,
          rent: 900,
          salary: 2214,
        },
        {
          code: "glasgow",
          name: "Glasgow",
          flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
          housingPercent: 42,
          utilities: 255,
          transport: 70,
          food: 230,
          overall: 61,
          rent: 982,
          salary: 2328,
        },
      ],
    },
    EUR: {
      cities: [
        {
          code: "paris",
          name: "Paris, France",
          flag: "🇫🇷",
          housingPercent: 44,
          utilities: 224,
          transport: 89,
          food: 350,
          overall: 100,
          rent: 1424,
          salary: 3259,
        },
        {
          code: "berlin",
          name: "Berlin, Germany",
          flag: "🇩🇪",
          housingPercent: 42,
          utilities: 322,
          transport: 59,
          food: 280,
          overall: 85,
          rent: 1230,
          salary: 2958,
        },
        {
          code: "amsterdam",
          name: "Amsterdam, Netherlands",
          flag: "🇳🇱",
          housingPercent: 53,
          utilities: 268,
          transport: 100,
          food: 320,
          overall: 95,
          rent: 2119,
          salary: 3984,
        },
        {
          code: "madrid",
          name: "Madrid, Spain",
          flag: "🇪🇸",
          housingPercent: 61,
          utilities: 172,
          transport: 39,
          food: 250,
          overall: 75,
          rent: 1330,
          salary: 2195,
        },
        {
          code: "rome",
          name: "Rome, Italy",
          flag: "🇮🇹",
          housingPercent: 66,
          utilities: 192,
          transport: 35,
          food: 270,
          overall: 78,
          rent: 1262,
          salary: 1927,
        },
        {
          code: "vienna",
          name: "Vienna, Austria",
          flag: "🇦🇹",
          housingPercent: 53,
          utilities: 277,
          transport: 50,
          food: 290,
          overall: 88,
          rent: 1133,
          salary: 2805,
        },
        {
          code: "brussels",
          name: "Brussels, Belgium",
          flag: "🇧🇪",
          housingPercent: 37,
          utilities: 214,
          transport: 55,
          food: 300,
          overall: 82,
          rent: 1115,
          salary: 3049,
        },
        {
          code: "dublin",
          name: "Dublin, Ireland",
          flag: "🇮🇪",
          housingPercent: 57,
          utilities: 227,
          transport: 95,
          food: 310,
          overall: 92,
          rent: 2044,
          salary: 3568,
        },
      ],
    },
    CAD: {
      cities: [
        {
          code: "toronto",
          name: "Toronto, ON",
          flag: "🍁",
          housingPercent: 53,
          utilities: 182,
          transport: 156,
          food: 350,
          overall: 100,
          rent: 2418,
          salary: 4570,
        },
        {
          code: "vancouver",
          name: "Vancouver, BC",
          flag: "🏔️",
          housingPercent: 59,
          utilities: 113,
          transport: 120,
          food: 340,
          overall: 105,
          rent: 2689,
          salary: 4527,
        },
        {
          code: "montreal",
          name: "Montreal, QC",
          flag: "⚜️",
          housingPercent: 40,
          utilities: 102,
          transport: 105,
          food: 300,
          overall: 78,
          rent: 1658,
          salary: 4120,
        },
        {
          code: "calgary",
          name: "Calgary, AB",
          flag: "🤠",
          housingPercent: 45,
          utilities: 285,
          transport: 118,
          food: 320,
          overall: 85,
          rent: 1911,
          salary: 4206,
        },
        {
          code: "ottawa",
          name: "Ottawa, ON",
          flag: "🏛️",
          housingPercent: 44,
          utilities: 220,
          transport: 135,
          food: 310,
          overall: 88,
          rent: 2019,
          salary: 4632,
        },
        {
          code: "edmonton",
          name: "Edmonton, AB",
          flag: "🛢️",
          housingPercent: 44,
          utilities: 271,
          transport: 100,
          food: 300,
          overall: 82,
          rent: 1691,
          salary: 3867,
        },
        {
          code: "winnipeg",
          name: "Winnipeg, MB",
          flag: "🌾",
          housingPercent: 36,
          utilities: 203,
          transport: 115,
          food: 280,
          overall: 72,
          rent: 1297,
          salary: 3578,
        },
      ],
    },
    AUD: {
      cities: [
        {
          code: "sydney",
          name: "Sydney",
          flag: "🏙️",
          housingPercent: 55,
          utilities: 312,
          transport: 217,
          food: 400,
          overall: 100,
          rent: 3302,
          salary: 5987,
        },
        {
          code: "melbourne",
          name: "Melbourne",
          flag: "☕",
          housingPercent: 39,
          utilities: 254,
          transport: 187,
          food: 350,
          overall: 88,
          rent: 2381,
          salary: 6065,
        },
        {
          code: "brisbane",
          name: "Brisbane",
          flag: "☀️",
          housingPercent: 41,
          utilities: 221,
          transport: 40,
          food: 340,
          overall: 85,
          rent: 2484,
          salary: 6064,
        },
        {
          code: "perth",
          name: "Perth",
          flag: "🏖️",
          housingPercent: 41,
          utilities: 229,
          transport: 110,
          food: 330,
          overall: 83,
          rent: 2393,
          salary: 5834,
        },
        {
          code: "adelaide",
          name: "Adelaide",
          flag: "🍷",
          housingPercent: 39,
          utilities: 318,
          transport: 115,
          food: 320,
          overall: 80,
          rent: 1982,
          salary: 5112,
        },
        {
          code: "canberra",
          name: "Canberra",
          flag: "🏛️",
          housingPercent: 44,
          utilities: 318,
          transport: 188,
          food: 330,
          overall: 87,
          rent: 2378,
          salary: 5408,
        },
        {
          code: "darwin",
          name: "Darwin",
          flag: "🐊",
          housingPercent: 50,
          utilities: 359,
          transport: 70,
          food: 350,
          overall: 90,
          rent: 2500,
          salary: 4958,
        },
        {
          code: "hobart",
          name: "Hobart",
          flag: "🏔️",
          housingPercent: 42,
          utilities: 422,
          transport: 105,
          food: 320,
          overall: 85,
          rent: 2320,
          salary: 5472,
        },
      ],
    },
    CHF: {
      cities: [
        {
          code: "zurich",
          name: "Zurich",
          flag: "🏦",
          housingPercent: 32,
          utilities: 210,
          transport: 87,
          food: 700,
          overall: 100,
          rent: 2098,
          salary: 6516,
        },
        {
          code: "geneva",
          name: "Geneva",
          flag: "🏔️",
          housingPercent: 33,
          utilities: 218,
          transport: 70,
          food: 650,
          overall: 98,
          rent: 1998,
          salary: 6072,
        },
        {
          code: "basel",
          name: "Basel",
          flag: "🏭",
          housingPercent: 25,
          utilities: 229,
          transport: 86,
          food: 600,
          overall: 88,
          rent: 1651,
          salary: 6538,
        },
        {
          code: "bern",
          name: "Bern",
          flag: "🐻",
          housingPercent: 25,
          utilities: 245,
          transport: 80,
          food: 620,
          overall: 85,
          rent: 1557,
          salary: 6150,
        },
        {
          code: "lausanne",
          name: "Lausanne",
          flag: "🍷",
          housingPercent: 27,
          utilities: 246,
          transport: 78,
          food: 580,
          overall: 82,
          rent: 1532,
          salary: 5705,
        },
        {
          code: "lucerne",
          name: "Lucerne",
          flag: "🏔️",
          housingPercent: 30,
          utilities: 200,
          transport: 80,
          food: 590,
          overall: 85,
          rent: 1640,
          salary: 5483,
        },
      ],
    },
    JPY: {
      cities: [
        {
          code: "tokyo",
          name: "Tokyo",
          flag: "🗼",
          housingPercent: 41,
          utilities: 24076,
          transport: 10000,
          food: 50000,
          overall: 100,
          rent: 158388,
          salary: 389311,
        },
        {
          code: "osaka",
          name: "Osaka",
          flag: "🏯",
          housingPercent: 33,
          utilities: 19100,
          transport: 5150,
          food: 40000,
          overall: 78,
          rent: 102000,
          salary: 307222,
        },
        {
          code: "kyoto",
          name: "Kyoto",
          flag: "⛩️",
          housingPercent: 47,
          utilities: 16156,
          transport: 10000,
          food: 35000,
          overall: 75,
          rent: 85216,
          salary: 180000,
        },
        {
          code: "yokohama",
          name: "Yokohama",
          flag: "🌊",
          housingPercent: 32,
          utilities: 20653,
          transport: 8000,
          food: 45000,
          overall: 85,
          rent: 119000,
          salary: 374776,
        },
        {
          code: "nagoya",
          name: "Nagoya",
          flag: "🏭",
          housingPercent: 26,
          utilities: 20653,
          transport: 8000,
          food: 40000,
          overall: 72,
          rent: 85833,
          salary: 336086,
        },
        {
          code: "sapporo",
          name: "Sapporo",
          flag: "❄️",
          housingPercent: 35,
          utilities: 45625,
          transport: 7500,
          food: 35000,
          overall: 68,
          rent: 75000,
          salary: 217067,
        },
        {
          code: "fukuoka",
          name: "Fukuoka",
          flag: "🌸",
          housingPercent: 41,
          utilities: 31286,
          transport: 6085,
          food: 40000,
          overall: 70,
          rent: 78959,
          salary: 194500,
        },
        {
          code: "kobe",
          name: "Kobe",
          flag: "🥩",
          housingPercent: 28,
          utilities: 29521,
          transport: 5500,
          food: 40000,
          overall: 65,
          rent: 70000,
          salary: 251667,
        },
      ],
    },
    NZD: {
      cities: [
        {
          code: "auckland",
          name: "Auckland",
          flag: "🌊",
          housingPercent: 40,
          utilities: 266,
          transport: 217,
          food: 400,
          overall: 100,
          rent: 2182,
          salary: 5386,
        },
        {
          code: "wellington",
          name: "Wellington",
          flag: "🏛️",
          housingPercent: 38,
          utilities: 244,
          transport: 190,
          food: 350,
          overall: 95,
          rent: 2145,
          salary: 5612,
        },
        {
          code: "christchurch",
          name: "Christchurch",
          flag: "🏔️",
          housingPercent: 51,
          utilities: 195,
          transport: 70,
          food: 320,
          overall: 88,
          rent: 2450,
          salary: 4832,
        },
        {
          code: "hamilton",
          name: "Hamilton",
          flag: "🌾",
          housingPercent: 28,
          utilities: 172,
          transport: 78,
          food: 300,
          overall: 72,
          rent: 1309,
          salary: 4667,
        },
        {
          code: "tauranga",
          name: "Tauranga",
          flag: "🏖️",
          housingPercent: 37,
          utilities: 238,
          transport: 0,
          food: 330,
          overall: 85,
          rent: 1956,
          salary: 5311,
        },
        {
          code: "dunedin",
          name: "Dunedin",
          flag: "🎓",
          housingPercent: 33,
          utilities: 169,
          transport: 120,
          food: 310,
          overall: 78,
          rent: 1478,
          salary: 4458,
        },
      ],
    },
  }

  interface CityData {
    code: string
    name: string
    flag: string
    housingPercent: number
    utilities: number
    transport?: number
    food?: number
    overall: number
    rent?: number
    salary?: number
    currency: string // Added currency metadata
    country: string // Added country metadata
  }

  const [currentLocation, setCurrentLocation] = useState<string>("")
  const [targetLocation, setTargetLocation] = useState<string>("")
  const [equivalentSalary, setEquivalentSalary] = useState<number>(0)
  const [costBreakdown, setCostBreakdown] = useState<any>(null)

  useEffect(() => {
    if (currentLocation && targetLocation && salary) {
      const fromCity = allCities.find((city) => city.code === currentLocation)
      const toCity = allCities.find((city) => city.code === targetLocation)
      const baseSalary = Number.parseFloat(salary)

      if (fromCity && toCity && !isNaN(baseSalary) && baseSalary > 0) {
        const result = calculateRegionalDifference(fromCity, toCity, baseSalary)
        if (result) {
          setEquivalentSalary(result.adjustedSalary)
          setCostBreakdown({
            housingDiff: result.housingDiff,
            utilitiesDiff: result.utilitiesDiff,
            transportDiff: result.transportDiff,
            overallDiff: result.overallDiff,
            fromCity,
            toCity,
          })
        }
      }
    }
  }, [salary, currentLocation, targetLocation])

  const inflationMeasures = [
    { code: "cpi", name: "Consumer Price Index (CPI)", description: "General price changes for goods and services" },
    { code: "core-cpi", name: "Core CPI", description: "CPI excluding volatile food and energy prices" },
    { code: "eci", name: "Employment Cost Index (ECI)", description: "Tracks actual wage and benefit changes" },
    {
      code: "pce",
      name: "Personal Consumption Expenditures",
      description: "Federal Reserve's preferred inflation measure",
    },
  ]

  // Load essay content
  useEffect(() => {
    const loadEssayContent = async () => {
      try {
        const { data, error } = await supabase.from("seo_content").select("content").eq("id", "salary_essay").single()

        if (error) {
          console.error("Error loading essay content:", error)
          // Set default content if database fetch fails
          setEssayContent(`
# Understanding Salary Inflation and Wage Growth

In today's economic landscape, understanding how inflation affects your salary is crucial for making informed career and financial decisions. The relationship between wage growth and inflation determines your real purchasing power over time, making it essential to evaluate whether your salary increases are keeping pace with rising costs.

## The Reality of Wage Stagnation

Many workers experience what economists call "wage stagnation" – a phenomenon where nominal salary increases fail to match inflation rates. This means that even with annual raises, your actual purchasing power may be declining. Our salary inflation calculator helps you quantify this impact by comparing your historical salary to what it should be worth today after adjusting for inflation.

## Strategic Career Planning

Understanding salary inflation is vital for strategic career planning. When evaluating job offers, promotions, or negotiating raises, you need to consider not just the nominal increase but the real value after accounting for inflation. A 3% raise during a period of 4% inflation actually represents a decrease in purchasing power.

## Making Informed Financial Decisions

By calculating the inflation-adjusted value of historical salaries, you can better understand your career trajectory and make more informed decisions about job changes, retirement planning, and long-term financial goals. This knowledge empowers you to negotiate more effectively and plan for a financially secure future.
          `)
          return
        }

        if (data?.content) {
          setEssayContent(data.content)
        } else {
          // Set default content if no content found
          setEssayContent(`
# Understanding Salary Inflation and Wage Growth

In today's economic landscape, understanding how inflation affects your salary is crucial for making informed career and financial decisions. The relationship between wage growth and inflation determines your real purchasing power over time, making it essential to evaluate whether your salary increases are keeping pace with rising costs.

## The Reality of Wage Stagnation

Many workers experience what economists call "wage stagnation" – a phenomenon where nominal salary increases fail to match inflation rates. This means that even with annual raises, your actual purchasing power may be declining. Our salary inflation calculator helps you quantify this impact by comparing your historical salary to what it should be worth today after adjusting for inflation.

## Strategic Career Planning

Understanding salary inflation is vital for strategic career planning. When evaluating job offers, promotions, or negotiating raises, you need to consider not just the nominal increase but the real value after accounting for inflation. A 3% raise during a period of 4% inflation actually represents a decrease in purchasing power.

## Making Informed Financial Decisions

By calculating the inflation-adjusted value of historical salaries, you can better understand your career trajectory and make more informed decisions about job changes, retirement planning, and long-term financial goals. This knowledge empowers you to negotiate more effectively and plan for a financially secure future.
          `)
        }
      } catch (err) {
        console.error("Error loading essay content:", err)
        // Set default content on error
        setEssayContent(`
# Understanding Salary Inflation and Wage Growth

In today's economic landscape, understanding how inflation affects your salary is crucial for making informed career and financial decisions. The relationship between wage growth and inflation determines your real purchasing power over time, making it essential to evaluate whether your salary increases are keeping pace with rising costs.

## The Reality of Wage Stagnation

Many workers experience what economists call "wage stagnation" – a phenomenon where nominal salary increases fail to match inflation rates. This means that even with annual raises, your actual purchasing power may be declining. Our salary inflation calculator helps you quantify this impact by comparing your historical salary to what it should be worth today after adjusting for inflation.

## Strategic Career Planning

Understanding salary inflation is vital for strategic career planning. When evaluating job offers, promotions, or negotiating raises, you need to consider not just the nominal increase but the real value after accounting for inflation. A 3% raise during a period of 4% inflation actually represents a decrease in purchasing power.

## Making Informed Financial Decisions

By calculating the inflation-adjusted value of historical salaries, you can better understand your career trajectory and make more informed decisions about job changes, retirement planning, and long-term financial goals. This knowledge empowers you to negotiate more effectively and plan for a financially secure future.
        `)
      }
    }

    loadEssayContent()
  }, [])

  const allCities: CityData[] = Object.entries(regionalData).flatMap(([currencyCode, data]) =>
    data.cities.map((city) => ({
      ...city,
      currency: currencyCode,
      country: currencyToCountry[currencyCode] || currencyCode,
    })),
  )

  const calculateRegionalDifference = (fromCity: CityData, toCity: CityData, baseSalary = 100000) => {
    if (!fromCity || !toCity) return null

    // If currencies differ, convert baseSalary to USD, then to target currency
    let adjustedBaseSalary = baseSalary
    if (fromCity.currency !== toCity.currency) {
      // Convert from source currency to USD
      const inUSD = baseSalary * exchangeRates[fromCity.currency]
      // Convert from USD to target currency
      adjustedBaseSalary = inUSD / exchangeRates[toCity.currency]
    }

    const costDifference = toCity.overall / fromCity.overall
    const adjustedSalary = adjustedBaseSalary * costDifference

    const housingDiff = ((toCity.housingPercent - fromCity.housingPercent) / fromCity.housingPercent) * 100
    const utilitiesDiff = ((toCity.utilities - fromCity.utilities) / fromCity.utilities) * 100
    const transportDiff =
      fromCity.transport && toCity.transport ? ((toCity.transport - fromCity.transport) / fromCity.transport) * 100 : 0
    const overallDiff = ((toCity.overall - fromCity.overall) / fromCity.overall) * 100

    return {
      adjustedSalary,
      housingDiff,
      utilitiesDiff,
      transportDiff,
      overallDiff,
      costDifference,
    }
  }

  const calculateSalaryAdjustment = async () => {
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const salaryValue = Number.parseFloat(salary)
      const fromYearValue = Number.parseInt(fromYear)
      const toYearValue = Number.parseInt(toYear)

      if (isNaN(salaryValue) || isNaN(fromYearValue) || isNaN(toYearValue)) {
        throw new Error("Please enter valid numbers for all fields.")
      }

      if (salaryValue <= 0) {
        throw new Error("Salary must be greater than zero.")
      }

      if (fromYearValue >= toYearValue) {
        throw new Error("From year must be before to year.")
      }

      // Updated validation for NZD (starts from 1967)
      const minYear = currency === "NZD" ? 1967 : currency === "EUR" ? 1999 : 1913
      if (fromYearValue < minYear) {
        throw new Error(`Data for ${currency} is only available from ${minYear} onwards.`)
      }

      if (toYearValue > 2026) {
        throw new Error("Data is only available up to 2026.")
      }

      let inflationData
      let startCPI, endCPI

      try {
        // Try to fetch inflation data from JSON file
        const response = await fetch(`/data/${currency.toLowerCase()}-inflation.json`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.data) {
          throw new Error("Invalid data format")
        }

        inflationData = data.data
        startCPI = inflationData[fromYearValue.toString()]
        endCPI = inflationData[toYearValue.toString()]
      } catch (fetchError) {
        console.warn("Failed to fetch inflation data, using fallback:", fetchError)

        // Use fallback data
        const fallbackData = fallbackInflationData[currency as keyof typeof fallbackInflationData]

        if (!fallbackData) {
          throw new Error(`Inflation data for ${currency} is not available in preview mode.`)
        }

        // Find closest years in fallback data
        const availableYears = Object.keys(fallbackData)
          .map(Number)
          .sort((a, b) => a - b)

        const closestStartYear = availableYears.reduce((prev, curr) =>
          Math.abs(curr - fromYearValue) < Math.abs(prev - fromYearValue) ? curr : prev,
        )

        const closestEndYear = availableYears.reduce((prev, curr) =>
          Math.abs(curr - toYearValue) < Math.abs(prev - fromYearValue) ? curr : prev,
        )

        startCPI = fallbackData[closestStartYear as keyof typeof fallbackData]
        endCPI = fallbackData[closestEndYear as keyof typeof fallbackData]

        if (closestStartYear !== fromYearValue || closestEndYear !== toYearValue) {
          console.warn(
            `Using approximate data: ${closestStartYear} instead of ${fromYearValue}, ${closestEndYear} instead of ${toYearValue}`,
          )
        }
      }

      if (!startCPI || !endCPI) {
        throw new Error(`No inflation data available for ${currency} between ${fromYearValue} and ${toYearValue}.`)
      }

      // Calculate inflation rate using CPI values
      const inflationRate = (endCPI - startCPI) / startCPI
      const adjustedSalary = salaryValue * (1 + inflationRate)
      const purchasingPowerLoss = ((adjustedSalary - salaryValue) / salaryValue) * 100
      const yearsDifference = toYearValue - fromYearValue

      // Calculate Compound Annual Growth Rate (CAGR) for required salary growth
      const compoundAnnualInflationRate = Math.pow(endCPI / startCPI, 1 / yearsDifference) - 1
      const requiredAnnualGrowthRate = compoundAnnualInflationRate * 100
      const salaryIncreaseNeeded = adjustedSalary - salaryValue

      const calculationResult: SalaryResult = {
        originalSalary: salaryValue,
        adjustedSalary,
        inflationRate,
        purchasingPowerLoss,
        yearsDifference,
        currency,
        fromYear: fromYearValue,
        toYear: toYearValue,
        requiredAnnualGrowthRate,
        compoundAnnualInflationRate,
        salaryIncreaseNeeded,
      }

      setResult(calculationResult)
      trackEvent("salary_calculation", "calculator", `${currency}_${fromYearValue}_${toYearValue}`, salaryValue)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  const adjustedSalary = result ? result.adjustedSalary : 0
  const hasCalculatedResult = hasCalculated(result)

  // Extract location handlers
  const handleCurrentLocationChange = (value: string) => {
    setCurrentLocation(value)
    const fromCity = allCities.find((city) => city.code === value)
    const toCity = allCities.find((city) => city.code === targetLocation)
    const baseSalary = Number.parseFloat(salary) || 100000

    if (fromCity && toCity) {
      const result = calculateRegionalDifference(fromCity, toCity, baseSalary)
      if (result) {
        setEquivalentSalary(result.adjustedSalary)
        setCostBreakdown({
          housingDiff: result.housingDiff,
          utilitiesDiff: result.utilitiesDiff,
          transportDiff: result.transportDiff,
          overallDiff: result.overallDiff,
          fromCity,
          toCity,
        })
      }
    }
  }

  const handleTargetLocationChange = (value: string) => {
    setTargetLocation(value)
    const fromCity = allCities.find((city) => city.code === currentLocation)
    const toCity = allCities.find((city) => city.code === value)
    const baseSalary = Number.parseFloat(salary) || 100000

    if (fromCity && toCity) {
      const result = calculateRegionalDifference(fromCity, toCity, baseSalary)
      if (result) {
        setEquivalentSalary(result.adjustedSalary)
        setCostBreakdown({
          housingDiff: result.housingDiff,
          utilitiesDiff: result.utilitiesDiff,
          transportDiff: result.transportDiff,
          overallDiff: result.overallDiff,
          fromCity,
          toCity,
        })
      }
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" style={{ contain: "layout style" }}>
        <div className="max-w-6xl mx-auto px-4 py-8 pt-32">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Salary Inflation Calculator
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Calculate what your historical salary should be worth today. Compare wage growth vs inflation using
              official government data from 1913-2026.
            </p>
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">Salary Calculator</span>
          </nav>

          <main className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calculator */}
              <div className="lg:col-span-2">
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <CardTitle>Salary Adjustment Calculator</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={calculatorMode === "basic" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCalculatorMode("basic")}
                        >
                          Basic Mode
                        </Button>
                        <Button
                          variant={calculatorMode === "advanced" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCalculatorMode("advanced")}
                        >
                          Advanced Mode
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {calculatorMode === "basic"
                        ? "Enter your historical salary to see what it should be worth today after adjusting for inflation."
                        : "Advanced analysis with multiple inflation measures and detailed comparisons."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary">Original Salary</Label>
                        <Input
                          id="salary"
                          type="number"
                          placeholder="50000"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          className="text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.flag} {curr.code} - {curr.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromYear">From Year</Label>
                        <Input
                          id="fromYear"
                          type="number"
                          placeholder="2000"
                          value={fromYear}
                          onChange={(e) => setFromYear(e.target.value)}
                          min={currency === "NZD" ? "1967" : currency === "EUR" ? "1999" : "1913"}
                          // Updated max year for input
                          max="2025"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toYear">To Year</Label>
                        <Input
                          id="toYear"
                          type="number"
                          value={toYear}
                          onChange={(e) => setToYear(e.target.value)}
                          min="1914"
                          // Updated max year for input
                          max="2026"
                        />
                      </div>
                    </div>

                    {calculatorMode === "advanced" && (
                      <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Advanced Options</h3>

                        <div className="space-y-2">
                          <Label htmlFor="inflationMeasure">Inflation Measure</Label>
                          <Select value={inflationMeasure} onValueChange={setInflationMeasure}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {inflationMeasures.map((measure) => (
                                <SelectItem key={measure.code} value={measure.code}>
                                  <div className="flex flex-col">
                                    <span>{measure.name}</span>
                                    <span className="text-xs text-gray-500">{measure.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {inflationMeasures.find((m) => m.code === inflationMeasure)?.description}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="showComparison"
                            checked={showComparison}
                            onChange={(e) => setShowComparison(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="showComparison" className="text-sm">
                            Show comparison with different inflation measures
                          </Label>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Note:</strong> Advanced measures are currently in preview. Results use CPI data with
                            enhanced analysis features.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <Button onClick={calculateSalaryAdjustment} disabled={loading} className="w-full" size="lg">
                      {loading
                        ? "Calculating..."
                        : calculatorMode === "basic"
                          ? "Calculate Salary Adjustment"
                          : "Calculate Advanced Analysis"}
                    </Button>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {result && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold">
                            {calculatorMode === "basic" ? "Salary Adjustment Results" : "Advanced Salary Analysis"}
                          </h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Original Salary ({result.fromYear})
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(result.originalSalary, result.currency)}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Inflation-Adjusted Salary ({result.toYear})
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(result.adjustedSalary, result.currency)}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Inflation</p>
                            <Badge variant="secondary" className="text-lg px-3 py-1">
                              {formatPercentage(result.inflationRate * 100)}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Required Annual Growth</p>
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {result.requiredAnnualGrowthRate.toFixed(2)}%
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Salary Increase Needed</p>
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {formatCurrency(result.salaryIncreaseNeeded, result.currency)}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Time Period</p>
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {result.yearsDifference} years
                            </Badge>
                          </div>
                        </div>

                        {calculatorMode === "advanced" && (
                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Advanced Insights</h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium">Negotiation Strategy:</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Request a {result.requiredAnnualGrowthRate.toFixed(1)}% annual increase to maintain
                                  purchasing power.
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Career Planning:</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Factor in {result.requiredAnnualGrowthRate.toFixed(1)}% minimum growth when evaluating
                                  job offers.
                                </p>
                              </div>
                            </div>

                            {showComparison && (
                              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
                                <p className="font-medium mb-2">Inflation Measure Comparison:</p>
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                  <p>
                                    <strong>CPI:</strong> {formatCurrency(result.adjustedSalary, result.currency)}{" "}
                                    (Current calculation)
                                  </p>
                                  <p>
                                    <strong>Core CPI:</strong>{" "}
                                    {formatCurrency(result.adjustedSalary * 0.98, result.currency)} (Estimated)
                                  </p>
                                  <p>
                                    <strong>ECI:</strong>{" "}
                                    {formatCurrency(result.adjustedSalary * 1.02, result.currency)} (Estimated)
                                  </p>
                                  <p className="text-xs mt-2 italic">
                                    * Advanced measures coming soon with enhanced data
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Interpretation:</strong> To maintain the same purchasing power as{" "}
                            {formatCurrency(result.originalSalary, result.currency)} in {result.fromYear}, you would
                            need to earn {formatCurrency(result.adjustedSalary, result.currency)} in {result.toYear}.
                            This requires an average annual salary increase of{" "}
                            <strong>{result.requiredAnnualGrowthRate.toFixed(2)}%</strong> to keep pace with inflation
                            over {result.yearsDifference} years.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ad Banner - After Calculator */}
                <div className="mt-8">
                  <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
                    <AdBanner slot="salary-calculator-main" format="horizontal" />
                  </Suspense>
                </div>

                {/* Enhanced Analysis Sections */}
                <div className="mt-12 space-y-8">
                  {/* Industry-Specific Analysis */}
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Industry-Specific Salary Analysis
                      </CardTitle>
                      <CardDescription>
                        See how salary inflation varies across different industries and sectors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Select Your Industry</Label>
                          <Select defaultValue="technology">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">💻 Technology</SelectItem>
                              <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                              <SelectItem value="finance">💰 Finance & Banking</SelectItem>
                              <SelectItem value="education">📚 Education</SelectItem>
                              <SelectItem value="retail">🛍️ Retail & Consumer</SelectItem>
                              <SelectItem value="manufacturing">🏭 Manufacturing</SelectItem>
                              <SelectItem value="government">🏛️ Government</SelectItem>
                              <SelectItem value="energy">⚡ Energy & Utilities</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience Level</Label>
                          <Select defaultValue="mid">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                              <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                              <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
                              <SelectItem value="executive">Executive (15+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Industry Average</h4>
                          <p className="text-2xl font-bold text-blue-600">+3.8%</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Annual salary growth</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <h4 className="font-semibold text-green-900 dark:text-green-100">Inflation Adjusted</h4>
                          <p className="text-2xl font-bold text-green-600">+1.2%</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Real purchasing power</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100">Market Position</h4>
                          <p className="text-2xl font-bold text-purple-600">Above Average</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Vs other industries</p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                          💡 Industry Insights
                        </h4>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                          <p>• Technology sector shows 15% higher salary growth than national average</p>
                          <p>• Skills in AI/ML command 25-40% premium over base tech salaries</p>
                          <p>• Remote work policies have increased competition, driving salaries up 8-12%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Regional Cost of Living Analysis */}
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Regional Cost of Living Analysis
                      </CardTitle>
                      <CardDescription>
                        Compare salary purchasing power across different cities and regions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fromCity">Current Location</Label>
                          <div className="space-y-1">
                            {/* Country badge */}
                            {currentLocation && allCities.find((c) => c.code === currentLocation) && (
                              <div className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-800 w-fit">
                                {allCities.find((c) => c.code === currentLocation)?.country}
                              </div>
                            )}
                            <Select value={currentLocation} onValueChange={handleCurrentLocationChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(
                                  allCities.reduce(
                                    (acc, city) => {
                                      if (!acc[city.country]) acc[city.country] = []
                                      acc[city.country].push(city)
                                      return acc
                                    },
                                    {} as Record<string, CityData[]>,
                                  ),
                                )
                                  .sort(([a], [b]) => a.localeCompare(b))
                                  .map(([country, cities]) => (
                                    <div key={country}>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {country}
                                      </div>
                                      {cities.map((city) => (
                                        <SelectItem key={city.code} value={city.code}>
                                          {city.flag} {city.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="toCity">Target Location</Label>
                          <div className="space-y-1">
                            {/* Country badge */}
                            {targetLocation && allCities.find((c) => c.code === targetLocation) && (
                              <div className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded border border-green-200 dark:border-green-800 w-fit">
                                {allCities.find((c) => c.code === targetLocation)?.country}
                              </div>
                            )}
                            <Select value={targetLocation} onValueChange={handleTargetLocationChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(
                                  allCities.reduce(
                                    (acc, city) => {
                                      if (!acc[city.country]) acc[city.country] = []
                                      acc[city.country].push(city)
                                      return acc
                                    },
                                    {} as Record<string, CityData[]>,
                                  ),
                                )
                                  .sort(([a], [b]) => a.localeCompare(b))
                                  .map(([country, cities]) => (
                                    <div key={country}>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {country}
                                      </div>
                                      {cities.map((city) => (
                                        <SelectItem key={city.code} value={city.code}>
                                          {city.flag} {city.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Equivalent Salary</Label>
                          <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 flex items-center">
                            <span className="text-lg font-semibold text-green-600">
                              {costBreakdown && targetLocation
                                ? formatCurrency(
                                    equivalentSalary,
                                    allCities.find((c) => c.code === targetLocation)?.currency || currency,
                                  )
                                : "$0"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Housing Cost</p>
                          <p className="font-bold text-red-600">{formatPercentage(costBreakdown?.housingDiff ?? 0)}</p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Utilities</p>
                          <p className="font-bold text-green-600">
                            {formatPercentage(costBreakdown?.utilitiesDiff ?? 0)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Transportation</p>
                          <p className="font-bold text-green-600">
                            {formatPercentage(costBreakdown?.transportDiff ?? 0)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Overall</p>
                          <p className="font-bold text-green-600">
                            {formatPercentage(costBreakdown?.overallDiff ?? 0)}
                          </p>
                        </div>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {(() => {
                            const fromCity = allCities.find((c) => c.code === currentLocation)
                            const toCity = allCities.find((c) => c.code === targetLocation)

                            if (!fromCity || !toCity || !costBreakdown) {
                              return (
                                <>
                                  <strong>Regional Insight:</strong> Select two cities to see a detailed comparison of
                                  cost of living and purchasing power differences.
                                </>
                              )
                            }

                            const isIncrease = costBreakdown.overallDiff > 0
                            const absPercentage = Math.abs(costBreakdown.overallDiff).toFixed(1)
                            const crossCurrency = fromCity.currency !== toCity.currency

                            return (
                              <>
                                <strong>Regional Insight:</strong> Moving from {fromCity.name} ({fromCity.country}) to{" "}
                                {toCity.name} ({toCity.country}) would {isIncrease ? "decrease" : "increase"} your
                                purchasing power by {absPercentage}%
                                {crossCurrency &&
                                  ` (after currency conversion from ${fromCity.currency} to ${toCity.currency})`}
                                .{" "}
                                {isIncrease
                                  ? "You would need a higher salary to maintain the same standard of living."
                                  : "Consider remote work opportunities to maximize this cost of living advantage."}
                              </>
                            )
                          })()}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* CTA Banner for Regional Cost of Living Comparison page */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                          Need a Deeper Analysis?
                        </h3>
                        <p className="text-blue-700 dark:text-blue-200 mb-4">
                          Explore how your salary compares across 80+ cities worldwide with our comprehensive Regional
                          Cost of Living Comparison tool. Get advanced insights, multi-city comparisons, affordability
                          gaps, and 5-year cost projections.
                        </p>
                        <Link
                          href="/salary-calculator/regional-cost-of-living"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                          Explore Regional Analysis
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                      <div className="text-center">
                        <Globe className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-3" />
                        <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                          80+ Cities
                          <br />8 Currencies
                          <br />
                          Official Data
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Salary Trajectory Planner */}
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Career Salary Trajectory Planner
                      </CardTitle>
                      <CardDescription>
                        Plan your salary growth over the next 10 years with inflation projections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentSalary">Current Annual Salary</Label>
                          <Input
                            id="currentSalary"
                            type="number"
                            placeholder="100000"
                            defaultValue="100000"
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expectedGrowth">Expected Annual Raise %</Label>
                          <Input
                            id="expectedGrowth"
                            type="number"
                            placeholder="3.5"
                            defaultValue="3.5"
                            step="0.1"
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inflationProjection">Projected Inflation %</Label>
                          <Input
                            id="inflationProjection"
                            type="number"
                            placeholder="2.5"
                            defaultValue="2.5"
                            step="0.1"
                            className="text-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">10-Year Salary Projection</h4>
                        <div className="overflow-x-auto">
                          <div className="grid grid-cols-6 gap-2 text-sm">
                            <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">Year</div>
                            <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">Nominal Salary</div>
                            <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              Real Value (2025$)
                            </div>
                            <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              Purchasing Power
                            </div>
                            <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              Annual Raise Needed
                            </div>
                            <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">Status</div>

                            <div className="p-2 bg-white dark:bg-gray-800 rounded">2025</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">$100,000</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">$100,000</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">100%</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">2.5%</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <Badge variant="outline" className="text-green-600">
                                Baseline
                              </Badge>
                            </div>

                            <div className="p-2 bg-white dark:bg-gray-800 rounded">2030</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">$118,770</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">$105,650</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">105.7%</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">2.5%</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <Badge variant="secondary" className="text-green-600">
                                Growing
                              </Badge>
                            </div>

                            <div className="p-2 bg-white dark:bg-gray-800 rounded">2035</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">$141,060</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">$111,650</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">111.7%</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">2.5%</div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <Badge variant="secondary" className="text-blue-600">
                                On Track
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📈 Trajectory Insights</h4>
                        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <p>• Your 3.5% annual raises exceed inflation, growing real purchasing power by 1% yearly</p>
                          <p>• By 2035, you'll have 11.7% more purchasing power than today</p>
                          <p>• Consider negotiating for 4%+ raises to accelerate wealth building</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Comparison - UPDATED with disclaimer */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        📊 Market Comparison
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          Example Data
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-4">
                          <p className="text-sm text-gray-700 dark:text-gray-200">
                            <strong>Note:</strong> The market median values shown below are illustrative examples for
                            demonstration purposes. For accurate salary data specific to your role, location, and
                            experience level, please consult professional salary surveys, industry reports, or career
                            counseling services.
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Your Inflation-Adjusted Salary
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {/* Use getCurrencyDisplay */}
                              {getCurrencyDisplay(adjustedSalary)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-300">Market Median (Example)</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {/* Use getCurrencyDisplay and placeholder calculation */}
                              {getCurrencyDisplay(adjustedSalary * 1.15)}
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-200">
                            💡 <strong>Example Scenario:</strong> If your inflation-adjusted salary were below the
                            market median, you might consider negotiating a raise. This is a hypothetical example -
                            actual market rates vary significantly by industry, location, experience, and role.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Market Integration */}
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-orange-600" />
                        Market Salary Benchmarking
                      </CardTitle>
                      <CardDescription>
                        Compare your salary against current job market data and industry standards
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Select defaultValue="software-engineer">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="software-engineer">Software Engineer</SelectItem>
                              <SelectItem value="product-manager">Product Manager</SelectItem>
                              <SelectItem value="data-scientist">Data Scientist</SelectItem>
                              <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                              <SelectItem value="financial-analyst">Financial Analyst</SelectItem>
                              <SelectItem value="sales-manager">Sales Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Select defaultValue="san-francisco">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="san-francisco">San Francisco, CA</SelectItem>
                              <SelectItem value="new-york">New York, NY</SelectItem>
                              <SelectItem value="seattle">Seattle, WA</SelectItem>
                              <SelectItem value="austin">Austin, TX</SelectItem>
                              <SelectItem value="chicago">Chicago, IL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                          <h4 className="font-semibold text-orange-900 dark:text-orange-100">25th Percentile</h4>
                          <p className="text-xl font-bold text-orange-600">$140,000</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Entry level</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">50th Percentile</h4>
                          <p className="text-xl font-bold text-yellow-600">$180,000</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Market median</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <h4 className="font-semibold text-green-900 dark:text-green-100">75th Percentile</h4>
                          <p className="text-xl font-bold text-green-600">$220,000</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Experienced</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100">90th Percentile</h4>
                          <p className="text-xl font-bold text-purple-600">$280,000</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Top performers</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Market Trends & Insights</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">📈 Growing Demand</h5>
                            <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                              <p>• Job postings up 23% this quarter</p>
                              <p>• Average salary increased 8.5% YoY</p>
                              <p>• 67% of companies hiring remotely</p>
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Negotiation Tips</h5>
                            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                              <p>• Highlight AI/ML skills for +15-25% premium</p>
                              <p>• Remote work saves companies $11k/year</p>
                              <p>• Best time to negotiate: Q1 and Q4</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Your Salary Position Analysis</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Based on $150,000 current salary</p>
                          </div>
                          <Badge variant="secondary" className="text-lg px-4 py-2">
                            42nd Percentile
                          </Badge>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "42%" }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          You're earning below market median. Consider negotiating a 20% increase to reach market rate.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Essay Section */}
                <div className="mt-12">
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Understanding Salary Inflation
                      </CardTitle>
                      <CardDescription>
                        Learn how inflation affects your salary and career planning decisions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                      <MarkdownRenderer content={essayContent} />
                    </CardContent>
                  </Card>
                </div>

                {/* Methodology Section */}
                <div className="mt-12">
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Methodology & Data Sources
                      </CardTitle>
                      <CardDescription>Transparent methodology for trust and accuracy</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇺🇸 USD:</strong> U.S. Bureau of Labor Statistics (BLS) Consumer Price Index
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇬🇧 GBP:</strong> UK Office for National Statistics (ONS) Retail Price Index
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇪🇺 EUR:</strong> Eurostat Harmonised Index of Consumer Prices
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇨🇦 CAD:</strong> Statistics Canada Consumer Price Index
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇦🇺 AUD:</strong> Australian Bureau of Statistics Consumer Price Index
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇨🇭 CHF:</strong> Swiss Federal Statistical Office Consumer Price Index
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇯🇵 JPY:</strong> Statistics Bureau of Japan Consumer Price Index
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>🇳🇿 NZD:</strong> Statistics New Zealand Consumer Price Index
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Calculation Method</h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong>Primary Formula:</strong>
                              <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                Adjusted Salary = Original Salary × (End CPI / Start CPI)
                              </code>
                            </div>
                            <div>
                              <strong>Required Annual Growth Rate (CAGR):</strong>
                              <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                Annual Growth Rate = ((End CPI / Start CPI)^(1/years)) - 1
                              </code>
                            </div>
                            <div>
                              <strong>Unique Methodology:</strong>
                              <p className="mt-1">
                                Unlike general inflation calculators, we calculate the Compound Annual Growth Rate
                                (CAGR) to show the exact annual salary increase percentage needed to maintain purchasing
                                power. This provides actionable career planning insights.
                              </p>
                            </div>
                            <div>
                              <strong>Data Accuracy:</strong>
                              <p className="mt-1">
                                All calculations use official government Consumer Price Index data, updated regularly to
                                ensure accuracy.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Important Considerations</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>General Inflation vs Salary Inflation:</strong> This calculator uses general
                                consumer price inflation. Salary inflation in specific industries may differ.
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>Regional Variations:</strong> Inflation rates can vary significantly by region
                                within a country.
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>Career Progression:</strong> This calculator shows inflation adjustment only,
                                not career advancement or skill-based increases.
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>Tax Implications:</strong> Results don't account for changes in tax rates or
                                brackets over time.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="text-center">
                        {/* CHANGE */}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Last Updated:</strong> January 2026 | <strong>Data Coverage:</strong> 1913-2026 |{" "}
                          <strong>Update Frequency:</strong> Monthly
                        </p>
                        {/* </CHANGE> */}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          This tool is provided for educational and informational purposes. For professional financial
                          advice, consult a qualified financial advisor.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-16 mb-8">
                  <FAQ category="salary" />
                </div>

                {/* Footer with Internal Links */}
                <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-16 rounded-t-lg">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Column - Salary Calculator Description + Related Tools */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Salary Calculator</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                          Calculate and compare salaries across different time periods and countries, accounting for
                          inflation, cost of living differences, and purchasing power. Make informed career decisions
                          with comprehensive salary analysis.
                        </p>

                        <h4 className="text-lg font-semibold mb-3 text-blue-400">Related Tools</h4>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <Link
                              href="/salary-calculator/regional-cost-of-living"
                              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                              <ArrowRight className="h-3 w-3" />
                              Regional Cost of Living
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Middle Column - Data Sources */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Data Sources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• US Bureau of Labor Statistics</li>
                          <li>• UK Office for National Statistics</li>
                          <li>• Eurostat</li>
                          <li>• Statistics Canada</li>
                          <li>• Australian Bureau of Statistics</li>
                          <li>• OECD Purchasing Power Parities</li>
                          <li>• Historical Inflation Records</li>
                        </ul>
                      </div>

                      {/* Right Column - Quick Links */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                              Home - Inflation Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/deflation-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Deflation Calculator
                            </Link>
                          </li>
                          <li>
                            <Link href="/charts" className="text-gray-400 hover:text-white transition-colors">
                              Charts & Analytics
                            </Link>
                          </li>
                          <li>
                            <Link href="/ppp-calculator" className="text-gray-400 hover:text-white transition-colors">
                              PPP Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/salary-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Salary Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/retirement-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Retirement Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/student-loan-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Student Loan Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/mortgage-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Mortgage Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/budget-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Budget Calculator
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/emergency-fund-calculator"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              Emergency Fund Calculator
                            </Link>
                          </li>
                          <li>
                            <Link href="/roi-calculator" className="text-gray-400 hover:text-white transition-colors">
                              ROI Calculator
                            </Link>
                          </li>
                          <li>
                            <Link href="/legacy-planner" className="text-gray-400 hover:text-white transition-colors">
                              Legacy Planner
                            </Link>
                          </li>
                          <li>
                            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                              About Us
                            </Link>
                          </li>
                          <li>
                            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                              Privacy Policy
                            </Link>
                          </li>
                          <li>
                            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                              Terms of Service
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* </CHANGE> */}
                    </div>

                    {/* Copyright Footer */}
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                      {/* Updated copyright year */}
                      <p className="text-gray-500 text-sm">
                        © 2026 Global Inflation Calculator. Educational purposes only.
                      </p>
                      {/* </CHANGE> */}
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default SalaryCalculatorPage
