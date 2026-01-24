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
import { Heart, TrendingUpIcon, DollarSignIcon, CalendarIcon, BarChart3Icon, AlertTriangleIcon, InfoIcon } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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
  stateMultiplier: number
  medicalInflationRate: number
}

interface ChartDataPoint {
  year: number
  premium: number
  generalInflation: number
  medicalInflation: number
}

export default function InsuranceInflationCalculatorPage() {
  const [currentAge, setCurrentAge] = useState("35")
  const [currentPremium, setCurrentPremium] = useState("300")
  const [familySize, setFamilySize] = useState("individual")
  const [planType, setPlanType] = useState("silver")
  const [state, setState] = useState("CA")
  const [yearsProjected, setYearsProjected] = useState("10")
  const [smoking, setSmoking] = useState("no")

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [insuranceData, setInsuranceData] = useState<any>(null)
  const [healthcareInflationData, setHealthcareInflationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [blogContent, setBlogContent] = useState("")
  const [faqItems, setFaqItems] = useState<any[]>([])
  const [contentLoaded, setContentLoaded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [insuranceResponse, healthcareResponse] = await Promise.all([
          fetch("/data/insurance-calculator.json"),
          fetch("/data/healthcare-inflation.json"),
        ])

        const insuranceJson = await insuranceResponse.json()
        const healthcareJson = await healthcareResponse.json()

        setInsuranceData(insuranceJson)
        setHealthcareInflationData(healthcareJson)

        // Load blog content and FAQ from Supabase
        const { data: contentData } = await supabase
          .from("site_content")
          .select("insurance_inflation_essay")
          .single()

        if (contentData?.insurance_inflation_essay) {
          setBlogContent(contentData.insurance_inflation_essay)
        }

        // Load FAQ items
        const { data: faqData } = await supabase
          .from("faqs")
          .select("*")
          .eq("category", "insurance")

        if (faqData) {
          setFaqItems(faqData)
        }

        setContentLoaded(true)
      } catch (error) {
        console.error("Error loading data:", error)
        setContentLoaded(true)
      }
    }

    loadData()
  }, [])

  const calculateProjection = () => {
    if (!insuranceData || !healthcareInflationData) return

    const age = Number.parseInt(currentAge)
    const premium = Number.parseFloat(currentPremium)
    const years = Number.parseInt(yearsProjected)

    // Get age multiplier
    const ageMultiplier = insuranceData.ageMultipliers[age.toString()] || 1.0

    // Get family size multiplier
    const familyMultiplier = insuranceData.familySizeMultipliers[familySize] || 1.0

    // Get plan tier multiplier
    const planMultiplier = insuranceData.planTierMultipliers[planType] || 1.0

    // Get state multiplier
    const stateMultiplier = insuranceData.stateVariations[state]?.relativeMultiplier || 1.0

    // Get smoking surcharge
    const smokingMultiplier = smoking === "yes" ? 1.5 : 1.0

    // Base current premium with all multipliers
    const adjustedCurrentPremium = premium * ageMultiplier * familyMultiplier * planMultiplier * smokingMultiplier

    // Calculate average medical inflation rate
    const avgMedicalInflation =
      healthcareInflationData.data.reduce((sum: number, item: any) => sum + item.healthcareInflation, 0) /
      healthcareInflationData.data.length /
      100

    // Project premium
    const projectedPremium = adjustedCurrentPremium * Math.pow(1 + avgMedicalInflation, years)
    const totalIncrease = projectedPremium - adjustedCurrentPremium
    const percentageIncrease = ((projectedPremium - adjustedCurrentPremium) / adjustedCurrentPremium) * 100
    const annualGrowthRate = (avgMedicalInflation * 100).toFixed(2)

    setResult({
      currentPremium: adjustedCurrentPremium,
      currentAge: age,
      yearsProjected: years,
      projectedPremium,
      totalIncrease,
      percentageIncrease,
      annualGrowthRate: Number.parseFloat(annualGrowthRate as string),
      familyMultiplier,
      planMultiplier,
      stateMultiplier,
      medicalInflationRate: avgMedicalInflation * 100,
    })

    // Generate chart data
    const newChartData: ChartDataPoint[] = []
    for (let i = 0; i <= years; i++) {
      const year = 2026 + i
      const premiumAtYear = adjustedCurrentPremium * Math.pow(1 + avgMedicalInflation, i)
      const generalInflation = 2.7 // Average general inflation
      newChartData.push({
        year,
        premium: Math.round(premiumAtYear),
        generalInflation: Math.round(adjustedCurrentPremium * Math.pow(1 + generalInflation / 100, i)),
        medicalInflation: Math.round(premiumAtYear),
      })
    }

    setChartData(newChartData)
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Insurance Inflation Calculator</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how your health insurance premiums will grow over time with medical inflation projections. Plan ahead and understand the real cost of healthcare.
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">Using Live 2026 Medical Inflation Data</p>
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
                <Label>Current Monthly Premium ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={currentPremium}
                  onChange={(e) => setCurrentPremium(e.target.value)}
                  className="mt-2"
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
                    <SelectItem value="couple">Couple (2 people)</SelectItem>
                    <SelectItem value="family-3">Family (3 people)</SelectItem>
                    <SelectItem value="family-4">Family (4 people)</SelectItem>
                    <SelectItem value="family-5plus">Family (5+ people)</SelectItem>
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
                <Label>State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
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
                  <span className="text-2xl font-bold text-blue-600">${Math.round(result.currentPremium)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Projected Monthly Premium:</span>
                  <span className="text-2xl font-bold text-cyan-600">${Math.round(result.projectedPremium)}</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Increase:</span>
                    <Badge variant="destructive">${Math.round(result.totalIncrease)}</Badge>
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

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="mb-12 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5" />
                Premium Growth Over Time
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
                    formatter={(value) => `$${value}`}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="premium" stroke="hsl(200 100% 50%)" strokeWidth={3} name="Insurance Premium" />
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
              <CardTitle>Understanding Insurance Inflation</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={blogContent} />
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <FAQ items={faqItems} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
