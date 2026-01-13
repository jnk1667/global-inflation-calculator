"use client"

import { useState, useEffect, useMemo } from "react"
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
import { MapPin, DollarSign, Info, ArrowRight, Home, Zap, ShoppingCart, Car, Building, AlertCircle } from "lucide-react"
import Link from "next/link"
import AdBanner from "@/components/ad-banner"

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

export default function RegionalCostOfLivingPage() {
  const [citiesData, setCitiesData] = useState<CitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [baseSalary, setBaseSalary] = useState("75000")
  const [salaryCurrency, setSalaryCurrency] = useState<string>("USD")
  const [currentCity, setCurrentCity] = useState<string>("newyork-ny")
  const [targetCity, setTargetCity] = useState<string>("london-uk")

  // Load cities data
  useEffect(() => {
    const loadCitiesData = async () => {
      try {
        const response = await fetch("/api/cost-of-living/cities")
        const data = await response.json()
        console.log("[v0] Loaded cities data:", data.totalCities, "cities")
        setCitiesData(data)
      } catch (error) {
        console.error("[v0] Error loading cities data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCitiesData()
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

  const currentYear = new Date().getFullYear()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading city data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <CardTitle className="flex items-center gap-2 text-2xl">
              <DollarSign className="h-6 w-6" />
              Compare Cities
            </CardTitle>
            <CardDescription>
              Enter your salary and select cities to compare purchasing power and cost differences
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
                    <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
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
      </div>

      <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Global Inflation Calculator</h3>
              <p className="text-gray-300 dark:text-gray-50 mb-6">
                Track inflation across major world currencies with historical data from 1913 to {currentYear}.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.youtube.com/@GlobalInflationCalculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  aria-label="Visit our YouTube channel"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.pinterest.com/globalinflationcalculator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-red-600 transition-colors"
                  aria-label="Follow us on Pinterest"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/GInflationCalc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                  aria-label="Follow us on X (Twitter)"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.244H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
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
                <li>
                  <Link href="/" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Home - Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/deflation-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ppp-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    PPP Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auto-loan-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Auto Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/salary-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/retirement-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/student-loan-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Student Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mortgage-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Mortgage Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/budget-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Budget Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/emergency-fund-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Emergency Fund Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roi-calculator"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legacy-planner"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Legacy Planner
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                  >
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
