import fetch from "node-fetch"

async function collectEthereumData() {
  try {
    console.log("[v0] Starting Ethereum price data collection...")

    // CoinGecko API - no key required for historical data
    const url = "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=max&interval=monthly"

    console.log("[v0] Fetching Ethereum data from CoinGecko API...")
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Raw CoinGecko response received")

    if (!data.prices || data.prices.length === 0) {
      throw new Error("No Ethereum price data found in CoinGecko response")
    }

    // Transform data to our standard format
    const transformedData = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split("T")[0], // Convert to YYYY-MM-DD
      value: Number.parseFloat(price.toFixed(2)),
    }))

    console.log("[v0] Transformed Ethereum data:", transformedData.length, "records")

    const ethereumData = {
      metadata: {
        title: "Ethereum Prices (USD)",
        description: "Monthly Ethereum prices in U.S. Dollars, showing deflationary effects of EIP-1559 fee burning",
        source: "CoinGecko API",
        units: "U.S. Dollars per Ethereum",
        frequency: "Monthly",
        last_updated: new Date().toISOString(),
        notes:
          "Ethereum became deflationary after EIP-1559 (Aug 2021) which burns ETH with each transaction. During high network activity, more ETH is burned than created.",
      },
      data: transformedData,
    }

    // Write to file
    const fs = await import("fs")
    const path = await import("path")

    const outputPath = path.join(process.cwd(), "public", "data", "ethereum-prices.json")
    fs.writeFileSync(outputPath, JSON.stringify(ethereumData, null, 2))

    console.log("[v0] Ethereum price data saved to:", outputPath)
    console.log("[v0] Data range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)
    console.log("[v0] Latest Ethereum price: $", transformedData[transformedData.length - 1]?.value)
  } catch (error) {
    console.error("[v0] Error collecting Ethereum data:", error.message)
    throw error
  }
}

collectEthereumData()
