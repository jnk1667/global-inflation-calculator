// 🔄 DATA LOADER UTILITY
// Handles loading and caching of inflation data with fallbacks

import { type InflationMeasureData, loadAllMeasuresForCurrency, validateMeasureData } from "./inflation-measures"

interface CachedData {
  data: Record<string, InflationMeasureData>
  timestamp: number
  currency: string
}

// Cache for 5 minutes to avoid repeated API calls
const CACHE_DURATION = 5 * 60 * 1000
const dataCache = new Map<string, CachedData>()

export async function loadCurrencyMeasuresWithFallback(currency: string): Promise<{
  measures: Record<string, InflationMeasureData>
  hasRealData: boolean
  fallbackUsed: boolean
}> {
  // Check cache first
  const cacheKey = currency
  const cached = dataCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      measures: cached.data,
      hasRealData: hasRealDataSources(cached.data),
      fallbackUsed: false,
    }
  }

  try {
    // Try to load real measure data
    console.log(`[v0] Loading inflation measures for ${currency}...`)
    const measures = await loadAllMeasuresForCurrency(currency)

    // Validate loaded data
    const validMeasures: Record<string, InflationMeasureData> = {}
    let validCount = 0

    for (const [measureName, measureData] of Object.entries(measures)) {
      if (validateMeasureData(measureData)) {
        validMeasures[measureName] = measureData
        validCount++
      } else {
        console.warn(`[v0] Invalid data for ${currency} ${measureName}, skipping`)
      }
    }

    if (validCount > 0) {
      // Cache the valid data
      dataCache.set(cacheKey, {
        data: validMeasures,
        timestamp: Date.now(),
        currency,
      })

      console.log(`[v0] Successfully loaded ${validCount} measures for ${currency}`)

      return {
        measures: validMeasures,
        hasRealData: hasRealDataSources(validMeasures),
        fallbackUsed: false,
      }
    } else {
      throw new Error(`No valid measures found for ${currency}`)
    }
  } catch (error) {
    console.warn(`[v0] Failed to load measure data for ${currency}, using fallback:`, error)

    // Fallback to legacy single inflation data
    try {
      const fallbackMeasures = await loadLegacyInflationData(currency)

      // Cache the fallback data
      dataCache.set(cacheKey, {
        data: fallbackMeasures,
        timestamp: Date.now(),
        currency,
      })

      return {
        measures: fallbackMeasures,
        hasRealData: false,
        fallbackUsed: true,
      }
    } catch (fallbackError) {
      console.error(`[v0] Fallback also failed for ${currency}:`, fallbackError)
      return {
        measures: {},
        hasRealData: false,
        fallbackUsed: true,
      }
    }
  }
}

async function loadLegacyInflationData(currency: string): Promise<Record<string, InflationMeasureData>> {
  // Load the legacy single inflation file as fallback
  const response = await fetch(`/data/${currency.toLowerCase()}-inflation.json`)

  if (!response.ok) {
    throw new Error(`Failed to load legacy data for ${currency}: ${response.status}`)
  }

  const legacyData = await response.json()

  if (!legacyData || !legacyData.data) {
    throw new Error(`Invalid legacy data structure for ${currency}`)
  }

  // Convert legacy format to measure format
  const measureData: InflationMeasureData = {
    currency: currency,
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
    const factor = Number(inflationFactor)
    if (isNaN(factor) || factor <= 0) {
      console.warn(`[v0] Invalid inflation factor for ${currency} ${year}: ${inflationFactor}`)
      continue
    }

    measureData.data[year] = {
      index_value: factor * 100, // Convert to index
      inflation_factor: factor,
      year_over_year_change: null, // Will calculate if needed
    }
  }

  measureData.total_years = Object.keys(measureData.data).length

  // Return as single CPI measure
  return {
    cpi: measureData,
  }
}

function hasRealDataSources(measures: Record<string, InflationMeasureData>): boolean {
  return Object.values(measures).some(
    (measure) =>
      measure.source.includes("FRED") ||
      measure.source.includes("ONS") ||
      measure.source.includes("Real data") ||
      measure.source.includes("Eurostat") ||
      measure.source.includes("Statistics Canada") ||
      measure.source.includes("Australian Bureau of Statistics") ||
      measure.source.includes("Bank of Japan") ||
      measure.source.includes("Statistics Bureau of Japan") ||
      measure.source.includes("Swiss Federal Statistical Office") ||
      measure.source.includes("Stats NZ") ||
      measure.source.includes("Reserve Bank") ||
      measure.source.includes("Federal Reserve") ||
      measure.source.includes("ECB") ||
      measure.source.includes("US Bureau of Labor Statistics") || // Added US Bureau of Labor Statistics for USD recognition
      measure.source.includes("Official data"),
  )
}

// Clear cache function for manual refresh
export function clearDataCache(): void {
  dataCache.clear()
  console.log("[v0] Data cache cleared")
}

// Get cache status for debugging
export function getCacheStatus(): Array<{
  currency: string
  timestamp: number
  age: number
  measureCount: number
}> {
  const status: Array<{
    currency: string
    timestamp: number
    age: number
    measureCount: number
  }> = []

  for (const [currency, cached] of dataCache.entries()) {
    status.push({
      currency,
      timestamp: cached.timestamp,
      age: Date.now() - cached.timestamp,
      measureCount: Object.keys(cached.data).length,
    })
  }

  return status
}
