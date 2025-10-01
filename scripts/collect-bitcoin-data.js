import fetch from "node-fetch"

async function collectBitcoinData() {
  try {
    console.log("[v0] Starting Bitcoin price data collection...")

    // CoinGecko API - no key required for historical data
    const url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=monthly"

    console.log("[v0] Fetching Bitcoin data from CoinGecko API...")
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Raw CoinGecko response received")

    if (!data.prices || data.prices.length === 0) {
      throw new Error("No Bitcoin price data found in CoinGecko response")
    }

    // Transform data to our standard format
    const transformedData = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split("T")[0], // Convert to YYYY-MM-DD
      value: Number.parseFloat(price.toFixed(2)),
    }))

    console.log("[v0] Transformed Bitcoin data:", transformedData.length, "records")

    const bitcoinData = {
      metadata: {
        title: "Bitcoin Prices (USD)",
        description: "Monthly Bitcoin prices in U.S. Dollars, showing the deflationary nature of the 21M hard cap",
        source: "CoinGecko API",
        units: "U.S. Dollars per Bitcoin",
        frequency: "Monthly",
        last_updated: new Date().toISOString(),
        notes:
          "Bitcoin is deflationary due to: 21M hard cap, halving events every 4 years reducing new supply, and estimated 3-4M lost coins. Next halving: ~2028.",
      },
      data: transformedData,
    }

    // Write to file
    const fs = await import("fs")
    const path = await import("path")

    const outputPath = path.join(process.cwd(), "public", "data", "bitcoin-prices.json")
    fs.writeFileSync(outputPath, JSON.stringify(bitcoinData, null, 2))

    console.log("[v0] Bitcoin price data saved to:", outputPath)
    console.log("[v0] Data range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)
    console.log("[v0] Latest Bitcoin price: $", transformedData[transformedData.length - 1]?.value)
  } catch (error) {
    console.error("[v0] Error collecting Bitcoin data:", error.message)
    throw error
  }
}

collectBitcoinData()
