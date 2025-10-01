import fetch from "node-fetch"

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

async function collectSilverData() {
  try {
    console.log("[v0] Starting silver price data collection...")

    const seriesId = "IP7106"

    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`

    console.log("[v0] Fetching silver data from FRED API...")
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Raw FRED response received")

    if (!data.observations || data.observations.length === 0) {
      throw new Error("No silver price data found in FRED response")
    }

    // Transform data to our standard format
    const transformedData = data.observations
      .filter((obs) => obs.value !== "." && obs.value !== null)
      .map((obs) => ({
        date: obs.date,
        value: Number.parseFloat(obs.value),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    console.log("[v0] Transformed silver data:", transformedData.length, "records")

    const silverData = {
      metadata: {
        title: "Silver Prices (Import Price Index)",
        description:
          "Monthly import price index for silver unwrought or in semimanufactured forms (Index Dec 2021=100)",
        source: "Federal Reserve Economic Data (FRED) / U.S. Bureau of Labor Statistics",
        series_id: seriesId,
        units: "Index Dec 2021=100",
        frequency: "Monthly",
        last_updated: new Date().toISOString(),
        start_date: "1996-12",
        notes:
          "Import Price Index for Silver (Including Silver Plated with Gold or Platinum), Unwrought or in Semimanufactured Forms. Silver's limited supply and industrial demand make it a deflationary precious metal. Data available from December 1996.",
      },
      data: transformedData,
    }

    // Write to file
    const fs = await import("fs")
    const path = await import("path")

    const outputPath = path.join(process.cwd(), "public", "data", "silver-prices.json")
    fs.writeFileSync(outputPath, JSON.stringify(silverData, null, 2))

    console.log("[v0] Silver price data saved to:", outputPath)
    console.log("[v0] Data range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)
    console.log("[v0] Total records:", transformedData.length)
  } catch (error) {
    console.error("[v0] Error collecting silver data:", error.message)
    throw error
  }
}

collectSilverData()
