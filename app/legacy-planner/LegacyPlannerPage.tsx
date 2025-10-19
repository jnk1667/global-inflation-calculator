"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLegacyPlannerContent, type LegacyPlannerContent } from "@/lib/supabase"
import {
  Users,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Heart,
  Calculator,
  Info,
  ArrowRight,
  Home,
  BookOpen,
  Database,
} from "lucide-react"
import Link from "next/link"
import { MarkdownRenderer } from "@/components/markdown-renderer"

// Declare GenerationData type
type GenerationData = {
  generation: number
  generationName: string
  age: number
  nominalValue: number
  realValue: number
  inflationLoss: number
  healthcareLoss: number
  totalLoss: number
  purchasingPowerRetained: number
}

const currencies = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  CHF: { symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
} as const

const portfolioTypes = {
  stocks: { name: "Stock Portfolio", description: "Higher risk, higher returns", return: "~10%" },
  bonds: { name: "Bond Portfolio", description: "Lower risk, stable returns", return: "~5%" },
  mixed: { name: "Mixed Portfolio", description: "Balanced risk and returns", return: "~7.5%" },
} as const

// Historical average returns by currency (approximate annual returns)
const portfolioReturns = {
  USD: { stocks: 0.1, bonds: 0.05, mixed: 0.075 },
  GBP: { stocks: 0.09, bonds: 0.045, mixed: 0.07 },
  EUR: { stocks: 0.085, bonds: 0.04, mixed: 0.065 },
  CAD: { stocks: 0.095, bonds: 0.045, mixed: 0.072 },
  AUD: { stocks: 0.095, bonds: 0.05, mixed: 0.075 },
  CHF: { stocks: 0.08, bonds: 0.035, mixed: 0.06 },
  JPY: { stocks: 0.075, bonds: 0.03, mixed: 0.055 },
  NZD: { stocks: 0.09, bonds: 0.045, mixed: 0.07 },
}

// Average inflation rates by currency
const inflationRates = {
  USD: 0.032,
  GBP: 0.035,
  EUR: 0.025,
  CAD: 0.03,
  AUD: 0.035,
  CHF: 0.015,
  JPY: 0.01,
  NZD: 0.025,
}

// Generation names and typical inheritance ages
const generationInfo = [
  { name: "Your Children", emoji: "👶", inheritanceAge: 30 },
  { name: "Your Grandchildren", emoji: "🧒", inheritanceAge: 28 },
  { name: "Your Great-Grandchildren", emoji: "👦", inheritanceAge: 26 },
  { name: "Your Great-Great-Grandchildren", emoji: "👧", inheritanceAge: 25 },
  { name: "5th Generation Descendants", emoji: "🧑", inheritanceAge: 25 },
]

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Legacy Planner - Multi-Generation Wealth Planning Calculator",
  description:
    "Plan your family's financial legacy across generations. Calculate how inflation affects inheritance, estate planning, and wealth transfer.",
  url: "https://globalinflationcalculator.com/legacy-planner",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Multi-generation wealth projection",
    "Inflation impact calculation",
    "Healthcare cost erosion modeling",
    "Investment growth simulation",
    "Estate planning visualization",
    "Currency conversion support",
  ],
  provider: {
    "@type": "Organization",
    name: "Global Inflation Calculator",
    url: "https://globalinflationcalculator.com",
  },
}

export default function LegacyPlannerPage() {
  const [initialWealth, setInitialWealth] = useState("1000000")
  const [generations, setGenerations] = useState([3])
  const [currency, setCurrency] = useState<keyof typeof currencies>("USD")
  const [portfolioType, setPortfolioType] = useState<keyof typeof portfolioTypes>("mixed")
  const [generationData, setGenerationData] = useState<GenerationData[]>([])
  const [blogContent, setBlogContent] = useState<LegacyPlannerContent>({
    id: "main",
    title: "Understanding Multi-Generational Wealth Planning",
    content: "",
    created_at: "",
    updated_at: "",
  })
  const [blogLoading, setBlogLoading] = useState(true)

  const generationGapYears = 25
  const healthcareMultiplier = 1.81 // Healthcare inflation is 81% higher than general inflation

  const calculateLegacyProjection = () => {
    const wealth = Number.parseFloat(initialWealth)
    if (isNaN(wealth) || wealth <= 0) {
      setGenerationData([])
      return
    }

    const portfolioReturn = portfolioReturns[currency][portfolioType]
    const inflationRate = inflationRates[currency]
    const healthcareInflationRate = inflationRate * healthcareMultiplier

    // Real return after accounting for general inflation
    const realReturn = portfolioReturn - inflationRate

    const results: GenerationData[] = []

    for (let gen = 1; gen <= generations[0]; gen++) {
      const years = gen * generationGapYears
      const genInfo = generationInfo[gen - 1]

      // Calculate nominal value with investment growth
      const nominalValue = wealth * Math.pow(1 + portfolioReturn, years)

      // Calculate real value accounting for general inflation only
      const inflationAdjustedValue = wealth * Math.pow(1 + realReturn, years)

      // Healthcare erosion factor - affects a portion of wealth each generation
      // Assume 2% of wealth is affected by healthcare costs per generation
      const healthcareErosionFactor = 0.02 * gen
      const healthcareErosion =
        inflationAdjustedValue * healthcareErosionFactor * (healthcareInflationRate / inflationRate)

      // Final real value after all erosions
      const finalRealValue = Math.max(0, inflationAdjustedValue - healthcareErosion)

      // Calculate losses for display
      const inflationLoss = nominalValue - inflationAdjustedValue
      const healthcareLoss = healthcareErosion
      const totalLoss = inflationLoss + healthcareLoss
      const purchasingPowerRetained = (finalRealValue / wealth) * 100

      results.push({
        generation: gen,
        generationName: genInfo.name,
        age: genInfo.inheritanceAge,
        nominalValue,
        realValue: finalRealValue,
        inflationLoss,
        healthcareLoss,
        totalLoss,
        purchasingPowerRetained,
      })
    }

    setGenerationData(results)
  }

  const loadBlogContent = async () => {
    try {
      const content = await getLegacyPlannerContent()
      setBlogContent(content)
    } catch (error) {
      console.log("Using default blog content")
      // Keep default content if database fetch fails
    } finally {
      setBlogLoading(false)
    }
  }

  useEffect(() => {
    calculateLegacyProjection()
    loadBlogContent()
  }, [initialWealth, generations, currency, portfolioType])

  const getCurrencyDisplay = (value: number) => {
    const symbol = currencies[currency].symbol
    if (symbol.length > 1 || symbol === "Fr") {
      return `${symbol} ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
    return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header - Added more top padding */}
        <header className="pt-32 pb-8">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Legacy Planner</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how inflation affects wealth transfer across generations
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 pb-16 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Initial Wealth */}
                  <div className="space-y-2">
                    <Label htmlFor="wealth" className="text-sm font-medium">
                      Initial Wealth
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {currencies[currency].symbol}
                      </span>
                      <Input
                        id="wealth"
                        type="number"
                        value={initialWealth}
                        onChange={(e) => setInitialWealth(e.target.value)}
                        className="pl-8 h-11"
                        placeholder="1000000"
                      />
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Currency</Label>
                    <Select value={currency} onValueChange={(value: keyof typeof currencies) => setCurrency(value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(currencies).map(([code, info]) => (
                          <SelectItem key={code} value={code}>
                            {info.flag} {code} - {info.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Portfolio Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Investment Strategy</Label>
                    <Select
                      value={portfolioType}
                      onValueChange={(value: keyof typeof portfolioTypes) => setPortfolioType(value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(portfolioTypes).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            <div className="py-1">
                              <div className="font-medium">{info.name}</div>
                              <div className="text-xs text-gray-500">{info.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Generations */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Generations to Project: {generations[0]}</Label>
                    <Slider
                      value={generations}
                      onValueChange={setGenerations}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>

                  {/* Key Info */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Assumptions:</strong>
                      <br />• 25 years between generations
                      <br />• Healthcare inflation: {(inflationRates[currency] * healthcareMultiplier * 100).toFixed(1)}
                      % annually
                      <br />• General inflation: {(inflationRates[currency] * 100).toFixed(1)}% annually
                      <br />• Portfolio return: {(portfolioReturns[currency][portfolioType] * 100).toFixed(1)}% annually
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Cards */}
              {generationData.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-green-800 dark:text-green-200">
                        {getCurrencyDisplay(Number.parseFloat(initialWealth))}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">Starting Wealth</div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                        {getCurrencyDisplay(generationData[generationData.length - 1]?.realValue || 0)}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Final Value</div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <CardContent className="p-4 text-center">
                      <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-red-800 dark:text-red-200">
                        {(100 - (generationData[generationData.length - 1]?.purchasingPowerRetained || 0)).toFixed(1)}%
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">Purchasing Power Lost</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Generation Timeline */}
              {generationData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Generation Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generationData.map((gen, index) => (
                        <div key={gen.generation}>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-lg">
                                  <span>{generationInfo[gen.generation - 1]?.emoji || "👤"}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Age {gen.age}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{gen.generationName}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Inherit in {gen.generation * generationGapYears} years
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {getCurrencyDisplay(gen.realValue)}
                              </div>
                              <Badge
                                variant={
                                  gen.purchasingPowerRetained > 70
                                    ? "default"
                                    : gen.purchasingPowerRetained > 40
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {gen.purchasingPowerRetained.toFixed(1)}% retained
                              </Badge>
                            </div>
                          </div>

                          {/* Loss Details */}
                          <div className="ml-8 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-red-600 dark:text-red-400">📉 Inflation Loss:</span>{" "}
                                {getCurrencyDisplay(gen.inflationLoss)}
                              </div>
                              <div>
                                <span className="text-orange-600 dark:text-orange-400">🏥 Healthcare Loss:</span>{" "}
                                {getCurrencyDisplay(gen.healthcareLoss)}
                              </div>
                            </div>
                          </div>

                          {index < generationData.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blog Section - Editable via Admin Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {blogContent.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                  {blogLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <MarkdownRenderer content={blogContent.content} />
                  )}
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">What We Calculate:</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Investment growth over time</li>
                        <li>• Inflation impact on purchasing power</li>
                        <li>• Healthcare cost increases</li>
                        <li>• Real value for each generation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Factors:</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• 25-year generation gaps</li>
                        <li>• Healthcare inflation: 81% higher than general</li>
                        <li>• Historical market returns</li>
                        <li>• Currency-specific inflation rates</li>
                      </ul>
                    </div>
                  </div>

                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Estate Planning Tip:</strong> This shows why growth investments and healthcare planning
                      are crucial for preserving generational wealth against inflation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Methodology & Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Methodology & Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Calculation Methodology</h4>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong className="text-gray-800 dark:text-gray-200">Investment Growth:</strong>
                          <p>Nominal Value = Initial Wealth × (1 + Portfolio Return)^Years</p>
                        </div>
                        <div>
                          <strong className="text-gray-800 dark:text-gray-200">Inflation Adjustment:</strong>
                          <p>Real Return = Portfolio Return - Inflation Rate</p>
                          <p>Inflation-Adjusted Value = Initial Wealth × (1 + Real Return)^Years</p>
                        </div>
                        <div>
                          <strong className="text-gray-800 dark:text-gray-200">Healthcare Erosion:</strong>
                          <p>Healthcare Factor = 2% × Generation Number</p>
                          <p>Healthcare Loss = Adjusted Value × Healthcare Factor × Healthcare Multiplier</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Key Assumptions</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Generation Gap:</span>
                          <span className="font-medium">25 years</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Healthcare Multiplier:</span>
                          <span className="font-medium">1.81× general inflation</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Healthcare Impact:</span>
                          <span className="font-medium">2% per generation</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inheritance Age:</span>
                          <span className="font-medium">25-30 years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Data Sources & References</h4>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Inflation Data</h5>
                        <ul className="space-y-1">
                          <li>• U.S. Bureau of Labor Statistics (BLS)</li>
                          <li>• Bank of England Historical Database</li>
                          <li>• European Central Bank Statistical Data</li>
                          <li>• Statistics Canada Consumer Price Index</li>
                          <li>• Reserve Bank of Australia</li>
                          <li>• Swiss National Bank</li>
                          <li>• Bank of Japan</li>
                          <li>• Reserve Bank of New Zealand</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Market Returns</h5>
                        <ul className="space-y-1">
                          <li>• S&P 500 Historical Returns (1913-2024)</li>
                          <li>• FTSE All-Share Index (UK)</li>
                          <li>• EURO STOXX 50 (Europe)</li>
                          <li>• TSX Composite Index (Canada)</li>
                          <li>• ASX All Ordinaries (Australia)</li>
                          <li>• Government Bond Yield Data</li>
                          <li>• Corporate Bond Historical Returns</li>
                          <li>• Mixed Portfolio Benchmarks</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Healthcare Cost Analysis</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <p>
                        Healthcare inflation data sourced from national health expenditure accounts and medical care
                        price indices. The 81% multiplier reflects the historical average of healthcare cost increases
                        relative to general inflation across developed economies from 1980-2024.
                      </p>
                      <p>
                        Sources include: Centers for Medicare & Medicaid Services (CMS), OECD Health Statistics, World
                        Health Organization Global Health Expenditure Database, and national healthcare cost surveys.
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Disclaimer:</strong> All projections are estimates based on historical data and should not
                      be considered as financial advice. Actual results may vary significantly due to market volatility,
                      policy changes, and unforeseen economic events. Consult with qualified financial and estate
                      planning professionals for personalized guidance.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Related Tools */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardHeader>
                    <CardTitle className="text-blue-800 dark:text-blue-200 text-lg">Inflation Calculator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
                      Calculate basic inflation impact on any amount over time
                    </p>
                    <Link href="/">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                      >
                        Calculate Inflation <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200 text-lg">Retirement Calculator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 dark:text-green-300 mb-4 text-sm">
                      Plan retirement with inflation-adjusted projections
                    </p>
                    <Link href="/retirement-calculator">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                      >
                        Plan Retirement <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <CardHeader>
                    <CardTitle className="text-red-800 dark:text-red-200 text-lg">Charts & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700 dark:text-red-300 mb-4 text-sm">
                      Visualize your financial legacy with charts and analytics
                    </p>
                    <Link href="/charts">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                      >
                        View Charts & Analytics <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200 text-lg">
                      Student Loan Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 dark:text-green-300 mb-4 text-sm">
                      Plan your student loan repayment with inflation-adjusted projections
                    </p>
                    <Link href="/student-loan-calculator">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                      >
                        Calculate Student Loan <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Calculators</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Inflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/salary-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Salary Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/retirement-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Retirement Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/deflation-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center"
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Deflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student-loan-calculator"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Student Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/charts"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Charts & Analytics
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Information</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legacy Planning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Understand how inflation affects wealth transfer across generations with our comprehensive legacy
                  planning tool.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                © 2025 Global Inflation Calculator. Legacy planning projections are estimates based on historical data.
              </p>
              <p className="mt-1">
                Data sources: Government statistics, historical market returns, healthcare cost indices.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
