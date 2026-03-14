/**
 * fetch-oecd-data.js
 *
 * Downloads OECD PPP, CPI and wages data using the new OECD Data Explorer API
 * (sdmx.oecd.org) — the legacy stats.oecd.org was shut down July 1, 2024.
 *
 * Run: node scripts/fetch-oecd-data.js
 * Output: /public/data/oecd-ppp.json
 *         /public/data/oecd-wages.json
 */

"use strict"

const { existsSync, mkdirSync } = require("fs")
const { writeFile } = require("fs/promises")
const { join } = require("path")
const https = require("https")

// ─── Config ──────────────────────────────────────────────────────────────────

const OECD_BASE = "https://sdmx.oecd.org/public/rest/data"

// New dataset IDs post-migration (July 2024)
const DATASETS = {
  // PPP conversion rates (national currency per USD)
  PPP: "OECD.SDD.TPS,DSD_PRICES@DF_PRICES_PPPCO,1.0",
  // Average annual wages (constant USD PPP)
  WAGES: "OECD.ELS.SAE,DSD_EARNINGS@DF_EARNINGS_AVERAGES,1.0",
}

const COUNTRIES = ["USA", "GBR", "DEU", "JPN", "CAN", "AUS", "CHE", "FRA"]
const COUNTRY_META = {
  USA: { name: "United States", currency: "USD" },
  GBR: { name: "United Kingdom", currency: "GBP" },
  DEU: { name: "Germany",        currency: "EUR" },
  JPN: { name: "Japan",          currency: "JPY" },
  CAN: { name: "Canada",         currency: "CAD" },
  AUS: { name: "Australia",      currency: "AUD" },
  CHE: { name: "Switzerland",    currency: "CHF" },
  FRA: { name: "France",         currency: "EUR" },
}

const PROJECT_ROOT = existsSync("/app/public") ? "/app" : process.cwd()
const OUT_DIR = join(PROJECT_ROOT, "public", "data")

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    console.log("[v0] Fetching:", url)
    const req = https.get(url, {
      headers: {
        "Accept": "application/vnd.sdmx.data+json;version=2.0",
        "User-Agent": "Mozilla/5.0 (compatible; GlobalInflationCalculator/1.0; +https://www.globalinflationcalculator.com)",
      },
    }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      let body = ""
      res.on("data", (chunk) => { body += chunk })
      res.on("end", () => {
        try { resolve(JSON.parse(body)) }
        catch (e) {
          console.log("[v0] Response (first 500 chars):", body.slice(0, 500))
          reject(new Error(`JSON parse error: ${e.message}`))
        }
      })
    })
    req.on("error", reject)
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timeout")) })
  })
}

// ─── SDMX-JSON v2 parser ─────────────────────────────────────────────────────

/**
 * Parse SDMX-JSON v2 response (new OECD Data Explorer format).
 * Returns { [countryCode]: { [year]: value } }
 */
function parseSDMXv2(raw, targetCountries) {
  const result = {}

  const data = raw?.data ?? raw
  const dataSets = data?.dataSets ?? []
  const structure = data?.structure ?? {}

  if (!dataSets.length) {
    console.log("[v0] No dataSets in response. Keys:", Object.keys(raw ?? {}))
    return result
  }

  const seriesDims = structure?.dimensions?.series ?? []
  const obsDims    = structure?.dimensions?.observation ?? []

  // Find REF_AREA dimension for country codes
  const refAreaDim = seriesDims.find(d =>
    d.id === "REF_AREA" || d.id === "LOCATION" || d.id === "COU" || d.id === "COUNTRY"
  )
  // Find time dimension
  const timeDim = obsDims.find(d =>
    d.id === "TIME_PERIOD" || d.id === "TIME" || d.id === "Year"
  )

  if (!refAreaDim) {
    console.log("[v0] Could not find REF_AREA dimension. Series dims:", seriesDims.map(d => d.id))
    return result
  }
  if (!timeDim) {
    console.log("[v0] Could not find TIME dimension. Obs dims:", obsDims.map(d => d.id))
    return result
  }

  const refAreaPos = refAreaDim.keyPosition ?? seriesDims.indexOf(refAreaDim)
  const series = dataSets[0]?.series ?? {}

  for (const [seriesKey, seriesData] of Object.entries(series)) {
    const keyParts = seriesKey.split(":").map(Number)
    const countryIdx = keyParts[refAreaPos]
    const countryCode = refAreaDim.values?.[countryIdx]?.id

    if (!countryCode || !targetCountries.includes(countryCode)) continue

    if (!result[countryCode]) result[countryCode] = {}

    for (const [obsKey, obsArr] of Object.entries(seriesData.observations ?? {})) {
      const timeIdx = Number(obsKey)
      const timePeriod = timeDim.values?.[timeIdx]?.id
      const value = Array.isArray(obsArr) ? obsArr[0] : obsArr

      if (timePeriod && value !== null && value !== undefined && !isNaN(Number(value))) {
        // Only keep 4-digit year entries (annual data)
        const yearStr = String(timePeriod).slice(0, 4)
        if (/^\d{4}$/.test(yearStr)) {
          result[countryCode][yearStr] = Math.round(Number(value) * 1000) / 1000
        }
      }
    }
  }

  return result
}

// ─── Fetch PPP data ───────────────────────────────────────────────────────────

async function fetchPPP() {
  console.log("\n[v0] === Fetching OECD PPP (Purchasing Power Parities) ===")

  const countryFilter = COUNTRIES.join("+")
  // Dataset: DSD_PRICES@DF_PRICES_PPPCO
  // Key: FREQ.REF_AREA.MEASURE  → A.[countries].PPP
  // NATUSD = national currency per USD (the standard PPP conversion rate)
  const url = `${OECD_BASE}/${DATASETS.PPP}/A.${countryFilter}.PPP.NATUSD?startPeriod=2000&endPeriod=2024&dimensionAtObservation=TIME_PERIOD&format=jsondata`

  try {
    const raw = await fetchJSON(url)
    const pppData = parseSDMXv2(raw, COUNTRIES)

    const countries = Object.keys(pppData)
    const sampleCountry = countries[0]
    const sampleYears = sampleCountry ? Object.keys(pppData[sampleCountry]).sort().slice(-5) : []

    console.log(`[v0] PPP: got data for ${countries.length} countries: ${countries.join(", ")}`)
    if (sampleCountry) {
      console.log(`[v0] PPP sample (${sampleCountry}, last 5 years):`)
      sampleYears.forEach(yr => console.log(`       ${yr}: ${pppData[sampleCountry][yr]}`))
    }

    return pppData
  } catch (err) {
    console.error("[v0] PPP fetch failed:", err.message)
    return null
  }
}

// ─── Fetch wages data ─────────────────────────────────────────────────────────

async function fetchWages() {
  console.log("\n[v0] === Fetching OECD Average Annual Wages ===")

  const countryFilter = COUNTRIES.join("+")
  // AVUSDPPP = average annual wages in constant 2022 USD PPP
  const url = `${OECD_BASE}/${DATASETS.WAGES}/A.${countryFilter}.AVUSDPPP?startPeriod=2000&endPeriod=2024&dimensionAtObservation=TIME_PERIOD&format=jsondata`

  try {
    const raw = await fetchJSON(url)
    const wagesData = parseSDMXv2(raw, COUNTRIES)

    const countries = Object.keys(wagesData)
    const sampleCountry = countries[0]
    const sampleYears = sampleCountry ? Object.keys(wagesData[sampleCountry]).sort().slice(-5) : []

    console.log(`[v0] Wages: got data for ${countries.length} countries: ${countries.join(", ")}`)
    if (sampleCountry) {
      console.log(`[v0] Wages sample (${sampleCountry}, last 5 years):`)
      sampleYears.forEach(yr => console.log(`       ${yr}: ${wagesData[sampleCountry][yr]}`))
    }

    return wagesData
  } catch (err) {
    console.error("[v0] Wages fetch failed:", err.message)
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[v0] OECD Data Fetch Script")
  console.log("[v0] Project root:", PROJECT_ROOT)
  console.log("[v0] Output dir:  ", OUT_DIR)

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const [pppData, wagesData] = await Promise.all([fetchPPP(), fetchWages()])

  // ─── Write PPP JSON ───────────────────────────────────────────────────────
  if (pppData && Object.keys(pppData).length > 0) {
    const pppOut = {
      _meta: {
        source: "OECD Data Explorer — Prices: Purchasing Power Parities",
        dataset: DATASETS.PPP,
        measure: "NATUSD (national currency per USD)",
        snapshotDate: new Date().toISOString().slice(0, 10),
        note: "PPP conversion rates. Value = units of national currency per 1 USD at PPP.",
      },
      data: Object.fromEntries(
        COUNTRIES.map(iso3 => [
          iso3,
          {
            ...COUNTRY_META[iso3],
            pppRates: pppData[iso3] ?? {},
          }
        ])
      ),
    }
    const pppPath = join(OUT_DIR, "oecd-ppp.json")
    await writeFile(pppPath, JSON.stringify(pppOut, null, 2), "utf8")
    console.log(`\n[v0] Wrote PPP data to: ${pppPath}`)

    // Print summary table
    console.log("\n[v0] PPP Summary (latest year per country):")
    for (const iso3 of COUNTRIES) {
      const years = Object.keys(pppData[iso3] ?? {}).sort()
      const latest = years[years.length - 1]
      console.log(`  ${iso3}: ${latest} → ${pppData[iso3]?.[latest] ?? "N/A"} ${COUNTRY_META[iso3].currency}/USD`)
    }
  } else {
    console.error("[v0] No PPP data to write — check errors above")
  }

  // ─── Write Wages JSON ─────────────────────────────────────────────────────
  if (wagesData && Object.keys(wagesData).length > 0) {
    const wagesOut = {
      _meta: {
        source: "OECD Data Explorer — Earnings: Average Annual Wages",
        dataset: DATASETS.WAGES,
        measure: "AVUSDPPP (constant 2022 USD PPP)",
        snapshotDate: new Date().toISOString().slice(0, 10),
        note: "Average annual wages in constant 2022 USD adjusted for PPP. Comparable across countries.",
      },
      data: Object.fromEntries(
        COUNTRIES.map(iso3 => [
          iso3,
          {
            ...COUNTRY_META[iso3],
            wages: wagesData[iso3] ?? {},
          }
        ])
      ),
    }
    const wagesPath = join(OUT_DIR, "oecd-wages.json")
    await writeFile(wagesPath, JSON.stringify(wagesOut, null, 2), "utf8")
    console.log(`[v0] Wrote Wages data to: ${wagesPath}`)

    console.log("\n[v0] Wages Summary (latest year per country):")
    for (const iso3 of COUNTRIES) {
      const years = Object.keys(wagesData[iso3] ?? {}).sort()
      const latest = years[years.length - 1]
      console.log(`  ${iso3}: ${latest} → $${(wagesData[iso3]?.[latest] ?? 0).toLocaleString()} USD PPP`)
    }
  } else {
    console.error("[v0] No Wages data to write — check errors above")
  }

  console.log("\n[v0] Done.")
}

main().catch(err => {
  console.error("[v0] Fatal error:", err)
  process.exit(1)
})
