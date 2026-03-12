const { createWriteStream, createReadStream, mkdirSync, existsSync } = require("fs")
const { writeFile, mkdir, rm } = require("fs/promises")
const { pipeline } = require("stream/promises")
const { join } = require("path")
const { createInterface } = require("readline")
const https = require("https")
const http = require("http")
const fs = require("fs")
const zlib = require("zlib")

// Use process.cwd() which points to the project root in the script runner
const CWD = process.cwd()
const OUT_DIR = join(CWD, "public", "data")
const TMP_DIR = join(CWD, ".tmp-faostat")
const OUT_FILE = join(CWD, "public", "data", "faostat-food-cpi.json")
const TMP_ZIP = join(CWD, ".tmp-faostat", "faostat-cp.zip")

// M49 country codes (used in "Area Code" column of this bulk CSV)
// Verified from ConsumerPriceIndices_E_AreaCodes.csv
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

const TARGET_ELEMENTS = new Set(["5541", "5542", "5543", "5544"])
const ELEMENT_LABELS = {
  "5541": "generalCpiIndex",
  "5542": "foodCpiIndex",
  "5543": "generalInflation",
  "5544": "foodInflation",
}

const BULK_URL = "https://bulks-faostat.fao.org/production/ConsumerPriceIndices_E_All_Data_(Normalized).zip"

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log("[v0] Downloading:", url)
    const file = createWriteStream(dest)
    const protocol = url.startsWith("https") ? https : http

    function get(url) {
      protocol.get(url, {
        headers: {
          "User-Agent": "GlobalInflationCalculator/1.0 (+https://www.globalinflationcalculator.com)",
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log("[v0] Redirecting to:", res.headers.location)
          const redirectUrl = res.headers.location
          const redirectProtocol = redirectUrl.startsWith("https") ? require("https") : require("http")
          redirectProtocol.get(redirectUrl, {
            headers: { "User-Agent": "GlobalInflationCalculator/1.0" }
          }, (res2) => {
            if (res2.statusCode !== 200) {
              reject(new Error(`Download failed after redirect: ${res2.statusCode}`))
              return
            }
            res2.pipe(file)
            file.on("finish", () => { file.close(); resolve() })
            file.on("error", reject)
          }).on("error", reject)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode} for ${url}`))
          return
        }
        res.pipe(file)
        file.on("finish", () => { file.close(); resolve() })
        file.on("error", reject)
      }).on("error", reject)
    }
    get(url)
  })
}

function extractZipEntry(zipPath, targetCsvName) {
  return new Promise((resolve, reject) => {
    console.log("[v0] Extracting ZIP:", zipPath)

    // Read ZIP file manually - find the normalized CSV entry
    const buf = fs.readFileSync(zipPath)

    // ZIP end-of-central-directory signature: 0x06054b50
    let eocdOffset = -1
    for (let i = buf.length - 22; i >= 0; i--) {
      if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
        eocdOffset = i
        break
      }
    }
    if (eocdOffset < 0) return reject(new Error("Not a valid ZIP file"))

    const cdOffset = buf.readUInt32LE(eocdOffset + 16)
    const cdSize = buf.readUInt32LE(eocdOffset + 12)
    const numEntries = buf.readUInt16LE(eocdOffset + 10)

    console.log(`[v0] ZIP has ${numEntries} entries, CD at offset ${cdOffset}`)

    let pos = cdOffset
    let foundEntry = null

    for (let i = 0; i < numEntries; i++) {
      if (buf[pos] !== 0x50 || buf[pos+1] !== 0x4b || buf[pos+2] !== 0x01 || buf[pos+3] !== 0x02) {
        break
      }
      const compressionMethod = buf.readUInt16LE(pos + 10)
      const compressedSize = buf.readUInt32LE(pos + 20)
      const uncompressedSize = buf.readUInt32LE(pos + 24)
      const fileNameLen = buf.readUInt16LE(pos + 28)
      const extraLen = buf.readUInt16LE(pos + 30)
      const commentLen = buf.readUInt16LE(pos + 32)
      const localHeaderOffset = buf.readUInt32LE(pos + 42)
      const fileName = buf.slice(pos + 46, pos + 46 + fileNameLen).toString("utf8")

      console.log(`[v0] Entry: ${fileName} (method=${compressionMethod}, size=${compressedSize})`)

      if (fileName.toLowerCase().includes("normalized") && fileName.endsWith(".csv")) {
        foundEntry = { fileName, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset }
      }

      pos += 46 + fileNameLen + extraLen + commentLen
    }

    if (!foundEntry) {
      return reject(new Error("Could not find Normalized CSV in ZIP"))
    }

    console.log("[v0] Found entry:", foundEntry.fileName)

    // Read local file header to find data offset
    const lh = foundEntry.localHeaderOffset
    const lfnLen = buf.readUInt16LE(lh + 26)
    const lextraLen = buf.readUInt16LE(lh + 28)
    const dataOffset = lh + 30 + lfnLen + lextraLen
    const compressedData = buf.slice(dataOffset, dataOffset + foundEntry.compressedSize)

    const csvPath = join(TMP_DIR, "faostat-cp-normalized.csv")

    if (foundEntry.compressionMethod === 0) {
      // Stored (no compression)
      fs.writeFileSync(csvPath, compressedData)
      resolve(csvPath)
    } else if (foundEntry.compressionMethod === 8) {
      // Deflated
      zlib.inflateRaw(compressedData, (err, inflated) => {
        if (err) return reject(new Error(`Inflate failed: ${err.message}`))
        fs.writeFileSync(csvPath, inflated)
        console.log("[v0] Extracted CSV:", csvPath, `(${inflated.length} bytes)`)
        resolve(csvPath)
      })
    } else {
      reject(new Error(`Unsupported compression method: ${foundEntry.compressionMethod}`))
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
  const data = {}
    let lineCount = 0
    let matchCount = 0
    let debugRows = 0

    for await (const line of rl) {
      lineCount++
      if (!line.trim()) continue

      if (!headers) {
        headers = parseCSVLine(line)
        headers.forEach((h, i) => { headerMap[h.replace(/^"|"$/g, "").trim()] = i })
        console.log("[v0] Headers:", JSON.stringify(Object.keys(headerMap)))
        continue
      }

      const fields = parseCSVLine(line)
      const get = (col) => (fields[headerMap[col]] ?? "").replace(/^"|"$/g, "")

      // Debug: print first 3 rows raw
      if (debugRows < 3) {
        console.log(`[v0] Row ${lineCount}:`, JSON.stringify(fields.slice(0, 12)))
        debugRows++
      }

    const areaCode = get("Area Code (M49)").replace(/^'/, "")  // strip leading quote if present
    const elementCode = get("Element Code")
    const year = parseInt(get("Year"), 10)
    const valueStr = get("Value")
    const value = valueStr === "" || valueStr === "null" ? null : parseFloat(valueStr)

    if (!TARGET_COUNTRIES[areaCode]) continue
    if (!TARGET_ELEMENTS.has(elementCode)) continue
    if (isNaN(year) || year < 2000) continue

    const { iso3 } = TARGET_COUNTRIES[areaCode]
    const metric = ELEMENT_LABELS[elementCode]
    if (!metric) continue

    if (!data[iso3]) data[iso3] = {}
    if (!data[iso3][metric]) data[iso3][metric] = {}
    if (value !== null) {
      data[iso3][metric][year] = Math.round(value * 100) / 100
      matchCount++
    }
  }

  console.log(`[v0] Parsed ${lineCount} lines, kept ${matchCount} observations`)
  return data
}

async function main() {
  try {
    console.log("[v0] CWD:", process.cwd())
    console.log("[v0] OUT_DIR:", OUT_DIR)
    console.log("[v0] TMP_DIR:", TMP_DIR)
    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
    if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

    await downloadFile(BULK_URL, TMP_ZIP)
    console.log("[v0] ZIP size:", fs.statSync(TMP_ZIP).size, "bytes")

    const csvPath = await extractZipEntry(TMP_ZIP)
    const data = await parseCsv(csvPath)

    const countryCount = Object.keys(data).length
    console.log(`[v0] Got data for ${countryCount} countries`)

    if (countryCount === 0) {
      throw new Error("No matching data found — check area codes and element codes")
    }

    const output = {
      _meta: {
        source: "FAOSTAT Consumer Price Indices (CP domain)",
        sourceUrl: "https://www.fao.org/faostat/en/#data/CP",
        license: "CC-BY-4.0",
        basePeriod: "2015=100",
        elements: {
          generalCpiIndex: "General CPI index value (2015=100)",
          foodCpiIndex: "Food CPI index value (2015=100)",
          generalInflation: "General CPI annual % change",
          foodInflation: "Food CPI annual % change",
        },
        countries: Object.values(TARGET_COUNTRIES),
        snapshotDate: new Date().toISOString().split("T")[0],
      },
      data,
    }

    await writeFile(OUT_FILE, JSON.stringify(output, null, 2), "utf8")
    console.log("[v0] Written to:", OUT_FILE)

    // Summary
    for (const [iso3, metrics] of Object.entries(data)) {
      for (const [metric, years] of Object.entries(metrics)) {
        const ys = Object.keys(years).map(Number).sort((a, b) => a - b)
        if (ys.length > 0) {
          console.log(`  ${iso3}/${metric}: ${ys[0]}–${ys[ys.length-1]} (${ys.length} years)`)
        }
      }
    }

    // Cleanup
    await rm(TMP_DIR, { recursive: true, force: true })
    console.log("[v0] Done!")
  } catch (err) {
    console.error("[v0] Error:", err.message)
    process.exit(1)
  }
}

main()
