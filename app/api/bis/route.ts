// BIS Data API Route Handler
// GET /api/bis
//
// Query parameters:
//   dataset  — "property" | "property-changes" | "cpi" | "exchange-rates" | "policy-rates" | "all"
//              Defaults to "all"
//   startYear — e.g. "2000" (default varies by dataset)
//   endYear   — e.g. "2023" (optional, filters the response)
//   countries — comma-separated BIS 2-letter codes e.g. "US,GB,DE"
//              Defaults to all 8 supported countries
//
// Examples:
//   /api/bis                                  → all datasets, all countries, default ranges
//   /api/bis?dataset=property&startYear=2010  → property prices index from 2010
//   /api/bis?dataset=cpi&startYear=1970&countries=US,GB,DE
//   /api/bis?dataset=policy-rates             → daily central bank rates (all 8 economies)

import { NextResponse } from "next/server"
import {
  fetchBISPropertyPrices,
  fetchBISPropertyPriceChanges,
  fetchBISCPI,
  fetchBISExchangeRates,
  fetchBISPolicyRates,
  fetchAllBISData,
  filterBISByYearRange,
  aggregateBISToAnnual,
  BIS_SUPPORTED_COUNTRIES,
  type BISDataResult,
  type BISCountryCode,
} from "@/lib/api/bis-api"

export const dynamic = "force-dynamic"

// Default start years per dataset
const DEFAULTS: Record<string, number> = {
  property: 2000,
  "property-changes": 2000,
  cpi: 1960,
  "exchange-rates": 1990,
  "policy-rates": 1995,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const dataset = searchParams.get("dataset") ?? "all"
  const startYearParam = searchParams.get("startYear")
  const endYearParam = searchParams.get("endYear")
  const countriesParam = searchParams.get("countries")
  const aggregate = searchParams.get("aggregate") === "annual" // aggregate daily/monthly to annual

  const startYear = startYearParam
    ? parseInt(startYearParam, 10)
    : DEFAULTS[dataset] ?? 2000

  const endYear = endYearParam ? parseInt(endYearParam, 10) : null

  // Validate requested countries against supported list
  const supportedCodes = Object.keys(BIS_SUPPORTED_COUNTRIES) as BISCountryCode[]
  const requestedCountries = countriesParam
    ? countriesParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter((c) => supportedCodes.includes(c as BISCountryCode)) as BISCountryCode[]
    : supportedCodes

  if (requestedCountries.length === 0) {
    return NextResponse.json(
      {
        error: "No valid countries specified. Supported codes: " + supportedCodes.join(", "),
      },
      { status: 400 },
    )
  }

  try {
    let result: BISDataResult | Record<string, BISDataResult> | null = null

    switch (dataset) {
      case "property":
        result = await fetchBISPropertyPrices(startYear)
        break

      case "property-changes":
        result = await fetchBISPropertyPriceChanges(startYear)
        break

      case "cpi":
        result = await fetchBISCPI(startYear)
        break

      case "exchange-rates":
        result = await fetchBISExchangeRates(startYear)
        break

      case "policy-rates": {
        const raw = await fetchBISPolicyRates(startYear)
        // Optionally aggregate daily → annual averages
        if (aggregate) {
          result = {
            ...raw,
            series: raw.series.map((s) => aggregateBISToAnnual(s)),
          }
        } else {
          result = raw
        }
        break
      }

      case "all": {
        const all = await fetchAllBISData({
          propertyStartYear: startYear !== 2000 ? startYear : undefined,
          cpiStartYear: startYear !== 1960 ? startYear : undefined,
          ratesStartYear: startYear !== 1990 ? startYear : undefined,
        })
        result = all as unknown as Record<string, BISDataResult>
        break
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown dataset "${dataset}". Valid options: property, property-changes, cpi, exchange-rates, policy-rates, all`,
          },
          { status: 400 },
        )
    }

    // Apply year-range filter if endYear was specified and result is a single dataset
    if (endYear && result && "series" in result) {
      const typed = result as BISDataResult
      result = {
        ...typed,
        series: typed.series
          .filter((s) =>
            requestedCountries.includes(s.country as BISCountryCode) ||
            // Also include euro-area entries for EUR countries
            (s.country === "XM" && (requestedCountries.includes("DE") || requestedCountries.includes("FR"))),
          )
          .map((s) =>
            endYear && startYear
              ? filterBISByYearRange(s, startYear, endYear)
              : s,
          ),
      }
    }

    return NextResponse.json(
      {
        ok: true,
        dataset,
        requestedCountries,
        startYear,
        endYear,
        data: result,
      },
      {
        status: 200,
        headers: {
          // BIS property data updates quarterly, CPI and rates update more often
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[BIS API route]", message)

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch BIS data",
        detail: message,
        dataset,
      },
      { status: 502 },
    )
  }
}
