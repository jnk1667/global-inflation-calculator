"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, TrendingUpIcon, DollarSignIcon, CalendarIcon, BarChart3Icon, AlertTriangleIcon, InfoIcon, SettingsIcon, Zap, HelpCircle } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"

interface CalculationResult {
  currentPremium: number
  currentAge: number
  yearsProjected: number
  projectedPremium: number
  totalIncrease: number
  percentageIncrease: number
  annualGrowthRate: number
  familyMultiplier: number
  planMultiplier: number
  regionMultiplier: number
  medicalInflationRate: number
  smokingMultiplier?: number
  ageMultiplier?: number
  baseForProjection?: number
}

interface ScenarioComparison {
  name: string
  inflationRate: number
  projectedPremium: number
  totalIncrease: number
  percentageIncrease: number
}

interface ChartDataPoint {
  year: number
  premium: number
  generalInflation: number
  medicalInflation: number
  scenario1?: number
  scenario2?: number
  scenario3?: number
}

interface CurrencyConfig {
  code: string
  country: string
  dataFile: string
  symbol: string
  medicalInflationRate: number
  regions: { [key: string]: string }
}

// Currency configurations
const CURRENCY_CONFIGS: { [key: string]: CurrencyConfig } = {
  USD: {
    code: "USD",
    country: "United States",
    dataFile: "/data/insurance-calculator.json",
    symbol: "$",
    medicalInflationRate: 5.4,
    regions: {
      Alabama: "Alabama",
      Alaska: "Alaska",
      Arizona: "Arizona",
      Arkansas: "Arkansas",
      California: "California",
      Colorado: "Colorado",
      Connecticut: "Connecticut",
      Delaware: "Delaware",
      Florida: "Florida",
      Georgia: "Georgia",
      Hawaii: "Hawaii",
      Idaho: "Idaho",
      Illinois: "Illinois",
      Indiana: "Indiana",
      Iowa: "Iowa",
      Kansas: "Kansas",
      Kentucky: "Kentucky",
      Louisiana: "Louisiana",
      Maine: "Maine",
      Maryland: "Maryland",
      Massachusetts: "Massachusetts",
      Michigan: "Michigan",
      Minnesota: "Minnesota",
      Mississippi: "Mississippi",
      Missouri: "Missouri",
      Montana: "Montana",
      Nebraska: "Nebraska",
      Nevada: "Nevada",
      "New Hampshire": "New Hampshire",
      "New Jersey": "New Jersey",
      "New Mexico": "New Mexico",
      "New York": "New York",
      "North Carolina": "North Carolina",
      "North Dakota": "North Dakota",
      Ohio: "Ohio",
      Oklahoma: "Oklahoma",
      Oregon: "Oregon",
      Pennsylvania: "Pennsylvania",
      "Rhode Island": "Rhode Island",
      "South Carolina": "South Carolina",
      "South Dakota": "South Dakota",
      Tennessee: "Tennessee",
      Texas: "Texas",
      Utah: "Utah",
      Vermont: "Vermont",
      Virginia: "Virginia",
      Washington: "Washington",
      "West Virginia": "West Virginia",
      Wisconsin: "Wisconsin",
      Wyoming: "Wyoming",
      DC: "Washington D.C.",
    },
  },
  GBP: {
    code: "GBP",
    country: "United Kingdom",
    dataFile: "/data/international-insurance/insurance-calculator-gbp.json",
    symbol: "£",
    medicalInflationRate: 4.1,
    regions: {
      National: "National",
      "London & South East": "London & South East",
      Midlands: "Midlands",
      "North West": "North West",
      "North East": "North East",
      "South West": "South West",
      "East Anglia": "East Anglia",
      Wales: "Wales",
      Scotland: "Scotland",
    },
  },
  CAD: {
    code: "CAD",
    country: "Canada",
    dataFile: "/data/international-insurance/insurance-calculator-cad.json",
    symbol: "C$",
    medicalInflationRate: 6.2,
    regions: {
      National: "National",
      Alberta: "Alberta",
      "British Columbia": "British Columbia",
      Manitoba: "Manitoba",
      "New Brunswick": "New Brunswick",
      "Newfoundland and Labrador": "Newfoundland and Labrador",
      "Nova Scotia": "Nova Scotia",
      Ontario: "Ontario",
      "Prince Edward Island": "Prince Edward Island",
      Quebec: "Quebec",
      Saskatchewan: "Saskatchewan",
    },
  },
  AUD: {
    code: "AUD",
    country: "Australia",
    dataFile: "/data/international-insurance/insurance-calculator-aud.json",
    symbol: "A$",
    medicalInflationRate: 5.8,
    regions: {
      National: "National",
      "New South Wales": "New South Wales",
      Victoria: "Victoria",
      Queensland: "Queensland",
      "South Australia": "South Australia",
      "Western Australia": "Western Australia",
      Tasmania: "Tasmania",
      "Northern Territory": "Northern Territory",
      "Australian Capital Territory": "Australian Capital Territory",
    },
  },
  CHF: {
    code: "CHF",
    country: "Switzerland",
    dataFile: "/data/international-insurance/insurance-calculator-chf.json",
    symbol: "CHF",
    medicalInflationRate: 4.5,
    regions: {
      National: "National",
      "Aargau": "Aargau",
      "Appenzell Ausserrhoden": "Appenzell Ausserrhoden",
      "Appenzell Innerrhoden": "Appenzell Innerrhoden",
      "Basel-Landschaft": "Basel-Landschaft",
      "Basel-Stadt": "Basel-Stadt",
      Bern: "Bern",
      Fribourg: "Fribourg",
      Geneva: "Geneva",
      Glarus: "Glarus",
      Graubünden: "Graubünden",
      Jura: "Jura",
      Lucerne: "Lucerne",
      Neuchâtel: "Neuchâtel",
      Nidwalden: "Nidwalden",
      Obwalden: "Obwalden",
      Schaffhausen: "Schaffhausen",
      Solothurn: "Solothurn",
      "St. Gallen": "St. Gallen",
      Thurgau: "Thurgau",
      Ticino: "Ticino",
      Uri: "Uri",
      Valais: "Valais",
      Vaud: "Vaud",
      Zug: "Zug",
      Zurich: "Zurich",
    },
  },
  EUR: {
    code: "EUR",
    country: "European Union",
    dataFile: "/data/international-insurance/insurance-calculator-eur-germany.json",
    symbol: "€",
    medicalInflationRate: 3.8,
    regions: {
      Germany: "Germany",
      France: "France",
      "Other EU": "Other EU Countries",
    },
  },
  JPY: {
    code: "JPY",
    country: "Japan",
    dataFile: "/data/international-insurance/insurance-calculator-jpy.json",
    symbol: "¥",
    medicalInflationRate: 2.8,
    regions: {
      National: "National",
      Tokyo: "Tokyo",
      Osaka: "Osaka",
      Kyoto: "Kyoto",
      Yokohama: "Yokohama",
      Other: "Other Prefectures",
    },
  },
  NZD: {
    code: "NZD",
    country: "New Zealand",
    dataFile: "/data/international-insurance/insurance-calculator-nzd.json",
    symbol: "NZ$",
    medicalInflationRate: 5.5,
    regions: {
      National: "National",
      "Auckland": "Auckland",
      "Waikato": "Waikato",
      "Bay of Plenty": "Bay of Plenty",
      "Gisborne": "Gisborne",
      "Hawke's Bay": "Hawke's Bay",
      "Taranaki": "Taranaki",
      "Manawatū-Wanganui": "Manawatū-Wanganui",
      "Wellington": "Wellington",
      "Tasman": "Tasman",
      "Canterbury": "Canterbury",
      "Otago": "Otago",
      "Southland": "Southland",
    },
  },
}

export default function InsuranceInflationCalculatorPage() {
  const [advancedMode, setAdvancedMode] = useState(false)
  const [currency, setCurrency] = useState("USD")
  const [currentAge, setCurrentAge] = useState("35")
  const [currentPremium, setCurrentPremium] = useState("300")
  const [familySize, setFamilySize] = useState("individual")
  const [planType, setPlanType] = useState("silver")
  const [region, setRegion] = useState("California")
  const [yearsProjected, setYearsProjected] = useState("10")
  const [smoking, setSmoking] = useState("no")
  const [customInflationRate, setCustomInflationRate] = useState("3.8")
  const [showScenarios, setShowScenarios] = useState(false)

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [insuranceData, setInsuranceData] = useState<any>(null)
  const [healthcareInflationData, setHealthcareInflationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [blogContent, setBlogContent] = useState("")
  const [methodology, setMethodology] = useState("")
  const [faqItems, setFaqItems] = useState<any[]>([])
  const [contentLoaded, setContentLoaded] = useState(false)

  // Update region when currency changes
  useEffect(() => {
    const config = CURRENCY_CONFIGS[currency]
    const firstRegion = Object.keys(config.regions)[0]
    setRegion(firstRegion)
  }, [currency])

  // Load data files based on currency
  useEffect(() => {
    const loadData = async () => {
      try {
        const config = CURRENCY_CONFIGS[currency]
        const insuranceResponse = await fetch(config.dataFile)
        const insuranceJson = await insuranceResponse.json()
        setInsuranceData(insuranceJson)

        const healthcareFile = currency === "USD" ? "/data/healthcare-inflation.json" : `${config.dataFile}`
        const healthcareResponse = await fetch(healthcareFile)
        const healthcareJson = await healthcareResponse.json()
        setHealthcareInflationData(healthcareJson)
      } catch (error) {
        console.error(`Error loading data for ${currency}:`, error)
      }
    }

    loadData()
  }, [currency])

  // Load blog content and FAQ
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Fetch blog and methodology from API
        const blogResponse = await fetch("/api/insurance-inflation-blog")
        const blogData = await blogResponse.json()
        if (blogData.success && blogData.data) {
          setBlogContent(blogData.data.essay || "")
          setMethodology(blogData.data.methodology || "")
        }

        // Fetch FAQs specific to insurance
        const { data: faqData } = await supabase
          .from("faqs")
          .select("*")
          .eq("category", "insurance")

        if (faqData) {
          setFaqItems(faqData)
        }

        setContentLoaded(true)
      } catch (error) {
        console.error("Error loading content:", error)
        setContentLoaded(true)
      }
    }

    loadContent()
  }, [])

  const calculateProjection = () => {
    if (!insuranceData || !healthcareInflationData) return

    const age = Number.parseInt(currentAge)
    const premium = Number.parseFloat(currentPremium)
    const years = Number.parseInt(yearsProjected)
    const config = CURRENCY_CONFIGS[currency]

    let ageMultiplier = 1.0
    let familyMultiplier = 1.0
    let planMultiplier = 1.0
    let regionMultiplier = 1.0
    let smokingMultiplier = smoking === "yes" ? 1.5 : 1.0

    if (insuranceData?.ageMultipliers?.data) {
      ageMultiplier = insuranceData.ageMultipliers.data[age.toString()] || 1.0
    }

    if (insuranceData?.familySizeMultipliers?.data) {
      let familyKey = familySize
      if (familySize === "individual") familyKey = "Individual"
      else if (familySize === "individual+spouse") familyKey = "Individual+Spouse"
      else if (familySize === "individual+1child") familyKey = "Individual+1Child"
      else if (familySize === "individual+2children") familyKey = "Individual+2Children"
      else if (familySize === "individual+3plus") familyKey = "Individual+3orMore"
      else if (familySize === "family4") familyKey = "Family of 4"
      else if (familySize === "family5plus") familyKey = "Family of 5+"
      familyMultiplier = insuranceData.familySizeMultipliers.data[familyKey] || 1.0
    }

    if (insuranceData?.planTypeMultipliers?.metalLevels) {
      let planKey = planType.charAt(0).toUpperCase() + planType.slice(1).toLowerCase()
      planMultiplier = insuranceData.planTypeMultipliers.metalLevels[planKey] || 1.0
    }

    if (insuranceData?.regions?.data) {
      const regionMultiplierValue = insuranceData.regions.data[region]
      if (regionMultiplierValue !== undefined) {
        regionMultiplier = regionMultiplierValue
      }
    } else if (insuranceData?.statePremiumVariations?.data) {
      const statePremium = insuranceData.statePremiumVariations.data[region] || 438
      regionMultiplier = statePremium / (insuranceData.statePremiumVariations.nationalAverage || 438)
    }

    if (currency === "JPY") {
      smokingMultiplier = 1.0
    }

    const combinedMultiplier = ageMultiplier * familyMultiplier * planMultiplier * regionMultiplier * smokingMultiplier
    const currentPremiumDisplay = premium
    const baseForProjection = premium * combinedMultiplier

    let medicalInflationRate = advancedMode && customInflationRate ? Number.parseFloat(customInflationRate) / 100 : config.medicalInflationRate / 100
    
    if (!advancedMode && healthcareInflationData?.data && Array.isArray(healthcareInflationData.data)) {
      medicalInflationRate =
        healthcareInflationData.data.reduce((sum: number, item: any) => sum + item.healthcareInflation, 0) /
        healthcareInflationData.data.length /
        100
    }

    const projectedPremium = baseForProjection * Math.pow(1 + medicalInflationRate, years)
    const totalIncrease = projectedPremium - baseForProjection
    const percentageIncrease = ((projectedPremium - baseForProjection) / baseForProjection) * 100
    const annualGrowthRate = (medicalInflationRate * 100).toFixed(2)

    setResult({
      currentPremium: currentPremiumDisplay,
      currentAge: age,
      yearsProjected: years,
      projectedPremium,
      totalIncrease,
      percentageIncrease,
      annualGrowthRate: Number.parseFloat(annualGrowthRate as string),
      familyMultiplier,
      planMultiplier,
      regionMultiplier,
      medicalInflationRate: medicalInflationRate * 100,
      smokingMultiplier,
      ageMultiplier,
      baseForProjection,
    })

    // Generate chart data
    const chartPoints: ChartDataPoint[] = []
    const s1Rate = config.medicalInflationRate / 100 * 0.8 // Conservative scenario
    const s2Rate = config.medicalInflationRate / 100 // Current scenario
    const s3Rate = config.medicalInflationRate / 100 * 1.2 // Aggressive scenario

    for (let year = 0; year <= years; year++) {
      chartPoints.push({
        year: new Date().getFullYear() + year,
        premium: baseForProjection * Math.pow(1 + medicalInflationRate, year),
        generalInflation: year * 2.5,
        medicalInflation: medicalInflationRate * 100 * year,
        scenario1: baseForProjection * Math.pow(1 + s1Rate, year),
        scenario2: baseForProjection * Math.pow(1 + s2Rate, year),
        scenario3: baseForProjection * Math.pow(1 + s3Rate, year),
      })
    }
    setChartData(chartPoints)
  }

  if (!contentLoaded) {
    return (
      <div className="min-h-screen bg-background" style={{ contain: "layout style" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading calculator...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20" style={{ contain: "layout style" }}>
      <div className="container mx-auto px-4 pt-40 pb-24">
        {/* Header with Mode Toggle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Insurance Inflation Calculator</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how your health insurance premiums will grow over time with medical inflation projections. Plan ahead and understand the real cost of healthcare.
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">Using Live 2026 Medical Inflation Data</p>

          {/* Advanced Mode Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-md flex items-center gap-3 border border-gray-200 dark:border-gray-700">
              <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Label className="text-sm font-medium">Advanced Mode</Label>
              <Switch checked={advancedMode} onCheckedChange={setAdvancedMode} className="ml-2" />
              {advancedMode && <Zap className="w-4 h-4 text-amber-500" />}
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Input Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5" />
                Your Information
              </CardTitle>
              <CardDescription className="text-blue-100">Enter your details to forecast insurance costs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label>Currency & Country</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - United States</SelectItem>
                    <SelectItem value="GBP">GBP - United Kingdom</SelectItem>
                    <SelectItem value="CAD">CAD - Canada</SelectItem>
                    <SelectItem value="AUD">AUD - Australia</SelectItem>
                    <SelectItem value="CHF">CHF - Switzerland</SelectItem>
                    <SelectItem value="EUR">EUR - European Union</SelectItem>
                    <SelectItem value="JPY">JPY - Japan</SelectItem>
                    <SelectItem value="NZD">NZD - New Zealand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Region/State</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCY_CONFIGS[currency].regions).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Current Age</Label>
                <Input
                  type="number"
                  min="18"
                  max="99"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Current Monthly Premium ({CURRENCY_CONFIGS[currency].symbol})</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={currentPremium}
                  onChange={(e) => setCurrentPremium(e.target.value)}
                  className="mt-2"
                  placeholder="e.g., 320, 323, 303"
                />
              </div>

              <div>
                <Label>Family Size</Label>
                <Select value={familySize} onValueChange={setFamilySize}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="individual+spouse">Individual + Spouse</SelectItem>
                    <SelectItem value="individual+1child">Individual + 1 Child</SelectItem>
                    <SelectItem value="individual+2children">Individual + 2 Children</SelectItem>
                    <SelectItem value="individual+3plus">Individual + 3+ Children</SelectItem>
                    <SelectItem value="family4">Family of 4</SelectItem>
                    <SelectItem value="family5plus">Family of 5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plan Type</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="catastrophic">Catastrophic</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Years to Project</Label>
                <Select value={yearsProjected} onValueChange={setYearsProjected}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Smoker?</Label>
                <Select value={smoking} onValueChange={setSmoking}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes (50% surcharge applied)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Mode Options */}
              {advancedMode && (
                <>
                  <Separator />
                  <div>
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Custom Medical Inflation Rate (%)
                    </Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[Number(customInflationRate)]}
                        onValueChange={(v) => setCustomInflationRate(v[0].toString())}
                        min={1}
                        max={10}
                        step={0.1}
                        className="mt-2"
                      />
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={customInflationRate}
                        onChange={(e) => setCustomInflationRate(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Default: {CURRENCY_CONFIGS[currency].medicalInflationRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showScenarios}
                      onChange={(e) => setShowScenarios(e.target.checked)}
                      className="w-4 h-4"
                      id="scenarios"
                    />
                    <label htmlFor="scenarios" className="text-sm font-medium cursor-pointer">
                      Show Scenario Comparison
                    </label>
                  </div>
                </>
              )}

              <Button onClick={calculateProjection} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Calculate Premium Forecast
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {result ? (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle>Premium Forecast</CardTitle>
                <CardDescription className="text-cyan-100">
                  Projected costs in {Number.parseInt(yearsProjected) === 1 ? "1 year" : `${yearsProjected} years`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Current Monthly Premium:</span>
                  <span className="text-2xl font-bold text-blue-600">{CURRENCY_CONFIGS[currency].symbol}{Math.round(result.currentPremium)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Projected Monthly Premium:</span>
                  <span className="text-2xl font-bold text-cyan-600">{CURRENCY_CONFIGS[currency].symbol}{Math.round(result.projectedPremium)}</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Increase:</span>
                    <Badge variant="destructive">{CURRENCY_CONFIGS[currency].symbol}{Math.round(result.totalIncrease)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentage Increase:</span>
                    <Badge variant="secondary">{result.percentageIncrease.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Growth Rate:</span>
                    <Badge className="bg-orange-600">{result.annualGrowthRate.toFixed(2)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Inflation Rate:</span>
                    <Badge className="bg-purple-600">{result.medicalInflationRate.toFixed(2)}%</Badge>
                  </div>
                </div>

                {advancedMode && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Multiplier Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <div>Age: {(result.ageMultiplier || 1).toFixed(2)}x</div>
                        <div>Family: {result.familyMultiplier.toFixed(2)}x</div>
                        <div>Plan: {result.planMultiplier.toFixed(2)}x</div>
                        <div>Region: {result.regionMultiplier.toFixed(2)}x</div>
                        {result.smokingMultiplier && <div>Smoking: {result.smokingMultiplier.toFixed(2)}x</div>}
                      </div>
                      <p className="text-xs text-gray-500 pt-2">
                        Base annual premium: {CURRENCY_CONFIGS[currency].symbol}{Math.round((result.baseForProjection || 0) * 12)}
                      </p>
                    </div>
                  </>
                )}

                <Alert className="mt-6">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Medical inflation ({result.medicalInflationRate.toFixed(2)}%/year) consistently outpaces general inflation (2.7%/year), making healthcare costs one of
                    the fastest-growing household expenses.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle>Premium Forecast</CardTitle>
                <CardDescription className="text-cyan-100">Enter your information and calculate above</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Calculate to see your insurance cost forecast</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Advanced Chart with Scenarios */}
        {chartData.length > 0 && (
          <Card className="mb-12 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5" />
                Premium Growth Over Time {advancedMode && showScenarios && <Badge className="ml-auto bg-amber-600">With Scenarios</Badge>}
              </CardTitle>
              <CardDescription>Insurance premium vs general inflation comparison</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400} style={{ contain: "layout" }}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${CURRENCY_CONFIGS[currency].symbol}${Math.round(value as number)}`}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="premium" stroke="hsl(200 100% 50%)" strokeWidth={3} name="Main Projection" />
                  {advancedMode && showScenarios && (
                    <>
                      <Line type="monotone" dataKey="scenario1" stroke="hsl(100 70% 50%)" strokeWidth={2} strokeDasharray="5 5" name="Conservative (-20%)" />
                      <Line type="monotone" dataKey="scenario3" stroke="hsl(0 70% 50%)" strokeWidth={2} strokeDasharray="5 5" name="Aggressive (+20%)" />
                    </>
                  )}
                  <Line type="monotone" dataKey="generalInflation" stroke="hsl(0 0% 50%)" strokeWidth={2} strokeDasharray="5 5" name="General Inflation Baseline" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Blog Section */}
        {blogContent && (
          <Card className="mb-12 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Understanding Insurance Inflation
              </CardTitle>
              <CardDescription>Comprehensive guide to healthcare costs and medical inflation trends</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={blogContent} />
            </CardContent>
          </Card>
        )}

        {/* Data Sources & Methodology Section */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              Data Sources & Methodology
            </CardTitle>
            <CardDescription>Understanding our calculations and data sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BarChart3Icon className="w-4 h-4" />
                  Medical Inflation Rates
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>United States (USD):</span>
                    <Badge>5.4%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Eurozone (EUR):</span>
                    <Badge>4.2%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>United Kingdom (GBP):</span>
                    <Badge>4.8%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Canada (CAD):</span>
                    <Badge>4.6%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Australia (AUD):</span>
                    <Badge>4.1%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Switzerland (CHF):</span>
                    <Badge>3.9%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Japan (JPY):</span>
                    <Badge>3.2%/year</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>New Zealand (NZD):</span>
                    <Badge>4.3%/year</Badge>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Premium Factors</h3>
                <div className="space-y-3 text-sm">
                  <p><strong>Age Adjustments:</strong> Premiums increase with age due to higher medical utilization.</p>
                  <p><strong>Family Size Multipliers:</strong> Covering more people increases total costs proportionally.</p>
                  <p><strong>Plan Types:</strong> Bronze, Silver, Gold, and Platinum plans have varying cost structures.</p>
                  <p><strong>Regional Variations:</strong> Healthcare costs vary significantly by geographic location.</p>
                  <p><strong>Smoking Status:</strong> Smokers typically face higher insurance premiums.</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Data Sources</h3>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>National health insurance premium data from official health authorities</li>
                <li>OECD Health Statistics database for international healthcare costs</li>
                <li>WHO Global Health Observatory for health expenditure trends</li>
                <li>National statistical agencies for CPI and medical inflation indices</li>
                <li>Insurance industry actuarial reports and health cost projections</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">Calculation Method</h3>
              <p className="text-sm mb-3">
                Our calculator uses a compound growth model that applies annual medical inflation rates to your current premium. The calculation accounts for:
              </p>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Your current premium as the base amount</li>
                <li>Personal factors (age, family size, smoking status)</li>
                <li>Plan type and coverage level</li>
                <li>Regional healthcare cost variations</li>
                <li>Historical and projected medical inflation rates</li>
                <li>Compound annual growth over your projection period</li>
              </ol>
            </div>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                These projections are estimates based on historical trends and current data. Actual insurance costs may vary due to policy changes, market conditions, and individual circumstances.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <Card className="mb-12 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions about insurance inflation and healthcare costs</CardDescription>
            </CardHeader>
            <CardContent>
              <FAQ items={faqItems} />
            </CardContent>
          </Card>
        )}

        {/* Footer Section */}
        <footer className="mt-16 bg-slate-900 text-white rounded-lg shadow-lg">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Insurance Inflation Calculator</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Track insurance cost growth across 8 major currencies with medical inflation projections. Make informed decisions about your healthcare costs with historical data and future projections.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Data Sources</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>National Health Authorities</li>
                  <li>OECD Health Statistics</li>
                  <li>World Health Organization</li>
                  <li>Insurance Industry Reports</li>
                  <li>Statistical Agencies</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                  <li><Link href="/charts" className="hover:text-white transition">Charts & Analytics</Link></li>
                  <li><Link href="/mortgage-calculator" className="hover:text-white transition">Mortgage Calculator</Link></li>
                  <li><Link href="/retirement-calculator" className="hover:text-white transition">Retirement Calculator</Link></li>
                  <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                </ul>
              </div>
            </div>

            <Separator className="bg-slate-700 mb-8" />

            <div className="text-center text-slate-400 text-sm">
              <p>© 2026 Global Inflation Calculator. Educational purposes only.</p>
              <p className="mt-2">
                <Link href="/privacy" className="hover:text-white transition mr-4">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
