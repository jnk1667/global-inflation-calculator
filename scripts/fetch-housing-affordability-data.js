const fs = require("fs")
const https = require("https")
const path = require("path")

// 🏠 HOUSING AFFORDABILITY DATA COLLECTOR
// Fetches Case-Shiller Home Price Index and Median Household Income from FRED

const FRED_API_KEY = process.env.FRED_API_KEY || "your_fred_api_key_here"
const DATA_DIR = "public/data"

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// FRED Series IDs
const SERIES = {
  CASE_SHILLER: "CSUSHPISA", // S&P/Case-Shiller U.S. National Home Price Index
  MEDIAN_INCOME: "MEHOINUSA672N", // Real Median Household Income in the United States
}

async function fetchHousingAffordabilityData() {
  console.log("🏠 Starting housing affordability data collection...")
  console.log("📊 Fetching Case-Shiller Index and Median Household Income from FRED...")

  try {
    // Fetch Case-Shiller data (monthly, from 1987)
    console.log("\n📈 Fetching Case-Shiller Home Price Index...")
    const caseShillerData = await fetchFREDSeries(SERIES.CASE_SHILLER, "1987-01-01")
    console.log(`✅ Case-Shiller: ${caseShillerData.observations.length} monthly observations`)

    // Fetch Median Income data (annual, from 1984)
    console.log("\n💰 Fetching Median Household Income...")
    const medianIncomeData = await fetchFREDSeries(SERIES.MEDIAN_INCOME, "1984-01-01")
    console.log(`✅ Median Income: ${medianIncomeData.observations.length} annual observations`)

    // Process the data
    console.log("\n🔄 Processing data...")
    const processedData = processHousingData(caseShillerData, medianIncomeData)

    // Save to JSON
    const outputPath = path.join(DATA_DIR, "housing-affordability.json")
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2))

    console.log("\n" + "=".repeat(60))
    console.log("✅ HOUSING AFFORDABILITY DATA COLLECTION COMPLETE")
    console.log("=".repeat(60))
    console.log(`📁 Data saved to: ${outputPath}`)
    console.log(`📅 Years covered: ${processedData.earliest_year} - ${processedData.latest_year}`)
    console.log(`📊 Total years: ${processedData.total_years}`)
    console.log(`🏠 Latest home price index: ${processedData.latest_data.home_price_index}`)
    console.log(`💰 Latest median income: $${processedData.latest_data.median_income.toLocaleString()}`)
    console.log(`📈 Latest affordability ratio: ${processedData.latest_data.price_to_income_ratio}x`)
    console.log(`🕐 Last updated: ${processedData.last_updated}`)
    console.log("\n🚀 Ready to use in the Housing Affordability Calculator!")
  } catch (error) {
    console.error("\n❌ Error collecting housing affordability data:", error.message)
    process.exit(1)
  }
}

async function fetchFREDSeries(seriesId, startDate) {
  return new Promise((resolve, reject) => {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}`

    https
      .get(url, (res) => {
        let body = ""
        res.on("data", (chunk) => (body += chunk))
        res.on("end", () => {
          try {
            const data = JSON.parse(body)
            if (data.error_code) {
              reject(new Error(`FRED API Error: ${data.error_message}`))
            } else {
              resolve(data)
            }
          } catch (error) {
            reject(error)
          }
        })
      })
      .on("error", reject)
  })
}

function processHousingData(caseShillerData, medianIncomeData) {
  // Process Case-Shiller data (convert monthly to annual averages)
  const yearlyHomePrices = {}
  caseShillerData.observations.forEach((obs) => {
    if (obs.value !== "." && !isNaN(Number.parseFloat(obs.value))) {
      const year = new Date(obs.date).getFullYear()
      const value = Number.parseFloat(obs.value)

      if (!yearlyHomePrices[year]) {
        yearlyHomePrices[year] = { sum: 0, count: 0 }
      }

      yearlyHomePrices[year].sum += value
      yearlyHomePrices[year].count += 1
    }
  })

  // Calculate annual averages for home prices
  const homePricesByYear = {}
  Object.keys(yearlyHomePrices).forEach((year) => {
    homePricesByYear[year] = yearlyHomePrices[year].sum / yearlyHomePrices[year].count
  })

  // Process Median Income data (already annual)
  const medianIncomeByYear = {}
  medianIncomeData.observations.forEach((obs) => {
    if (obs.value !== "." && !isNaN(Number.parseFloat(obs.value))) {
      const year = new Date(obs.date).getFullYear()
      medianIncomeByYear[year] = Number.parseFloat(obs.value)
    }
  })

  // Combine data and calculate affordability ratios
  const affordabilityData = {}
  const years = Object.keys(homePricesByYear)
    .filter((year) => medianIncomeByYear[year]) // Only include years with both data points
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

  // Use 2000 as base year for index normalization
  const baseYear = "2000"
  const baseHomePrice = homePricesByYear[baseYear]

  years.forEach((year) => {
    const homePriceIndex = homePricesByYear[year]
    const medianIncome = medianIncomeByYear[year]

    // Calculate approximate median home price
    // Case-Shiller is an index (Jan 2000 = 100), so we need to convert to actual prices
    // Using approximate 2000 median home price of $165,000
    const approximateMedianHomePrice = (homePriceIndex / baseHomePrice) * 165000

    // Calculate price-to-income ratio
    const priceToIncomeRatio = approximateMedianHomePrice / medianIncome

    affordabilityData[year] = {
      year: Number.parseInt(year),
      home_price_index: Number.parseFloat(homePriceIndex.toFixed(2)),
      median_income: Math.round(medianIncome),
      approximate_median_home_price: Math.round(approximateMedianHomePrice),
      price_to_income_ratio: Number.parseFloat(priceToIncomeRatio.toFixed(2)),
    }
  })

  const latestYear = years[years.length - 1]

  return {
    metadata: {
      source: "Federal Reserve Economic Data (FRED)",
      case_shiller_series: "CSUSHPISA - S&P/Case-Shiller U.S. National Home Price Index",
      median_income_series: "MEHOINUSA672N - Real Median Household Income",
      base_year: baseYear,
      base_year_median_home_price: 165000,
      notes:
        "Home prices are approximated using Case-Shiller Index with 2000 baseline. Price-to-income ratio shows how many years of median household income needed to purchase median home.",
    },
    last_updated: new Date().toISOString(),
    earliest_year: years[0],
    latest_year: latestYear,
    total_years: years.length,
    latest_data: affordabilityData[latestYear],
    data: affordabilityData,
  }
}

// Execute the data collection
if (require.main === module) {
  fetchHousingAffordabilityData().catch((error) => {
    console.error("❌ Critical error:", error)
    process.exit(1)
  })
}

module.exports = { fetchHousingAffordabilityData }
