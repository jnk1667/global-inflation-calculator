// FAOSTAT Data API client
// Free, no API key required.
// Uses the FAOSTAT v1 JSON API hosted at fenixservices.fao.org
//
// API base: https://fenixservices.fao.org/faostat/api/v1/en
// Docs:     https://fenixservices.fao.org/faostat/api/v1/en/ (undocumented but stable)
// Portal:   https://www.fao.org/faostat/
//
// Domains covered (relevant to this project):
//   CP   — Consumer Price Indices (general + food CPI, 207 countries, quarterly updates)
//   PP   — Producer Prices (farm-gate prices for food commodities)
//   FBS  — Food Balances (food supply per capita, kcal availability)
//   FSFS — Food Security Indicators (food price volatility, affordability)

const FAOSTAT_API_BASE = "https://fenixservices.fao.org/faostat/api/v1/en"

// ─── Country definitions ──────────────────────────────────────────────────────
// FAOSTAT uses FAO country codes as primary identifiers.
// We map our 8 supported ISO3 codes to FAO area codes.
export const FAOSTAT_SUPPORTED_COUNTRIES = {
  USA: { name: "United States", currency: "USD", flag: "🇺🇸", faoCode: "231", iso3: "USA" },
  GBR: { name: "United Kingdom", currency: "GBP", flag: "🇬🇧", faoCode: "229", iso3: "GBR" },
  DEU: { name: "Germany", currency: "EUR", flag: "🇩🇪", faoCode: "79", iso3: "DEU" },
  JPN: { name: "Japan", currency: "JPY", flag: "🇯🇵", faoCode: "110", iso3: "JPN" },
  CAN: { name: "Canada", currency: "CAD", flag: "🇨🇦", faoCode: "33", iso3: "CAN" },
  AUS: { name: "Australia", currency: "AUD", flag: "🇦🇺", faoCode: "10", iso3: "AUS" },
  CHE: { name: "Switzerland", currency: "CHF", flag: "🇨🇭", faoCode: "211", iso3: "CHE" },
  FRA: { name: "France", currency: "EUR", flag: "🇫🇷", faoCode: "68", iso3: "FRA" },
} as const

export type FAOSTATCountryCode = keyof typeof FAOSTAT_SUPPORTED_COUNTRIES

// ─── Domain codes ─────────────────────────────────────────────────────────────
export const FAOSTAT_DOMAINS = {
  CONSUMER_PRICES: "CP",      // General + food consumer price indices
  PRODUCER_PRICES: "PP",      // Farm-gate commodity producer prices
  FOOD_BALANCES: "FBS",       // Food supply per capita (kcal, protein, fat)
  FOOD_SECURITY: "FSFS",      // Food security indicators incl. price volatility
} as const

export type FAOSTATDomain = (typeof FAOSTAT_DOMAINS)[keyof typeof FAOSTAT_DOMAINS]

// ─── Element codes (what to measure within a domain) ─────────────────────────
// CP domain elements
const CP_ELEMENT_GENERAL_CPI = "5541"     // General CPI index value (2015=100 base)
const CP_ELEMENT_FOOD_CPI = "5542"        // Food CPI index value (2015=100 base)
const CP_ELEMENT_GENERAL_INFLATION = "5543" // General CPI annual % change
const CP_ELEMENT_FOOD_INFLATION = "5544"  // Food CPI annual % change

// PP domain elements
const PP_ELEMENT_VALUE = "5531"           // Producer price (USD per tonne)

// FBS domain elements
const FBS_ELEMENT_FOOD_SUPPLY_KCAL = "664" // Food supply (kcal/capita/day)
const FBS_ELEMENT_FOOD_SUPPLY_PROTEIN = "674" // Protein supply (g/capita/day)

// ─── Item codes (which items within a domain) ─────────────────────────────────
// CP domain — aggregate indices
const CP_ITEM_GENERAL = "23013"     // General consumer price index (all items)
const CP_ITEM_FOOD = "23014"        // Food consumer price index

// PP domain — key food commodities
const PP_ITEM_WHEAT = "15"
const PP_ITEM_MAIZE = "56"
const PP_ITEM_RICE = "27"
const PP_ITEM_BEEF = "867"
const PP_ITEM_MILK = "882"

// FBS domain
const FBS_ITEM_TOTAL = "2901"       // Total food supply

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FAOSTATObservation {
  year: number
  value: number | null
  flag?: string   // "E" = estimated, "F" = forecast, etc.
  unit?: string
}

export interface FAOSTATSeries {
  country: string        // ISO3 code
  countryName: string
  currency: string
  domain: string
  element: string
  elementCode: string
  item: string
  itemCode: string
  unit: string
  observations: FAOSTATObservation[]
}

export interface FAOSTATDataResult {
  domain: string
  domainLabel: string
  countries: string[]
  series: FAOSTATSeries[]
  fetchedAt: string
}

// ─── Raw API response type ─────────────────────────────────────────────────────
interface FAOSTATRawRecord {
  "Area Code"?: string
  "Area Code (ISO3)"?: string
  "Area"?: string
  "Element Code"?: string
  "Element"?: string
  "Item Code"?: string
  "Item"?: string
  "Year Code"?: string
  "Year"?: number | string
  "Unit"?: string
  "Value"?: number | null
  "Flag"?: string
  [key: string]: unknown
}

interface FAOSTATRawResponse {
  data?: FAOSTATRawRecord[]
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

/**
 * Fetch data from the FAOSTAT v1 JSON API.
 *
 * @param domain      FAOSTAT domain code e.g. "CP"
 * @param params      Query parameters: area, element, item, year, etc.
 * @param revalidate  Next.js ISR revalidation in seconds (default 24h)
 */
async function fetchFAOSTATRaw(
  domain: string,
  params: Record<string, string>,
  revalidate = 86400,
): Promise<FAOSTATRawResponse> {
  const query = new URLSearchParams({
    area_cs: "ISO3",        // Use ISO3 country codes
    element_cs: "FAO",      // Use FAO element codes
    item_cs: "FAO",         // Use FAO item codes
    show_codes: "true",
    show_unit: "true",
    show_flags: "true",
    null_values: "false",   // Skip null values for leaner responses
    output_type: "objects", // Return array of objects (not arrays)
    ...params,
  })

  const url = `${FAOSTAT_API_BASE}/data/${domain}?${query.toString()}`

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "GlobalInflationCalculator/1.0 (educational, non-commercial)",
    },
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(
      `FAOSTAT API error ${response.status} for domain "${domain}": ${response.statusText}`,
    )
  }

  return response.json()
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parse raw FAOSTAT JSON records into clean FAOSTATSeries objects,
 * grouped by country + element + item.
 */
function parseFAOSTATResponse(
  raw: FAOSTATRawResponse,
  domain: string,
): FAOSTATSeries[] {
  const records = raw?.data ?? []
  if (!records.length) return []

  // Group records by country + element + item
  const groups = new Map<string, FAOSTATSeries>()

  for (const record of records) {
    const iso3 =
      (record["Area Code (ISO3)"] as string) ??
      (record["Area Code"] as string) ?? ""

    const country = FAOSTAT_SUPPORTED_COUNTRIES[iso3 as FAOSTATCountryCode]
    const countryName = country?.name ?? (record["Area"] as string) ?? iso3
    const currency = country?.currency ?? ""

    const elementCode = String(record["Element Code"] ?? "")
    const element = String(record["Element"] ?? "")
    const itemCode = String(record["Item Code"] ?? "")
    const item = String(record["Item"] ?? "")
    const unit = String(record["Unit"] ?? "")

    const groupKey = `${iso3}::${elementCode}::${itemCode}`

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        country: iso3,
        countryName,
        currency,
        domain,
        element,
        elementCode,
        item,
        itemCode,
        unit,
        observations: [],
      })
    }

    const series = groups.get(groupKey)!
    const year = Number(record["Year"] ?? record["Year Code"])
    const value =
      record["Value"] !== null && record["Value"] !== undefined
        ? Number(record["Value"])
        : null
    const flag = record["Flag"] as string | undefined

    if (!isNaN(year)) {
      series.observations.push({ year, value, flag, unit })
    }
  }

  // Sort observations ascending by year in each series
  for (const series of groups.values()) {
    series.observations.sort((a, b) => a.year - b.year)
  }

  return Array.from(groups.values())
}

// ─── Country code helpers ─────────────────────────────────────────────────────

function buildAreaParam(countries?: FAOSTATCountryCode[]): string {
  const codes = countries ?? (Object.keys(FAOSTAT_SUPPORTED_COUNTRIES) as FAOSTATCountryCode[])
  return codes.join("|")
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * Fetch general and food Consumer Price Index data from FAOSTAT.
 * Covers 207 countries; updated quarterly by FAO Statistics Division.
 * Base year = 2015 (index 100). Also returns annual % change series.
 *
 * @param startYear  First year (default: 2000)
 * @param countries  Subset of supported ISO3 codes (default: all 8)
 */
export async function fetchFAOSTATConsumerPrices(
  startYear = 2000,
  countries?: FAOSTATCountryCode[],
): Promise<FAOSTATDataResult> {
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i,
  ).join("|")

  const raw = await fetchFAOSTATRaw(FAOSTAT_DOMAINS.CONSUMER_PRICES, {
    area: buildAreaParam(countries),
    element: [
      CP_ELEMENT_GENERAL_CPI,
      CP_ELEMENT_FOOD_CPI,
      CP_ELEMENT_GENERAL_INFLATION,
      CP_ELEMENT_FOOD_INFLATION,
    ].join("|"),
    item: [CP_ITEM_GENERAL, CP_ITEM_FOOD].join("|"),
    year: years,
  })

  const series = parseFAOSTATResponse(raw, FAOSTAT_DOMAINS.CONSUMER_PRICES)

  return {
    domain: FAOSTAT_DOMAINS.CONSUMER_PRICES,
    domainLabel: "Consumer Price Indices — General & Food (2015=100, Annual % Change)",
    countries: (countries ?? Object.keys(FAOSTAT_SUPPORTED_COUNTRIES)) as string[],
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch food General CPI inflation rate only (annual % change).
 * Useful for charts comparing food inflation to general inflation over time.
 *
 * @param startYear  First year (default: 2000)
 * @param countries  Subset of supported ISO3 codes (default: all 8)
 */
export async function fetchFAOSTATInflationRates(
  startYear = 2000,
  countries?: FAOSTATCountryCode[],
): Promise<FAOSTATDataResult> {
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i,
  ).join("|")

  const raw = await fetchFAOSTATRaw(FAOSTAT_DOMAINS.CONSUMER_PRICES, {
    area: buildAreaParam(countries),
    element: [CP_ELEMENT_GENERAL_INFLATION, CP_ELEMENT_FOOD_INFLATION].join("|"),
    item: [CP_ITEM_GENERAL, CP_ITEM_FOOD].join("|"),
    year: years,
  })

  const series = parseFAOSTATResponse(raw, FAOSTAT_DOMAINS.CONSUMER_PRICES)

  return {
    domain: FAOSTAT_DOMAINS.CONSUMER_PRICES,
    domainLabel: "Consumer Price Inflation Rates — General & Food (Annual % Change)",
    countries: (countries ?? Object.keys(FAOSTAT_SUPPORTED_COUNTRIES)) as string[],
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch agricultural producer prices for key food commodities from FAOSTAT.
 * Commodities: wheat, maize, rice, beef, milk.
 * Prices in USD per tonne at farm-gate.
 *
 * @param startYear  First year (default: 2000)
 * @param countries  Subset of supported ISO3 codes (default: all 8)
 */
export async function fetchFAOSTATProducerPrices(
  startYear = 2000,
  countries?: FAOSTATCountryCode[],
): Promise<FAOSTATDataResult> {
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i,
  ).join("|")

  const raw = await fetchFAOSTATRaw(FAOSTAT_DOMAINS.PRODUCER_PRICES, {
    area: buildAreaParam(countries),
    element: PP_ELEMENT_VALUE,
    item: [PP_ITEM_WHEAT, PP_ITEM_MAIZE, PP_ITEM_RICE, PP_ITEM_BEEF, PP_ITEM_MILK].join("|"),
    year: years,
  })

  const series = parseFAOSTATResponse(raw, FAOSTAT_DOMAINS.PRODUCER_PRICES)

  return {
    domain: FAOSTAT_DOMAINS.PRODUCER_PRICES,
    domainLabel: "Agricultural Producer Prices — Wheat, Maize, Rice, Beef, Milk (USD/tonne)",
    countries: (countries ?? Object.keys(FAOSTAT_SUPPORTED_COUNTRIES)) as string[],
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch food supply per capita data from FAOSTAT Food Balances.
 * Measures kcal and protein availability per person per day.
 * Useful as a proxy for food security and standard of living changes.
 *
 * @param startYear  First year (default: 2000)
 * @param countries  Subset of supported ISO3 codes (default: all 8)
 */
export async function fetchFAOSTATFoodSupply(
  startYear = 2000,
  countries?: FAOSTATCountryCode[],
): Promise<FAOSTATDataResult> {
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i,
  ).join("|")

  const raw = await fetchFAOSTATRaw(FAOSTAT_DOMAINS.FOOD_BALANCES, {
    area: buildAreaParam(countries),
    element: [FBS_ELEMENT_FOOD_SUPPLY_KCAL, FBS_ELEMENT_FOOD_SUPPLY_PROTEIN].join("|"),
    item: FBS_ITEM_TOTAL,
    year: years,
  })

  const series = parseFAOSTATResponse(raw, FAOSTAT_DOMAINS.FOOD_BALANCES)

  return {
    domain: FAOSTAT_DOMAINS.FOOD_BALANCES,
    domainLabel: "Food Supply per Capita (kcal/day & g protein/day)",
    countries: (countries ?? Object.keys(FAOSTAT_SUPPORTED_COUNTRIES)) as string[],
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Convenience: fetch all FAOSTAT datasets in parallel.
 * Returns consumer prices (CPI + inflation), producer prices, and food supply.
 */
export async function fetchAllFAOSTATData(options?: {
  startYear?: number
  countries?: FAOSTATCountryCode[]
}): Promise<{
  consumerPrices: FAOSTATDataResult
  inflationRates: FAOSTATDataResult
  producerPrices: FAOSTATDataResult
  foodSupply: FAOSTATDataResult
}> {
  const { startYear = 2000, countries } = options ?? {}

  const [consumerPrices, inflationRates, producerPrices, foodSupply] =
    await Promise.all([
      fetchFAOSTATConsumerPrices(startYear, countries),
      fetchFAOSTATInflationRates(startYear, countries),
      fetchFAOSTATProducerPrices(startYear, countries),
      fetchFAOSTATFoodSupply(startYear, countries),
    ])

  return { consumerPrices, inflationRates, producerPrices, foodSupply }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * Extract a simple year → value map from a FAOSTATSeries observation array.
 */
export function extractFAOSTATTimeSeries(
  series: FAOSTATSeries,
): Record<number, number | null> {
  const result: Record<number, number | null> = {}
  for (const obs of series.observations) {
    result[obs.year] = obs.value
  }
  return result
}

/**
 * Get the most recent non-null observation from a FAOSTAT series.
 */
export function getFAOSTATLatestValue(
  series: FAOSTATSeries,
): FAOSTATObservation | null {
  for (let i = series.observations.length - 1; i >= 0; i--) {
    if (series.observations[i].value !== null) return series.observations[i]
  }
  return null
}

/**
 * Filter FAOSTAT series observations to a specific year range.
 */
export function filterFAOSTATByYearRange(
  series: FAOSTATSeries,
  startYear: number,
  endYear: number,
): FAOSTATSeries {
  return {
    ...series,
    observations: series.observations.filter(
      (obs) => obs.year >= startYear && obs.year <= endYear,
    ),
  }
}

/**
 * Find all series for a specific country within a FAOSTATDataResult.
 */
export function getFAOSTATSeriesByCountry(
  result: FAOSTATDataResult,
  iso3: FAOSTATCountryCode,
): FAOSTATSeries[] {
  return result.series.filter((s) => s.country === iso3)
}

/**
 * Find a series matching a specific element code within a FAOSTATDataResult.
 */
export function getFAOSTATSeriesByElement(
  result: FAOSTATDataResult,
  iso3: FAOSTATCountryCode,
  elementCode: string,
): FAOSTATSeries | undefined {
  return result.series.find(
    (s) => s.country === iso3 && s.elementCode === elementCode,
  )
}
