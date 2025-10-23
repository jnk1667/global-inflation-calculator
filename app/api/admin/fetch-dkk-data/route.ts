import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] DKK data fetch API called")

    const body = await request.json()
    const { password } = body

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      console.log("[v0] Unauthorized - password mismatch")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching DKK CPI data from Statistics Denmark (DST)...")

    // Step 1: Get table metadata to understand structure
    const metadataResponse = await fetch("https://api.statbank.dk/v1/tableinfo/PRIS9", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: "en" }),
    })

    if (!metadataResponse.ok) {
      throw new Error(`DST metadata API error: ${metadataResponse.status}`)
    }

    const metadata = await metadataResponse.json()
    console.log("[v0] DST metadata received for table PRIS9")

    // Step 2: Request CPI data (total index)
    const dataRequest = {
      table: "PRIS9",
      lang: "en",
      format: "JSONSTAT",
      variables: [
        {
          code: "PRISENHED",
          values: ["TOT"], // Total CPI
        },
        {
          code: "Tid",
          values: ["*"], // All time periods
        },
      ],
    }

    console.log("[v0] Requesting CPI data from DST...")
    const dataResponse = await fetch("https://api.statbank.dk/v1/data/PRIS9/JSONSTAT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataRequest),
    })

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text()
      console.error("[v0] DST data API error:", errorText)
      throw new Error(`DST data API error: ${dataResponse.status}`)
    }

    const rawData = await dataResponse.json()
    console.log("[v0] Raw DST data received")

    // Process JSON-stat format
    const cpiData: { [year: string]: number[] } = {}

    if (rawData.dataset && rawData.dataset.dimension && rawData.dataset.value) {
      const timeValues = rawData.dataset.dimension.Tid.category.index
      const dataValues = rawData.dataset.value

      Object.entries(timeValues).forEach(([timeLabel, index]: [string, any]) => {
        const value = dataValues[index]
        if (value !== null && value !== undefined) {
          // Extract year from time label (format varies: "2024M01" or "2024Q1" or "2024")
          const year = timeLabel.substring(0, 4)
          if (!isNaN(Number(year))) {
            if (!cpiData[year]) {
              cpiData[year] = []
            }
            cpiData[year].push(Number(value))
          }
        }
      })
    }

    console.log("[v0] Years found:", Object.keys(cpiData).length)

    // Average values for each year
    const yearlyData: { [year: string]: number } = {}
    Object.entries(cpiData).forEach(([year, values]) => {
      yearlyData[year] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    // Normalize to base year
    const years = Object.keys(yearlyData).sort()
    if (years.length === 0) {
      throw new Error("No data found in DST response")
    }

    const baseValue = yearlyData[years[0]] || 100
    const normalizedData: { [year: string]: number } = {}
    years.forEach((year) => {
      normalizedData[year] = Number((yearlyData[year] / baseValue).toFixed(2))
    })

    const dkkData = {
      currency: "DKK",
      symbol: "kr",
      name: "Danish Krone",
      flag: "🇩🇰",
      earliest: Number.parseInt(years[0]),
      latest: Number.parseInt(years[years.length - 1]),
      lastUpdated: new Date().toISOString(),
      source: "Statistics Denmark (DST)",
      data: normalizedData,
    }

    console.log("[v0] DKK data processed successfully:", Object.keys(normalizedData).length, "years")

    return NextResponse.json({
      success: true,
      message: "DKK data fetched successfully from Statistics Denmark",
      file: "dkk-inflation.json",
      data: dkkData,
      recordCount: Object.keys(normalizedData).length,
      yearRange: `${years[0]}-${years[years.length - 1]}`,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching DKK data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch DKK data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
