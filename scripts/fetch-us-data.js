const fs = require("fs")
const https = require("https")

async function fetchUSInflationData() {
  console.log("🇺🇸 Fetching US inflation data...")

  try {
    // BLS API endpoint for CPI-U (Consumer Price Index for All Urban Consumers)
    const apiUrl = "https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0"

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

    if (data.status === "REQUEST_SUCCEEDED") {
      const processedData = processBLSData(data.Results.series[0].data)

      const outputData = {
        currency: "USD",
        symbol: "$",
        name: "US Dollar",
        flag: "🇺🇸",
        earliest: 1913,
        latest: new Date().getFullYear(),
        lastUpdated: new Date().toISOString(),
        source: "US Bureau of Labor Statistics",
        data: processedData,
      }

      fs.writeFileSync("public/data/usd-inflation.json", JSON.stringify(outputData, null, 2))
      console.log("✅ US inflation data updated successfully")
    } else {
      throw new Error("BLS API request failed")
    }
  } catch (error) {
    console.error("❌ Failed to fetch US data:", error.message)
    // Don't fail the entire workflow if one country fails
    process.exit(0)
  }
}

function processBLSData(rawData) {
  const processedData = {}
  let baseValue = null

  // Sort data by year
  rawData.sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year))

  rawData.forEach((item) => {
    const year = Number.parseInt(item.year)
    const value = Number.parseFloat(item.value)

    if (!baseValue) baseValue = value

    // Calculate cumulative inflation factor
    processedData[year.toString()] = value / baseValue
  })

  return processedData
}

fetchUSInflationData()
