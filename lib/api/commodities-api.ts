/**
 * Commodities API
 * - Gold, Silver, Platinum: api.gold-api.com (no API key required, live spot prices)
 * - Crude Oil: Yahoo Finance CL=F WTI futures (no API key required)
 */

type MetalSymbol = "XAU" | "XAG" | "XPT"

interface GoldApiResponse {
  price: number
  name: string
  symbol: string
  updatedAt: string
}

/**
 * Fetch live spot price for Gold (XAU), Silver (XAG), or Platinum (XPT)
 * Returns price in USD per troy ounce
 */
export async function getMetalSpotPrice(symbol: MetalSymbol): Promise<number | null> {
  try {
    const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
      next: { revalidate: 300 }, // cache 5 minutes
    })
    if (!res.ok) return null
    const data: GoldApiResponse = await res.json()
    return data?.price ?? null
  } catch {
    return null
  }
}

/**
 * Fetch live WTI crude oil price via Yahoo Finance (CL=F futures)
 * Returns price in USD per barrel
 */
export async function getCrudeOilPrice(): Promise<number | null> {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/CL=F", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 }, // cache 5 minutes
    })
    if (!res.ok) return null
    const data = await res.json()
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    return typeof price === "number" ? price : null
  } catch {
    return null
  }
}
