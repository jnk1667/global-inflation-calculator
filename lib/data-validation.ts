export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number // 0-100 quality score
  details: {
    dataPoints: number
    yearsCovered: number
    missingYears: number[]
    outliers: Array<{ year: string; value: number; reason: string }>
    gaps: Array<{ start: string; end: string; length: number }>
  }
}

export interface DataHealthReport {
  currency: string
  measures: Record<string, ValidationResult>
  overallScore: number
  criticalIssues: string[]
  recommendations: string[]
  lastValidated: string
}

// Validation thresholds and constants
const VALIDATION_THRESHOLDS = {
  MIN_DATA_POINTS: 10,
  MIN_YEARS_COVERAGE: 5,\
  MAX_YEAR_OVER_YEAR_CHANGE: 50w I\'ll add comprehensive data validation and error handling to ensure the system is robust and provides clear feedback when issues occur:
\
<CodeProject id="global-inflation-calculator" taskNameActive="Adding data validation and error handling" taskNameComplete="Added data validation and error handling">

\`\`\`ts file="lib/data-validation.ts"
// 🔍 DATA VALIDATION AND ERROR HANDLING
// Comprehensive validation for inflation data integrity and quality

import type { InflationMeasureData } from "./inflation-measures"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number // 0-100 quality score
  details: {
    dataPoints: number
    yearsCovered: number
    missingYears: number[]
    outliers: Array<{ year: string; value: number; reason: string }>
    gaps: Array<{ start: string; end: string; length: number }>
  }
}

export interface DataHealthReport {
  currency: string
  measures: Record<string, ValidationResult>
  overallScore: number
  criticalIssues: string[]
  recommendations: string[]
  lastValidated: string
}

// Validation thresholds and constants
const VALIDATION_THRESHOLDS = {
  MIN_DATA_POINTS: 10,
  MIN_YEARS_COVERAGE: 5,
  MAX_YEAR_OVER_YEAR_CHANGE: 50, // 50% annual inflation is extreme
  MIN_YEAR_OVER_YEAR_CHANGE: -20, // -20% deflation is extreme
  MAX_INFLATION_FACTOR: 1000, // 100,000% cumulative inflation
  MIN_INFLATION_FACTOR: 0.01, // 99% deflation
  MAX_CONSECUTIVE_GAPS: 5,
  OUTLIER_THRESHOLD: 3, // Standard deviations
}

export function validateInflationMeasure(data: InflationMeasureData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const details = {
    dataPoints: 0,
    yearsCovered: 0,
    missingYears: [] as number[],
    outliers: [] as Array<{ year: string; value: number; reason: string }>,
    gaps: [] as Array<{ start: string; end: string; length: number }>,
  }

  try {
    // Basic structure validation
    if (!data || typeof data !== "object") {
      errors.push("Invalid data structure: data must be an object")
      return createValidationResult(false, errors, warnings, 0, details)
    }

    if (!data.currency || !data.measure || !data.data) {
      errors.push("Missing required fields: currency, measure, or data")
      return createValidationResult(false, errors, warnings, 0, details)
    }

    // Data points validation
    const years = Object.keys(data.data).filter((year) => !isNaN(Number(year)))
    details.dataPoints = years.length
    details.yearsCovered = years.length

    if (years.length < VALIDATION_THRESHOLDS.MIN_DATA_POINTS) {
      errors.push(`Insufficient data points: ${years.length} (minimum: ${VALIDATION_THRESHOLDS.MIN_DATA_POINTS})`)
    }

    if (years.length === 0) {
      errors.push("No valid year data found")
      return createValidationResult(false, errors, warnings, 0, details)
    }

    // Sort years for sequential analysis
    const sortedYears = years.map(Number).sort((a, b) => a - b)
    const startYear = sortedYears[0]
    const endYear = sortedYears[sortedYears.length - 1]
    const expectedYears = endYear - startYear + 1

    if (expectedYears - years.length > VALIDATION_THRESHOLDS.MAX_CONSECUTIVE_GAPS) {
      warnings.push(`Large data gaps detected: ${expectedYears - years.length} missing years`)
    }

    // Find missing years and gaps
    const missingYears: number[] = []
    const gaps: Array<{ start: string; end: string; length: number }> = []
    let gapStart: number | null = null

    for (let year = startYear; year <= endYear; year++) {
      if (!years.includes(year.toString())) {
        missingYears.push(year)
        if (gapStart === null) {
          gapStart = year
        }
      } else if (gapStart !== null) {
        gaps.push({
          start: gapStart.toString(),
          end: (year - 1).toString(),
          length: year - gapStart,
        })
        gapStart = null
      }
    }

    // Close final gap if it extends to the end
    if (gapStart !== null) {
      gaps.push({
        start: gapStart.toString(),
        end: endYear.toString(),
        length: endYear - gapStart + 1,
      })
    }

    details.missingYears = missingYears
    details.gaps = gaps

    // Validate individual data points
    const inflationFactors: number[] = []
    const yearOverYearChanges: number[] = []

    for (const year of sortedYears) {
      const yearData = data.data[year.toString()]

      if (!yearData || typeof yearData !== "object") {
        errors.push(`Invalid data structure for year ${year}`)
        continue
      }

      // Validate inflation factor
      if (typeof yearData.inflation_factor !== "number" || isNaN(yearData.inflation_factor)) {
        errors.push(`Invalid inflation factor for year ${year}: ${yearData.inflation_factor}`)
        continue
      }

      const inflationFactor = yearData.inflation_factor

      if (inflationFactor <= 0) {
        errors.push(`Non-positive inflation factor for year ${year}: ${inflationFactor}`)
        continue
      }

      if (inflationFactor > VALIDATION_THRESHOLDS.MAX_INFLATION_FACTOR) {
        warnings.push(`Extremely high inflation factor for year ${year}: ${inflationFactor}`)
        details.outliers.push({
          year: year.toString(),
          value: inflationFactor,
          reason: "Extremely high inflation factor",
        })
      }

      if (inflationFactor < VALIDATION_THRESHOLDS.MIN_INFLATION_FACTOR) {
        warnings.push(`Extremely low inflation factor for year ${year}: ${inflationFactor}`)
        details.outliers.push({
          year: year.toString(),
          value: inflationFactor,
          reason: "Extremely low inflation factor",
        })
      }

      inflationFactors.push(inflationFactor)

      // Validate year-over-year change if available
      if (typeof yearData.year_over_year_change === "number" && !isNaN(yearData.year_over_year_change)) {
        const yoyChange = yearData.year_over_year_change

        if (yoyChange > VALIDATION_THRESHOLDS.MAX_YEAR_OVER_YEAR_CHANGE) {
          warnings.push(`Extreme inflation for year ${year}: ${yoyChange}%`)
          details.outliers.push({
            year: year.toString(),
            value: yoyChange,
            reason: "Extreme annual inflation",
          })
        }

        if (yoyChange < VALIDATION_THRESHOLDS.MIN_YEAR_OVER_YEAR_CHANGE) {
          warnings.push(`Extreme deflation for year ${year}: ${yoyChange}%`)
          details.outliers.push({
            year: year.toString(),
            value: yoyChange,
            reason: "Extreme annual deflation",
          })
        }

        yearOverYearChanges.push(yoyChange)
      }
    }

    // Statistical outlier detection using z-score
    if (yearOverYearChanges.length > 3) {
      const mean = yearOverYearChanges.reduce((sum, val) => sum + val, 0) / yearOverYearChanges.length
      const variance =
        yearOverYearChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / yearOverYearChanges.length
      const stdDev = Math.sqrt(variance)

      if (stdDev > 0) {
        sortedYears.forEach((year) => {
          const yearData = data.data[year.toString()]
          if (yearData?.year_over_year_change != null) {
            const zScore = Math.abs((yearData.year_over_year_change - mean) / stdDev)
            if (zScore > VALIDATION_THRESHOLDS.OUTLIER_THRESHOLD) {
              details.outliers.push({
                year: year.toString(),
                value: yearData.year_over_year_change,
                reason: `Statistical outlier (z-score: ${zScore.toFixed(2)})`,
              })
            }
          }
        })
      }
    }

    // Data source validation
    if (!data.source || data.source.trim().length === 0) {
      warnings.push("Missing data source information")
    }

    if (!data.last_updated) {
      warnings.push("Missing last updated timestamp")
    } else {
      const lastUpdated = new Date(data.last_updated)
      const now = new Date()
      const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceUpdate > 90) {
        warnings.push(`Data may be stale: last updated ${Math.floor(daysSinceUpdate)} days ago`)
      }
    }

    // Calculate quality score
    let score = 100

    // Deduct for errors (major issues)
    score -= errors.length * 20

    // Deduct for warnings (minor issues)
    score -= warnings.length * 5

    // Deduct for missing data
    const completeness = years.length / expectedYears
    score -= (1 - completeness) * 30

    // Deduct for outliers
    score -= details.outliers.length * 2

    // Bonus for good coverage
    if (years.length >= 50) score += 5
    if (years.length >= 100) score += 5

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    const isValid = errors.length === 0 && score >= 50

    return createValidationResult(isValid, errors, warnings, score, details)
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`)
    return createValidationResult(false, errors, warnings, 0, details)
  }
}

function createValidationResult(
  isValid: boolean,
  errors: string[],
  warnings: string[],
  score: number,
  details: ValidationResult["details"],
): ValidationResult {
  return {
    isValid,
    errors,
    warnings,
    score,
    details,
  }
}

export function validateCurrencyMeasures(
  currency: string,
  measures: Record<string, InflationMeasureData>,
): DataHealthReport {
  const measureValidations: Record<string, ValidationResult> = {}
  const criticalIssues: string[] = []
  const recommendations: string[] = []

  let totalScore = 0
  let validMeasures = 0

  // Validate each measure
  for (const [measureName, measureData] of Object.entries(measures)) {
    try {
      const validation = validateInflationMeasure(measureData)
      measureValidations[measureName] = validation

      if (validation.isValid) {
        validMeasures++
        totalScore += validation.score
      } else {
        criticalIssues.push(`${measureName}: ${validation.errors.join(", ")}`)
      }

      // Add specific recommendations based on validation results
      if (validation.details.missingYears.length > 10) {
        recommendations.push(`${measureName}: Consider interpolating missing years or finding alternative data source`)
      }

      if (validation.details.outliers.length > 5) {
        recommendations.push(`${measureName}: Review outlier data points for accuracy`)
      }

      if (validation.score < 70) {
        recommendations.push(`${measureName}: Data quality below acceptable threshold, needs attention`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown validation error"
      criticalIssues.push(`${measureName}: Validation failed - ${errorMessage}`)
      measureValidations[measureName] = createValidationResult(false, [errorMessage], [], 0, {
        dataPoints: 0,
        yearsCovered: 0,
        missingYears: [],
        outliers: [],
        gaps: [],
      })
    }
  }

  // Calculate overall score
  const overallScore = validMeasures > 0 ? Math.round(totalScore / validMeasures) : 0

  // Add general recommendations
  if (validMeasures === 0) {
    criticalIssues.push("No valid measures found for currency")
    recommendations.push("Check data sources and collection processes")
  } else if (validMeasures < Object.keys(measures).length / 2) {
    recommendations.push("More than half of measures have issues - review data collection process")
  }

  if (overallScore < 80) {
    recommendations.push("Overall data quality needs improvement")
  }

  return {
    currency,
    measures: measureValidations,
    overallScore,
    criticalIssues,
    recommendations,
    lastValidated: new Date().toISOString(),
  }
}

// Error handling utilities
export class DataValidationError extends Error {
  constructor(
    message: string,
    public currency: string,
    public measure: string,
    public validationResult: ValidationResult,
  ) {
    super(message)
    this.name = "DataValidationError"
  }
}

export class DataLoadError extends Error {
  constructor(
    message: string,
    public currency: string,
    public source: string,
    public originalError?: Error,
  ) {
    super(message)
    this.name = "DataLoadError"
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

// Utility functions for error handling
export function handleDataError(error: unknown, context: string): string {
  console.error(`[v0] Data error in ${context}:`, error)

  if (error instanceof DataValidationError) {
    return `Data validation failed for ${error.currency} ${error.measure}: ${error.message}`
  }

  if (error instanceof DataLoadError) {
    return `Failed to load data for ${error.currency} from ${error.source}: ${error.message}`
  }

  if (error instanceof Error) {
    return `${context}: ${error.message}`
  }

  return `Unknown error in ${context}`
}

export function createErrorReport(
  currency: string,
  errors: Array<{ measure: string; error: string; timestamp: string }>,
): string {
  const report = [
    `Data Error Report for ${currency}`,
    `Generated: ${new Date().toISOString()}`,
    `Total Errors: ${errors.length}`,
    "",
    "Errors:",
  ]

  errors.forEach((error, index) => {
    report.push(`${index + 1}. ${error.measure}: ${error.error} (${error.timestamp})`)
  })

  return report.join("\n")
}

// Data quality monitoring
export function monitorDataQuality(healthReports: Record<string, DataHealthReport>): {
  overallHealth: "excellent" | "good" | "fair" | "poor"
  alerts: string[]
  summary: {
    totalCurrencies: number
    healthyCurrencies: number
    criticalIssues: number
    averageScore: number
  }
} {
  const alerts: string[] = []
  let totalScore = 0
  let healthyCurrencies = 0
  let criticalIssues = 0

  for (const [currency, report] of Object.entries(healthReports)) {
    totalScore += report.overallScore
    criticalIssues += report.criticalIssues.length

    if (report.overallScore >= 80) {
      healthyCurrencies++
    } else if (report.overallScore < 50) {
      alerts.push(`Critical: ${currency} data quality is poor (score: ${report.overallScore})`)
    } else if (report.overallScore < 70) {
      alerts.push(`Warning: ${currency} data quality needs attention (score: ${report.overallScore})`)
    }

    // Check for specific issues
    if (report.criticalIssues.length > 0) {
      alerts.push(`${currency}: ${report.criticalIssues.length} critical issues detected`)
    }
  }

  const totalCurrencies = Object.keys(healthReports).length
  const averageScore = totalCurrencies > 0 ? Math.round(totalScore / totalCurrencies) : 0

  let overallHealth: "excellent" | "good" | "fair" | "poor"
  if (averageScore >= 90) overallHealth = "excellent"
  else if (averageScore >= 80) overallHealth = "good"
  else if (averageScore >= 60) overallHealth = "fair"
  else overallHealth = "poor"

  return {
    overallHealth,
    alerts,
    summary: {
      totalCurrencies,
      healthyCurrencies,
      criticalIssues,
      averageScore,
    },
  }
}
