// GET /api/oecd
//
// Serves OECD PPP and wages data, trying the live OECD Data Explorer API first
// and falling back to static JSON snapshots in /public/data/.
//
// Query params:
//   country   — single ISO3 code, e.g. "USA" (default: all 8)
//   countries — comma-separated ISO3 codes, e.g. "USA,GBR,DEU"
//   metric    — "ppp" | "wages" | "all" (default: "ppp")
//   startYear — YYYY (default: 2000)
//   endYear   — YYYY (optional, defaults to current year)
//
// Examples:
//   /api/oecd
//   /api/oecd?country=GBR&metric=ppp
//   /api/oecd?countries=USA,GBR,DEU&metric=wages&startYear=2010
//   /api/oecd?metric=all

import { NextResponse } from "next/server"
import {
  fetchOECDPPP,
  fetchOECDWages,
  getLatestValue,
  OECD_SUPPORTED_COUNTRIES,
  type OECDCountryCode,
} from "@/lib/api/oecd-api"

export const dynamic = "force-dynamic"

const ALL_CODES = Object.keys(OECD_SUPPORTED_COUNTRIES) as OECDCountryCode[]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Country filtering
  const countryParam   = searchParams.get("country")
  const countriesParam = searchParams.get("countries")
  const metric    = (searchParams.get("metric") ?? searchParams.get("dataset") ?? "ppp").toLowerCase()
  const startYear = parseInt(searchParams.get("startYear") ?? "2000", 10)
  const endYear   = searchParams.get("endYear")
    ? parseInt(searchParams.get("endYear")!, 10)
    : new Date().getFullYear()

  if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) {
    return NextResponse.json(
      { ok: false, error: "Invalid startYear or endYear" },
      { status: 400 },
    )
  }

  const rawList = countryParam
    ? [countryParam]
    : countriesParam
      ? countriesParam.split(",").map((c) => c.trim())
      : []

  const countries: OECDCountryCode[] = rawList.length
    ? (rawList
        .map((c) => c.toUpperCase())
        .filter((c) => ALL_CODES.includes(c as OECDCountryCode)) as OECDCountryCode[])
    : ALL_CODES

  if (countries.length === 0) {
    return NextResponse.json(
      { ok: false, error: `No valid countries. Supported: ${ALL_CODES.join(", ")}` },
      { status: 400 },
    )
  }

  const normalizedMetric = metric === "cpi" || metric === "inflation" ? "ppp"
    : metric === "unemployment" ? "wages"
    : ["ppp", "wages", "all"].includes(metric) ? metric
    : "ppp"

  try {
    const cacheHeaders = {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    }

    // ── PPP only ──────────────────────────────────────────────────────────────
    if (normalizedMetric === "ppp") {
      const result = await fetchOECDPPP(countries, startYear, endYear)

      const summary = Object.fromEntries(
        result.series.map((s) => {
          const latest = getLatestValue(s)
          return [
            s.country,
            {
              countryName: s.countryName,
              currency:    s.currency,
              latestPPP:   latest?.value ?? null,
              latestYear:  latest?.period ?? null,
              timeSeries:  Object.fromEntries(
                Object.entries(s.observations)
                  .filter(([, obs]) => obs.value !== null)
                  .map(([yr, obs]) => [yr, obs.value])
              ),
            },
          ]
        })
      )

      return NextResponse.json(
        {
          ok: true,
          isLive: result.isLive,
          snapshotDate: result.fetchedAt,
          source: "OECD Data Explorer — Prices: Purchasing Power Parities",
          data: summary,
        },
        { headers: cacheHeaders },
      )
    }

    // ── Wages only ────────────────────────────────────────────────────────────
    if (normalizedMetric === "wages") {
      const result = await fetchOECDWages(countries, startYear, endYear)

      const summary = Object.fromEntries(
        result.series.map((s) => {
          const latest = getLatestValue(s)
          return [
            s.country,
            {
              countryName: s.countryName,
              currency:    s.currency,
              latestWage:  latest?.value ?? null,
              latestYear:  latest?.period ?? null,
              measure:     "constant 2022 USD PPP",
              timeSeries:  Object.fromEntries(
                Object.entries(s.observations)
                  .filter(([, obs]) => obs.value !== null)
                  .map(([yr, obs]) => [yr, obs.value])
              ),
            },
          ]
        })
      )

      return NextResponse.json(
        {
          ok: true,
          isLive: result.isLive,
          snapshotDate: result.fetchedAt,
          source: "OECD Data Explorer — Employment: Average Annual Wages",
          data: summary,
        },
        { headers: cacheHeaders },
      )
    }

    // ── All metrics ───────────────────────────────────────────────────────────
    const [pppResult, wagesResult] = await Promise.all([
      fetchOECDPPP(countries, startYear, endYear),
      fetchOECDWages(countries, startYear, endYear),
    ])

    const combined = Object.fromEntries(
      countries.map((iso3) => {
        const pppSeries   = pppResult.series.find((s) => s.country === iso3)
        const wagesSeries = wagesResult.series.find((s) => s.country === iso3)
        const latestPPP   = pppSeries   ? getLatestValue(pppSeries)   : null
        const latestWages = wagesSeries ? getLatestValue(wagesSeries) : null

        return [
          iso3,
          {
            countryName: pppSeries?.countryName ?? OECD_SUPPORTED_COUNTRIES[iso3]?.name,
            currency:    pppSeries?.currency    ?? OECD_SUPPORTED_COUNTRIES[iso3]?.currency,
            ppp: {
              latestPPP:  latestPPP?.value  ?? null,
              latestYear: latestPPP?.period ?? null,
              timeSeries: pppSeries
                ? Object.fromEntries(
                    Object.entries(pppSeries.observations)
                      .filter(([, o]) => o.value !== null)
                      .map(([yr, o]) => [yr, o.value])
                  )
                : {},
            },
            wages: {
              latestWage: latestWages?.value  ?? null,
              latestYear: latestWages?.period ?? null,
              measure:    "constant 2022 USD PPP",
              timeSeries: wagesSeries
                ? Object.fromEntries(
                    Object.entries(wagesSeries.observations)
                      .filter(([, o]) => o.value !== null)
                      .map(([yr, o]) => [yr, o.value])
                  )
                : {},
            },
          },
        ]
      })
    )

    return NextResponse.json(
      {
        ok: true,
        isLive: pppResult.isLive || wagesResult.isLive,
        snapshotDate: pppResult.fetchedAt,
        sources: {
          ppp:   "OECD Data Explorer — Prices: Purchasing Power Parities",
          wages: "OECD Data Explorer — Employment: Average Annual Wages",
        },
        data: combined,
      },
      { headers: cacheHeaders },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[OECD route]", message)
    return NextResponse.json(
      { ok: false, error: "Failed to load OECD data", detail: message },
      { status: 502 },
    )
  }
}
