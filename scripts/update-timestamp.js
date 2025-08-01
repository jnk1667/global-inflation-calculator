const fs = require("fs")
const path = require("path")

function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[monthIndex]
}

function updateTimestamp() {
  console.log("⏰ Updating timestamp...")

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-based
  const currentMonthName = getMonthName(currentMonth)
  const nextMonth = new Date(currentYear, currentMonth + 1, 1)

  const updateInfo = {
    lastUpdate: now.toISOString(),
    nextUpdate: nextMonth.toISOString(),
    currentYear: currentYear,
    currentMonth: currentMonthName,
    autoUpdateEnabled: true,
    sources: {
      USD: "US Bureau of Labor Statistics",
      GBP: "UK Office for National Statistics",
      EUR: "Eurostat (estimated)",
      CAD: "Statistics Canada (estimated)",
      AUD: "Australian Bureau of Statistics (estimated)",
      CHF: "Swiss Federal Statistical Office (estimated)",
      JPY: "Statistics Bureau of Japan (estimated)",
    },
    updateSchedule: {
      dataUpdates: "Monthly (1st of each month)",
      contextUpdates: "Yearly (January 2nd)",
      timezone: "UTC",
    },
  }

  // Ensure data directory exists
  const dataDir = path.join(__dirname, "..", "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(path.join(dataDir, "last-updated.json"), JSON.stringify(updateInfo, null, 2))
  console.log(`✅ Timestamp updated successfully for ${currentMonthName} ${currentYear}`)
  console.log(`📅 Next update scheduled: ${updateInfo.nextUpdate}`)
  console.log(`🤖 Auto-updates: ${updateInfo.autoUpdateEnabled ? "ENABLED" : "DISABLED"}`)
}

if (require.main === module) {
  updateTimestamp()
}

module.exports = { updateTimestamp, getMonthName }
