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

    const dataRequest = {
      query: [
        {
          code: "Tid",
          selection: {
            filter: "top",
            values: ["100"],
          },
        },
      ],
      response: {
        format: "json-stat",
      },
    }

    console.log("[v0] Requesting CPI data from SCB with payload:", JSON.stringify(dataRequest, null, 2))
    const dataResponse = await fetch("https://api.scb.se/OV0104/v1/doris/en/ssd/START/PR/PR0101/PR0101A/KPI12MNy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataRequest),
    })

    console.log("[v0] SCB response status:", dataResponse.status)
    console.log("[v0] SCB response headers:", Object.fromEntries(dataResponse.headers.entries()))

    const rawText = await dataResponse.text()
    console.log("[v0] SCB raw response (first 500 chars):", rawText.substring(0, 500))

    if (!dataResponse.ok) {
      console.error("[v0] SCB data API error response:", rawText)
      return NextResponse.json(
        {
          error: "Failed to fetch SEK data",
          details: `SCB API returned status ${dataResponse.status}`,
          apiStatus: dataResponse.status,
          apiResponse: rawText ? rawText.substring(0, 500) : "No response text",
          endpoint: "https://api.scb.se/OV0104/v1/doris/en/ssd/START/PR/PR0101/PR0101A/KPI12MNy",
          requestPayload: dataRequest,
        },
        { status: 500 },
      )
    }

    let rawData
    try {
      rawData = JSON.parse(rawText)
    } catch (parseError) {
      console.error("[v0] Failed to parse JSON:", parseError)
      return NextResponse.json(
        {
          error: "Failed to fetch SEK data",
          details: `Invalid JSON response from SCB API`,
          apiStatus: dataResponse.status,
          apiResponse: rawText.substring(0, 500),
          parseError: parseError instanceof Error ? parseError.message : "Unknown parse error",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Raw SCB data structure keys:", Object.keys(rawData))
    console.log("[v0] Raw SCB data preview:", JSON.stringify(rawData, null, 2).substring(0, 1000) + "...")

    const cpiData: { [year: string]: number[] } = {}

    if (rawData.dataset && rawData.dataset.dimension && rawData.dataset.value) {
      console.log("[v0] Processing JSON-stat format data...")
      const timeValues = rawData.dataset.dimension.Tid?.category?.index || {}
      const dataValues = rawData.dataset.value

      console.log("[v0] Time values found:", Object.keys(timeValues).length)
      console.log("[v0] Data values found:", Object.keys(dataValues).length)

      Object.entries(timeValues).forEach(([timeLabel, index]: [string, any]) => {
        const value = dataValues[index]
        if (value !== null && value !== undefined) {
          // Extract year from time label (format: "2024M01")
          const year = timeLabel?.substring(0, 4)
          if (year && !isNaN(Number(year))) {
            if (!cpiData[year]) {
              cpiData[year] = []
            }
            cpiData[year].push(Number(value))
          }
        }
      })
    } else {
      console.error("[v0] Unexpected data structure. Keys:", Object.keys(rawData))
      throw new Error("Unexpected data structure from SCB API")
    }

    console.log("[v0] Years found:", Object.keys(cpiData).length)
    const sortedYears = Object.keys(cpiData).sort()
    console.log("[v0] Year range:", sortedYears[0], "to", sortedYears[sortedYears.length - 1])

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
