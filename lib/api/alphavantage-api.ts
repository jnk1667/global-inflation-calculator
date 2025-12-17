// Alpha Vantage API client for commodities and stocks data
// Free tier: 25 requests per day

const ALPHA_VANTAGE_API_BASE = "https://www.alphavantage.co/query"
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export interface AlphaVantageTimeSeriesData {
  [date: string]: {
    "1. open": string
    "2. high": string
    "3. low": string
    "4. close": string
    "5. volume"?: string
  }
}

export interface AlphaVantageResponse {
  "Meta Data": {
    "1. Information": string
    "2. Symbol": string
    "3. Last Refreshed": string
    "4. Time Zone": string
  }
  "Time Series (Daily)": AlphaVantageTimeSeriesData
}

export interface AlphaCommodityData {
  name: string
  interval: string
  unit: string
  data: {
    date: string
    value: string
  }[]
}

/**
 * Fetch daily time series data for stocks/ETFs
 * @param symbol Stock symbol (e.g., "GLD" for Gold ETF)
 * @param outputsize "compact" (last 100 data points) or "full" (20+ years)
 */
export async function fetchDailyTimeSeries(
  symbol: string,
  outputsize: "compact" | "full" = "compact",
): Promise<AlphaVantageResponse> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("ALPHA_VANTAGE_API_KEY environment variable is not set")
  }

  const url = `${ALPHA_VANTAGE_API_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_API_KEY}`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`Alpha Vantage API request failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data["Error Message"]) {
    throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
  }

  if (data["Note"]) {
    throw new Error(`Alpha Vantage API rate limit: ${data["Note"]}. Free tier allows 25 requests per day.`)
  }

  return data
}

/**
 * Fetch commodity data (WTI Crude Oil, Brent Crude Oil)
 * @param commodity "WTI" or "BRENT"
 * @param interval "monthly", "quarterly", or "annual"
 */
export async function fetchCommodityData(
  commodity: "WTI" | "BRENT",
  interval: "monthly" | "quarterly" | "annual" = "monthly",
): Promise<AlphaCommodityData> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("ALPHA_VANTAGE_API_KEY environment variable is not set")
  }

  const url = `${ALPHA_VANTAGE_API_BASE}?function=${commodity}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  })

  if (!response.ok) {
    throw new Error(`Alpha Vantage API request failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data["Error Message"]) {
    throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
  }

  if (data["Note"]) {
    throw new Error(`Alpha Vantage API rate limit: ${data["Note"]}. Free tier allows 25 requests per day.`)
  }

  return data
}

/**
 * Common symbols for precious metals and commodities via ETFs
 */
export const COMMODITY_SYMBOLS = {
  // Precious Metals ETFs
  GOLD: "GLD", // SPDR Gold Shares
  SILVER: "SLV", // iShares Silver Trust
  PLATINUM: "PPLT", // Aberdeen Standard Physical Platinum Shares ETF
  PALLADIUM: "PALL", // Aberdeen Standard Physical Palladium Shares ETF

  // Commodities ETFs
  OIL: "USO", // United States Oil Fund
  NATURAL_GAS: "UNG", // United States Natural Gas Fund
  COPPER: "CPER", // United States Copper Index Fund

  // Broad Commodity Index
  DBC: "DBC", // Invesco DB Commodity Index Tracking Fund

  // Stock Indices
  SP500: "SPY", // SPDR S&P 500 ETF
  NASDAQ: "QQQ", // Invesco QQQ Trust (NASDAQ-100)
}

/**
 * Fetch precious metals data using ETF symbols
 * For more accurate spot prices, consider using a dedicated metals API
 */
export async function fetchPreciousMetalsData(
  metals: Array<keyof typeof COMMODITY_SYMBOLS> = ["GOLD", "SILVER"],
  outputsize: "compact" | "full" = "full",
): Promise<Record<string, AlphaVantageResponse>> {
  const promises = metals.map((metal) => fetchDailyTimeSeries(COMMODITY_SYMBOLS[metal], outputsize))

  const results = await Promise.all(promises)

  const data: Record<string, AlphaVantageResponse> = {}
  metals.forEach((metal, index) => {
    data[metal] = results[index]
  })

  return data
}

/**
 * Fetch oil prices (WTI and Brent)
 */
export async function fetchOilPrices(): Promise<{
  wti: AlphaCommodityData
  brent: AlphaCommodityData
}> {
  const [wti, brent] = await Promise.all([fetchCommodityData("WTI", "monthly"), fetchCommodityData("BRENT", "monthly")])

  return { wti, brent }
}

/**
 * Get current commodity/ETF price for the Deflation Calculator
 * @param symbol Stock/ETF symbol (GLD, SLV, USO, etc.)
 * @returns Latest closing price or null if unavailable
 */
export async function getCommodityPrice(symbol: string): Promise<number | null> {
  try {
    const data = await fetchDailyTimeSeries(symbol, "compact")

    if (!data["Time Series (Daily)"]) {
      console.error(`No time series data available for ${symbol}`)
      return null
    }

    // Get the most recent date's closing price
    const dates = Object.keys(data["Time Series (Daily)"])
    if (dates.length === 0) {
      return null
    }

    const latestDate = dates[0] // Dates are already sorted by API
    const latestData = data["Time Series (Daily)"][latestDate]

    return Number.parseFloat(latestData["4. close"])
  } catch (error) {
    console.error(`Failed to fetch ${symbol} price:`, error)
    return null
  }
}
