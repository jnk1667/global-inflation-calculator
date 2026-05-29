/**
 * Commodities API — all calls route through /api/commodity-price to avoid CORS.
 * The proxy handles:
 *   - Gold (XAU), Silver (XAG), Platinum (XPT): api.gold-api.com, spot price USD/troy oz
 *   - Crude Oil (OIL): Yahoo Finance CL=F WTI futures, USD/barrel
 */

type MetalSymbol = "XAU" | "XAG" | "XPT"

async function fetchFromProxy(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/commodity-price?symbol=${symbol}`)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.price === "number" ? data.price : null
  } catch {
    return null
  }
}

/**
 * Fetch live spot price for Gold (XAU), Silver (XAG), or Platinum (XPT)
 * Returns price in USD per troy ounce
 */
export async function getMetalSpotPrice(symbol: MetalSymbol): Promise<number | null> {
  return fetchFromProxy(symbol)
}

/**
 * Fetch live WTI crude oil price (CL=F futures)
 * Returns price in USD per barrel
 */
export async function getCrudeOilPrice(): Promise<number | null> {
  return fetchFromProxy("OIL")
}
