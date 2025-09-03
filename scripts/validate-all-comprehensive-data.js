const fs = require("fs")
const path = require("path")

// 🔍 COMPREHENSIVE DATA VALIDATION SCRIPT
// Validates all collected comprehensive inflation data across all currencies

const DATA_DIR = "public/data/comprehensive"

async function validateAllComprehensiveData() {
  console.log("🔍 COMPREHENSIVE INFLATION DATA VALIDATION")
  console.log("=".repeat(60))
  console.log("📊 Validating data for all currencies and all measures...")

  if (!fs.existsSync(DATA_DIR)) {
    console.error("❌ Comprehensive data directory not found!")
    console.log("📝 Run this first: node scripts/collect-all-comprehensive-data.js")
    return
  }

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.includes("summary") && !f.includes("report"))

  const validation = {
    total_files: files.length,
    valid_files: 0,
    invalid_files: 0,
    total_data_points: 0,
    currencies: new Set(),
    series_by_currency: {},
    date_ranges: {},
    issues: [],
    data_quality: {
      complete_series: 0,
      incomplete_series: 0,
      recent_data: 0,
      historical_data: 0,
    },
  }

  console.log(`📁 Found ${files.length} data files`)
  console.log()

  // Group files by currency
  const filesByCurrency = {}
  files.forEach((filename) => {
    const currency = filename.split("-")[0].toUpperCase()
    if (!filesByCurrency[currency]) {
      filesByCurrency[currency] = []
    }
    filesByCurrency[currency].push(filename)
  })

  // Validate each currency's data
  for (const [currency, currencyFiles] of Object.entries(filesByCurrency)) {
    console.log(`🔍 Validating ${currency} data (${currencyFiles.length} series)...`)
    validation.currencies.add(currency)
    validation.series_by_currency[currency] = {
      total_series: currencyFiles.length,
      valid_series: 0,
      invalid_series: 0,
      total_data_points: 0,
      series_list: [],
    }

    for (const filename of currencyFiles) {
      try {
        const filepath = path.join(DATA_DIR, filename)
        const data = JSON.parse(fs.readFileSync(filepath, "utf8"))

        // Extract series name from filename
        const seriesName = filename.replace(".json", "").split("-").slice(1).join("-")

        // Validate data structure
        const issues = validateDataStructure(data, filename)
        if (issues.length === 0) {
          validation.valid_files++
          validation.series_by_currency[currency].valid_series++

          // Count data points
          const dataPoints = Object.keys(data.data || {}).length
          validation.total_data_points += dataPoints
          validation.series_by_currency[currency].total_data_points += dataPoints

          // Track date ranges
          const years = Object.keys(data.data || {})
            .map((y) => Number.parseInt(y))
            .sort((a, b) => a - b)

          if (years.length > 0) {
            const key = `${currency}-${seriesName}`
            validation.date_ranges[key] = {
              earliest: years[0],
              latest: years[years.length - 1],
              total_years: years.length,
            }

            // Data quality checks
            if (years.length > 50) validation.data_quality.complete_series++
            else validation.data_quality.incomplete_series++

            if (years[years.length - 1] >= 2023) validation.data_quality.recent_data++
            if (years[0] <= 1950) validation.data_quality.historical_data++
          }

          validation.series_by_currency[currency].series_list.push({
            name: seriesName,
            data_points: dataPoints,
            date_range: years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : "No data",
            source: data.metadata?.source || "Unknown",
          })

          console.log(`   ✅ ${seriesName}: ${dataPoints} points (${years[0]}-${years[years.length - 1]})`)
        } else {
          validation.invalid_files++
          validation.series_by_currency[currency].invalid_series++
          validation.issues.push({ filename, issues })
          console.log(`   ❌ ${seriesName}: ${issues.join(", ")}`)
        }
      } catch (error) {
        validation.invalid_files++
        validation.series_by_currency[currency].invalid_series++
        validation.issues.push({ filename, issues: [`Parse error: ${error.message}`] })
        console.log(`   ❌ ${filename}: Parse error`)
      }
    }
    console.log()
  }

  // 📊 Print comprehensive summary
  console.log("📊 COMPREHENSIVE VALIDATION SUMMARY")
  console.log("=".repeat(50))
  console.log(`📁 Total files: ${validation.total_files}`)
  console.log(`✅ Valid files: ${validation.valid_files}`)
  console.log(`❌ Invalid files: ${validation.invalid_files}`)
  console.log(`📈 Total data points: ${validation.total_data_points.toLocaleString()}`)
  console.log(`💰 Currencies: ${Array.from(validation.currencies).join(", ")}`)

  console.log("\n📊 DATA QUALITY METRICS:")
  console.log(`   Complete series (50+ years): ${validation.data_quality.complete_series}`)
  console.log(`   Incomplete series (<50 years): ${validation.data_quality.incomplete_series}`)
  console.log(`   Recent data (2023+): ${validation.data_quality.recent_data}`)
  console.log(`   Historical data (1950-): ${validation.data_quality.historical_data}`)

  console.log("\n💰 CURRENCY BREAKDOWN:")
  for (const [currency, details] of Object.entries(validation.series_by_currency)) {
    console.log(
      `   ${currency}: ${details.valid_series}/${details.total_series} series, ${details.total_data_points.toLocaleString()} points`,
    )
  }

  console.log("\n📊 SERIES BY CURRENCY:")
  for (const [currency, details] of Object.entries(validation.series_by_currency)) {
    console.log(`\n   ${currency} (${details.valid_series} series):`)
    details.series_list.forEach((series) => {
      console.log(`      • ${series.name}: ${series.data_points} points (${series.date_range})`)
    })
  }

  if (validation.issues.length > 0) {
    console.log("\n⚠️  ISSUES FOUND:")
    validation.issues.forEach((issue) => {
      console.log(`   ${issue.filename}:`)
      issue.issues.forEach((i) => console.log(`      • ${i}`))
    })
  }

  // Save comprehensive validation report
  const report = {
    validation_date: new Date().toISOString(),
    summary: {
      total_files: validation.total_files,
      valid_files: validation.valid_files,
      invalid_files: validation.invalid_files,
      total_data_points: validation.total_data_points,
      currencies: Array.from(validation.currencies),
      currency_count: validation.currencies.size,
    },
    data_quality: validation.data_quality,
    series_by_currency: validation.series_by_currency,
    date_ranges: validation.date_ranges,
    issues: validation.issues,
    recommendations: generateRecommendations(validation),
  }

  fs.writeFileSync(path.join(DATA_DIR, "comprehensive-validation-report.json"), JSON.stringify(report, null, 2))

  console.log(`\n📋 Comprehensive validation report saved: ${DATA_DIR}/comprehensive-validation-report.json`)

  // Final assessment
  const successRate = (validation.valid_files / validation.total_files) * 100
  if (successRate >= 95) {
    console.log("🎉 Excellent! Data quality is outstanding and ready for production use!")
  } else if (successRate >= 85) {
    console.log("✅ Good! Data quality is solid with minor issues to address.")
  } else if (successRate >= 70) {
    console.log("⚠️  Fair! Data quality needs improvement before production use.")
  } else {
    console.log("❌ Poor! Significant data quality issues need to be resolved.")
  }

  console.log(`📊 Overall success rate: ${successRate.toFixed(1)}%`)

  return report
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
    if (!data.metadata.currency) issues.push("Missing metadata.currency")
    if (!data.metadata.country) issues.push("Missing metadata.country")
  }

  // Check data structure and quality
  if (data.data) {
    const years = Object.keys(data.data)
    if (years.length === 0) {
      issues.push("No data points found")
    } else {
      // Check data completeness
      if (years.length < 10) {
        issues.push("Insufficient data points (less than 10 years)")
      }

      // Check a few sample data points
      const sampleYears = years.slice(0, Math.min(5, years.length))
      for (const year of sampleYears) {
        const yearData = data.data[year]
        if (typeof yearData !== "object") {
          issues.push(`Invalid data structure for year ${year}`)
          break
        }
        if (typeof yearData.inflation_factor !== "number" || isNaN(yearData.inflation_factor)) {
          issues.push(`Missing or invalid inflation_factor for year ${year}`)
          break
        }
        if (typeof yearData.index_value !== "number" || isNaN(yearData.index_value)) {
          issues.push(`Missing or invalid index_value for year ${year}`)
          break
        }
        if (yearData.inflation_factor <= 0) {
          issues.push(`Invalid inflation_factor (≤0) for year ${year}`)
          break
        }
      }

      // Check for data consistency
      const sortedYears = years.map((y) => Number.parseInt(y)).sort((a, b) => a - b)
      const latestYear = sortedYears[sortedYears.length - 1]
      const currentYear = new Date().getFullYear()

      if (latestYear < currentYear - 2) {
        issues.push("Data appears outdated (more than 2 years old)")
      }
    }
  }

  return issues
}

function generateRecommendations(validation) {
  const recommendations = []

  if (validation.invalid_files > 0) {
    recommendations.push("Fix data structure issues in invalid files")
  }

  if (validation.data_quality.incomplete_series > validation.data_quality.complete_series) {
    recommendations.push("Extend historical data coverage for incomplete series")
  }

  if (validation.data_quality.recent_data < validation.valid_files * 0.8) {
    recommendations.push("Update data sources to include more recent data")
  }

  const currencyCount = validation.currencies.size
  if (currencyCount < 8) {
    recommendations.push("Add missing major currencies to achieve comprehensive coverage")
  }

  if (validation.issues.length > validation.valid_files * 0.1) {
    recommendations.push("Address data quality issues before production deployment")
  }

  recommendations.push("Implement automated data validation in CI/CD pipeline")
  recommendations.push("Set up monitoring for data freshness and quality")
  recommendations.push("Create data update schedule for each source")

  return recommendations
}

// 🚀 Run comprehensive validation
if (require.main === module) {
  validateAllComprehensiveData().catch((error) => {
    console.error("❌ Comprehensive validation failed:", error)
    process.exit(1)
  })
}

module.exports = { validateAllComprehensiveData }
