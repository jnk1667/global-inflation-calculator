"use client"

import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Info, ArrowRight, Home, Zap, ShoppingCart, Car, Building, AlertCircle, BlendIcon as TrendIcon } from "lucide-react"
import Link from "next/link"
import AdBanner from "@/components/ad-banner"
import { supabase } from "@/lib/supabase"
import type { JSX } from "react/jsx-runtime"

const FAQ = lazy(() => import("@/components/faq"))

interface CityMetrics {
  housing_rent_monthly: number
  housing_cost_percent: number
  utilities_monthly: number
  food_monthly: number
  transportation_monthly: number
  overall_cost_index: number
  affordability_ratio: number
}

interface CityData {
  code: string
  name: string
  country: string
  currency: string
  flag: string
  metrics: CityMetrics
  dataSource: string
  lastUpdated: string
  confidence: string
}

interface CitiesData {
  lastUpdated: string
  dataVersion: string
  totalCities: number
  cities: CityData[]
}

const exchangeRates: Record<string, number> = {
  USD: 1.0,
  GBP: 1.27,
  EUR: 1.1,
  CAD: 0.73,
  AUD: 0.67,
  CHF: 1.18,
  JPY: 0.0069,
  NZD: 0.58,
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
  CHF: "CHF",
  JPY: "¥",
  NZD: "NZ$",
}

const averageSalaryByCity: Record<string, number> = {
  "newyork-ny": 68000,
  "sanfrancisco-ca": 95000,
  "los-angeles-ca": 65000,
  "chicago-il": 62000,
  "austin-tx": 70000,
  "denver-co": 68000,
  "atlanta-ga": 65000,
  "seattle-wa": 85000,
  "boston-ma": 72000,
  "miami-fl": 55000,
  "phoenix-az": 60000,
  "san-diego-ca": 68000,
  "houston-tx": 65000,
  "portland-or": 62000,
  "minneapolis-mn": 63000,
  "dallas-tx": 62000,
  "philadelphia-pa": 60000,
  "washington-dc": 75000,
  "nashville-tn": 58000,
  "charlotte-nc": 62000,
  "london-uk": 52000,
  "manchester-uk": 42000,
  "edinburgh-uk": 45000,
  "birmingham-uk": 40000,
  "bristol-uk": 43000,
  "leeds-uk": 38000,
  "liverpool-uk": 35000,
  "glasgow-uk": 38000,
  "paris-france": 48000,
  "berlin-germany": 45000,
  "amsterdam-netherlands": 52000,
  "madrid-spain": 38000,
  "rome-italy": 38000,
  "vienna-austria": 46000,
  "brussels-belgium": 50000,
  "dublin-ireland": 55000,
  "lisbon-portugal": 30000,
  "barcelona-spain": 40000,
  "prague-czechia": 28000,
  "warsaw-poland": 24000,
  "budapest-hungary": 22000,
  "toronto-canada": 62000,
  "vancouver-canada": 65000,
  "montreal-canada": 50000,
  "calgary-canada": 68000,
  "ottawa-canada": 60000,
  "edmonton-canada": 58000,
  "winnipeg-canada": 54000,
  "quebec-canada": 45000,
  "halifax-canada": 48000,
  "sydney-australia": 68000,
  "melbourne-australia": 65000,
  "brisbane-australia": 60000,
  "perth-australia": 62000,
  "adelaide-australia": 58000,
  "canberra-australia": 65000,
  "darwin-australia": 70000,
  "hobart-australia": 55000,
  "gold-coast-australia": 60000,
  "newcastle-australia": 58000,
  "zurich-switzerland": 92000,
  "geneva-switzerland": 95000,
  "basel-switzerland": 85000,
  "bern-switzerland": 82000,
  "lausanne-switzerland": 80000,
  "lucerne-switzerland": 78000,
  "tokyo-japan": 68000,
  "osaka-japan": 62000,
  "kyoto-japan": 58000,
  "yokohama-japan": 65000,
  "nagoya-japan": 60000,
  "sapporo-japan": 55000,
  "fukuoka-japan": 58000,
  "kobe-japan": 60000,
  "auckland-newzealand": 72000,
  "wellington-newzealand": 68000,
  "christchurch-newzealand": 62000,
  "hamilton-newzealand": 58000,
  "tauranga-newzealand": 55000,
  "dunedin-newzealand": 52000,
}

export default function RegionalCostOfLivingPage() {
  const [citiesData, setCitiesData] = useState<CitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [baseSalary, setBaseSalary] = useState("75000")
  const [salaryCurrency, setSalaryCurrency] = useState<string>("USD")
  const [currentCity, setCurrentCity] = useState<string>("newyork-ny")
  const [targetCity, setTargetCity] = useState<string>("london-uk")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [comparisonCities, setComparisonCities] = useState<string[]>(["london-uk"])
  const [blogEssay, setBlogEssay] = useState("")

  // Load cities data
  useEffect(() => {
    const loadCitiesData = async () => {
      try {
        const response = await fetch("/api/cost-of-living/cities")
        const data = await response.json()
        setCitiesData(data)
      } catch (error) {
        console.error("[v0] Error loading cities data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCitiesData()
  }, [])

  useEffect(() => {
    const loadBlogContent = async () => {
      try {
        console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("[v0] Fetching regional_cost_of_living_essay from seo_content table")

        const { data, error } = await supabase
          .from("seo_content")
          .select("content")
          .eq("id", "regional_cost_of_living_essay")
          .single()

        if (error) {
          console.log("[v0] Error fetching blog content:", error.message)
          const defaultContent = `
## Understanding Cost of Living Comparisons

Making informed decisions about where to live requires comprehensive understanding of cost differences across cities. This Regional Cost of Living Comparison tool provides detailed insights into housing, utilities, food, transportation, and overall living costs across 80+ cities worldwide.

### Why Cost of Living Matters

Whether you're considering a job relocation, planning a move for retirement, or evaluating international opportunities, understanding cost of living differences helps you:

- **Make Informed Financial Decisions** - Know exactly how your salary translates across different cities
- **Plan Your Budget Accurately** - Understand specific cost categories before you move
- **Compare Multiple Locations** - Evaluate several cities simultaneously with our advanced mode
- **Project Future Costs** - See 5-year cost projections based on historical inflation data

### Our Data Sources

All cost of living data is sourced from official government statistical agencies including the US Bureau of Labor Statistics, UK Office for National Statistics, Eurostat, Statistics Canada, Australian Bureau of Statistics, Swiss Federal Statistical Office, Statistics Bureau of Japan, and Stats NZ. This ensures maximum accuracy and reliability for your financial planning decisions.

### Cross-Currency Comparisons

Our tool supports 8 major currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) with real-time conversion rates, allowing you to compare costs between any two cities regardless of their native currency.
`
          setBlogEssay(defaultContent)
          return
        }

        if (data && data.content) {
          console.log("[v0] Successfully loaded blog content")
          setBlogEssay(data.content)
        } else {
          console.log("[v0] No content found, using default")
          const defaultContent = `
## Understanding Cost of Living Comparisons

Making informed decisions about where to live requires comprehensive understanding of cost differences across cities. This Regional Cost of Living Comparison tool provides detailed insights into housing, utilities, food, transportation, and overall living costs across 80+ cities worldwide.

### Why Cost of Living Matters

Whether you're considering a job relocation, planning a move for retirement, or evaluating international opportunities, understanding cost of living differences helps you:

- **Make Informed Financial Decisions** - Know exactly how your salary translates across different cities
- **Plan Your Budget Accurately** - Understand specific cost categories before you move
- **Compare Multiple Locations** - Evaluate several cities simultaneously with our advanced mode
- **Project Future Costs** - See 5-year cost projections based on historical inflation data

### Our Data Sources

All cost of living data is sourced from official government statistical agencies including the US Bureau of Labor Statistics, UK Office for National Statistics, Eurostat, Statistics Canada, Australian Bureau of Statistics, Swiss Federal Statistical Office, Statistics Bureau of Japan, and Stats NZ. This ensures maximum accuracy and reliability for your financial planning decisions.

### Cross-Currency Comparisons

Our tool supports 8 major currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) with real-time conversion rates, allowing you to compare costs between any two cities regardless of their native currency.
`
          setBlogEssay(defaultContent)
        }
      } catch (err) {
        console.error("[v0] Error loading blog content:", err)
        const defaultContent = `
## Understanding Cost of Living Comparisons

Making informed decisions about where to live requires comprehensive understanding of cost differences across cities. Our Regional Cost of Living Comparison tool provides the data you need to make smart relocation decisions.
`
        setBlogEssay(defaultContent)
      }
    }
    loadBlogContent()
  }, [])

  // Group cities by country
  const citiesByCountry = useMemo(() => {
    if (!citiesData) return {}

    const grouped: Record<string, CityData[]> = {}
    citiesData.cities.forEach((city) => {
      if (!grouped[city.country]) {
        grouped[city.country] = []
      }
      grouped[city.country].push(city)
    })
    return grouped
  }, [citiesData])

  // Get current and target city data
  const currentCityData = useMemo(() => {
    return citiesData?.cities.find((c) => c.code === currentCity)
  }, [citiesData, currentCity])

  const targetCityData = useMemo(() => {
    return citiesData?.cities.find((c) => c.code === targetCity)
  }, [citiesData, targetCity])

  const comparisonCitiesData = useMemo(() => {
    if (!citiesData) return []
    return comparisonCities.map((code) => citiesData.cities.find((c) => c.code === code)).filter(Boolean) as CityData[]
  }, [citiesData, comparisonCities])

  // Calculate equivalent salary
  const equivalentSalary = useMemo(() => {
    if (!currentCityData || !targetCityData || !baseSalary) return 0

    const salary = Number.parseFloat(baseSalary)
    if (isNaN(salary)) return 0

    const salaryInUSD = salary / exchangeRates[salaryCurrency]

    // Calculate cost difference ratio
    const costRatio = targetCityData.metrics.overall_cost_index / currentCityData.metrics.overall_cost_index

    // Calculate equivalent salary in USD
    const equivalentInUSD = salaryInUSD * costRatio

    // Convert to target city's currency
    const equivalent = equivalentInUSD * exchangeRates[targetCityData.currency]

    return Math.round(equivalent)
  }, [currentCityData, targetCityData, baseSalary, salaryCurrency])

  const affordabilityGap = useMemo(() => {
    if (!targetCityData) return 0
    const avgSalary = averageSalaryByCity[targetCity] || 60000
    const avgSalaryInTargetCurrency = avgSalary * exchangeRates[targetCityData.currency]
    const gap = ((equivalentSalary - avgSalaryInTargetCurrency) / avgSalaryInTargetCurrency) * 100
    return gap
  }, [targetCity, targetCityData, equivalentSalary])

  const fiveYearProjection = useMemo(() => {
    if (!targetCityData) return 0
    const annualInflation = 0.035
    const years = 5
    const projectedCost = equivalentSalary * Math.pow(1 + annualInflation, years)
    return Math.round(projectedCost)
  }, [equivalentSalary, targetCityData])

  // Calculate cost differences
  const costDifferences = useMemo(() => {
    if (!currentCityData || !targetCityData) {
      return {
        housing: 0,
        utilities: 0,
        food: 0,
        transportation: 0,
        overall: 0,
      }
    }

    return {
      housing:
        ((targetCityData.metrics.housing_cost_percent - currentCityData.metrics.housing_cost_percent) /
          currentCityData.metrics.housing_cost_percent) *
        100,
      utilities:
        ((targetCityData.metrics.utilities_monthly - currentCityData.metrics.utilities_monthly) /
          currentCityData.metrics.utilities_monthly) *
        100,
      food:
        ((targetCityData.metrics.food_monthly - currentCityData.metrics.food_monthly) /
          currentCityData.metrics.food_monthly) *
        100,
      transportation:
        ((targetCityData.metrics.transportation_monthly - currentCityData.metrics.transportation_monthly) /
          currentCityData.metrics.transportation_monthly) *
        100,
      overall:
        ((targetCityData.metrics.overall_cost_index - currentCityData.metrics.overall_cost_index) /
          currentCityData.metrics.overall_cost_index) *
        100,
    }
  }, [currentCityData, targetCityData])

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const renderBlogContent = (content: string) => {
    const parseInlineMarkdown = (text: string) => {
      const parts: (string | JSX.Element)[] = []
      const currentText = text
      let key = 0

      // Parse bold (**text**)
      const boldRegex = /\*\*(.+?)\*\*/g
      let lastIndex = 0
      let match

      while ((match = boldRegex.exec(currentText)) !== null) {
        if (match.index > lastIndex) {
          parts.push(currentText.substring(lastIndex, match.index))
        }
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold text-gray-900 dark:text-white">
            {match[1]}
          </strong>,
        )
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < currentText.length) {
        parts.push(currentText.substring(lastIndex))
      }

      return parts.length > 0 ? parts : text
    }

    return content.split("\n").map((line, index) => {
      // Heading level 2 (##)
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">
            {line.substring(3)}
          </h3>
        )
      }
      // Heading level 3 (###)
      else if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-lg font-medium text-gray-800 dark:text-gray-100 mt-4 mb-2">
            {line.substring(4)}
          </h4>
        )
      }
      // Bullet point (- )
      else if (line.trim().startsWith("- ")) {
        const bulletText = line.trim().substring(2)
        return (
          <li key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed ml-6 mb-2">
            {parseInlineMarkdown(bulletText)}
          </li>
        )
      }
      // Empty line
      else if (line.trim() === "") {
        return <br key={index} />
      }
      // Regular paragraph
      else {
        return (
          <p key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
            {parseInlineMarkdown(line)}
          </p>
        )
      }
    })
  }

  const currentYear = new Date().getFullYear()

  if (loading) {
    return (
      <div className="min-h-screen bg-background" style={{ contain: "layout style" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading city data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ contain: "layout style" }}>
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b pt-24">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-balance">Regional Cost of Living Comparison</h1>
          </div>
          <p className="text-xl text-muted-foreground text-pretty max-w-4xl mx-auto">
            Compare cost of living across 80+ cities worldwide with comprehensive data from official government sources
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl flex-grow">
        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner slot="8765432109" format="horizontal" />
        </div>

        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {" / "}
          <Link href="/salary-calculator" className="hover:text-foreground">
            Salary Calculator
          </Link>
          {" / "}
          <span className="text-foreground">Regional Cost of Living</span>
        </div>

        {/* Main Comparison Tool */}
        <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="h-6 w-6" />
                  Compare Cities
                </CardTitle>
              </div>
              <Button
                variant={advancedMode ? "default" : "outline"}
                onClick={() => setAdvancedMode(!advancedMode)}
                className="text-sm"
              >
                {advancedMode ? "Advanced Mode" : "Basic Mode"}
              </Button>
            </div>
            <CardDescription>
              {advancedMode
                ? "Advanced analysis with affordability gap, projections, and multi-city comparison"
                : "Enter your salary and select cities to compare purchasing power and cost differences"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Salary Input with Currency Selector */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary">Your Current Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="75000"
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                  <SelectTrigger id="currency" className="text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                    <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                    <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
                    <SelectItem value="CHF">🇨🇭 CHF - Swiss Franc</SelectItem>
                    <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen</SelectItem>
                    <SelectItem value="NZD">🇳🇿 NZD - New Zealand Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* City Selectors */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Current Location */}
              <div className="space-y-2">
                <Label htmlFor="current-city">Current Location</Label>
                {currentCityData && (
                  <Badge variant="outline" className="mb-2">
                    {currentCityData.country}
                  </Badge>
                )}
                <Select value={currentCity} onValueChange={setCurrentCity}>
                  <SelectTrigger id="current-city">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {Object.entries(citiesByCountry).map(([country, cities]) => (
                      <SelectGroup key={country}>
                        <SelectLabel>{country}</SelectLabel>
                        {cities.map((city) => (
                          <SelectItem key={city.code} value={city.code}>
                            {city.flag} {city.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Location */}
              <div className="space-y-2">
                <Label htmlFor="target-city">Target Location</Label>
                {targetCityData && (
                  <Badge variant="outline" className="mb-2">
                    {targetCityData.country}
                  </Badge>
                )}
                <Select value={targetCity} onValueChange={setTargetCity}>
                  <SelectTrigger id="target-city">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {Object.entries(citiesByCountry).map(([country, cities]) => (
                      <SelectGroup key={country}>
                        <SelectLabel>{country}</SelectLabel>
                        {cities.map((city) => (
                          <SelectItem key={city.code} value={city.code}>
                            {city.flag} {city.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equivalent Salary Result */}
            {currentCityData && targetCityData && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Equivalent Salary Needed</p>
                      <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                        {currencySymbols[targetCityData.currency]}
                        {equivalentSalary.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        To maintain the same standard of living in {targetCityData.name}
                      </p>
                    </div>
                    <ArrowRight className="h-12 w-12 text-green-600 dark:text-green-500" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost Breakdown */}
            {currentCityData && targetCityData && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Home className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs text-muted-foreground mb-1">Housing</p>
                    <p
                      className={`text-lg font-bold ${costDifferences.housing >= 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatPercentage(costDifferences.housing)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-xs text-muted-foreground mb-1">Utilities</p>
                    <p
                      className={`text-lg font-bold ${costDifferences.utilities >= 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatPercentage(costDifferences.utilities)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-xs text-muted-foreground mb-1">Food</p>
                    <p className={`text-lg font-bold ${costDifferences.food >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatPercentage(costDifferences.food)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Car className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-xs text-muted-foreground mb-1">Transportation</p>
                    <p
                      className={`text-lg font-bold ${costDifferences.transportation >= 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatPercentage(costDifferences.transportation)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Building className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                    <p className="text-xs text-muted-foreground mb-1">Overall</p>
                    <p
                      className={`text-lg font-bold ${costDifferences.overall >= 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatPercentage(costDifferences.overall)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {advancedMode && currentCityData && targetCityData && (
              <>
                {/* Affordability Gap */}
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Affordability Gap Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Your Required Salary</p>
                        <p className="text-2xl font-bold text-foreground">
                          {currencySymbols[targetCityData.currency]}
                          {equivalentSalary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Local Salary</p>
                        <p className="text-2xl font-bold text-foreground">
                          {currencySymbols[targetCityData.currency]}
                          {(
                            (averageSalaryByCity[targetCity] || 60000) * exchangeRates[targetCityData.currency]
                          ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {affordabilityGap > 0
                          ? `You would need ${affordabilityGap.toFixed(1)}% MORE than the local average salary`
                          : `You would need ${Math.abs(affordabilityGap).toFixed(1)}% LESS than the local average salary`}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* 5-Year Projection */}
                <Card className="border-orange-200 dark:border-orange-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendIcon className="h-5 w-5" />
                      5-Year Cost Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Based on average annual inflation rate of 3.5%</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Salary Needed</p>
                        <p className="text-2xl font-bold text-foreground">
                          {currencySymbols[targetCityData.currency]}
                          {equivalentSalary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Salary Needed (2031)</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {currencySymbols[targetCityData.currency]}
                          {fiveYearProjection.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your salary needs to increase by{" "}
                        {(((fiveYearProjection - equivalentSalary) / equivalentSalary) * 100).toFixed(1)}% over 5 years
                        to maintain current purchasing power
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Multi-City Comparison */}
                <Card className="border-purple-200 dark:border-purple-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Compare Additional Cities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="space-y-2">
                          <Label htmlFor={`comparison-city-${idx}`}>
                            {idx === 0 ? "Comparison City 1" : "Comparison City 2"}
                          </Label>
                          <Select
                            value={comparisonCities[idx] || ""}
                            onValueChange={(value) => {
                              const newCities = [...comparisonCities]
                              newCities[idx] = value
                              setComparisonCities(newCities.filter(Boolean))
                            }}
                          >
                            <SelectTrigger id={`comparison-city-${idx}`}>
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(citiesByCountry).map(([country, cities]) => (
                                <SelectGroup key={country}>
                                  <SelectLabel>{country}</SelectLabel>
                                  {cities.map((city) => (
                                    <SelectItem key={city.code} value={city.code}>
                                      {city.flag} {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    {/* Comparison Results */}
                    {comparisonCitiesData.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <p className="font-semibold text-sm">Required Salary Comparison:</p>
                        <div className="space-y-3">
                          {comparisonCitiesData.map((city) => {
                            const salary = Number.parseFloat(baseSalary)
                            const salaryInUSD = salary / exchangeRates[salaryCurrency]
                            const costRatio =
                              city.metrics.overall_cost_index / currentCityData.metrics.overall_cost_index
                            const equivalentInUSD = salaryInUSD * costRatio
                            const equivalent = Math.round(equivalentInUSD * exchangeRates[city.currency])

                            return (
                              <div key={city.code} className="flex items-center justify-between p-3 bg-muted rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{city.flag}</span>
                                  <div>
                                    <p className="font-medium text-sm">{city.name}</p>
                                    <p className="text-xs text-muted-foreground">{city.country}</p>
                                  </div>
                                </div>
                                <p className="font-bold">
                                  {currencySymbols[city.currency]}
                                  {equivalent.toLocaleString()}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Regional Insight */}
            {currentCityData && targetCityData && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Regional Insight:</strong> Moving from {currentCityData.name} ({currentCityData.country}) to{" "}
                  {targetCityData.name} ({targetCityData.country}) would{" "}
                  {costDifferences.overall >= 0 ? "increase" : "decrease"} your cost of living by{" "}
                  {Math.abs(costDifferences.overall).toFixed(1)}%{" "}
                  {currentCityData.currency !== targetCityData.currency &&
                    `(after currency conversion from ${currentCityData.currency} to ${targetCityData.currency})`}
                  . You would need {costDifferences.overall >= 0 ? "a higher" : "a lower"} salary to maintain the same
                  standard of living.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {blogEssay && (
          <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                📖 Understanding Cost of Living Differences
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="text-gray-700 dark:text-gray-200 leading-relaxed">{renderBlogContent(blogEssay)}</div>
            </CardContent>
          </Card>
        )}

        {/* Data Sources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Data Sources & Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              All cost of living data is sourced from official government statistical agencies to ensure accuracy and
              reliability:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>United States:</strong> Bureau of Labor Statistics (BLS)
              </div>
              <div>
                <strong>United Kingdom:</strong> Office for National Statistics (ONS)
              </div>
              <div>
                <strong>European Union:</strong> Eurostat
              </div>
              <div>
                <strong>Canada:</strong> Statistics Canada
              </div>
              <div>
                <strong>Australia:</strong> Australian Bureau of Statistics (ABS)
              </div>
              <div>
                <strong>Switzerland:</strong> Swiss Federal Statistical Office (FSO)
              </div>
              <div>
                <strong>Japan:</strong> Statistics Bureau of Japan
              </div>
              <div>
                <strong>New Zealand:</strong> Stats NZ
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {citiesData?.lastUpdated} | Data version: {citiesData?.dataVersion}
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Suspense
            fallback={
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">Loading FAQs...</div>
                </CardContent>
              </Card>
            }
          >
            <FAQ category="regional_cost_of_living" />
          </Suspense>
        </div>
      </div>

      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Regional Cost of Living Comparison</h3>
              <p className="text-gray-300 mb-6">
                Compare cost of living across 80+ cities worldwide with official government data. Make informed
                decisions about relocating with our comprehensive analysis tool.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Coverage</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• 80+ major cities worldwide</li>
                <li>• 8 currency zones covered</li>
                <li>• Official government sources</li>
                <li>• Monthly data updates</li>
                <li>• Housing & utilities costs</li>
                <li>• Food & transportation</li>
                <li>• Cross-currency comparison</li>
                <li>• Historical cost trends</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-blue-400 transition-colors">
                    Home - Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/deflation-calculator" className="hover:text-blue-400 transition-colors">
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="hover:text-blue-400 transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/ppp-calculator" className="hover:text-blue-400 transition-colors">
                    PPP Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/auto-loan-calculator" className="hover:text-blue-400 transition-colors">
                    Auto Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/salary-calculator" className="hover:text-blue-400 transition-colors">
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/retirement-calculator" className="hover:text-blue-400 transition-colors">
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/student-loan-calculator" className="hover:text-blue-400 transition-colors">
                    Student Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/mortgage-calculator" className="hover:text-blue-400 transition-colors">
                    Mortgage Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-calculator" className="hover:text-blue-400 transition-colors">
                    Budget Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-fund-calculator" className="hover:text-blue-400 transition-colors">
                    Emergency Fund Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/roi-calculator" className="hover:text-blue-400 transition-colors">
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/legacy-planner" className="hover:text-blue-400 transition-colors">
                    Legacy Planner
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>© {currentYear} Global Inflation Calculator. Educational purposes only.</p>
            <p className="mt-2">Last Updated: January {currentYear}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
