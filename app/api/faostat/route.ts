// GET /api/faostat
//
// Serves FAOSTAT food + general CPI data from the static JSON snapshot at
// /public/data/faostat-food-cpi.json — refreshed by /scripts/fetch-faostat-data.js.
// The fenixservices.fao.org API is unreachable from server environments.
//
// Query params:
//   countries  — comma-separated ISO3 codes e.g. "USA,GBR,DEU"  (default: all 8)
//   startYear  — YYYY  (default: 2000)
//   endYear    — YYYY  (optional)
//
// Examples:
//   /api/faostat
//   /api/faostat?countries=USA,GBR,DEU&startYear=2010
//   /api/faostat?startYear=2015&endYear=2024

import { NextResponse } from "next/server"
import {
  fetchFAOSTATConsumerPrices,
  FAOSTAT_SUPPORTED_COUNTRIES,
  type FAOSTATCountryCode,
} from "@/lib/api/faostat-api"

export const dynamic = "force-dynamic"

const ALL_CODES = Object.keys(FAOSTAT_SUPPORTED_COUNTRIES) as FAOSTATCountryCode[]

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const countriesParam = searchParams.get("countries")
  const startYear = parseInt(searchParams.get("startYear") ?? "2000", 10)
  const endYear   = searchParams.get("endYear") ? parseInt(searchParams.get("endYear")!, 10) : undefined

  const countries: FAOSTATCountryCode[] = countriesParam
    ? (countriesParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter((c) => ALL_CODES.includes(c as FAOSTATCountryCode)) as FAOSTATCountryCode[])
    : ALL_CODES

  if (countries.length === 0) {
    return NextResponse.json(
      { ok: false, error: `No valid countries. Supported: ${ALL_CODES.join(", ")}` },
      { status: 400 },
    )
  }

  try {
    const data = await fetchFAOSTATConsumerPrices({
      countries,
      startYear,
      endYear,
      baseUrl: origin,
    })

    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          // Static snapshot — cache aggressively, revalidated when script runs
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      },
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
