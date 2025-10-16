// FRED (Federal Reserve Economic Data) API client

const FRED_API_BASE = "https://api.stlouisfed.org/fred"
const FRED_API_KEY = process.env.FRED_API_KEY

export interface FREDObservation {
  realtime_start: string
  realtime_end: string
  date: string
  value: string
}

export interface FREDSeriesResponse {
  realtime_start: string
  realtime_end: string
  observation_start: string
  observation_end: string
  units: string
  output_type: number
  file_type: string
  order_by: string
  sort_order: string
  count: number
  offset: number
  limit: number
  observations: FREDObservation[]
}

/**
 * Fetch observations for a FRED series
 * @param seriesId FRED series ID (e.g., "CPIAUCSL" for CPI)
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 */
export async function fetchFREDSeries(
  seriesId: string,
  startDate?: string,
  endDate?: string,
): Promise<FREDSeriesResponse> {
  if (!FRED_API_KEY) {
    throw new Error("FRED_API_KEY environment variable is not set")
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: "json",
  })

  if (startDate) params.append("observation_start", startDate)
  if (endDate) params.append("observation_end", endDate)

  const response = await fetch(`${FRED_API_BASE}/series/observations?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`FRED API request failed: ${response.statusText}`)
  }

  const data: FREDSeriesResponse = await response.json()
  return data
}

/**
 * Fetch multiple FRED series in parallel
 */
export async function fetchMultipleFREDSeries(
  seriesIds: string[],
  startDate?: string,
  endDate?: string,
): Promise<Record<string, FREDSeriesResponse>> {
  const promises = seriesIds.map((id) => fetchFREDSeries(id, startDate, endDate))
  const results = await Promise.all(promises)

  const data: Record<string, FREDSeriesResponse> = {}
  seriesIds.forEach((id, index) => {
    data[id] = results[index]
  })

  return data
}

/**
 * Common FRED series IDs for student loan calculator
 */
export const FRED_SERIES = {
  // Inflation
  CPI_ALL_URBAN: "CPIAUCSL", // Consumer Price Index for All Urban Consumers
  PCE: "PCEPI", // Personal Consumption Expenditures Price Index
  CORE_CPI: "CPILFESL", // CPI Less Food and Energy

  // Interest Rates
  FEDERAL_FUNDS_RATE: "FEDFUNDS", // Federal Funds Effective Rate
  TREASURY_10Y: "DGS10", // 10-Year Treasury Constant Maturity Rate
  TREASURY_5Y: "DGS5", // 5-Year Treasury Rate

  // Wages and Income
  AVERAGE_HOURLY_EARNINGS: "CES0500000003", // Average Hourly Earnings
  MEDIAN_HOUSEHOLD_INCOME: "MEHOINUSA672N", // Real Median Household Income

  // Employment
  UNEMPLOYMENT_RATE: "UNRATE", // Unemployment Rate
  LABOR_FORCE_PARTICIPATION: "CIVPART", // Labor Force Participation Rate

  // Education Costs
  COLLEGE_TUITION_CPI: "CUSR0000SEEB01", // CPI for College Tuition and Fees
}

/**
 * Fetch inflation data for student loan calculations
 */
export async function fetchInflationData(
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<FREDSeriesResponse> {
  const startDate = `${startYear}-01-01`
  const endDate = `${endYear}-12-31`

  return fetchFREDSeries(FRED_SERIES.CPI_ALL_URBAN, startDate, endDate)
}

/**
 * Fetch college tuition inflation data
 */
export async function fetchTuitionInflation(
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<FREDSeriesResponse> {
  const startDate = `${startYear}-01-01`
  const endDate = `${endYear}-12-31`

  return fetchFREDSeries(FRED_SERIES.COLLEGE_TUITION_CPI, startDate, endDate)
}
