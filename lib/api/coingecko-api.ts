// CoinGecko API client for cryptocurrency price data
// Free tier: 50 calls/min, historical data up to 1 year

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"

export interface CoinGeckoMarketData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  total_volume: number
  price_change_percentage_24h: number
}

export interface CoinGeckoHistoricalPrice {
  prices: [number, number][] // [timestamp, price]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface CoinGeckoHistoryData {
  id: string
  symbol: string
  name: string
  market_data: {
    current_price: Record<string, number>
    market_cap: Record<string, number>
    total_volume: Record<string, number>
  }
}

/**
 * Fetch current market data for specific cryptocurrencies
 * @param coinIds Array of coin IDs (bitcoin, ethereum, etc.)
 * @param vsCurrency Currency to get prices in (usd, eur, gbp, etc.)
 */
export async function fetchCryptoCurrentPrices(coinIds: string[], vsCurrency = "usd"): Promise<CoinGeckoMarketData[]> {
  const ids = coinIds.join(",")
  const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=${vsCurrency}&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false`

  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`CoinGecko API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch historical market chart data for a cryptocurrency
 * @param coinId Coin ID (bitcoin, ethereum, etc.)
 * @param vsCurrency Currency to get prices in
 * @param days Number of days back (1, 7, 14, 30, 90, 180, 365, max)
 */
export async function fetchCryptoHistoricalChart(
  coinId: string,
  vsCurrency = "usd",
  days: number | "max" = 365,
): Promise<CoinGeckoHistoricalPrice> {
  const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`CoinGecko API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch historical price data for a specific date
 * @param coinId Coin ID (bitcoin, ethereum, etc.)
 * @param date Date in DD-MM-YYYY format
 */
export async function fetchCryptoHistoricalDate(coinId: string, date: string): Promise<CoinGeckoHistoryData> {
  const url = `${COINGECKO_API_BASE}/coins/${coinId}/history?date=${date}`

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  })

  if (!response.ok) {
    throw new Error(`CoinGecko API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch historical prices within a date range
 * @param coinId Coin ID (bitcoin, ethereum, etc.)
 * @param vsCurrency Currency to get prices in
 * @param from Unix timestamp (seconds)
 * @param to Unix timestamp (seconds)
 */
export async function fetchCryptoHistoricalRange(
  coinId: string,
  vsCurrency = "usd",
  from: number,
  to: number,
): Promise<CoinGeckoHistoricalPrice> {
  const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart/range?vs_currency=${vsCurrency}&from=${from}&to=${to}`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`CoinGecko API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Common cryptocurrency IDs for deflation calculator
 */
export const CRYPTO_IDS = {
  BITCOIN: "bitcoin",
  ETHEREUM: "ethereum",
  LITECOIN: "litecoin",
  CARDANO: "cardano",
  SOLANA: "solana",
  POLYGON: "matic-network",
  RIPPLE: "ripple",
  DOGECOIN: "dogecoin",
  POLKADOT: "polkadot",
  CHAINLINK: "chainlink",
}

/**
 * Fetch prices for multiple cryptocurrencies in parallel
 */
export async function fetchMultipleCryptoPrices(
  coinIds: string[],
  vsCurrency = "usd",
): Promise<Record<string, CoinGeckoMarketData>> {
  const data = await fetchCryptoCurrentPrices(coinIds, vsCurrency)

  const result: Record<string, CoinGeckoMarketData> = {}
  data.forEach((coin) => {
    result[coin.id] = coin
  })

  return result
}

/**
 * Get historical price data formatted for the Deflation Calculator
 * @param coinId Coin ID (bitcoin, ethereum, etc.)
 * @param days Number of days back (1, 7, 30, 365, max)
 * @returns Array of price data points with timestamps and prices
 */
export async function getCryptoHistoricalPrices(
  coinId: string,
  days: number | "max" = 365,
): Promise<Array<{ timestamp: number; price: number; date: string }>> {
  try {
    const data = await fetchCryptoHistoricalChart(coinId, "usd", days)

    return data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
      date: new Date(timestamp).toISOString().split("T")[0],
    }))
  } catch (error) {
    console.error(`Failed to fetch ${coinId} historical prices:`, error)
    return []
  }
}
