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

    console.log("[v0] Fetching PLN CPI data from Statistics Poland...")

    // Fetch CPI data from Statistics Poland (GUS) via BDL API
    // Using CPI indicator from the Local Data Bank
    const response = await fetch("https://bdl.stat.gov.pl/api/v1/data/by-variable/1?format=json&year=1990-2025", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`GUS API error: ${response.status}`)
    }

    const rawData = await response.json()
    console.log("[v0] Raw GUS data received")

    // Process the data into our format
    const cpiData: { [year: string]: number } = {}

    if (rawData.results && Array.isArray(rawData.results)) {
      rawData.results.forEach((item: any) => {
        if (item.year && item.val) {
          const year = item.year.toString()
          const value = Number.parseFloat(item.val)

          if (!isNaN(value) && !isNaN(Number(year))) {
            cpiData[year] = value
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

    console.log("[v0] PLN data processed successfully")

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
