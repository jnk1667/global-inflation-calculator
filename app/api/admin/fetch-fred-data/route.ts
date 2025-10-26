import { NextResponse } from "next/server"

// FRED series IDs for inflation data
const FRED_SERIES = {
  DKK: "FPCPITOTLZGDNK", // Inflation, consumer prices for Denmark (annual %)
  SEK: "FPCPITOTLZGSWE", // Inflation, consumer prices for Sweden (annual %)
  PLN: "FPCPITOTLZGPOL", // Inflation, consumer prices for Poland (annual %)
}

export async function POST(request: Request) {
  try {
    console.log("[v0] FRED data fetch API called")

    const body = await request.json()
    const { password, currency } = body

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      console.log("[v0] Unauthorized - password mismatch")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!currency || !FRED_SERIES[currency as keyof typeof FRED_SERIES]) {
      return NextResponse.json({ error: "Invalid currency. Supported: DKK, SEK, PLN" }, { status: 400 })
    }

    const seriesId = FRED_SERIES[currency as keyof typeof FRED_SERIES]
    const apiKey = process.env.FRED_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "FRED API key not configured" }, { status: 500 })
    }

    console.log(`[v0] Fetching ${currency} inflation data from FRED (series: ${seriesId})...`)

    // Fetch data from FRED API
    const apiUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`
    console.log("[v0] Requesting data from FRED API...")

    const dataResponse = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    console.log("[v0] FRED response status:", dataResponse.status)

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text()
      console.error("[v0] FRED API error response:", errorText)
      return NextResponse.json(
        {
          error: "Failed to fetch FRED data",
          details: `FRED API returned status ${dataResponse.status}`,
          apiStatus: dataResponse.status,
          apiResponse: errorText ? errorText.substring(0, 500) : "No response text",
        },
        { status: 500 },
      )
    }

    const rawData = await dataResponse.json()
    console.log("[v0] FRED data structure keys:", Object.keys(rawData))
    console.log("[v0] FRED observations count:", rawData.observations?.length)

    if (!rawData.observations || !Array.isArray(rawData.observations)) {
      throw new Error("Unexpected data structure from FRED API")
    }

    // Process FRED data - convert inflation rates to CPI index
    // FRED provides annual inflation rates, we need to convert to cumulative index
    const inflationRates: { [year: string]: number } = {}

    rawData.observations.forEach((obs: any) => {
      if (obs.value && obs.value !== "." && obs.date) {
        const year = obs.date.substring(0, 4)
        const rate = Number.parseFloat(obs.value)

        if (!isNaN(rate) && !isNaN(Number(year))) {
          inflationRates[year] = rate
        }
      }
    })

    const years = Object.keys(inflationRates).sort()
    if (years.length === 0) {
      throw new Error("No valid data found in FRED response")
    }

    console.log("[v0] Years found:", years.length)
    console.log("[v0] Year range:", years[0], "to", years[years.length - 1])

    // Convert inflation rates to cumulative CPI index (base year = 1.0)
    const cpiData: { [year: string]: number } = {}
    let cumulativeIndex = 1.0

    years.forEach((year) => {
      const inflationRate = inflationRates[year]
      // Apply inflation rate: new_index = old_index * (1 + rate/100)
      cumulativeIndex = cumulativeIndex * (1 + inflationRate / 100)
      cpiData[year] = Number(cumulativeIndex.toFixed(4))
    })

    // Normalize to base year (first year = 1.0)
    const baseValue = cpiData[years[0]]
    const normalizedData: { [year: string]: number } = {}
    years.forEach((year) => {
      normalizedData[year] = Number((cpiData[year] / baseValue).toFixed(2))
    })

    const currencyInfo = {
      DKK: { symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
      SEK: { symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
      PLN: { symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
    }

    const info = currencyInfo[currency as keyof typeof currencyInfo]

    const fredData = {
      currency,
      symbol: info.symbol,
      name: info.name,
      flag: info.flag,
      earliest: Number.parseInt(years[0]),
      latest: Number.parseInt(years[years.length - 1]),
      lastUpdated: new Date().toISOString(),
      source: `FRED (${seriesId})`,
      data: normalizedData,
    }

    console.log("[v0] FRED data processed successfully:", Object.keys(normalizedData).length, "years")

    return NextResponse.json({
      success: true,
      message: `${currency} data fetched successfully from FRED`,
      file: `${currency.toLowerCase()}-inflation-fred.json`,
      data: fredData,
      recordCount: Object.keys(normalizedData).length,
      yearRange: `${years[0]}-${years[years.length - 1]}`,
      lastUpdated: new Date().toISOString(),
      seriesId,
    })
  } catch (error) {
    console.error("[v0] Error fetching FRED data:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to fetch FRED data",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined,
      },
      { status: 500 },
    )
  }
}
