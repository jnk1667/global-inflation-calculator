const fs = require("fs")
const path = require("path")

// 🔍 COMPREHENSIVE DATA VALIDATION SCRIPT
// Validates the collected comprehensive inflation data

const DATA_DIR = "public/data/comprehensive"

async function validateComprehensiveData() {
  console.log("🔍 Validating comprehensive inflation data...")
  console.log("=".repeat(50))

  if (!fs.existsSync(DATA_DIR)) {
    console.error("❌ Comprehensive data directory not found!")
    console.log("📝 Run this first: node scripts/fetch-comprehensive-inflation-data.js")
    return
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))
  const validation = {
    total_files: files.length,
    valid_files: 0,
    invalid_files: 0,
    total_data_points: 0,
    countries: new Set(),
    series_types: new Set(),
    date_ranges: {},
    issues: [],
  }

  console.log(`📁 Found ${files.length} data files`)
  console.log()

  for (const filename of files) {
    try {
      const filepath = path.join(DATA_DIR, filename)
      const data = JSON.parse(fs.readFileSync(filepath, "utf8"))

      // Extract country and series from filename
      const [country, ...seriesParts] = filename.replace(".json", "").split("-")
      const seriesName = seriesParts.join("-")

      validation.countries.add(country.toUpperCase())
      validation.series_types.add(seriesName)

      // Validate data structure
      const issues = validateDataStructure(data, filename)
      if (issues.length === 0) {
        validation.valid_files++

        // Count data points
        const dataPoints = Object.keys(data.data || {}).length
        validation.total_data_points += dataPoints

        // Track date ranges
        const years = Object.keys(data.data || {})
          .map((y) => Number.parseInt(y))
          .sort((a, b) => a - b)
        if (years.length > 0) {
          const key = `${country.toUpperCase()}-${seriesName}`
          validation.date_ranges[key] = {
            earliest: years[0],
            latest: years[years.length - 1],
            total_years: years.length,
          }
        }

        console.log(`✅ ${filename}: ${dataPoints} data points (${years[0]}-${years[years.length - 1]})`)
      } else {
        validation.invalid_files++
        validation.issues.push({ filename, issues })
        console.log(`❌ ${filename}: ${issues.join(", ")}`)
      }
    } catch (error) {
      validation.invalid_files++
      validation.issues.push({ filename, issues: [`Parse error: ${error.message}`] })
      console.log(`❌ ${filename}: Parse error`)
    }
  }

  // Print summary
  console.log()
  console.log("📊 VALIDATION SUMMARY")
  console.log("=".repeat(30))
  console.log(`📁 Total files: ${validation.total_files}`)
  console.log(`✅ Valid files: ${validation.valid_files}`)
  console.log(`❌ Invalid files: ${validation.invalid_files}`)
  console.log(`📈 Total data points: ${validation.total_data_points.toLocaleString()}`)
  console.log(`🌍 Countries: ${Array.from(validation.countries).join(", ")}`)
  console.log(`📊 Series types: ${validation.series_types.size}`)

  console.log()
  console.log("📅 DATE RANGES BY SERIES:")
  for (const [series, range] of Object.entries(validation.date_ranges)) {
    console.log(`   ${series}: ${range.earliest}-${range.latest} (${range.total_years} years)`)
  }

  if (validation.issues.length > 0) {
    console.log()
    console.log("⚠️  ISSUES FOUND:")
    validation.issues.forEach((issue) => {
      console.log(`   ${issue.filename}:`)
      issue.issues.forEach((i) => console.log(`      • ${i}`))
    })
  }

  // Save validation report
  const report = {
    validation_date: new Date().toISOString(),
    summary: {
      total_files: validation.total_files,
      valid_files: validation.valid_files,
      invalid_files: validation.invalid_files,
      total_data_points: validation.total_data_points,
      countries: Array.from(validation.countries),
      series_count: validation.series_types.size,
      series_types: Array.from(validation.series_types),
    },
    date_ranges: validation.date_ranges,
    issues: validation.issues,
  }

  fs.writeFileSync(path.join(DATA_DIR, "validation-report.json"), JSON.stringify(report, null, 2))

  console.log()
  console.log(`📋 Validation report saved: ${DATA_DIR}/validation-report.json`)

  if (validation.invalid_files === 0) {
    console.log("🎉 All data files are valid and ready for use!")
  } else {
    console.log(`⚠️  ${validation.invalid_files} files need attention before use.`)
  }
}

function validateDataStructure(data, filename) {
  const issues = []

  // Check required top-level properties
  if (!data.metadata) issues.push("Missing metadata")
  if (!data.data) issues.push("Missing data object")
  if (!data.earliest_year) issues.push("Missing earliest_year")
  if (!data.latest_year) issues.push("Missing latest_year")

  // Check metadata structure
  if (data.metadata) {
    if (!data.metadata.title) issues.push("Missing metadata.title")
    if (!data.metadata.source) issues.push("Missing metadata.source")
  }

  // Check data structure
  if (data.data) {
    const years = Object.keys(data.data)
    if (years.length === 0) {
      issues.push("No data points found")
    } else {
      // Check a few sample data points
      const sampleYears = years.slice(0, 3)
      for (const year of sampleYears) {
        const yearData = data.data[year]
        if (typeof yearData !== "object") {
          issues.push(`Invalid data structure for year ${year}`)
          break
        }
        if (typeof yearData.inflation_factor !== "number") {
          issues.push(`Missing or invalid inflation_factor for year ${year}`)
          break
        }
        if (typeof yearData.index_value !== "number") {
          issues.push(`Missing or invalid index_value for year ${year}`)
          break
        }
      }
    }
  }

  return issues
}

// 🚀 Run validation
if (require.main === module) {
  validateComprehensiveData().catch((error) => {
    console.error("❌ Validation failed:", error)
    process.exit(1)
  })
}

module.exports = { validateComprehensiveData }
