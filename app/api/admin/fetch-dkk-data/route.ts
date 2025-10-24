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

    // Based on working example: https://api.statbank.dk/v1/data/PRIS111/JSONSTAT?lang=en&VAREGR=000000&ENHED=300&Tid=(-n%2B60)
    const apiUrl = "https://api.statbank.dk/v1/data/PRIS111/JSONSTAT?lang=en&VAREGR=000000&ENHED=300&Tid=*"
    console.log("[v0] Requesting data from:", apiUrl)

    const dataResponse = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    console.log("[v0] DST response status:", dataResponse.status)
    console.log("[v0] DST response headers:", Object.fromEntries(dataResponse.headers.entries()))

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text()
      console.error("[v0] DST data API error response:", errorText)
      return NextResponse.json(
        {
          error: "Failed to fetch DKK data",
          details: `DST API returned status ${dataResponse.status}`,
          apiStatus: dataResponse.status,
          apiResponse: errorText ? errorText.substring(0, 500) : "No response text",
          endpoint: apiUrl,
        },
        { status: 500 },
      )
    }

    const rawData = await dataResponse.json()
    console.log("[v0] Raw DST data structure keys:", Object.keys(rawData))
    console.log("[v0] Raw DST data preview:", JSON.stringify(rawData, null, 2).substring(0, 1000) + "...")

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
          // Extract year from time label (format: "2024M01" or "2024Q1" or "2024")
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
      throw new Error("Unexpected data structure from DST API")
    }

    console.log("[v0] Years found:", Object.keys(cpiData).length)
    const sortedYears = Object.keys(cpiData).sort()
    console.log("[v0] Year range:", sortedYears[0], "to", sortedYears[sortedYears.length - 1])

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
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to fetch DKK data",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined,
      },
      { status: 500 },
    )
  }
}
