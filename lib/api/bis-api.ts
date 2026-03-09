// BIS (Bank for International Settlements) Data API client
// Free, no API key required. Uses the BIS SDMX-JSON REST API v2.
// Docs: https://stats.bis.org/api-doc/v2/
// Portal: https://data.bis.org
//
// Datasets covered:
//   WS_SPP      — Residential property prices (selected/long series)
//   WS_LONG_CPI — Consumer prices (long series, monthly + annual)
//   WS_XRU      — US dollar exchange rates (bilateral, end-of-period)
//   WS_CBPOL_D  — Central bank policy/target rates (daily)
//
// v2 API URL format:
//   https://stats.bis.org/api/v2/data/dataflow/BIS/{DATASET}/1.0/{KEY}?startPeriod=...
// JSON response requires Accept: application/vnd.sdmx.data+json;version=2.0.0

const BIS_API_BASE = "https://stats.bis.org/api/v2"

// BIS SDMX-JSON v2 filter key dimensions for WS_SPP:
// FREQ.REF_AREA.VALUE_MEASURE
// Nominal: Q.{country}.N
// Real:    Q.{country}.R
// All countries joined with "+" separator

// ─── Country codes for the 8 currencies supported by this site ───────────────
// BIS uses ISO 2-letter country codes in most datasets
export const BIS_SUPPORTED_COUNTRIES = {
  US: { name: "United States", currency: "USD", flag: "🇺🇸", iso3: "USA" },
  GB: { name: "United Kingdom", currency: "GBP", flag: "🇬🇧", iso3: "GBR" },
  DE: { name: "Germany", currency: "EUR", flag: "🇩🇪", iso3: "DEU" },
  JP: { name: "Japan", currency: "JPY", flag: "🇯🇵", iso3: "JPN" },
  CA: { name: "Canada", currency: "CAD", flag: "🇨🇦", iso3: "CAN" },
  AU: { name: "Australia", currency: "AUD", flag: "🇦🇺", iso3: "AUS" },
  CH: { name: "Switzerland", currency: "CHF", flag: "🇨🇭", iso3: "CHE" },
  FR: { name: "France", currency: "EUR", flag: "🇫🇷", iso3: "FRA" },
} as const

export type BISCountryCode = keyof typeof BIS_SUPPORTED_COUNTRIES

// ─── BIS dataset identifiers ─────────────────────────────────────────────────
export const BIS_DATASETS = {
  // Residential property prices — quarterly index values, 56 countries
  PROPERTY_PRICES: "WS_SPP",
  // Long CPI series — monthly and annual, back to 1960s for major economies
  CPI_LONG: "WS_LONG_CPI",
  // Bilateral exchange rates vs. USD — monthly, end-of-period
  EXCHANGE_RATES: "WS_XRU",
  // Central bank policy rates — daily target/benchmark rates
  POLICY_RATES: "WS_CBPOL_D",
} as const

export type BISDataset = (typeof BIS_DATASETS)[keyof typeof BIS_DATASETS]

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BISObservation {
  value: number | null
  period: string // e.g. "2023-Q1", "2023-03", "2023"
}

export interface BISSeriesData {
  country: string          // ISO 2-letter code
  countryName: string
  currency: string
  dataset: string
  seriesKey: string
  frequency: string       // "A" = annual, "Q" = quarterly, "M" = monthly, "D" = daily
  observations: BISObservation[]
}

export interface BISDataResult {
  dataset: string
  datasetLabel: string
  countries: string[]
  series: BISSeriesData[]
  fetchedAt: string
}

// ─── SDMX-JSON response types ─────────────────────────────────────────────────
interface SDMXDimension {
  id: string
  values: Array<{ id: string; name: string }>
}

interface SDMXStructure {
  dimensions: {
    series?: SDMXDimension[]
    observation?: SDMXDimension[]
  }
}

interface SDMXSeries {
  [seriesKey: string]: {
    observations?: {
      [obsIndex: string]: [number | null, ...unknown[]]
    }
  }
}

interface SDMXDataSet {
  series?: SDMXSeries
}

interface SDMXResponse {
  data?: {
    structure?: SDMXStructure
    dataSets?: SDMXDataSet[]
  }
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

/**
 * Fetch data from the BIS SDMX REST API v2.
 *
 * v2 URL format:
 *   /data/dataflow/BIS/{dataset}/1.0/{key}?startPeriod=...
 *
 * @param dataset    BIS dataflow identifier e.g. "WS_SPP"
 * @param key        SDMX dimension filter e.g. "Q.US+GB.N+R"
 * @param startPeriod  e.g. "2000-Q1" or "2000" or "2000-01"
 * @param revalidate   Next.js ISR revalidation in seconds (default 24h)
 */
async function fetchBISRaw(
  dataset: string,
  key = "all",
  startPeriod?: string,
  revalidate = 86400,
): Promise<SDMXResponse> {
  const params = new URLSearchParams()
  if (startPeriod) params.set("startPeriod", startPeriod)
  params.set("detail", "dataonly")
  // Some SDMX endpoints honour a format query param as an alternative to Accept header
  params.set("format", "jsondata")

  // v2 URL: /data/dataflow/BIS/{DATASET}/1.0/{KEY}
  const url = `${BIS_API_BASE}/data/dataflow/BIS/${dataset}/1.0/${key}?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      // Use unversioned SDMX JSON media type — BIS rejects versioned variants (;version=1.0 and ;version=2.0.0 both return 406)
      Accept: "application/vnd.sdmx.data+json",
    },
    next: { revalidate },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `BIS API ${response.status} — dataset="${dataset}" key="${key}" url="${url}" body="${body.slice(0, 400)}"`,
    )
  }

  const text = await response.text()

  // Guard against XML being returned despite correct Accept header
  if (text.trimStart().startsWith("<")) {
    throw new Error(
      `BIS API returned XML instead of JSON for dataset "${dataset}". ` +
      `This usually means the key "${key}" is invalid or the dataset is unavailable.`
    )
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`BIS API returned invalid JSON for dataset "${dataset}": ${text.slice(0, 200)}`)
  }
}

// ─── SDMX-JSON Parser ─────────────────────────────────────────────────────────

/**
 * Parse a SDMX-JSON response into clean BISSeriesData objects.
 * Handles the indexed dimension/observation structure BIS returns.
 */
function parseBISResponse(
  raw: SDMXResponse,
  dataset: string,
  countryMapping: Record<string, string>, // bisCode → countryKey
): BISSeriesData[] {
  const structure = raw?.data?.structure
  const dataSets = raw?.data?.dataSets

  if (!structure || !dataSets?.length) return []

  const seriesDims = structure.dimensions?.series ?? []
  const obsDims = structure.dimensions?.observation ?? []

  // Find the time dimension in observations
  const timeDimIndex = obsDims.findIndex((d) => d.id === "TIME_PERIOD")

  const results: BISSeriesData[] = []
  const rawSeries = dataSets[0]?.series ?? {}

  for (const [seriesKeyStr, seriesData] of Object.entries(rawSeries)) {
    const keyParts = seriesKeyStr.split(":").map(Number)

    // Build a human-readable series label from dimension values
    const dimLabels: Record<string, string> = {}
    for (let i = 0; i < seriesDims.length; i++) {
      const dim = seriesDims[i]
      const valIndex = keyParts[i]
      dimLabels[dim.id] = dim.values[valIndex]?.id ?? String(valIndex)
    }

    // Determine frequency from FREQ dimension
    const freq = dimLabels["FREQ"] ?? "A"

    // Try to identify country from REF_AREA or similar dimension
    const refArea =
      dimLabels["REF_AREA"] ??
      dimLabels["BORROWER_CTY"] ??
      dimLabels["COUNTRY"] ??
      ""

    // Map BIS area code to our supported country
    const countryKey = countryMapping[refArea] ?? refArea
    const countryInfo =
      BIS_SUPPORTED_COUNTRIES[countryKey as BISCountryCode] ??
      Object.values(BIS_SUPPORTED_COUNTRIES).find((c) => c.iso3 === refArea)

    const observations: BISObservation[] = []
    const rawObs = seriesData.observations ?? {}

    // Build time period lookup from observation dimensions
    const timeDimValues =
      timeDimIndex >= 0 ? (obsDims[timeDimIndex]?.values ?? []) : []

    for (const [obsIndexStr, obsValues] of Object.entries(rawObs)) {
      const obsKeyParts = obsIndexStr.split(":").map(Number)
      const timeIndex = timeDimIndex >= 0 ? obsKeyParts[timeDimIndex] : obsKeyParts[0]
      const period = timeDimValues[timeIndex]?.id ?? obsIndexStr
      const value = obsValues[0] !== null && obsValues[0] !== undefined
        ? Number(obsValues[0])
        : null

      observations.push({ period, value: isNaN(value as number) ? null : value })
    }

    // Sort observations by period ascending
    observations.sort((a, b) => a.period.localeCompare(b.period))

    results.push({
      country: countryKey,
      countryName: countryInfo?.name ?? refArea,
      currency: countryInfo?.currency ?? "",
      dataset,
      seriesKey: seriesKeyStr,
      frequency: freq,
      observations,
    })
  }

  return results
}

// Country code mappings: BIS REF_AREA codes → our BIS_SUPPORTED_COUNTRIES keys
const PROPERTY_COUNTRY_MAP: Record<string, BISCountryCode> = {
  US: "US", GB: "GB", DE: "DE", JP: "JP",
  CA: "CA", AU: "AU", CH: "CH", FR: "FR",
  // Some BIS series use numeric or alternate codes
  "840": "US", "826": "GB", "276": "DE", "392": "JP",
  "124": "CA", "036": "AU", "756": "CH", "250": "FR",
}

const CPI_COUNTRY_MAP: Record<string, BISCountryCode> = {
  US: "US", GB: "GB", DE: "DE", JP: "JP",
  CA: "CA", AU: "AU", CH: "CH", FR: "FR",
}

const RATE_COUNTRY_MAP: Record<string, BISCountryCode> = {
  US: "US", GB: "GB", DE: "DE", JP: "JP",
  CA: "CA", AU: "AU", CH: "CH", FR: "FR",
  XM: "DE", // Euro area — map to Germany as EUR representative
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * Fetch residential property price indices from BIS.
 * Quarterly data, nominal and real indices (2010 = 100).
 * Covers all 8 supported economies.
 *
 * @param startYear  First year to include (default: 2000)
 */
export async function fetchBISPropertyPrices(startYear = 2000): Promise<BISDataResult> {
  // WS_SPP key: FREQ.REF_AREA.VALUE_MEASURE
  // N = nominal price index, R = real (inflation-adjusted) price index
  // Fetch nominal + real for all 8 countries in a single request
  const countryKey = Object.keys(BIS_SUPPORTED_COUNTRIES).join("+")
  const key = `Q.${countryKey}.N+R`

  const raw = await fetchBISRaw(
    BIS_DATASETS.PROPERTY_PRICES,
    key,
    `${startYear}-Q1`,
  )

  const series = parseBISResponse(raw, BIS_DATASETS.PROPERTY_PRICES, PROPERTY_COUNTRY_MAP)

  return {
    dataset: BIS_DATASETS.PROPERTY_PRICES,
    datasetLabel: "Residential Property Prices (Nominal & Real Index, 2010=100)",
    countries: Object.keys(BIS_SUPPORTED_COUNTRIES),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch residential property price annual changes (year-on-year %).
 * More useful for comparing property inflation across economies.
 *
 * @param startYear  First year to include (default: 2000)
 */
export async function fetchBISPropertyPriceChanges(startYear = 2000): Promise<BISDataResult> {
  const countryKey = Object.keys(BIS_SUPPORTED_COUNTRIES).join("+")
  // Annual % change: use A frequency with N (nominal) measure
  const key = `A.${countryKey}.N`

  const raw = await fetchBISRaw(
    BIS_DATASETS.PROPERTY_PRICES,
    key,
    String(startYear),
  )

  const series = parseBISResponse(raw, BIS_DATASETS.PROPERTY_PRICES, PROPERTY_COUNTRY_MAP)

  return {
    dataset: BIS_DATASETS.PROPERTY_PRICES,
    datasetLabel: "Residential Property Prices — Annual % Change",
    countries: Object.keys(BIS_SUPPORTED_COUNTRIES),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch long CPI series from BIS.
 * Annual data back to 1960s for major economies — useful for historical
 * purchasing power and inflation trend analysis.
 *
 * @param startYear  First year to include (default: 1960)
 */
export async function fetchBISCPI(startYear = 1960): Promise<BISDataResult> {
  const countryKey = Object.keys(BIS_SUPPORTED_COUNTRIES).join("+")
  // WS_LONG_CPI key: FREQ.REF_AREA.UNIT_MEASURE — annual % change
  const key = `A.${countryKey}.628`

  const raw = await fetchBISRaw(
    BIS_DATASETS.CPI_LONG,
    key,
    String(startYear),
  )

  const series = parseBISResponse(raw, BIS_DATASETS.CPI_LONG, CPI_COUNTRY_MAP)

  return {
    dataset: BIS_DATASETS.CPI_LONG,
    datasetLabel: "Consumer Price Inflation — Annual % Change (Long Series)",
    countries: Object.keys(BIS_SUPPORTED_COUNTRIES),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch bilateral USD exchange rates from BIS.
 * Monthly end-of-period rates for all 8 supported currencies vs. USD.
 *
 * @param startYear  First year to include (default: 1990)
 */
export async function fetchBISExchangeRates(startYear = 1990): Promise<BISDataResult> {
  // WS_XRU key: FREQ.CURRENCY.CURRENCY — monthly, vs USD
  const currencyKey = Object.values(BIS_SUPPORTED_COUNTRIES)
    .map((c) => c.currency)
    .filter((v, i, arr) => arr.indexOf(v) === i) // deduplicate EUR
    .join("+")

  const key = `M.${currencyKey}.USD`

  const raw = await fetchBISRaw(
    BIS_DATASETS.EXCHANGE_RATES,
    key,
    `${startYear}-01`,
  )

  const series = parseBISResponse(raw, BIS_DATASETS.EXCHANGE_RATES, RATE_COUNTRY_MAP)

  return {
    dataset: BIS_DATASETS.EXCHANGE_RATES,
    datasetLabel: "Bilateral Exchange Rates vs. USD (Monthly, End-of-Period)",
    countries: Object.keys(BIS_SUPPORTED_COUNTRIES),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Fetch central bank policy/target interest rates from BIS.
 * Daily data — monthly averages are computed server-side for usability.
 *
 * @param startYear  First year to include (default: 1995)
 */
export async function fetchBISPolicyRates(startYear = 1995): Promise<BISDataResult> {
  // WS_CBPOL_D REF_AREA codes that actually have data:
  // - DE and FR are excluded — both joined the euro area in 1999 and have no
  //   individual series in WS_CBPOL_D. Use XM (Euro area / ECB) for EUR instead.
  // - Sending any invalid REF_AREA code causes BIS to 404 the entire request.
  const validPolicyRateCountries = ["US", "GB", "JP", "CA", "AU", "CH", "XM"]
  const key = `D.${validPolicyRateCountries.join("+")}`

  const raw = await fetchBISRaw(
    BIS_DATASETS.POLICY_RATES,
    key,
    `${startYear}-01-01`,
    43200, // Cache 12h — rates update more frequently
  )

  const series = parseBISResponse(raw, BIS_DATASETS.POLICY_RATES, RATE_COUNTRY_MAP)

  return {
    dataset: BIS_DATASETS.POLICY_RATES,
    datasetLabel: "Central Bank Policy Rates (Daily)",
    countries: Object.keys(BIS_SUPPORTED_COUNTRIES),
    series,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Convenience: fetch all BIS datasets in parallel.
 * Returns property prices (index + % change), CPI, exchange rates, and policy rates.
 */
export async function fetchAllBISData(options?: {
  propertyStartYear?: number
  cpiStartYear?: number
  ratesStartYear?: number
}): Promise<{
  propertyPrices: BISDataResult
  propertyPriceChanges: BISDataResult
  cpi: BISDataResult
  exchangeRates: BISDataResult
  policyRates: BISDataResult
}> {
  const [propertyPrices, propertyPriceChanges, cpi, exchangeRates, policyRates] =
    await Promise.all([
      fetchBISPropertyPrices(options?.propertyStartYear ?? 2000),
      fetchBISPropertyPriceChanges(options?.propertyStartYear ?? 2000),
      fetchBISCPI(options?.cpiStartYear ?? 1960),
      fetchBISExchangeRates(options?.ratesStartYear ?? 1990),
      fetchBISPolicyRates(options?.ratesStartYear ?? 1995),
    ])

  return { propertyPrices, propertyPriceChanges, cpi, exchangeRates, policyRates }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * Extract a simple period → value map from a BISSeriesData observation array.
 * Useful for charting or direct lookup.
 */
export function extractBISTimeSeries(series: BISSeriesData): Record<string, number | null> {
  const result: Record<string, number | null> = {}
  for (const obs of series.observations) {
    result[obs.period] = obs.value
  }
  return result
}

/**
 * Get the most recent non-null observation from a BIS series.
 */
export function getBISLatestValue(series: BISSeriesData): BISObservation | null {
  for (let i = series.observations.length - 1; i >= 0; i--) {
    if (series.observations[i].value !== null) return series.observations[i]
  }
  return null
}

/**
 * Filter BIS series observations to a specific year range.
 * Works for annual ("2023"), quarterly ("2023-Q1"), and monthly ("2023-03") periods.
 */
export function filterBISByYearRange(
  series: BISSeriesData,
  startYear: number,
  endYear: number,
): BISSeriesData {
  const filtered = series.observations.filter((obs) => {
    const year = parseInt(obs.period.substring(0, 4), 10)
    return !isNaN(year) && year >= startYear && year <= endYear
  })
  return { ...series, observations: filtered }
}

/**
 * Aggregate daily or monthly BIS series to annual averages.
 * Useful for policy rates and exchange rates.
 */
export function aggregateBISToAnnual(series: BISSeriesData): BISSeriesData {
  const byYear: Record<string, number[]> = {}

  for (const obs of series.observations) {
    if (obs.value === null) continue
    const year = obs.period.substring(0, 4)
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(obs.value)
  }

  const annualObs: BISObservation[] = Object.entries(byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, values]) => ({
      period: year,
      value: values.reduce((sum, v) => sum + v, 0) / values.length,
    }))

  return { ...series, frequency: "A", observations: annualObs }
}
