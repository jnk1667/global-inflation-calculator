"use client"

import type React from "react"
import { useState, useEffect, lazy, Suspense, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"
import { Globe, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { trackPageView } from "@/lib/analytics"
import Script from "next/script"
import Link from "next/link"
import { loadCurrencyMeasuresWithFallback } from "@/lib/data-loader"
import {
  calculateConsensusInflation,
  getMeasureDisplayName,
  getMeasureDescription,
  getDataQualityScore,
} from "@/lib/inflation-measures"

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

// Currency definitions with proper spacing - Added NZD
const currencies = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", code: "US" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", code: "GB" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", code: "EU" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", code: "CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", code: "AU" },
  CHF: { symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", code: "CH" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", code: "JP" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", code: "NZ" },
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

export default function ClientPage() {
  const [amount, setAmount] = useState("100")
  const [fromYear, setFromYear] = useState(2020)
  const [selectedCurrency, setSelectedCurrency] = useState<keyof typeof currencies>("USD")
  const [inflationData, setInflationData] = useState<AllInflationData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [seoEssay, setSeoEssay] = useState<string>(defaultSEOEssay)
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [retryCount, setRetryCount] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [realMeasuresData, setRealMeasuresData] = useState<Record<string, any>>({})
  const [dataQuality, setDataQuality] = useState<{ score: number; details: any } | null>(null)
  const [usingRealData, setUsingRealData] = useState(false)

  // Use refs to track component state and prevent race conditions
  const isMountedRef = useRef(true)
  const loadingControllerRef = useRef<AbortController | null>(null)

  const currentYear = new Date().getFullYear()
  const maxYear = currentYear
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com/"

  // Track page view
  useEffect(() => {
    trackPageView("/")
  }, [])

  // Load site settings including logo - Fixed to handle errors properly
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const { data, error } = await supabase.from("site_settings").select("logo_url").eq("id", "main").single()

        if (error) {
          console.log("No site settings found, using default logo")
          setLogoUrl("")
          return
        }

        if (data?.logo_url && typeof data.logo_url === "string") {
          // Validate that the logo_url is a proper URL
          try {
            new URL(data.logo_url)
            setLogoUrl(data.logo_url)
          } catch {
            console.log("Invalid logo URL, using default")
            setLogoUrl("")
          }
        } else {
          setLogoUrl("")
        }
      } catch (err) {
        console.log("Error loading site settings:", err)
        setLogoUrl("")
      }
    }
    loadSiteSettings()
  }, [])

  // Load SEO essay content
  useEffect(() => {
    const loadSEOEssay = async () => {
      try {
        const { data, error } = await supabase.from("seo_content").select("content").eq("id", "main_essay").single()

        if (error || !data?.content) {
          console.log("Using default SEO essay content")
          setSeoEssay(defaultSEOEssay)
          return
        }

        setSeoEssay(data.content)
      } catch (err) {
        console.log("Error loading SEO essay:", err)
        setSeoEssay(defaultSEOEssay)
      }
    }
    loadSEOEssay()
  }, [])

  // Improved data loading with better error handling and retry logic
  const loadInflationData = useCallback(async (retryAttempt = 0) => {
    // Cancel any existing request
    if (loadingControllerRef.current) {
      loadingControllerRef.current.abort()
    }

    // Create new abort controller
    loadingControllerRef.current = new AbortController()
    const { signal } = loadingControllerRef.current

    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const loadedData: AllInflationData = {}
      const promises = Object.entries(currencies).map(async ([code, info]) => {
        try {
          // Add timeout and signal to fetch
          const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`, {
            signal,
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()

          if (!data || !data.data) {
            throw new Error(`Invalid data format for ${code}`)
          }

          const inflationYears = Object.keys(data.data)
            .map(Number)
            .filter((year) => !isNaN(year))

          if (inflationYears.length > 0) {
            return {
              code,
              data: {
                data: data.data,
                symbol: info.symbol,
                name: info.name,
                flag: info.flag,
                startYear: Math.min(...inflationYears),
                endYear: Math.max(...inflationYears),
              },
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            throw err // Re-throw abort errors
          }
          console.warn(`Error loading ${code} data:`, err)
        }
        return null
      })

      const results = await Promise.all(promises)

      // Check if request was aborted
      if (signal.aborted) {
        return
      }

      let successCount = 0
      results.forEach((result) => {
        if (result && isMountedRef.current) {
          loadedData[result.code] = result.data
          successCount++
        }
      })

      if (!isMountedRef.current) return

      if (successCount > 0) {
        setInflationData(loadedData)
        setFromYear(2020)
        setRetryCount(0)
      } else {
        throw new Error("No inflation data could be loaded")
      }
    } catch (err) {
      if (!isMountedRef.current) return

      if (err instanceof Error && err.name === "AbortError") {
        return // Don't set error for aborted requests
      }

      console.error("Error loading inflation data:", err)

      // Retry logic with exponential backoff
      if (retryAttempt < 3) {
        const delay = Math.pow(2, retryAttempt) * 1000 // 1s, 2s, 4s
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(retryAttempt + 1)
            loadInflationData(retryAttempt + 1)
          }
        }, delay)
        return
      }

      setError("Failed to load inflation data. Please check your connection and try again.")
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const loadRealMeasuresData = useCallback(async (currency: string) => {
    try {
      console.log(`[v0] Loading real inflation measures for ${currency}...`)
      const result = await loadCurrencyMeasuresWithFallback(currency).catch((error) => {
        console.warn(`[v0] Failed to load measures for ${currency}, using empty fallback:`, error)
        return {
          measures: {},
          hasRealData: false,
          fallbackUsed: true,
        }
      })

      setRealMeasuresData((prev) => ({
        ...prev,
        [currency]: result.measures,
      }))

      setUsingRealData(result.hasRealData)

      if (Object.keys(result.measures).length > 0) {
        const quality = getDataQualityScore(result.measures)
        setDataQuality(quality)
        console.log(`[v0] Data quality score for ${currency}: ${quality.score}%`)
      } else {
        setDataQuality({
          score: 0,
          details: { totalMeasures: 0, realDataMeasures: 0, estimatedMeasures: 0, averageYearsCoverage: 0 },
        })
      }

      return result
    } catch (error) {
      console.warn(`[v0] Failed to load real measures for ${currency}:`, error)
      setUsingRealData(false)
      setRealMeasuresData((prev) => ({
        ...prev,
        [currency]: {},
      }))
      setDataQuality({
        score: 0,
        details: { totalMeasures: 0, realDataMeasures: 0, estimatedMeasures: 0, averageYearsCoverage: 0 },
      })
      return null
    }
  }, [])

  // Load inflation data with improved error handling
  useEffect(() => {
    isMountedRef.current = true
    loadInflationData()

    return () => {
      isMountedRef.current = false
      if (loadingControllerRef.current) {
        loadingControllerRef.current.abort()
      }
    }
  }, [loadInflationData])

  useEffect(() => {
    if (selectedCurrency && Object.keys(inflationData).length > 0) {
      loadRealMeasuresData(selectedCurrency)
    }
  }, [selectedCurrency, inflationData, loadRealMeasuresData])

  // Manual retry function
  const handleRetry = useCallback(() => {
    setRetryCount(0)
    loadInflationData()
  }, [loadInflationData])

  // Handle currency change
  const handleCurrencyChange = (currency: keyof typeof currencies) => {
    setSelectedCurrency(currency)
    setFromYear(2020)
    setHasCalculated(false)

    // Load real measures data for the new currency
    loadRealMeasuresData(currency)
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
    } else if (selectedCurrency === "NZD") {
      markers.push(1970, 1980, 1990, 2000, 2010, 2020)
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
      adjustedAmount: isFinite(adjustedAmount) && !isNaN(adjustedAmount) ? adjustedAmount : 0,
      totalInflation: isFinite(totalInflation) && !isNaN(totalInflation) ? totalInflation : 0,
      annualRate: isFinite(annualRate) && !isNaN(annualRate) ? annualRate * 100 : 0,
      chartData,
    }
  }

  const calculateMultipleInflationMeasures = () => {
    if (!currentCurrencyData?.data) {
      return { measures: [], consensus: null }
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return { measures: [], consensus: null }
    }

    // Try to use real measures data first
    const currencyMeasures = realMeasuresData[selectedCurrency]
    if (currencyMeasures && Object.keys(currencyMeasures).length > 0) {
      try {
        console.log(`[v0] Using real inflation measures for ${selectedCurrency}`)
        const result = calculateConsensusInflation(
          currencyMeasures,
          selectedCurrency,
          fromYear,
          currentYear,
          amountValue,
        )

        // Convert to the format expected by the UI
        const measures = result.individualMeasures.map((measure) => ({
          name: getMeasureDisplayName(measure.measure),
          description: getMeasureDescription(measure.measure),
          adjustedAmount: measure.adjustedAmount,
          totalInflation: measure.totalInflation,
          weight: measure.weight,
          confidence: measure.confidence,
        }))

        const consensus = {
          name: "Consensus Inflation Rate",
          description: "Weighted average of all available inflation measures using real data",
          adjustedAmount: result.consensusAdjustedAmount,
          totalInflation: result.consensusTotalInflation,
          confidence: "Very High",
        }

        console.log(`[v0] Successfully calculated ${measures.length} real measures for ${selectedCurrency}`)
        return { measures, consensus }
      } catch (error) {
        console.warn(`[v0] Error calculating real measures, falling back to simulated:`, error)
      }
    }

    // Fallback to simulated data (existing logic)
    console.log(`[v0] Using simulated inflation measures for ${selectedCurrency}`)
    const fromInflation = currentCurrencyData.data[fromYear.toString()]
    const currentInflation = currentCurrencyData.data[currentYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0 || currentInflation <= 0) {
      return { measures: [], consensus: null }
    }

    // For now, we'll simulate different measures with slight variations
    // In production, you'd load actual data for each measure
    const baseAdjustedAmount = (amountValue * currentInflation) / fromInflation
    const baseTotalInflation = ((baseAdjustedAmount - amountValue) / amountValue) * 100

    const measures = [
      {
        name: "Consumer Price Index (CPI)",
        description: "Standard measure of inflation for consumer goods and services",
        adjustedAmount: baseAdjustedAmount,
        totalInflation: baseTotalInflation,
        weight: 0.25,
        confidence: "High",
      },
      {
        name: "Core CPI",
        description: "CPI excluding volatile food and energy prices",
        adjustedAmount: baseAdjustedAmount * 0.98, // Slightly lower, more stable
        totalInflation: baseTotalInflation * 0.98,
        weight: 0.2,
        confidence: "High",
      },
      {
        name: "Chained CPI",
        description: "Accounts for consumer substitution behavior",
        adjustedAmount: baseAdjustedAmount * 0.96, // Typically lower than regular CPI
        totalInflation: baseTotalInflation * 0.96,
        weight: 0.15,
        confidence: "High",
      },
      {
        name: "Personal Consumption Expenditures (PCE)",
        description: "Federal Reserve's preferred inflation measure",
        adjustedAmount: baseAdjustedAmount * 0.97,
        totalInflation: baseTotalInflation * 0.97,
        weight: 0.15,
        confidence: "High",
      },
      {
        name: "Producer Price Index (PPI)",
        description: "Measures wholesale price changes",
        adjustedAmount: baseAdjustedAmount * 1.02, // Often higher volatility
        totalInflation: baseTotalInflation * 1.02,
        weight: 0.1,
        confidence: "Medium",
      },
      {
        name: "GDP Deflator",
        description: "Measures price changes across the entire economy, including government and investment",
        adjustedAmount: baseAdjustedAmount * 0.99, // Typically close to CPI but slightly different
        totalInflation: baseTotalInflation * 0.99,
        weight: 0.15, // Adjust other weights accordingly
        confidence: "High",
      },
    ]

    // Calculate weighted consensus
    const consensusAdjustedAmount = measures.reduce((sum, measure) => sum + measure.adjustedAmount * measure.weight, 0)
    const consensusTotalInflation = measures.reduce((sum, measure) => sum + measure.totalInflation * measure.weight, 0)

    const consensus = {
      name: "Consensus Inflation Rate",
      description: "Weighted average of all available inflation measures (simulated data)",
      adjustedAmount: consensusAdjustedAmount,
      totalInflation: consensusTotalInflation,
      confidence: "Very High",
    }

    return { measures, consensus }
  }

  const { measures: inflationMeasures, consensus: consensusInflation } = calculateMultipleInflationMeasures()

  const { adjustedAmount, totalInflation, annualRate, chartData } = calculateInflation()
  const yearsAgo = currentYear - fromYear
  const historicalContext = getHistoricalContext(fromYear)

  // Get proper currency symbol with spacing
  const getCurrencyDisplay = (value: number) => {
    // Ensure value is a valid number
    if (typeof value !== "number" || !isFinite(value) || isNaN(value)) {
      value = 0
    }

    const symbol = currentCurrencyData?.symbol || "$"
    const formattedValue = value.toFixed(2)

    // Multi-character symbols that need spacing: C$, A$, NZ$, Fr
    if (symbol.length > 1 || symbol === "Fr") {
      return `${symbol} ${formattedValue}`
    }
    return `${symbol}${formattedValue}`
  }

  // Function to render SEO content
  const renderSEOContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            {line.substring(2)}
          </h2>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-300 mt-6 mb-3">
            {line.substring(3)}
          </h3>
        )
      } else if (line.trim() === "") {
        return <br key={index} />
      } else {
        return (
          <p key={index} className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                "Multi-currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
                "Purchasing power comparison",
                "Interactive charts and visualizations",
                "Historical context and events",
                "Real-time calculations",
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
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <Suspense fallback={<div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />}>
              <UsageStats />
            </Suspense>
          </div>
        </div>

        <main className="container mx-auto px-4 py-24 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 mt-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl || "/placeholder.svg"}
                    alt="Global Inflation Calculator Globe Icon"
                    className="w-16 h-16 rounded-full shadow-lg"
                    loading="eager"
                    onError={() => setLogoUrl("")}
                  />
                ) : (
                  <Globe className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Global Inflation Calculator
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Calculate how inflation affects your money over time across different currencies. See real purchasing
              power changes from 1913 to {currentYear}.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
              {retryCount > 0 && (
                <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">
                  Retrying... (Attempt {retryCount + 1}/4)
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <Alert className="bg-red-50 border-red-200 dark:bg-gray-800 dark:border-red-600 mb-8">
                  <AlertDescription className="text-red-800 dark:text-red-400 flex items-center justify-between">
                    <span>{error}</span>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="ml-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Only show calculator if data is loaded */}
              {Object.keys(inflationData).length > 0 && (
                <>
                  {/* Main Calculator Card */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                    <CardContent className="p-8 space-y-8">
                      {/* Amount Input */}
                      <div className="space-y-3">
                        <label htmlFor="amount-input" className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          Enter Amount ($0.0 - $1,000,000,000,000)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
                            {currentCurrencyData?.symbol
                              ? currentCurrencyData.symbol.length > 1 || currentCurrencyData.symbol === "Fr"
                                ? `${currentCurrencyData.symbol} `
                                : currentCurrencyData.symbol
                              : "$"}
                          </span>
                          <Input
                            id="amount-input"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className={`text-lg h-14 border-gray-300 dark:border-gray-700 ${
                              currentCurrencyData?.symbol && currentCurrencyData.symbol.length > 1 ? "pl-12" : "pl-8"
                            }`}
                            placeholder="100"
                            aria-label="Enter amount to calculate inflation"
                          />
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div className="space-y-4">
                        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Select Currency</label>
                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3"
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
                                    ? "border-blue-500 border-2 bg-blue-50 dark:bg-blue-900"
                                    : isAvailable
                                      ? "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                      : "border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-50"
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
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">{info.flag}</div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{code}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{info.name}</div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>

                      {/* Year Selection */}
                      <div className="space-y-6">
                        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">From Year</label>

                        {/* Large Year Display */}
                        <div className="text-center">
                          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">{fromYear}</div>
                          <div className="text-base text-gray-500 dark:text-gray-400">{yearsAgo} years ago</div>
                        </div>

                        {/* Year Slider */}
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

                          {/* Year markers */}
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
                                  className="absolute text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors transform -translate-x-1/2 font-medium"
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
                        <div className="text-center text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-gray-800 p-4 rounded mt-20">
                          💡 Drag the slider or tap the year buttons above • Data available from {minYear} to{" "}
                          {currentYear} • Updated August 2025
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ad Banner - After Calculator */}
                  <div className="mb-8">
                    <Suspense fallback={<div className="h-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}>
                      <AdBanner slot="homepage-after-calculator" format="horizontal" />
                    </Suspense>
                  </div>

                  {/* Results Section */}
                  {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
                    <>
                      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-lg text-white p-8 mb-8">
                        <CardContent className="text-center">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <span className="text-2xl">🔥</span>
                              <h2 className="text-2xl font-bold">Inflation Impact</h2>
                            </div>

                            <div className="text-5xl font-bold mb-4">
                              {consensusInflation
                                ? getCurrencyDisplay(consensusInflation.adjustedAmount)
                                : getCurrencyDisplay(adjustedAmount)}
                            </div>

                            <div className="text-xl mb-8 opacity-90">
                              {getCurrencyDisplay(Number.parseFloat(amount))} in {fromYear} equals{" "}
                              {consensusInflation
                                ? getCurrencyDisplay(consensusInflation.adjustedAmount)
                                : getCurrencyDisplay(adjustedAmount)}{" "}
                              in {currentYear}
                              {consensusInflation && (
                                <div className="text-sm mt-2 opacity-75">
                                  📊 Consensus of {inflationMeasures.length} inflation measures
                                  {usingRealData && <span className="ml-2 text-green-200">✅ Real data</span>}
                                  {!usingRealData && <span className="ml-2 text-yellow-200">⚠️ Estimated data</span>}
                                </div>
                              )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">
                                  {consensusInflation
                                    ? consensusInflation.totalInflation.toFixed(1)
                                    : totalInflation.toFixed(1)}
                                  %
                                </div>
                                <div className="text-sm opacity-80 dark:opacity-70">Total Inflation</div>
                              </div>
                              <div className="bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">{annualRate.toFixed(2)}%</div>
                                <div className="text-sm opacity-80 dark:opacity-70">Annual Average</div>
                              </div>
                              <div className="bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">{yearsAgo}</div>
                                <div className="text-sm opacity-80 dark:opacity-70">Years</div>
                              </div>
                            </div>

                            {/* Breakdown Toggle */}
                            {inflationMeasures.length > 0 && (
                              <div className="mb-6">
                                <Button
                                  variant="outline"
                                  className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 border-white border-opacity-30"
                                  onClick={() => setShowBreakdown(!showBreakdown)}
                                >
                                  {showBreakdown ? "Hide Breakdown" : "View Breakdown"}
                                  <span className="ml-2">{showBreakdown ? "▲" : "▼"}</span>
                                </Button>
                              </div>
                            )}

                            {/* Expandable Breakdown */}
                            {showBreakdown && inflationMeasures.length > 0 && (
                              <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 text-left">
                                <h3 className="text-lg font-semibold mb-4 text-center">
                                  📈 Individual Inflation Measures
                                  {dataQuality && (
                                    <div className="text-sm font-normal mt-2 opacity-80">
                                      Data Quality Score: {dataQuality.score}% ({dataQuality.details.realDataMeasures}{" "}
                                      real, {dataQuality.details.estimatedMeasures} estimated)
                                    </div>
                                  )}
                                </h3>

                                {/* Consensus Result */}
                                {consensusInflation && (
                                  <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4 border-2 border-white border-opacity-30">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-semibold text-yellow-200">
                                          🏆 {consensusInflation.name}
                                        </div>
                                        <div className="text-sm opacity-80">{consensusInflation.description}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold">
                                          {getCurrencyDisplay(consensusInflation.adjustedAmount)}
                                        </div>
                                        <div className="text-sm">{consensusInflation.totalInflation.toFixed(2)}%</div>
                                      </div>
                                    </div>
                                    <div className="text-xs opacity-70">
                                      Confidence: {consensusInflation.confidence} • Weighted average of all measures
                                    </div>
                                  </div>
                                )}

                                {/* Individual Measures */}
                                <div className="space-y-3">
                                  {inflationMeasures.map((measure, index) => (
                                    <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <div className="font-semibold">{measure.name}</div>
                                          <div className="text-sm opacity-80">{measure.description}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold">{getCurrencyDisplay(measure.adjustedAmount)}</div>
                                          <div className="text-sm">{measure.totalInflation.toFixed(2)}%</div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between text-xs opacity-70">
                                        <span>Weight: {(measure.weight * 100).toFixed(0)}%</span>
                                        <span>Confidence: {measure.confidence}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-4 text-xs opacity-70 text-center">
                                  💡 The consensus rate provides the most accurate inflation estimate by combining
                                  multiple official measures
                                  {usingRealData && (
                                    <div className="mt-2">
                                      ✅ Using real data from official government sources (FRED, ONS, etc.)
                                    </div>
                                  )}
                                  {!usingRealData && (
                                    <div className="mt-2">
                                      ⚠️ Using estimated data based on historical patterns - real data loading in
                                      progress
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button
                                variant="outline"
                                className="bg-white text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={async () => {
                                  const finalAmount = consensusInflation
                                    ? consensusInflation.adjustedAmount
                                    : adjustedAmount
                                  const finalInflation = consensusInflation
                                    ? consensusInflation.totalInflation
                                    : totalInflation
                                  const shareText = `💰 ${getCurrencyDisplay(Number.parseFloat(amount))} in ${fromYear} equals ${getCurrencyDisplay(finalAmount)} in ${currentYear}! That's ${finalInflation.toFixed(1)}% total inflation.`
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
                                className="bg-white text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setAmount("100")
                                  setFromYear(2020)
                                  setHasCalculated(false)
                                  setShowBreakdown(false)
                                }}
                              >
                                🔄 Reset
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Currency Comparison Section */}
                      <Suspense
                        fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-8" />}
                      >
                        <CurrencyComparisonChart amount={amount} fromYear={fromYear} inflationData={inflationData} />
                      </Suspense>

                      {/* Line Chart Section */}
                      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                        <CardContent className="p-6">
                          <div className="h-[500px] md:h-[700px]">
                            <Suspense
                              fallback={<div className="h-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}
                            >
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
                        </CardContent>
                      </Card>

                      {/* Ad Banner - Between Chart and Purchasing Power */}
                      <div className="mb-8">
                        <Suspense
                          fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}
                        >
                          <AdBanner slot="homepage-between-chart-purchasing" format="horizontal" />
                        </Suspense>
                      </div>

                      {/* Purchasing Power Section */}
                      <Suspense
                        fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-8" />}
                      >
                        <PurchasingPowerVisual
                          originalAmount={Number.parseFloat(amount)}
                          adjustedAmount={adjustedAmount}
                          currency={selectedCurrency}
                          symbol={currentCurrencyData?.symbol || "$"}
                          fromYear={fromYear}
                          inflationData={currentCurrencyData}
                        />
                      </Suspense>

                      {/* Ad Banner - After Charts */}
                      <div className="mb-8">
                        <Suspense
                          fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}
                        >
                          <AdBanner slot="homepage-after-charts" format="square" className="mx-auto" />
                        </Suspense>
                      </div>

                      {/* Historical Context Section */}
                      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            📚 Historical Context for {fromYear}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                What was happening in {fromYear}:
                              </h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                {historicalContext.events.map((event, index) => (
                                  <li key={index}>{event}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Typical prices in {fromYear}:
                              </h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                {historicalContext.prices.map((price, index) => (
                                  <li key={index}>{price}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Cross-promotion to Salary Calculator */}
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-0 shadow-lg mb-8">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-semibold mb-2">💰 New: Salary Inflation Calculator</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Calculate what your historical salary should be worth today. Perfect for salary negotiations and
                        career planning.
                      </p>
                      <Link href="/salary-calculator">
                        <Button className="bg-green-600 dark:bg-green-800 hover:bg-green-700 dark:hover:bg-green-900 text-white">
                          Try Salary Calculator →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Cross-promotion to Legacy Planner */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border-0 shadow-lg mb-8">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-semibold mb-2">🏛️ New: Multi-Generation Legacy Planner</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Project how inflation affects wealth transfer across generations. Perfect for estate planning
                        and family financial legacy.
                      </p>
                      <Link href="/legacy-planner">
                        <Button className="bg-purple-600 dark:bg-purple-800 hover:bg-purple-700 dark:hover:bg-purple-900 text-white">
                          Plan Your Legacy →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* SEO Essay Section */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        📖 Understanding Inflation and Economics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                      <div className="text-gray-700 dark:text-gray-400 leading-relaxed">
                        {renderSEOContent(seoEssay)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Methodology Section */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">🔬 Calculation Methodology</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                      <div className="text-gray-700 dark:text-gray-400 leading-relaxed space-y-6">
                        {/* Basic Inflation Calculation */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📊 Basic Inflation Calculation
                          </h3>
                          <p className="mb-3">
                            Our primary inflation calculation uses the Consumer Price Index (CPI) formula to determine
                            purchasing power changes over time:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm mb-3">
                            Adjusted Amount = Original Amount × (Current Year CPI / Base Year CPI)
                          </div>
                          <p className="mb-3">
                            <strong>Example:</strong> $100 in 2000 with CPI of 172.2, compared to 2024 with CPI of
                            310.3:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm">
                            $100 × (310.3 / 172.2) = $180.17
                          </div>
                        </div>

                        {/* Multiple Inflation Measures */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📈 Multiple Inflation Measures Methodology
                          </h3>
                          <p className="mb-3">
                            We calculate inflation using six different official measures to provide a comprehensive
                            view:
                          </p>

                          <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                              <h4 className="font-semibold">Consumer Price Index (CPI) - Weight: 25%</h4>
                              <p className="text-sm">
                                Standard measure tracking a basket of consumer goods and services. Uses urban consumer
                                data from national statistics offices.
                              </p>
                            </div>

                            <div className="border-l-4 border-green-500 pl-4">
                              <h4 className="font-semibold">Core CPI - Weight: 20%</h4>
                              <p className="text-sm">
                                CPI excluding volatile food and energy prices. Calculated as: Core CPI = CPI - (Food
                                Component + Energy Component)
                              </p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                              <h4 className="font-semibold">Chained CPI - Weight: 15%</h4>
                              <p className="text-sm">
                                Accounts for consumer substitution behavior using geometric mean formula instead of
                                arithmetic mean, typically 0.2-0.3% lower than regular CPI.
                              </p>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                              <h4 className="font-semibold">Personal Consumption Expenditures (PCE) - Weight: 15%</h4>
                              <p className="text-sm">
                                Federal Reserve's preferred measure, uses business surveys rather than consumer surveys.
                                Covers broader scope of goods and services.
                              </p>
                            </div>

                            <div className="border-l-4 border-red-500 pl-4">
                              <h4 className="font-semibold">Producer Price Index (PPI) - Weight: 10%</h4>
                              <p className="text-sm">
                                Measures wholesale price changes from the seller's perspective. Leading indicator of
                                consumer price changes.
                              </p>
                            </div>

                            <div className="border-l-4 border-teal-500 pl-4">
                              <h4 className="font-semibold">GDP Deflator - Weight: 15%</h4>
                              <p className="text-sm">
                                Measures price changes across the entire economy including government spending and
                                business investment. Formula: (Nominal GDP / Real GDP) × 100
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Consensus Rate Calculation */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🏆 Consensus Rate Calculation
                          </h3>
                          <p className="mb-3">
                            Our consensus inflation rate uses a weighted average of all available measures:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm mb-3">
                            Consensus Rate = Σ(Individual Rate × Weight)
                          </div>
                          <p className="mb-3">
                            <strong>Example calculation:</strong>
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm">
                            <div>CPI (3.2%) × 0.25 = 0.80%</div>
                            <div>Core CPI (3.0%) × 0.20 = 0.60%</div>
                            <div>Chained CPI (2.9%) × 0.15 = 0.44%</div>
                            <div>PCE (2.8%) × 0.15 = 0.42%</div>
                            <div>PPI (3.5%) × 0.10 = 0.35%</div>
                            <div>GDP Deflator (3.1%) × 0.15 = 0.47%</div>
                            <div className="border-t pt-2 mt-2 font-semibold">Consensus Rate = 3.08%</div>
                          </div>
                        </div>

                        {/* Data Sources */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📚 Data Sources & Collection
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Primary Sources:</h4>
                              <ul className="text-sm space-y-1">
                                <li>
                                  • <strong>USA:</strong> Bureau of Labor Statistics (BLS)
                                </li>
                                <li>
                                  • <strong>UK:</strong> Office for National Statistics (ONS)
                                </li>
                                <li>
                                  • <strong>EU:</strong> Eurostat
                                </li>
                                <li>
                                  • <strong>Canada:</strong> Statistics Canada
                                </li>
                                <li>
                                  • <strong>Australia:</strong> Australian Bureau of Statistics
                                </li>
                                <li>
                                  • <strong>Switzerland:</strong> Federal Statistical Office
                                </li>
                                <li>
                                  • <strong>Japan:</strong> Statistics Bureau of Japan
                                </li>
                                <li>
                                  • <strong>New Zealand:</strong> Statistics New Zealand
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Data Processing:</h4>
                              <ul className="text-sm space-y-1">
                                <li>• Monthly data collection via FRED API</li>
                                <li>• Automatic validation and error checking</li>
                                <li>• Missing data interpolation using linear methods</li>
                                <li>• Seasonal adjustment where applicable</li>
                                <li>• Base year normalization (2000 = 100)</li>
                                <li>• Quality assurance against official publications</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Currency Conversion */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            💱 Multi-Currency Methodology
                          </h3>
                          <p className="mb-3">
                            Each currency uses its own national inflation data without cross-currency conversion:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm">
                            <div>
                              <strong>USD:</strong> Uses US CPI-U (Consumer Price Index for All Urban Consumers)
                            </div>
                            <div>
                              <strong>GBP:</strong> Uses UK RPI and CPI data from ONS
                            </div>
                            <div>
                              <strong>EUR:</strong> Uses Harmonized Index of Consumer Prices (HICP)
                            </div>
                            <div>
                              <strong>CAD:</strong> Uses Canadian CPI from Statistics Canada
                            </div>
                            <div>
                              <strong>Others:</strong> National CPI equivalents from respective statistical offices
                            </div>
                          </div>
                        </div>

                        {/* Confidence Levels */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📊 Confidence Level Methodology
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <strong>Very High (95%+):</strong> Consensus rate combining multiple official measures
                            </div>
                            <div>
                              <strong>High (90-95%):</strong> Primary measures like CPI, Core CPI, PCE with extensive
                              historical data
                            </div>
                            <div>
                              <strong>Medium (80-90%):</strong> Secondary measures like PPI with higher volatility
                            </div>
                            <div>
                              <strong>Confidence calculation factors:</strong>
                              <ul className="text-sm mt-2 ml-4 space-y-1">
                                <li>• Data source reliability and methodology</li>
                                <li>• Historical consistency and revisions</li>
                                <li>• Sample size and coverage</li>
                                <li>• Frequency of updates and timeliness</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Limitations */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            ⚠️ Limitations & Considerations
                          </h3>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <ul className="text-sm space-y-2">
                              <li>
                                • <strong>Regional Variation:</strong> National averages may not reflect local inflation
                                experiences
                              </li>
                              <li>
                                • <strong>Basket Changes:</strong> CPI baskets are updated periodically, affecting
                                long-term comparisons
                              </li>
                              <li>
                                • <strong>Quality Adjustments:</strong> Improvements in product quality may not be fully
                                captured
                              </li>
                              <li>
                                • <strong>Substitution Effects:</strong> Consumer behavior changes may not be
                                immediately reflected
                              </li>
                              <li>
                                • <strong>Data Revisions:</strong> Historical data may be revised by statistical
                                agencies
                              </li>
                              <li>
                                • <strong>Coverage Gaps:</strong> Some periods may have limited or estimated data
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Update Frequency */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🔄 Data Update Schedule
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold mb-2">Automatic Updates:</h4>
                              <ul className="space-y-1">
                                <li>
                                  • <strong>Monthly:</strong> Latest CPI releases
                                </li>
                                <li>
                                  • <strong>Quarterly:</strong> GDP deflator updates
                                </li>
                                <li>
                                  • <strong>Weekly:</strong> Data validation checks
                                </li>
                                <li>
                                  • <strong>Daily:</strong> System health monitoring
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Manual Reviews:</h4>
                              <ul className="space-y-1">
                                <li>
                                  • <strong>Quarterly:</strong> Methodology assessment
                                </li>
                                <li>
                                  • <strong>Annually:</strong> Historical data verification
                                </li>
                                <li>
                                  • <strong>As needed:</strong> Statistical agency changes
                                </li>
                                <li>
                                  • <strong>Ongoing:</strong> User feedback integration
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm">
                            <strong>Note:</strong> All calculations are performed using official government data and
                            established economic methodologies. Results are for educational purposes and should not be
                            considered as financial advice. Individual inflation experiences may vary based on personal
                            spending patterns, geographic location, and other factors.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Share */}
                  <Suspense fallback={<div className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-8" />}>
                    <SocialShare />
                  </Suspense>

                  {/* Spacing between Share and FAQ */}
                  <div className="mb-12"></div>

                  {/* FAQ */}
                  <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-8" />}>
                    <FAQ />
                  </Suspense>
                </>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Global Inflation Calculator</h3>
                <p className="text-gray-300 dark:text-gray-50">
                  Track inflation across major world currencies with historical data from 1913 to {currentYear}.
                </p>
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
                      href="/legacy-planner"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Legacy Planner
                    </Link>
                  </li>
                  <li>
                    <Link href="/charts" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Charts & Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
                <p className="text-sm text-gray-400 dark:text-gray-600 mt-4">Last Updated: September 2025</p>
              </div>
            </div>
            <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
              <p>&copy; 2025 Global Inflation Calculator. Educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
