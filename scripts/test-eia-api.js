// Test EIA API access and explore available energy data
const EIA_API_KEY = "Fo9zuBRFIBUDkFW5H5iCPLQmOYwe1RiZj5qMcdzQ"
const EIA_BASE_URL = "https://api.eia.gov/v2"

async function testEIAAPI() {
  console.log("[v0] Testing EIA API access...")

  try {
    // Test 1: Get crude oil prices (WTI)
    console.log("\n[v0] Testing Crude Oil Prices (WTI)...")
    const oilResponse = await fetch(
      `${EIA_BASE_URL}/petroleum/pri/spt/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=100`,
    )

    if (oilResponse.ok) {
      const oilData = await oilResponse.json()
      console.log("[v0] ✅ Crude Oil API works!")
      console.log("[v0] Sample data points:", oilData.response?.data?.slice(0, 3))
      console.log("[v0] Total records available:", oilData.response?.total)
    } else {
      console.log("[v0] ❌ Crude Oil API failed:", oilResponse.status)
    }

    // Test 2: Get natural gas prices
    console.log("\n[v0] Testing Natural Gas Prices...")
    const gasResponse = await fetch(
      `${EIA_BASE_URL}/natural-gas/pri/sum/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=value&facets[series][]=RNGWHHD&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=50`,
    )

    if (gasResponse.ok) {
      const gasData = await gasResponse.json()
      console.log("[v0] ✅ Natural Gas API works!")
      console.log("[v0] Sample data points:", gasData.response?.data?.slice(0, 3))
    } else {
      console.log("[v0] ❌ Natural Gas API failed:", gasResponse.status)
    }

    // Test 3: Get electricity data
    console.log("\n[v0] Testing Electricity Generation...")
    const electricityResponse = await fetch(
      `${EIA_BASE_URL}/electricity/rto/fuel-type-data/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=value&facets[respondent][]=US48&facets[fueltype][]=COL&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=50`,
    )

    if (electricityResponse.ok) {
      const electricityData = await electricityResponse.json()
      console.log("[v0] ✅ Electricity API works!")
      console.log("[v0] Sample data points:", electricityData.response?.data?.slice(0, 3))
    } else {
      console.log("[v0] ❌ Electricity API failed:", electricityResponse.status)
    }

    // Test 4: Explore available series for petroleum
    console.log("\n[v0] Exploring available petroleum series...")
    const seriesResponse = await fetch(
      `${EIA_BASE_URL}/petroleum/pri/spt/data/?api_key=${EIA_API_KEY}&frequency=monthly&facets[series][]=RWTC&facets[series][]=RBRTE&facets[series][]=RCLC1&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=10`,
    )

    if (seriesResponse.ok) {
      const seriesData = await seriesResponse.json()
      console.log("[v0] ✅ Multiple petroleum series work!")
      console.log("[v0] Available series in response:", [
        ...new Set(seriesData.response?.data?.map((d) => d.series) || []),
      ])
    }

    // Test 5: Get coal data
    console.log("\n[v0] Testing Coal Prices...")
    const coalResponse = await fetch(
      `${EIA_BASE_URL}/coal/data/?api_key=${EIA_API_KEY}&frequency=quarterly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=20`,
    )

    if (coalResponse.ok) {
      const coalData = await coalResponse.json()
      console.log("[v0] ✅ Coal API works!")
      console.log("[v0] Sample data points:", coalData.response?.data?.slice(0, 3))
    } else {
      console.log("[v0] ❌ Coal API failed:", coalResponse.status)
    }
  } catch (error) {
    console.error("[v0] API test failed:", error.message)
  }
}

// Run the test
testEIAAPI()
