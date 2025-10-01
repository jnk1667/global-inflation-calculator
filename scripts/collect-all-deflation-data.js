import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function collectAllDeflationData() {
  console.log("[v0] Starting collection of all deflationary asset data...")

  const scripts = [
    "scripts/collect-fred-gold.js",
    "scripts/collect-fred-silver.js",
    "scripts/collect-bitcoin-data.js",
    "scripts/collect-ethereum-data.js",
    "scripts/collect-eia-crude-oil.js",
    "scripts/collect-eia-natural-gas.js",
    "scripts/collect-eia-coal.js",
  ]

  for (const script of scripts) {
    try {
      console.log(`[v0] Running ${script}...`)
      const { stdout, stderr } = await execAsync(`node ${script}`)

      if (stdout) console.log(stdout)
      if (stderr) console.error(stderr)

      console.log(`[v0] ✅ Completed ${script}`)
    } catch (error) {
      console.error(`[v0] ❌ Error running ${script}:`, error.message)
    }
  }

  console.log("[v0] 🎉 All deflationary asset data collection completed!")
  console.log("[v0] Data files created:")
  console.log("  - gold-prices.json")
  console.log("  - silver-prices.json")
  console.log("  - bitcoin-prices.json")
  console.log("  - ethereum-prices.json")
  console.log("  - crude-oil-prices.json")
  console.log("  - natural-gas-prices.json")
  console.log("  - coal-productivity.json")
}

collectAllDeflationData()
