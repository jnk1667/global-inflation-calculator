// FAOSTAT Data client
// The FAOSTAT fenixservices.fao.org API is unreachable from server environments.
// Data is sourced from FAOSTAT bulk CSV downloads (bulks-faostat.fao.org),
// processed by /scripts/fetch-faostat-data.js, and stored as static JSON in
// /public/data/faostat-food-cpi.json. Run the script to refresh the data.
//
// Source:  https://www.fao.org/faostat/en/#data/CP
// License: CC-BY-4.0 (FAO)
// Refresh: Run `node scripts/fetch-faostat-data.js` from the project root

export const FAOSTAT_SUPPORTED_COUNTRIES = {
  USA: { name: "United States", currency: "USD", flag: "us", m49: "840" },
  GBR: { name: "United Kingdom", currency: "GBP", flag: "gb", m49: "826" },
  DEU: { name: "Germany",        currency: "EUR", flag: "de", m49: "276" },
  JPN: { name: "Japan",          currency: "JPY", flag: "jp", m49: "392" },
  CAN: { name: "Canada",         currency: "CAD", flag: "ca", m49: "124" },
  AUS: { name: "Australia",      currency: "AUD", flag: "au", m49: "36"  },
  CHE: { name: "Switzerland",    currency: "CHF", flag: "ch", m49: "756" },
  FRA: { name: "France",         currency: "EUR", flag: "fr", m49: "250" },
} as const

export type FAOSTATCountryCode = keyof typeof FAOSTAT_SUPPORTED_COUNTRIES

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FAOSTATYearData {
  foodCpiIndex:    Record<string, number>   // annual average index (2015=100)
  generalCpiIndex: Record<string, number>   // annual average index (2015=100)
  foodInflation:   Record<string, number>   // annual % change (derived)
  generalInflation:Record<string, number>   // annual % change (derived)
}

export interface FAOSTATCountryData extends FAOSTATYearData {
  iso3:     string
  name:     string
  currency: string
}

export interface FAOSTATResult {
  countries: FAOSTATCountryData[]
  meta: {
    source:       string
    sourceUrl:    string
    basePeriod:   string
    snapshotDate: string
    isStaticFallback: boolean
  }
}

// Raw shape of /public/data/faostat-food-cpi.json
// The bulk CSV script writes { _meta, data: { [ISO3]: { foodCpiIndex, ... } } }
interface FAOSTATRawJSON {
  _meta: {
    source:       string
    sourceUrl:    string
    basePeriod:   string
    snapshotDate: string
    countries?:   { iso3: string; name: string; currency: string }[]
  }
  // data is keyed by ISO3 code
  data?: Record<string, {
    foodCpiIndex:     Record<string, number>
    generalCpiIndex:  Record<string, number>
    foodInflation:    Record<string, number>
    generalInflation: Record<string, number>
  }>
  // fallback: some versions may write countries[] array at top level
  countries?: {
    iso3:     string
    name:     string
    currency: string
    foodCpiIndex:     Record<string, number>
    generalCpiIndex:  Record<string, number>
    foodInflation:    Record<string, number>
    generalInflation: Record<string, number>
  }[]
}

// ─── Static data loader ───────────────────────────────────────────────────────

let _cachedData: FAOSTATRawJSON | null = null

/**
 * Load FAOSTAT food CPI data from the static JSON snapshot.
 * Cached in-memory after first load (per server instance).
 *
 * @param baseUrl  The origin URL — used to fetch the static file in server context.
 *                 Pass `process.env.NEXT_PUBLIC_SITE_URL` or request.url origin.
 */
export async function loadFAOSTATData(baseUrl?: string): Promise<FAOSTATRawJSON> {
  if (_cachedData) return _cachedData

  // In a Next.js server context we can fetch from the public directory
  const origin = baseUrl ?? "https://www.globalinflationcalculator.com"
  const url = `${origin}/data/faostat-food-cpi.json`

  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`FAOSTAT static data unavailable: ${res.status} ${url}`)

  const raw = await res.json() as FAOSTATRawJSON

  // Normalise: the bulk-CSV script writes { data: { ISO3: {...} } }
  // but older versions write { countries: [...] }
  if (!raw.countries && raw.data) {
    const countryMeta = raw._meta.countries ?? Object.keys(raw.data).map((iso3) => ({
      iso3,
      name: FAOSTAT_SUPPORTED_COUNTRIES[iso3 as FAOSTATCountryCode]?.name ?? iso3,
      currency: FAOSTAT_SUPPORTED_COUNTRIES[iso3 as FAOSTATCountryCode]?.currency ?? "",
    }))
    raw.countries = countryMeta.map((cm) => ({
      ...cm,
      ...(raw.data![cm.iso3] ?? { foodCpiIndex: {}, generalCpiIndex: {}, foodInflation: {}, generalInflation: {} }),
    }))
  }

  _cachedData = raw
  return _cachedData
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Get food + general CPI data for all (or specified) countries.
 * Optionally filter to a year range.
 */
export async function fetchFAOSTATConsumerPrices(opts?: {
  countries?: FAOSTATCountryCode[]
  startYear?: number
  endYear?:   number
  baseUrl?:   string
}): Promise<FAOSTATResult> {
  const { countries, startYear = 2000, endYear, baseUrl } = opts ?? {}
  const raw = await loadFAOSTATData(baseUrl)

  const filtered = raw.countries.filter((c) => {
    if (countries && !countries.includes(c.iso3 as FAOSTATCountryCode)) return false
    return true
  })

  const sliceYears = (record: Record<string, number>) => {
    const out: Record<string, number> = {}
    for (const [yr, val] of Object.entries(record)) {
      const y = Number(yr)
      if (y >= startYear && (!endYear || y <= endYear)) out[yr] = val
    }
    return out
  }

  return {
    countries: filtered.map((c) => ({
      iso3:             c.iso3,
      name:             c.name,
      currency:         c.currency,
      foodCpiIndex:     sliceYears(c.foodCpiIndex),
      generalCpiIndex:  sliceYears(c.generalCpiIndex),
      foodInflation:    sliceYears(c.foodInflation),
      generalInflation: sliceYears(c.generalInflation),
    })),
    meta: {
      source:           raw._meta.source,
      sourceUrl:        raw._meta.sourceUrl,
      basePeriod:       raw._meta.basePeriod,
      snapshotDate:     raw._meta.snapshotDate,
      isStaticFallback: true,
    },
  }
}

/**
 * Get the latest food inflation rate for a specific country.
 * Returns the most recent year with a non-null value.
 */
export function getLatestFoodInflation(
  data: FAOSTATResult,
  iso3: FAOSTATCountryCode,
): { year: number; value: number } | null {
  const country = data.countries.find((c) => c.iso3 === iso3)
  if (!country) return null

  const entries = Object.entries(country.foodInflation)
    .filter(([, v]) => v !== null && !isNaN(v))
    .sort(([a], [b]) => Number(b) - Number(a))

  if (!entries.length) return null
  return { year: Number(entries[0][0]), value: entries[0][1] }
}

/**
 * Build a chart-ready time series array from FAOSTAT country data.
 * Returns [ { year: "2020", foodCpi: 102.3, generalCpi: 101.1,
 *             foodInflation: 2.3, generalInflation: 1.1 }, ... ]
 */
export function buildFAOSTATTimeSeries(
  country: FAOSTATCountryData,
  startYear = 2000,
): {
  year: string
  foodCpiIndex:     number | null
  generalCpiIndex:  number | null
  foodInflation:    number | null
  generalInflation: number | null
}[] {
  const allYears = new Set([
    ...Object.keys(country.foodCpiIndex),
    ...Object.keys(country.generalCpiIndex),
  ])

  return Array.from(allYears)
    .filter((y) => Number(y) >= startYear)
    .sort()
    .map((yr) => ({
      year:            yr,
      foodCpiIndex:    country.foodCpiIndex[yr]    ?? null,
      generalCpiIndex: country.generalCpiIndex[yr] ?? null,
      foodInflation:   country.foodInflation[yr]   ?? null,
      generalInflation:country.generalInflation[yr] ?? null,
    }))
}

/**
 * Build a multi-country comparison for a specific year and metric.
 * Useful for bar charts showing e.g. food inflation across countries in 2023.
 */
export function buildFAOSTATCrossCountry(
  data: FAOSTATResult,
  year: number,
  metric: keyof FAOSTATYearData,
): { iso3: string; name: string; value: number | null }[] {
  return data.countries.map((c) => ({
    iso3:  c.iso3,
    name:  c.name,
    value: c[metric][String(year)] ?? null,
  }))
}

// Legacy exports for backward compatibility with existing route handler
export const FAOSTAT_DOMAINS = {
  CONSUMER_PRICES: "CP",
  PRODUCER_PRICES: "PP",
  FOOD_BALANCES:   "FBS",
  FOOD_SECURITY:   "FSFS",
} as const
export type FAOSTATDomain = (typeof FAOSTAT_DOMAINS)[keyof typeof FAOSTAT_DOMAINS]
