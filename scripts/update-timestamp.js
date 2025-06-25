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
    sources: {
      USD: "US Bureau of Labor Statistics",
      GBP: "UK Office for National Statistics",
      EUR: "Eurostat",
      CAD: "Statistics Canada",
      AUD: "Australian Bureau of Statistics",
    },
  }

  fs.writeFileSync("data/last-updated.json", JSON.stringify(updateInfo, null, 2))
  console.log(`✅ Timestamp updated successfully for year ${currentYear}`)
}

updateTimestamp()
