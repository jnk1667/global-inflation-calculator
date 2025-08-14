"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdBanner from "@/components/ad-banner"
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  Users,
  Heart,
  DollarSign,
  PiggyBank,
  Target,
  Shield,
} from "lucide-react"
import Link from "next/link"

interface RetirementData {
  currentAge: number
  retirementAge: number
  currentSalary: number
  currentSavings: number
  monthlyContribution: number
  employerMatch: number
  expectedReturn: number
  inflationRate: number
  retirementDuration: number
  desiredIncome: number
  gender: "male" | "female"
  generation: "babyBoomers" | "genX" | "millennials" | "genZ"
}

interface CalculationResults {
  futureValue: number
  monthlyRetirementIncome: number
  inflationAdjustedIncome: number
  shortfall: number
  requiredSavings: number
  recommendedContribution: number
  lifestyleMaintenanceNeeded: number
  healthcareCosts: number
  generationComparison: any
}

export default function RetirementCalculatorPage() {
  const [activeTab, setActiveTab] = useState("traditional")
  const [data, setData] = useState<RetirementData>({
    currentAge: 30,
    retirementAge: 65,
    currentSalary: 75000,
    currentSavings: 25000,
    monthlyContribution: 500,
    employerMatch: 3,
    expectedReturn: 7,
    inflationRate: 3,
    retirementDuration: 25,
    desiredIncome: 80,
    gender: "male",
    generation: "millennials",
  })

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [retirementContributions, setRetirementContributions] = useState<any>(null)
  const [healthcareData, setHealthcareData] = useState<any>(null)
  const [lifeExpectancyData, setLifeExpectancyData] = useState<any>(null)

  // Auto-calculate generation based on current age
  const calculateGenerationFromAge = (age: number): "babyBoomers" | "genX" | "millennials" | "genZ" => {
    const currentYear = new Date().getFullYear()
    const birthYear = currentYear - age

    if (birthYear >= 1997) return "genZ"
    if (birthYear >= 1981) return "millennials"
    if (birthYear >= 1965) return "genX"
    return "babyBoomers"
  }

  // Update generation when age changes
  useEffect(() => {
    const newGeneration = calculateGenerationFromAge(data.currentAge)
    if (newGeneration !== data.generation) {
      setData((prev) => ({ ...prev, generation: newGeneration }))
    }
  }, [data.currentAge])

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data for retirement contributions
        const mockRetirementContributions = {
          generationData: {
            babyBoomers: {
              birthYears: "1946-1964",
              averageContribution: 12.5,
              medianSavings: 152000,
              retirementAge: 62,
              socialSecurityBenefit: 1800,
            },
            genX: {
              birthYears: "1965-1980",
              averageContribution: 10.8,
              medianSavings: 89000,
              retirementAge: 65,
              socialSecurityBenefit: 1650,
            },
            millennials: {
              birthYears: "1981-1996",
              averageContribution: 8.4,
              medianSavings: 23000,
              retirementAge: 67,
              socialSecurityBenefit: 1400,
            },
            genZ: {
              birthYears: "1997-2012",
              averageContribution: 6.2,
              medianSavings: 11000,
              retirementAge: 70,
              socialSecurityBenefit: 1200,
            },
          },
        }

        // Mock healthcare data
        const mockHealthcareData = {
          averageHealthcareInflation: 5.8,
          averageGeneralInflation: 3.2,
          healthcareMultiplier: 1.81,
        }

        // Mock life expectancy data
        const mockLifeExpectancyData = {
          male: 76.1,
          female: 81.1,
        }

        setRetirementContributions(mockRetirementContributions)
        setHealthcareData(mockHealthcareData)
        setLifeExpectancyData(mockLifeExpectancyData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [])

  // Calculate retirement projections - runs automatically when data changes
  useEffect(() => {
    if (!retirementContributions || !healthcareData) return

    const yearsToRetirement = data.retirementAge - data.currentAge
    const monthsToRetirement = yearsToRetirement * 12
    const monthlyReturn = data.expectedReturn / 100 / 12

    // Future value of current savings
    const futureCurrentSavings = data.currentSavings * Math.pow(1 + data.expectedReturn / 100, yearsToRetirement)

    // Future value of monthly contributions
    const futureContributions =
      monthsToRetirement > 0
        ? (data.monthlyContribution * (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1)) / monthlyReturn
        : 0

    // Employer match contribution
    const employerMatchAmount = (data.currentSalary * data.employerMatch) / 100 / 12
    const futureEmployerMatch =
      monthsToRetirement > 0
        ? (employerMatchAmount * (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1)) / monthlyReturn
        : 0

    const totalFutureValue = futureCurrentSavings + futureContributions + futureEmployerMatch

    // Monthly retirement income (4% rule)
    const monthlyRetirementIncome = (totalFutureValue * 0.04) / 12

    // Inflation-adjusted income
    const inflationAdjustedIncome = monthlyRetirementIncome / Math.pow(1 + data.inflationRate / 100, yearsToRetirement)

    // Desired monthly income in today's dollars
    const desiredMonthlyIncome = (data.currentSalary * data.desiredIncome) / 100 / 12

    // Shortfall calculation
    const shortfall = Math.max(0, desiredMonthlyIncome - inflationAdjustedIncome)

    // Required total savings for desired income
    const requiredSavings =
      ((desiredMonthlyIncome * 12) / 0.04) * Math.pow(1 + data.inflationRate / 100, yearsToRetirement)

    // Recommended monthly contribution to meet goal
    const currentSavingsFutureValue = data.currentSavings * Math.pow(1 + data.expectedReturn / 100, yearsToRetirement)
    const additionalNeeded = Math.max(0, requiredSavings - currentSavingsFutureValue - futureEmployerMatch)
    const recommendedContribution =
      monthsToRetirement > 0
        ? additionalNeeded / ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn)
        : 0

    // Lifestyle maintenance calculation
    const lifestyleMaintenanceNeeded = (data.currentSalary * 0.8) / 12 // 80% rule

    // Healthcare costs calculation
    const healthcareMultiplier = healthcareData?.healthcareMultiplier || 1.81
    const healthcareCosts = (data.currentSalary * 0.15 * healthcareMultiplier) / 12 // 15% of income for healthcare

    // Generation comparison
    const generationData = retirementContributions?.generationData || {}
    const currentGenData = generationData[data.generation] || {}

    setResults({
      futureValue: totalFutureValue,
      monthlyRetirementIncome,
      inflationAdjustedIncome,
      shortfall: shortfall * 12, // Annual shortfall
      requiredSavings,
      recommendedContribution,
      lifestyleMaintenanceNeeded,
      healthcareCosts,
      generationComparison: currentGenData,
    })
  }, [data, retirementContributions, healthcareData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getGenerationName = (gen: string) => {
    const names = {
      babyBoomers: "Baby Boomers",
      genX: "Generation X",
      millennials: "Millennials",
      genZ: "Generation Z",
    }
    return names[gen as keyof typeof names] || gen
  }

  const getGenerationInsight = (generation: string) => {
    const insights = {
      babyBoomers:
        "Baby Boomers benefited from strong pension systems and higher Social Security benefits. They experienced lower healthcare cost inflation and had shorter retirement periods to fund.",
      genX: "Generation X is the 'sandwich generation' - supporting both aging parents and children. They experienced the transition from pensions to 401(k)s and have limited time for retirement savings growth.",
      millennials:
        "Millennials face unique challenges including student loan debt, higher housing costs, reduced Social Security benefits, and need to save more due to longer life expectancies.",
      genZ: "Generation Z is entering the workforce during economic uncertainty, faces the highest projected healthcare costs, lowest expected Social Security benefits, and longest retirement periods to fund.",
    }
    return insights[generation as keyof typeof insights] || ""
  }

  const getGenerationChallenges = (generation: string) => {
    const challenges = {
      babyBoomers: [
        "Benefited from pension plans and higher Social Security",
        "Lower healthcare cost inflation historically",
        "Shorter retirement periods to fund",
        "Real estate appreciation benefits",
      ],
      genX: [
        "Sandwich generation - supporting parents and children",
        "Peak earning years with high expenses",
        "Limited time for retirement savings growth",
        "Transition from pensions to 401(k)s",
      ],
      millennials: [
        "Student loan debt reducing savings capacity",
        "Housing costs consuming larger income percentage",
        "Reduced Social Security benefits expected",
        "Need to save more due to longer life expectancy",
      ],
      genZ: [
        "Entering workforce during economic uncertainty",
        "Highest projected healthcare costs",
        "Lowest expected Social Security benefits",
        "Longest retirement period to fund",
      ],
    }
    return challenges[generation as keyof typeof challenges] || []
  }

  const getCrisisLevel = () => {
    if (!results) return "safe"
    const savingsRate = (data.monthlyContribution * 12) / data.currentSalary
    if (savingsRate < 0.1) return "critical"
    if (savingsRate < 0.15) return "warning"
    return "safe"
  }

  const crisisLevel = getCrisisLevel()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Retirement Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Plan your retirement with comprehensive analysis including lifestyle maintenance, crisis assessment,
            generational comparisons, and healthcare cost projections.
          </p>
        </div>

        {/* Ad Banner - Top */}
        <div className="mb-8">
          <AdBanner />
        </div>

        {/* Main Calculator */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Calculator className="h-5 w-5" />
                  Your Information
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Enter your current financial situation and retirement goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentAge" className="dark:text-gray-200">
                      Current Age
                    </Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={data.currentAge}
                      onChange={(e) => setData({ ...data, currentAge: Number.parseInt(e.target.value) || 0 })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retirementAge" className="dark:text-gray-200">
                      Retirement Age
                    </Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      value={data.retirementAge}
                      onChange={(e) => setData({ ...data, retirementAge: Number.parseInt(e.target.value) || 0 })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="currentSalary" className="dark:text-gray-200">
                    Current Annual Salary
                  </Label>
                  <Input
                    id="currentSalary"
                    type="number"
                    value={data.currentSalary}
                    onChange={(e) => setData({ ...data, currentSalary: Number.parseInt(e.target.value) || 0 })}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="currentSavings" className="dark:text-gray-200">
                    Current Retirement Savings
                  </Label>
                  <Input
                    id="currentSavings"
                    type="number"
                    value={data.currentSavings}
                    onChange={(e) => setData({ ...data, currentSavings: Number.parseInt(e.target.value) || 0 })}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyContribution" className="dark:text-gray-200">
                    Monthly Contribution
                  </Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={data.monthlyContribution}
                    onChange={(e) => setData({ ...data, monthlyContribution: Number.parseInt(e.target.value) || 0 })}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="employerMatch" className="dark:text-gray-200">
                    Employer Match (%)
                  </Label>
                  <Input
                    id="employerMatch"
                    type="number"
                    value={data.employerMatch}
                    onChange={(e) => setData({ ...data, employerMatch: Number.parseFloat(e.target.value) || 0 })}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedReturn" className="dark:text-gray-200">
                      Expected Return (%)
                    </Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.1"
                      value={data.expectedReturn}
                      onChange={(e) => setData({ ...data, expectedReturn: Number.parseFloat(e.target.value) || 0 })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inflationRate" className="dark:text-gray-200">
                      Inflation Rate (%)
                    </Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={data.inflationRate}
                      onChange={(e) => setData({ ...data, inflationRate: Number.parseFloat(e.target.value) || 0 })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="desiredIncome" className="dark:text-gray-200">
                    Desired Income (% of current)
                  </Label>
                  <Input
                    id="desiredIncome"
                    type="number"
                    value={data.desiredIncome}
                    onChange={(e) => setData({ ...data, desiredIncome: Number.parseInt(e.target.value) || 0 })}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender" className="dark:text-gray-200">
                      Gender
                    </Label>
                    <Select
                      value={data.gender}
                      onValueChange={(value: "male" | "female") => setData({ ...data, gender: value })}
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="male" className="dark:text-white dark:hover:bg-gray-600">
                          Male
                        </SelectItem>
                        <SelectItem value="female" className="dark:text-white dark:hover:bg-gray-600">
                          Female
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="generation" className="dark:text-gray-200">
                      Generation (Auto-detected)
                    </Label>
                    <Select
                      value={data.generation}
                      onValueChange={(value: any) => setData({ ...data, generation: value })}
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="babyBoomers" className="dark:text-white dark:hover:bg-gray-600">
                          Baby Boomers
                        </SelectItem>
                        <SelectItem value="genX" className="dark:text-white dark:hover:bg-gray-600">
                          Generation X
                        </SelectItem>
                        <SelectItem value="millennials" className="dark:text-white dark:hover:bg-gray-600">
                          Millennials
                        </SelectItem>
                        <SelectItem value="genZ" className="dark:text-white dark:hover:bg-gray-600">
                          Generation Z
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 dark:bg-gray-800">
                <TabsTrigger
                  value="traditional"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Traditional
                </TabsTrigger>
                <TabsTrigger
                  value="lifestyle"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Lifestyle
                </TabsTrigger>
                <TabsTrigger
                  value="crisis"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Crisis
                </TabsTrigger>
                <TabsTrigger
                  value="generation"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Generation
                </TabsTrigger>
                <TabsTrigger
                  value="healthcare"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Healthcare
                </TabsTrigger>
              </TabsList>

              {/* Traditional Calculator */}
              <TabsContent value="traditional" className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <PiggyBank className="h-5 w-5" />
                      Traditional Retirement Projection
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Standard future value calculation with compound growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h3 className="font-semibold text-green-800 dark:text-green-300">
                              Total Retirement Savings
                            </h3>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                              {formatCurrency(results.futureValue)}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Monthly Income (4% Rule)</h3>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                              {formatCurrency(results.monthlyRetirementIncome)}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                              Inflation-Adjusted Income
                            </h3>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                              {formatCurrency(results.inflationAdjustedIncome)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {results.shortfall > 0 && (
                            <Alert className="dark:bg-red-900/20 dark:border-red-800">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="dark:text-red-300">
                                <strong>Annual Shortfall: {formatCurrency(results.shortfall)}</strong>
                                <br />
                                You may need to increase contributions or adjust expectations.
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                              Recommended Monthly Contribution
                            </h3>
                            <p className="text-xl font-bold text-orange-900 dark:text-orange-200">
                              {formatCurrency(results.recommendedContribution)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lifestyle Maintenance Calculator */}
              <TabsContent value="lifestyle" className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Target className="h-5 w-5" />
                      Lifestyle Maintenance Calculator
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Calculate what you need to maintain your current lifestyle in retirement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">
                              Current Lifestyle Cost
                            </h3>
                            <p className="text-xl font-bold text-indigo-900 dark:text-indigo-200">
                              {formatCurrency(results.lifestyleMaintenanceNeeded * 12)}
                            </p>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400">80% of current income</p>
                          </div>
                          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                            <h3 className="font-semibold text-teal-800 dark:text-teal-300">Required Savings</h3>
                            <p className="text-xl font-bold text-teal-900 dark:text-teal-200">
                              {formatCurrency((results.lifestyleMaintenanceNeeded * 12) / 0.04)}
                            </p>
                            <p className="text-sm text-teal-600 dark:text-teal-400">Using 4% withdrawal rule</p>
                          </div>
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <h3 className="font-semibold text-rose-800 dark:text-rose-300">Gap to Fill</h3>
                            <p className="text-xl font-bold text-rose-900 dark:text-rose-200">
                              {formatCurrency(
                                Math.max(0, (results.lifestyleMaintenanceNeeded * 12) / 0.04 - results.futureValue),
                              )}
                            </p>
                            <p className="text-sm text-rose-600 dark:text-rose-400">Additional savings needed</p>
                          </div>
                        </div>

                        <Alert className="dark:bg-blue-900/20 dark:border-blue-800">
                          <TrendingUp className="h-4 w-4" />
                          <AlertDescription className="dark:text-blue-300">
                            <strong>Lifestyle Maintenance Insight:</strong> The 80% rule assumes you'll need 80% of your
                            pre-retirement income to maintain your lifestyle. This accounts for reduced work-related
                            expenses but maintains your standard of living.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Crisis Calculator */}
              <TabsContent value="crisis" className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <AlertTriangle className="h-5 w-5" />
                      Retirement Crisis Assessment
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Analyze your retirement readiness and identify potential crisis points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <Badge
                          variant={
                            crisisLevel === "critical"
                              ? "destructive"
                              : crisisLevel === "warning"
                                ? "secondary"
                                : "default"
                          }
                          className="text-lg px-4 py-2"
                        >
                          {crisisLevel === "critical" && "🚨 CRITICAL"}
                          {crisisLevel === "warning" && "⚠️ WARNING"}
                          {crisisLevel === "safe" && "✅ ON TRACK"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold dark:text-white">Current Savings Rate</h3>
                            <p className="text-2xl font-bold dark:text-white">
                              {(((data.monthlyContribution * 12) / data.currentSalary) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold dark:text-white">Years to Retirement</h3>
                            <p className="text-2xl font-bold dark:text-white">
                              {data.retirementAge - data.currentAge} years
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {crisisLevel === "critical" && (
                            <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="dark:text-red-300">
                                <strong>Retirement Crisis Alert!</strong> Your current savings rate is below 10%. You're
                                at high risk of not having enough for retirement. Consider increasing contributions
                                immediately.
                              </AlertDescription>
                            </Alert>
                          )}
                          {crisisLevel === "warning" && (
                            <Alert className="dark:bg-yellow-900/20 dark:border-yellow-800">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="dark:text-yellow-300">
                                <strong>Warning:</strong> Your savings rate is below the recommended 15%. Consider
                                increasing contributions to ensure a comfortable retirement.
                              </AlertDescription>
                            </Alert>
                          )}
                          {crisisLevel === "safe" && (
                            <Alert className="dark:bg-green-900/20 dark:border-green-800">
                              <TrendingUp className="h-4 w-4" />
                              <AlertDescription className="dark:text-green-300">
                                <strong>Great job!</strong> You're saving at a healthy rate for retirement. Keep up the
                                good work and consider periodic reviews.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                          Crisis Prevention Tips
                        </h3>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                          <li>• Aim for 15% total savings rate (including employer match)</li>
                          <li>• Start early - compound interest is your best friend</li>
                          <li>• Increase contributions with salary raises</li>
                          <li>• Consider catch-up contributions if over 50</li>
                          <li>• Don't withdraw from retirement accounts early</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Generation Gap Calculator */}
              <TabsContent value="generation" className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Users className="h-5 w-5" />
                      Generational Retirement Gap
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Compare retirement challenges across different generations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results && retirementContributions && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            You are: {getGenerationName(data.generation)}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Born: {retirementContributions.generationData[data.generation]?.birthYears}
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(retirementContributions.generationData).map(
                            ([gen, genData]: [string, any]) => (
                              <div
                                key={gen}
                                className={`p-4 rounded-lg border-2 ${
                                  gen === data.generation
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                                    : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                                }`}
                              >
                                <h4 className="font-semibold text-sm dark:text-white">{getGenerationName(gen)}</h4>
                                <div className="mt-2 space-y-1 text-xs dark:text-gray-300">
                                  <p>Avg Contribution: {genData.averageContribution}%</p>
                                  <p>Median Savings: {formatCurrency(genData.medianSavings)}</p>
                                  <p>Retirement Age: {genData.retirementAge}</p>
                                  <p>Social Security: {formatCurrency(genData.socialSecurityBenefit)}/mo</p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        <Alert className="dark:bg-blue-900/20 dark:border-blue-800">
                          <Users className="h-4 w-4" />
                          <AlertDescription className="dark:text-blue-300">
                            <strong>Generational Insight:</strong> {getGenerationInsight(data.generation)}
                          </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                            Your Generation's Challenges
                          </h3>
                          <div className="text-sm text-indigo-700 dark:text-indigo-400">
                            <ul className="space-y-1">
                              {getGenerationChallenges(data.generation).map((challenge, index) => (
                                <li key={index}>• {challenge}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Healthcare Calculator */}
              <TabsContent value="healthcare" className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Heart className="h-5 w-5" />
                      Healthcare Retirement Calculator
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Factor in healthcare costs that grow faster than general inflation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results && healthcareData && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <h3 className="font-semibold text-red-800 dark:text-red-300">Monthly Healthcare Costs</h3>
                            <p className="text-xl font-bold text-red-900 dark:text-red-200">
                              {formatCurrency(results.healthcareCosts)}
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">In today's dollars</p>
                          </div>
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                              Annual Healthcare Costs
                            </h3>
                            <p className="text-xl font-bold text-orange-900 dark:text-orange-200">
                              {formatCurrency(results.healthcareCosts * 12)}
                            </p>
                            <p className="text-sm text-orange-600 dark:text-orange-400">15% of current income</p>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <h3 className="font-semibold text-purple-800 dark:text-purple-300">Healthcare Inflation</h3>
                            <p className="text-xl font-bold text-purple-900 dark:text-purple-200">
                              {healthcareData.averageHealthcareInflation}%
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              vs {healthcareData.averageGeneralInflation}% general
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                            Healthcare Cost Reality
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                            Healthcare costs have historically grown {healthcareData.healthcareMultiplier}x faster than
                            general inflation. This means your healthcare expenses in retirement will likely consume a
                            larger portion of your income.
                          </p>
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                                At Retirement (Future Value)
                              </h4>
                              <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                                {formatCurrency(
                                  results.healthcareCosts *
                                    12 *
                                    Math.pow(
                                      1 + healthcareData.averageHealthcareInflation / 100,
                                      data.retirementAge - data.currentAge,
                                    ),
                                )}
                              </p>
                              <p className="text-xs text-yellow-600 dark:text-yellow-500">Annual healthcare costs</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                                Lifetime Healthcare Costs
                              </h4>
                              <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                                {formatCurrency(
                                  results.healthcareCosts *
                                    12 *
                                    data.retirementDuration *
                                    Math.pow(
                                      1 + healthcareData.averageHealthcareInflation / 100,
                                      data.retirementAge - data.currentAge,
                                    ),
                                )}
                              </p>
                              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                                Total retirement healthcare
                              </p>
                            </div>
                          </div>
                        </div>

                        <Alert className="dark:bg-red-900/20 dark:border-red-800">
                          <Heart className="h-4 w-4" />
                          <AlertDescription className="dark:text-red-300">
                            <strong>Healthcare Planning Tip:</strong> Consider Health Savings Accounts (HSAs) for triple
                            tax advantages, long-term care insurance, and factor healthcare inflation into your
                            retirement income planning. Medicare doesn't cover everything!
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Ad Banner - Middle */}
        <div className="mb-12">
          <AdBanner />
        </div>

        {/* Methodology Section */}
        <Card className="mb-12 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Shield className="h-5 w-5" />
              Methodology & Data Sources
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Transparent calculations based on historical data and established financial principles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Calculation Methods</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>
                    • <strong>Future Value:</strong> Compound interest formula with monthly contributions
                  </li>
                  <li>
                    • <strong>4% Rule:</strong> Safe withdrawal rate based on Trinity Study
                  </li>
                  <li>
                    • <strong>Inflation Adjustment:</strong> Real purchasing power calculations
                  </li>
                  <li>
                    • <strong>Healthcare Costs:</strong> 1.81x multiplier based on historical data
                  </li>
                  <li>
                    • <strong>Lifestyle Maintenance:</strong> 80% replacement ratio standard
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Data Sources</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>
                    • <strong>S&P 500 Returns:</strong> Historical data 1928-2024 (10.5% avg)
                  </li>
                  <li>
                    • <strong>Bond Yields:</strong> 10-Year Treasury 1928-2024 (4.8% avg)
                  </li>
                  <li>
                    • <strong>Life Expectancy:</strong> Social Security Administration
                  </li>
                  <li>
                    • <strong>Healthcare Inflation:</strong> Bureau of Labor Statistics CPI-Medical
                  </li>
                  <li>
                    • <strong>Generation Data:</strong> Federal Reserve Survey of Consumer Finances
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="dark:border-gray-600" />

            <div>
              <h3 className="font-semibold mb-2 dark:text-white">Important Disclaimers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                These calculations are for educational purposes and should not be considered financial advice. Past
                performance does not guarantee future results. Consult with a qualified financial advisor for
                personalized retirement planning. Market volatility, sequence of returns risk, and changing economic
                conditions can significantly impact actual results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Tools */}
        <Card className="mb-12 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Related Financial Tools</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Explore our other calculators to get a complete picture of your financial future
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/"
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold dark:text-white">Inflation Calculator</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calculate purchasing power changes over time across multiple currencies
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                href="/salary-calculator"
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold dark:text-white">Salary Calculator</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Analyze salary growth and purchasing power over your career
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Ad Banner - Bottom */}
        <div className="mb-8">
          <AdBanner />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Link href="/salary-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">
              Salary Calculator
            </Link>
            <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">
              About
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
              Terms
            </Link>
          </div>
          <p>© 2024 Global Inflation Calculator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
