import { NextRequest, NextResponse } from "next/server"
import {
  fetchIMFInflation,
  fetchIMFGDPGrowth,
  fetchIMFGDPPerCapita,
  fetchIMFGDPPerCapitaPPP,
  fetchIMFUnemployment,
  fetchIMFGovtDebt,
  fetchIMFPPPRate,
  fetchAllIMFIndicators,
  IMF_SUPPORTED_COUNTRIES,
  type IMFCountryCode,
} from "@/lib/api/imf-api"

// ─── Static fallback file map ─────────────────────────────────────────────────
// Real IMF WEO data snapshots stored in /public/data/ — used when the live API
// is unavailable. Updated from actual API responses (October 2025 WEO).
const FALLBACK_FILES: Partial<Record<string, string>> = {
  inflation: "/data/imf-inflation.json",
  "gdp-growth": "/data/imf-gdp-growth.json",
  unemployment: "/data/imf-unemployment.json",
  "ppp-rate": "/data/imf-ppp-rates.json",
}

/**
 * Load a static fallback JSON file from /public/data/ and transform it
 * into the same shape as the live IMF API response.
 */
async function loadIMFFallback(indicator: string, baseUrl: string) {
  const filePath = FALLBACK_FILES[indicator]
  if (!filePath) return null

  try {
    const res = await fetch(`${baseUrl}${filePath}`)
    if (!res.ok) return null
    const json = await res.json()
    // Fallback files store { values: { [INDICATOR]: { [COUNTRY]: { [YEAR]: value } } } }
    // Transform into the same IMFDataResult shape the live API returns
    const indicatorKey = Object.keys(json.values ?? {})[0]
    if (!indicatorKey) return null
    const countryValues = json.values[indicatorKey] as Record<string, Record<string, number>>

    const series = Object.entries(countryValues).map(([country, yearValues]) => {
      const info = IMF_SUPPORTED_COUNTRIES[country as IMFCountryCode]
      const observations: Record<string, { value: number | null }> = {}
      for (const [year, value] of Object.entries(yearValues)) {
        observations[year] = { value: typeof value === "number" ? value : null }
      }
      return {
        country,
        countryName: info?.name ?? country,
        currency: info?.currency ?? "",
        indicator: indicatorKey,
        observations,
      }
    })

    return {
      indicator: indicatorKey,
      indicatorLabel: json._meta?.label ?? indicatorKey,
      countries: Object.keys(countryValues) as IMFCountryCode[],
      series,
      fetchedAt: json._meta?.snapshotDate ?? "static",
      isStaticFallback: true,
    }
  } catch {
    return null
  }
}

/**
 * GET /api/imf
 *
 * Query params:
 *   indicator = inflation | gdp-growth | gdp-per-capita | gdp-per-capita-ppp |
 *               unemployment | govt-debt | ppp-rate | all  (default: all)
 *   countries = comma-separated IMF country codes, e.g. USA,GBR,JPN  (default: all 8)
 *   startYear = YYYY  (filter results; IMF API returns full history)
 *   endYear   = YYYY
 *
 * Examples:
 *   /api/imf
 *   /api/imf?indicator=inflation&countries=USA,GBR,DEU
 *   /api/imf?indicator=ppp-rate&startYear=2010&endYear=2030
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const indicator = (searchParams.get("indicator") ?? "all").toLowerCase()
  const countriesParam = searchParams.get("countries")
  const startYear = searchParams.get("startYear") ? parseInt(searchParams.get("startYear")!, 10) : null
  const endYear = searchParams.get("endYear") ? parseInt(searchParams.get("endYear")!, 10) : null

  // Validate year range if provided
  if (
    (startYear !== null && isNaN(startYear)) ||
    (endYear !== null && isNaN(endYear)) ||
    (startYear !== null && endYear !== null && startYear > endYear)
  ) {
    return NextResponse.json(
      { error: "Invalid startYear or endYear parameters." },
      { status: 400 },
    )
  }

  // Parse and validate country codes
  const validCodes = Object.keys(IMF_SUPPORTED_COUNTRIES) as IMFCountryCode[]
  let countries: IMFCountryCode[]

  if (countriesParam) {
    const requested = countriesParam
      .toUpperCase()
      .split(",")
      .map((c) => c.trim()) as IMFCountryCode[]
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

    switch (indicator) {
      case "inflation":
        data = await fetchIMFInflation(countries)
        break
      case "gdp-growth":
        data = await fetchIMFGDPGrowth(countries)
        break
      case "gdp-per-capita":
        data = await fetchIMFGDPPerCapita(countries)
        break
      case "gdp-per-capita-ppp":
        data = await fetchIMFGDPPerCapitaPPP(countries)
        break
      case "unemployment":
        data = await fetchIMFUnemployment(countries)
        break
      case "govt-debt":
        data = await fetchIMFGovtDebt(countries)
        break
      case "ppp-rate":
        data = await fetchIMFPPPRate(countries)
        break
      case "all":
        data = await fetchAllIMFIndicators(countries)
        break
      default:
        return NextResponse.json(
          {
            error: `Unknown indicator "${indicator}". Valid options: inflation, gdp-growth, gdp-per-capita, gdp-per-capita-ppp, unemployment, govt-debt, ppp-rate, all`,
          },
          { status: 400 },
        )
    }

    // Optionally filter observations by year range server-side before returning
    if ((startYear !== null || endYear !== null) && data) {
      const filterObservations = (series: { observations: Record<string, unknown> }) => {
        const filtered: Record<string, unknown> = {}
        for (const [year, obs] of Object.entries(series.observations)) {
          const y = parseInt(year, 10)
          if (
            (startYear === null || y >= startYear) &&
            (endYear === null || y <= endYear)
          ) {
            filtered[year] = obs
          }
        }
        return { ...series, observations: filtered }
      }

      const applyFilter = (result: { series?: { observations: Record<string, unknown> }[] }) => {
        if (result?.series) {
          return { ...result, series: result.series.map(filterObservations) }
        }
        return result
      }

      if (typeof data === "object" && data !== null) {
        if ("series" in data) {
          data = applyFilter(data as { series: { observations: Record<string, unknown> }[] })
        } else {
          // "all" mode — apply filter to each indicator result
          const filtered: Record<string, unknown> = {}
          for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
            filtered[key] = applyFilter(val as { series: { observations: Record<string, unknown> }[] })
          }
          data = filtered
        }
      }
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          // WEO updates biannually — cache 12 hours, allow stale for 1 hour
          "Cache-Control": "public, max-age=43200, stale-while-revalidate=3600",
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[IMF API Route] Live API failed:", message)

    // Try serving a static fallback before returning an error
    if (indicator !== "all") {
      try {
        const origin = new URL(request.url).origin
        const fallback = await loadIMFFallback(indicator, origin)
        if (fallback) {
          return NextResponse.json(
            { success: true, data: fallback, fallback: true },
            {
              headers: {
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
              },
            },
          )
        }
      } catch (fbErr) {
        console.error("[IMF API Route] Fallback also failed:", fbErr)
      }
    }

    return NextResponse.json(
      { error: `Failed to fetch IMF data: ${message}` },
      { status: 502 },
    )
  }
}
