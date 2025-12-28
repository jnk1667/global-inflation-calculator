"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import {
  DollarSign,
  Home,
  ShoppingBag,
  PiggyBank,
  TrendingUp,
  BookOpen,
  InfoIcon,
  AlertTriangle,
  Shield,
} from "lucide-react"
import AdBanner from "@/components/ad-banner"
import FAQ from "@/components/faq"
import MarkdownRenderer from "@/components/markdown-renderer"
import { getSupabaseClient } from "@/lib/supabase"
import { treasuryData } from "@/lib/treasury-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const COLORS = {
  needs: "#3b82f6", // blue
  wants: "#8b5cf6", // purple
  savings: "#10b981", // green
}

export default function BudgetCalculatorPage() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("5000")
  const [frequency, setFrequency] = useState<"monthly" | "annual" | "biweekly" | "weekly">("monthly")
  const [calculated, setCalculated] = useState(false)
  const [essayContent, setEssayContent] = useState<string>("")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [inflationRate, setInflationRate] = useState(3.0) // Default to current 2025 rate
  const [yearsAhead, setYearsAhead] = useState(5)
  const [currentTreasuryRates, setCurrentTreasuryRates] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  const income = Number.parseFloat(monthlyIncome) || 0
  const monthlyAmount =
    frequency === "annual"
      ? income / 12
      : frequency === "biweekly"
        ? income / 26
        : frequency === "weekly"
          ? income / 52
          : income

  const needs = monthlyAmount * 0.5
  const wants = monthlyAmount * 0.3
  const savings = monthlyAmount * 0.2

  const chartData = [
    { name: "Needs (50%)", value: needs, percentage: 50 },
    { name: "Wants (30%)", value: wants, percentage: 30 },
    { name: "Savings (20%)", value: savings, percentage: 20 },
  ]

  const needsExamples = [
    "Housing (rent/mortgage)",
    "Utilities (electricity, water, gas)",
    "Groceries and basic food",
    "Transportation (car payment, gas, insurance)",
    "Health insurance and healthcare",
    "Minimum debt payments",
    "Essential clothing",
  ]

  const wantsExamples = [
    "Dining out and restaurants",
    "Entertainment (movies, concerts)",
    "Hobbies and recreation",
    "Streaming services",
    "Gym memberships",
    "Travel and vacations",
    "Shopping for non-essentials",
    "Cable TV and premium subscriptions",
  ]

  const savingsExamples = [
    "Emergency fund contributions",
    "Retirement savings (401k, IRA)",
    "Extra debt payments (above minimum)",
    "Investment accounts",
    "College savings (529 plans)",
    "Home down payment savings",
    "Future goals and large purchases",
  ]

  const annualIncome = monthlyAmount * 12
  const annualNeeds = needs * 12
  const annualWants = wants * 12
  const annualSavings = savings * 12

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    try {
      const latestYear = treasuryData.latest_year
      const latestData = treasuryData.data[latestYear]
      const savingsBondsI = treasuryData.savings_bonds.series_i.data[latestYear]

      setCurrentTreasuryRates({
        highYieldSavings: latestData.treasury_bills_3m,
        iBonds: savingsBondsI.composite_rate,
        year: latestYear,
      })
    } catch (error) {
      console.error("Error loading Treasury rates:", error)
    }
  }, [])

  useEffect(() => {
    const loadEssayContent = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("seo_content")
          .select("content")
          .eq("id", "budget_essay")
          .maybeSingle()

        if (error) {
          console.error("Error loading essay content:", error)
          setEssayContent(`
# Mastering the 50/30/20 Budget Rule in 2025

The 50/30/20 budget rule has become one of the most popular and effective budgeting methods for managing personal finances. In an era of economic uncertainty and rising costs, this simple framework provides a clear roadmap for allocating your income between essential needs, personal wants, and future financial security.

## Why the 50/30/20 Rule Works

The beauty of the 50/30/20 rule lies in its simplicity and flexibility. By dividing your after-tax income into three broad categories—50% for needs, 30% for wants, and 20% for savings—you create a balanced approach that covers all aspects of financial life without requiring complex spreadsheets or constant tracking of every penny.

## Adapting to High Cost-of-Living Areas

While the traditional 50/30/20 split works well for many households, those living in high cost-of-living areas may need to adjust their percentages. If your essential expenses exceed 50% of your income, consider a 60/20/20 or even 70/20/10 split. The key principle remains: always allocate something to savings, even if it's less than the ideal 20%.

## Building Long-Term Financial Security

The 20% savings portion of the budget is your ticket to financial freedom. This category should include emergency fund contributions, retirement savings, extra debt payments beyond minimums, and investments. By consistently allocating 20% of your income to these goals, you build a foundation for long-term financial security and wealth accumulation that compounds over time.
          `)
          return
        }

        if (data?.content) {
          setEssayContent(data.content)
        } else {
          setEssayContent(`
# Mastering the 50/30/20 Budget Rule in 2025

The 50/30/20 budget rule has become one of the most popular and effective budgeting methods for managing personal finances. In an era of economic uncertainty and rising costs, this simple framework provides a clear roadmap for allocating your income between essential needs, personal wants, and future financial security.

## Why the 50/30/20 Rule Works

The beauty of the 50/30/20 rule lies in its simplicity and flexibility. By dividing your after-tax income into three broad categories—50% for needs, 30% for wants, and 20% for savings—you create a balanced approach that covers all aspects of financial life without requiring complex spreadsheets or constant tracking of every penny.

## Adapting to High Cost-of-Living Areas

While the traditional 50/30/20 split works well for many households, those living in high cost-of-living areas may need to adjust their percentages. If your essential expenses exceed 50% of your income, consider a 60/20/20 or even 70/20/10 split. The key principle remains: always allocate something to savings, even if it's less than the ideal 20%.

## Building Long-Term Financial Security

The 20% savings portion of the budget is your ticket to financial freedom. This category should include emergency fund contributions, retirement savings, extra debt payments beyond minimums, and investments. By consistently allocating 20% of your income to these goals, you build a foundation for long-term financial security and wealth accumulation that compounds over time.
          `)
        }
      } catch (err) {
        console.error("Error loading essay content:", err)
        setEssayContent(`
# Mastering the 50/30/20 Budget Rule in 2025

The 50/30/20 budget rule has become one of the most popular and effective budgeting methods for managing personal finances. In an era of economic uncertainty and rising costs, this simple framework provides a clear roadmap for allocating your income between essential needs, personal wants, and future financial security.

## Why the 50/30/20 Rule Works

The beauty of the 50/30/20 rule lies in its simplicity and flexibility. By dividing your after-tax income into three broad categories—50% for needs, 30% for wants, and 20% for savings—you create a balanced approach that covers all aspects of financial life without requiring complex spreadsheets or constant tracking of every penny.

## Adapting to High Cost-of-Living Areas

While the traditional 50/30/20 split works well for many households, those living in high cost-of-living areas may need to adjust their percentages. If your essential expenses exceed 50% of your income, consider a 60/20/20 or even 70/20/10 split. The key principle remains: always allocate something to savings, even if it's less than the ideal 20%.

## Building Long-Term Financial Security

The 20% savings portion of the budget is your ticket to financial freedom. This category should include emergency fund contributions, retirement savings, extra debt payments beyond minimums, and investments. By consistently allocating 20% of your income to these goals, you build a foundation for long-term financial security and wealth accumulation that compounds over time.
        `)
      }
    }

    loadEssayContent()
  }, [])

  useEffect(() => {
    if (monthlyIncome && Number.parseFloat(monthlyIncome) > 0) {
      setCalculated(true)
    }
  }, [monthlyIncome])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const calculateSavingsGrowth = (principal: number, rate: number, years: number) => {
    return principal * Math.pow(1 + rate / 100, years)
  }

  const faqs = [
    {
      question: "What is the 50/30/20 budget rule?",
      answer:
        "The 50/30/20 rule is a simple budgeting method where you allocate 50% of your after-tax income to needs, 30% to wants, and 20% to savings and debt repayment. It was popularized by Senator Elizabeth Warren in her book 'All Your Worth: The Ultimate Lifetime Money Plan.'",
    },
    {
      question: "Should I use gross or net income for the 50/30/20 rule?",
      answer:
        "You should use your net income (after-tax income) for the 50/30/20 budget rule. This is your take-home pay after taxes, Social Security, Medicare, and any pre-tax deductions like 401(k) contributions or health insurance premiums.",
    },
    {
      question: "What counts as needs vs wants?",
      answer:
        "Needs (50%) are essential expenses you must pay: housing, utilities, groceries, transportation, insurance, and minimum debt payments. Wants (30%) are non-essential spending that enhances your life but you could live without: dining out, entertainment, hobbies, and subscriptions. If you can eliminate it without serious consequences, it's a want.",
    },
    {
      question: "What if I cannot afford the 50/30/20 split?",
      answer:
        "If your needs exceed 50% of your income, you may need to adjust the percentages or reduce housing/transportation costs. High cost-of-living areas often require 60/20/20 or 70/20/10 splits. The key is ensuring you're still saving something (even if less than 20%) and tracking where your money goes.",
    },
    {
      question: "Should debt payments go in needs or savings?",
      answer:
        "Minimum debt payments (like minimum credit card payments or student loan minimums) count as needs in the 50% category because they are required. Any extra payments above the minimum go into the savings/debt repayment category (20%) since they accelerate debt freedom.",
    },
    {
      question: "How do I start using the 50/30/20 budget?",
      answer:
        "Start by calculating your monthly after-tax income, then multiply by 0.50, 0.30, and 0.20 to get your target amounts. Track your spending for one month to see where you currently stand, then adjust your spending categories to align with the 50/30/20 targets. Use budgeting apps or spreadsheets to monitor progress.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">50/30/20 Budget Calculator</h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
          Split your income the smart way: 50% for needs, 30% for wants, 20% for savings. Simple budgeting that works.
        </p>
      </section>

      {/* Calculator Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-6 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Enter Your Income</h2>
              </div>

              {/* Redesigned Advanced Mode Toggle */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span className="font-medium text-white">Advanced Mode</span>
                  <span className="text-sm text-slate-400">(Inflation Adjusted)</span>
                </div>
                <button
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                    advancedMode ? "bg-emerald-500" : "bg-slate-600/50"
                  }`}
                  aria-label="Toggle advanced mode"
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      advancedMode ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="income" className="mb-2 block text-sm font-medium text-slate-300">
                    Income Amount (After Taxes)
                  </Label>
                  <Input
                    type="number"
                    id="income"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="60000"
                  />
                </div>

                <div>
                  <Label htmlFor="frequency" className="mb-2 block text-sm font-medium text-slate-300">
                    Income Frequency
                  </Label>
                  <select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as "monthly" | "annual" | "biweekly" | "weekly")}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {/* Inflation Settings for Advanced Mode */}
                {advancedMode && (
                  <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <div>
                      <Label htmlFor="inflationRate" className="mb-2 block text-sm font-medium text-slate-300">
                        Expected Annual Inflation Rate (%)
                      </Label>
                      <Input
                        type="number"
                        id="inflationRate"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(Number.parseFloat(e.target.value) || 0)}
                        step="0.1"
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="3.0"
                      />
                      <p className="mt-1 text-xs text-slate-400">Current US inflation: 3.0% (Sept 2025)</p>
                    </div>

                    <div>
                      <Label htmlFor="yearsAhead" className="mb-2 block text-sm font-medium text-slate-300">
                        Years to Project
                      </Label>
                      <Input
                        type="number"
                        id="yearsAhead"
                        value={yearsAhead}
                        onChange={(e) => setYearsAhead(Number.parseInt(e.target.value) || 1)}
                        min="1"
                        max="30"
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="5"
                      />
                      <p className="mt-1 text-xs text-slate-400">See how inflation affects your budget over time</p>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <div className="text-sm text-slate-300">
                      <strong className="text-white">Use After-Tax Income</strong>
                      <p className="mt-1">
                        Enter your take-home pay after taxes and deductions for the most accurate budget split.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart and Breakdown */}
          <div className="space-y-6">
            {/* Chart Card */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Your Budget Split</CardTitle>
                <CardDescription className="text-slate-600">Visual breakdown of your budget allocation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {mounted ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name.split(" ")[0]} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? COLORS.needs : index === 1 ? COLORS.wants : COLORS.savings}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-[300px] flex items-center justify-center bg-slate-50 rounded-lg">
                    <p className="text-slate-500">Loading chart...</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-blue-500/10 p-3">
                    <span className="text-slate-300">Monthly Take-Home:</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(monthlyAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Breakdown Cards */}
            {calculated && monthlyAmount > 0 && (
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {/* Needs Card */}
                <Card className="border-blue-500/30 bg-slate-800/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Home className="h-5 w-5 text-blue-400" />
                      Needs (50%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{formatCurrency(needs)}</div>
                      <div className="text-sm text-slate-400">per month</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Essential Expenses:</p>
                      <ul className="space-y-1 text-sm text-slate-300">
                        {needsExamples.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Wants Card */}
                <Card className="border-purple-500/30 bg-slate-800/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <ShoppingBag className="h-5 w-5 text-purple-400" />
                      Wants (30%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{formatCurrency(wants)}</div>
                      <div className="text-sm text-slate-400">per month</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Lifestyle & Fun:</p>
                      <ul className="space-y-1 text-sm text-slate-300">
                        {wantsExamples.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Savings Card */}
                <Card className="border-green-500/30 bg-slate-800/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <PiggyBank className="h-5 w-5 text-green-400" />
                      Savings (20%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{formatCurrency(savings)}</div>
                      <div className="text-sm text-slate-400">per month</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Future & Goals:</p>
                      <ul className="space-y-1 text-sm text-slate-300">
                        {savingsExamples.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Annual Projections */}
        {calculated && monthlyAmount > 0 && (
          <Card className="mt-8 border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Annual Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4 text-center">
                  <div className="mb-2 text-sm text-slate-400">Annual Income</div>
                  <div className="mt-1 text-2xl font-bold text-white">{formatCurrency(annualIncome)}</div>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-center">
                  <div className="mb-2 text-sm text-slate-400">Annual Needs</div>
                  <div className="mt-1 text-2xl font-bold text-blue-400">{formatCurrency(annualNeeds)}</div>
                </div>
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 text-center">
                  <div className="mb-2 text-sm text-slate-400">Annual Wants</div>
                  <div className="mt-1 text-2xl font-bold text-purple-400">{formatCurrency(annualWants)}</div>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <div className="mb-2 text-sm text-slate-400">Annual Savings</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">{formatCurrency(annualSavings)}</div>
                </div>
              </div>

              {/* Inflation-Adjusted Projections in Advanced Mode */}
              {advancedMode && (
                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-bold text-white">
                    Inflation-Adjusted Budget in {yearsAhead} {yearsAhead === 1 ? "Year" : "Years"}
                  </h3>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
                    <div className="mb-4 flex items-start gap-2 text-sm text-slate-300">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                      <p>
                        With {inflationRate}% annual inflation, you'll need{" "}
                        <strong className="text-white">
                          {formatCurrency(Math.round(annualIncome * Math.pow(1 + inflationRate / 100, yearsAhead)))}
                        </strong>{" "}
                        in {yearsAhead} {yearsAhead === 1 ? "year" : "years"} to maintain the same purchasing power as $
                        {formatCurrency(annualIncome)} today.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                        <div className="mb-2 text-sm text-slate-400">Future Needs</div>
                        <div className="text-xl font-bold text-blue-400">
                          {formatCurrency(Math.round(annualNeeds * Math.pow(1 + inflationRate / 100, yearsAhead)))}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          +
                          {formatCurrency(
                            Math.round(annualNeeds * (Math.pow(1 + inflationRate / 100, yearsAhead) - 1)),
                          )}{" "}
                          vs today
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                        <div className="mb-2 text-sm text-slate-400">Future Wants</div>
                        <div className="text-xl font-bold text-purple-400">
                          {formatCurrency(Math.round(annualWants * Math.pow(1 + inflationRate / 100, yearsAhead)))}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          +
                          {formatCurrency(
                            Math.round(annualWants * (Math.pow(1 + inflationRate / 100, yearsAhead) - 1)),
                          )}{" "}
                          vs today
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                        <div className="mb-2 text-sm text-slate-400">Future Savings Target</div>
                        <div className="text-xl font-bold text-emerald-400">
                          {formatCurrency(Math.round(annualSavings * Math.pow(1 + inflationRate / 100, yearsAhead)))}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          +
                          {formatCurrency(
                            Math.round(annualSavings * (Math.pow(1 + inflationRate / 100, yearsAhead) - 1)),
                          )}{" "}
                          vs today
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex items-start gap-2 text-sm text-slate-300">
                        <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                        <p>
                          <strong className="text-white">Real Purchasing Power:</strong> Your{" "}
                          {formatCurrency(annualSavings)} annual savings today will only have the purchasing power of
                          approximately $
                          {formatCurrency(Math.round(annualSavings / Math.pow(1 + inflationRate / 100, yearsAhead)))} in{" "}
                          {yearsAhead} {yearsAhead === 1 ? "year" : "years"} due to inflation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Savings Growth Projection Section */}
        {calculated && monthlyAmount > 0 && currentTreasuryRates && (
          <div className="mx-auto mt-8 max-w-6xl">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                  Your Savings Growth Potential
                </CardTitle>
                <CardDescription className="text-slate-400">
                  See how your 20% savings ({formatCurrency(annualSavings)}/year) can grow with safe, government-backed
                  investments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* High-Yield Savings Growth */}
                  <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-blue-200">High-Yield Savings Account</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">Current Rate:</span>
                        <span className="text-xl font-bold text-blue-400">
                          {currentTreasuryRates.highYieldSavings.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">After 5 years:</span>
                        <span className="text-2xl font-bold text-white">
                          {formatCurrency(
                            calculateSavingsGrowth(annualSavings * 5, currentTreasuryRates.highYieldSavings, 1),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">After 10 years:</span>
                        <span className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(
                            calculateSavingsGrowth(annualSavings * 10, currentTreasuryRates.highYieldSavings, 1),
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">FDIC-insured, instant access to funds</p>
                    </div>
                  </div>

                  {/* I-Bonds Growth */}
                  <div className="p-6 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-emerald-200">Treasury I-Bonds</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">Current Rate:</span>
                        <span className="text-xl font-bold text-emerald-400">
                          {currentTreasuryRates.iBonds.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">After 5 years:</span>
                        <span className="text-2xl font-bold text-white">
                          {formatCurrency(calculateSavingsGrowth(annualSavings * 5, currentTreasuryRates.iBonds, 1))}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">After 10 years:</span>
                        <span className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(calculateSavingsGrowth(annualSavings * 10, currentTreasuryRates.iBonds, 1))}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">Inflation-protected, 1-year minimum hold</p>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-900/20 border-blue-500/30">
                  <InfoIcon className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-slate-300 text-sm">
                    <strong>Smart Strategy:</strong> Keep 3-6 months of expenses in a high-yield savings account for
                    emergencies, then invest additional savings in I-Bonds or other investments for higher returns.
                    These calculations use current
                    {currentTreasuryRates.year} Treasury rates and assume you save {formatCurrency(annualSavings)}{" "}
                    annually (your 20% savings portion).
                  </AlertDescription>
                </Alert>

                {advancedMode && (
                  <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h4 className="font-semibold text-amber-200 text-sm">Inflation Impact on Savings</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      With {inflationRate}% annual inflation over {yearsAhead} years, your{" "}
                      {formatCurrency(annualSavings)} annual savings will need to grow to maintain purchasing power:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-400">High-Yield Savings Real Return:</div>
                        <div className="text-lg font-bold text-white">
                          {(currentTreasuryRates.highYieldSavings - inflationRate).toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {currentTreasuryRates.highYieldSavings > inflationRate
                            ? "✓ Beating inflation"
                            : "✗ Losing to inflation"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">I-Bonds Real Return:</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {(currentTreasuryRates.iBonds - inflationRate).toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {currentTreasuryRates.iBonds > inflationRate
                            ? "✓ Beating inflation"
                            : "✗ Losing to inflation"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Blog Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Understanding the 50/30/20 Budget Rule
            </CardTitle>
            <CardDescription className="text-slate-400">
              Learn how to effectively manage your money with this proven budgeting method
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-invert prose-slate max-w-none">
            <MarkdownRenderer content={essayContent} />
          </CardContent>
        </Card>
      </section>

      {/* AdBanner */}
      <div className="flex justify-center py-8">
        <AdBanner slot="budget-calculator-mid" />
      </div>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12">
        <FAQ items={faqs} category="budget-calculator" title="50/30/20 Budget Calculator FAQ" />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/80 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Budget Calculator Description */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">Budget Calculator</h3>
              <p className="mb-4 text-sm text-slate-400 leading-relaxed">
                Plan your personal or household budget with inflation-adjusted expenses and track your spending across
                categories.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="mb-4 font-semibold text-white">Data Sources</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Bureau of Labor Statistics (BLS)</li>
                <li>• Consumer Expenditure Survey</li>
                <li>• Federal Reserve Economic Data</li>
                <li>• U.S. Census Bureau</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/deflation-calculator" className="hover:text-white transition-colors">
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="hover:text-white transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/ppp-calculator" className="hover:text-white transition-colors">
                    PPP Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/salary-calculator" className="hover:text-white transition-colors">
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/retirement-calculator" className="hover:text-white transition-colors">
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/student-loan-calculator" className="hover:text-white transition-colors">
                    Student Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/mortgage-calculator" className="hover:text-white transition-colors">
                    Mortgage Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-calculator" className="hover:text-white transition-colors">
                    Budget Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-fund-calculator" className="hover:text-white transition-colors">
                    Emergency Fund Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/roi-calculator" className="hover:text-white transition-colors">
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/legacy-planner" className="hover:text-white transition-colors">
                    Legacy Planner
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 Global Inflation Calculator. Educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
