const fs = require("fs")
const https = require("https")

async function fetchUKInflationData() {
  console.log("🇬🇧 Fetching UK inflation data...")

  try {
    // ONS API endpoint for RPI (Retail Price Index)
    const apiUrl = "https://api.ons.gov.uk/timeseries/chaw/data"

    const data = await new Promise((resolve, reject) => {
      https
        .get(apiUrl, (res) => {
          let body = ""
          res.on("data", (chunk) => (body += chunk))
          res.on("end", () => {
            try {
              resolve(JSON.parse(body))
            } catch (e) {
              reject(e)
            }
          })
        })
        .on("error", reject)
    })

    const processedData = processONSData(data.months)

    const outputData = {
      currency: "GBP",
      symbol: "£",
      name: "British Pound",
      flag: "🇬🇧",
      earliest: 1947,
      latest: new Date().getFullYear(),
      lastUpdated: new Date().toISOString(),
      source: "UK Office for National Statistics",
      data: processedData,
    }

    fs.writeFileSync("public/data/gbp-inflation.json", JSON.stringify(outputData, null, 2))
    console.log("✅ UK inflation data updated successfully")
  } catch (error) {
    console.error("❌ Failed to fetch UK data:", error.message)
    process.exit(0)
  }
}

function processONSData(rawData) {
  const processedData = {}
  let baseValue = null

  rawData.forEach((item) => {
    const year = Number.parseInt(item.date.substring(0, 4))
    const value = Number.parseFloat(item.value)

    if (!baseValue) baseValue = value

    // Use annual average for each year
    if (!processedData[year.toString()] || item.date.endsWith("-12")) {
      processedData[year.toString()] = value / baseValue
    }
  })

  return processedData
}

fetchUKInflationData()
