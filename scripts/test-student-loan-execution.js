const fs = require("fs")
const path = require("path")

console.log("=".repeat(80))
console.log("TEST SCRIPT STARTED - If you see this, script execution works!")
console.log("=".repeat(80))
console.log("Node version:", process.version)
console.log("Current directory:", __dirname)
console.log("COLLEGE_SCORECARD_API_KEY:", process.env.COLLEGE_SCORECARD_API_KEY ? "Found" : "Missing")
console.log("BLS_API_KEY:", process.env.BLS_API_KEY ? "Found" : "Missing")
console.log("=".repeat(80))

// Try to write a simple test file
const testFile = path.join("public/data/student-loans", "test.json")
try {
  fs.writeFileSync(testFile, JSON.stringify({ test: "success", timestamp: new Date().toISOString() }, null, 2))
  console.log("✅ Successfully wrote test file:", testFile)
} catch (error) {
  console.error("❌ Failed to write test file:", error.message)
}

console.log("=".repeat(80))
console.log("TEST SCRIPT COMPLETED")
console.log("=".repeat(80))
