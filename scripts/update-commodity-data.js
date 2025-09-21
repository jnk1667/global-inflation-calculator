import { execSync } from "child_process"
import fs from "fs"
import path from "path"

function checkApiKeys() {
  const requiredKeys = ["FRED_API_KEY"]
  const missingKeys = []

  requiredKeys.forEach((key) => {
    if (!process.env[key]) {
      missingKeys.push(key)
    }
  })

  if (missingKeys.length > 0) {
    console.log("⚠️  Missing API keys:")
    missingKeys.forEach((key) => {
      console.log(`   - ${key}`)
    })
    console.log("")
    console.log("To get free API keys:")
    console.log("- FRED_API_KEY: https://fred.stlouisfed.org/docs/api/api_key.html (unlimited free)")
    console.log("")
    return false
  }

  return true
}

function getLastUpdateTime() {
  const dataDir = path.join(process.cwd(), "public", "data", "commodities")
  const goldFile = path.join(dataDir, "gold-usd.json")

  if (fs.existsSync(goldFile)) {
    const data = JSON.parse(fs.readFileSync(goldFile, "utf8"))
    return new Date(data.metadata.lastUpdated)
  }

  return null
}

function shouldUpdate() {
  const lastUpdate = getLastUpdateTime()

  if (!lastUpdate) {
    console.log("No previous data found. Running initial data collection...")
    return true
  }

  const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)

  if (hoursSinceUpdate >= 24) {
    console.log(`Last update: ${lastUpdate.toISOString()}`)
    console.log(`Hours since update: ${hoursSinceUpdate.toFixed(1)}`)
    console.log("Running daily update...")
    return true
  }

  console.log(`Data is up to date. Last updated: ${lastUpdate.toISOString()}`)
  console.log(`Next update in: ${(24 - hoursSinceUpdate).toFixed(1)} hours`)
  return false
}

function main() {
  console.log("=== Commodity Data Update Script ===")
  console.log("")

  // Check if API keys are available
  if (!checkApiKeys()) {
    console.log("Skipping update due to missing API keys.")
    return
  }

  // Check if update is needed
  if (!shouldUpdate()) {
    console.log("Update not needed at this time.")
    return
  }

  try {
    console.log("Running commodity data collection...")
    execSync("node scripts/fetch-gold-silver-data.js", { stdio: "inherit" })

    console.log("")
    console.log("✅ Commodity data update completed successfully!")

    console.log("")
    console.log("📊 API Usage Reminder:")
    console.log("- FRED API: Unlimited (free)")
    console.log("- CoinDesk API: Unlimited (free)")
    console.log("")
    console.log("💡 Tip: Run this script daily to keep data fresh.")
  } catch (error) {
    console.error("❌ Error updating commodity data:", error.message)
  }
}

main()
