const fs = require("fs")
const readline = require("readline")

// 🏦 FRED API Setup Script
// This script helps you get and configure your FRED API key

console.log("🏦 Federal Reserve Economic Data (FRED) API Setup")
console.log("=".repeat(50))
console.log()
console.log("To collect comprehensive US inflation data, you need a free FRED API key.")
console.log("📝 Steps to get your API key:")
console.log("   1. Visit: https://fred.stlouisfed.org/docs/api/api_key.html")
console.log("   2. Create a free account")
console.log("   3. Request an API key")
console.log("   4. Copy your API key")
console.log()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("Enter your FRED API key (or press Enter to skip): ", (apiKey) => {
  if (apiKey && apiKey.trim()) {
    // Save to environment file
    const envContent = `# FRED API Configuration
FRED_API_KEY=${apiKey.trim()}

# Add this to your .env.local file for Next.js
# Or set as environment variable: export FRED_API_KEY=${apiKey.trim()}
`

    fs.writeFileSync(".env.fred", envContent)
    console.log()
    console.log("✅ API key saved to .env.fred")
    console.log("📝 To use it:")
    console.log("   • Copy the key to your .env.local file")
    console.log("   • Or run: export FRED_API_KEY=" + apiKey.trim())
    console.log()
    console.log("🚀 Now you can run: node scripts/fetch-comprehensive-inflation-data.js")
  } else {
    console.log()
    console.log("⚠️  No API key provided. You can set it later:")
    console.log("   export FRED_API_KEY=your_api_key_here")
    console.log()
    console.log("📋 The script will still work with estimated data for some series.")
  }

  console.log()
  console.log("📊 Available data series that will be collected:")
  console.log("   🇺🇸 US Data (FRED):")
  console.log("      • Consumer Price Index (CPI)")
  console.log("      • Chained CPI")
  console.log("      • Personal Consumption Expenditures (PCE)")
  console.log("      • Producer Price Index (PPI)")
  console.log("      • GDP Deflator")
  console.log("      • Trimmed Mean CPI")
  console.log("      • Core inflation measures")
  console.log("      • Housing price indices")
  console.log("      • Import/Export price indices")
  console.log()
  console.log("   🇬🇧 UK Data (ONS):")
  console.log("      • Consumer Price Index")
  console.log("      • Retail Price Index")
  console.log("      • CPI including housing (CPIH)")
  console.log("      • Producer Price Indices")
  console.log()
  console.log("   🇪🇺 EUR Data (Estimated):")
  console.log("      • Harmonized Index of Consumer Prices")
  console.log("      • Core HICP")
  console.log("      • Producer Price Index")
  console.log()
  console.log("   🇨🇦 CAD Data (Estimated):")
  console.log("      • Consumer Price Index")
  console.log("      • Industrial Product Price Index")
  console.log("      • Core CPI measures")
  console.log()

  rl.close()
})
