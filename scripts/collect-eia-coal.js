// Collect Coal Prices from EIA API
import fs from "fs"

const EIA_API_KEY = "Fo9zuBRFIBUDkFW5H5iCPLQmOYwe1RiZj5qMcdzQ"
const EIA_BASE_URL = "https://api.eia.gov/v2"

async function collectCoalData() {
  try {
    console.log("[v0] Fetching Coal prices from EIA...")

    // Coal Mining Productivity - Quarterly (closest to price data available)
    const response = await fetch(
      `${EIA_BASE_URL}/coal/data/?api_key=${EIA_API_KEY}&frequency=quarterly&data[0]=value&facets[series][]=COALPRODUS&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=5000`,
    )

    if (!response.ok) {
      throw new Error(`EIA API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Processing", data.response?.data?.length || 0, "coal data points")

    if (!data.response || !data.response.data) {
      throw new Error("Invalid EIA API response structure")
    }

    // Transform data to match our format
    const transformedData = data.response.data
      .map((item) => ({
        date: item.period,
        value: Number.parseFloat(item.value),
        year: Number.parseInt(item.period.split("-")[0]),
        quarter: Number.parseInt(item.period.split("-")[1].replace("Q", "")),
      }))
      .filter((item) => !isNaN(item.value))

    // Sort by date
    transformedData.sort((a, b) => new Date(a.date) - new Date(b.date))

    console.log("[v0] Date range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)

    // Save to file
    const outputData = {
      metadata: {
        source: "U.S. Energy Information Administration (EIA)",
        series: "COALPRODUS - U.S. Coal Mining Productivity",
        unit: "Short Tons per Miner per Hour",
        frequency: "Quarterly",
        last_updated: new Date().toISOString(),
        description: "U.S. coal mining productivity - indicator of coal extraction efficiency and costs",
      },
      data: transformedData,
    }

    fs.writeFileSync("public/data/coal-productivity.json", JSON.stringify(outputData, null, 2))
    console.log("[v0] Saved coal data to public/data/coal-productivity.json")
  } catch (error) {
    console.error("[v0] Error collecting coal data:", error)
  }
}

collectCoalData()
