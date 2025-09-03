const fs = require("fs")
const path = require("path")

// 🌍 MASTER COMPREHENSIVE DATA COLLECTOR
// Collects all inflation indicators for all currencies using official government sources

const DATA_DIR = "public/data/comprehensive"

// Import all collection modules
const { fetchAllComprehensiveData } = require("./fetch-comprehensive-inflation-data")
const { fetchAllGBPData } = require("./fetch-gbp-comprehensive")
const { fetchAllEURData } = require("./fetch-eur-comprehensive")
const { fetchAllCADData } = require("./fetch-cad-comprehensive")
const { fetchAllCHFData } = require("./fetch-chf-data")
const { fetchAllJPYData } = require("./fetch-jpy-data")
const { fetchAllAUDData } = require("./fetch-aud-data")
const { fetchAllNZDData } = require("./fetch-nzd-data")

async function collectAllComprehensiveData() {
  console.log("🌍 MASTER COMPREHENSIVE INFLATION DATA COLLECTION")
  console.log("=".repeat(80))
  console.log("📊 Collecting official government data for all major currencies")
  console.log("🏛️  Using: FRED, ONS, Eurostat, StatCan, FSO, BOJ, ABS, Stats NZ, RBNZ")
  console.log("=".repeat(80))

  const startTime = Date.now()
  const masterResults = {
    currencies: [],
    total_series: 0,
    total_data_points: 0,
    collection_time: null,
    successful_currencies: [],
    failed_currencies: [],
  }

  // 🇺🇸 United States (USD) - FRED comprehensive data
  console.log("\n🇺🇸 COLLECTING USD DATA FROM FRED...")
  try {
    const usdResults = await fetchAllComprehensiveData()
    masterResults.currencies.push({ currency: "USD", ...usdResults })
    masterResults.total_series += usdResults.total_series
    masterResults.total_data_points += usdResults.total_data_points
    masterResults.successful_currencies.push("USD")
    console.log("✅ USD collection completed successfully")
  } catch (error) {
    console.error("❌ USD collection failed:", error.message)
    masterResults.failed_currencies.push("USD")
  }

  // 🇬🇧 United Kingdom (GBP) - ONS comprehensive data
  console.log("\n🇬🇧 COLLECTING GBP DATA FROM ONS...")
  try {
    const gbpResults = await fetchAllGBPData()
    masterResults.currencies.push({ currency: "GBP", ...gbpResults })
    masterResults.total_series += gbpResults.total_series
    masterResults.total_data_points += gbpResults.total_data_points
    masterResults.successful_currencies.push("GBP")
    console.log("✅ GBP collection completed successfully")
  } catch (error) {
    console.error("❌ GBP collection failed:", error.message)
    masterResults.failed_currencies.push("GBP")
  }

  // 🇪🇺 Eurozone (EUR) - Eurostat comprehensive data
  console.log("\n🇪🇺 COLLECTING EUR DATA FROM EUROSTAT...")
  try {
    const eurResults = await fetchAllEURData()
    masterResults.currencies.push({ currency: "EUR", ...eurResults })
    masterResults.total_series += eurResults.total_series
    masterResults.total_data_points += eurResults.total_data_points
    masterResults.successful_currencies.push("EUR")
    console.log("✅ EUR collection completed successfully")
  } catch (error) {
    console.error("❌ EUR collection failed:", error.message)
    masterResults.failed_currencies.push("EUR")
  }

  // 🇨🇦 Canada (CAD) - Statistics Canada comprehensive data
  console.log("\n🇨🇦 COLLECTING CAD DATA FROM STATISTICS CANADA...")
  try {
    const cadResults = await fetchAllCADData()
    masterResults.currencies.push({ currency: "CAD", ...cadResults })
    masterResults.total_series += cadResults.total_series
    masterResults.total_data_points += cadResults.total_data_points
    masterResults.successful_currencies.push("CAD")
    console.log("✅ CAD collection completed successfully")
  } catch (error) {
    console.error("❌ CAD collection failed:", error.message)
    masterResults.failed_currencies.push("CAD")
  }

  // 🇨🇭 Switzerland (CHF) - FSO comprehensive data
  console.log("\n🇨🇭 COLLECTING CHF DATA FROM FSO...")
  try {
    const chfResults = await fetchAllCHFData()
    masterResults.currencies.push({ currency: "CHF", ...chfResults })
    masterResults.total_series += chfResults.total_series
    masterResults.total_data_points += chfResults.total_data_points
    masterResults.successful_currencies.push("CHF")
    console.log("✅ CHF collection completed successfully")
  } catch (error) {
    console.error("❌ CHF collection failed:", error.message)
    masterResults.failed_currencies.push("CHF")
  }

  // 🇯🇵 Japan (JPY) - BOJ/Statistics Bureau comprehensive data
  console.log("\n🇯🇵 COLLECTING JPY DATA FROM BOJ/STATISTICS BUREAU...")
  try {
    const jpyResults = await fetchAllJPYData()
    masterResults.currencies.push({ currency: "JPY", ...jpyResults })
    masterResults.total_series += jpyResults.total_series
    masterResults.total_data_points += jpyResults.total_data_points
    masterResults.successful_currencies.push("JPY")
    console.log("✅ JPY collection completed successfully")
  } catch (error) {
    console.error("❌ JPY collection failed:", error.message)
    masterResults.failed_currencies.push("JPY")
  }

  // 🇦🇺 Australia (AUD) - ABS/RBA comprehensive data
  console.log("\n🇦🇺 COLLECTING AUD DATA FROM ABS/RBA...")
  try {
    const audResults = await fetchAllAUDData()
    masterResults.currencies.push({ currency: "AUD", ...audResults })
    masterResults.total_series += audResults.total_series
    masterResults.total_data_points += audResults.total_data_points
    masterResults.successful_currencies.push("AUD")
    console.log("✅ AUD collection completed successfully")
  } catch (error) {
    console.error("❌ AUD collection failed:", error.message)
    masterResults.failed_currencies.push("AUD")
  }

  // 🇳🇿 New Zealand (NZD) - Stats NZ/RBNZ comprehensive data
  console.log("\n🇳🇿 COLLECTING NZD DATA FROM STATS NZ/RBNZ...")
  try {
    const nzdResults = await fetchAllNZDData()
    masterResults.currencies.push({ currency: "NZD", ...nzdResults })
    masterResults.total_series += nzdResults.total_series
    masterResults.total_data_points += nzdResults.total_data_points
    masterResults.successful_currencies.push("NZD")
    console.log("✅ NZD collection completed successfully")
  } catch (error) {
    console.error("❌ NZD collection failed:", error.message)
    masterResults.failed_currencies.push("NZD")
  }

  // Calculate collection time
  const endTime = Date.now()
  masterResults.collection_time = Math.round((endTime - startTime) / 1000)

  // 📊 Final Summary
  console.log("\n" + "=".repeat(80))
  console.log("🎉 MASTER COMPREHENSIVE DATA COLLECTION COMPLETE")
  console.log("=".repeat(80))
  console.log(`⏱️  Total collection time: ${masterResults.collection_time} seconds`)
  console.log(`💰 Currencies collected: ${masterResults.successful_currencies.length}/8`)
  console.log(`📊 Total data series: ${masterResults.total_series}`)
  console.log(`📈 Total data points: ${masterResults.total_data_points.toLocaleString()}`)

  console.log("\n✅ SUCCESSFUL CURRENCIES:")
  masterResults.successful_currencies.forEach((currency) => {
    const currencyData = masterResults.currencies.find((c) => c.currency === currency)
    if (currencyData) {
      console.log(
        `   ${currency}: ${currencyData.total_series} series, ${currencyData.total_data_points.toLocaleString()} data points`,
      )
    }
  })

  if (masterResults.failed_currencies.length > 0) {
    console.log("\n❌ FAILED CURRENCIES:")
    masterResults.failed_currencies.forEach((currency) => {
      console.log(`   ${currency}: Collection failed`)
    })
  }

  // Save master collection summary
  const masterSummary = {
    collection_date: new Date().toISOString(),
    collection_time_seconds: masterResults.collection_time,
    total_currencies: masterResults.successful_currencies.length,
    total_series: masterResults.total_series,
    total_data_points: masterResults.total_data_points,
    successful_currencies: masterResults.successful_currencies,
    failed_currencies: masterResults.failed_currencies,
    currency_details: masterResults.currencies,
    data_sources: {
      USD: "Federal Reserve Economic Data (FRED)",
      GBP: "UK Office for National Statistics (ONS)",
      EUR: "Eurostat",
      CAD: "Statistics Canada",
      CHF: "Swiss Federal Statistical Office (FSO)",
      JPY: "Bank of Japan (BOJ) / Statistics Bureau",
      AUD: "Australian Bureau of Statistics (ABS) / Reserve Bank of Australia (RBA)",
      NZD: "Stats NZ / Reserve Bank of New Zealand (RBNZ)",
    },
    methodology_note: "Comprehensive collection of multiple inflation measures per currency for maximum accuracy",
  }

  fs.writeFileSync(path.join(DATA_DIR, "master-collection-summary.json"), JSON.stringify(masterSummary, null, 2))

  console.log(`\n📋 Master summary saved: ${DATA_DIR}/master-collection-summary.json`)
  console.log("🚀 All data ready for website integration!")
  console.log("\n💡 Next steps:")
  console.log("   1. Run validation: node scripts/validate-comprehensive-data.js")
  console.log("   2. Update website to use comprehensive data")
  console.log("   3. Add inflation measure selector to UI")
  console.log("   4. Update methodology documentation")

  return masterResults
}

// 🚀 Execute master collection
if (require.main === module) {
  collectAllComprehensiveData().catch((error) => {
    console.error("❌ Master collection failed:", error)
    process.exit(1)
  })
}

module.exports = { collectAllComprehensiveData }
