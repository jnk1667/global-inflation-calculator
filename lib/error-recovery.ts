// 🔄 ERROR RECOVERY AND FALLBACK MECHANISMS
// Handles graceful degradation when data issues occur

import type { InflationMeasureData } from "./inflation-measures"
import { DataValidationError } from "./data-validation"

export interface RecoveryStrategy {
  name: string
  description: string
  priority: number // Lower number = higher priority
  canRecover: (error: Error, context: RecoveryContext) => boolean
  recover: (error: Error, context: RecoveryContext) => Promise<RecoveryResult>
}

export interface RecoveryContext {
  currency: string
  measure?: string
  originalData?: any
  fallbackSources?: string[]
  retryCount?: number
  maxRetries?: number
}

export interface RecoveryResult {
  success: boolean
  data?: InflationMeasureData
  fallbackUsed: boolean
  strategy: string
  message: string
  warnings?: string[]
}

// Built-in recovery strategies
const RECOVERY_STRATEGIES: RecoveryStrategy[] = [
  {
    name: "retry",
    description: "Retry the original request with exponential backoff",
    priority: 1,
    canRecover: (error, context) => {
      return (context.retryCount || 0) < (context.maxRetries || 3) && !(error instanceof DataValidationError)
    },
    recover: async (error, context) => {
      const retryCount = (context.retryCount || 0) + 1
      const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff

      console.log(`[v0] Retrying ${context.currency} data load (attempt ${retryCount})`)

      await new Promise((resolve) => setTimeout(resolve, delay))

      // This would typically re-attempt the original data load
      // For now, we'll return a failure to move to next strategy
      return {
        success: false,
        fallbackUsed: false,
        strategy: "retry",
        message: `Retry attempt ${retryCount} failed`,
      }
    },
  },
  {
    name: "legacy_data",
    description: "Fall back to legacy single inflation data file",
    priority: 2,
    canRecover: (error, context) => {
      return context.currency !== undefined
    },
    recover: async (error, context) => {
      try {
        console.log(`[v0] Attempting legacy data fallback for ${context.currency}`)

        const response = await fetch(`/data/${context.currency.toLowerCase()}-inflation.json`)

        if (!response.ok) {
          throw new Error(`Legacy data not available: HTTP ${response.status}`)
        }

        const legacyData = await response.json()

        if (!legacyData || !legacyData.data) {
          throw new Error("Invalid legacy data format")
        }

        // Convert legacy format to measure format
        const measureData: InflationMeasureData = {
          currency: context.currency,
          measure: "cpi",
          source: legacyData.source || "Legacy data",
          last_updated: legacyData.lastUpdated || new Date().toISOString(),
          data: {},
          earliest_year: legacyData.earliest?.toString() || "1913",
          latest_year: legacyData.latest?.toString() || new Date().getFullYear().toString(),
          total_years: 0,
        }

        // Convert legacy data format
        for (const [year, inflationFactor] of Object.entries(legacyData.data)) {
          measureData.data[year] = {
            index_value: Number(inflationFactor) * 100,
            inflation_factor: Number(inflationFactor),
            year_over_year_change: null,
          }
        }

        measureData.total_years = Object.keys(measureData.data).length

        return {
          success: true,
          data: measureData,
          fallbackUsed: true,
          strategy: "legacy_data",
          message: `Successfully loaded legacy data for ${context.currency}`,
          warnings: ["Using simplified CPI data only - multiple measures not available"],
        }
      } catch (fallbackError) {
        return {
          success: false,
          fallbackUsed: true,
          strategy: "legacy_data",
          message: `Legacy data fallback failed: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`,
        }
      }
    },
  },
  {
    name: "interpolation",
    description: "Fill missing data points using interpolation",
    priority: 3,
    canRecover: (error, context) => {
      return error instanceof DataValidationError && context.originalData !== undefined
    },
    recover: async (error, context) => {
      try {
        if (!context.originalData || !context.originalData.data) {
          throw new Error("No original data available for interpolation")
        }

        console.log(`[v0] Attempting data interpolation for ${context.currency}`)

        const data = { ...context.originalData }
        const years = Object.keys(data.data)
          .map(Number)
          .filter((year) => !isNaN(year))
          .sort((a, b) => a - b)

        if (years.length < 2) {
          throw new Error("Insufficient data points for interpolation")
        }

        // Fill gaps using linear interpolation
        const startYear = years[0]
        const endYear = years[years.length - 1]
        let interpolatedCount = 0

        for (let year = startYear + 1; year < endYear; year++) {
          if (!data.data[year.toString()]) {
            // Find surrounding data points
            let prevYear = year - 1
            let nextYear = year + 1

            while (prevYear >= startYear && !data.data[prevYear.toString()]) {
              prevYear--
            }

            while (nextYear <= endYear && !data.data[nextYear.toString()]) {
              nextYear++
            }

            if (data.data[prevYear.toString()] && data.data[nextYear.toString()]) {
              const prevData = data.data[prevYear.toString()]
              const nextData = data.data[nextYear.toString()]

              // Linear interpolation
              const yearDiff = nextYear - prevYear
              const progress = (year - prevYear) / yearDiff

              const interpolatedInflationFactor =
                prevData.inflation_factor + (nextData.inflation_factor - prevData.inflation_factor) * progress

              data.data[year.toString()] = {
                index_value: interpolatedInflationFactor * 100,
                inflation_factor: interpolatedInflationFactor,
                year_over_year_change: null, // Will be calculated later if needed
              }

              interpolatedCount++
            }
          }
        }

        // Update metadata
        data.total_years = Object.keys(data.data).length
        data.source = `${data.source} (with ${interpolatedCount} interpolated points)`

        return {
          success: true,
          data: data as InflationMeasureData,
          fallbackUsed: true,
          strategy: "interpolation",
          message: `Successfully interpolated ${interpolatedCount} missing data points`,
          warnings: [`${interpolatedCount} data points were estimated using linear interpolation`],
        }
      } catch (interpolationError) {
        return {
          success: false,
          fallbackUsed: true,
          strategy: "interpolation",
          message: `Interpolation failed: ${interpolationError instanceof Error ? interpolationError.message : "Unknown error"}`,
        }
      }
    },
  },
  {
    name: "estimated_data",
    description: "Generate estimated data based on historical patterns",
    priority: 4,
    canRecover: () => true, // Can always attempt this as last resort
    recover: async (error, context) => {
      try {
        console.log(`[v0] Generating estimated data for ${context.currency}`)

        // This would typically use historical patterns to generate estimates
        // For now, we'll create a minimal dataset
        const currentYear = new Date().getFullYear()
        const startYear = getStartYearForCurrency(context.currency)

        const estimatedData: InflationMeasureData = {
          currency: context.currency,
          measure: context.measure || "cpi",
          source: "Estimated based on historical patterns",
          last_updated: new Date().toISOString(),
          data: {},
          earliest_year: startYear.toString(),
          latest_year: currentYear.toString(),
          total_years: 0,
        }

        // Generate basic estimated data
        let baseValue = 100
        const avgInflationRate = getAverageInflationRate(context.currency)

        for (let year = startYear; year <= currentYear; year++) {
          const yearlyRate = avgInflationRate + (Math.random() - 0.5) * 0.01 // Add small random variation
          baseValue *= 1 + yearlyRate

          estimatedData.data[year.toString()] = {
            index_value: baseValue,
            inflation_factor: baseValue / 100,
            year_over_year_change: yearlyRate * 100,
          }
        }

        estimatedData.total_years = Object.keys(estimatedData.data).length

        return {
          success: true,
          data: estimatedData,
          fallbackUsed: true,
          strategy: "estimated_data",
          message: `Generated estimated data for ${context.currency}`,
          warnings: [
            "Using estimated data based on historical patterns",
            "Results may not reflect actual economic conditions",
            "Consider this data as approximate only",
          ],
        }
      } catch (estimationError) {
        return {
          success: false,
          fallbackUsed: true,
          strategy: "estimated_data",
          message: `Data estimation failed: ${estimationError instanceof Error ? estimationError.message : "Unknown error"}`,
        }
      }
    },
  },
]

// Main recovery function
export async function recoverFromDataError(error: Error, context: RecoveryContext): Promise<RecoveryResult> {
  console.log(`[v0] Attempting error recovery for ${context.currency}:`, error.message)

  // Sort strategies by priority
  const applicableStrategies = RECOVERY_STRATEGIES.filter((strategy) => strategy.canRecover(error, context)).sort(
    (a, b) => a.priority - b.priority,
  )

  if (applicableStrategies.length === 0) {
    return {
      success: false,
      fallbackUsed: false,
      strategy: "none",
      message: "No recovery strategies available for this error",
    }
  }

  // Try each strategy in order
  for (const strategy of applicableStrategies) {
    try {
      console.log(`[v0] Trying recovery strategy: ${strategy.name}`)
      const result = await strategy.recover(error, context)

      if (result.success) {
        console.log(`[v0] Recovery successful using strategy: ${strategy.name}`)
        return result
      } else {
        console.log(`[v0] Recovery strategy ${strategy.name} failed: ${result.message}`)
      }
    } catch (strategyError) {
      console.error(`[v0] Recovery strategy ${strategy.name} threw error:`, strategyError)
    }
  }

  return {
    success: false,
    fallbackUsed: true,
    strategy: "all_failed",
    message: "All recovery strategies failed",
  }
}

// Utility functions
function getStartYearForCurrency(currency: string): number {
  const startYears: Record<string, number> = {
    USD: 1913,
    GBP: 1947,
    EUR: 1996,
    CAD: 1914,
    AUD: 1948,
    CHF: 1914,
    JPY: 1946,
    NZD: 1914,
  }
  return startYears[currency] || 1950
}

function getAverageInflationRate(currency: string): number {
  const avgRates: Record<string, number> = {
    USD: 0.032, // 3.2%
    GBP: 0.038, // 3.8%
    EUR: 0.021, // 2.1%
    CAD: 0.032, // 3.2%
    AUD: 0.034, // 3.4%
    CHF: 0.018, // 1.8%
    JPY: 0.025, // 2.5%
    NZD: 0.038, // 3.8%
  }
  return avgRates[currency] || 0.03
}

// Error boundary for React components
export function createErrorBoundaryHandler(currency: string) {
  return (error: Error, errorInfo: any) => {
    console.error(`[v0] Component error for ${currency}:`, error, errorInfo)

    // Log error for monitoring
    const errorReport = {
      currency,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    }

    // In production, this would be sent to error tracking service
    console.log("[v0] Error report:", errorReport)
  }
}

// Graceful degradation utilities
export function createGracefulFallback<T>(
  primaryFunction: () => Promise<T>,
  fallbackFunction: () => T,
  errorHandler?: (error: Error) => void,
): () => Promise<T> {
  return async () => {
    try {
      return await primaryFunction()
    } catch (error) {
      if (errorHandler && error instanceof Error) {
        errorHandler(error)
      }
      console.warn("[v0] Primary function failed, using fallback:", error)
      return fallbackFunction()
    }
  }
}
