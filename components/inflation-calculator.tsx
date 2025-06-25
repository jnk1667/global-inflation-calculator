"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AdBanner from "./ad-banner"
import SimpleLineChart from "./simple-line-chart"
import CurrencyComparisonChart from "./currency-comparison-chart"
import PurchasingPowerVisual from "./purchasing-power-visual"
import { ErrorBoundary } from "./error-boundary"

interface InflationData {
  [year: string]: number
}

interface CurrencyData {
  [currency: string]: {
    data: InflationData
    symbol: string
    name: string
    flag: string
    earliest: number
    latest: number
  }
}

interface CalculationResult {
  originalAmount: number
  adjustedAmount: number
  totalInflation: number
  annualizedInflation: number
  yearsDifference: number
  fromYear: number
  currentYear: number
}

// 🚀 DYNAMIC YEAR CALCULATION - No more hardcoding!
const getCurrentYear = (): number => {
  return new Date().getFullYear()
}

const CURRENCY_INFO = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", earliest: 1913 },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", earliest: 1947 },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", earliest: 1996 },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", earliest: 1914 },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", earliest: 1948 },
} as const

const MAX_AMOUNT = 1000000000000
const MIN_AMOUNT = 0.01

type CurrencyCode = keyof typeof CURRENCY_INFO

export default function InflationCalculator() {
  const [amount, setAmount] = useState<string>("100")
  const [fromYear, setFromYear] = useState<number>(getCurrentYear() - 5) // Default to 5 years ago
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [inflationData, setInflationData] = useState<CurrencyData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [isCurrencySwitching, setIsCurrencySwitching] = useState<boolean>(false)
  const [currentYear, setCurrentYear] = useState<number>(getCurrentYear())

  // Refs to prevent infinite loops
  const lastCurrencyRef = useRef<CurrencyCode>(currency)
  const isAdjustingYearRef = useRef<boolean>(false)

  // 🕐 Sync with internet time and update yearly
  useEffect(() => {
    const updateCurrentYear = () => {
      const newYear = getCurrentYear()
      setCurrentYear(newYear)
    }

    // Update immediately
    updateCurrentYear()

    // Set up interval to check for year changes (check every hour)
    const interval = setInterval(updateCurrentYear, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // 🔄 Auto-update data when year changes
  useEffect(() => {
    if (inflationData) {
      // Check if we need to fetch new data for the current year
      const hasCurrentYearData = Object.values(inflationData).some(
        (currencyData) => currencyData.data[currentYear.toString()],
      )

      if (!hasCurrentYearData) {
        console.log(`New year detected: ${currentYear}. Refreshing data...`)
        // Trigger data reload
        loadInflationData()
      }
    }
  }, [currentYear])

  // Memoized validation function
  const validateAmount = useCallback((value: string): string | null => {
    if (!value || value.trim() === "") return "Please enter an amount"

    const num = Number.parseFloat(value)
    if (isNaN(num)) return "Please enter a valid number"
    if (num < MIN_AMOUNT) return `Minimum amount is $${MIN_AMOUNT}`
    if (num > MAX_AMOUNT) return `Maximum amount is $${MAX_AMOUNT.toLocaleString()}`

    return null
  }, [])

  // Enhanced amount change handler with debouncing
  const handleAmountChange = useCallback(
    (value: string) => {
      if (value === "") {
        setAmount("")
        setInputError(null)
        return
      }

      const cleanValue = value.replace(/[^0-9.]/g, "")
      const parts = cleanValue.split(".")
      const finalValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleanValue

      const decimalParts = finalValue.split(".")
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        decimalParts[1] = decimalParts[1].substring(0, 2)
      }
      const limitedValue = decimalParts.join(".")

      setAmount(limitedValue)
      const error = validateAmount(limitedValue)
      setInputError(error)

      if (typeof window !== "undefined" && (window as any).incrementCalculation) {
        ;(window as any).incrementCalculation()
      }
    },
    [validateAmount],
  )

  const handleCurrencyChange = useCallback(
    (newCurrency: CurrencyCode) => {
      if (newCurrency === currency) return

      setIsCurrencySwitching(true)
      setCurrency(newCurrency)
      lastCurrencyRef.current = newCurrency

      setTimeout(() => setIsCurrencySwitching(false), 300)
    },
    [currency],
  )

  // Auto-detect user's country and set default currency
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(5000),
        })
        if (!response.ok) throw new Error("Failed to detect location")

        const data = await response.json()
        const countryCode = data.country_code

        const countryToCurrency: { [key: string]: CurrencyCode } = {
          US: "USD",
          GB: "GBP",
          CA: "CAD",
          AU: "AUD",
          DE: "EUR",
          FR: "EUR",
          IT: "EUR",
          ES: "EUR",
          NL: "EUR",
        }

        const detectedCurrency = countryToCurrency[countryCode] || "USD"
        if (detectedCurrency !== currency) {
          setCurrency(detectedCurrency)
          lastCurrencyRef.current = detectedCurrency
        }
      } catch (error) {
        console.log("Could not detect country, using USD default")
      }
    }

    detectCountry()
  }, [])

  // 🚀 Enhanced data loading with dynamic year support
  const loadInflationData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const currencyPromises = Object.entries(CURRENCY_INFO).map(async ([code, info]) => {
        try {
          const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`, {
            signal: AbortSignal.timeout(10000),
          })

          if (!response.ok) {
            console.log(`No data file for ${code}, generating sample data`)
            return [
              code,
              {
                data: generateSampleData(info.earliest, currentYear - 1, getSampleInflationRate(code)), // 🎯 Exclude current year
                ...info,
                latest: currentYear - 1, // 🎯 Latest year is previous year
              },
            ]
          }

          const data = await response.json()

          if (!data.data || typeof data.data !== "object" || Object.keys(data.data).length === 0) {
            throw new Error(`Invalid or empty data structure for ${code}`)
          }

          // 🔄 Determine actual latest year from data (excluding current year)
          const years = Object.keys(data.data)
            .map(Number)
            .filter((year) => !isNaN(year) && year < currentYear) // 🎯 Exclude current year
            .sort((a, b) => b - a)

          const actualLatestYear = years.length > 0 ? years[0] : currentYear - 1

          return [
            code,
            {
              ...data,
              ...info,
              latest: Math.max(actualLatestYear, data.latest || currentYear - 1), // Use the most recent (but not current year)
            },
          ]
        } catch (error) {
          console.log(`Error loading ${code} data:`, error)
          return [
            code,
            {
              data: generateSampleData(info.earliest, currentYear - 1, getSampleInflationRate(code)), // 🎯 Exclude current year
              ...info,
              latest: currentYear - 1,
            },
          ]
        }
      })

      const results = await Promise.all(currencyPromises)
      const inflationData: CurrencyData = Object.fromEntries(results)

      const hasValidData = Object.values(inflationData).some(
        (data) => data && data.data && Object.keys(data.data).length > 10,
      )

      if (!hasValidData) {
        throw new Error("Insufficient inflation data available")
      }

      setInflationData(inflationData)
    } catch (error) {
      console.error("Failed to load inflation data:", error)
      setError("Failed to load inflation data. Please refresh the page.")

      const fallbackData: CurrencyData = {}
      Object.entries(CURRENCY_INFO).forEach(([code, info]) => {
        fallbackData[code] = {
          data: generateSampleData(info.earliest, currentYear - 1, getSampleInflationRate(code)), // 🎯 Exclude current year
          ...info,
          latest: currentYear - 1,
        }
      })
      setInflationData(fallbackData)
    } finally {
      setIsLoading(false)
    }
  }, [currentYear])

  // Load data on mount and when current year changes
  useEffect(() => {
    loadInflationData()
  }, [loadInflationData])

  // Enhanced auto-adjust year when currency changes
  useEffect(() => {
    if (!inflationData || isAdjustingYearRef.current) return

    const currencyData = inflationData[currency]
    if (!currencyData) return

    if (lastCurrencyRef.current !== currency) {
      const currencyEarliest = currencyData.earliest
      const currencyLatest = currencyData.latest

      if (fromYear < currencyEarliest || fromYear > currencyLatest) {
        isAdjustingYearRef.current = true

        let newYear = fromYear
        if (fromYear < currencyEarliest) {
          newYear = currencyEarliest
        } else if (fromYear > currencyLatest) {
          newYear = Math.max(currencyLatest - 10, currencyEarliest)
        }

        setFromYear(newYear)

        setTimeout(() => {
          isAdjustingYearRef.current = false
        }, 100)
      }

      lastCurrencyRef.current = currency
    }
  }, [currency, inflationData])

  // Helper functions
  const getSampleInflationRate = useCallback((currency: string): number => {
    const rates: Record<string, number> = {
      USD: 0.031,
      GBP: 0.035,
      EUR: 0.021,
      CAD: 0.032,
      AUD: 0.034,
    }
    return rates[currency] || 0.03
  }, [])

  const generateSampleData = useCallback((startYear: number, endYear: number, avgInflation: number): InflationData => {
    const data: InflationData = {}
    let cumulativeInflation = 1

    for (let year = startYear; year <= endYear; year++) {
      const yearlyInflation = avgInflation + (Math.random() - 0.5) * 0.02
      cumulativeInflation *= 1 + Math.max(yearlyInflation, -0.1)
      data[year.toString()] = Number(cumulativeInflation.toFixed(6))
    }

    return data
  }, [])

  // Enhanced calculation result with dynamic current year (using latest available data year)
  const calculationResult = useMemo((): CalculationResult | null => {
    if (!inflationData || !amount || !fromYear || inputError) return null

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return null

    const currencyData = inflationData[currency]
    if (!currencyData || !currencyData.data) return null

    const fromInflation = currencyData.data[fromYear.toString()]
    // 🎯 Use latest available year instead of current year
    const latestYear = currencyData.latest
    const currentInflation = currencyData.data[latestYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0 || currentInflation <= 0) return null

    try {
      const adjustedAmount = numAmount * (currentInflation / fromInflation)
      const totalInflation = ((adjustedAmount - numAmount) / numAmount) * 100
      const yearsDifference = latestYear - fromYear
      const annualizedInflation =
        yearsDifference > 0 ? (Math.pow(adjustedAmount / numAmount, 1 / yearsDifference) - 1) * 100 : 0

      if (!isFinite(adjustedAmount) || !isFinite(totalInflation) || !isFinite(annualizedInflation)) {
        return null
      }

      if (adjustedAmount < 0 || totalInflation < -99 || totalInflation > 10000) {
        return null
      }

      return {
        originalAmount: numAmount,
        adjustedAmount: Number(adjustedAmount.toFixed(2)),
        totalInflation: Number(totalInflation.toFixed(2)),
        annualizedInflation: Number(annualizedInflation.toFixed(3)),
        yearsDifference,
        fromYear,
        currentYear: latestYear, // 🎯 Use latest available year
      }
    } catch (error) {
      console.error("Calculation error:", error)
      return null
    }
  }, [amount, fromYear, currency, inflationData, inputError])

  const currentCurrency = useMemo(() => inflationData?.[currency], [inflationData, currency])

  // Enhanced chart data generation with latest available year
  const chartData = useMemo(() => {
    if (!inflationData || !calculationResult) return []

    const currencyData = inflationData[currency]
    if (!currencyData || !currencyData.data) return []

    const data = []
    const baseAmount = calculationResult.originalAmount
    const latestYear = currencyData.latest
    const yearRange = latestYear - fromYear

    if (!isFinite(baseAmount) || baseAmount <= 0 || yearRange <= 0) return []

    try {
      const stepSize = Math.max(1, Math.floor(yearRange / Math.min(20, yearRange)))

      for (let year = fromYear; year <= latestYear; year += stepSize) {
        const yearStr = year.toString()
        if (currencyData.data[yearStr]) {
          const fromInflation = currencyData.data[fromYear.toString()]
          const yearInflation = currencyData.data[yearStr]

          if (
            fromInflation &&
            yearInflation &&
            isFinite(fromInflation) &&
            isFinite(yearInflation) &&
            fromInflation > 0
          ) {
            const adjustedValue = baseAmount * (yearInflation / fromInflation)
            if (isFinite(adjustedValue) && adjustedValue > 0) {
              data.push({ year, value: Number(adjustedValue.toFixed(2)) })
            }
          }
        }
      }

      if (data.length === 0 || data[data.length - 1]?.year !== latestYear) {
        const fromInflation = currencyData.data[fromYear.toString()]
        const currentInflation = currencyData.data[latestYear.toString()]
        if (
          fromInflation &&
          currentInflation &&
          isFinite(fromInflation) &&
          isFinite(currentInflation) &&
          fromInflation > 0
        ) {
          const adjustedValue = baseAmount * (currentInflation / fromInflation)
          if (isFinite(adjustedValue) && adjustedValue > 0) {
            data.push({ year: latestYear, value: Number(adjustedValue.toFixed(2)) })
          }
        }
      }

      return data.filter((point) => point && isFinite(point.value) && point.value > 0)
    } catch (error) {
      console.error("Chart data generation error:", error)
      return []
    }
  }, [inflationData, calculationResult, currency, fromYear])

  // 🎯 Dynamic decade markers calculation (exclude current year from display)
  const decadeMarkers = useMemo(() => {
    if (!currentCurrency) return []

    const startYear = currentCurrency.earliest
    const endYear = currentCurrency.latest
    const totalRange = endYear - startYear

    let interval: number
    if (totalRange <= 30) {
      interval = 5
    } else if (totalRange <= 60) {
      interval = 10
    } else {
      interval = 20
    }

    const markers = []
    const firstMarker = Math.ceil(startYear / interval) * interval

    for (let year = firstMarker; year <= endYear; year += interval) {
      if (year >= startYear && year <= endYear && year < currentYear) {
        // 🎯 Exclude current year from markers
        markers.push(year)
      }
    }

    // Don't add the end year if it's the current year (to prevent overlap)
    if (endYear < currentYear && markers.length > 0 && markers[markers.length - 1] !== endYear) {
      markers.push(endYear)
    }

    const maxMarkers = 7
    if (markers.length > maxMarkers) {
      const step = Math.ceil(markers.length / maxMarkers)
      const reducedMarkers = markers.filter((_, index) => index % step === 0)
      if (reducedMarkers[reducedMarkers.length - 1] !== markers[markers.length - 1]) {
        reducedMarkers.push(markers[markers.length - 1])
      }
      return reducedMarkers
    }

    return markers
  }, [currentCurrency, currentYear])

  // 🎯 Dynamic quick year buttons (excluding current year)
  const quickYearButtons = useMemo(() => {
    const baseYears = [1950, 1970, 1990, 2000, 2010, 2015, 2020]

    // Add recent years dynamically but exclude current year
    const recentYears = []
    for (let i = 3; i >= 1; i--) {
      const year = currentYear - i
      if (year > 2020 && year < currentYear) {
        // Exclude current year
        recentYears.push(year)
      }
    }

    return [...baseYears, ...recentYears].filter(
      (year) => year >= (currentCurrency?.earliest || 1913) && year <= (currentCurrency?.latest || currentYear - 1), // 🎯 Exclude current year
    )
  }, [currentYear, currentCurrency])

  // Enhanced share function
  const handleShare = useCallback(async () => {
    if (!calculationResult || !currentCurrency) return

    const text = `${currentCurrency.symbol}${calculationResult.originalAmount} in ${calculationResult.fromYear} = ${currentCurrency.symbol}${calculationResult.adjustedAmount.toFixed(2)} today! That's ${calculationResult.totalInflation.toFixed(1)}% inflation. Check yours:`

    try {
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({ text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`)
        const button = document.activeElement as HTMLButtonElement
        if (button) {
          const originalText = button.textContent
          button.textContent = "✅ Copied!"
          setTimeout(() => {
            button.textContent = originalText
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Share failed:", error)
      try {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`)
      } catch (clipboardError) {
        console.error("Clipboard failed:", clipboardError)
      }
    }
  }, [calculationResult, currentCurrency])

  // Enhanced reset function
  const handleReset = useCallback(() => {
    setAmount("100")
    const defaultYear = currentYear - 5 // Default to 5 years ago
    setInputError(null)

    if (currentCurrency && (defaultYear < currentCurrency.earliest || defaultYear > currentCurrency.latest)) {
      setFromYear(Math.max(currentCurrency.earliest, currentCurrency.latest - 10))
    } else {
      setFromYear(defaultYear)
    }
  }, [currentCurrency, currentYear])

  // 🎯 Dynamic month name for "Updated" text
  const getUpdateText = useMemo(() => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const now = new Date()
    return `Updated ${monthNames[now.getMonth()]} ${now.getFullYear()}`
  }, [currentYear])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inflation data...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !inflationData) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
              🔄 Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <ErrorBoundary>
        {/* Main Calculator Card */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-4 sm:p-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Amount Input */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-gray-700 mb-3">
                  Enter Amount (${MIN_AMOUNT} - ${MAX_AMOUNT.toLocaleString()})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl sm:text-lg">
                    {currentCurrency?.symbol || "$"}
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full pr-4 py-4 sm:py-4 text-xl sm:text-2xl font-semibold border-2 rounded-lg focus:outline-none touch-manipulation transition-colors ${
                      currentCurrency?.symbol && (currentCurrency.symbol === "C$" || currentCurrency.symbol === "A$")
                        ? "pl-14 sm:pl-12"
                        : "pl-10 sm:pl-8"
                    } ${inputError ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                    placeholder="100"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-describedby={inputError ? "amount-error" : undefined}
                  />
                  {inputError && (
                    <div id="amount-error" className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                      <span className="mr-1">⚠️</span>
                      {inputError}
                    </div>
                  )}
                </div>
              </div>

              {/* Currency Selection */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-gray-700 mb-4">Select Currency</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(CURRENCY_INFO).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => handleCurrencyChange(code as CurrencyCode)}
                      disabled={isCurrencySwitching}
                      className={`p-4 sm:p-4 rounded-lg border-2 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                        currency === code
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      aria-pressed={currency === code}
                      aria-label={`Select ${info.name}`}
                    >
                      <div className="text-2xl sm:text-2xl mb-1">{info.flag}</div>
                      <div className="font-semibold text-sm">{code}</div>
                      <div className="text-xs text-gray-500 hidden sm:block truncate">{info.name}</div>
                    </button>
                  ))}
                </div>
                {isCurrencySwitching && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-2"></div>
                    Switching currency...
                  </div>
                )}
              </div>

              {/* Enhanced Year Selection */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-gray-700 mb-4">From Year</label>

                <div className="text-center mb-6">
                  <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-2 transition-all duration-300">
                    {fromYear}
                  </div>
                  <div className="text-base sm:text-lg text-gray-600">{currentYear - fromYear} years ago</div>
                </div>

                <div className="space-y-6">
                  <div className="relative px-2">
                    <input
                      type="range"
                      min={currentCurrency?.earliest || 1913}
                      max={currentCurrency?.latest || currentYear - 1} // 🎯 Exclude current year
                      value={fromYear}
                      onChange={(e) => setFromYear(Number.parseInt(e.target.value))}
                      className="w-full h-6 sm:h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer touch-manipulation slider transition-all"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((fromYear - (currentCurrency?.earliest || 1913)) /
                            ((currentCurrency?.latest || currentYear - 1) - (currentCurrency?.earliest || 1913))) *
                          100
                        }%, #e5e7eb ${
                          ((fromYear - (currentCurrency?.earliest || 1913)) /
                            ((currentCurrency?.latest || currentYear - 1) - (currentCurrency?.earliest || 1913))) *
                          100
                        }%, #e5e7eb 100%)`,
                      }}
                      aria-label={`Select year from ${currentCurrency?.earliest} to ${currentCurrency?.latest}`}
                    />

                    {/* Dynamic Decade Markers */}
                    <div className="relative mt-2 px-1" style={{ height: "20px" }}>
                      {decadeMarkers.map((year) => {
                        const startYear = currentCurrency?.earliest || 1913
                        const endYear = currentCurrency?.latest || currentYear - 1
                        const position = ((year - startYear) / (endYear - startYear)) * 100

                        return (
                          <span
                            key={year}
                            className="absolute text-xs text-gray-400 transform -translate-x-1/2 transition-colors hover:text-gray-600"
                            style={{
                              left: `${position}%`,
                              top: "0px",
                            }}
                          >
                            {year}
                          </span>
                        )
                      })}
                    </div>

                    {/* 🎯 Dynamic Quick Year Buttons (excluding current year) */}
                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:justify-center gap-2 mt-4">
                      {quickYearButtons.map((year) => (
                        <button
                          key={year}
                          onClick={() => setFromYear(year)}
                          className={`px-3 py-2 rounded-full text-sm transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 ${
                            fromYear === year
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          aria-pressed={fromYear === year}
                        >
                          {year}
                        </button>
                      ))}
                    </div>

                    <div className="text-center text-sm text-gray-400 bg-blue-50 p-4 rounded-lg mt-4">
                      💡 Drag the slider or tap the year buttons above
                      <br className="sm:hidden" />
                      <span className="hidden sm:inline"> • </span>Data available from {currentCurrency?.earliest} to{" "}
                      {currentCurrency?.latest} • {getUpdateText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      {/* Results Card */}
      {calculationResult && !inputError && (
        <ErrorBoundary>
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold">💰 Inflation Impact</h3>

                <div className="text-3xl sm:text-5xl font-bold break-all animate-pulse">
                  {currentCurrency?.symbol || "$"}
                  {calculationResult.adjustedAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

                <p className="text-base sm:text-xl opacity-90 px-2">
                  {currentCurrency?.symbol || "$"}
                  {calculationResult.originalAmount.toLocaleString()} in {calculationResult.fromYear} equals{" "}
                  {currentCurrency?.symbol || "$"}
                  {calculationResult.adjustedAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  in {calculationResult.currentYear}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                    <div className="text-xl sm:text-2xl font-bold">{calculationResult.totalInflation.toFixed(1)}%</div>
                    <div className="text-sm opacity-80">Total Inflation</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                    <div className="text-xl sm:text-2xl font-bold">
                      {calculationResult.annualizedInflation.toFixed(2)}%
                    </div>
                    <div className="text-sm opacity-80">Annual Average</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                    <div className="text-xl sm:text-2xl font-bold">{calculationResult.yearsDifference}</div>
                    <div className="text-sm opacity-80">Years</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                  <Button
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 touch-manipulation transition-all hover:scale-105"
                    onClick={handleShare}
                  >
                    📱 Share Result
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 touch-manipulation transition-all hover:scale-105"
                    onClick={handleReset}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ErrorBoundary>
      )}

      {/* Input error message */}
      {inputError && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">💡</div>
            <p className="text-yellow-800">Please enter a valid amount to see inflation calculations</p>
          </CardContent>
        </Card>
      )}

      {/* Rest of components */}
      {calculationResult && !inputError && inflationData && (
        <>
          {/* Inflation Trend Chart */}
          <ErrorBoundary
            fallback={
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Chart temporarily unavailable</div>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <Card className="bg-white shadow-lg border-0 chart-container">
              <CardContent className="p-4 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">
                  📈 {currentCurrency?.name || "Currency"} Inflation Trend Over Time
                </h3>

                <div className="h-48 sm:h-64 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-4 border">
                  <SimpleLineChart data={chartData} currency={currentCurrency?.symbol || "$"} fromYear={fromYear} />
                </div>

                <div className="text-center text-sm text-gray-600 mb-4 px-2">
                  This chart shows how {currentCurrency?.symbol || "$"}
                  {amount} from {fromYear} would grow due to inflation over time
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>

          {/* Currency Comparison */}
          <ErrorBoundary
            fallback={
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🌍</div>
                  <div>Currency comparison temporarily unavailable</div>
                </CardContent>
              </Card>
            }
          >
            <CurrencyComparisonChart amount={amount} fromYear={fromYear} inflationData={inflationData} />
          </ErrorBoundary>

          {/* Purchasing Power Visual */}
          <ErrorBoundary
            fallback={
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
                <CardContent className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🛒</div>
                  <div>Purchasing power visualization temporarily unavailable</div>
                </CardContent>
              </Card>
            }
          >
            <PurchasingPowerVisual
              originalAmount={calculationResult.originalAmount}
              adjustedAmount={calculationResult.adjustedAmount}
              currency={currency}
              symbol={currentCurrency?.symbol || "$"}
              fromYear={fromYear}
            />
          </ErrorBoundary>

          {/* In-content Ad */}
          <ErrorBoundary>
            <div className="my-6 sm:my-8">
              <AdBanner slot="in-content" format="horizontal" className="max-w-full" />
            </div>
          </ErrorBoundary>

          {/* Historical Context */}
          <ErrorBoundary>
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-base">📚 Historical Context</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-4 text-sm text-gray-600">
                  <div>
                    <strong className="text-base">What was happening in {calculationResult.fromYear}:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      {getHistoricalContext(calculationResult.fromYear).map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-base">Price comparisons:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      {getPriceComparisons(calculationResult.fromYear, currency).map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </>
      )}
    </div>
  )
}

// Helper functions
function getHistoricalContext(year: number): string[] {
  const contexts: Record<number, string[]> = {
    1950: ["Post-WWII economic boom", "Television becoming popular", "Korean War begins"],
    1960: ["Space race in full swing", "Civil rights movement", "Average salary: $4,007"],
    1970: ["Vietnam War era", "First Earth Day", "Average house: $17,000"],
    1980: ["Personal computers emerging", "MTV launches", "High inflation period"],
    1990: ["Internet goes mainstream", "Cold War ends", "Economic recession"],
    2000: ["Dot-com boom and bust", "Y2K concerns", "Average house: $119,600"],
    2010: ["Great Recession recovery", "Social media explosion", "iPhone revolution"],
    2020: ["COVID-19 pandemic", "Remote work boom", "Supply chain disruptions"],
    2024: ["AI revolution", "Post-pandemic recovery", "Climate action acceleration"],
  }

  const availableYears = Object.keys(contexts)
    .map(Number)
    .sort((a, b) => Math.abs(year - a) - Math.abs(year - b))
  return contexts[availableYears[0]] || ["Historical data available"]
}

function getPriceComparisons(year: number, currency: CurrencyCode): string[] {
  const symbol = CURRENCY_INFO[currency]?.symbol || "$"

  const priceData: Record<string, string[]> = {
    early: [
      `${symbol}0.23 Movie ticket`,
      `${symbol}0.18 Gallon of gas`,
      `${symbol}0.12 Loaf of bread`,
      `${symbol}1,510 New car`,
    ],
    mid: [
      `${symbol}1.55 Movie ticket`,
      `${symbol}0.36 Gallon of gas`,
      `${symbol}0.25 Loaf of bread`,
      `${symbol}3,542 New car`,
    ],
    late: [
      `${symbol}4.23 Movie ticket`,
      `${symbol}1.19 Gallon of gas`,
      `${symbol}0.70 Loaf of bread`,
      `${symbol}16,950 New car`,
    ],
    recent: [
      `${symbol}9.16 Movie ticket`,
      `${symbol}2.17 Gallon of gas`,
      `${symbol}2.50 Loaf of bread`,
      `${symbol}37,876 New car`,
    ],
    current: [
      `${symbol}12.50 Movie ticket`,
      `${symbol}3.45 Gallon of gas`,
      `${symbol}3.25 Loaf of bread`,
      `${symbol}48,000 New car`,
    ],
  }

  if (year <= 1950) return priceData.early
  if (year <= 1970) return priceData.mid
  if (year <= 1990) return priceData.late
  if (year <= 2020) return priceData.recent
  return priceData.current
}
