// OECD SDMX-JSON API client
// Free, no API key required. Covers 38 OECD member countries.
// Docs: https://data.oecd.org/api/sdmx-json-documentation/

const OECD_API_BASE = "https://stats.oecd.org/SDMX-JSON/data"

// ─── Country codes for the 8 currencies supported by this site ───────────────
export const OECD_SUPPORTED_COUNTRIES = {
  USA: { name: "United States", currency: "USD", flag: "🇺🇸" },
  GBR: { name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  DEU: { name: "Germany", currency: "EUR", flag: "🇩🇪" },
  JPN: { name: "Japan", currency: "JPY", flag: "🇯🇵" },
  CAN: { name: "Canada", currency: "CAD", flag: "🇨🇦" },
  AUS: { name: "Australia", currency: "AUD", flag: "🇦🇺" },
  CHE: { name: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  FRA: { name: "France", currency: "EUR", flag: "🇫🇷" },
} as const

export type OECDCountryCode = keyof typeof OECD_SUPPORTED_COUNTRIES

// ─── OECD Dataset identifiers relevant to this site ──────────────────────────
export const OECD_DATASETS = {
  // Consumer Price Index — main inflation measure
  CPI: "CPI",
  // PPP (Purchasing Power Parities) for GDP
  PPP_GDP: "PPPGDP",
  // PPP conversion rates for private consumption
  PPP_CONSUMPTION: "CPL",
  // Real GDP growth
  GDP_GROWTH: "QNA",
  // Unemployment rate
  UNEMPLOYMENT: "MEI_LABOUR",
  // Long-term interest rates (10-year government bonds)
  INTEREST_RATES: "MEI_FIN",
  // Wages and salaries — labour compensation
  WAGES: "AV_AN_WAGE",
} as const

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OECDObservation {
  value: number | null
  status?: string
}

export interface OECDSeriesData {
  country: string
  countryName: string
  currency: string
  observations: Record<string, OECDObservation> // key = year/period string
}

export interface OECDDataResult {
  dataset: string
  countries: OECDCountryCode[]
  startPeriod: string
  endPeriod: string
  series: OECDSeriesData[]
  fetchedAt: string
}

// ─── Raw SDMX-JSON response types ─────────────────────────────────────────────
interface SDMXDimensionValue {
  id: string
  name: string
}

interface SDMXDimension {
  id: string
  name: string
  values: SDMXDimensionValue[]
  keyPosition?: number
}

interface SDMXStructure {
  dimensions: {
    observation?: SDMXDimension[]
    series?: SDMXDimension[]
    dataset?: SDMXDimension[]
  }
}

interface SDMXSeries {
  attributes: number[]
  observations: Record<string, (number | null)[]>
}

interface SDMXDataSet {
  action?: string
  series?: Record<string, SDMXSeries>
  observations?: Record<string, (number | null)[]>
}

interface SDMXResponse {
  header?: { id: string; prepared: string }
  structure?: SDMXStructure
  dataSets?: SDMXDataSet[]
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

/**
 * Low-level OECD SDMX-JSON fetch.
 * Caches for 24 hours (OECD data updates annually for most indicators).
 */
async function fetchOECDRaw(
  dataset: string,
  filterExpression: string,
  options: {
    startTime?: string
    endTime?: string
    detail?: "full" | "dataonly" | "serieskeysonly" | "nodata"
  } = {},
): Promise<SDMXResponse> {
  const { startTime, endTime, detail = "dataonly" } = options

  const params = new URLSearchParams({ detail })
  if (startTime) params.set("startTime", startTime)
  if (endTime) params.set("endTime", endTime)

  const url = `${OECD_API_BASE}/${dataset}/${filterExpression}/all?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.sdmx.data+json, application/json",
    },
    next: { revalidate: 86400 }, // Cache 24 hours
  })

  if (!response.ok) {
    throw new Error(
      `OECD API error ${response.status} for dataset "${dataset}": ${response.statusText}`,
    )
  }

  return response.json()
}

// ─── SDMX-JSON parser ─────────────────────────────────────────────────────────

/**
 * Parses SDMX-JSON response into a usable flat structure.
 * Extracts country codes and time-keyed observation values.
 */
function parseSDMXResponse(
  raw: SDMXResponse,
  dataset: string,
  requestedCountries: OECDCountryCode[],
): OECDSeriesData[] {
  const results: OECDSeriesData[] = []

  if (!raw.dataSets?.length || !raw.structure) return results

  const dataSet = raw.dataSets[0]
  const seriesDimensions = raw.structure.dimensions?.series ?? []
  const obsDimensions = raw.structure.dimensions?.observation ?? []

  // Find the Location dimension to map index → country code
  const locationDim = seriesDimensions.find(
    (d) => d.id === "LOCATION" || d.id === "COU" || d.id === "COUNTRY",
  )
  // Find the Time dimension for observation keys
  const timeDim = obsDimensions.find(
    (d) => d.id === "TIME_PERIOD" || d.id === "TIME" || d.id === "Year",
  )

  if (!locationDim || !dataSet.series) return results

  for (const [seriesKey, seriesData] of Object.entries(dataSet.series)) {
    // Series key format: "0:0:0:0" — each segment is index into dimension values
    const keyParts = seriesKey.split(":")
    const locationIndex = locationDim.keyPosition ?? 0
    const countryCode = locationDim.values[Number(keyParts[locationIndex])]?.id as OECDCountryCode

    if (!countryCode || !OECD_SUPPORTED_COUNTRIES[countryCode]) continue

    const countryInfo = OECD_SUPPORTED_COUNTRIES[countryCode]
    const observations: Record<string, OECDObservation> = {}

    // Map observation index → time period label → value
    if (seriesData.observations && timeDim) {
      for (const [obsKey, obsValues] of Object.entries(seriesData.observations)) {
        const timeIndex = Number(obsKey)
        const timePeriod = timeDim.values[timeIndex]?.id ?? obsKey
        observations[timePeriod] = {
          value: obsValues[0] ?? null,
          status: obsValues[1] != null ? String(obsValues[1]) : undefined,
        }
      }
    }

    results.push({
      country: countryCode,
      countryName: countryInfo.name,
      currency: countryInfo.currency,
      observations,
    })
  }

  return results
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * Fetch Consumer Price Index (CPI / inflation) data from OECD.
 * Returns annual CPI index values for supported countries.
 *
 * @param countries   Array of OECD country codes (defaults to all 8 supported)
 * @param startYear   First year of data (default: 2000)
 * @param endYear     Last year of data (default: current year)
 */
export async function fetchOECDInflation(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<OECDDataResult> {
  const countryFilter = countries.join("+")
  // CPI01 = Food, CPI02 = All items (total CPI). We use CPI_TOT for headline.
  // Dataset: CPI, Subject: CPI_TOT (total), Measure: IXOB (index), Frequency: A (annual)
  const filter = `${countryFilter}.CPI_TOT.IXOB.A`

  const raw = await fetchOECDRaw(OECD_DATASETS.CPI, filter, {
    startTime: String(startYear),
    endTime: String(endYear),
  })

  const series = parseSDMXResponse(raw, OECD_DATASETS.CPI, countries)

  return {
    dataset: OECD_DATASETS.CPI,
    countries,
    startPeriod: String(startYear),
    endPeriod: String(endYear),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch PPP (Purchasing Power Parities) conversion rates from OECD.
 * Returns annual PPP values relative to USD.
 *
 * @param countries   Array of OECD country codes (defaults to all 8 supported)
 * @param startYear   First year of data (default: 2000)
 * @param endYear     Last year of data (default: current year)
 */
export async function fetchOECDPPP(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<OECDDataResult> {
  const countryFilter = countries.join("+")
  // PPPGDP dataset: PP1 = PPP for GDP, A = Annual
  const filter = `${countryFilter}.PP1.A`

  const raw = await fetchOECDRaw(OECD_DATASETS.PPP_GDP, filter, {
    startTime: String(startYear),
    endTime: String(endYear),
  })

  const series = parseSDMXResponse(raw, OECD_DATASETS.PPP_GDP, countries)

  return {
    dataset: OECD_DATASETS.PPP_GDP,
    countries,
    startPeriod: String(startYear),
    endPeriod: String(endYear),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch average annual wages from OECD.
 * Returns wage data in USD (constant prices for cross-country comparison).
 *
 * @param countries   Array of OECD country codes (defaults to all 8 supported)
 * @param startYear   First year of data (default: 2000)
 * @param endYear     Last year of data (default: current year)
 */
export async function fetchOECDWages(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<OECDDataResult> {
  const countryFilter = countries.join("+")
  // AV_AN_WAGE: Average annual wages, USD constant prices, AVUSDPPP = USD PPP adjusted
  const filter = `${countryFilter}.AVUSDPPP`

  const raw = await fetchOECDRaw(OECD_DATASETS.WAGES, filter, {
    startTime: String(startYear),
    endTime: String(endYear),
  })

  const series = parseSDMXResponse(raw, OECD_DATASETS.WAGES, countries)

  return {
    dataset: OECD_DATASETS.WAGES,
    countries,
    startPeriod: String(startYear),
    endPeriod: String(endYear),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch unemployment rates from OECD.
 *
 * @param countries   Array of OECD country codes (defaults to all 8 supported)
 * @param startYear   First year of data (default: 2000)
 * @param endYear     Last year of data (default: current year)
 */
export async function fetchOECDUnemployment(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<OECDDataResult> {
  const countryFilter = countries.join("+")
  // LRHUTTTT: Harmonised unemployment rate, total, annual
  const filter = `${countryFilter}.LRHUTTTT.ST.A`

  const raw = await fetchOECDRaw(OECD_DATASETS.UNEMPLOYMENT, filter, {
    startTime: String(startYear),
    endTime: String(endYear),
  })

  const series = parseSDMXResponse(raw, OECD_DATASETS.UNEMPLOYMENT, countries)

  return {
    dataset: OECD_DATASETS.UNEMPLOYMENT,
    countries,
    startPeriod: String(startYear),
    endPeriod: String(endYear),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Convenience: fetch all four key datasets in one call.
 * Returns CPI, PPP, Wages, and Unemployment for all 8 supported countries.
 * Useful for dashboard-level data population.
 */
export async function fetchAllOECDIndicators(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2010,
  endYear: number = new Date().getFullYear(),
): Promise<{
  cpi: OECDDataResult
  ppp: OECDDataResult
  wages: OECDDataResult
  unemployment: OECDDataResult
}> {
  const [cpi, ppp, wages, unemployment] = await Promise.all([
    fetchOECDInflation(countries, startYear, endYear),
    fetchOECDPPP(countries, startYear, endYear),
    fetchOECDWages(countries, startYear, endYear),
    fetchOECDUnemployment(countries, startYear, endYear),
  ])

  return { cpi, ppp, wages, unemployment }
}

/**
 * Extract a simple year → value map from an OECDSeriesData observation set.
 * Useful for charting or direct lookup.
 */
export function extractTimeSeries(series: OECDSeriesData): Record<string, number | null> {
  const result: Record<string, number | null> = {}
  for (const [period, obs] of Object.entries(series.observations)) {
    result[period] = obs.value
  }
  return result
}

/**
 * Get the most recent value for a given series.
 */
export function getLatestValue(series: OECDSeriesData): {
  period: string
  value: number | null
} | null {
  const periods = Object.keys(series.observations).sort()
  if (!periods.length) return null
  const latest = periods[periods.length - 1]
  return { period: latest, value: series.observations[latest].value }
}
