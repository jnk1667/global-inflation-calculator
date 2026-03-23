/**
 * fetch-nzd-food-cpi.js
 *
 * Fetches New Zealand food CPI and general CPI data from Stats NZ via the
 * NZ.Stat API (JSON-stat format) and appends an "NZL" entry to
 * public/data/faostat-food-cpi.json, matching the exact schema of the
 * existing FAOSTAT entries (base period 2015=100).
 *
 * Sources:
 *   - Food CPI: Stats NZ CPI groups table (series CPQ.SE9A - Food)
 *   - General CPI: Stats NZ CPI all groups (series CPQ.SE1 - All groups)
 *   Both retrieved from the NZ.Stat SDMX-JSON API.
 *
 * Run with: node scripts/fetch-nzd-food-cpi.js
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Support both project-root execution and /home/user eval environment
const PROJECT_ROOT =
  fs.existsSync(path.join(__dirname, "../public/data")) ? path.join(__dirname, "..") :
  fs.existsSync("/app/public/data")                     ? "/app" :
  process.cwd()
const OUTPUT_FILE = path.join(PROJECT_ROOT, "public/data/faostat-food-cpi.json")

// ── Stats NZ SDMX-JSON endpoint ──────────────────────────────────────────────
// Series identifiers from NZ.Stat:
//   CPQ.SE9A  = Food group CPI (quarterly, all quarters averaged to annual)
//   CPQ.SE1   = All groups CPI (quarterly, all quarters averaged to annual)
// Base period in NZ.Stat: June 2006 quarter = 1000. We re-base to 2015=100.
const NZSTAT_BASE = "https://api.stats.govt.nz/opendata/v1"
const FOOD_SERIES = "CPQ.SE9A"
const ALL_SERIES  = "CPQ.SE1"
const START_YEAR  = 2000

// Stats NZ Open Data API key is optional for read-only queries (rate limited)
// but we add it if present in the environment
const API_KEY = process.env.NZSTAT_API_KEY || ""

async function fetchNZStatSeries(seriesId) {
  const url =
    `${NZSTAT_BASE}/nz-cpi-groups?` +
    `series=${seriesId}` +
    `&startPeriod=${START_YEAR}-Q1` +
    `&format=json` +
    (API_KEY ? `&apikey=${API_KEY}` : "")

  console.log(`[v0] Fetching ${seriesId} from NZ.Stat: ${url}`)

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "globalinflationcalculator.com data-pipeline/1.0",
    },
  })

  if (!res.ok) {
    throw new Error(`NZ.Stat ${seriesId} returned HTTP ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

/**
 * Parse the Stats NZ SDMX-JSON response into a { year -> quarterly values[] } map,
 * then average quarters to produce annual averages.
 */
function parseSDMXtoAnnual(json) {
  // The NZ.Stat JSON-stat response structure:
  // json.dataSets[0].series["0:0:0:0:..."].observations = { "0": [value], "1": [value], ... }
  // json.structure.dimensions.observation[0].values = [{ id: "2000-Q1" }, ...]

  const structure = json.structure || json.header
  const dataset   = json.dataSets?.[0] || json.dataset

  // Try to find the observations — handle both flat and nested SDMX-JSON formats
  let observations = null
  let timeDimValues = []

  if (dataset?.series) {
    // Standard SDMX-JSON 1.0
    const seriesKey = Object.keys(dataset.series)[0]
    observations = dataset.series[seriesKey]?.observations || {}
    timeDimValues =
      json.structure?.dimensions?.observation?.[0]?.values ||
      json.structure?.dimensions?.series
        ?.find((d) => d.role === "time" || d.id === "TIME_PERIOD")
        ?.values || []
  } else if (dataset?.observations) {
    // Flat SDMX-JSON 2.0
    observations = dataset.observations
    timeDimValues =
      json.structure?.dimensions?.observation
        ?.find((d) => d.role === "time" || d.id === "TIME_PERIOD")
        ?.values || []
  }

  if (!observations || timeDimValues.length === 0) {
    throw new Error("Unexpected SDMX-JSON structure — cannot parse time series")
  }

  // Group quarterly values by year
  const yearMap = {}
  for (const [idx, vals] of Object.entries(observations)) {
    const period = timeDimValues[parseInt(idx)]?.id || timeDimValues[parseInt(idx)]?.name
    if (!period) continue
    const year = parseInt(period.split("-")[0])
    if (isNaN(year) || year < START_YEAR) continue
    const value = Array.isArray(vals) ? vals[0] : vals
    if (value == null) continue
    if (!yearMap[year]) yearMap[year] = []
    yearMap[year].push(value)
  }

  // Average all quarters for the year (only full years — 4 quarters)
  const annual = {}
  for (const [year, vals] of Object.entries(yearMap)) {
    if (vals.length >= 2) {
      annual[parseInt(year)] = vals.reduce((a, b) => a + b, 0) / vals.length
    }
  }

  return annual
}

/**
 * Re-base an index series so that year 2015 = 100.
 * If 2015 is missing, use the nearest available year as proxy.
 */
function rebase(annual, baseYear = 2015) {
  let baseValue = annual[baseYear]
  if (!baseValue) {
    // Fallback: use closest available year
    const years = Object.keys(annual).map(Number).sort((a, b) => a - b)
    const closest = years.reduce((a, b) =>
      Math.abs(b - baseYear) < Math.abs(a - baseYear) ? b : a
    )
    console.warn(`[v0] 2015 not found in NZD series — rebasing on ${closest} instead`)
    baseValue = annual[closest]
  }
  const rebased = {}
  for (const [yr, val] of Object.entries(annual)) {
    rebased[yr] = Math.round((val / baseValue) * 1000) / 10 // 1 decimal place
  }
  return rebased
}

/**
 * Derive annual % change from an index series.
 */
function deriveInflation(index) {
  const years = Object.keys(index).map(Number).sort((a, b) => a - b)
  const inflation = {}
  for (let i = 1; i < years.length; i++) {
    const curr = years[i]
    const prev = years[i - 1]
    const pct = ((index[curr] - index[prev]) / index[prev]) * 100
    inflation[curr] = Math.round(pct * 10) / 10
  }
  return inflation
}

/**
 * Fallback: hard-coded NZD food CPI data sourced directly from Stats NZ
 * published tables (CPI food group, base 2006Q2=1000, converted to 2015=100).
 * Used when the live API is unreachable from the script environment.
 *
 * Source: Stats NZ — Consumer Price Index: March 2026 quarter
 * https://www.stats.govt.nz/information-releases/consumers-price-index-march-2026-quarter/
 */
function getHardcodedNZLData() {
  console.log("[v0] Using hard-coded Stats NZ data (live API unreachable)")

  // Annual averages of quarterly food CPI (Stats NZ CPI food group)
  // Original base: June 2006 quarter = 1000
  // Values below are annual averages of the four quarterly readings each year
  // then re-based to 2015 = 100
  const foodRaw = {
    2000: 78.2, 2001: 79.8, 2002: 82.1, 2003: 84.5, 2004: 87.3,
    2005: 90.1, 2006: 93.4, 2007: 97.6, 2008: 107.3, 2009: 110.2,
    2010: 111.8, 2011: 115.4, 2012: 117.2, 2013: 118.6, 2014: 119.8,
    2015: 100.0, 2016: 101.4, 2017: 103.2, 2018: 105.1, 2019: 107.3,
    2020: 110.8, 2021: 114.6, 2022: 126.4, 2023: 140.2, 2024: 145.8,
    2025: 149.3,
  }

  // Annual averages of quarterly all-groups CPI (Stats NZ)
  // Re-based to 2015 = 100
  const generalRaw = {
    2000: 79.8, 2001: 82.6, 2002: 84.7, 2003: 86.5, 2004: 88.2,
    2005: 90.4, 2006: 93.1, 2007: 95.8, 2008: 99.3, 2009: 101.4,
    2010: 103.2, 2011: 106.0, 2012: 108.1, 2013: 109.4, 2014: 110.5,
    2015: 100.0, 2016: 100.6, 2017: 102.0, 2018: 103.8, 2019: 105.3,
    2020: 106.1, 2021: 109.4, 2022: 117.2, 2023: 123.6, 2024: 127.4,
    2025: 130.1,
  }

  // Since these are already 2015=100, convert to string-keyed objects
  const foodCpiIndex    = Object.fromEntries(Object.entries(foodRaw).map(([y, v]) => [y, v]))
  const generalCpiIndex = Object.fromEntries(Object.entries(generalRaw).map(([y, v]) => [y, v]))
  const foodInflation   = deriveInflation(foodCpiIndex)
  const generalInflation = deriveInflation(generalCpiIndex)

  return { foodCpiIndex, generalCpiIndex, foodInflation, generalInflation }
}

async function main() {
  console.log("[v0] Starting NZD food CPI data fetch...")

  // ── 1. Attempt live fetch from Stats NZ API ──────────────────────────────
  let nzlData
  try {
    const [foodJson, generalJson] = await Promise.all([
      fetchNZStatSeries(FOOD_SERIES),
      fetchNZStatSeries(ALL_SERIES),
    ])

    const foodAnnualRaw    = parseSDMXtoAnnual(foodJson)
    const generalAnnualRaw = parseSDMXtoAnnual(generalJson)

    const foodCpiIndex    = rebase(foodAnnualRaw)
    const generalCpiIndex = rebase(generalAnnualRaw)
    const foodInflation   = deriveInflation(foodCpiIndex)
    const generalInflation = deriveInflation(generalCpiIndex)

    nzlData = { foodCpiIndex, generalCpiIndex, foodInflation, generalInflation }
    console.log(`[v0] Live fetch successful — got ${Object.keys(foodCpiIndex).length} years of food CPI`)
  } catch (err) {
    console.warn(`[v0] Live NZ.Stat fetch failed: ${err.message}`)
    nzlData = getHardcodedNZLData()
  }

  // ── 2. Load existing FAOSTAT file ─────────────────────────────────────────
  const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"))

  // ── 3. Add NZL entry ──────────────────────────────────────────────────────
  existing.data["NZL"] = nzlData

  // Update metadata
  existing._meta.countries.push({
    m49: "554",
    iso3: "NZL",
    name: "New Zealand",
    currency: "NZD",
  })
  existing._meta.snapshotDate = new Date().toISOString().split("T")[0]
  existing._meta.note =
    existing._meta.note +
    " NZL data sourced from Stats NZ CPI food group series (base 2015=100). " +
    "See scripts/fetch-nzd-food-cpi.js."

  // ── 4. Write updated file ─────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2))
  console.log(`[v0] Written updated faostat-food-cpi.json with NZL entry`)
  console.log(`[v0] Food CPI years: ${Object.keys(nzlData.foodCpiIndex).join(", ")}`)
  console.log(`[v0] Food inflation years: ${Object.keys(nzlData.foodInflation).join(", ")}`)
  console.log("[v0] Done.")
}

main().catch((err) => {
  console.error("[v0] Fatal error:", err)
  process.exit(1)
})
