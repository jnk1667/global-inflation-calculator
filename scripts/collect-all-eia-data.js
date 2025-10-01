// Master script to collect all EIA energy data
import { execSync } from "child_process"

console.log("[v0] Starting EIA data collection...")

const scripts = [
  "scripts/collect-eia-crude-oil.js",
  "scripts/collect-eia-natural-gas.js",
  "scripts/collect-eia-coal.js",
]

for (const script of scripts) {
  try {
    console.log(`[v0] Running ${script}...`)
    execSync(`node ${script}`, { stdio: "inherit" })
    console.log(`[v0] ✓ Completed ${script}`)
  } catch (error) {
    console.error(`[v0] ✗ Failed ${script}:`, error.message)
  }
}

console.log("[v0] EIA data collection complete!")
