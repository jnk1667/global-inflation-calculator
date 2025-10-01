// Collect WTI Crude Oil Spot Prices from EIA API
import fs from "fs"

const EIA_API_KEY = "Fo9zuBRFIBUDkFW5H5iCPLQmOYwe1RiZj5qMcdzQ"
const EIA_BASE_URL = "https://api.eia.gov/v2"

async function collectCrudeOilData() {
  try {
    console.log("[v0] Fetching WTI Crude Oil spot prices from EIA...")

    // WTI Crude Oil Spot Price (Cushing, OK) - Monthly
    const response = await fetch(
      `${EIA_BASE_URL}/petroleum/pri/spt/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=5000`,
    )

    if (!response.ok) {
      throw new Error(`EIA API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Raw EIA response:", JSON.stringify(data, null, 2))

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

    console.log("[v0] Processed", transformedData.length, "crude oil data points")
    console.log("[v0] Date range:", transformedData[0]?.date, "to", transformedData[transformedData.length - 1]?.date)

    // Save to file
    const outputData = {
      metadata: {
        source: "U.S. Energy Information Administration (EIA)",
        series: "RWTC - Cushing, OK WTI Spot Price FOB",
        unit: "Dollars per Barrel",
        frequency: "Monthly",
        last_updated: new Date().toISOString(),
        start_date: "1986-01",
        description:
          "West Texas Intermediate (WTI) crude oil spot prices at Cushing, Oklahoma. Data available from January 1986.",
        notes:
          "Crude oil is a finite resource with depleting reserves, making it a deflationary commodity over the long term as extraction becomes more difficult and expensive.",
      },
      data: transformedData,
    }

    fs.writeFileSync("public/data/crude-oil-prices.json", JSON.stringify(outputData, null, 2))
    console.log("[v0] Saved crude oil data to public/data/crude-oil-prices.json")
  } catch (error) {
    console.error("[v0] Error collecting crude oil data:", error)
  }
}

collectCrudeOilData()
