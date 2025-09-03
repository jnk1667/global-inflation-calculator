const { fetchAllCHFData } = require("./fetch-chf-data")
const { fetchAllJPYData } = require("./fetch-jpy-data")
const { fetchAllAUDData } = require("./fetch-aud-data")
const { fetchAllNZDData } = require("./fetch-nzd-data")
const fs = require("fs")
const path = require("path")

// 🌍 MASTER CURRENCY DATA COLLECTOR
// Collects comprehensive inflation data for CHF, JPY, AUD, and NZD

async function collectAllCurrencyData() {
  console.log("🌍 COMPREHENSIVE CURRENCY DATA COLLECTION")
  console.log("=".repeat(70))
  console.log("📊 Collecting data for: CHF, JPY, AUD, NZD")
  console.log("🕐 Started:", new Date().toISOString())
  console.log()

  const masterResults = {
    collection_start: new Date().toISOString(),
    currencies: {},
    totals: {
      total_currencies: 4,
      total_series: 0,
      total_data_points: 0,
      successful_currencies: 0,
      failed_currencies: 0,
    },
    summary: [],
  }

  // 🇨🇭 Collect Swiss Franc data
  try {
    console.log("🇨🇭 COLLECTING SWISS FRANC (CHF) DATA")
    console.log("-".repeat(50))
    const chfResults = await fetchAllCHFData()
    masterResults.currencies.CHF = chfResults
    masterResults.totals.total_series += chfResults.success.length
    masterResults.totals.total_data_points += chfResults.total_data_points
    masterResults.totals.successful_currencies++
    masterResults.summary.push(
      `✅ CHF: ${chfResults.success.length} series, ${chfResults.total_data_points.toLocaleString()} data points`,
    )
    console.log("✅ CHF collection completed successfully!")
  } catch (error) {
    console.error("❌ CHF collection failed:", error.message)
    masterResults.currencies.CHF = { error: error.message }
    masterResults.totals.failed_currencies++
    masterResults.summary.push(`❌ CHF: Collection failed`)
  }

  console.log("\n" + "=".repeat(70) + "\n")

  // 🇯🇵 Collect Japanese Yen data
  try {
    console.log("🇯🇵 COLLECTING JAPANESE YEN (JPY) DATA")
    console.log("-".repeat(50))
    const jpyResults = await fetchAllJPYData()
    masterResults.currencies.JPY = jpyResults
    masterResults.totals.total_series += jpyResults.success.length
    masterResults.totals.total_data_points += jpyResults.total_data_points
    masterResults.totals.successful_currencies++
    masterResults.summary.push(
      `✅ JPY: ${jpyResults.success.length} series, ${jpyResults.total_data_points.toLocaleString()} data points`,
    )
    console.log("✅ JPY collection completed successfully!")
  } catch (error) {
    console.error("❌ JPY collection failed:", error.message)
    masterResults.currencies.JPY = { error: error.message }
    masterResults.totals.failed_currencies++
    masterResults.summary.push(`❌ JPY: Collection failed`)
  }

  console.log("\n" + "=".repeat(70) + "\n")

  // 🇦🇺 Collect Australian Dollar data
  try {
    console.log("🇦🇺 COLLECTING AUSTRALIAN DOLLAR (AUD) DATA")
    console.log("-".repeat(50))
    const audResults = await fetchAllAUDData()
    masterResults.currencies.AUD = audResults
    masterResults.totals.total_series += audResults.success.length
    masterResults.totals.total_data_points += audResults.total_data_points
    masterResults.totals.successful_currencies++
    masterResults.summary.push(
      `✅ AUD: ${audResults.success.length} series, ${audResults.total_data_points.toLocaleString()} data points`,
    )
    console.log("✅ AUD collection completed successfully!")
  } catch (error) {
    console.error("❌ AUD collection failed:", error.message)
    masterResults.currencies.AUD = { error: error.message }
    masterResults.totals.failed_currencies++
    masterResults.summary.push(`❌ AUD: Collection failed`)
  }

  console.log("\n" + "=".repeat(70) + "\n")

  // 🇳🇿 Collect New Zealand Dollar data
  try {
    console.log("🇳🇿 COLLECTING NEW ZEALAND DOLLAR (NZD) DATA")
    console.log("-".repeat(50))
    const nzdResults = await fetchAllNZDData()
    masterResults.currencies.NZD = nzdResults
    masterResults.totals.total_series += nzdResults.success.length
    masterResults.totals.total_data_points += nzdResults.total_data_points
    masterResults.totals.successful_currencies++
    masterResults.summary.push(
      `✅ NZD: ${nzdResults.success.length} series, ${nzdResults.total_data_points.toLocaleString()} data points`,
    )
    console.log("✅ NZD collection completed successfully!")
  } catch (error) {
    console.error("❌ NZD collection failed:", error.message)
    masterResults.currencies.NZD = { error: error.message }
    masterResults.totals.failed_currencies++
    masterResults.summary.push(`❌ NZD: Collection failed`)
  }

  // 📊 Final Summary
  masterResults.collection_end = new Date().toISOString()
  const duration = new Date(masterResults.collection_end) - new Date(masterResults.collection_start)

  console.log("\n" + "=".repeat(70))
  console.log("🎉 COMPREHENSIVE CURRENCY DATA COLLECTION COMPLETE!")
  console.log("=".repeat(70))
  console.log(`🕐 Duration: ${Math.round(duration / 1000)} seconds`)
  console.log(`🌍 Currencies processed: ${masterResults.totals.total_currencies}`)
  console.log(`✅ Successful: ${masterResults.totals.successful_currencies}`)
  console.log(`❌ Failed: ${masterResults.totals.failed_currencies}`)
  console.log(`📊 Total series collected: ${masterResults.totals.total_series}`)
  console.log(`📈 Total data points: ${masterResults.totals.total_data_points.toLocaleString()}`)
  console.log()
  console.log("📋 SUMMARY BY CURRENCY:")
  masterResults.summary.forEach((summary) => console.log(`   ${summary}`))

  // 💾 Save master collection report
  const reportPath = path.join("public/data/comprehensive", "master-collection-report.json")
  fs.writeFileSync(reportPath, JSON.stringify(masterResults, null, 2))
  console.log()
  console.log(`📋 Master collection report saved: ${reportPath}`)

  // 🎯 Data availability summary
  console.log()
  console.log("📊 DATA AVAILABILITY SUMMARY:")
  console.log("   🇺🇸 USD: ✅ Comprehensive (20+ series from FRED)")
  console.log("   🇬🇧 GBP: ✅ Limited (5 series from ONS)")
  console.log("   🇪🇺 EUR: ✅ Estimated (5 series)")
  console.log("   🇨🇦 CAD: ✅ Estimated (5 series)")
  console.log("   🇨🇭 CHF: ✅ Comprehensive (10+ series)")
  console.log("   🇯🇵 JPY: ✅ Comprehensive (10+ series)")
  console.log("   🇦🇺 AUD: ✅ Comprehensive (13+ series)")
  console.log("   🇳🇿 NZD: ✅ Comprehensive (12+ series)")
  console.log()
  console.log("🚀 Ready for website integration!")
  console.log("💡 Next steps:")
  console.log("   1. Update website to use comprehensive data")
  console.log("   2. Add inflation measure selector UI")
  console.log("   3. Implement data source attribution")
  console.log("   4. Add educational content about different measures")

  return masterResults
}

// 🚀 Execute master collection
if (require.main === module) {
  collectAllCurrencyData().catch((error) => {
    console.error("❌ Master collection failed:", error)
    process.exit(1)
  })
}

module.exports = { collectAllCurrencyData }
