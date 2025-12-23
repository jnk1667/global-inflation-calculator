/**
 * World Bank Indicators API
 * Free API for economic indicators including PPP conversion factors
 * No API key required
 */

interface WorldBankDataPoint {
  indicator: { id: string; value: string }
  country: { id: string; value: string }
  countryiso3code: string
  date: string
  value: number | null
  unit: string
  obs_status: string
  decimal: number
}

interface WorldBankResponse {
  page: number
  pages: number
  per_page: number
  total: number
  data: WorldBankDataPoint[]
}

const BASE_URL = "https://api.worldbank.org/v2"

/**
 * Fetch PPP conversion factors for countries
 * Indicator: PA.NUS.PPP - PPP conversion factor, GDP (LCU per international $)
 */
export async function getPPPData(
  countries: string[] = ["all"],
  startYear = 1990,
  endYear = 2023,
): Promise<Map<string, Map<number, number>>> {
  const countriesParam = countries.join(";")
  const url = `${BASE_URL}/country/${countriesParam}/indicator/PA.NUS.PPP?format=json&date=${startYear}:${endYear}&per_page=10000`

  try {
    const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 1 day
    if (!response.ok) throw new Error("Failed to fetch PPP data")

    const json = await response.json()
    const data: WorldBankDataPoint[] = json[1] || []

    // Organize by country code -> year -> value
    const pppData = new Map<string, Map<number, number>>()

    data.forEach((point) => {
      if (point.value !== null) {
        if (!pppData.has(point.countryiso3code)) {
          pppData.set(point.countryiso3code, new Map())
        }
        const year = Number.parseInt(point.date)
        pppData.get(point.countryiso3code)!.set(year, point.value)
      }
    })

    return pppData
  } catch (error) {
    console.error("[v0] Error fetching PPP data:", error)
    return new Map()
  }
}

/**
 * Get list of all countries with their metadata
 */
export async function getCountries(): Promise<
  Array<{ code: string; iso3: string; name: string; region: string; incomeLevel: string }>
> {
  const url = `${BASE_URL}/country?format=json&per_page=300`

  try {
    const response = await fetch(url, { next: { revalidate: 604800 } }) // Cache for 1 week
    if (!response.ok) throw new Error("Failed to fetch countries")

    const json = await response.json()
    const data = json[1] || []

    return data
      .filter((c: any) => c.capitalCity) // Filter out aggregates
      .map((c: any) => ({
        code: c.id,
        iso3: c.iso2Code,
        name: c.name,
        region: c.region?.value || "Unknown",
        incomeLevel: c.incomeLevel?.value || "Unknown",
      }))
  } catch (error) {
    console.error("[v0] Error fetching countries:", error)
    return []
  }
}

/**
 * Calculate PPP-adjusted value between two countries
 */
export function calculatePPPAdjustment(amount: number, fromCountryPPP: number, toCountryPPP: number): number {
  // PPP formula: Amount * (ToPPP / FromPPP)
  return amount * (toCountryPPP / fromCountryPPP)
}

/**
 * Get PPP for a specific country and year
 */
export async function getCountryPPP(countryCode: string, year: number): Promise<number | null> {
  const url = `${BASE_URL}/country/${countryCode}/indicator/PA.NUS.PPP?format=json&date=${year}`

  try {
    const response = await fetch(url, { next: { revalidate: 86400 } })
    if (!response.ok) return null

    const json = await response.json()
    const data: WorldBankDataPoint[] = json[1] || []

    return data[0]?.value || null
  } catch (error) {
    console.error(`[v0] Error fetching PPP for ${countryCode}:`, error)
    return null
  }
}
