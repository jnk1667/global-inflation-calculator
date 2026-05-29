import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/commodity-price?symbol=XAU|XAG|XPT|OIL
 * Server-side proxy — avoids CORS restrictions on Yahoo Finance and gold-api.com
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 })
  }

  try {
    // Gold, Silver, Platinum — api.gold-api.com
    if (symbol === "XAU" || symbol === "XAG" || symbol === "XPT") {
      const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
        next: { revalidate: 300 },
      })
      if (!res.ok) throw new Error(`gold-api.com returned ${res.status}`)
      const data = await res.json()
      const price = data?.price
      if (typeof price !== "number") throw new Error("No price in response")
      return NextResponse.json({ price }, { headers: { "Cache-Control": "s-maxage=300" } })
    }

    // Crude Oil — Yahoo Finance CL=F (WTI futures)
    if (symbol === "OIL") {
      const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/CL=F", {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 300 },
      })
      if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`)
      const data = await res.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (typeof price !== "number") throw new Error("No price in response")
      return NextResponse.json({ price }, { headers: { "Cache-Control": "s-maxage=300" } })
    }

    return NextResponse.json({ error: `Unsupported symbol: ${symbol}` }, { status: 400 })
  } catch (err: any) {
    console.error("[commodity-price] fetch error:", err?.message)
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 502 })
  }
}
