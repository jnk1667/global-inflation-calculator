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

    console.log("[v0] Fetching SEK CPI data from Statistics Sweden (SCB)...")

    // Use PxWebApi to fetch CPI data (KPItotM table)
    const dataRequest = {
      query: [
        {
          code: "ContentsCode",
          selection: {
            filter: "item",
            values: ["000004VU"], // CPI total index
          },
        },
        {
          code: "Tid",
          selection: {
            filter: "all",
            values: ["*"], // All time periods
          },
        },
      ],
      response: {
        format: "json",
      },
    }

    console.log("[v0] Requesting CPI data from SCB with payload:", JSON.stringify(dataRequest, null, 2))
    const dataResponse = await fetch("https://api.scb.se/OV0104/v1/doris/en/ssd/START/PR/PR0101/PR0101A/KPItotM", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataRequest),
    })

    console.log("[v0] SCB response status:", dataResponse.status)
    console.log("[v0] SCB response headers:", Object.fromEntries(dataResponse.headers.entries()))

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text()
      console.error("[v0] SCB data API error response:", errorText)
      return NextResponse.json(
        {
          error: "Failed to fetch SEK data",
          details: `SCB API returned status ${dataResponse.status}`,
          apiStatus: dataResponse.status,
          apiResponse: errorText.substring(0, 500),
          endpoint: "https://api.scb.se/OV0104/v1/doris/en/ssd/START/PR/PR0101/PR0101A/KPItotM",
          requestPayload: dataRequest,
        },
        { status: 500 },
      )
    }

    const rawData = await dataResponse.json()
    console.log("[v0] Raw SCB data structure:", JSON.stringify(rawData, null, 2).substring(0, 1000) + "...")
    console.log("[v0] SCB data records:", rawData.data?.length)

    // Process SCB JSON format
    const cpiData: { [year: string]: number[] } = {}

    if (rawData.data && Array.isArray(rawData.data)) {
      console.log("[v0] Processing SCB JSON format data...")
      console.log("[v0] First data item structure:", JSON.stringify(rawData.data[0], null, 2))

      rawData.data.forEach((item: any, index: number) => {
        if (item.key && item.values && item.values[0]) {
          const timeKey = item.key[1]
          const year = timeKey.substring(0, 4)
          const value = Number.parseFloat(item.values[0])

          if (index < 3) {
            console.log(`[v0] Processing item ${index}: timeKey=${timeKey}, year=${year}, value=${value}`)
          }

          if (!isNaN(value) && !isNaN(Number(year))) {
            if (!cpiData[year]) {
              cpiData[year] = []
            }
            cpiData[year].push(value)
          }
        }
      })
    } else {
      console.error("[v0] Unexpected data structure. Keys:", Object.keys(rawData))
      throw new Error("Unexpected data structure from SCB API")
    }

    console.log("[v0] Years found:", Object.keys(cpiData).length)
    console.log("[v0] Year range:", Object.keys(cpiData).sort()[0], "to", Object.keys(cpiData).sort().pop())

    // Average monthly values for each year
    const yearlyData: { [year: string]: number } = {}
    Object.entries(cpiData).forEach(([year, values]) => {
      yearlyData[year] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    // Normalize to base year
    const years = Object.keys(yearlyData).sort()
    if (years.length === 0) {
      throw new Error("No data found in SCB response")
    }

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

    console.log("[v0] SEK data processed successfully:", Object.keys(normalizedData).length, "years")

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
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to fetch SEK data",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined,
      },
      { status: 500 },
    )
  }
}
