const fs = require("fs")
const https = require("https")

// 🔍 SYSTEM HEALTH MONITOR
async function monitorSystemHealth() {
  console.log("🔍 Checking system health and update status...")

  const report = {
    timestamp: new Date().toISOString(),
    dataStatus: {},
    systemStatus: "healthy",
    issues: [],
    recommendations: [],
  }

  // Check data file integrity
  const currencies = ["USD", "GBP", "EUR", "CAD", "AUD"]

  for (const currency of currencies) {
    try {
      const filePath = `public/data/${currency.toLowerCase()}-inflation.json`

      if (!fs.existsSync(filePath)) {
        report.issues.push(`❌ Missing data file: ${currency}`)
        report.systemStatus = "degraded"
        continue
      }

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
      const currentYear = new Date().getFullYear()
      const dataYears = Object.keys(data.data)
        .map(Number)
        .sort((a, b) => b - a)
      const latestDataYear = dataYears[0]
      const dataAge = currentYear - latestDataYear

      report.dataStatus[currency] = {
        latestYear: latestDataYear,
        totalYears: dataYears.length,
        dataAge: dataAge,
        status: dataAge <= 1 ? "current" : "outdated",
        lastUpdated: data.lastUpdated || "unknown",
      }

      if (dataAge > 1) {
        report.issues.push(`⚠️ ${currency} data is ${dataAge} years old`)
        if (report.systemStatus === "healthy") report.systemStatus = "warning"
      }
    } catch (error) {
      report.issues.push(`❌ Error reading ${currency} data: ${error.message}`)
      report.systemStatus = "error"
    }
  }

  // Check GitHub Actions status (if we can access it)
  try {
    const lastUpdateFile = "data/last-updated.json"
    if (fs.existsSync(lastUpdateFile)) {
      const updateInfo = JSON.parse(fs.readFileSync(lastUpdateFile, "utf8"))
      const lastUpdate = new Date(updateInfo.lastUpdate)
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

      report.lastSystemUpdate = {
        date: updateInfo.lastUpdate,
        daysAgo: daysSinceUpdate,
        autoUpdatesEnabled: updateInfo.autoUpdateEnabled || false,
      }

      if (daysSinceUpdate > 35) {
        // More than a month
        report.issues.push(`⚠️ System hasn't updated in ${daysSinceUpdate} days`)
        if (report.systemStatus === "healthy") report.systemStatus = "warning"
      }
    }
  } catch (error) {
    report.issues.push(`❌ Could not check update status: ${error.message}`)
  }

  // Generate recommendations
  if (report.systemStatus !== "healthy") {
    report.recommendations.push("🔧 Check GitHub Actions workflow status")
    report.recommendations.push("📊 Verify data source APIs are accessible")
    report.recommendations.push("🔄 Consider manual data update if auto-updates are failing")
  }

  // Output report
  console.log("\n📊 SYSTEM HEALTH REPORT")
  console.log("=======================")
  console.log(`🎯 Overall Status: ${getStatusEmoji(report.systemStatus)} ${report.systemStatus.toUpperCase()}`)

  console.log("\n📈 Data Status:")
  Object.entries(report.dataStatus).forEach(([currency, status]) => {
    const statusEmoji = status.status === "current" ? "✅" : "⚠️"
    console.log(
      `   ${statusEmoji} ${currency}: ${status.latestYear} (${status.totalYears} years, ${status.dataAge} years old)`,
    )
  })

  if (report.issues.length > 0) {
    console.log("\n⚠️ Issues Found:")
    report.issues.forEach((issue) => console.log(`   ${issue}`))
  }

  if (report.recommendations.length > 0) {
    console.log("\n💡 Recommendations:")
    report.recommendations.forEach((rec) => console.log(`   ${rec}`))
  }

  if (report.lastSystemUpdate) {
    console.log(`\n🕐 Last System Update: ${report.lastSystemUpdate.daysAgo} days ago`)
    console.log(`🤖 Auto-Updates: ${report.lastSystemUpdate.autoUpdatesEnabled ? "ENABLED" : "DISABLED"}`)
  }

  console.log(`\n📅 Report Generated: ${report.timestamp}`)

  return report
}

function getStatusEmoji(status) {
  switch (status) {
    case "healthy":
      return "✅"
    case "warning":
      return "⚠️"
    case "degraded":
      return "🟡"
    case "error":
      return "❌"
    default:
      return "❓"
  }
}

if (require.main === module) {
  monitorSystemHealth().catch((error) => {
    console.error("❌ Health check failed:", error)
    process.exit(1)
  })
}

module.exports = { monitorSystemHealth }
