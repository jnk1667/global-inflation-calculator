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

    console.log("[v0] Fetching DKK CPI data from Statistics Denmark...")

    // Fetch CPI data from Statistics Denmark (DST) API
    // Using PRIS9 table - Consumer Price Index
    const response = await fetch("https://api.statbank.dk/v1/data/PRIS9/JSONSTAT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table: "PRIS9",
        format: "JSONSTAT",
        variables: [
          {
            code: "INDHOLD",
            values: ["*"],
          },
          {
            code: "Tid",
            values: ["*"],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`DST API error: ${response.status}`)
    }

    const rawData = await response.json()
    console.log("[v0] Raw DST data received")

    // Process the data into our format
    const cpiData: { [year: string]: number } = {}

    // Extract CPI values by year from the JSONSTAT format
    // The DST API returns data in a specific format that needs parsing
    if (rawData.value && rawData.dimension?.Tid?.category?.index) {
      const timeIndex = rawData.dimension.Tid.category.index
      const values = rawData.value

      Object.entries(timeIndex).forEach(([timeKey, index]) => {
        // Extract year from time key (format: "2024M01" or "2024")
        const year = timeKey.substring(0, 4)
        const value = values[index as number]

        if (value && !isNaN(Number(year))) {
          // Average monthly values for each year
          if (!cpiData[year]) {
            cpiData[year] = value
          } else {
            cpiData[year] = (cpiData[year] + value) / 2
          }
        }
      })
    }

    // Normalize to base year (earliest year = 1.0)
    const years = Object.keys(cpiData).sort()
    const baseValue = cpiData[years[0]] || 100

    const normalizedData: { [year: string]: number } = {}
    years.forEach((year) => {
      normalizedData[year] = Number((cpiData[year] / baseValue).toFixed(2))
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

    console.log("[v0] DKK data processed successfully")

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
