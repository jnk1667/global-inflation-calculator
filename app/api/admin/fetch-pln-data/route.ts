import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] PLN data fetch API called")

    const body = await request.json()
    const { password } = body

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      console.log("[v0] Unauthorized - password mismatch")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching PLN CPI data from Statistics Poland (GUS)...")

    const apiUrl = "https://bdl.stat.gov.pl/api/v1/data/by-variable/1738?format=json&year=1990-2025"
    console.log("[v0] Requesting data from:", apiUrl)

    const dataResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    console.log("[v0] GUS response status:", dataResponse.status)
    console.log("[v0] GUS response headers:", Object.fromEntries(dataResponse.headers.entries()))

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text()
      console.error("[v0] GUS data API error response:", errorText)
      return NextResponse.json(
        {
          error: "Failed to fetch PLN data",
          details: `GUS API returned status ${dataResponse.status}`,
          apiStatus: dataResponse.status,
          apiResponse: errorText.substring(0, 500),
          endpoint: apiUrl,
        },
        { status: 500 },
      )
    }

    const rawData = await dataResponse.json()
    console.log("[v0] Raw GUS data structure:", JSON.stringify(rawData, null, 2).substring(0, 1000) + "...")
    console.log("[v0] GUS results count:", rawData.results?.length)

    const yearlyData: { [year: string]: number } = {}

    if (rawData.results && Array.isArray(rawData.results)) {
      console.log("[v0] Processing GUS BDL format data...")
      console.log("[v0] First result structure:", JSON.stringify(rawData.results[0], null, 2))

      rawData.results.forEach((item: any, resultIndex: number) => {
        if (item.values && Array.isArray(item.values)) {
          console.log(`[v0] Result ${resultIndex} has ${item.values.length} year values`)

          item.values.forEach((yearData: any, valueIndex: number) => {
            if (yearData.year && yearData.val !== null && yearData.val !== undefined) {
              const year = yearData.year.toString()
              const value = Number.parseFloat(yearData.val)

              if (valueIndex < 3) {
                console.log(`[v0] Processing value ${valueIndex}: year=${year}, value=${value}`)
              }

              if (!isNaN(value) && !isNaN(Number(year))) {
                yearlyData[year] = value
              }
            }
          })
        }
      })
    } else {
      console.error("[v0] Unexpected data structure. Keys:", Object.keys(rawData))
      throw new Error("Unexpected data structure from GUS API")
    }

    console.log("[v0] Years found:", Object.keys(yearlyData).length)
    console.log("[v0] Year range:", Object.keys(yearlyData).sort()[0], "to", Object.keys(yearlyData).sort().pop())
    console.log("[v0] Sample data:", Object.entries(yearlyData).slice(0, 5))

    // Process GUS BDL format

    const years = Object.keys(yearlyData).sort()
    if (years.length === 0) {
      throw new Error("No data found in GUS response")
    }

    const baseValue = yearlyData[years[0]] || 100
    const normalizedData: { [year: string]: number } = {}
    years.forEach((year) => {
      normalizedData[year] = Number((yearlyData[year] / baseValue).toFixed(2))
    })

    const plnData = {
      currency: "PLN",
      symbol: "zł",
      name: "Polish Zloty",
      flag: "🇵🇱",
      earliest: Number.parseInt(years[0]),
      latest: Number.parseInt(years[years.length - 1]),
      lastUpdated: new Date().toISOString(),
      source: "Statistics Poland (GUS)",
      data: normalizedData,
    }

    console.log("[v0] PLN data processed successfully:", Object.keys(normalizedData).length, "years")

    return NextResponse.json({
      success: true,
      message: "PLN data fetched successfully from Statistics Poland",
      file: "pln-inflation.json",
      data: plnData,
      recordCount: Object.keys(normalizedData).length,
      yearRange: `${years[0]}-${years[years.length - 1]}`,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching PLN data:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to fetch PLN data",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined,
      },
      { status: 500 },
    )
  }
}
