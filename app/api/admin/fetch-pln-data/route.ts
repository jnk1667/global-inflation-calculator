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

    // Use BDL API to fetch CPI data (variable 1738 = CPI total)
    // Format: https://bdl.stat.gov.pl/api/v1/data/by-variable/{variable-id}?format=json
    const dataResponse = await fetch(
      "https://bdl.stat.gov.pl/api/v1/data/by-variable/1738?format=json&year=1990-2025",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text()
      console.error("[v0] GUS data API error:", errorText)
      throw new Error(`GUS data API error: ${dataResponse.status}`)
    }

    const rawData = await dataResponse.json()
    console.log("[v0] Raw GUS data received:", rawData.results?.length, "records")

    // Process GUS BDL format
    const yearlyData: { [year: string]: number } = {}

    if (rawData.results && Array.isArray(rawData.results)) {
      rawData.results.forEach((item: any) => {
        if (item.values && Array.isArray(item.values)) {
          item.values.forEach((yearData: any) => {
            if (yearData.year && yearData.val !== null && yearData.val !== undefined) {
              const year = yearData.year.toString()
              const value = Number.parseFloat(yearData.val)

              if (!isNaN(value) && !isNaN(Number(year))) {
                // GUS provides annual CPI values
                yearlyData[year] = value
              }
            }
          })
        }
      })
    }

    console.log("[v0] Years found:", Object.keys(yearlyData).length)

    // Normalize to base year
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
    return NextResponse.json(
      {
        error: "Failed to fetch PLN data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
