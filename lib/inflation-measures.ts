// 📊 INFLATION MEASURES DATA LOADER
// Loads real inflation data for all measures across all currencies

export interface InflationMeasureData {
  currency: string
  measure: string
  source: string
  last_updated: string
  data: {
    [year: string]: {
      index_value: number
      inflation_factor: number
      year_over_year_change: number | null
    }
  }
  earliest_year: string
  latest_year: string
  total_years: number
}

export interface MeasureWeights {
  cpi: number
  core_cpi: number
  chained_cpi?: number
  pce?: number
  core_pce?: number
  ppi: number
  gdp_deflator: number
  [key: string]: number | undefined
}

// 🎯 MEASURE WEIGHTS FOR CONSENSUS CALCULATION
// Based on central bank preferences and economic importance
export const MEASURE_WEIGHTS: Record<string, MeasureWeights> = {
  USD: {
    cpi: 0.25, // Standard CPI
    core_cpi: 0.2, // Core CPI (excluding food & energy)
    chained_cpi: 0.15, // Chained CPI (accounts for substitution)
    pce: 0.15, // Personal Consumption Expenditures
    core_pce: 0.1, // Core PCE (Fed's preferred measure)
    ppi: 0.1, // Producer Price Index
    gdp_deflator: 0.05, // GDP Deflator
  },
  GBP: {
    cpi: 0.3, // UK CPI (primary measure)
    core_cpi: 0.25, // Core CPI
    cpih: 0.2, // CPI including housing (ONS preferred)
    rpi: 0.1, // Retail Price Index (legacy)
    ppi_output: 0.1, // Producer prices
    gdp_deflator: 0.05, // GDP Deflator
  },
  EUR: {
    hicp: 0.35, // Harmonized Index (ECB target)
    core_hicp: 0.25, // Core HICP
    services_hicp: 0.15, // Services component
    goods_hicp: 0.1, // Goods component
    ppi: 0.1, // Producer prices
    gdp_deflator: 0.05, // GDP Deflator
  },
  CAD: {
    cpi: 0.3, // Consumer Price Index
    core_cpi: 0.2, // Core CPI
    cpi_trim: 0.2, // CPI-trim (Bank of Canada preferred)
    cpi_median: 0.15, // CPI-median
    ippi: 0.1, // Industrial Product Price Index
    gdp_deflator: 0.05, // GDP Deflator
  },
  CHF: {
    cpi: 0.4, // Consumer Price Index (SNB target)
    core_cpi: 0.25, // Core CPI
    ppi: 0.2, // Producer and Import Price Index
    gdp_deflator: 0.1, // GDP Deflator
    housing_index: 0.05, // Housing prices
  },
  JPY: {
    cpi: 0.3, // Consumer Price Index
    core_cpi: 0.25, // CPI excluding fresh food (BOJ target)
    core_core_cpi: 0.2, // CPI excluding food and energy
    cgpi: 0.15, // Corporate Goods Price Index
    gdp_deflator: 0.1, // GDP Deflator
  },
  AUD: {
    cpi: 0.3, // Consumer Price Index
    trimmed_mean_cpi: 0.25, // Trimmed Mean (RBA preferred)
    weighted_median_cpi: 0.2, // Weighted Median
    core_cpi: 0.15, // Core CPI
    ppi: 0.05, // Producer prices
    gdp_deflator: 0.05, // GDP Deflator
  },
  NZD: {
    cpi: 0.35, // Consumer Price Index
    core_cpi: 0.25, // Core CPI
    non_tradables_cpi: 0.2, // Non-tradables (RBNZ focus)
    tradables_cpi: 0.1, // Tradables
    ppi: 0.05, // Producer prices
    gdp_deflator: 0.05, // GDP Deflator
  },
}

// 📁 DATA LOADING FUNCTIONS
export async function loadInflationMeasure(currency: string, measure: string): Promise<InflationMeasureData | null> {
  try {
    const response = await fetch(
      `/data/measures/${currency.toLowerCase()}-${measure.toLowerCase().replace(/\s+/g, "_")}.json`,
    )

    if (!response.ok) {
      console.warn(`Failed to load ${currency} ${measure} data: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error loading ${currency} ${measure} data:`, error)
    return null
  }
}

export async function loadAllMeasuresForCurrency(currency: string): Promise<Record<string, InflationMeasureData>> {
  const weights = MEASURE_WEIGHTS[currency]
  if (!weights) {
    throw new Error(`No measure weights defined for currency: ${currency}`)
  }

  const measures: Record<string, InflationMeasureData> = {}
  const measureNames = Object.keys(weights)

  // Load all measures in parallel
  const loadPromises = measureNames.map(async (measure) => {
    const data = await loadInflationMeasure(currency, measure)
    if (data) {
      measures[measure] = data
    }
    return { measure, data }
  })

  await Promise.all(loadPromises)

  return measures
}

// Helper function to get the latest available year from measure data
export function getLatestAvailableYear(measureData: InflationMeasureData, requestedYear: number): number {
  // First check if the requested year exists
  if (measureData.data[requestedYear.toString()]) {
    return requestedYear
  }

  // Fall back to the latest_year from metadata
  const latestFromMetadata = Number.parseInt(measureData.latest_year, 10)
  if (!isNaN(latestFromMetadata) && measureData.data[latestFromMetadata.toString()]) {
    return latestFromMetadata
  }

  // Last resort: find the highest year in the data
  const years = Object.keys(measureData.data)
    .map((y) => Number.parseInt(y, 10))
    .filter((y) => !isNaN(y))
  if (years.length > 0) {
    return Math.max(...years)
  }

  return requestedYear // Return original if nothing found
}

// Helper to get earliest available year
export function getEarliestAvailableYear(measureData: InflationMeasureData, requestedYear: number): number {
  // First check if the requested year exists
  if (measureData.data[requestedYear.toString()]) {
    return requestedYear
  }

  // Fall back to the earliest_year from metadata
  const earliestFromMetadata = Number.parseInt(measureData.earliest_year, 10)
  if (!isNaN(earliestFromMetadata) && measureData.data[earliestFromMetadata.toString()]) {
    return Math.max(earliestFromMetadata, requestedYear) // Don't go earlier than requested
  }

  // Last resort: find the lowest year in the data that's >= requestedYear
  const years = Object.keys(measureData.data)
    .map((y) => Number.parseInt(y, 10))
    .filter((y) => !isNaN(y) && y >= requestedYear)
  if (years.length > 0) {
    return Math.min(...years)
  }

  return requestedYear
}

// 🧮 CALCULATION FUNCTIONS
export function calculateInflationForMeasure(
  measureData: InflationMeasureData,
  fromYear: number,
  toYear: number,
  amount: number,
): {
  adjustedAmount: number
  totalInflation: number
  annualAverage: number
  actualFromYear: number
  actualToYear: number
} {
  // Get the actual years we can use (fall back if requested years don't have data)
  const actualFromYear = getEarliestAvailableYear(measureData, fromYear)
  const actualToYear = getLatestAvailableYear(measureData, toYear)

  const fromData = measureData.data[actualFromYear.toString()]
  const toData = measureData.data[actualToYear.toString()]

  if (!fromData || !toData) {
    throw new Error(
      `Data not available for ${measureData.currency} ${measureData.measure} from ${fromYear} to ${toYear}. ` +
        `Available range: ${measureData.earliest_year} to ${measureData.latest_year}`,
    )
  }

  const fromInflationFactor = fromData.inflation_factor
  const toInflationFactor = toData.inflation_factor

  const adjustedAmount = (amount * toInflationFactor) / fromInflationFactor
  const totalInflation = ((adjustedAmount - amount) / amount) * 100
  const years = actualToYear - actualFromYear
  const annualAverage = years > 0 ? Math.pow(adjustedAmount / amount, 1 / years) - 1 : 0

  return {
    adjustedAmount: Number(adjustedAmount.toFixed(2)),
    totalInflation: Number(totalInflation.toFixed(2)),
    annualAverage: Number((annualAverage * 100).toFixed(2)),
    actualFromYear,
    actualToYear,
  }
}

export function calculateConsensusInflation(
  measures: Record<string, InflationMeasureData>,
  currency: string,
  fromYear: number,
  toYear: number,
  amount: number,
): {
  consensusAdjustedAmount: number
  consensusTotalInflation: number
  consensusAnnualAverage: number
  actualFromYear: number
  actualToYear: number
  individualMeasures: Array<{
    measure: string
    adjustedAmount: number
    totalInflation: number
    weight: number
    confidence: string
  }>
} {
  const weights = MEASURE_WEIGHTS[currency]
  if (!weights) {
    throw new Error(`No measure weights defined for currency: ${currency}`)
  }

  const individualMeasures: Array<{
    measure: string
    adjustedAmount: number
    totalInflation: number
    weight: number
    confidence: string
  }> = []

  let weightedAdjustedAmount = 0
  let weightedTotalInflation = 0
  let totalWeight = 0
  let actualFromYear = fromYear
  let actualToYear = toYear

  // Calculate for each available measure
  for (const [measureName, measureData] of Object.entries(measures)) {
    const weight = weights[measureName]
    if (!weight || weight === 0) continue

    try {
      const result = calculateInflationForMeasure(measureData, fromYear, toYear, amount)

      // Track actual years used (use the first successful calculation as reference)
      if (totalWeight === 0) {
        actualFromYear = result.actualFromYear
        actualToYear = result.actualToYear
      }

      // Determine confidence level based on data source
      let confidence = "Medium"
      if (measureData.source.includes("FRED") || measureData.source.includes("ONS")) {
        confidence = "High"
      } else if (measureData.source.includes("estimated")) {
        confidence = "Medium"
      }

      individualMeasures.push({
        measure: measureName,
        adjustedAmount: result.adjustedAmount,
        totalInflation: result.totalInflation,
        weight: weight,
        confidence: confidence,
      })

      // Add to weighted calculation
      weightedAdjustedAmount += result.adjustedAmount * weight
      weightedTotalInflation += result.totalInflation * weight
      totalWeight += weight
    } catch (error) {
      console.warn(`Failed to calculate ${currency} ${measureName}:`, error)
    }
  }

  // Normalize weights if some measures failed to load
  if (totalWeight > 0 && totalWeight !== 1) {
    weightedAdjustedAmount /= totalWeight
    weightedTotalInflation /= totalWeight

    // Adjust individual weights to sum to 1
    individualMeasures.forEach((measure) => {
      measure.weight = measure.weight / totalWeight
    })
  }

  const years = actualToYear - actualFromYear
  const consensusAnnualAverage = years > 0 ? Math.pow(weightedAdjustedAmount / amount, 1 / years) - 1 : 0

  return {
    consensusAdjustedAmount: Number(weightedAdjustedAmount.toFixed(2)),
    consensusTotalInflation: Number(weightedTotalInflation.toFixed(2)),
    consensusAnnualAverage: Number((consensusAnnualAverage * 100).toFixed(2)),
    actualFromYear,
    actualToYear,
    individualMeasures: individualMeasures.sort((a, b) => b.weight - a.weight), // Sort by weight descending
  }
}

// 🔍 UTILITY FUNCTIONS
export function getMeasureDisplayName(measure: string): string {
  const displayNames: Record<string, string> = {
    cpi: "Consumer Price Index (CPI)",
    core_cpi: "Core CPI",
    chained_cpi: "Chained CPI",
    pce: "Personal Consumption Expenditures (PCE)",
    core_pce: "Core PCE",
    ppi: "Producer Price Index (PPI)",
    gdp_deflator: "GDP Deflator",
    trimmed_mean_cpi: "Trimmed Mean CPI",
    hicp: "Harmonized Index of Consumer Prices",
    core_hicp: "Core HICP",
    cpih: "CPI including Housing (CPIH)",
    rpi: "Retail Price Index (RPI)",
    ppi_input: "PPI Input Prices",
    ppi_output: "PPI Output Prices",
    cpi_trim: "CPI-trim",
    cpi_median: "CPI-median",
    ippi: "Industrial Product Price Index",
    rmpi: "Raw Materials Price Index",
    cgpi: "Corporate Goods Price Index",
    sppi: "Services Producer Price Index",
    core_core_cpi: "Core-Core CPI",
    weighted_median_cpi: "Weighted Median CPI",
    tradables_cpi: "CPI Tradables",
    non_tradables_cpi: "CPI Non-tradables",
    services_hicp: "HICP Services",
    goods_hicp: "HICP Goods",
    housing_index: "Housing Price Index",
  }

  return displayNames[measure] || measure.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function getMeasureDescription(measure: string): string {
  const descriptions: Record<string, string> = {
    cpi: "Standard measure of inflation for consumer goods and services",
    core_cpi: "CPI excluding volatile food and energy prices",
    chained_cpi: "Accounts for consumer substitution behavior",
    pce: "Federal Reserve's preferred inflation measure",
    core_pce: "PCE excluding food and energy, closely watched by Fed",
    ppi: "Measures wholesale price changes",
    gdp_deflator: "Measures price changes across the entire economy, including government and investment",
    trimmed_mean_cpi: "Excludes extreme price movements for a more stable measure",
    hicp: "Harmonized measure used across EU countries",
    core_hicp: "HICP excluding energy and unprocessed food",
    cpih: "UK's preferred measure including owner-occupiers' housing costs",
    rpi: "Traditional UK measure, still used for some purposes",
    cpi_trim: "Bank of Canada's preferred core measure",
    cpi_median: "Median of price changes across CPI components",
    cgpi: "Japan's broad measure of producer prices",
    weighted_median_cpi: "RBA's preferred underlying inflation measure",
    tradables_cpi: "Prices of goods that can be traded internationally",
    non_tradables_cpi: "Prices of domestic services and non-traded goods",
  }

  return descriptions[measure] || "Inflation measure"
}

// 📊 DATA VALIDATION
export function validateMeasureData(data: InflationMeasureData): boolean {
  if (!data.currency || !data.measure || !data.data) {
    return false
  }

  // Check if we have reasonable data coverage
  const years = Object.keys(data.data)
  if (years.length < 10) {
    return false
  }

  // Check for valid inflation factors
  for (const yearData of Object.values(data.data)) {
    if (yearData.inflation_factor <= 0 || isNaN(yearData.inflation_factor)) {
      return false
    }
  }

  return true
}

export function getDataQualityScore(measures: Record<string, InflationMeasureData>): {
  score: number
  details: {
    totalMeasures: number
    realDataMeasures: number
    estimatedMeasures: number
    averageYearsCoverage: number
  }
} {
  const totalMeasures = Object.keys(measures).length
  let realDataMeasures = 0
  let estimatedMeasures = 0
  let totalYearsCoverage = 0

  for (const measureData of Object.values(measures)) {
    const isRealData =
      measureData.source.includes("FRED") ||
      measureData.source.includes("ONS") ||
      measureData.source.includes("US Bureau of Labor Statistics") ||
      measureData.source.includes("Bureau of Labor Statistics") ||
      measureData.source.includes("BLS") ||
      measureData.source.includes("Eurostat") ||
      measureData.source.includes("Statistics Canada") ||
      measureData.source.includes("Australian Bureau of Statistics") ||
      measureData.source.includes("ABS") ||
      measureData.source.includes("Bank of Japan") ||
      measureData.source.includes("Statistics Bureau of Japan") ||
      measureData.source.includes("Swiss Federal Statistical Office") ||
      measureData.source.includes("Stats NZ") ||
      measureData.source.includes("Statistics New Zealand") ||
      measureData.source.includes("Reserve Bank") ||
      measureData.source.includes("Federal Reserve") ||
      measureData.source.includes("ECB") ||
      measureData.source.includes("European Central Bank") ||
      measureData.source.includes("Official data") ||
      measureData.source.includes("official data")

    if (isRealData) {
      realDataMeasures++
    } else {
      estimatedMeasures++
    }
    totalYearsCoverage += measureData.total_years
  }

  const averageYearsCoverage = totalMeasures > 0 ? totalYearsCoverage / totalMeasures : 0

  // Calculate quality score (0-100)
  const realDataRatio = totalMeasures > 0 ? realDataMeasures / totalMeasures : 0
  const coverageScore = Math.min(averageYearsCoverage / 50, 1) // 50+ years = full score
  const score = Math.round((realDataRatio * 0.7 + coverageScore * 0.3) * 100)

  return {
    score,
    details: {
      totalMeasures,
      realDataMeasures,
      estimatedMeasures,
      averageYearsCoverage: Math.round(averageYearsCoverage),
    },
  }
}

// 📈 MEASURE SPREAD ANALYSIS
export function calculateMeasureSpread(
  individualMeasures: Array<{
    measure: string
    adjustedAmount: number
    totalInflation: number
    weight: number
    confidence: string
  }>,
): {
  spreadPercentage: number
  standardDeviation: number
  range: {
    min: number
    max: number
    difference: number
  }
  agreementLevel: "High" | "Medium" | "Low"
  description: string
} {
  if (individualMeasures.length === 0) {
    return {
      spreadPercentage: 0,
      standardDeviation: 0,
      range: { min: 0, max: 0, difference: 0 },
      agreementLevel: "High",
      description: "No measures available",
    }
  }

  if (individualMeasures.length === 1) {
    return {
      spreadPercentage: 0,
      standardDeviation: 0,
      range: {
        min: individualMeasures[0].totalInflation,
        max: individualMeasures[0].totalInflation,
        difference: 0,
      },
      agreementLevel: "High",
      description: "Only one measure available",
    }
  }

  // Calculate mean inflation
  const inflationValues = individualMeasures.map((m) => m.totalInflation)
  const mean = inflationValues.reduce((sum, val) => sum + val, 0) / inflationValues.length

  // Calculate standard deviation
  const squaredDiffs = inflationValues.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / inflationValues.length
  const standardDeviation = Math.sqrt(variance)

  // Calculate range
  const min = Math.min(...inflationValues)
  const max = Math.max(...inflationValues)
  const difference = max - min

  // Calculate spread percentage (coefficient of variation)
  const spreadPercentage = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0

  // Determine agreement level
  let agreementLevel: "High" | "Medium" | "Low"
  let description: string

  if (spreadPercentage < 5) {
    agreementLevel = "High"
    description = "All measures closely agree - high confidence in results"
  } else if (spreadPercentage < 15) {
    agreementLevel = "Medium"
    description = "Measures show moderate variation - typical for multi-measure analysis"
  } else {
    agreementLevel = "Low"
    description = "Significant disagreement between measures - results should be interpreted with caution"
  }

  return {
    spreadPercentage: Number(spreadPercentage.toFixed(2)),
    standardDeviation: Number(standardDeviation.toFixed(2)),
    range: {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      difference: Number(difference.toFixed(2)),
    },
    agreementLevel,
    description,
  }
}
