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
import { supabase } from "@/lib/supabase"
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
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { MarkdownRenderer } from "@/components/markdown-renderer"

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
  currency: "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "CHF" | "JPY" | "NZD"
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

interface CurrencyData {
  symbol: string
  name: string
  flag: string
  averageSalary: number
  retirementAge: number
  pensionContribution: number
  healthcareMultiplier: number
  generationData: {
    [key: string]: {
      birthYears: string
      averageContribution: number
      medianSavings: number
      retirementAge: number
      socialSecurityBenefit: number
    }
  }
}

const currencyData: Record<string, CurrencyData> = {
  USD: {
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    averageSalary: 75000,
    retirementAge: 67,
    pensionContribution: 6.2,
    healthcareMultiplier: 1.81,
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
  },
  GBP: {
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    averageSalary: 35000,
    retirementAge: 66,
    pensionContribution: 8.0,
    healthcareMultiplier: 1.45,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 15.2,
        medianSavings: 85000,
        retirementAge: 60,
        socialSecurityBenefit: 950,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 12.8,
        medianSavings: 52000,
        retirementAge: 65,
        socialSecurityBenefit: 875,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 9.5,
        medianSavings: 18500,
        retirementAge: 66,
        socialSecurityBenefit: 750,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 7.2,
        medianSavings: 8500,
        retirementAge: 68,
        socialSecurityBenefit: 650,
      },
    },
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    averageSalary: 45000,
    retirementAge: 65,
    pensionContribution: 9.3,
    healthcareMultiplier: 1.35,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 18.5,
        medianSavings: 95000,
        retirementAge: 62,
        socialSecurityBenefit: 1200,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 15.2,
        medianSavings: 68000,
        retirementAge: 64,
        socialSecurityBenefit: 1100,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 11.8,
        medianSavings: 28000,
        retirementAge: 65,
        socialSecurityBenefit: 950,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 8.5,
        medianSavings: 12000,
        retirementAge: 67,
        socialSecurityBenefit: 800,
      },
    },
  },
  CAD: {
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    averageSalary: 65000,
    retirementAge: 65,
    pensionContribution: 5.95,
    healthcareMultiplier: 1.25,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 14.8,
        medianSavings: 125000,
        retirementAge: 62,
        socialSecurityBenefit: 1350,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 11.5,
        medianSavings: 78000,
        retirementAge: 64,
        socialSecurityBenefit: 1250,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 9.2,
        medianSavings: 32000,
        retirementAge: 65,
        socialSecurityBenefit: 1150,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 7.8,
        medianSavings: 15000,
        retirementAge: 67,
        socialSecurityBenefit: 1050,
      },
    },
  },
  AUD: {
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    averageSalary: 85000,
    retirementAge: 67,
    pensionContribution: 11.0,
    healthcareMultiplier: 1.35,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 16.5,
        medianSavings: 185000,
        retirementAge: 65,
        socialSecurityBenefit: 1850,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 13.2,
        medianSavings: 125000,
        retirementAge: 66,
        socialSecurityBenefit: 1750,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 10.8,
        medianSavings: 45000,
        retirementAge: 67,
        socialSecurityBenefit: 1650,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 8.5,
        medianSavings: 22000,
        retirementAge: 67,
        socialSecurityBenefit: 1550,
      },
    },
  },
  CHF: {
    symbol: "CHF",
    name: "Swiss Franc",
    flag: "🇨🇭",
    averageSalary: 80000,
    retirementAge: 65,
    pensionContribution: 8.7,
    healthcareMultiplier: 1.55,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 20.2,
        medianSavings: 195000,
        retirementAge: 63,
        socialSecurityBenefit: 2100,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 17.8,
        medianSavings: 145000,
        retirementAge: 64,
        socialSecurityBenefit: 2000,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 14.5,
        medianSavings: 65000,
        retirementAge: 65,
        socialSecurityBenefit: 1900,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 11.2,
        medianSavings: 28000,
        retirementAge: 66,
        socialSecurityBenefit: 1800,
      },
    },
  },
  JPY: {
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    averageSalary: 4500000,
    retirementAge: 65,
    pensionContribution: 9.15,
    healthcareMultiplier: 1.15,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 13.8,
        medianSavings: 8500000,
        retirementAge: 60,
        socialSecurityBenefit: 165000,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 11.2,
        medianSavings: 5200000,
        retirementAge: 63,
        socialSecurityBenefit: 155000,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 8.8,
        medianSavings: 2100000,
        retirementAge: 65,
        socialSecurityBenefit: 145000,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 6.5,
        medianSavings: 950000,
        retirementAge: 67,
        socialSecurityBenefit: 135000,
      },
    },
  },
  NZD: {
    symbol: "NZ$",
    name: "New Zealand Dollar",
    flag: "🇳🇿",
    averageSalary: 70000,
    retirementAge: 65,
    pensionContribution: 3.0,
    healthcareMultiplier: 1.3,
    generationData: {
      babyBoomers: {
        birthYears: "1946-1964",
        averageContribution: 12.5,
        medianSavings: 95000,
        retirementAge: 60,
        socialSecurityBenefit: 1450,
      },
      genX: {
        birthYears: "1965-1980",
        averageContribution: 9.8,
        medianSavings: 68000,
        retirementAge: 63,
        socialSecurityBenefit: 1350,
      },
      millennials: {
        birthYears: "1981-1996",
        averageContribution: 7.5,
        medianSavings: 28000,
        retirementAge: 65,
        socialSecurityBenefit: 1250,
      },
      genZ: {
        birthYears: "1997-2012",
        averageContribution: 5.8,
        medianSavings: 12000,
        retirementAge: 67,
        socialSecurityBenefit: 1150,
      },
    },
  },
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
    currency: "USD",
  })

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [essayContent, setEssayContent] = useState<string>("")

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

  // Update default values when currency changes
  useEffect(() => {
    const currency = currencyData[data.currency]
    if (currency) {
      setData((prev) => ({
        ...prev,
        currentSalary: currency.averageSalary,
        retirementAge: currency.retirementAge,
        currentSavings: Math.round(currency.averageSalary * 0.33), // Roughly 1/3 of annual salary
        monthlyContribution: Math.round((currency.averageSalary * 0.08) / 12), // 8% annual contribution
      }))
    }
  }, [data.currency])

  // Load essay content
  useEffect(() => {
    const loadEssayContent = async () => {
      try {
        const { data, error } = await supabase
          .from("seo_content")
          .select("content")
          .eq("id", "retirement_essay")
          .single()

        if (error) {
          console.error("Error loading essay content:", error)
          setEssayContent(`
# Mastering Retirement Planning in the Modern Era

Retirement planning has become increasingly complex in today's economic environment. With traditional pension plans disappearing and Social Security benefits facing uncertainty, individuals must take greater responsibility for their financial future. Understanding the key components of retirement planning is essential for building a secure and comfortable retirement.

## The Retirement Crisis Reality

Many Americans face a retirement savings crisis, with studies showing that a significant portion of the population has inadequate savings for retirement. The shift from defined benefit pension plans to defined contribution plans like 401(k)s has placed the burden of investment decisions and longevity risk on individuals. This makes comprehensive retirement planning more critical than ever.

## Generational Challenges and Opportunities

Different generations face unique retirement planning challenges. Baby Boomers benefited from stronger pension systems but face healthcare cost inflation. Generation X is caught between supporting aging parents and children while having limited time for savings growth. Millennials and Generation Z face student loan debt, housing affordability issues, and the prospect of reduced Social Security benefits, requiring them to save more aggressively.

## Building a Comprehensive Strategy

Successful retirement planning requires a multi-faceted approach that considers inflation, healthcare costs, longevity risk, and lifestyle goals. Our retirement calculator helps you understand these complex interactions and develop a realistic savings strategy that accounts for your generation's unique challenges and opportunities.
          `)
          return
        }

        if (data?.content) {
          setEssayContent(data.content)
        } else {
          setEssayContent(`
# Mastering Retirement Planning in the Modern Era

Retirement planning has become increasingly complex in today's economic environment. With traditional pension plans disappearing and Social Security benefits facing uncertainty, individuals must take greater responsibility for their financial future. Understanding the key components of retirement planning is essential for building a secure and comfortable retirement.

## The Retirement Crisis Reality

Many Americans face a retirement savings crisis, with studies showing that a significant portion of the population has inadequate savings for retirement. The shift from defined benefit pension plans to defined contribution plans like 401(k)s has placed the burden of investment decisions and longevity risk on individuals. This makes comprehensive retirement planning more critical than ever.

## Generational Challenges and Opportunities

Different generations face unique retirement planning challenges. Baby Boomers benefited from stronger pension systems but face healthcare cost inflation. Generation X is caught between supporting aging parents and children while having limited time for savings growth. Millennials and Generation Z face student loan debt, housing affordability issues, and the prospect of reduced Social Security benefits, requiring them to save more aggressively.

## Building a Comprehensive Strategy

Successful retirement planning requires a multi-faceted approach that considers inflation, healthcare costs, longevity risk, and lifestyle goals. Our retirement calculator helps you understand these complex interactions and develop a realistic savings strategy that accounts for your generation's unique challenges and opportunities.
          `)
        }
      } catch (err) {
        console.error("Error loading essay content:", err)
        setEssayContent(`
# Mastering Retirement Planning in the Modern Era

Retirement planning has become increasingly complex in today's economic environment. With traditional pension plans disappearing and Social Security benefits facing uncertainty, individuals must take greater responsibility for their financial future. Understanding the key components of retirement planning is essential for building a secure and comfortable retirement.

## The Retirement Crisis Reality

Many Americans face a retirement savings crisis, with studies showing that a significant portion of the population has inadequate savings for retirement. The shift from defined benefit pension plans to defined contribution plans like 401(k)s has placed the burden of investment decisions and longevity risk on individuals. This makes comprehensive retirement planning more critical than ever.

## Generational Challenges and Opportunities

Different generations face unique retirement planning challenges. Baby Boomers benefited from stronger pension systems but face healthcare cost inflation. Generation X is caught between supporting aging parents and children while having limited time for savings growth. Millennials and Generation Z face student loan debt, housing affordability issues, and the prospect of reduced Social Security benefits, requiring them to save more aggressively.

## Building a Comprehensive Strategy

Successful retirement planning requires a multi-faceted approach that considers inflation, healthcare costs, longevity risk, and lifestyle goals. Our retirement calculator helps you understand these complex interactions and develop a realistic savings strategy that accounts for your generation's unique challenges and opportunities.
        `)
      }
    }

    loadEssayContent()
  }, [])

  // Calculate retirement projections - runs automatically when data changes
  useEffect(() => {
    const currency = currencyData[data.currency]
    if (!currency) return

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

    // Healthcare costs calculation using currency-specific multiplier
    const healthcareCosts = (data.currentSalary * 0.15 * currency.healthcareMultiplier) / 12

    // Generation comparison using currency-specific data
    const currentGenData = currency.generationData[data.generation] || {}

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
  }, [data])

  const formatCurrency = (amount: number) => {
    const currency = currencyData[data.currency]
    const currencyCode = data.currency

    // Define locale mappings for proper formatting
    const localeMap: Record<string, string> = {
      USD: "en-US",
      GBP: "en-GB",
      EUR: "en-DE",
      CAD: "en-CA",
      AUD: "en-AU",
      CHF: "de-CH",
      JPY: "ja-JP",
      NZD: "en-NZ",
    }

    const locale = localeMap[currencyCode] || "en-US"

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: currencyCode === "JPY" ? 0 : 0,
      maximumFractionDigits: currencyCode === "JPY" ? 0 : 0,
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

  const getGenerationInsight = (generation: string, currency: string) => {
    const insights = {
      USD: {
        babyBoomers:
          "Baby Boomers benefited from strong pension systems and higher Social Security benefits. They experienced lower healthcare cost inflation and had shorter retirement periods to fund.",
        genX: "Generation X is the 'sandwich generation' - supporting both aging parents and children. They experienced the transition from pensions to 401(k)s and have limited time for retirement savings growth.",
        millennials:
          "Millennials face unique challenges including student loan debt, higher housing costs, reduced Social Security benefits, and need to save more due to longer life expectancies.",
        genZ: "Generation Z is entering the workforce during economic uncertainty, faces the highest projected healthcare costs, lowest expected Social Security benefits, and longest retirement periods to fund.",
      },
      GBP: {
        babyBoomers:
          "UK Baby Boomers benefited from final salary pension schemes and property appreciation. They face NHS pressures but have better healthcare access than other countries.",
        genX: "UK Generation X experienced pension reforms and auto-enrollment. They're dealing with rising property costs and supporting both parents and children financially.",
        millennials:
          "UK Millennials face housing affordability crisis, student debt, and workplace pension auto-enrollment. Brexit uncertainty adds complexity to retirement planning.",
        genZ: "UK Generation Z enters the workforce with high education costs, climate concerns, and uncertainty about future state pension age and benefits.",
      },
      EUR: {
        babyBoomers:
          "European Baby Boomers benefited from strong social security systems and generous state pensions. They face aging population challenges and healthcare cost pressures.",
        genX: "European Generation X navigates diverse pension systems across EU countries. They benefit from strong worker protections but face economic integration challenges.",
        millennials:
          "European Millennials deal with varying economic conditions across EU countries, youth unemployment in some regions, and climate change concerns affecting long-term planning.",
        genZ: "European Generation Z faces digital transformation, climate challenges, and questions about EU pension portability and long-term sustainability of social systems.",
      },
      CAD: {
        babyBoomers:
          "Canadian Baby Boomers benefited from strong CPP/QPP systems and universal healthcare. They experienced significant real estate appreciation and stable employment.",
        genX: "Canadian Generation X navigates RRSP/TFSA systems while supporting aging parents. They benefit from universal healthcare but face rising housing costs.",
        millennials:
          "Canadian Millennials deal with housing affordability crisis, student debt, and climate concerns. They benefit from enhanced CPP but need additional retirement savings.",
        genZ: "Canadian Generation Z enters workforce with climate activism priorities, gig economy challenges, and concerns about healthcare system sustainability.",
      },
      AUD: {
        babyBoomers:
          "Australian Baby Boomers benefited from superannuation introduction and property booms. They have Medicare security but face aged care funding challenges.",
        genX: "Australian Generation X experienced superannuation guarantee increases and mining boom prosperity. They're peak earners but face sandwich generation pressures.",
        millennials:
          "Australian Millennials face housing affordability crisis despite mandatory superannuation. Climate change and natural disasters affect long-term planning.",
        genZ: "Australian Generation Z benefits from higher superannuation rates but faces climate change impacts, housing costs, and gig economy retirement planning challenges.",
      },
      CHF: {
        babyBoomers:
          "Swiss Baby Boomers benefited from the three-pillar pension system and economic stability. They face high healthcare costs but have strong social security.",
        genX: "Swiss Generation X enjoys high salaries and strong pension systems but faces expensive living costs and healthcare premiums.",
        millennials:
          "Swiss Millennials benefit from high wages and stable economy but face housing costs and concerns about pension system sustainability with aging population.",
        genZ: "Swiss Generation Z enters workforce with climate concerns, high living costs, and questions about long-term pension system viability.",
      },
      JPY: {
        babyBoomers:
          "Japanese Baby Boomers experienced economic growth and lifetime employment. They face aging society challenges and low interest rate environment affecting savings.",
        genX: "Japanese Generation X navigated economic stagnation and employment system changes. They face caring for aging parents in rapidly aging society.",
        millennials:
          "Japanese Millennials deal with deflation, irregular employment, and pension system pressures from demographic changes. Traditional retirement models are changing.",
        genZ: "Japanese Generation Z faces population decline, automation, and fundamental changes to traditional employment and retirement systems.",
      },
      NZD: {
        babyBoomers:
          "New Zealand Baby Boomers benefited from universal NZ Superannuation and property appreciation. They have public healthcare but face aged care costs.",
        genX: "New Zealand Generation X experienced KiwiSaver introduction and housing booms. They balance supporting children and aging parents.",
        millennials:
          "New Zealand Millennials face severe housing affordability crisis despite KiwiSaver. Climate change and natural disasters affect long-term planning.",
        genZ: "New Zealand Generation Z benefits from KiwiSaver but faces housing crisis, climate change impacts, and questions about NZ Super sustainability.",
      },
    }
    return insights[currency as keyof typeof insights]?.[generation as keyof typeof insights.USD] || ""
  }

  const getGenerationChallenges = (generation: string, currency: string) => {
    const challenges = {
      USD: {
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
      },
      GBP: {
        babyBoomers: [
          "Final salary pension schemes largely available",
          "Property boom provided wealth accumulation",
          "NHS provides healthcare security",
          "Earlier retirement ages were common",
        ],
        genX: [
          "Pension reforms reduced guaranteed benefits",
          "Property ladder increasingly difficult",
          "Caring for aging parents with longer lifespans",
          "Auto-enrollment helps but contributions low",
        ],
        millennials: [
          "Housing affordability crisis limits savings",
          "Student debt burden from university fees",
          "Gig economy reduces pension contributions",
          "Brexit uncertainty affects long-term planning",
        ],
        genZ: [
          "Climate change concerns affect career choices",
          "High education costs and living expenses",
          "Uncertain state pension age increases",
          "Digital economy creates new opportunities and risks",
        ],
      },
      EUR: {
        babyBoomers: [
          "Strong social security systems across EU",
          "Generous state pensions in many countries",
          "Universal healthcare reduces retirement costs",
          "Property ownership rates historically high",
        ],
        genX: [
          "EU integration provides pension portability",
          "Economic crises affected savings and employment",
          "Diverse pension systems across countries",
          "Strong worker protection laws",
        ],
        millennials: [
          "Youth unemployment in southern Europe",
          "Climate change drives policy and career decisions",
          "EU mobility provides opportunities",
          "Varying economic conditions across regions",
        ],
        genZ: [
          "Digital transformation creates new job categories",
          "Climate activism influences financial priorities",
          "EU Green Deal affects investment choices",
          "Concerns about pension system sustainability",
        ],
      },
      CAD: {
        babyBoomers: [
          "Strong CPP/QPP and universal healthcare benefits",
          "Significant real estate appreciation",
          "Stable employment and pension systems",
          "Lower healthcare costs due to universal system",
        ],
        genX: [
          "RRSP and TFSA tax-advantaged savings options",
          "Peak earning years with dual income households",
          "Supporting aging parents and children",
          "Benefiting from resource sector employment",
        ],
        millennials: [
          "Housing affordability crisis in major cities",
          "Student debt from higher education costs",
          "Enhanced CPP benefits but still need additional savings",
          "Climate change affecting career and location choices",
        ],
        genZ: [
          "Gig economy and non-traditional employment",
          "Climate activism influencing financial decisions",
          "High cost of living in urban centers",
          "Concerns about healthcare system sustainability",
        ],
      },
      AUD: {
        babyBoomers: [
          "Superannuation system introduction benefits",
          "Property boom wealth accumulation",
          "Medicare provides healthcare security",
          "Mining boom economic prosperity",
        ],
        genX: [
          "Superannuation guarantee rate increases",
          "Peak earning years with dual incomes",
          "Property investment opportunities",
          "Sandwich generation supporting both ends",
        ],
        millennials: [
          "Housing affordability crisis despite super",
          "HECS debt from university education",
          "Climate change and natural disaster concerns",
          "Gig economy affecting super contributions",
        ],
        genZ: [
          "Higher superannuation guarantee rates",
          "Climate change impacts on career choices",
          "Housing market locked out in major cities",
          "Digital economy and non-traditional work",
        ],
      },
      CHF: {
        babyBoomers: [
          "Three-pillar pension system benefits",
          "Economic stability and high wages",
          "Strong social security system",
          "Property ownership advantages",
        ],
        genX: [
          "High earning potential and stable employment",
          "Strong pension contributions and benefits",
          "Expensive but high-quality healthcare",
          "Supporting aging parents with longevity",
        ],
        millennials: [
          "High wages but expensive living costs",
          "Housing affordability challenges",
          "Concerns about pension system sustainability",
          "Climate change affecting Alpine regions",
        ],
        genZ: [
          "Entering workforce with climate priorities",
          "High cost of living and education",
          "Questions about long-term pension viability",
          "Digital transformation opportunities",
        ],
      },
      JPY: {
        babyBoomers: [
          "Lifetime employment and company pensions",
          "Economic growth period benefits",
          "Strong social cohesion and family support",
          "Universal healthcare system",
        ],
        genX: [
          "Economic stagnation and employment changes",
          "Caring for aging parents in aging society",
          "Low interest rates affecting savings",
          "Traditional employment system breakdown",
        ],
        millennials: [
          "Irregular employment and job insecurity",
          "Deflation affecting wage growth",
          "Pension system under demographic pressure",
          "Traditional retirement models changing",
        ],
        genZ: [
          "Population decline and automation",
          "Fundamental employment system changes",
          "Caring for largest elderly population",
          "Technology creating new opportunities",
        ],
      },
      NZD: {
        babyBoomers: [
          "Universal NZ Superannuation benefits",
          "Property boom wealth accumulation",
          "Public healthcare system access",
          "Stable political and economic environment",
        ],
        genX: [
          "KiwiSaver introduction benefits",
          "Property investment opportunities",
          "Peak earning years with dual incomes",
          "Supporting children and aging parents",
        ],
        millennials: [
          "Severe housing affordability crisis",
          "KiwiSaver helping but insufficient alone",
          "Climate change and natural disaster risks",
          "Student loan debt burden",
        ],
        genZ: [
          "KiwiSaver from early age benefits",
          "Locked out of housing market",
          "Climate change major concern",
          "Questions about NZ Super sustainability",
        ],
      },
    }
    return challenges[currency as keyof typeof challenges]?.[generation as keyof typeof challenges.USD] || []
  }

  const getCrisisLevel = () => {
    if (!results) return "safe"
    const savingsRate = (data.monthlyContribution * 12) / data.currentSalary
    if (savingsRate < 0.1) return "critical"
    if (savingsRate < 0.15) return "warning"
    return "safe"
  }

  const crisisLevel = getCrisisLevel()
  const currentCurrency = currencyData[data.currency]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Global Retirement Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Plan your retirement with comprehensive analysis across 8 major currencies: USD, GBP, EUR, CAD, AUD, CHF,
            JPY, and NZD. Get insights on lifestyle maintenance, crisis assessment, generational comparisons, and
            healthcare costs.
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
                <div>
                  <Label htmlFor="currency" className="dark:text-gray-200">
                    Currency
                  </Label>
                  <Select value={data.currency} onValueChange={(value: any) => setData({ ...data, currency: value })}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectItem value="USD" className="dark:text-white dark:hover:bg-gray-600">
                        🇺🇸 USD - US Dollar
                      </SelectItem>
                      <SelectItem value="GBP" className="dark:text-white dark:hover:bg-gray-600">
                        🇬🇧 GBP - British Pound
                      </SelectItem>
                      <SelectItem value="EUR" className="dark:text-white dark:hover:bg-gray-600">
                        🇪🇺 EUR - Euro
                      </SelectItem>
                      <SelectItem value="CAD" className="dark:text-white dark:hover:bg-gray-600">
                        🇨🇦 CAD - Canadian Dollar
                      </SelectItem>
                      <SelectItem value="AUD" className="dark:text-white dark:hover:bg-gray-600">
                        🇦🇺 AUD - Australian Dollar
                      </SelectItem>
                      <SelectItem value="CHF" className="dark:text-white dark:hover:bg-gray-600">
                        🇨🇭 CHF - Swiss Franc
                      </SelectItem>
                      <SelectItem value="JPY" className="dark:text-white dark:hover:bg-gray-600">
                        🇯🇵 JPY - Japanese Yen
                      </SelectItem>
                      <SelectItem value="NZD" className="dark:text-white dark:hover:bg-gray-600">
                        🇳🇿 NZD - New Zealand Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
              <TabsList className="w-full dark:bg-gray-800 flex md:grid md:grid-cols-5 overflow-x-auto gap-1 p-1">
                <TabsTrigger
                  value="traditional"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white whitespace-nowrap px-2 py-2 text-xs md:text-sm flex-shrink-0"
                >
                  Traditional
                </TabsTrigger>
                <TabsTrigger
                  value="lifestyle"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white whitespace-nowrap px-2 py-2 text-xs md:text-sm flex-shrink-0"
                >
                  Lifestyle
                </TabsTrigger>
                <TabsTrigger
                  value="crisis"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white whitespace-nowrap px-2 py-2 text-xs md:text-sm flex-shrink-0"
                >
                  Crisis
                </TabsTrigger>
                <TabsTrigger
                  value="generation"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white whitespace-nowrap px-2 py-2 text-xs md:text-sm flex-shrink-0"
                >
                  Generation
                </TabsTrigger>
                <TabsTrigger
                  value="healthcare"
                  className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white whitespace-nowrap px-2 py-2 text-xs md:text-sm flex-shrink-0"
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
                      Traditional Retirement Projection ({currentCurrency.flag} {data.currency})
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
                      Generational Retirement Gap ({currentCurrency.flag} {data.currency})
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Compare retirement challenges across different generations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results && currentCurrency && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            You are: {getGenerationName(data.generation)}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Born: {currentCurrency.generationData[data.generation]?.birthYears}
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(currentCurrency.generationData).map(([gen, genData]: [string, any]) => (
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
                                <p>State Pension: {formatCurrency(genData.socialSecurityBenefit)}/mo</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Alert className="dark:bg-blue-900/20 dark:border-blue-800">
                          <Users className="h-4 w-4" />
                          <AlertDescription className="dark:text-blue-300">
                            <strong>Generational Insight:</strong>{" "}
                            {getGenerationInsight(data.generation, data.currency)}
                          </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                            Your Generation's Challenges
                          </h3>
                          <div className="text-sm text-indigo-700 dark:text-indigo-400">
                            <ul className="space-y-1">
                              {getGenerationChallenges(data.generation, data.currency).map((challenge, index) => (
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
                    {results && currentCurrency && (
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
                            <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                              Healthcare Multiplier
                            </h3>
                            <p className="text-xl font-bold text-purple-900 dark:text-purple-200">
                              {currentCurrency.healthcareMultiplier}x
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">vs general inflation</p>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                            Healthcare Cost Reality
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                            Healthcare costs have historically grown {currentCurrency.healthcareMultiplier}x faster than
                            general inflation in {data.currency} regions. This means your healthcare expenses in
                            retirement will likely consume a larger portion of your income.
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
                                      1 + (data.inflationRate * currentCurrency.healthcareMultiplier) / 100,
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
                                      1 + (data.inflationRate * currentCurrency.healthcareMultiplier) / 100,
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
                            <strong>Healthcare Planning Tip:</strong>{" "}
                            {data.currency === "USD" &&
                              "Consider Health Savings Accounts (HSAs) for triple tax advantages, long-term care insurance, and factor healthcare inflation into your retirement income planning. Medicare doesn't cover everything!"}
                            {data.currency === "GBP" &&
                              "While the NHS provides healthcare security, consider private health insurance for retirement, long-term care costs, and dental/optical expenses not covered by the NHS."}
                            {data.currency === "EUR" &&
                              "European healthcare systems vary by country. Consider supplemental insurance for services not covered by your national system, long-term care, and cross-border healthcare needs."}
                            {data.currency === "CAD" &&
                              "While Canada has universal healthcare, consider supplemental insurance for prescription drugs, dental, vision, and long-term care not covered by provincial health plans."}
                            {data.currency === "AUD" &&
                              "Medicare provides basic coverage, but consider private health insurance for faster access to specialists, choice of doctor, and coverage for services not covered by Medicare."}
                            {data.currency === "CHF" &&
                              "Switzerland has mandatory health insurance with high deductibles. Consider supplemental insurance for better coverage and factor in rising healthcare premiums in retirement planning."}
                            {data.currency === "JPY" &&
                              "Japan's universal healthcare covers 70% of costs. Consider supplemental insurance for the remaining 30%, long-term care insurance, and rising healthcare costs with aging."}
                            {data.currency === "NZD" &&
                              "While New Zealand has public healthcare, consider private insurance for faster access to specialists, choice of provider, and services not covered by the public system."}
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

        {/* Essay Section */}
        {essayContent && (
          <div className="mb-12">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Understanding Retirement Planning
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Essential insights for building a secure retirement strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                <MarkdownRenderer content={essayContent} />
              </CardContent>
            </Card>
          </div>
        )}

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
                    • <strong>Healthcare Costs:</strong> Currency-specific multipliers based on regional data
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
                    • <strong>US Data:</strong> Federal Reserve, Social Security Administration, BLS
                  </li>
                  <li>
                    • <strong>UK Data:</strong> ONS, DWP, Bank of England, NHS England
                  </li>
                  <li>
                    • <strong>EU Data:</strong> Eurostat, ECB, OECD, National Statistical Offices
                  </li>
                  <li>
                    • <strong>Other Regions:</strong> National statistical agencies and central banks
                  </li>
                  <li>
                    • <strong>Healthcare Inflation:</strong> Regional CPI-Medical data and OECD health statistics
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
                personalized retirement planning. Market volatility, sequence of returns risk, changing economic
                conditions, and currency fluctuations can significantly impact actual results. Regional differences in
                taxation, social security systems, and healthcare costs are approximated and may vary significantly.
                Exchange rates and international economic conditions add additional complexity to cross-border
                retirement planning.
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
              <Link
                href="/deflation-calculator"
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold dark:text-white">Deflation Calculator</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calculate the effects of deflation on purchasing power and savings
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                href="/legacy-planner"
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold dark:text-white">Legacy Planner</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plan your estate and ensure your assets are distributed as intended
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/student-loan-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">
                Student Loan Calculator
              </Link>
              <Link
                href="/charts"
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold dark:text-white">Charts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visualize your financial data and trends with interactive charts
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
            <Link href="/deflation-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">
              Deflation Calculator
            </Link>
            <Link href="/legacy-planner" className="hover:text-blue-600 dark:hover:text-blue-400">
              Legacy Planner
            </Link>
            <Link href="/student-loan-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">
              Student Loan Calculator
            </Link>
            <Link href="/charts" className="hover:text-blue-600 dark:hover:text-blue-400">
              Charts
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
          <p>© 2025 Global Inflation Calculator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
