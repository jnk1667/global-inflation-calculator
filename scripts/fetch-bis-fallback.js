/**
 * Fetches real BIS WS_SPP residential property price data (nominal + real index, 2010=100)
 * for all 8 supported countries and writes it to public/data/bis-property-prices.json
 */

import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(process.cwd(), "public/data/bis-property-prices.json")

const BIS_API_BASE = "https://stats.bis.org/api/v2"
const COUNTRIES = ["US", "GB", "DE", "JP", "CA", "AU", "CH", "FR"]
const COUNTRY_NAMES = {
  US: "United States", GB: "United Kingdom", DE: "Germany",
  JP: "Japan", CA: "Canada", AU: "Australia", CH: "Switzerland", FR: "France",
}
const CURRENCIES = {
  US: "USD", GB: "GBP", DE: "EUR", JP: "JPY",
  CA: "CAD", AU: "AUD", CH: "CHF", FR: "EUR",
}

async function fetchBISPropertyPrices() {
  const countryKey = COUNTRIES.join("+")
  const key = `Q.${countryKey}.N+R`
  const url = `${BIS_API_BASE}/data/dataflow/BIS/WS_SPP/1.0/${key}?startPeriod=2000-Q1&detail=dataonly`

  console.log(`Fetching: ${url}`)
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.sdmx.data+json" },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`BIS API ${res.status}: ${body.slice(0, 400)}`)
  }

  const text = await res.text()
  if (text.trimStart().startsWith("<")) throw new Error("BIS returned XML")
  return JSON.parse(text)
}

function parseSDMX(raw) {
  const structure = raw?.data?.structure
  const dataSets = raw?.data?.dataSets
  if (!structure || !dataSets?.length) throw new Error("Empty SDMX response")

  const seriesDims = structure.dimensions?.series ?? []
  const obsDims = structure.dimensions?.observation ?? []
  const timeDimIndex = obsDims.findIndex((d) => d.id === "TIME_PERIOD")
  const timeDimValues = timeDimIndex >= 0 ? (obsDims[timeDimIndex]?.values ?? []) : []
  const rawSeries = dataSets[0]?.series ?? {}

  const nominalMap = {}
  const realMap = {}
  const seenMeasures = new Set()

  for (const [seriesKeyStr, seriesData] of Object.entries(rawSeries)) {
    const keyParts = seriesKeyStr.split(":").map(Number)
    const dimLabels = {}
    for (let i = 0; i < seriesDims.length; i++) {
      const dim = seriesDims[i]
      dimLabels[dim.id] = dim.values[keyParts[i]]?.id ?? String(keyParts[i])
    }

    const refArea = dimLabels["REF_AREA"] ?? ""
    const measure = dimLabels["VALUE_MEASURE"] ?? dimLabels["UNIT_MEASURE"] ?? "628"
    // BIS WS_SPP: 628 = nominal index, 771 = real (inflation-adjusted) index
    const isReal = measure === "771" || measure === "R"
    const country = refArea
    if (!COUNTRIES.includes(country)) continue

    const targetMap = isReal ? realMap : nominalMap
    if (!targetMap[country]) targetMap[country] = {}

    const rawObs = seriesData.observations ?? {}
    for (const [obsIndexStr, obsValues] of Object.entries(rawObs)) {
      const obsKeyParts = obsIndexStr.split(":").map(Number)
      const timeIndex = timeDimIndex >= 0 ? obsKeyParts[timeDimIndex] : obsKeyParts[0]
      const period = timeDimValues[timeIndex]?.id ?? obsIndexStr
      const value = obsValues[0] != null ? Number(obsValues[0]) : null
      if (value === null || isNaN(value)) continue
      const year = period.split("-")[0].replace(/Q\d/, "").trim()
      if (year.length !== 4) continue
      if (!targetMap[country][year]) targetMap[country][year] = []
      targetMap[country][year].push(value)
    }
  }

  function annualise(map) {
    const out = {}
    for (const [country, years] of Object.entries(map)) {
      out[country] = {}
      for (const [year, vals] of Object.entries(years)) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length
        out[country][year] = Math.round(avg * 10) / 10
      }
    }
    return out
  }

  return { nominal: annualise(nominalMap), real: annualise(realMap) }
}

async function main() {
  console.log("Fetching BIS residential property price data...")
  const raw = await fetchBISPropertyPrices()
  console.log("Parsing SDMX response...")
  const { nominal, real } = parseSDMX(raw)

  const nomCountries = Object.keys(nominal)
  const realCountries = Object.keys(real)
  console.log(`Nominal series: ${nomCountries.join(", ")}`)
  console.log(`Real series: ${realCountries.join(", ")}`)

  if (nomCountries.length === 0) throw new Error("No data parsed — check SDMX dimensions")

  const nominalSeries = COUNTRIES.filter((c) => nominal[c]).map((c) => ({
    country: c,
    countryName: COUNTRY_NAMES[c],
    currency: CURRENCIES[c],
    data: nominal[c],
  }))
  const realSeries = COUNTRIES.filter((c) => real[c]).map((c) => ({
    country: c,
    countryName: COUNTRY_NAMES[c],
    currency: CURRENCIES[c],
    data: real[c],
  }))

  const output = {
    source: "BIS Residential Property Prices (WS_SPP), index 2010=100",
    note: "Annual averages of quarterly index values. Nominal = unadjusted. Real = inflation-adjusted (CPI deflated).",
    fetchedAt: new Date().toISOString(),
    nominalSeries,
    realSeries,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`Wrote ${nominalSeries.length} nominal + ${realSeries.length} real series to ${OUTPUT_PATH}`)
  console.log("Done.")
}

main().catch((err) => {
  console.error("FAILED:", err.message)
  process.exit(1)
})
