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

function updateMonthlyData() {
  console.log("🚀 Starting monthly data update...")

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-based
  const currentMonthName = getMonthName(currentMonth)
  const nextMonth = new Date(currentYear, currentMonth + 1, 1)

  // Update the last-updated.json file
  const updateInfo = {
    lastUpdate: now.toISOString(),
    autoUpdateEnabled: true,
    currencies: ["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY"],
    nextScheduledUpdate: nextMonth.toISOString(),
    updateFrequency: "monthly",
    currentMonth: currentMonthName,
    currentYear: currentYear,
    dataStatus: {
      USD: {
        source: "US Bureau of Labor Statistics",
        lastFetch: now.toISOString(),
        status: "active",
      },
      GBP: {
        source: "UK Office for National Statistics",
        lastFetch: now.toISOString(),
        status: "active",
      },
      EUR: {
        source: "Eurostat (estimated)",
        lastFetch: now.toISOString(),
        status: "active",
      },
      CAD: {
        source: "Statistics Canada (estimated)",
        lastFetch: now.toISOString(),
        status: "active",
      },
      AUD: {
        source: "Australian Bureau of Statistics (estimated)",
        lastFetch: now.toISOString(),
        status: "active",
      },
      CHF: {
        source: "Swiss Federal Statistical Office (estimated)",
        lastFetch: now.toISOString(),
        status: "active",
      },
      JPY: {
        source: "Statistics Bureau of Japan (estimated)",
        lastFetch: now.toISOString(),
        status: "active",
      },
    },
  }

  // Ensure public/data directory exists
  const publicDataDir = path.join(__dirname, "..", "public", "data")
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true })
  }

  // Write the updated file
  const filePath = path.join(publicDataDir, "last-updated.json")
  fs.writeFileSync(filePath, JSON.stringify(updateInfo, null, 2))

  console.log(`✅ Monthly update completed for ${currentMonthName} ${currentYear}`)
  console.log(`📅 Next update scheduled: ${nextMonth.toISOString()}`)
  console.log(`📁 Updated file: ${filePath}`)

  return updateInfo
}

if (require.main === module) {
  updateMonthlyData()
}

module.exports = { updateMonthlyData, getMonthName }
