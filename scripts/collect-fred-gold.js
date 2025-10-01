import fetch from "node-fetch"

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

async function collectGoldData() {
  try {
    console.log("[v0] Starting gold price data collection...")

    const seriesId = "IQ12260"

    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`

    console.log("[v0] Fetching gold data from FRED API...")
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Raw FRED response received")

    if (!data.observations || data.observations.length === 0) {
      throw new Error("No gold price data found in FRED response")
    }

    // Transform data to our standard format
    const transformedData = data.observations
      .filter((obs) => obs.value !== "." && obs.value !== null)
      .map((obs) => ({
        date: obs.date,
        value: Number.parseFloat(obs.value),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    console.log("[v0] Transformed gold data:", transformedData.length, "records")

    const goldData = {
      metadata: {
        title: "Gold Prices (Export Price Index)",
        description: "Monthly export price index for nonmonetary gold (Index 2000=100)",
        source: "Federal Reserve Economic Data (FRED) / U.S. Bureau of Labor Statistics",
        series_id: seriesId,
        units: "Index 2000=100",
        frequency: "Monthly",
        last_updated: new Date().toISOString(),
        start_date: "1984-12",
        notes:
          "Export Price Index for Nonmonetary Gold. Gold's finite supply and mining difficulty make it a classic deflationary store of value. Data available from December 1984.",
      },
      data: transformedData,
    }

    // Write to file
    const fs = await import("fs")
    const path = await import("path")

    const outputPath = path.join(process.cwd(), "public", "data", "gold-prices.json")
    fs.writeFileSync(outputPath, JSON.stringify(goldData, null, 2))

    console.log("[v0] Gold price data saved to:", outputPath)
    console.log("[v0] Data range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)
    console.log("[v0] Total records:", transformedData.length)
  } catch (error) {
    console.error("[v0] Error collecting gold data:", error.message)
    throw error
  }
}

collectGoldData()
