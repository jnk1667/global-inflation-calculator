const { spawn } = require("child_process")
const path = require("path")

function setupCronJob() {
  console.log("⚙️ Setting up monthly cron job...")

  const projectPath = process.cwd()
  const cronCommand = `0 0 1 * * cd ${projectPath} && npm run monthly-update`

  console.log("📋 Cron job command:")
  console.log(cronCommand)
  console.log("")
  console.log("To add this cron job manually:")
  console.log("1. Run: crontab -e")
  console.log("2. Add the following line:")
  console.log(cronCommand)
  console.log("")
  console.log("This will run the monthly update on the 1st of every month at midnight.")

  // Try to add automatically (Linux/Mac only)
  if (process.platform !== "win32") {
    try {
      const crontab = spawn("crontab", ["-l"], { stdio: "pipe" })
      let existingCron = ""

      crontab.stdout.on("data", (data) => {
        existingCron += data.toString()
      })

      crontab.on("close", (code) => {
        if (!existingCron.includes("npm run monthly-update")) {
          const newCron = existingCron + "\n" + cronCommand + "\n"
          const addCron = spawn("crontab", ["-"], { stdio: "pipe" })
          addCron.stdin.write(newCron)
          addCron.stdin.end()

          addCron.on("close", (code) => {
            if (code === 0) {
              console.log("✅ Cron job added successfully!")
            } else {
              console.log("❌ Failed to add cron job automatically. Please add manually.")
            }
          })
        } else {
          console.log("✅ Cron job already exists!")
        }
      })
    } catch (error) {
      console.log("❌ Could not set up cron job automatically. Please add manually.")
      console.log("Error:", error.message)
    }
  } else {
    console.log("ℹ️ Windows detected. Please use Task Scheduler to set up automatic updates.")
  }
}

if (require.main === module) {
  setupCronJob()
}

module.exports = { setupCronJob }
