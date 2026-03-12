const { createWriteStream, createReadStream, mkdirSync, existsSync } = require("fs")
const { writeFile, rm } = require("fs/promises")
const { join } = require("path")
const { createInterface } = require("readline")
const https = require("https")
const http = require("http")
const fs = require("fs")
const zlib = require("zlib")

// Use /app as the project root — this is where Next.js serves /public from
// The script runner CWD is /home/user, but the project lives at /app
const PROJECT_ROOT = existsSync("/app/public") ? "/app" : process.cwd()
const CWD = PROJECT_ROOT
const OUT_DIR = join(PROJECT_ROOT, "public", "data")
const TMP_DIR = join(PROJECT_ROOT, ".tmp-faostat")
const OUT_FILE = join(PROJECT_ROOT, "public", "data", "faostat-food-cpi.json")
const TMP_ZIP = join(PROJECT_ROOT, ".tmp-faostat", "faostat-cp.zip")

// M49 codes — confirmed from the CSV: "Area Code (M49)" column has values like '840 (with leading apostrophe)
const TARGET_COUNTRIES = {
  "840": { iso3: "USA", name: "United States", currency: "USD" },
  "826": { iso3: "GBR", name: "United Kingdom", currency: "GBP" },
  "276": { iso3: "DEU", name: "Germany",        currency: "EUR" },
  "392": { iso3: "JPN", name: "Japan",          currency: "JPY" },
  "124": { iso3: "CAN", name: "Canada",         currency: "CAD" },
  "36":  { iso3: "AUS", name: "Australia",      currency: "AUD" },
  "756": { iso3: "CHE", name: "Switzerland",    currency: "CHF" },
  "250": { iso3: "FRA", name: "France",         currency: "EUR" },
}

// From actual CSV row: Item Code 23013 = Food CPI, 23014 = General CPI
// Element Code 6125 = "Value" (the only element in this dataset)
const ITEM_FOOD    = "23013"  // Consumer Prices, Food Indices (2015=100)
const ITEM_GENERAL = "23014"  // Consumer Prices, General Indices (2015=100)
const ELEMENT_VALUE = "6125"  // Value

const BULK_URL = "https://bulks-faostat.fao.org/production/ConsumerPriceIndices_E_All_Data_(Normalized).zip"

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log("[v0] Downloading:", url)
    const file = createWriteStream(dest)

    function get(targetUrl) {
      const protocol = targetUrl.startsWith("https") ? https : http
      protocol.get(targetUrl, {
        headers: {
          "User-Agent": "GlobalInflationCalculator/1.0 (+https://www.globalinflationcalculator.com)",
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log("[v0] Redirect to:", res.headers.location)
          get(res.headers.location)
          return
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`))
        }
        res.pipe(file)
        file.on("finish", () => { file.close(); resolve() })
        file.on("error", reject)
      }).on("error", reject)
    }
    get(url)
  })
}

function extractZipEntry(zipPath) {
  return new Promise((resolve, reject) => {
    const buf = fs.readFileSync(zipPath)

    // Find end of central directory
    let eocdOffset = -1
    for (let i = buf.length - 22; i >= 0; i--) {
      if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
        eocdOffset = i; break
      }
    }
    if (eocdOffset < 0) return reject(new Error("Not a valid ZIP"))

    const cdOffset   = buf.readUInt32LE(eocdOffset + 16)
    const numEntries = buf.readUInt16LE(eocdOffset + 10)

    let pos = cdOffset
    let foundEntry = null

    for (let i = 0; i < numEntries; i++) {
      if (buf.readUInt32LE(pos) !== 0x02014b50) break
      const method          = buf.readUInt16LE(pos + 10)
      const compressedSize  = buf.readUInt32LE(pos + 20)
      const fileNameLen     = buf.readUInt16LE(pos + 28)
      const extraLen        = buf.readUInt16LE(pos + 30)
      const commentLen      = buf.readUInt16LE(pos + 32)
      const lhOffset        = buf.readUInt32LE(pos + 42)
      const fileName        = buf.slice(pos + 46, pos + 46 + fileNameLen).toString("utf8")

      if (fileName.toLowerCase().includes("normalized") && fileName.endsWith(".csv")) {
        foundEntry = { fileName, method, compressedSize, lhOffset }
      }
      pos += 46 + fileNameLen + extraLen + commentLen
    }

    if (!foundEntry) return reject(new Error("Normalized CSV not found in ZIP"))
    console.log("[v0] Found:", foundEntry.fileName)

    const lh         = foundEntry.lhOffset
    const lfnLen     = buf.readUInt16LE(lh + 26)
    const lextraLen  = buf.readUInt16LE(lh + 28)
    const dataOffset = lh + 30 + lfnLen + lextraLen
    const compressed = buf.slice(dataOffset, dataOffset + foundEntry.compressedSize)
    const csvPath    = join(TMP_DIR, "faostat-cp.csv")

    if (foundEntry.method === 0) {
      fs.writeFileSync(csvPath, compressed)
      console.log("[v0] Stored (no compression), size:", compressed.length)
      resolve(csvPath)
    } else if (foundEntry.method === 8) {
      zlib.inflateRaw(compressed, (err, inflated) => {
        if (err) return reject(new Error(`Inflate error: ${err.message}`))
        fs.writeFileSync(csvPath, inflated)
        console.log("[v0] Decompressed CSV size:", inflated.length)
        resolve(csvPath)
      })
    } else {
      reject(new Error(`Unsupported method: ${foundEntry.method}`))
    }
  })
}

function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

async function parseCsv(csvPath) {
  console.log("[v0] Parsing CSV:", csvPath)
  const rl = createInterface({
    input: createReadStream(csvPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  })

  let headers = null
  let headerMap = {}
  // Structure: data[iso3] = { foodCpiIndex: {year: val}, generalCpiIndex: {year: val},
  //                           foodInflation: {year: val}, generalInflation: {year: val} }
  const data = {}
  let lineCount = 0
  let matchCount = 0

  for await (const line of rl) {
    lineCount++
    if (!line.trim()) continue

    if (!headers) {
      headers = parseCSVLine(line)
      headers.forEach((h, i) => {
        headerMap[h.replace(/^"|"$/g, "").trim()] = i
      })
      continue
    }

      const fields = parseCSVLine(line)
      const get = (col) => (fields[headerMap[col]] ?? "").replace(/^"|"$/g, "").trim()

    // M49 code has a leading apostrophe — strip it
    const m49      = get("Area Code (M49)").replace(/^'/, "")
    const itemCode = get("Item Code")
    const elemCode = get("Element Code")
    const yearStr  = get("Year")
    const valueStr = get("Value")
    // Data is monthly — aggregated into annual averages after parsing

    if (!TARGET_COUNTRIES[m49]) continue
    if (elemCode !== ELEMENT_VALUE) continue
    if (itemCode !== ITEM_FOOD && itemCode !== ITEM_GENERAL) continue

    const year  = parseInt(yearStr, 10)
    const value = valueStr === "" ? null : parseFloat(valueStr)

    if (isNaN(year) || year < 2000 || value === null || isNaN(value)) continue

    const { iso3 } = TARGET_COUNTRIES[m49]
    const metric   = itemCode === ITEM_FOOD ? "foodCpiIndex" : "generalCpiIndex"

    if (!data[iso3]) data[iso3] = {
      foodCpiIndex: {}, generalCpiIndex: {},
      foodInflation: {}, generalInflation: {}
    }
    // Accumulate monthly values as arrays — averaged into annual below
    if (!data[iso3][`_raw_${metric}`]) data[iso3][`_raw_${metric}`] = {}
    if (!data[iso3][`_raw_${metric}`][year]) data[iso3][`_raw_${metric}`][year] = []
    data[iso3][`_raw_${metric}`][year].push(value)
    matchCount++
  }

  console.log(`[v0] Parsed ${lineCount} lines, kept ${matchCount} monthly observations`)

  // Average monthly values into annual CPI index values
  for (const [iso3, metrics] of Object.entries(data)) {
    for (const metric of ["foodCpiIndex", "generalCpiIndex"]) {
      const raw = metrics[`_raw_${metric}`] ?? {}
      for (const [yr, vals] of Object.entries(raw)) {
        if (vals.length > 0) {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length
          data[iso3][metric][yr] = Math.round(avg * 100) / 100
        }
      }
      delete data[iso3][`_raw_${metric}`]
    }
  }

  // Derive annual % change from index values
  for (const [iso3, metrics] of Object.entries(data)) {
    for (const [metric, inflMetric] of [
      ["foodCpiIndex",    "foodInflation"],
      ["generalCpiIndex", "generalInflation"],
    ]) {
      const years = Object.keys(metrics[metric]).map(Number).sort((a, b) => a - b)
      for (let i = 1; i < years.length; i++) {
        const yr   = years[i]
        const prev = metrics[metric][years[i - 1]]
        const curr = metrics[metric][yr]
        if (prev && prev !== 0) {
          data[iso3][inflMetric][yr] = Math.round(((curr - prev) / prev) * 10000) / 100
        }
      }
    }
  }

  return data
}

async function main() {
  try {
    console.log("[v0] CWD:", CWD)
    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
    if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

    // Always re-download fresh data
    if (existsSync(TMP_ZIP)) fs.unlinkSync(TMP_ZIP)
    await downloadFile(BULK_URL, TMP_ZIP)
    console.log("[v0] ZIP size:", fs.statSync(TMP_ZIP).size, "bytes")

    const csvPath = await extractZipEntry(TMP_ZIP)
    const data = await parseCsv(csvPath)

    const countryCount = Object.keys(data).length
    if (countryCount === 0) throw new Error("No matching data — check item/element codes")

    const output = {
      _meta: {
        source: "FAOSTAT Consumer Price Indices (domain: CP)",
        sourceUrl: "https://www.fao.org/faostat/en/#data/CP",
        license: "CC-BY-4.0",
        basePeriod: "2015=100",
        itemCodes: { "23013": "Food CPI", "23014": "General CPI" },
        elementCode: { "6125": "Annual index value" },
        metrics: {
          foodCpiIndex:    "Food Consumer Price Index, annual (2015=100)",
          generalCpiIndex: "General Consumer Price Index, annual (2015=100)",
          foodInflation:   "Food CPI annual % change (derived)",
          generalInflation:"General CPI annual % change (derived)",
        },
        countries: Object.entries(TARGET_COUNTRIES).map(([m49, c]) => ({ m49, ...c })),
        snapshotDate: new Date().toISOString().split("T")[0],
      },
      data,
    }

    await writeFile(OUT_FILE, JSON.stringify(output, null, 2), "utf8")
    console.log("[v0] Written:", OUT_FILE)

    // Print summary
    for (const [iso3, metrics] of Object.entries(data)) {
      const foodYears = Object.keys(metrics.foodCpiIndex).map(Number).sort((a,b)=>a-b)
      const genYears  = Object.keys(metrics.generalCpiIndex).map(Number).sort((a,b)=>a-b)
      console.log(`  ${iso3}: food ${foodYears[0]}–${foodYears[foodYears.length-1]} (${foodYears.length}yr), general ${genYears[0]}–${genYears[genYears.length-1]} (${genYears.length}yr)`)
    }

    await rm(TMP_DIR, { recursive: true, force: true })
    console.log("[v0] Done!")
  } catch (err) {
    console.error("[v0] Fatal:", err.message)
    process.exit(1)
  }
}

main()
