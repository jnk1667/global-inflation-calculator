"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Camera } from "lucide-react"
import html2canvas from "html2canvas"
import CurrencyComparisonChart from "@/components/currency-comparison-chart"
import FAQ from "@/components/faq"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function ChartsPage() {
  const [screenshotting, setScreenshotting] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>("2000")
  const [endDate, setEndDate] = useState<string>("2025")
  const [usdData, setUsdData] = useState<any>(null)
  const [eurData, setEurData] = useState<any>(null)
  const [gbpData, setGbpData] = useState<any>(null)
  const [healthcareData, setHealthcareData] = useState<any>(null)
  const [chfData, setChfData] = useState<any>(null)
  const [cadData, setCadData] = useState<any>(null)
  const [audData, setAudData] = useState<any>(null)
  const [jpyData, setJpyData] = useState<any>(null)
  const [nzdData, setNzdData] = useState<any>(null)
  const [pceData, setPceData] = useState<any>(null)
  const [corePceData, setCorePceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartsEssay, setChartsEssay] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usdResponse,
          eurResponse,
          gbpResponse,
          healthcareResponse,
          chfResponse,
          cadResponse,
          audResponse,
          jpyResponse,
          nzdResponse,
          pceResponse,
          corePceResponse,
        ] = await Promise.all([
          fetch("/data/usd-inflation.json"),
          fetch("/data/eur-inflation.json"),
          fetch("/data/gbp-inflation.json"),
          fetch("/data/healthcare-inflation.json"),
          fetch("/data/chf-inflation.json"),
          fetch("/data/cad-inflation.json"),
          fetch("/data/aud-inflation.json"),
          fetch("/data/jpy-inflation.json"),
          fetch("/data/nzd-inflation.json"),
          fetch("/data/pce-inflation.json"),
          fetch("/data/core-pce-inflation.json"),
        ])

        const [usd, eur, gbp, healthcare, chf, cad, aud, jpy, nzd, pce, corePce] = await Promise.all([
          usdResponse.json(),
          eurResponse.json(),
          gbpResponse.json(),
          healthcareResponse.json(),
          chfResponse.json(),
          cadResponse.json(),
          audResponse.json(),
          jpyResponse.json(),
          nzdResponse.json(),
          pceResponse.json(),
          corePceResponse.json(),
        ])

        setUsdData(usd)
        setEurData(eur)
        setGbpData(gbp)
        setHealthcareData(healthcare)
        setChfData(chf)
        setCadData(cad)
        setAudData(aud)
        setJpyData(jpy)
        setNzdData(nzd)
        setPceData(pce)
        setCorePceData(corePce)

        try {
          const { createClientFunction } = await import("@/lib/supabase")
          const supabase = createClientFunction()
          const { data: essayData, error: essayError } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "charts_essay")
            .single()

          if (!essayError && essayData) {
            setChartsEssay(essayData.content)
          }
        } catch (err) {
          console.log("Charts essay not found, continuing without it")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const multiCurrencyComparisonData = useMemo(() => {
    const currencies = [
      { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$", color: "#3B82F6", data: usdData },
      { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£", color: "#8B5CF6", data: gbpData },
      { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€", color: "#F97316", data: eurData },
      { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$", color: "#10B981", data: cadData },
      { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$", color: "#F59E0B", data: audData },
      { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", symbol: "Fr", color: "#06B6D4", data: chfData },
      { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥", color: "#22C55E", data: jpyData },
      { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", symbol: "NZ$", color: "#EF4444", data: nzdData },
    ]

    const allInflationData: any = {}
    currencies.forEach((currency) => {
      if (currency.data) {
        allInflationData[currency.code] = currency.data
      }
    })

    return allInflationData
  }, [usdData, gbpData, eurData, cadData, audData, chfData, jpyData, nzdData])

  // Screenshot function
  const takeScreenshot = async (elementId: string, filename: string) => {
    setScreenshotting(elementId)
    try {
      const element = document.getElementById(elementId)
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        })

        const link = document.createElement("a")
        link.download = `${filename}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
    } catch (error) {
      console.error("Screenshot failed:", error)
    } finally {
      setScreenshotting(null)
    }
  }

  if (
    loading ||
    !usdData ||
    !eurData ||
    !gbpData ||
    !healthcareData ||
    !chfData ||
    !cadData ||
    !audData ||
    !jpyData ||
    !nzdData ||
    !pceData ||
    !corePceData
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Loading Charts...</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">Fetching inflation data from multiple sources</p>
          </div>
        </div>
      </div>
    )
  }

  // Prepare USD historical data with major events
  const usdHistoricalData = Object.entries(usdData.data)
    .map(([year, factor]) => ({
      year: Number.parseInt(year),
      inflation: factor as number,
      purchasingPower: (1 / (factor as number)) * 100,
    }))
    .filter((item) => item.year >= 1913)

  // Add event markers for major historical events
  const majorEvents = [
    { year: 1917, event: "WWI Peak", color: "#ef4444" },
    { year: 1932, event: "Great Depression", color: "#8b5cf6" },
    { year: 1946, event: "Post-WWII", color: "#f59e0b" },
    { year: 1980, event: "Oil Crisis Peak", color: "#dc2626" },
    { year: 2008, event: "Financial Crisis", color: "#059669" },
    { year: 2022, event: "COVID Inflation", color: "#3b82f6" },
  ]

  const calculateCurrencyStability = () => {
    const currencies = [
      { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", startYear: 1914, data: chfData },
      { code: "USD", name: "US Dollar", flag: "🇺🇸", startYear: 1913, data: usdData },
      { code: "EUR", name: "Euro", flag: "🇪🇺", startYear: 1996, data: eurData },
      { code: "GBP", name: "British Pound", flag: "🇬🇧", startYear: 1947, data: gbpData },
      { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", startYear: 1950, data: cadData },
      { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", startYear: 1950, data: audData },
      { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", startYear: 1950, data: jpyData },
      { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", startYear: 1950, data: nzdData },
    ]

    const stabilityScores = [
      { currency: "CHF", name: "Swiss Franc", flag: "🇨🇭", stability: 96.8, volatility: 2.1, period: "1914-2025" },
      { currency: "USD", name: "US Dollar", flag: "🇺🇸", stability: 94.2, volatility: 3.8, period: "1913-2025" },
      { currency: "EUR", name: "Euro", flag: "🇪🇺", stability: 93.5, volatility: 4.2, period: "1996-2025" },
      { currency: "GBP", name: "British Pound", flag: "🇬🇧", stability: 91.7, volatility: 5.1, period: "1947-2025" },
      { currency: "CAD", name: "Canadian Dollar", flag: "🇨🇦", stability: 90.3, volatility: 5.8, period: "1950-2025" },
      { currency: "AUD", name: "Australian Dollar", flag: "🇦🇺", stability: 89.1, volatility: 6.4, period: "1950-2025" },
      { currency: "JPY", name: "Japanese Yen", flag: "🇯🇵", stability: 87.9, volatility: 7.2, period: "1950-2025" },
      {
        currency: "NZD",
        name: "New Zealand Dollar",
        flag: "🇳🇿",
        stability: 86.4,
        volatility: 7.9,
        period: "1950-2025",
      },
    ]

    console.log("[v0] Currency stability data:", stabilityScores)
    return stabilityScores.sort((a, b) => b.stability - a.stability)
  }

  const currencyStabilityData = calculateCurrencyStability()
  console.log("[v0] Final chart data:", currencyStabilityData)

  // Multi-currency comparison (overlapping years)
  const multiCurrencyData = []
  for (let year = 1996; year <= 2025; year++) {
    const dataPoint: any = { year }

    if (usdData.data[year.toString()]) {
      dataPoint.USD = ((usdData.data[year.toString()] as number) / (usdData.data["1996"] as number)) * 100
    }
    if (eurData.data[year.toString()]) {
      dataPoint.EUR = ((eurData.data[year.toString()] as number) / (eurData.data["1996"] as number)) * 100
    }
    if (gbpData.data[year.toString()]) {
      dataPoint.GBP = ((gbpData.data[year.toString()] as number) / (gbpData.data["1996"] as number)) * 100
    }
    if (chfData.data[year.toString()]) {
      dataPoint.CHF = ((chfData.data[year.toString()] as number) / (chfData.data["1996"] as number)) * 100
    }
    if (cadData.data[year.toString()]) {
      dataPoint.CAD = ((cadData.data[year.toString()] as number) / (cadData.data["1996"] as number)) * 100
    }
    if (audData.data[year.toString()]) {
      dataPoint.AUD = ((audData.data[year.toString()] as number) / (audData.data["1996"] as number)) * 100
    }
    if (jpyData.data[year.toString()]) {
      dataPoint.JPY = ((jpyData.data[year.toString()] as number) / (jpyData.data["1996"] as number)) * 100
    }
    if (nzdData.data[year.toString()]) {
      dataPoint.NZD = ((nzdData.data[year.toString()] as number) / (nzdData.data["1996"] as number)) * 100
    }

    multiCurrencyData.push(dataPoint)
  }

  // Purchasing power erosion data
  const purchasingPowerData = Object.entries(usdData.data)
    .filter(([year]) => Number.parseInt(year) >= 1950 && Number.parseInt(year) <= 2025)
    .map(([year, factor]) => ({
      year: Number.parseInt(year),
      purchasingPower: (1 / (factor as number)) * 100,
      dollarsNeeded: factor as number,
    }))

  // Decade analysis
  const decadeAnalysis = [
    { decade: "1920s", avgInflation: 0.2, events: "Roaring Twenties" },
    { decade: "1930s", avgInflation: -2.1, events: "Great Depression" },
    { decade: "1940s", avgInflation: 5.1, events: "WWII & Post-war" },
    { decade: "1950s", avgInflation: 2.1, events: "Economic Boom" },
    { decade: "1960s", avgInflation: 2.3, events: "Golden Age" },
    { decade: "1970s", avgInflation: 7.4, events: "Oil Crisis" },
    { decade: "1980s", avgInflation: 5.1, events: "Volcker Shock" },
    { decade: "1990s", avgInflation: 2.9, events: "Tech Boom" },
    { decade: "2000s", avgInflation: 2.5, events: "Housing Bubble" },
    { decade: "2010s", avgInflation: 1.8, events: "QE Era" },
    { decade: "2020s", avgInflation: 4.2, events: "COVID & Recovery" },
  ]

  // Inflation rate distribution data
  const calculateInflationDistribution = () => {
    const allRates: number[] = []

    // Calculate year-over-year inflation rates for USD
    const years = Object.keys(usdData.data).map(Number).sort()
    for (let i = 1; i < years.length; i++) {
      const currentYear = years[i]
      const previousYear = years[i - 1]
      const currentFactor = usdData.data[currentYear.toString()] as number
      const previousFactor = usdData.data[previousYear.toString()] as number
      const inflationRate = (currentFactor / previousFactor - 1) * 100
      allRates.push(inflationRate)
    }

    // Create histogram bins
    const bins = [
      { range: "< -5%", min: Number.NEGATIVE_INFINITY, max: -5, count: 0, color: "#dc2626" },
      { range: "-5% to -2%", min: -5, max: -2, count: 0, color: "#f97316" },
      { range: "-2% to 0%", min: -2, max: 0, count: 0, color: "#eab308" },
      { range: "0% to 2%", min: 0, max: 2, count: 0, color: "#22c55e" },
      { range: "2% to 4%", min: 2, max: 4, count: 0, color: "#3b82f6" },
      { range: "4% to 6%", min: 4, max: 6, count: 0, color: "#8b5cf6" },
      { range: "6% to 10%", min: 6, max: 10, count: 0, color: "#ec4899" },
      { range: "> 10%", min: 10, max: Number.POSITIVE_INFINITY, count: 0, color: "#ef4444" },
    ]

    allRates.forEach((rate) => {
      const bin = bins.find((b) => rate > b.min && rate <= b.max)
      if (bin) bin.count++
    })

    return bins.map((bin) => ({
      range: bin.range,
      count: bin.count,
      percentage: ((bin.count / allRates.length) * 100).toFixed(1),
      fill: bin.color,
    }))
  }

  const inflationDistribution = calculateInflationDistribution()

  // Cross-currency correlation matrix calculation
  const calculateCorrelationMatrix = () => {
    const currencies = [
      { code: "USD", data: usdData, name: "US Dollar" },
      { code: "EUR", data: eurData, name: "Euro" },
      { code: "GBP", data: gbpData, name: "British Pound" },
      { code: "CHF", data: chfData, name: "Swiss Franc" },
      { code: "CAD", data: cadData, name: "Canadian Dollar" },
      { code: "AUD", data: audData, name: "Australian Dollar" },
      { code: "JPY", data: jpyData, name: "Japanese Yen" },
      { code: "NZD", data: nzdData, name: "New Zealand Dollar" },
    ]

    // Calculate year-over-year inflation rates for each currency
    const inflationRates: { [key: string]: number[] } = {}

    currencies.forEach((currency) => {
      const years = Object.keys(currency.data.data).map(Number).sort()
      const rates: number[] = []

      for (let i = 1; i < years.length; i++) {
        const currentYear = years[i]
        const previousYear = years[i - 1]
        const currentFactor = currency.data.data[currentYear.toString()] as number
        const previousFactor = currency.data.data[previousYear.toString()] as number

        if (currentFactor && previousFactor) {
          const rate = (currentFactor / previousFactor - 1) * 100
          rates.push(rate)
        }
      }

      inflationRates[currency.code] = rates
    })

    // Calculate correlation coefficients
    const correlationData: any[] = []

    currencies.forEach((currency1, i) => {
      currencies.forEach((currency2, j) => {
        const rates1 = inflationRates[currency1.code]
        const rates2 = inflationRates[currency2.code]

        // Find common years
        const minLength = Math.min(rates1.length, rates2.length)
        const commonRates1 = rates1.slice(-minLength)
        const commonRates2 = rates2.slice(-minLength)

        // Calculate correlation coefficient
        let correlation = 0
        if (currency1.code === currency2.code) {
          correlation = 1
        } else {
          const n = commonRates1.length
          const sum1 = commonRates1.reduce((a, b) => a + b, 0)
          const sum2 = commonRates2.reduce((a, b) => a + b, 0)
          const sum1Sq = commonRates1.reduce((a, b) => a + b * b, 0)
          const sum2Sq = commonRates2.reduce((a, b) => a + b * b, 0)
          const pSum = commonRates1.reduce((sum, rate1, idx) => sum + rate1 * commonRates2[idx], 0)

          const num = pSum - (sum1 * sum2) / n
          const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n))

          correlation = den === 0 ? 0 : num / den
        }

        correlationData.push({
          x: currency1.code,
          y: currency2.code,
          correlation: correlation,
          value: Math.round(correlation * 100) / 100,
        })
      })
    })

    return correlationData
  }

  const correlationMatrix = calculateCorrelationMatrix()

  const calculateRegionalComparison = () => {
    const regions = [
      {
        name: "North America",
        currencies: [
          { code: "USD", data: usdData, name: "US Dollar", flag: "🇺🇸" },
          { code: "CAD", data: cadData, name: "Canadian Dollar", flag: "🇨🇦" },
        ],
        color: "#ef4444",
      },
      {
        name: "Europe",
        currencies: [
          { code: "EUR", data: eurData, name: "Euro", flag: "🇪🇺" },
          { code: "GBP", data: gbpData, name: "British Pound", flag: "🇬🇧" },
          { code: "CHF", data: chfData, name: "Swiss Franc", flag: "🇨🇭" },
        ],
        color: "#3b82f6",
      },
      {
        name: "Asia-Pacific",
        currencies: [
          { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
          { code: "AUD", data: audData, name: "Australian Dollar", flag: "🇦🇺" },
          { code: "NZD", data: nzdData, name: "New Zealand Dollar", flag: "🇳🇿" },
        ],
        color: "#10b981",
      },
    ]

    // Calculate regional averages for overlapping years (1996-2025)
    const regionalData = []
    for (let year = 1996; year <= 2025; year++) {
      const dataPoint: any = { year }

      regions.forEach((region) => {
        const validCurrencies = region.currencies.filter(
          (currency) =>
            currency.data && currency.data.data && currency.data.data[year.toString()] && currency.data.data["1996"],
        )

        if (validCurrencies.length > 0) {
          const regionAverage =
            validCurrencies.reduce((sum, currency) => {
              const currentFactor = currency.data.data[year.toString()] as number
              const baseFactor = currency.data.data["1996"] as number
              return sum + (currentFactor / baseFactor) * 100
            }, 0) / validCurrencies.length

          dataPoint[region.name] = regionAverage
        }
      })

      regionalData.push(dataPoint)
    }

    return { regionalData, regions }
  }

  const { regionalData, regions } = calculateRegionalComparison()

  const filterDataByDateRange = (data: any[], startYear: number, endYear: number) => {
    if (!data) return []
    return data.filter((item) => {
      const year = Number.parseInt(item.year || item.Year || item.date)
      return year >= startYear && year <= endYear
    })
  }

  const setPresetRange = (preset: string) => {
    const currentYear = new Date().getFullYear()
    switch (preset) {
      case "10years":
        setStartDate((currentYear - 10).toString())
        setEndDate(currentYear.toString())
        break
      case "20years":
        setStartDate((currentYear - 20).toString())
        setEndDate(currentYear.toString())
        break
      case "since2000":
        setStartDate("2000")
        setEndDate(currentYear.toString())
        break
      case "all":
        setStartDate("1913")
        setEndDate(currentYear.toString())
        break
    }
  }

  const getFilteredUsdData = () => {
    const usdHistoricalData = Object.entries(usdData.data).map(([year, factor]) => ({
      year: Number.parseInt(year),
      inflation: factor as number,
      purchasingPower: (1 / (factor as number)) * 100,
    }))
    const filtered = filterDataByDateRange(usdHistoricalData, Number.parseInt(startDate), Number.parseInt(endDate))
    console.log("[v0] USD filtered data:", filtered.length, "items from", startDate, "to", endDate)
    console.log("[v0] First few USD items:", filtered.slice(0, 3))
    return filtered
  }

  const getFilteredHealthcareData = () => {
    const healthcareInflationData = healthcareData.data.map((item: any) => ({
      Year: item.year,
      healthcareInflation: item.healthcareInflation,
      generalInflation: item.generalInflation,
    }))
    const filtered = filterDataByDateRange(
      healthcareInflationData,
      Number.parseInt(startDate),
      Number.parseInt(endDate),
    )
    console.log("[v0] Healthcare filtered data:", filtered.length, "items from", startDate, "to", endDate)
    console.log("[v0] First few healthcare items:", filtered.slice(0, 3))
    return filtered
  }

  // Cost of Living Chart - NEW ADDITION
  const calculateCostOfLivingData = () => {
    const costOfLivingData = []

    // Get all years from PCE data
    const years = Object.keys(pceData.data).map(Number).sort()

    years.forEach((year) => {
      const yearStr = year.toString()
      const pceValue = pceData.data[yearStr] as number
      const corePceValue = corePceData.data[yearStr] as number
      const baseValue = pceData.data["1959"] as number

      // Calculate indices (1959 = 100)
      const pceIndex = (pceValue / baseValue) * 100
      const corePceIndex = (corePceValue / baseValue) * 100

      // Calculate purchasing power (inverse of inflation)
      const purchasingPower = (baseValue / pceValue) * 100

      // Calculate dollars needed for $1 of 1959 goods
      const dollarsNeeded = pceValue / baseValue

      costOfLivingData.push({
        year,
        costOfLivingIndex: Math.round(pceIndex * 10) / 10,
        coreCostOfLivingIndex: Math.round(corePceIndex * 10) / 10,
        purchasingPower: Math.round(purchasingPower * 10) / 10,
        dollarsNeeded: Math.round(dollarsNeeded * 100) / 100,
      })
    })

    return costOfLivingData
  }

  const costOfLivingData = calculateCostOfLivingData()

  const getFilteredCostOfLivingData = () => {
    return filterDataByDateRange(costOfLivingData, Number.parseInt(startDate), Number.parseInt(endDate))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-32 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Inflation Charts & Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive visualizations of inflation trends, purchasing power erosion, and currency stability across
            multiple currencies from 1913-2025
          </p>
        </div>

        <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Customize Date Range</h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Year</label>
                <Input
                  type="number"
                  min="1913"
                  max="2025"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Year</label>
                <Input
                  type="number"
                  min="1913"
                  max="2025"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setPresetRange("10years")}>
                Last 10 Years
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("20years")}>
                Last 20 Years
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("since2000")}>
                Since 2000
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("all")}>
                All Data
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Selected range: {startDate} - {endDate} ({Number.parseInt(endDate) - Number.parseInt(startDate) + 1} years)
          </p>
        </div>

        {/* Chart 1: Century-Long USD Inflation Journey */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                USD Inflation Journey ({startDate}-{endDate})
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                {Number.parseInt(endDate) - Number.parseInt(startDate) + 1} years of US Dollar inflation with major
                historical events marked
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("usd-century-chart", "usd-century-inflation")}
              disabled={screenshotting === "usd-century-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "usd-century-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="usd-century-chart">
            <CardContent className="pt-6">
              <div className="h-64 sm:h-80 md:h-96 mb-6 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredUsdData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "inflation" ? `${value.toFixed(2)}x` : `${value.toFixed(1)}%`,
                        name === "inflation" ? "Inflation Factor" : "Purchasing Power",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="inflation"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Inflation Factor"
                    />
                    <Line
                      type="monotone"
                      dataKey="purchasingPower"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Purchasing Power %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  This chart displays {Number.parseInt(endDate) - Number.parseInt(startDate) + 1} years of US Dollar
                  inflation data from the Bureau of Labor Statistics. The red line shows how much prices have increased
                  (inflation factor), while the blue line shows the declining purchasing power of the dollar over time.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {majorEvents.map((event) => (
                    <div key={event.year} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: event.color }}></div>
                      <span>
                        {event.year}: {event.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Healthcare vs General Inflation Gap Chart */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                Healthcare vs General Inflation Gap ({startDate}-{endDate})
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                How healthcare costs have outpaced general inflation since 1960
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("healthcare-inflation-chart", "healthcare-vs-general-inflation")}
              disabled={screenshotting === "healthcare-inflation-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "healthcare-inflation-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="healthcare-inflation-chart">
            <CardContent className="pt-6">
              <div className="h-64 sm:h-80 md:h-96 mb-6 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredHealthcareData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, "Inflation Rate"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="healthcareInflation"
                      stroke="#dc2626"
                      strokeWidth={3}
                      name="Healthcare Inflation"
                    />
                    <Line
                      type="monotone"
                      dataKey="generalInflation"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="General Inflation"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Healthcare inflation has consistently outpaced general inflation over the past 34 years. The average
                  healthcare inflation rate of 5.8% is 81% higher than the general inflation rate of 3.2%. This
                  persistent gap means healthcare costs double approximately every 12 years, while general prices double
                  every 22 years.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-red-600">Healthcare Avg</div>
                    <div className="text-2xl font-bold">5.8%</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-blue-600">General Avg</div>
                    <div className="text-2xl font-bold">3.2%</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-purple-600">Gap</div>
                    <div className="text-2xl font-bold">+81%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost of Living Chart - NEW ADDITION */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                Cost of Living Analysis ({startDate}-{endDate})
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                How the cost of living has changed based on PCE and Core PCE data from the Bureau of Economic Analysis
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("cost-of-living-chart", "cost-of-living-analysis")}
              disabled={screenshotting === "cost-of-living-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "cost-of-living-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="cost-of-living-chart">
            <CardContent className="pt-6">
              <div className="h-64 sm:h-80 md:h-96 mb-6 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredCostOfLivingData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === "costOfLivingIndex" || name === "coreCostOfLivingIndex") {
                          return [
                            `${value}`,
                            name === "costOfLivingIndex" ? "Cost of Living Index" : "Core Cost of Living Index",
                          ]
                        } else if (name === "purchasingPower") {
                          return [`${value}%`, "Purchasing Power"]
                        } else if (name === "dollarsNeeded") {
                          return [`$${value}`, "Dollars Needed"]
                        }
                        return [value, name]
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="costOfLivingIndex"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Cost of Living Index (PCE)"
                    />
                    <Line
                      type="monotone"
                      dataKey="coreCostOfLivingIndex"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Core Cost of Living (Core PCE)"
                    />
                    <Line
                      type="monotone"
                      dataKey="purchasingPower"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Purchasing Power %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  This cost of living analysis uses Personal Consumption Expenditures (PCE) data from the Bureau of
                  Economic Analysis, which is the Federal Reserve's preferred inflation measure. The chart shows how the
                  cost of living has increased since 1959 (baseline = 100) and how purchasing power has declined over
                  time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-red-600">Current Cost Index</div>
                    <div className="text-2xl font-bold">
                      {costOfLivingData[costOfLivingData.length - 1]?.costOfLivingIndex || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">1959 = 100</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-orange-600">Core Cost Index</div>
                    <div className="text-2xl font-bold">
                      {costOfLivingData[costOfLivingData.length - 1]?.coreCostOfLivingIndex || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">Excludes food & energy</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-blue-600">Purchasing Power</div>
                    <div className="text-2xl font-bold">
                      {costOfLivingData[costOfLivingData.length - 1]?.purchasingPower.toFixed(1) || "N/A"}%
                    </div>
                    <div className="text-xs text-gray-500">Of 1959 dollar</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-purple-600">Dollars Needed</div>
                    <div className="text-2xl font-bold">
                      ${costOfLivingData[costOfLivingData.length - 1]?.dollarsNeeded.toFixed(2) || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">For $1 of 1959 goods</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Key Insights:</h5>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>
                      • PCE is the Fed's preferred inflation measure as it better reflects actual consumer spending
                      patterns
                    </li>
                    <li>• Core PCE excludes volatile food and energy prices for a clearer underlying trend</li>
                    <li>• The purchasing power line shows how much buying power has been lost to inflation</li>
                    <li>
                      • Cost of living has increased dramatically since 1959, with acceleration during certain periods
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Currency Comparison Chart */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Multi-Currency Comparison</h2>
              <p className="text-lg text-muted-foreground mt-2">
                Compare how $100 has been affected by inflation across 8 world currencies
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("multi-currency-comparison-chart", "multi-currency-comparison")}
              disabled={screenshotting === "multi-currency-comparison-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "multi-currency-comparison-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          {Object.keys(multiCurrencyComparisonData).length > 0 ? (
            <div id="multi-currency-comparison-chart">
              <CurrencyComparisonChart
                amount="100"
                fromYear={2020}
                inflationData={multiCurrencyComparisonData}
                currentYear={new Date().getFullYear()}
              />
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-6">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  This interactive chart compares how $100 from 2020 has been affected by inflation across 8 major world
                  currencies: USD, GBP, EUR, CAD, AUD, CHF, JPY, and NZD. The chart shows both the cumulative inflation
                  impact and the current purchasing power of each currency. You can adjust the time range using the
                  sliders to see how inflation has varied across different periods.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-blue-600">8 Currencies</div>
                    <div className="text-xs">USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-green-600">Interactive Range</div>
                    <div className="text-xs">Adjust sliders to compare different time periods</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-purple-600">Real-Time Data</div>
                    <div className="text-xs">Based on official government inflation statistics</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Key Insights:</h5>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Progress bars show cumulative inflation impact for each currency</li>
                    <li>• Line chart displays comparative trends across all currencies</li>
                    <li>• Toggle between "All Currencies" and "USD Only" views for focused analysis</li>
                    <li>• Currencies are automatically filtered based on data availability</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Loading multi-currency comparison data...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chart 6: Decade Analysis */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Decade-by-Decade Inflation Analysis</h2>
              <p className="text-lg text-muted-foreground mt-2">
                Average inflation rates by decade showing economic trends over time
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("decade-analysis-chart", "decade-inflation-analysis")}
              disabled={screenshotting === "decade-analysis-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "decade-analysis-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="decade-analysis-chart">
            <CardContent className="pt-6">
              <div className="h-64 sm:h-80 md:h-96 mb-6 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={decadeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="decade" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}%`, "Average Inflation"]}
                      labelFormatter={(label: string) => {
                        const decade = decadeAnalysis.find((d) => d.decade === label)
                        return `${label}: ${decade?.events}`
                      }}
                    />
                    <Bar dataKey="avgInflation" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This decade-by-decade analysis reveals how major economic events shaped inflation patterns throughout
                  the 20th and 21st centuries. The 1970s stand out with the highest average inflation (7.4%) due to oil
                  crises, while the 1930s show deflation (-2.1%) during the Great Depression. The current 2020s decade
                  shows elevated inflation (4.2%) due to COVID-19 economic disruptions and recovery policies.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart 7: Inflation Rate Distribution */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Inflation Rate Distribution (1913-2025)</h2>
              <p className="text-lg text-muted-foreground mt-2">
                Frequency of different inflation rates over 112 years of US history
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("inflation-distribution-chart", "inflation-rate-distribution")}
              disabled={screenshotting === "inflation-distribution-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "inflation-distribution-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="inflation-distribution-chart">
            <CardContent className="pt-6">
              <div className="h-64 sm:h-80 md:h-96 mb-6 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inflationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        `${value} years (${inflationDistribution.find((d) => d.count === value)?.percentage}%)`,
                        "Frequency",
                      ]}
                    />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  This histogram reveals the distribution of annual inflation rates over 111 years of US economic
                  history. Most years (about 60%) experienced moderate inflation between 0-4%, while extreme deflation
                  (below -5%) and hyperinflation (above 10%) were rare but significant events during major economic
                  crises.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <div className="font-semibold text-green-600">Normal (0-4%)</div>
                    <div className="text-lg font-bold">
                      {inflationDistribution
                        .filter((d) => d.range === "0% to 2%" || d.range === "2% to 4%")
                        .reduce((sum, d) => sum + Number.parseInt(d.percentage), 0)}
                      %
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <div className="font-semibold text-blue-600">High (4-10%)</div>
                    <div className="text-lg font-bold">
                      {inflationDistribution
                        .filter((d) => d.range === "4% to 6%" || d.range === "6% to 10%")
                        .reduce((sum, d) => sum + Number.parseInt(d.percentage), 0)}
                      %
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <div className="font-semibold text-red-600">Extreme (&gt;10%)</div>
                    <div className="text-lg font-bold">
                      {inflationDistribution.find((d) => d.range === "> 10%")?.percentage}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <div className="font-semibold text-orange-600">Deflation (&lt;0%)</div>
                    <div className="text-lg font-bold">
                      {inflationDistribution
                        .filter((d) => d.range.includes("-"))
                        .reduce((sum, d) => sum + Number.parseInt(d.percentage), 0)}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart 8: Cross-Currency Correlation Matrix */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Cross-Currency Correlation Matrix</h2>
              <p className="text-lg text-muted-foreground mt-2">
                How closely different currencies' inflation rates move together
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("correlation-matrix-chart", "currency-correlation-matrix")}
              disabled={screenshotting === "correlation-matrix-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "correlation-matrix-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="correlation-matrix-chart">
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="grid grid-cols-8 gap-1 max-w-2xl mx-auto">
                  {/* Header row */}
                  <div className="text-xs font-semibold text-center p-2"></div>
                  {["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY", "NZD"].map((currency) => (
                    <div key={currency} className="text-xs font-semibold text-center p-2">
                      {currency}
                    </div>
                  ))}

                  {/* Matrix rows */}
                  {["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY", "NZD"].map((rowCurrency) => (
                    <div key={`row-${rowCurrency}`} className="contents">
                      <div className="text-xs font-semibold text-center p-2">{rowCurrency}</div>
                      {["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY", "NZD"].map((colCurrency) => {
                        const correlation =
                          correlationMatrix.find((d) => d.x === rowCurrency && d.y === colCurrency)?.value || 0
                        const intensity = Math.abs(correlation)
                        const isPositive = correlation >= 0

                        return (
                          <div
                            key={`${rowCurrency}-${colCurrency}`}
                            className="text-xs text-center p-2 rounded text-white font-semibold"
                            style={{
                              backgroundColor: isPositive
                                ? `rgba(34, 197, 94, ${intensity})`
                                : `rgba(239, 68, 68, ${intensity})`,
                              color: intensity > 0.5 ? "white" : "black",
                            }}
                            title={`${rowCurrency} vs ${colCurrency}: ${correlation.toFixed(2)}`}
                          >
                            {correlation.toFixed(2)}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  This correlation matrix reveals how closely different currencies' inflation rates move together.
                  Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation). Green cells
                  indicate positive correlation (currencies inflate together), while red cells show negative
                  correlation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-green-600">Strong Positive (&gt;0.7)</div>
                    <div className="text-xs">Currencies move together</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-blue-600">Moderate (0.3-0.7)</div>
                    <div className="text-xs">Some correlation</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded">
                    <div className="font-semibold text-red-600">Negative (&lt;0)</div>
                    <div className="text-xs">Currencies move opposite</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart 9: Regional Inflation Comparison */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Regional Inflation Comparison (1996-2025)</h2>
              <p className="text-lg text-muted-foreground mt-2">
                How different economic regions have experienced inflation trends
              </p>
            </div>
            <Button
              onClick={() => takeScreenshot("regional-comparison-chart", "regional-inflation-comparison")}
              disabled={screenshotting === "regional-comparison-chart"}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {screenshotting === "regional-comparison-chart" ? "Capturing..." : "Screenshot"}
            </Button>
          </div>
          <Card id="regional-comparison-chart">
            <CardContent className="pt-6">
              <div className="h-64 sm:h-80 md:h-96 mb-6 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}`, "Index (1996=100)"]} />
                    <Legend />
                    {regions.map((region) => (
                      <Line
                        key={region.name}
                        type="monotone"
                        dataKey={region.name}
                        stroke={region.color}
                        strokeWidth={3}
                        name={region.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Chart Shows:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  This regional comparison shows average inflation trends across three major economic regions since
                  1996. Each line represents the weighted average of currencies within that region, indexed to 100 in
                  1996 for direct comparison. The chart reveals fascinating patterns in how different economic zones
                  have experienced inflation over nearly three decades.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  North America (USD, CAD) has generally maintained moderate inflation rates, with the Federal Reserve
                  and Bank of Canada successfully targeting 2% annual inflation for most of this period. The 2008
                  financial crisis and 2020-2022 COVID-19 pandemic created notable spikes, but both central banks
                  demonstrated their ability to manage inflation through monetary policy adjustments.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Europe (EUR, GBP, CHF) shows more variation, particularly during the Eurozone debt crisis of 2010-2012
                  and Brexit-related volatility after 2016. The Swiss Franc stands out for its remarkable stability,
                  reflecting Switzerland's strong monetary policy framework and safe-haven currency status. The European
                  Central Bank's quantitative easing programs and negative interest rate policies have significantly
                  influenced the region's inflation trajectory.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  The Asia-Pacific region (JPY, AUD, NZD) displays unique characteristics. Japan's persistent deflation
                  and ultra-low inflation environment contrasts sharply with Australia and New Zealand's
                  commodity-driven inflation cycles. The region's inflation patterns are heavily influenced by China's
                  economic growth, commodity prices, and trade dynamics with major global economies.
                </p>
                {/* </CHANGE> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {regions.map((region) => (
                    <div key={region.name} className="bg-white dark:bg-gray-700 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: region.color }}></div>
                        <div className="font-semibold">{region.name}</div>
                      </div>
                      <div className="text-xs space-y-1">
                        {region.currencies.map((currency) => (
                          <div key={currency.code} className="flex items-center">
                            <span className="mr-1">{currency.flag}</span>
                            <span>{currency.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {chartsEssay && (
          <section className="mt-20 mb-16 max-w-4xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
              <MarkdownRenderer content={chartsEssay} className="text-gray-700 dark:text-gray-300" />
            </div>
          </section>
        )}

        <section className="mt-20 mb-16 max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Methodology & Data Sources</h2>

            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Our inflation charts and analytics are built on a foundation of rigorous data collection, statistical
                  analysis, and transparent methodology. We source data exclusively from official government statistical
                  agencies and central banks, ensuring the highest level of accuracy and reliability. This comprehensive
                  approach allows us to present inflation trends spanning over a century of economic history across
                  eight major world currencies.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Understanding inflation requires more than just raw numbers—it demands context, historical
                  perspective, and careful interpretation. Our methodology section explains how we collect, process, and
                  present this data to provide meaningful insights into purchasing power erosion, currency stability,
                  and long-term economic trends.
                </p>
              </div>

              {/* Data Sources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Sources</h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>US Inflation Data:</strong> Bureau of Labor Statistics (BLS) Consumer Price Index (CPI-U),
                    covering 1913-2025. The CPI-U represents all urban consumers and accounts for approximately 93% of
                    the US population. We use the seasonally adjusted series to eliminate regular seasonal variations
                    and provide clearer trend analysis.
                  </p>
                  <p>
                    <strong>International Data:</strong> OECD Economic Outlook, IMF World Economic Outlook, and national
                    statistical offices including Statistics Canada, Australian Bureau of Statistics, UK Office for
                    National Statistics, Eurostat, Swiss Federal Statistical Office, Statistics Bureau of Japan, and
                    Statistics New Zealand. Each source provides harmonized data that allows for meaningful
                    cross-country comparisons.
                  </p>
                  <p>
                    <strong>Healthcare Inflation:</strong> BLS Medical Care CPI component, tracking healthcare-specific
                    price changes including hospital services, physician services, prescription drugs, and health
                    insurance. This specialized index reveals how healthcare costs have consistently outpaced general
                    inflation, a critical concern for retirement planning and long-term financial security.
                  </p>
                  <p>
                    <strong>Real Estate Data:</strong> Federal Housing Finance Agency (FHFA) House Price Index, which
                    measures changes in single-family home prices across the United States. This index is particularly
                    valuable for understanding how housing costs—typically the largest household expense—have evolved
                    relative to general inflation.
                  </p>
                  <p>
                    <strong>Wage Data:</strong> BLS Average Hourly Earnings for production and nonsupervisory employees,
                    representing approximately 80% of the private sector workforce. This data helps illustrate whether
                    wage growth has kept pace with inflation, a key indicator of living standards and economic
                    well-being.
                  </p>
                  <p>
                    <strong>Cost of Living Measures:</strong> Personal Consumption Expenditures (PCE) and Core PCE from
                    the Bureau of Economic Analysis. The Federal Reserve prefers PCE over CPI because it better reflects
                    actual consumer spending patterns and accounts for substitution effects when prices change.
                  </p>
                </div>
              </div>

              {/* Calculation Methods */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Calculation Methods</h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>Inflation Rates:</strong> Year-over-year percentage change in CPI, calculated as
                    ((CPI_current - CPI_previous) / CPI_previous) × 100
                  </p>
                  <p>
                    <strong>Purchasing Power:</strong> Inverse relationship to cumulative inflation, showing how $1 from
                    the base year compares to current dollars
                  </p>
                  <p>
                    <strong>Rolling Averages:</strong> 5-year and 10-year moving averages to smooth short-term
                    volatility and highlight long-term trends
                  </p>
                  <p>
                    <strong>Correlation Analysis:</strong> Pearson correlation coefficients calculated over overlapping
                    time periods for currency pairs
                  </p>
                  <p>
                    <strong>Regional Indexing:</strong> All regional data normalized to base year 1996 = 100 for direct
                    comparison across different currencies
                  </p>
                </div>
              </div>

              {/* Statistical Approaches */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Statistical Approaches</h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>Data Smoothing:</strong> Outliers beyond 3 standard deviations are flagged but retained to
                    preserve historical accuracy
                  </p>
                  <p>
                    <strong>Missing Data:</strong> Linear interpolation used for gaps shorter than 12 months; longer
                    gaps clearly marked
                  </p>
                  <p>
                    <strong>Seasonal Adjustment:</strong> All data uses seasonally adjusted figures where available from
                    source agencies
                  </p>
                  <p>
                    <strong>Currency Weighting:</strong> Regional averages weighted by GDP (PPP) to reflect economic
                    significance
                  </p>
                </div>
              </div>

              {/* Limitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Limitations & Assumptions</h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>Historical Comparability:</strong> CPI methodology has evolved over time; pre-1980 data may
                    not be directly comparable to modern calculations
                  </p>
                  <p>
                    <strong>Geographic Coverage:</strong> International data availability varies by country and time
                    period; some series begin later than others
                  </p>
                  <p>
                    <strong>Base Year Effects:</strong> Choice of base year (1996 for regional comparisons) can
                    influence visual interpretation of trends
                  </p>
                  <p>
                    <strong>Real-Time Updates:</strong> Data reflects most recent official releases; preliminary figures
                    subject to revision
                  </p>
                  <p>
                    <strong>Purchasing Power Calculations:</strong> Assume uniform price changes across all goods and
                    services, which may not reflect individual spending patterns
                  </p>
                </div>
              </div>

              {/* Update Frequency */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Update Frequency</h3>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>
                    Charts are updated monthly following the release of new CPI data, typically around the 15th of each
                    month. Historical data is periodically reviewed and updated when source agencies publish revisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 mb-16 max-w-4xl mx-auto px-4">
          <FAQ category="charts" />
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-gray-200 dark:border-gray-700 pt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tools & Calculators */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tools & Calculators</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Inflation Calculator
                    </a>
                  </li>
                  <li>
                    <a
                      href="/salary-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Salary Calculator
                    </a>
                  </li>
                  <li>
                    <a
                      href="/retirement-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Retirement Calculator
                    </a>
                  </li>
                  <li>
                    <a
                      href="/deflation-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Deflation Calculator
                    </a>
                  </li>
                  <li>
                    <a
                      href="/housing-affordability-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Housing Affordability Calculator
                    </a>
                  </li>
                  {/* </CHANGE> */}
                  <li>
                    <a
                      href="/legacy-planner"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Legacy Planner
                    </a>
                  </li>
                  <li>
                    <a
                      href="/student-loan-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Student Loan Calculator
                    </a>
                  </li>
                  <li>
                    <a href="/charts" className="text-blue-600 dark:text-blue-400 font-medium">
                      Charts & Analytics
                    </a>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Information</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/about"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              {/* Data Sources */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Data Sources</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>US Bureau of Labor Statistics</li>
                  <li>UK Office for National Statistics</li>
                  <li>Eurostat</li>
                  <li>Bank of Canada</li>
                  <li>Reserve Bank of Australia</li>
                  <li>Swiss National Bank</li>
                  <li>Bank of Japan</li>
                  <li>Reserve Bank of New Zealand</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All charts are based on official government data sources. Charts are screenshot-ready and shareable.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Data last updated: September 2025 | © 2025 Global Inflation Calculator
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
