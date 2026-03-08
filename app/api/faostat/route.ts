// FAOSTAT Data API Route Handler
// GET /api/faostat
//
// Query parameters:
//   dataset   — "consumer-prices" | "inflation" | "producer-prices" | "food-supply" | "all"
//               Defaults to "all"
//   startYear — e.g. "2000" (default: 2000)
//   endYear   — e.g. "2023" (optional, filters the response)
//   countries — comma-separated ISO3 codes e.g. "USA,GBR,DEU"
//               Defaults to all 8 supported countries
//
// Examples:
//   /api/faostat                                     → all datasets, all countries
//   /api/faostat?dataset=inflation&startYear=2010    → CPI % change from 2010 onwards
//   /api/faostat?dataset=consumer-prices&countries=USA,GBR,DEU
//   /api/faostat?dataset=producer-prices&startYear=2005&endYear=2023

import { NextResponse } from "next/server"
import {
  fetchFAOSTATConsumerPrices,
  fetchFAOSTATInflationRates,
  fetchFAOSTATProducerPrices,
  fetchFAOSTATFoodSupply,
  fetchAllFAOSTATData,
  filterFAOSTATByYearRange,
  FAOSTAT_SUPPORTED_COUNTRIES,
  type FAOSTATDataResult,
  type FAOSTATCountryCode,
} from "@/lib/api/faostat-api"

export const dynamic = "force-dynamic"

const SUPPORTED_CODES = Object.keys(
  FAOSTAT_SUPPORTED_COUNTRIES,
) as FAOSTATCountryCode[]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const dataset = searchParams.get("dataset") ?? "all"
  const startYearParam = searchParams.get("startYear")
  const endYearParam = searchParams.get("endYear")
  const countriesParam = searchParams.get("countries")

  const startYear = startYearParam ? parseInt(startYearParam, 10) : 2000
  const endYear = endYearParam ? parseInt(endYearParam, 10) : null

  // Validate and parse requested countries
  const requestedCountries: FAOSTATCountryCode[] = countriesParam
    ? (countriesParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter((c) =>
          SUPPORTED_CODES.includes(c as FAOSTATCountryCode),
        ) as FAOSTATCountryCode[])
    : SUPPORTED_CODES

  if (requestedCountries.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No valid countries specified. Supported ISO3 codes: " +
          SUPPORTED_CODES.join(", "),
      },
      { status: 400 },
    )
  }

  // Helper: apply endYear filter to a single result
  function applyYearFilter(result: FAOSTATDataResult): FAOSTATDataResult {
    if (!endYear) return result
    return {
      ...result,
      series: result.series.map((s) =>
        filterFAOSTATByYearRange(s, startYear, endYear),
      ),
    }
  }

  try {
    let responseData:
      | FAOSTATDataResult
      | Record<string, FAOSTATDataResult>
      | null = null

    switch (dataset) {
      case "consumer-prices": {
        const result = await fetchFAOSTATConsumerPrices(
          startYear,
          requestedCountries,
        )
        responseData = applyYearFilter(result)
        break
      }

      case "inflation": {
        const result = await fetchFAOSTATInflationRates(
          startYear,
          requestedCountries,
        )
        responseData = applyYearFilter(result)
        break
      }

      case "producer-prices": {
        const result = await fetchFAOSTATProducerPrices(
          startYear,
          requestedCountries,
        )
        responseData = applyYearFilter(result)
        break
      }

      case "food-supply": {
        const result = await fetchFAOSTATFoodSupply(
          startYear,
          requestedCountries,
        )
        responseData = applyYearFilter(result)
        break
      }

      case "all": {
        const all = await fetchAllFAOSTATData({
          startYear,
          countries: requestedCountries,
        })
        // Apply year filter to each dataset
        responseData = {
          consumerPrices: applyYearFilter(all.consumerPrices),
          inflationRates: applyYearFilter(all.inflationRates),
          producerPrices: applyYearFilter(all.producerPrices),
          foodSupply: applyYearFilter(all.foodSupply),
        }
        break
      }

      default:
        return NextResponse.json(
          {
            ok: false,
            error: `Unknown dataset "${dataset}". Valid options: consumer-prices, inflation, producer-prices, food-supply, all`,
          },
          { status: 400 },
        )
    }

    return NextResponse.json(
      {
        ok: true,
        dataset,
        requestedCountries,
        startYear,
        endYear,
        data: responseData,
      },
      {
        status: 200,
        headers: {
          // FAOSTAT CPI data updates quarterly; cache for 6 hours
          "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[FAOSTAT API route]", message)

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch FAOSTAT data",
        detail: message,
        dataset,
      },
      { status: 502 },
    )
  }
}
