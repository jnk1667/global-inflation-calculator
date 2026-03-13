// GET /api/faostat
//
// Serves FAOSTAT food + general CPI data from the static JSON snapshot at
// /public/data/faostat-food-cpi.json — refreshed by /scripts/fetch-faostat-data.js.
//
// Query params:
//   countries  — comma-separated ISO3 codes e.g. "USA,GBR,DEU"  (default: all 8)
//   country    — single ISO3 code (alternative to countries)
//   startYear  — YYYY  (default: 2000)
//   endYear    — YYYY  (optional)
//   metric     — "food-inflation" returns a compact { foodInflationRate, generalInflationRate, year } object
//
// Examples:
//   /api/faostat
//   /api/faostat?countries=USA,GBR&startYear=2010
//   /api/faostat?country=USA&metric=food-inflation

import { NextResponse } from "next/server"
import {
  fetchFAOSTATConsumerPrices,
  getLatestFoodInflation,
  FAOSTAT_SUPPORTED_COUNTRIES,
  type FAOSTATCountryCode,
} from "@/lib/api/faostat-api"

export const dynamic = "force-dynamic"

const ALL_CODES = Object.keys(FAOSTAT_SUPPORTED_COUNTRIES) as FAOSTATCountryCode[]

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Support both ?country=USA and ?countries=USA,GBR
  const countryParam  = searchParams.get("country")
  const countriesParam = searchParams.get("countries")
  const metric        = searchParams.get("metric")
  const startYear     = parseInt(searchParams.get("startYear") ?? "2000", 10)
  const endYear       = searchParams.get("endYear") ? parseInt(searchParams.get("endYear")!, 10) : undefined

  const rawList = countryParam
    ? [countryParam]
    : countriesParam
      ? countriesParam.split(",").map((c) => c.trim())
      : []

  const countries: FAOSTATCountryCode[] = rawList.length
    ? (rawList
        .map((c) => c.toUpperCase())
        .filter((c) => ALL_CODES.includes(c as FAOSTATCountryCode)) as FAOSTATCountryCode[])
    : ALL_CODES

  if (countries.length === 0) {
    return NextResponse.json(
      { ok: false, error: `No valid countries. Supported: ${ALL_CODES.join(", ")}` },
      { status: 400 },
    )
  }

  try {
    const faoData = await fetchFAOSTATConsumerPrices({
      countries,
      startYear,
      endYear,
      baseUrl: origin,
    })

    // Compact single-country food inflation summary used by the Budget Calculator
    if (metric === "food-inflation" && countries.length === 1) {
      const countryData = faoData.countries[0]
      if (!countryData) {
        return NextResponse.json({ ok: false, error: "Country not found" }, { status: 404 })
      }
      const latest = getLatestFoodInflation(faoData, countries[0])
      // Also get latest general inflation
      const generalEntries = Object.entries(countryData.generalInflation)
        .filter(([, v]) => v !== null && !isNaN(v))
        .sort(([a], [b]) => Number(b) - Number(a))
      const latestGeneral = generalEntries[0]

      return NextResponse.json(
        {
          ok: true,
          data: {
            foodInflationRate:    latest?.value ?? null,
            generalInflationRate: latestGeneral ? latestGeneral[1] : null,
            year:                 latest?.year ?? null,
            snapshotDate:         faoData.meta.snapshotDate,
          },
        },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" } },
      )
    }

    return NextResponse.json(
      { ok: true, data: faoData },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[FAOSTAT route]", message)
    return NextResponse.json(
      { ok: false, error: "Failed to load FAOSTAT data", detail: message },
      { status: 502 },
    )
  }
}
