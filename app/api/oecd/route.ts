import { NextRequest, NextResponse } from "next/server"
import {
  fetchOECDInflation,
  fetchOECDPPP,
  fetchOECDWages,
  fetchOECDUnemployment,
  fetchAllOECDIndicators,
  OECD_SUPPORTED_COUNTRIES,
  type OECDCountryCode,
} from "@/lib/api/oecd-api"

/**
 * GET /api/oecd
 *
 * Query params:
 *   dataset   = cpi | ppp | wages | unemployment | all  (default: all)
 *   countries = comma-separated OECD codes, e.g. USA,GBR,JPN  (default: all 8)
 *   startYear = YYYY  (default: 2010)
 *   endYear   = YYYY  (default: current year)
 *
 * Examples:
 *   /api/oecd
 *   /api/oecd?dataset=cpi&countries=USA,GBR&startYear=2015
 *   /api/oecd?dataset=ppp&startYear=2000&endYear=2023
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const dataset = (searchParams.get("dataset") ?? "all").toLowerCase()
  const countriesParam = searchParams.get("countries")
  const startYear = parseInt(searchParams.get("startYear") ?? "2010", 10)
  const endYear = parseInt(searchParams.get("endYear") ?? String(new Date().getFullYear()), 10)

  // Validate year range
  if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) {
    return NextResponse.json(
      { error: "Invalid startYear or endYear parameters." },
      { status: 400 },
    )
  }

  // Parse and validate country codes
  const validCodes = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[]
  let countries: OECDCountryCode[]

  if (countriesParam) {
    const requested = countriesParam.toUpperCase().split(",").map((c) => c.trim()) as OECDCountryCode[]
    const invalid = requested.filter((c) => !validCodes.includes(c))
    if (invalid.length) {
      return NextResponse.json(
        {
          error: `Unsupported country code(s): ${invalid.join(", ")}. Supported: ${validCodes.join(", ")}`,
        },
        { status: 400 },
      )
    }
    countries = requested
  } else {
    countries = validCodes
  }

  try {
    let data: unknown

    switch (dataset) {
      case "cpi":
      case "inflation":
        data = await fetchOECDInflation(countries, startYear, endYear)
        break
      case "ppp":
        data = await fetchOECDPPP(countries, startYear, endYear)
        break
      case "wages":
        data = await fetchOECDWages(countries, startYear, endYear)
        break
      case "unemployment":
        data = await fetchOECDUnemployment(countries, startYear, endYear)
        break
      case "all":
        data = await fetchAllOECDIndicators(countries, startYear, endYear)
        break
      default:
        return NextResponse.json(
          {
            error: `Unknown dataset "${dataset}". Valid options: cpi, ppp, wages, unemployment, all`,
          },
          { status: 400 },
        )
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[OECD API Route]", message)
    return NextResponse.json(
      { error: `Failed to fetch OECD data: ${message}` },
      { status: 502 },
    )
  }
}
