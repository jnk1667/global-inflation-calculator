"use client"

import type React from "react"
import { useState, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"
import { Globe } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Script from "next/script"

// Lazy load heavy components for better performance
const SimpleLineChart = lazy(() => import("@/components/simple-line-chart"))
const PurchasingPowerVisual = lazy(() => import("@/components/purchasing-power-visual"))
const CurrencyComparisonChart = lazy(() => import("@/components/currency-comparison-chart"))
const FAQ = lazy(() => import("@/components/faq"))
const SocialShare = lazy(() => import("@/components/social-share"))
const AdBanner = lazy(() => import("@/components/ad-banner"))
const UsageStats = lazy(() => import("@/components/usage-stats"))

interface InflationData {
  [year: string]: number
}

interface CurrencyData {
  data: InflationData
  symbol: string
  name: string
  flag: string
  startYear: number
  endYear: number
}

interface AllInflationData {
  [currency: string]: CurrencyData
}

// Currency definitions with proper spacing
const currencies = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", code: "US" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", code: "GB" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", code: "EU" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", code: "CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", code: "AU" },
  CHF: { symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", code: "CH" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", code: "JP" },
} as const

// Historical context data by decade
const getHistoricalContext = (year: number) => {
  if (year >= 2020) {
    return {
      events: ["• COVID-19 pandemic", "• Remote work boom", "• Supply chain disruptions", "• Cryptocurrency surge"],
      prices: ["• $12.50 Movie ticket", "• $3.45 Gallon of gas", "• $3.25 Loaf of bread", "• $5.50 Cup of coffee"],
    }
  } else if (year >= 2010) {
    return {
      events: [
        "• Social media revolution",
        "• Smartphone adoption",
        "• Economic recovery post-2008",
        "• Obama presidency",
      ],
      prices: ["• $7.89 Movie ticket", "• $2.79 Gallon of gas", "• $2.79 Loaf of bread", "• $2.45 Cup of coffee"],
    }
  } else if (year >= 2000) {
    return {
      events: ["• Dot-com boom and bust", "• 9/11 attacks", "• Iraq War", "• Bush presidency"],
      prices: ["• $5.39 Movie ticket", "• $1.51 Gallon of gas", "• $1.99 Loaf of bread", "• $1.25 Cup of coffee"],
    }
  } else if (year >= 1990) {
    return {
      events: ["• End of Cold War", "• Gulf War", "• Internet emergence", "• Clinton presidency"],
      prices: ["• $4.23 Movie ticket", "• $1.34 Gallon of gas", "• $0.70 Loaf of bread", "• $0.75 Cup of coffee"],
    }
  } else if (year >= 1980) {
    return {
      events: ["• Reagan presidency", "• High inflation period", "• Personal computers", "• MTV launches"],
      prices: ["• $2.69 Movie ticket", "• $1.19 Gallon of gas", "• $0.50 Loaf of bread", "• $0.45 Cup of coffee"],
    }
  } else if (year >= 1970) {
    return {
      events: ["• Vietnam War", "• Oil crisis", "• Watergate scandal", "• Moon landing aftermath"],
      prices: ["• $1.55 Movie ticket", "• $0.36 Gallon of gas", "• $0.25 Loaf of bread", "• $0.25 Cup of coffee"],
    }
  } else if (year >= 1960) {
    return {
      events: ["• Civil Rights Movement", "• JFK presidency", "• Space race", "• Beatles era"],
      prices: ["• $0.69 Movie ticket", "• $0.31 Gallon of gas", "• $0.20 Loaf of bread", "• $0.15 Cup of coffee"],
    }
  } else if (year >= 1950) {
    return {
      events: ["• Post-WWII boom", "• Korean War", "• Suburban growth", "• TV becomes popular"],
      prices: ["• $0.48 Movie ticket", "• $0.27 Gallon of gas", "• $0.14 Loaf of bread", "• $0.10 Cup of coffee"],
    }
  } else if (year >= 1940) {
    return {
      events: ["• World War II", "• Rationing and shortages", "• Women in workforce", "• Victory gardens"],
      prices: ["• $0.23 Movie ticket", "• $0.18 Gallon of gas", "• $0.10 Loaf of bread", "• $0.05 Cup of coffee"],
    }
  } else if (year >= 1930) {
    return {
      events: ["• Great Depression", "• New Deal programs", "• Dust Bowl", "• Radio golden age"],
      prices: ["• $0.20 Movie ticket", "• $0.18 Gallon of gas", "• $0.09 Loaf of bread", "• $0.05 Cup of coffee"],
    }
  } else if (year >= 1920) {
    return {
      events: ["• Roaring Twenties", "• Prohibition era", "• Jazz age", "• Stock market boom"],
      prices: ["• $0.15 Movie ticket", "• $0.25 Gallon of gas", "• $0.08 Loaf of bread", "• $0.05 Cup of coffee"],
    }
  } else {
    return {
      events: ["• World War I", "• Spanish flu pandemic", "• Industrial revolution peak", "• Horse and buggy era"],
      prices: ["• $0.10 Movie ticket", "• $0.20 Gallon of gas", "• $0.05 Loaf of bread", "• $0.03 Cup of coffee"],
    }
  }
}

// Default SEO essay content
const defaultSEOEssay = `
# Understanding Inflation: A Comprehensive Guide to Currency Devaluation and Economic Impact

## What is Inflation?

Inflation is the sustained increase in the general price level of goods and services in an economy over time. When inflation occurs, each unit of currency buys fewer goods and services than it did previously, effectively reducing the purchasing power of money. This economic phenomenon affects every aspect of our financial lives, from the cost of groceries to the value of our savings accounts.

The concept of inflation is fundamental to understanding modern economics and personal finance. Unlike temporary price fluctuations that might affect individual products or services, inflation represents a broad-based increase in prices across the entire economy. This makes it one of the most important economic indicators that governments, businesses, and individuals monitor closely.

## How Inflation is Measured

Central banks and statistical agencies measure inflation using various price indices, with the Consumer Price Index (CPI) being the most commonly referenced metric. The CPI tracks the average change in prices paid by consumers for a basket of goods and services, including food, housing, transportation, medical care, recreation, education, and communication.

Other important inflation measures include the Producer Price Index (PPI), which tracks wholesale prices, and the Personal Consumption Expenditures (PCE) price index, which is often preferred by central banks for monetary policy decisions. Each measure provides slightly different perspectives on inflationary pressures within the economy.

## Historical Context of Inflation

Throughout history, inflation has been a persistent feature of most economies. The United States has experienced various inflationary periods, from the hyperinflation following the Civil War to the stagflation of the 1970s. Understanding these historical patterns helps us appreciate how inflation affects long-term financial planning and investment strategies.

The most dramatic example of hyperinflation in modern history occurred in Germany during the Weimar Republic in the early 1920s, when prices doubled every few days. More recently, countries like Zimbabwe and Venezuela have experienced similar hyperinflationary episodes, demonstrating the devastating effects of uncontrolled monetary expansion.

## Causes of Inflation

Inflation can arise from several sources, broadly categorized into demand-pull and cost-push factors. Demand-pull inflation occurs when aggregate demand exceeds aggregate supply, often resulting from increased consumer spending, government expenditure, or investment. This type of inflation typically indicates a growing, healthy economy but can become problematic if it accelerates too rapidly.

Cost-push inflation, on the other hand, results from increases in production costs, such as wages, raw materials, or energy prices. When businesses face higher costs, they often pass these increases on to consumers in the form of higher prices. Supply chain disruptions, natural disasters, or geopolitical events can trigger cost-push inflation.

Monetary factors also play a crucial role in inflation. When central banks increase the money supply faster than economic growth, it can lead to inflationary pressures. This relationship, described by the quantity theory of money, suggests that excessive money creation ultimately results in higher prices rather than increased real economic output.

## The Role of Central Banks

Central banks, such as the Federal Reserve in the United States, the European Central Bank, and the Bank of England, play a pivotal role in managing inflation through monetary policy. These institutions use various tools, including interest rate adjustments, open market operations, and reserve requirements, to influence economic activity and price stability.

Most modern central banks target an inflation rate of around 2% annually, considering this level optimal for economic growth while maintaining price stability. This target represents a balance between the benefits of mild inflation, such as encouraging spending and investment, and the costs of higher inflation, including reduced purchasing power and economic uncertainty.

## Protecting Against Inflation

Individuals and businesses can take various steps to protect themselves against inflation's erosive effects. Diversifying investments across different asset classes, including inflation-protected securities, real estate, and commodities, can help maintain purchasing power over time. Treasury Inflation-Protected Securities (TIPS) are specifically designed to adjust their principal value based on inflation rates.

For businesses, inflation protection strategies might include flexible pricing mechanisms, long-term contracts with inflation adjustments, and supply chain diversification. Understanding inflation's impact on different aspects of business operations is crucial for maintaining profitability during inflationary periods.

This comprehensive understanding of inflation helps explain why tools like our Global Inflation Calculator are valuable for making informed financial decisions and understanding the long-term impact of monetary policy on personal wealth and economic planning.
`

export default function Home() {
  const [amount, setAmount] = useState("100")
  const [fromYear, setFromYear] = useState(2020)
  const [selectedCurrency, setSelectedCurrency] = useState<keyof typeof currencies>("USD")
  const [inflationData, setInflationData] = useState<AllInflationData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [seoEssay, setSeoEssay] = useState<string>(defaultSEOEssay)
  const [logoUrl, setLogoUrl] = useState<string>("")

  const currentYear = new Date().getFullYear()
  const maxYear = currentYear
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com"

  // Load site settings including logo
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("logo_url").eq("id", "main").single()
        if (data?.logo_url) {
          setLogoUrl(data.logo_url)
        }
      } catch (err) {
        console.log("Using default logo")
        // Set fallback to empty string to use Globe icon
        setLogoUrl("")
      }
    }
    loadSiteSettings()
  }, [])

  // Load SEO essay content
  useEffect(() => {
    const loadSEOEssay = async () => {
      try {
        const { data } = await supabase.from("seo_content").select("content").eq("id", "main_essay").single()
        if (data?.content) {
          setSeoEssay(data.content)
        }
      } catch (err) {
        console.log("Using default SEO essay content")
      }
    }
    loadSEOEssay()
  }, [])

  // Load inflation data with optimized fetching
  useEffect(() => {
    let isMounted = true

    const loadInflationData = async () => {
      if (!isMounted) return

      setLoading(true)
      setError(null)

      try {
        const loadedData: AllInflationData = {}
        const promises = Object.entries(currencies).map(async ([code, info]) => {
          try {
            const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`)
            if (response.ok) {
              const data = await response.json()
              const inflationYears = Object.keys(data.data || {})
                .map(Number)
                .filter((year) => !isNaN(year))

              if (inflationYears.length > 0) {
                return {
                  code,
                  data: {
                    data: data.data || {},
                    symbol: info.symbol,
                    name: info.name,
                    flag: info.flag,
                    startYear: Math.min(...inflationYears),
                    endYear: Math.max(...inflationYears),
                  },
                }
              }
            }
          } catch (err) {
            console.warn(`Error loading ${code} data:`, err)
          }
          return null
        })

        const results = await Promise.all(promises)
        let successCount = 0

        results.forEach((result) => {
          if (result && isMounted) {
            loadedData[result.code] = result.data
            successCount++
          }
        })

        if (isMounted) {
          if (successCount > 0) {
            setInflationData(loadedData)
            setFromYear(2020)
          } else {
            throw new Error("No inflation data could be loaded")
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load inflation data. Please try again later.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInflationData()
    return () => {
      isMounted = false
    }
  }, [])

  // Handle currency change
  const handleCurrencyChange = (currency: keyof typeof currencies) => {
    setSelectedCurrency(currency)
    setFromYear(2020)
    setHasCalculated(false)
  }

  // Handle input changes with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === "" || (numValue >= 0 && numValue <= 1000000000000)) {
        setAmount(value)
        setHasCalculated(false)
      }
    }
  }

  const handleYearChange = (value: number[]) => {
    setFromYear(value[0])
    setHasCalculated(false)
  }

  // Get current currency data
  const currentCurrencyData = inflationData[selectedCurrency]
  const minYear = currentCurrencyData?.startYear || 1913

  // Generate currency-specific year markers
  const generateYearMarkers = () => {
    const markers = []
    if (selectedCurrency === "USD") {
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "CAD") {
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "GBP") {
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "AUD") {
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "EUR") {
      markers.push(2000, 2010, 2020)
    } else if (selectedCurrency === "CHF") {
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "JPY") {
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    }
    return markers.filter((year) => year > minYear && year < maxYear)
  }

  const yearMarkers = generateYearMarkers()

  // Calculate inflation with memoization
  const calculateInflation = () => {
    if (!currentCurrencyData?.data) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const fromInflation = currentCurrencyData.data[fromYear.toString()]
    const currentInflation = currentCurrencyData.data[currentYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0 || currentInflation <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [] }
    }

    const adjustedAmount = (amountValue * currentInflation) / fromInflation
    const totalInflation = ((adjustedAmount - amountValue) / amountValue) * 100
    const years = currentYear - fromYear
    const annualRate = years > 0 ? Math.pow(adjustedAmount / amountValue, 1 / years) - 1 : 0

    // Generate chart data
    const chartData = []
    const stepSize = Math.max(1, Math.floor((currentYear - fromYear) / 20))

    for (let year = fromYear; year <= currentYear; year += stepSize) {
      const yearInflation = currentCurrencyData.data[year.toString()]
      if (yearInflation && yearInflation > 0 && fromInflation > 0) {
        const yearValue = (amountValue * yearInflation) / fromInflation
        if (isFinite(yearValue) && yearValue > 0) {
          chartData.push({ year, value: yearValue })
        }
      }
    }

    if (chartData.length === 0 || chartData[chartData.length - 1].year !== currentYear) {
      if (isFinite(adjustedAmount) && adjustedAmount > 0) {
        chartData.push({ year: currentYear, value: adjustedAmount })
      }
    }

    return {
      adjustedAmount: isFinite(adjustedAmount) ? adjustedAmount : 0,
      totalInflation: isFinite(totalInflation) ? totalInflation : 0,
      annualRate: isFinite(annualRate) ? annualRate * 100 : 0,
      chartData,
    }
  }

  const { adjustedAmount, totalInflation, annualRate, chartData } = calculateInflation()
  const yearsAgo = currentYear - fromYear
  const historicalContext = getHistoricalContext(fromYear)

  // Get proper currency symbol with spacing
  const getCurrencyDisplay = (value: number) => {
    const symbol = currentCurrencyData?.symbol || "$"
    if (symbol.length > 1) {
      return `${symbol} ${value.toFixed(2)}`
    }
    return `${symbol}${value.toFixed(2)}`
  }

  // Function to render SEO content
  const renderSEOContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            {line.substring(2)}
          </h2>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            {line.substring(3)}
          </h3>
        )
      } else if (line.trim() === "") {
        return <br key={index} />
      } else {
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Calculator Schema Markup */}
        <Script
          id="calculator-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Global Inflation Calculator",
              description:
                "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present",
              url: siteUrl,
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web Browser",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              featureList: [
                "Historical inflation calculation from 1913-2025",
                "Multi-currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY)",
                "Purchasing power comparison",
                "Interactive charts and visualizations",
                "Historical context and events",
                "Real-time calculations",
              ],
              creator: {
                "@type": "Organization",
                name: "Global Inflation Calculator",
                url: siteUrl,
              },
              datePublished: "2024-01-01",
              dateModified: new Date().toISOString(),
              inLanguage: "en-US",
              isAccessibleForFree: true,
              keywords:
                "inflation calculator, purchasing power, historical inflation, currency calculator, CPI, economic data",
            }),
          }}
        />

        {/* Breadcrumb Schema */}
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Inflation Calculator",
                  item: siteUrl,
                },
              ],
            }),
          }}
        />

        {/* Usage Stats - Top Right Corner */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200">
            <Suspense fallback={<div className="w-24 h-6 bg-gray-200 animate-pulse rounded" />}>
              <UsageStats />
            </Suspense>
          </div>
        </div>

        {/* Header - Always rendered for SEO */}
        <header className="bg-white shadow-sm border-b pt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl || "/placeholder.svg"}
                      alt="Global Inflation Calculator Globe Icon"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg"
                      loading="eager"
                      onError={() => setLogoUrl("")}
                    />
                  ) : (
                    <Globe className="w-16 h-16 md:w-20 md:h-20 text-blue-600" />
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Global Inflation Calculator</h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Calculate how inflation affects your money over time across different currencies. See real purchasing
                power changes from 1913 to {currentYear}.
              </p>
            </div>
          </div>
        </header>

        {/* Top Ad */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
              <AdBanner slot="header" format="horizontal" className="max-w-full" />
            </Suspense>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Calculator Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6 space-y-8">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label htmlFor="amount-input" className="text-sm text-gray-600">
                    Enter Amount ($0.0 - $1,000,000,000,000)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                      {currentCurrencyData?.symbol || "$"}
                    </span>
                    <Input
                      id="amount-input"
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      className={`text-lg h-12 border-gray-300 ${
                        currentCurrencyData?.symbol && currentCurrencyData.symbol.length > 1 ? "pl-12" : "pl-8"
                      }`}
                      placeholder="100"
                      aria-label="Enter amount to calculate inflation"
                    />
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="space-y-3">
                  <label className="text-sm text-gray-600 font-medium">Select Currency</label>
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
                    role="radiogroup"
                    aria-label="Currency selection"
                  >
                    {Object.entries(currencies).map(([code, info]) => {
                      const currencyData = inflationData[code]
                      const isAvailable = !!currencyData

                      return (
                        <Card
                          key={code}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCurrency === code
                              ? "border-blue-500 border-2 bg-blue-50"
                              : isAvailable
                                ? "border-gray-200 hover:border-gray-300"
                                : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                          }`}
                          onClick={() => isAvailable && handleCurrencyChange(code as keyof typeof currencies)}
                          role="radio"
                          aria-checked={selectedCurrency === code}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && isAvailable) {
                              handleCurrencyChange(code as keyof typeof currencies)
                            }
                          }}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-lg font-bold text-gray-900">{info.flag}</div>
                            <div className="text-xs text-blue-600 font-medium">{code}</div>
                            <div className="text-xs text-gray-500 mt-1">{info.name}</div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Year Selection */}
                <div className="space-y-4">
                  <label className="text-sm text-gray-600 font-medium">From Year</label>

                  {/* Large Year Display */}
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">{fromYear}</div>
                    <div className="text-gray-500">{yearsAgo} years ago</div>
                  </div>

                  {/* Currency-specific Year Slider */}
                  <div className="px-4">
                    <Slider
                      value={[fromYear]}
                      onValueChange={handleYearChange}
                      min={minYear}
                      max={maxYear}
                      step={1}
                      className="w-full"
                      aria-label={`Select year from ${minYear} to ${maxYear}`}
                    />

                    {/* Currency-specific year markers */}
                    <div className="relative mt-8 px-2">
                      {yearMarkers.map((year) => {
                        const position = ((year - minYear) / (maxYear - minYear)) * 100
                        return (
                          <button
                            key={year}
                            onClick={() => {
                              setFromYear(year)
                              setHasCalculated(false)
                            }}
                            className="absolute text-xs text-gray-400 hover:text-blue-600 cursor-pointer transition-colors transform -translate-x-1/2 font-medium"
                            style={{ left: `${position}%` }}
                            aria-label={`Set year to ${year}`}
                          >
                            {year}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Info text */}
                  <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded mt-80">
                    💡 Drag the slider or tap the year buttons above • Data available from {minYear} to {currentYear} •
                    Updated July 2025
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg text-white p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl">🔥</span>
                    <h2 className="text-2xl font-bold">Inflation Impact</h2>
                  </div>

                  <div className="text-5xl font-bold mb-4">{getCurrencyDisplay(adjustedAmount)}</div>

                  <div className="text-xl mb-8 opacity-90">
                    {getCurrencyDisplay(Number.parseFloat(amount))} in {fromYear} equals{" "}
                    {getCurrencyDisplay(adjustedAmount)} in {currentYear}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">{totalInflation.toFixed(1)}%</div>
                      <div className="text-sm opacity-80">Total Inflation</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">{annualRate.toFixed(2)}%</div>
                      <div className="text-sm opacity-80">Annual Average</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">{yearsAgo}</div>
                      <div className="text-sm opacity-80">Years</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      className="bg-white text-blue-600 hover:bg-gray-50"
                      onClick={async () => {
                        const shareText = `💰 ${getCurrencyDisplay(Number.parseFloat(amount))} in ${fromYear} equals ${getCurrencyDisplay(adjustedAmount)} in ${currentYear}! That's ${totalInflation.toFixed(1)}% total inflation.`
                        try {
                          await navigator.clipboard.writeText(`${shareText} ${siteUrl}`)
                          alert("✅ Result copied to clipboard!")
                        } catch {
                          prompt("Copy this text:", `${shareText} ${siteUrl}`)
                        }
                      }}
                    >
                      📤 Share Result
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white text-blue-600 hover:bg-gray-50"
                      onClick={() => {
                        setAmount("100")
                        setFromYear(2020)
                        setHasCalculated(false)
                      }}
                    >
                      🔄 Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Comparison Section */}
            {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                <CurrencyComparisonChart amount={amount} fromYear={fromYear} inflationData={inflationData} />
              </Suspense>
            )}

            {/* Line Chart Section - INCREASED HEIGHT EVEN MORE */}
            {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl">
                    📈 {currencies[selectedCurrency]?.name} Inflation Trend Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* INCREASED HEIGHT FROM h-96 md:h-[600px] TO h-[500px] md:h-[700px] */}
                  <div className="h-[500px] md:h-[700px]">
                    <Suspense fallback={<div className="h-full bg-gray-100 rounded animate-pulse" />}>
                      <SimpleLineChart
                        data={chartData}
                        currency={currentCurrencyData?.symbol || "$"}
                        fromYear={fromYear}
                        selectedCurrency={selectedCurrency}
                        originalAmount={Number.parseFloat(amount)}
                        allInflationData={inflationData}
                      />
                    </Suspense>
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-4">
                    This chart shows how {getCurrencyDisplay(Number.parseFloat(amount))} from {fromYear} would grow due
                    to inflation over time
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Large spacing section - enough for ad banner */}
            <div className="py-16 my-16">
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
                <AdBanner slot="middle" format="horizontal" />
              </Suspense>
            </div>

            {/* Purchasing Power Section */}
            {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                <PurchasingPowerVisual
                  originalAmount={Number.parseFloat(amount)}
                  adjustedAmount={adjustedAmount}
                  currency={selectedCurrency}
                  symbol={currentCurrencyData?.symbol || "$"}
                  fromYear={fromYear}
                />
              </Suspense>
            )}

            {/* Historical Context Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">📚 Historical Context for {fromYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What was happening in {fromYear}:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {historicalContext.events.map((event, index) => (
                        <li key={index}>{event}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Typical prices in {fromYear}:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {historicalContext.prices.map((price, index) => (
                        <li key={index}>{price}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Essay Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  📖 Understanding Inflation and Economics
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed">{renderSEOContent(seoEssay)}</div>
              </CardContent>
            </Card>

            {/* Middle Ad */}
            <div className="flex justify-center my-8">
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
                <AdBanner slot="middle" format="square" />
              </Suspense>
            </div>

            {/* Social Share */}
            <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
              <SocialShare />
            </Suspense>

            {/* FAQ */}
            <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
              <FAQ />
            </Suspense>

            {/* Bottom Ad */}
            <div className="flex justify-center mt-8">
              <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
                <AdBanner slot="footer" format="horizontal" />
              </Suspense>
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Global Inflation Calculator</h3>
                <p className="text-gray-300">
                  Track inflation across major world currencies with historical data from 1913 to {currentYear}.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• US Bureau of Labor Statistics</li>
                  <li>• UK Office for National Statistics</li>
                  <li>• Eurostat</li>
                  <li>• Statistics Canada</li>
                  <li>• Australian Bureau of Statistics</li>
                  <li>• Swiss Federal Statistical Office</li>
                  <li>• Statistics Bureau of Japan</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Last Updated</h4>
                <p className="text-gray-300">July 2025</p>
                <p className="text-sm text-gray-400 mt-2">Data is updated monthly from official government sources.</p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Global Inflation Calculator. Educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
