import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] SEK data fetch API called")

    const body = await request.json()
    const { password } = body

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      console.log("[v0] Unauthorized - password mismatch")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching SEK CPI data from Statistics Sweden...")

    // Fetch CPI data from Statistics Sweden (SCB) API
    // Using PR0101 table - Consumer Price Index
    const response = await fetch("https://api.scb.se/OV0104/v1/doris/en/ssd/START/PR/PR0101/PR0101A/KPItotM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: [
          {
            code: "ContentsCode",
            selection: {
              filter: "item",
              values: ["000004VU"],
            },
          },
          {
            code: "Tid",
            selection: {
              filter: "all",
              values: ["*"],
            },
          },
        ],
        response: {
          format: "json",
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`SCB API error: ${response.status}`)
    }

    const rawData = await response.json()
    console.log("[v0] Raw SCB data received")

    // Process the data into our format
    const cpiData: { [year: string]: number[] } = {}

    if (rawData.data && Array.isArray(rawData.data)) {
      rawData.data.forEach((item: any) => {
        if (item.key && item.values) {
          // Extract year from time key (format: "2024M01")
          const timeKey = item.key[1]
          const year = timeKey.substring(0, 4)
          const value = Number.parseFloat(item.values[0])

          if (!isNaN(value) && !isNaN(Number(year))) {
            if (!cpiData[year]) {
              cpiData[year] = []
            }
            cpiData[year].push(value)
          }
        }
      })
    }

    // Average monthly values for each year
    const yearlyData: { [year: string]: number } = {}
    Object.entries(cpiData).forEach(([year, values]) => {
      yearlyData[year] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    // Normalize to base year (earliest year = 1.0)
    const years = Object.keys(yearlyData).sort()
    const baseValue = yearlyData[years[0]] || 100

    const normalizedData: { [year: string]: number } = {}
    years.forEach((year) => {
      normalizedData[year] = Number((yearlyData[year] / baseValue).toFixed(2))
    })

    const sekData = {
      currency: "SEK",
      symbol: "kr",
      name: "Swedish Krona",
      flag: "🇸🇪",
      earliest: Number.parseInt(years[0]),
      latest: Number.parseInt(years[years.length - 1]),
      lastUpdated: new Date().toISOString(),
      source: "Statistics Sweden (SCB)",
      data: normalizedData,
    }

    console.log("[v0] SEK data processed successfully")

    return NextResponse.json({
      success: true,
      message: "SEK data fetched successfully from Statistics Sweden",
      file: "sek-inflation.json",
      data: sekData,
      recordCount: Object.keys(normalizedData).length,
      yearRange: `${years[0]}-${years[years.length - 1]}`,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching SEK data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch SEK data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
