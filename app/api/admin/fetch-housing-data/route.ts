import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify admin password
    const body = await request.json()
    const { password } = body

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const FRED_API_KEY = process.env.FRED_API_KEY

    if (!FRED_API_KEY) {
      return NextResponse.json(
        {
          error: "FRED API key not configured",
          details: "Please add FRED_API_KEY to your environment variables",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Starting housing affordability data fetch...")

    // Fetch Case-Shiller Home Price Index (starts from 1987)
    const caseShillerUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=CSUSHPISA&api_key=${FRED_API_KEY}&file_type=json&observation_start=1987-01-01`

    console.log("[v0] Fetching Case-Shiller data...")
    const caseShillerResponse = await fetch(caseShillerUrl)
    const caseShillerData = await caseShillerResponse.json()

    if (!caseShillerResponse.ok || caseShillerData.error_code) {
      console.error("[v0] Case-Shiller API error:", caseShillerData)
      return NextResponse.json(
        {
          error: "Failed to fetch Case-Shiller data",
          casShillerStatus: caseShillerResponse.status,
          casShillerError: caseShillerData.error_message || "Unknown error",
          details: JSON.stringify(caseShillerData),
        },
        { status: 500 },
      )
    }

    // Fetch Real Median Household Income (annual data)
    const incomeUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=MEHOINUSA672N&api_key=${FRED_API_KEY}&file_type=json&observation_start=1984-01-01`

    console.log("[v0] Fetching median income data...")
    const incomeResponse = await fetch(incomeUrl)
    const incomeData = await incomeResponse.json()

    if (!incomeResponse.ok || incomeData.error_code) {
      console.error("[v0] Income API error:", incomeData)
      return NextResponse.json(
        {
          error: "Failed to fetch median income data",
          incomeStatus: incomeResponse.status,
          incomeError: incomeData.error_message || "Unknown error",
          details: JSON.stringify(incomeData),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Processing data...")

    // Process Case-Shiller data (monthly) - get annual averages
    const caseShillerByYear: { [year: string]: number[] } = {}
    caseShillerData.observations.forEach((obs: any) => {
      if (obs.value !== ".") {
        const year = obs.date.substring(0, 4)
        if (!caseShillerByYear[year]) {
          caseShillerByYear[year] = []
        }
        caseShillerByYear[year].push(Number.parseFloat(obs.value))
      }
    })

    // Calculate annual averages for Case-Shiller
    const caseShillerAnnual: { [year: string]: number } = {}
    Object.keys(caseShillerByYear).forEach((year) => {
      const values = caseShillerByYear[year]
      caseShillerAnnual[year] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    // Process income data (already annual)
    const incomeByYear: { [year: string]: number } = {}
    incomeData.observations.forEach((obs: any) => {
      if (obs.value !== ".") {
        const year = obs.date.substring(0, 4)
        incomeByYear[year] = Number.parseFloat(obs.value)
      }
    })

    // Combine data and calculate price-to-income ratios
    const housingData: any[] = []
    const years = Object.keys(caseShillerAnnual).sort()

    years.forEach((year) => {
      const caseShillerIndex = caseShillerAnnual[year]
      const medianIncome = incomeByYear[year]

      if (caseShillerIndex && medianIncome) {
        // Convert Case-Shiller index to approximate median home price
        // Base year 2000 = 100, approximate median home price in 2000 was $165,000
        const approximateHomePrice = (caseShillerIndex / 100) * 165000

        // Calculate price-to-income ratio
        const priceToIncomeRatio = approximateHomePrice / medianIncome

        housingData.push({
          year: Number.parseInt(year),
          caseShillerIndex: Math.round(caseShillerIndex * 100) / 100,
          medianIncome: Math.round(medianIncome),
          approximateHomePrice: Math.round(approximateHomePrice),
          priceToIncomeRatio: Math.round(priceToIncomeRatio * 100) / 100,
        })
      }
    })

    console.log("[v0] Data processing complete. Records:", housingData.length)

    const result = {
      success: true,
      file: "housing-affordability.json",
      data: housingData,
      recordCount: housingData.length,
      yearRange: `${housingData[0]?.year || "N/A"} - ${housingData[housingData.length - 1]?.year || "N/A"}`,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        casShillerRecords: caseShillerData.observations.length,
        incomeRecords: incomeData.observations.length,
        latestCaseShiller: caseShillerData.observations[caseShillerData.observations.length - 1]?.date || "N/A",
        latestIncome: incomeData.observations[incomeData.observations.length - 1]?.date || "N/A",
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in fetch-housing-data:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
