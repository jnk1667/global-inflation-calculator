/**
 * OECD Data Explorer API client
 * ─────────────────────────────
 * Free, no API key required. Covers 38 OECD member countries.
 *
 * IMPORTANT: The legacy stats.oecd.org API was taken offline July 1, 2024.
 * The new base URL is: https://sdmx.oecd.org/public/rest/
 * Docs: https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html
 *
 * Because the OECD API blocks non-browser server requests (same pattern as
 * FAOSTAT and IMF), this module:
 *   1. Tries the live API first (works client-side or in environments where
 *      the OECD endpoint is reachable)
 *   2. Falls back to static JSON files in /public/data/oecd-*.json which are
 *      seeded with verified OECD data and served by Next.js as public assets.
 */

// ─── Base URLs ─────────────────────────────────────────────────────────────────
/** New OECD Data Explorer SDMX REST API (post July 2024) */
export const OECD_API_BASE = "https://sdmx.oecd.org/public/rest"

// ─── Country codes for the 8 currencies supported by this site ───────────────
export const OECD_SUPPORTED_COUNTRIES = {
  USA: { name: "United States", currency: "USD" },
  GBR: { name: "United Kingdom", currency: "GBP" },
  DEU: { name: "Germany",        currency: "EUR" },
  JPN: { name: "Japan",          currency: "JPY" },
  CAN: { name: "Canada",         currency: "CAD" },
  AUS: { name: "Australia",      currency: "AUD" },
  CHE: { name: "Switzerland",    currency: "CHF" },
  FRA: { name: "France",         currency: "EUR" },
} as const

export type OECDCountryCode = keyof typeof OECD_SUPPORTED_COUNTRIES

// ─── Dataset identifiers (new OECD Data Explorer format) ─────────────────────
/**
 * Format: "{agency},{DSD}@{dataflow},{version}"
 * These replace the legacy OECD.Stat single-word identifiers.
 */
export const OECD_DATASETS = {
  /** PPP conversion rates: national currency per USD (annual) */
  PPP_GDP:    "OECD.SDD.TPS,DSD_PRICES@DF_PRICES_PPPCO,1.0",
  /** Average annual wages in constant 2022 USD PPP */
  WAGES:      "OECD.ELS.SAE,DSD_EARNINGS@DF_EARNINGS_AVERAGES,1.0",
  /** Consumer Price Index (total, annual index) */
  CPI:        "OECD.SDD.TPS,DSD_PRICES@DF_PRICES_CPI,1.0",
  /** Unemployment rate (harmonised, annual) */
  UNEMPLOYMENT: "OECD.SDD.STES,DSD_STES@DF_STES,4.0",
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
  observations: Record<string, OECDObservation>
}

export interface OECDDataResult {
  dataset: string
  countries: OECDCountryCode[]
  startPeriod: string
  endPeriod: string
  series: OECDSeriesData[]
  fetchedAt: string
  /** true if data came from the live API; false if from static fallback */
  isLive: boolean
}

// ─── PPP-specific output type ──────────────────────────────────────────────────

export interface OECDPPPData {
  country: OECDCountryCode
  countryName: string
  currency: string
  /** Latest PPP rate: units of national currency per 1 USD */
  latestPPP: number | null
  latestYear: string | null
  /** Full time series: year → PPP rate */
  timeSeries: Record<string, number>
  snapshotDate: string
  isLive: boolean
}

// ─── Static fallback data types ───────────────────────────────────────────────

interface StaticPPPEntry {
  name: string
  currency: string
  pppRates: Record<string, number>
}

interface StaticWagesEntry {
  name: string
  currency: string
  wages: Record<string, number>
}

interface StaticPPPFile {
  _meta: { source: string; snapshotDate: string; measure: string }
  data: Record<string, StaticPPPEntry>
}

interface StaticWagesFile {
  _meta: { source: string; snapshotDate: string; measure: string }
  data: Record<string, StaticWagesEntry>
}

// ─── SDMX-JSON v2 parser ─────────────────────────────────────────────────────

interface SDMXDimensionValue { id: string; name: string }
interface SDMXDimension { id: string; name: string; values: SDMXDimensionValue[]; keyPosition?: number }
interface SDMXStructure {
  dimensions: {
    series?: SDMXDimension[]
    observation?: SDMXDimension[]
  }
}
interface SDMXSeriesEntry {
  attributes?: number[]
  observations?: Record<string, (number | null)[]>
}
interface SDMXDataSet { series?: Record<string, SDMXSeriesEntry> }
interface SDMXv2Response {
  data?: {
    dataSets?: SDMXDataSet[]
    structure?: SDMXStructure
  }
  dataSets?: SDMXDataSet[]
  structure?: SDMXStructure
}

function parseSDMXv2(
  raw: SDMXv2Response,
  requestedCountries: OECDCountryCode[],
): OECDSeriesData[] {
  const results: OECDSeriesData[] = []

  // Support both wrapped (.data.dataSets) and unwrapped (.dataSets)
  const dataSets = raw?.data?.dataSets ?? raw?.dataSets ?? []
  const structure = raw?.data?.structure ?? raw?.structure

  if (!dataSets.length || !structure) return results

  const seriesDims = structure.dimensions?.series ?? []
  const obsDims    = structure.dimensions?.observation ?? []

  const refAreaDim = seriesDims.find(d =>
    ["REF_AREA", "LOCATION", "COU", "COUNTRY"].includes(d.id)
  )
  const timeDim = obsDims.find(d =>
    ["TIME_PERIOD", "TIME", "Year"].includes(d.id)
  )

  if (!refAreaDim || !timeDim) return results

  const refAreaPos = refAreaDim.keyPosition ?? seriesDims.indexOf(refAreaDim)
  const series = dataSets[0]?.series ?? {}

  for (const [seriesKey, seriesData] of Object.entries(series)) {
    const keyParts = seriesKey.split(":").map(Number)
    const countryIdx = keyParts[refAreaPos]
    const countryCode = refAreaDim.values?.[countryIdx]?.id as OECDCountryCode

    if (!countryCode || !OECD_SUPPORTED_COUNTRIES[countryCode]) continue
    if (requestedCountries.length && !requestedCountries.includes(countryCode)) continue

    const countryInfo = OECD_SUPPORTED_COUNTRIES[countryCode]
    const observations: Record<string, OECDObservation> = {}

    for (const [obsKey, obsArr] of Object.entries(seriesData.observations ?? {})) {
      const timeIdx = Number(obsKey)
      const timePeriod = timeDim.values?.[timeIdx]?.id ?? obsKey
      // Only keep annual (4-digit year) data
      if (/^\d{4}$/.test(String(timePeriod).slice(0, 4))) {
        observations[String(timePeriod).slice(0, 4)] = {
          value: obsArr?.[0] ?? null,
          status: obsArr?.[1] != null ? String(obsArr[1]) : undefined,
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

// ─── Live API fetch ───────────────────────────────────────────────────────────

async function fetchSDMXLive(
  datasetId: string,
  keyFilter: string,
  params: { startPeriod?: string; endPeriod?: string } = {},
): Promise<SDMXv2Response | null> {
  const query = new URLSearchParams({
    format: "jsondata",
    dimensionAtObservation: "TIME_PERIOD",
    ...(params.startPeriod ? { startPeriod: params.startPeriod } : {}),
    ...(params.endPeriod   ? { endPeriod:   params.endPeriod   } : {}),
  })

  const url = `${OECD_API_BASE}/data/${datasetId}/${keyFilter}?${query.toString()}`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.sdmx.data+json;version=2.0, application/json",
        "User-Agent": "GlobalInflationCalculator/1.0",
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ─── Public API: PPP ──────────────────────────────────────────────────────────

/**
 * Fetch OECD PPP conversion rates (national currency per USD).
 *
 * Falls back to static /public/data/oecd-ppp.json if the live API is
 * unreachable (which it is from server environments without browser headers).
 *
 * @param countries  ISO3 codes to return (default: all 8 supported)
 * @param startYear  First year (default 2000)
 * @param endYear    Last year (default current year)
 */
export async function fetchOECDPPP(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<OECDDataResult> {
  const countryFilter = countries.join("+")

  // Try live API first
  const raw = await fetchSDMXLive(
    OECD_DATASETS.PPP_GDP,
    `A.${countryFilter}.PPP.NATUSD`,
    { startPeriod: String(startYear), endPeriod: String(endYear) },
  )

  if (raw) {
    const series = parseSDMXv2(raw, countries)
    if (series.length > 0) {
      return {
        dataset: OECD_DATASETS.PPP_GDP,
        countries,
        startPeriod: String(startYear),
        endPeriod: String(endYear),
        series,
        fetchedAt: new Date().toISOString(),
        isLive: true,
      }
    }
  }

  // Static fallback
  try {
    const res = await fetch("/data/oecd-ppp.json", { next: { revalidate: 86400 } })
    const staticData: StaticPPPFile = await res.json()

    const series: OECDSeriesData[] = countries
      .filter(c => staticData.data[c])
      .map(c => {
        const entry = staticData.data[c]
        const observations: Record<string, OECDObservation> = {}
        for (const [yr, val] of Object.entries(entry.pppRates)) {
          if (Number(yr) >= startYear && Number(yr) <= endYear) {
            observations[yr] = { value: val }
          }
        }
        return {
          country: c,
          countryName: entry.name,
          currency: entry.currency,
          observations,
        }
      })

    return {
      dataset: OECD_DATASETS.PPP_GDP,
      countries,
      startPeriod: String(startYear),
      endPeriod: String(endYear),
      series,
      fetchedAt: staticData._meta.snapshotDate,
      isLive: false,
    }
  } catch {
    return {
      dataset: OECD_DATASETS.PPP_GDP,
      countries,
      startPeriod: String(startYear),
      endPeriod: String(endYear),
      series: [],
      fetchedAt: new Date().toISOString(),
      isLive: false,
    }
  }
}

/**
 * Fetch OECD PPP data for a single country and return a flat summary.
 */
export async function fetchOECDPPPForCountry(
  country: OECDCountryCode,
  startYear = 2000,
): Promise<OECDPPPData | null> {
  const result = await fetchOECDPPP([country], startYear)
  const series = result.series.find(s => s.country === country)
  if (!series) return null

  const years = Object.keys(series.observations).sort()
  const latestYear = years[years.length - 1] ?? null
  const latestPPP = latestYear ? series.observations[latestYear].value : null

  const timeSeries: Record<string, number> = {}
  for (const [yr, obs] of Object.entries(series.observations)) {
    if (obs.value !== null) timeSeries[yr] = obs.value
  }

  return {
    country,
    countryName: series.countryName,
    currency: series.currency,
    latestPPP,
    latestYear,
    timeSeries,
    snapshotDate: result.fetchedAt,
    isLive: result.isLive,
  }
}

// ─── Public API: Wages ────────────────────────────────────────────────────────

/**
 * Fetch average annual wages (constant 2022 USD PPP) from OECD.
 */
export async function fetchOECDWages(
  countries: OECDCountryCode[] = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[],
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<OECDDataResult> {
  const countryFilter = countries.join("+")

  const raw = await fetchSDMXLive(
    OECD_DATASETS.WAGES,
    `A.${countryFilter}.AVUSDPPP`,
    { startPeriod: String(startYear), endPeriod: String(endYear) },
  )

  if (raw) {
    const series = parseSDMXv2(raw, countries)
    if (series.length > 0) {
      return {
        dataset: OECD_DATASETS.WAGES,
        countries,
        startPeriod: String(startYear),
        endPeriod: String(endYear),
        series,
        fetchedAt: new Date().toISOString(),
        isLive: true,
      }
    }
  }

  // Static fallback
  try {
    const res = await fetch("/data/oecd-wages.json", { next: { revalidate: 86400 } })
    const staticData: StaticWagesFile = await res.json()

    const series: OECDSeriesData[] = countries
      .filter(c => staticData.data[c])
      .map(c => {
        const entry = staticData.data[c]
        const observations: Record<string, OECDObservation> = {}
        for (const [yr, val] of Object.entries(entry.wages)) {
          if (Number(yr) >= startYear && Number(yr) <= endYear) {
            observations[yr] = { value: val }
          }
        }
        return {
          country: c,
          countryName: entry.name,
          currency: entry.currency,
          observations,
        }
      })

    return {
      dataset: OECD_DATASETS.WAGES,
      countries,
      startPeriod: String(startYear),
      endPeriod: String(endYear),
      series,
      fetchedAt: staticData._meta.snapshotDate,
      isLive: false,
    }
  } catch {
    return {
      dataset: OECD_DATASETS.WAGES,
      countries,
      startPeriod: String(startYear),
      endPeriod: String(endYear),
      series: [],
      fetchedAt: new Date().toISOString(),
      isLive: false,
    }
  }
}

// ─── Convenience helpers ───────────────────────────────────────────────────────

/** Extract a flat year → value map from an OECDSeriesData. */
export function extractTimeSeries(series: OECDSeriesData): Record<string, number | null> {
  return Object.fromEntries(
    Object.entries(series.observations).map(([yr, obs]) => [yr, obs.value])
  )
}

/** Get the most recent non-null value from a series. */
export function getLatestValue(series: OECDSeriesData): { period: string; value: number } | null {
  const periods = Object.keys(series.observations).sort().reverse()
  for (const p of periods) {
    const v = series.observations[p].value
    if (v !== null && v !== undefined) return { period: p, value: v }
  }
  return null
}

/**
 * Convert a nominal amount from one currency to another using OECD PPP rates.
 *
 * @param amount      The nominal value to convert
 * @param fromISO3    Source country (e.g. "GBR")
 * @param toISO3      Target country (e.g. "USA")
 * @param pppRates    Map of { countryISO3: latestPPP } where PPP = nat.currency/USD
 *
 * Example: convert £50,000 GBP to USD PPP equivalent:
 *   convertPPP(50000, "GBR", "USA", { GBR: 0.729, USA: 1.0 })
 *   → 50000 / 0.729 * 1.0 = $68,587 USD PPP
 */
export function convertPPP(
  amount: number,
  fromISO3: OECDCountryCode,
  toISO3: OECDCountryCode,
  pppRates: Partial<Record<OECDCountryCode, number>>,
): number | null {
  const fromPPP = pppRates[fromISO3]
  const toPPP   = pppRates[toISO3]
  if (!fromPPP || !toPPP) return null
  // Convert: amount (in from-currency) → USD → target currency
  // amount / fromPPP = USD equivalent
  // * toPPP = target currency equivalent
  return (amount / fromPPP) * toPPP
}
