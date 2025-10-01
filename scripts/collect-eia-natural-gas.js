// Collect Natural Gas Prices from EIA API
import fs from "fs"

const EIA_API_KEY = "Fo9zuBRFIBUDkFW5H5iCPLQmOYwe1RiZj5qMcdzQ"
const EIA_BASE_URL = "https://api.eia.gov/v2"

async function collectNaturalGasData() {
  try {
    console.log("[v0] Fetching Natural Gas prices from EIA...")

    // Natural Gas Wellhead Price - Monthly
    const response = await fetch(
      `${EIA_BASE_URL}/natural-gas/pri/sum/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=value&facets[series][]=N9190US3&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=5000`,
    )

    if (!response.ok) {
      throw new Error(`EIA API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Processing", data.response?.data?.length || 0, "natural gas data points")

    if (!data.response || !data.response.data) {
      throw new Error("Invalid EIA API response structure")
    }

    // Transform data to match our format
    const transformedData = data.response.data
      .map((item) => ({
        date: item.period,
        value: Number.parseFloat(item.value),
        year: Number.parseInt(item.period.split("-")[0]),
        month: Number.parseInt(item.period.split("-")[1]),
      }))
      .filter((item) => !isNaN(item.value))

    // Sort by date
    transformedData.sort((a, b) => new Date(a.date) - new Date(b.date))

    console.log("[v0] Date range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)

    // Save to file
    const outputData = {
      metadata: {
        source: "U.S. Energy Information Administration (EIA)",
        series: "N9190US3 - U.S. Natural Gas Wellhead Price",
        unit: "Dollars per Thousand Cubic Feet",
        frequency: "Monthly",
        last_updated: new Date().toISOString(),
        description: "U.S. natural gas wellhead prices - the price at which natural gas is sold at the wellhead",
      },
      data: transformedData,
    }

    fs.writeFileSync("public/data/natural-gas-prices.json", JSON.stringify(outputData, null, 2))
    console.log("[v0] Saved natural gas data to public/data/natural-gas-prices.json")
  } catch (error) {
    console.error("[v0] Error collecting natural gas data:", error)
  }
}

collectNaturalGasData()
