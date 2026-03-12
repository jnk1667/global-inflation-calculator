// IMF Data API client
// Free, no API key required. Uses the IMF JSON RESTful Web Service.
// Docs: https://datahelp.imf.org/knowledgebase/articles/667681-json-restful-web-service
// Base URL: https://www.imf.org/external/datamapper/api/v1/

const IMF_API_BASE = "https://www.imf.org/external/datamapper/api/v1"

// ─── Country codes for the 8 currencies supported by this site ───────────────
// IMF uses ISO 2-letter codes for most endpoints
export const IMF_SUPPORTED_COUNTRIES = {
  USA: { name: "United States", currency: "USD", flag: "🇺🇸" },
  GBR: { name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  DEU: { name: "Germany", currency: "EUR", flag: "🇩🇪" },
  JPN: { name: "Japan", currency: "JPY", flag: "🇯🇵" },
  CAN: { name: "Canada", currency: "CAD", flag: "🇨🇦" },
  AUS: { name: "Australia", currency: "AUD", flag: "🇦🇺" },
  CHE: { name: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  FRA: { name: "France", currency: "EUR", flag: "🇫🇷" },
} as const

export type IMFCountryCode = keyof typeof IMF_SUPPORTED_COUNTRIES

// ─── IMF indicator identifiers (World Economic Outlook) ───────────────────────
// Full list: https://www.imf.org/external/datamapper/api/v1/indicators
export const IMF_INDICATORS = {
  // Inflation (end of period CPI, % change)
  INFLATION_END: "PCPIEPCH",
  // Inflation (average consumer prices, % change) — most commonly cited
  INFLATION_AVG: "PCPIPCH",
  // GDP growth (constant prices, % change)
  GDP_GROWTH: "NGDP_RPCH",
  // GDP per capita (current prices, USD)
  GDP_PER_CAPITA: "NGDPDPC",
  // GDP per capita PPP-adjusted (USD)
  GDP_PER_CAPITA_PPP: "PPPPC",
  // Unemployment rate (% of total labor force)
  UNEMPLOYMENT: "LUR",
  // Current account balance (% of GDP)
  CURRENT_ACCOUNT: "BCA_NGDPD",
  // General government gross debt (% of GDP)
  GOVT_DEBT: "GGXWDG_NGDP",
  // General government net lending/borrowing (% of GDP)
  GOVT_BALANCE: "GGXCNL_NGDP",
  // PPP conversion rate (LCU per international dollar)
  PPP_RATE: "PPPEX",
  // Implied PPP conversion rate
  PPP_IMPLIED: "PPPSH",
  // Real effective exchange rate
  REER: "EREER_IX",
} as const

export type IMFIndicatorCode = (typeof IMF_INDICATORS)[keyof typeof IMF_INDICATORS]

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IMFObservation {
  value: number | null
}

export interface IMFSeriesData {
  country: string
  countryName: string
  currency: string
  indicator: string
  observations: Record<string, IMFObservation> // key = year string e.g. "2023"
}

export interface IMFDataResult {
  indicator: string
  indicatorLabel: string
  countries: IMFCountryCode[]
  series: IMFSeriesData[]
  fetchedAt: string
}

// ─── Raw IMF API response types ───────────────────────────────────────────────
interface IMFCountryValues {
  [year: string]: number | null
}

interface IMFIndicatorResponse {
  label?: string
  description?: string
  source?: string
  unit?: string
  dataset?: string
  countries?: {
    [countryCode: string]: IMFCountryValues
  }
}

interface IMFRawResponse {
  values?: {
    [indicator: string]: {
      [countryCode: string]: IMFCountryValues
    }
  }
  [indicator: string]: unknown
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

/**
 * Fetch a single indicator for given countries from the IMF DataMapper API.
 * Caches for 24 hours — WEO data is updated biannually (April & October).
 */
async function fetchIMFRaw(
  indicator: string,
  countries: IMFCountryCode[],
): Promise<IMFRawResponse> {
  const countryList = countries.join("/")
  const url = `${IMF_API_BASE}/${indicator}/${countryList}`

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      // IMF's Akamai CDN returns 403 for requests with no User-Agent (server-side Node.js).
      // A browser User-Agent is required for the datamapper API to respond.
      "User-Agent":
        "Mozilla/5.0 (compatible; GlobalInflationCalculator/1.0; +https://www.globalinflationcalculator.com)",
    },
    next: { revalidate: 86400 }, // Cache 24 hours — WEO updates biannually
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `IMF API ${response.status} for indicator "${indicator}": ${body.slice(0, 200)}`,
    )
  }

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      `IMF API returned non-JSON for indicator "${indicator}": ${text.slice(0, 200)}`,
    )
  }
}

/**
 * Fetch indicator metadata (label, description, unit, dataset).
 */
async function fetchIMFIndicatorMeta(indicator: string): Promise<IMFIndicatorResponse> {
  const url = `${IMF_API_BASE}/indicators/${indicator}`

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (compatible; GlobalInflationCalculator/1.0; +https://www.globalinflationcalculator.com)",
    },
    next: { revalidate: 604800 }, // Metadata: cache 7 days
  })

  if (!response.ok) return {}
  const json = await response.json()
  return (json?.indicators?.[indicator] ?? {}) as IMFIndicatorResponse
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseIMFResponse(
  raw: IMFRawResponse,
  indicator: string,
  countries: IMFCountryCode[],
  label: string,
): IMFSeriesData[] {
  const results: IMFSeriesData[] = []

  // IMF DataMapper response shape:
  // { "values": { "PCPIPCH": { "USA": { "2020": 1.23, "2021": 4.7, ... }, "GBR": {...} } } }
  const valuesMap =
    (raw.values?.[indicator] as Record<string, IMFCountryValues> | undefined) ?? {}

  for (const countryCode of countries) {
    const countryInfo = IMF_SUPPORTED_COUNTRIES[countryCode]
    if (!countryInfo) continue

    const rawValues = valuesMap[countryCode] ?? {}
    const observations: Record<string, IMFObservation> = {}

    for (const [year, value] of Object.entries(rawValues)) {
      observations[year] = { value: value !== null && !isNaN(Number(value)) ? Number(value) : null }
    }

    results.push({
      country: countryCode,
      countryName: countryInfo.name,
      currency: countryInfo.currency,
      indicator,
      observations,
    })
  }

  return results
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * Fetch average consumer price inflation (% change, annual) from IMF WEO.
 * This is the headline inflation figure used in most economic comparisons.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFInflation(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.INFLATION_AVG
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "Inflation, average consumer prices (% change)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch GDP per capita (current USD) from IMF WEO.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFGDPPerCapita(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.GDP_PER_CAPITA
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "GDP per capita, current prices (USD)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch GDP per capita (PPP-adjusted, international dollars) from IMF WEO.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFGDPPerCapitaPPP(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.GDP_PER_CAPITA_PPP
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "GDP per capita, PPP (international dollars)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch real GDP growth rate (% change, constant prices) from IMF WEO.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFGDPGrowth(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.GDP_GROWTH
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "Real GDP growth (% change)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch unemployment rate (% of labor force) from IMF WEO.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFUnemployment(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.UNEMPLOYMENT
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "Unemployment rate (% of labor force)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch government gross debt (% of GDP) from IMF WEO.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFGovtDebt(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.GOVT_DEBT
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "General government gross debt (% of GDP)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch PPP conversion rate (LCU per international dollar) from IMF WEO.
 *
 * @param countries   IMF country codes (defaults to all 8 supported)
 */
export async function fetchIMFPPPRate(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<IMFDataResult> {
  const indicator = IMF_INDICATORS.PPP_RATE
  const [raw, meta] = await Promise.all([
    fetchIMFRaw(indicator, countries),
    fetchIMFIndicatorMeta(indicator),
  ])

  return {
    indicator,
    indicatorLabel: meta.label ?? "PPP conversion rate (LCU per international dollar)",
    countries,
    series: parseIMFResponse(raw, indicator, countries, meta.label ?? ""),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Convenience: fetch all key IMF indicators in one call.
 * Returns inflation, GDP growth, GDP per capita (nominal + PPP),
 * unemployment, government debt, and PPP rate.
 *
 * All requests fire in parallel for performance.
 */
export async function fetchAllIMFIndicators(
  countries: IMFCountryCode[] = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[],
): Promise<{
  inflation: IMFDataResult
  gdpGrowth: IMFDataResult
  gdpPerCapita: IMFDataResult
  gdpPerCapitaPPP: IMFDataResult
  unemployment: IMFDataResult
  govtDebt: IMFDataResult
  pppRate: IMFDataResult
}> {
  const [inflation, gdpGrowth, gdpPerCapita, gdpPerCapitaPPP, unemployment, govtDebt, pppRate] =
    await Promise.all([
      fetchIMFInflation(countries),
      fetchIMFGDPGrowth(countries),
      fetchIMFGDPPerCapita(countries),
      fetchIMFGDPPerCapitaPPP(countries),
      fetchIMFUnemployment(countries),
      fetchIMFGovtDebt(countries),
      fetchIMFPPPRate(countries),
    ])

  return { inflation, gdpGrowth, gdpPerCapita, gdpPerCapitaPPP, unemployment, govtDebt, pppRate }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * Extract a simple year → value map from an IMFSeriesData observation set.
 * Useful for charting or direct lookup.
 */
export function extractIMFTimeSeries(series: IMFSeriesData): Record<string, number | null> {
  const result: Record<string, number | null> = {}
  for (const [year, obs] of Object.entries(series.observations)) {
    result[year] = obs.value
  }
  return result
}

/**
 * Get the most recent non-null value from an IMF series.
 */
export function getIMFLatestValue(series: IMFSeriesData): {
  year: string
  value: number | null
} | null {
  const years = Object.keys(series.observations).sort()
  // Walk backwards to find the last non-null entry
  for (let i = years.length - 1; i >= 0; i--) {
    const year = years[i]
    const value = series.observations[year].value
    if (value !== null) return { year, value }
  }
  return null
}

/**
 * Filter series observations to a specific year range.
 */
export function filterIMFByYearRange(
  series: IMFSeriesData,
  startYear: number,
  endYear: number,
): IMFSeriesData {
  const filtered: Record<string, IMFObservation> = {}
  for (const [year, obs] of Object.entries(series.observations)) {
    const y = parseInt(year, 10)
    if (!isNaN(y) && y >= startYear && y <= endYear) {
      filtered[year] = obs
    }
  }
  return { ...series, observations: filtered }
}
