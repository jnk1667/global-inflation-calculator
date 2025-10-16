// BLS (Bureau of Labor Statistics) API client for salary and wage data

const BLS_API_BASE = "https://api.bls.gov/publicAPI/v2"
const BLS_API_KEY = process.env.BLS_API_KEY

export interface BLSSeriesData {
  seriesID: string
  data: {
    year: string
    period: string
    periodName: string
    value: string
    footnotes: any[]
  }[]
}

export interface BLSApiResponse {
  status: string
  responseTime: number
  message: string[]
  Results: {
    series: BLSSeriesData[]
  }
}

/**
 * Fetch data from BLS API for specific series IDs
 * @param seriesIds Array of BLS series IDs (max 50)
 * @param startYear Starting year (YYYY)
 * @param endYear Ending year (YYYY)
 */
export async function fetchBLSData(seriesIds: string[], startYear: number, endYear: number): Promise<BLSApiResponse> {
  if (!BLS_API_KEY) {
    throw new Error("BLS_API_KEY environment variable is not set")
  }

  if (seriesIds.length > 50) {
    throw new Error("BLS API allows maximum 50 series per request")
  }

  const requestBody = {
    seriesid: seriesIds,
    startyear: startYear.toString(),
    endyear: endYear.toString(),
    registrationkey: BLS_API_KEY,
  }

  const response = await fetch(`${BLS_API_BASE}/timeseries/data/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`BLS API request failed: ${response.statusText}`)
  }

  const data: BLSApiResponse = await response.json()

  if (data.status !== "REQUEST_SUCCEEDED") {
    throw new Error(`BLS API error: ${data.message.join(", ")}`)
  }

  return data
}

/**
 * Fetch occupational employment and wage statistics
 * Series ID format: OEUN000000{SOC_CODE}03 for annual mean wage
 * Example: OEUN000000000000003 for all occupations
 */
export async function fetchOccupationalWages(
  socCodes: string[],
  startYear = 2020,
  endYear: number = new Date().getFullYear(),
): Promise<BLSSeriesData[]> {
  // Convert SOC codes to BLS series IDs for annual mean wage
  const seriesIds = socCodes.map((code) => `OEUN000000${code}03`)

  const data = await fetchBLSData(seriesIds, startYear, endYear)
  return data.Results.series
}

/**
 * Common SOC (Standard Occupational Classification) codes for various professions
 */
export const COMMON_SOC_CODES = {
  ALL_OCCUPATIONS: "000000",
  COMPUTER_PROGRAMMERS: "151251",
  SOFTWARE_DEVELOPERS: "151252",
  REGISTERED_NURSES: "291141",
  ELEMENTARY_TEACHERS: "252021",
  SECONDARY_TEACHERS: "252031",
  ACCOUNTANTS: "132011",
  LAWYERS: "231011",
  PHYSICIANS: "291228",
  MECHANICAL_ENGINEERS: "172141",
  CIVIL_ENGINEERS: "172051",
  MARKETING_MANAGERS: "112021",
  FINANCIAL_ANALYSTS: "132051",
  GRAPHIC_DESIGNERS: "271024",
  SOCIAL_WORKERS: "211022",
  PSYCHOLOGISTS: "193039",
  PHARMACISTS: "291051",
  DENTISTS: "291021",
  ARCHITECTS: "171011",
  ELECTRICIANS: "472111",
}

/**
 * Fetch average wage growth rate by education level
 */
export async function fetchWageGrowthRates(): Promise<any> {
  // BLS series for employment cost index by education level
  const seriesIds = [
    "CIU2010000000000I", // All workers
    "CIU2020000000000I", // Management, professional
    "CIU2030000000000I", // Service occupations
  ]

  const currentYear = new Date().getFullYear()
  const data = await fetchBLSData(seriesIds, currentYear - 10, currentYear)

  return data.Results.series
}
