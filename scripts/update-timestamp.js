const fs = require("fs")

function updateTimestamp() {
  console.log("⏰ Updating timestamp...")

  const now = new Date()
  const currentYear = now.getFullYear()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const updateInfo = {
    lastUpdate: now.toISOString(),
    nextUpdate: nextMonth.toISOString(),
    currentYear: currentYear, // 🎯 Add current year for dynamic updates
    autoUpdateEnabled: true, // 🤖 Indicates auto-updates are active
    sources: {
      USD: "US Bureau of Labor Statistics",
      GBP: "UK Office for National Statistics",
      EUR: "Eurostat (estimated)",
      CAD: "Statistics Canada (estimated)",
      AUD: "Australian Bureau of Statistics (estimated)",
    },
    updateSchedule: {
      dataUpdates: "Monthly (1st of each month)",
      contextUpdates: "Yearly (January 2nd)",
      timezone: "UTC",
    },
  }

  // Ensure data directory exists
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data", { recursive: true })
  }

  fs.writeFileSync("data/last-updated.json", JSON.stringify(updateInfo, null, 2))
  console.log(`✅ Timestamp updated successfully for year ${currentYear}`)
  console.log(`📅 Next update scheduled: ${updateInfo.nextUpdate}`)
  console.log(`🤖 Auto-updates: ${updateInfo.autoUpdateEnabled ? "ENABLED" : "DISABLED"}`)
}

updateTimestamp()
