import fetch from "node-fetch"
import fs from "fs"
import path from "path"

// Free API endpoints - no API keys required for these
const COINDESK_BTC_API = "https://api.coindesk.com/v1/bpi/currentprice.json"
const COINDESK_HISTORICAL = "https://api.coindesk.com/v1/bpi/historical/close.json"

// FRED API - requires free API key (unlimited usage)
const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

// Currency codes for our 8 supported currencies
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "CHF", "AUD", "JPY", "NZD"]

// FRED series IDs for commodity prices
const FRED_SERIES = {
  GOLD_USD: "GOLDAMGBD228NLBM", // Gold price in USD per troy ounce
  SILVER_USD: "SILVERPRICE", // Silver price in USD per troy ounce
  COPPER_USD: "PCOPPUSDM", // Copper price in USD
  CRUDE_OIL_USD: "DCOILWTICO", // Crude oil price in USD
}

async function fetchFredData(seriesId, startDate = "1970-01-01") {
  if (!FRED_API_KEY) {
    console.log("FRED_API_KEY not found, skipping FRED data...")
    return null
  }

  try {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.observations) {
      return data.observations
        .filter((obs) => obs.value !== ".")
        .map((obs) => ({
          date: obs.date,
          value: Number.parseFloat(obs.value),
        }))
    }
    return null
  } catch (error) {
    console.error(`Error fetching FRED data for ${seriesId}:`, error)
    return null
  }
}

async function fetchCoinDeskBitcoinData() {
  try {
    // Get current BTC price
    const currentResponse = await fetch(COINDESK_BTC_API)
    const currentData = await currentResponse.json()

    // Get historical BTC data (last 31 days)
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const historicalUrl = `${COINDESK_HISTORICAL}?start=${startDate}&end=${endDate}`
    const historicalResponse = await fetch(historicalUrl)
    const historicalData = await historicalResponse.json()

    return {
      current: currentData,
      historical: historicalData,
    }
  } catch (error) {
    console.error("Error fetching CoinDesk Bitcoin data:", error)
    return null
  }
}

function processGoldData(fredData) {
  const goldData = {
    metadata: {
      source: "FRED API",
      description: "Historical gold prices in USD per troy ounce",
      lastUpdated: new Date().toISOString(),
      currency: "USD",
      unit: "USD per troy ounce",
    },
    data: [],
  }

  // Process FRED data
  if (fredData) {
    fredData.forEach((point) => {
      goldData.data.push({
        date: point.date,
        price: point.value,
        source: "FRED",
      })
    })
  }

  goldData.data.sort((a, b) => new Date(a.date) - new Date(b.date))
  return goldData
}

function processSilverData(fredData) {
  const silverData = {
    metadata: {
      source: "FRED API",
      description: "Historical silver prices in USD per troy ounce",
      lastUpdated: new Date().toISOString(),
      currency: "USD",
      unit: "USD per troy ounce",
    },
    data: [],
  }

  if (fredData) {
    fredData.forEach((point) => {
      silverData.data.push({
        date: point.date,
        price: point.value,
        source: "FRED",
      })
    })
  }

  silverData.data.sort((a, b) => new Date(a.date) - new Date(b.date))
  return silverData
}

function processBitcoinData(coinDeskData) {
  const bitcoinData = {
    metadata: {
      source: "CoinDesk API",
      description: "Historical Bitcoin prices in USD",
      lastUpdated: new Date().toISOString(),
      currency: "USD",
      unit: "USD per BTC",
    },
    data: [],
  }

  if (coinDeskData && coinDeskData.historical && coinDeskData.historical.bpi) {
    Object.entries(coinDeskData.historical.bpi).forEach(([date, price]) => {
      bitcoinData.data.push({
        date: date,
        price: price,
        source: "CoinDesk",
      })
    })
  }

  bitcoinData.data.sort((a, b) => new Date(a.date) - new Date(b.date))
  return bitcoinData
}

async function main() {
  console.log("Starting commodity data collection...")
  console.log("Using completely free data sources:")
  console.log("- FRED API (unlimited, requires free API key)")
  console.log("- CoinDesk API (unlimited, no API key required)")
  console.log("")

  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), "public", "data", "commodities")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  try {
    console.log("Fetching gold data from FRED...")
    const fredGoldData = await fetchFredData(FRED_SERIES.GOLD_USD)

    console.log("Fetching silver data from FRED...")
    const fredSilverData = await fetchFredData(FRED_SERIES.SILVER_USD)

    // Fetch Bitcoin data from CoinDesk
    console.log("Fetching Bitcoin data from CoinDesk...")
    const bitcoinData = await fetchCoinDeskBitcoinData()

    // Process and save gold data
    const processedGoldData = processGoldData(fredGoldData)
    fs.writeFileSync(path.join(dataDir, "gold-usd.json"), JSON.stringify(processedGoldData, null, 2))
    console.log(`✓ Gold data saved: ${processedGoldData.data.length} data points`)

    // Process and save silver data
    const processedSilverData = processSilverData(fredSilverData)
    fs.writeFileSync(path.join(dataDir, "silver-usd.json"), JSON.stringify(processedSilverData, null, 2))
    console.log(`✓ Silver data saved: ${processedSilverData.data.length} data points`)

    // Process and save Bitcoin data
    const processedBitcoinData = processBitcoinData(bitcoinData)
    fs.writeFileSync(path.join(dataDir, "bitcoin-usd.json"), JSON.stringify(processedBitcoinData, null, 2))
    console.log(`✓ Bitcoin data saved: ${processedBitcoinData.data.length} data points`)

    console.log("")
    console.log("Commodity data collection completed successfully!")
    console.log("Files saved to: public/data/commodities/")
    console.log("")
    console.log("Next steps:")
    console.log("1. Set up environment variable: FRED_API_KEY")
    console.log("2. Run this script periodically to update data")
    console.log("3. Integrate commodity data into your charts and calculators")
  } catch (error) {
    console.error("Error in main execution:", error)
  }
}

// Run the script
main()
