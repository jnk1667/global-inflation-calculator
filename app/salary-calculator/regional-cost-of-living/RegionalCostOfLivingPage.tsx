"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  const [currentCity, setCurrentCity] = useState<string>("newyork-ny")
  const [targetCity, setTargetCity] = useState<string>("london-uk")

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

  // Get selected city data
  const currentCityData = citiesData?.cities.find((c) => c.code === currentCity)
  const targetCityData = citiesData?.cities.find((c) => c.code === targetCity)

  // Calculate equivalent salary
  const equivalentSalary = useMemo(() => {
    if (!currentCityData || !targetCityData || !baseSalary) return 0

    const salary = Number.parseFloat(baseSalary) || 0
    const costRatio = targetCityData.metrics.overall_cost_index / currentCityData.metrics.overall_cost_index

    // Convert to target currency
    const currentToUSD = salary * exchangeRates[currentCityData.currency]
    const usdToTarget = currentToUSD / exchangeRates[targetCityData.currency]

    return Math.round(usdToTarget * costRatio)
  }, [baseSalary, currentCityData, targetCityData])

  // Calculate cost differences
  const costDifferences = useMemo(() => {
    if (!currentCityData || !targetCityData) return null

    const housing =
      ((targetCityData.metrics.housing_cost_percent - currentCityData.metrics.housing_cost_percent) /
        currentCityData.metrics.housing_cost_percent) *
      100
    const utilities =
      ((targetCityData.metrics.utilities_monthly - currentCityData.metrics.utilities_monthly) /
        currentCityData.metrics.utilities_monthly) *
      100
    const food =
      ((targetCityData.metrics.food_monthly - currentCityData.metrics.food_monthly) /
        currentCityData.metrics.food_monthly) *
      100
    const transportation =
      ((targetCityData.metrics.transportation_monthly - currentCityData.metrics.transportation_monthly) /
        currentCityData.metrics.transportation_monthly) *
      100
    const overall =
      ((targetCityData.metrics.overall_cost_index - currentCityData.metrics.overall_cost_index) /
        currentCityData.metrics.overall_cost_index) *
      100

    return { housing, utilities, food, transportation, overall }
  }, [currentCityData, targetCityData])

  // Generate insight
  const insight = useMemo(() => {
    if (!currentCityData || !targetCityData || !costDifferences) return ""

    const direction = costDifferences.overall > 0 ? "increase" : "decrease"
    const percentage = Math.abs(costDifferences.overall).toFixed(1)
    const isCrossCurrency = currentCityData.currency !== targetCityData.currency

    let text = `Moving from ${currentCityData.name} (${currentCityData.country}) to ${targetCityData.name} (${targetCityData.country}) would ${direction} your cost of living by ${percentage}%`

    if (isCrossCurrency) {
      text += ` (after currency conversion from ${currentCityData.currency} to ${targetCityData.currency})`
    }

    text += `. You would need a ${direction === "increase" ? "higher" : "lower"} salary to maintain the same standard of living.`

    return text
  }, [currentCityData, targetCityData, costDifferences])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading cities data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/salary-calculator" className="hover:text-gray-900 transition-colors">
                Salary Calculator
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Regional Cost of Living</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <MapPin className="w-10 h-10 text-blue-600" />
            Regional Cost of Living Comparison
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare cost of living across {citiesData?.totalCities || 20}+ cities worldwide with comprehensive data from
            official government sources
          </p>
        </header>

        <AdBanner slot="top-regional-comparison" />

        {/* Main Comparison Tool */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Compare Cities
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter your salary and select cities to compare purchasing power and cost differences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Base Salary */}
              <div>
                <Label htmlFor="baseSalary" className="text-sm font-semibold mb-2 block">
                  Your Current Salary
                </Label>
                <Input
                  id="baseSalary"
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="75000"
                  className="text-lg"
                />
                {currentCityData && (
                  <p className="text-sm text-gray-600 mt-1">In {currencySymbols[currentCityData.currency]}</p>
                )}
              </div>

              {/* Current City */}
              <div>
                <Label htmlFor="currentCity" className="text-sm font-semibold mb-2 block">
                  Current Location
                </Label>
                {currentCityData && (
                  <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-800">
                    {currentCityData.country}
                  </Badge>
                )}
                <Select value={currentCity} onValueChange={setCurrentCity}>
                  <SelectTrigger id="currentCity" className="text-lg">
                    <SelectValue>
                      {currentCityData && (
                        <span>
                          {currentCityData.flag} {currentCityData.name}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {Object.entries(citiesByCountry).map(([country, cities]) => (
                      <SelectGroup key={country}>
                        <SelectLabel className="text-xs font-semibold text-gray-500 uppercase">{country}</SelectLabel>
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

              {/* Target City */}
              <div>
                <Label htmlFor="targetCity" className="text-sm font-semibold mb-2 block">
                  Target Location
                </Label>
                {targetCityData && (
                  <Badge variant="secondary" className="mb-2 bg-green-100 text-green-800">
                    {targetCityData.country}
                  </Badge>
                )}
                <Select value={targetCity} onValueChange={setTargetCity}>
                  <SelectTrigger id="targetCity" className="text-lg">
                    <SelectValue>
                      {targetCityData && (
                        <span>
                          {targetCityData.flag} {targetCityData.name}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {Object.entries(citiesByCountry).map(([country, cities]) => (
                      <SelectGroup key={country}>
                        <SelectLabel className="text-xs font-semibold text-gray-500 uppercase">{country}</SelectLabel>
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

            {/* Equivalent Salary Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Equivalent Salary Needed</p>
                  <p className="text-4xl font-bold text-green-700">
                    {targetCityData && currencySymbols[targetCityData.currency]}
                    {equivalentSalary.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    To maintain the same standard of living in {targetCityData?.name}
                  </p>
                </div>
                <ArrowRight className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Cost Differences */}
            {costDifferences && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Home className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600 mb-1">Housing</p>
                  <p className={`text-xl font-bold ${costDifferences.housing > 0 ? "text-red-600" : "text-green-600"}`}>
                    {costDifferences.housing > 0 ? "+" : ""}
                    {costDifferences.housing.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-xs text-gray-600 mb-1">Utilities</p>
                  <p
                    className={`text-xl font-bold ${costDifferences.utilities > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {costDifferences.utilities > 0 ? "+" : ""}
                    {costDifferences.utilities.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-xs text-gray-600 mb-1">Food</p>
                  <p className={`text-xl font-bold ${costDifferences.food > 0 ? "text-red-600" : "text-green-600"}`}>
                    {costDifferences.food > 0 ? "+" : ""}
                    {costDifferences.food.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Car className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs text-gray-600 mb-1">Transportation</p>
                  <p
                    className={`text-xl font-bold ${costDifferences.transportation > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {costDifferences.transportation > 0 ? "+" : ""}
                    {costDifferences.transportation.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <Building className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600 mb-1">Overall</p>
                  <p className={`text-xl font-bold ${costDifferences.overall > 0 ? "text-red-600" : "text-green-600"}`}>
                    {costDifferences.overall > 0 ? "+" : ""}
                    {costDifferences.overall.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Regional Insight */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-gray-700">
                <strong className="font-semibold">Regional Insight:</strong> {insight}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <AdBanner slot="middle-regional-comparison" />

        {/* Data Sources */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Data Sources & Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                Our cost of living data is sourced from official government agencies and updated regularly to ensure
                accuracy:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <strong>United States:</strong> Bureau of Labor Statistics (BLS) - Updated monthly
                </li>
                <li>
                  <strong>United Kingdom:</strong> Office for National Statistics (ONS) - Updated quarterly
                </li>
                <li>
                  <strong>European Union:</strong> Eurostat - Updated quarterly
                </li>
                <li>
                  <strong>Canada:</strong> Statistics Canada - Updated monthly
                </li>
                <li>
                  <strong>Australia:</strong> Australian Bureau of Statistics (ABS) - Updated quarterly
                </li>
                <li>
                  <strong>Switzerland:</strong> Swiss Federal Statistical Office - Updated annually
                </li>
                <li>
                  <strong>Japan:</strong> Statistics Bureau of Japan - Updated monthly
                </li>
                <li>
                  <strong>New Zealand:</strong> Stats NZ - Updated quarterly
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Last data update: {citiesData?.lastUpdated} • Data version: {citiesData?.dataVersion}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/salary-calculator">
            <Button variant="outline" size="lg">
              Back to Salary Calculator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
