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
}

interface ScenarioComparison {
  name: string
  inflationRate: number
  projectedPremium: number
  totalIncrease: number
  percentageIncrease: number
}

interface AdvancedMetrics {
  monthlyIncrease: number
  yearlyIncrease: number
  breakEvenAnalysis: string
  inflationBreakdown: {
    medicalInflation: number
    generalInflation: number
    differencePercentage: number
  }
  multiplierBreakdown: {
    ageMultiplier: number
    familyMultiplier: number
    planMultiplier: number
    regionMultiplier: number
    smokingMultiplier: number
    combinedMultiplier: number
  }
  scenarios: ScenarioComparison[]
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

export default function InsuranceInflationCalculatorPage() {
  const [currentAge, setCurrentAge] = useState(35)
  const [yearsToProject, setYearsToProject] = useState(10)
  const [currentPremium, setCurrentPremium] = useState(300)
  const [familySize, setFamilySize] = useState("individual")
  const [planType, setPlanType] = useState("silver")
  const [currency, setCurrency] = useState("EUR")
  const [region, setRegion] = useState("Germany")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [enableScenarios, setEnableScenarios] = useState(false)
  const [customInflationRate, setCustomInflationRate] = useState(4.2)
  const [insuranceData, setInsuranceData] = useState<any>(null)
  const [healthcareInflationData, setHealthcareInflationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [blogContent, setBlogContent] = useState("")
  const [faqItems, setFaqItems] = useState<any[]>([])
  const [contentLoaded, setContentLoaded] = useState(false)

  // Medical inflation rates by currency/country
  const medicalInflationRates: Record<string, number> = {
    EUR: 4.2,
    USD: 5.4,
    GBP: 4.8,
    CAD: 4.6,
    AUD: 4.1,
    CHF: 3.9,
    JPY: 3.2,
    NZD: 4.3,
  }

  // Currency to default region mapping
  const currencyToRegion: Record<string, string> = {
    EUR: "Germany",
    USD: "USA",
    GBP: "UK",
    CAD: "Canada",
    AUD: "Australia",
    CHF: "Switzerland",
    JPY: "Japan",
    NZD: "New Zealand",
  }

  // Family size multipliers
  const familyMultipliers: Record<string, number> = {
    individual: 1.0,
    couple: 1.8,
    family_3: 2.4,
    family_4: 3.0,
    family_5plus: 3.6,
  }

  // Plan type multipliers
  const planMultipliers: Record<string, number> = {
    bronze: 0.7,
    silver: 1.0,
    gold: 1.3,
    platinum: 1.6,
  }

  // Regional premium adjustments
  const regionAdjustments: Record<string, number> = {
    Germany: 1.0,
    France: 0.95,
    Italy: 0.85,
    Spain: 0.8,
    UK: 1.1,
    USA: 1.4,
    Canada: 1.15,
    Australia: 1.2,
    Switzerland: 1.5,
    Japan: 1.05,
    "New Zealand": 1.0,
  }

  // Age multipliers (base rate increases with age)
  const getAgeMultiplier = (age: number): number => {
    if (age < 30) return 0.8
    if (age < 40) return 1.0
    if (age < 50) return 1.3
    if (age < 60) return 1.7
    return 2.5
  }

  const calculateInsurance = (): CalculationResult | null => {
    try {
      const baseInflation = customInflationRate || medicalInflationRates[currency] || 4.2
      const ageMultiplier = getAgeMultiplier(currentAge)
      const familyMult = familyMultipliers[familySize] || 1.0
      const planMult = planMultipliers[planType] || 1.0
      const regionMult = regionAdjustments[region] || 1.0

      const basePremium = currentPremium * ageMultiplier * regionMult
      const projectedPremium = basePremium * Math.pow(1 + baseInflation / 100, yearsToProject) * familyMult * planMult

      return {
        currentPremium: currentPremium * familyMult * planMult,
        currentAge,
        yearsProjected: yearsToProject,
        projectedPremium,
        totalIncrease: projectedPremium - currentPremium * familyMult * planMult,
        percentageIncrease: ((projectedPremium - currentPremium * familyMult * planMult) / (currentPremium * familyMult * planMult)) * 100,
        annualGrowthRate: baseInflation,
        familyMultiplier: familyMult,
        planMultiplier: planMult,
        regionMultiplier: regionMult,
        medicalInflationRate: baseInflation,
      }
    } catch (error) {
      console.error("Calculation error:", error)
      return null
    }
  }

  const result = calculateInsurance()

  // Sync region when currency changes
  useEffect(() => {
    const defaultRegion = currencyToRegion[currency]
    if (defaultRegion && region !== defaultRegion) {
      setRegion(defaultRegion)
      console.log("[v0] Currency changed to", currency, "- updating region to", defaultRegion)
    }
  }, [currency])

  // Update custom inflation rate when currency changes
  useEffect(() => {
    const defaultRate = medicalInflationRates[currency] || 4.2
    setCustomInflationRate(defaultRate)
    console.log("[v0] Updating inflation rate for", currency, "to", defaultRate)
  }, [currency])

  // Generate chart data
  const generateChartData = (): ChartDataPoint[] => {
    if (!result) {
      console.log("[v0] No result - cannot generate chart data")
      return []
    }
    const data: ChartDataPoint[] = []
    const baseInflation = customInflationRate || medicalInflationRates[currency] || 4.2

    console.log("[v0] Generating chart data with inflation rate:", baseInflation, "for", yearsToProject, "years")

    for (let year = 0; year <= yearsToProject; year++) {
      const premium = result.currentPremium * Math.pow(1 + baseInflation / 100, year)
      const generalInflation = 2.5
      const medicalInflation = baseInflation

      data.push({
        year: new Date().getFullYear() + year,
        premium: Math.round(premium * 100) / 100,
        generalInflation,
        medicalInflation,
      })

      if (enableScenarios) {
        const conservativeRate = baseInflation - 2
        const aggressiveRate = baseInflation + 2
        data[data.length - 1].scenario1 = Math.round(result.currentPremium * Math.pow(1 + conservativeRate / 100, year) * 100) / 100
        data[data.length - 1].scenario2 = premium
        data[data.length - 1].scenario3 = Math.round(result.currentPremium * Math.pow(1 + aggressiveRate / 100, year) * 100) / 100
      }
    }

    console.log("[v0] Generated chart data with", data.length, "points:", data.slice(0, 3))
    return data
  }

  // Load blog content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const blogResponse = await fetch("/api/insurance-inflation-blog")
        const blogData = await blogResponse.json()
        if (blogData.success && blogData.data) {
          setBlogContent(blogData.data.essay || "")
        }

        const { data: faqData } = await supabase.from("faqs").select("*").eq("category", "insurance")

        if (faqData) {
          setFaqItems(faqData)
        }

        setContentLoaded(true)
      } catch (error) {
        console.error("Error loading content:", error)
      }
    }

    loadContent()
  }, [])

  const chartData = generateChartData()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-32">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white text-balance flex items-center justify-center gap-3">
            <Heart className="w-10 h-10 text-red-500" />
            Insurance Inflation Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-balance">
            See how your health insurance premiums will grow over time with medical inflation projections. Plan ahead and understand the real cost of healthcare.
          </p>
        </div>

        {/* Calculator Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <SettingsIcon className="h-6 w-6 text-blue-600" />
                  Your Information
                </CardTitle>
                <CardDescription>Enter your details to forecast insurance costs</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${advancedMode ? "text-purple-600" : "text-gray-400"}`} />
                <Switch checked={advancedMode} onCheckedChange={setAdvancedMode} aria-label="Toggle advanced mode" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency & Country */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency & Country</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR - European Union</SelectItem>
                    <SelectItem value="USD">USD - United States</SelectItem>
                    <SelectItem value="GBP">GBP - United Kingdom</SelectItem>
                    <SelectItem value="CAD">CAD - Canada</SelectItem>
                    <SelectItem value="AUD">AUD - Australia</SelectItem>
                    <SelectItem value="CHF">CHF - Switzerland</SelectItem>
                    <SelectItem value="JPY">JPY - Japan</SelectItem>
                    <SelectItem value="NZD">NZD - New Zealand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region/State */}
              <div className="space-y-2">
                <Label htmlFor="region">Region/State</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Switzerland">Switzerland</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="New Zealand">New Zealand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Age */}
              <div className="space-y-2">
                <Label>Current Age: {currentAge}</Label>
                <Slider
                  value={[currentAge]}
                  onValueChange={(val) => setCurrentAge(val[0])}
                  min={18}
                  max={80}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Years to Project */}
              <div className="space-y-2">
                <Label>Years to Project: {yearsToProject}</Label>
                <Slider value={[yearsToProject]} onValueChange={(val) => setYearsToProject(val[0])} min={1} max={40} step={1} className="w-full" />
              </div>

              {/* Current Monthly Premium */}
              <div className="space-y-2">
                <Label htmlFor="premium">Current Monthly Premium</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="premium"
                    type="number"
                    value={currentPremium}
                    onChange={(e) => setCurrentPremium(parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    placeholder="300"
                  />
                </div>
              </div>

              {/* Family Size */}
              <div className="space-y-2">
                <Label htmlFor="family">Family Size</Label>
                <Select value={familySize} onValueChange={setFamilySize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="couple">Couple</SelectItem>
                    <SelectItem value="family_3">Family (3 people)</SelectItem>
                    <SelectItem value="family_4">Family (4 people)</SelectItem>
                    <SelectItem value="family_5plus">Family (5+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plan Type */}
              <div className="space-y-2">
                <Label htmlFor="plan">Plan Type</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze (Basic Coverage)</SelectItem>
                    <SelectItem value="silver">Silver (Standard Coverage)</SelectItem>
                    <SelectItem value="gold">Gold (Enhanced Coverage)</SelectItem>
                    <SelectItem value="platinum">Platinum (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {advancedMode && (
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Advanced Options</h3>
                  <Badge variant="outline">Pro</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Medical Inflation Rate: {customInflationRate.toFixed(2)}%</Label>
                  <Slider
                    value={[customInflationRate]}
                    onValueChange={(val) => setCustomInflationRate(val[0])}
                    min={1}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Default: {medicalInflationRates[currency] || 4.2}% for {currency}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={enableScenarios} onCheckedChange={setEnableScenarios} />
                  <Label className="mb-0">Show Scenario Comparison (Conservative, Current, Aggressive)</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                Premium Forecast
              </CardTitle>
              <CardDescription>Projected monthly premium in {yearsToProject} years</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Current Monthly Premium:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currency} {result.currentPremium.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Projected Monthly Premium:</span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currency} {result.projectedPremium.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Total Increase:</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">{currency} {result.totalIncrease.toFixed(0)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Badge className="w-full justify-center py-2 text-base bg-purple-500">Percentage Increase: {result.percentageIncrease.toFixed(1)}%</Badge>
                  <Badge className="w-full justify-center py-2 text-base bg-green-500">Medical Inflation Rate: {result.medicalInflationRate.toFixed(2)}%/year</Badge>
                  <Badge className="w-full justify-center py-2 text-base bg-indigo-500">Annual Growth Rate: {result.annualGrowthRate.toFixed(2)}%</Badge>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  {enableScenarios ? (
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => (typeof value === "number" ? `${currency} ${value.toFixed(0)}` : value)} />
                      <Legend />
                      {enableScenarios && (
                        <>
                          <Line type="monotone" dataKey="scenario1" stroke="#ff9800" strokeWidth={2} name="Conservative (-2%)" />
                          <Line type="monotone" dataKey="scenario2" stroke="#2196f3" strokeWidth={2} name="Current" />
                          <Line type="monotone" dataKey="scenario3" stroke="#f44336" strokeWidth={2} name="Aggressive (+2%)" />
                        </>
                      )}
                    </ComposedChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => (typeof value === "number" ? `${currency} ${value.toFixed(0)}` : value)} />
                      <Legend />
                      <Line type="monotone" dataKey="premium" stroke="#2196f3" strokeWidth={3} name={`Monthly Premium (${currency})`} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}

              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  Medical inflation ({result.medicalInflationRate.toFixed(2)}%/year) typically outpaces general inflation (2-3%/year), meaning healthcare costs grow faster than other expenses.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Blog Section - Editable from Admin */}
        {blogContent && (
          <Card className="mb-12 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Understanding Insurance Inflation
              </CardTitle>
              <CardDescription>Comprehensive guide to healthcare costs and medical inflation trends</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={blogContent} />
            </CardContent>
          </Card>
        )}

        {/* Methodology & Data Sources - Hardcoded */}
        <Card className="mb-12 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <InfoIcon className="w-6 h-6 text-blue-600" />
              Methodology & Data Sources
            </CardTitle>
            <CardDescription>How we calculate insurance inflation projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Primary Data Sources</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>National Health Authorities:</strong> Official healthcare premium data and insurance regulations from government health departments across 8 countries.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3Icon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>OECD Health Statistics:</strong> Comprehensive health expenditure data, medical cost indices, and healthcare system information for member countries updated annually.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUpIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>WHO Global Health Observatory:</strong> International healthcare cost trends, medical inflation indices, and comparative health system analysis.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUpIcon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>National Statistical Agencies:</strong> CPI-Medical indices from BLS (USA), ONS (UK), Eurostat, ABS (Australia), and other official sources.
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Calculation Methodology</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Base Premium Calculation:</strong>
                    <p className="mt-1">Adjusted Premium = Current Premium × Age Multiplier × Regional Adjustment × Plan Type Multiplier</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Inflation Projection:</strong>
                    <p className="mt-1">Future Premium = Base Premium × (1 + Medical Inflation Rate)^Years × Family Size Multiplier</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Medical Inflation Application:</strong>
                    <p className="mt-1">Uses region-specific medical inflation rates (3.2% - 5.4% annually) reflecting healthcare cost growth patterns in each country.</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Data Quality:</strong>
                    <p className="mt-1">All calculations use official government and international organization data updated annually for accuracy.</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Technical Notes</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Medical inflation rates vary by country and have exceeded general inflation for 20+ years</li>
                <li>Age-based premiums follow standard actuarial models used by insurers</li>
                <li>Family size multipliers represent typical group discount scales</li>
                <li>Regional adjustments account for local healthcare costs and system differences</li>
                <li>Actual costs may vary based on individual health status and policy changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <Card className="mb-12 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions about insurance inflation and healthcare costs</CardDescription>
            </CardHeader>
            <CardContent>
              <FAQ items={faqItems} />
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-16 rounded-t-lg">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Insurance Calculator Description */}
              <div>
                <h3 className="text-xl font-bold mb-4">Insurance Inflation Calculator</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Track healthcare premium growth across 8 major currencies with medical inflation projections. Make informed decisions about your future insurance costs and financial planning.
                </p>
              </div>

              {/* Middle Column - Data Sources */}
              <div>
                <h3 className="text-xl font-bold mb-4">Data Sources</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• National Health Authorities</li>
                  <li>• OECD Health Statistics</li>
                  <li>• WHO Global Health Observatory</li>
                  <li>• National Statistical Agencies</li>
                  <li>• Insurance Industry Reports</li>
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
                    <Link href="/charts" className="text-gray-400 hover:text-white transition-colors">
                      Charts & Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/retirement-calculator" className="text-gray-400 hover:text-white transition-colors">
                      Retirement Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/mortgage-calculator" className="text-gray-400 hover:text-white transition-colors">
                      Mortgage Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-8 bg-gray-700" />

            <div className="text-center text-gray-400 text-sm">
              <p>© 2026 Global Inflation Calculator. Educational purposes only.</p>
              <p className="mt-2">
                <Link href="/privacy" className="hover:text-white transition mr-4">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
