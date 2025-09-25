const { fetchAllInflationMeasures } = require("./fetch-all-inflation-measures")
const { updateAllMeasures } = require("./update-all-measures")
const fs = require("fs")
const path = require("path")

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"

async function submitToIndexNow(urls, reason = "updated") {
  try {
    const response = await fetch(`${SITE_URL}/api/indexnow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: Array.isArray(urls) ? urls : [urls],
        reason,
      }),
    })

    if (response.ok) {
      console.log(`📡 IndexNow: Successfully submitted ${Array.isArray(urls) ? urls.length : 1} URLs`)
      return true
    } else {
      console.warn(`⚠️ IndexNow: Failed to submit URLs (${response.status})`)
      return false
    }
  } catch (error) {
    console.error("❌ IndexNow: Submission error:", error.message)
    return false
  }
}

// 🤖 AUTOMATED DATA UPDATE SYSTEM
// Handles scheduled updates, monitoring, and maintenance of inflation data

const UPDATE_CONFIG = {
  // Update frequencies (in milliseconds)
  DAILY_CHECK: 24 * 60 * 60 * 1000, // 24 hours
  WEEKLY_UPDATE: 7 * 24 * 60 * 60 * 1000, // 7 days
  MONTHLY_FULL_UPDATE: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Data sources update schedules (when new data is typically released)
  RELEASE_SCHEDULES: {
    USD: {
      CPI: { day: 10, description: "CPI released around 10th of each month" },
      PCE: { day: 25, description: "PCE released around 25th of each month" },
      PPI: { day: 15, description: "PPI released around 15th of each month" },
    },
    GBP: {
      CPI: { day: 15, description: "UK CPI released around 15th of each month" },
      RPI: { day: 15, description: "UK RPI released around 15th of each month" },
    },
    EUR: {
      HICP: { day: 17, description: "Eurozone HICP released around 17th of each month" },
    },
  },

  // Quality thresholds
  MIN_QUALITY_SCORE: 70,
  CRITICAL_QUALITY_SCORE: 50,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
}

class AutomatedDataUpdater {
  constructor() {
    this.isRunning = false
    this.updateHistory = []
    this.errorLog = []
    this.lastFullUpdate = null
    this.scheduledUpdates = new Map()
    this.dataQualityReports = new Map()
  }

  async start() {
    if (this.isRunning) {
      console.log("🤖 Automated updater is already running")
      return
    }

    console.log("🤖 Starting Automated Data Update System...")
    this.isRunning = true

    // Load previous state
    await this.loadState()

    // Schedule initial checks
    this.scheduleUpdates()

    // Start monitoring loop
    this.startMonitoringLoop()

    console.log("✅ Automated Data Update System started successfully")
  }

  async stop() {
    console.log("🛑 Stopping Automated Data Update System...")
    this.isRunning = false

    // Clear all scheduled updates
    this.scheduledUpdates.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    this.scheduledUpdates.clear()

    // Save current state
    await this.saveState()

    console.log("✅ Automated Data Update System stopped")
  }

  scheduleUpdates() {
    // Schedule daily health checks
    this.scheduleRecurring("daily-health-check", UPDATE_CONFIG.DAILY_CHECK, () => {
      this.performHealthCheck()
    })

    // Schedule weekly data updates
    this.scheduleRecurring("weekly-update", UPDATE_CONFIG.WEEKLY_UPDATE, () => {
      this.performWeeklyUpdate()
    })

    // Schedule monthly full updates
    this.scheduleRecurring("monthly-full-update", UPDATE_CONFIG.MONTHLY_FULL_UPDATE, () => {
      this.performFullUpdate()
    })

    // Schedule data release-based updates
    this.scheduleDataReleaseUpdates()

    console.log("📅 Update schedules configured")
  }

  scheduleRecurring(name, interval, callback) {
    const timeoutId = setInterval(async () => {
      if (!this.isRunning) return

      try {
        console.log(`🔄 Running scheduled task: ${name}`)
        await callback()
        this.logUpdate(name, "success", "Scheduled task completed successfully")
      } catch (error) {
        console.error(`❌ Scheduled task failed: ${name}`, error)
        this.logError(name, error)
      }
    }, interval)

    this.scheduledUpdates.set(name, timeoutId)
  }

  scheduleDataReleaseUpdates() {
    // Schedule updates based on when statistical agencies typically release data
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentDay = now.getDate()

    Object.entries(UPDATE_CONFIG.RELEASE_SCHEDULES).forEach(([currency, releases]) => {
      Object.entries(releases).forEach(([measure, schedule]) => {
        // Calculate next release date
        let nextReleaseDate = new Date(now.getFullYear(), currentMonth, schedule.day)

        // If the release date has passed this month, schedule for next month
        if (nextReleaseDate <= now) {
          nextReleaseDate = new Date(now.getFullYear(), currentMonth + 1, schedule.day)
        }

        const timeUntilRelease = nextReleaseDate.getTime() - now.getTime()

        // Schedule update 1 day after expected release
        const updateDate = new Date(nextReleaseDate.getTime() + 24 * 60 * 60 * 1000)
        const timeUntilUpdate = updateDate.getTime() - now.getTime()

        if (timeUntilUpdate > 0) {
          const timeoutId = setTimeout(async () => {
            if (!this.isRunning) return

            console.log(`📊 Updating ${currency} ${measure} data after scheduled release`)
            await this.updateSpecificMeasure(currency, measure)
          }, timeUntilUpdate)

          this.scheduledUpdates.set(`${currency}-${measure}-release`, timeoutId)
          console.log(`📅 Scheduled ${currency} ${measure} update for ${updateDate.toISOString()}`)
        }
      })
    })
  }

  async performHealthCheck() {
    console.log("🏥 Performing daily health check...")

    const healthReport = {
      timestamp: new Date().toISOString(),
      currencies: {},
      overallHealth: "unknown",
      criticalIssues: [],
      recommendations: [],
    }

    // Check each currency's data quality
    const currencies = ["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY", "NZD"]

    for (const currency of currencies) {
      try {
        const currencyHealth = await this.checkCurrencyHealth(currency)
        healthReport.currencies[currency] = currencyHealth

        if (currencyHealth.score < UPDATE_CONFIG.CRITICAL_QUALITY_SCORE) {
          healthReport.criticalIssues.push(`${currency}: Critical data quality issues (score: ${currencyHealth.score})`)
        }
      } catch (error) {
        console.error(`❌ Health check failed for ${currency}:`, error)
        healthReport.currencies[currency] = {
          score: 0,
          status: "error",
          error: error.message,
        }
        healthReport.criticalIssues.push(`${currency}: Health check failed`)
      }
    }

    // Calculate overall health
    const scores = Object.values(healthReport.currencies)
      .filter((health) => typeof health.score === "number")
      .map((health) => health.score)

    if (scores.length > 0) {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      healthReport.overallHealth = this.categorizeHealth(averageScore)
    }

    // Generate recommendations
    if (healthReport.criticalIssues.length > 0) {
      healthReport.recommendations.push("Immediate attention required for currencies with critical issues")
    }

    if (scores.some((score) => score < UPDATE_CONFIG.MIN_QUALITY_SCORE)) {
      healthReport.recommendations.push("Consider updating data for currencies below quality threshold")
    }

    // Save health report
    this.dataQualityReports.set(new Date().toDateString(), healthReport)

    // Take action on critical issues
    if (healthReport.criticalIssues.length > 0) {
      console.warn("⚠️ Critical issues detected during health check:")
      healthReport.criticalIssues.forEach((issue) => console.warn(`   • ${issue}`))

      // Trigger immediate update for critical currencies
      await this.handleCriticalIssues(healthReport.criticalIssues)
    }

    console.log(`✅ Health check completed. Overall health: ${healthReport.overallHealth}`)
    return healthReport
  }

  async checkCurrencyHealth(currency) {
    // This would typically check data freshness, completeness, and quality
    // For now, we'll simulate a health check
    const dataPath = `public/data/${currency.toLowerCase()}-inflation.json`

    if (!fs.existsSync(dataPath)) {
      return {
        score: 0,
        status: "missing",
        lastUpdated: null,
        dataPoints: 0,
      }
    }

    try {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))
      const dataPoints = Object.keys(data.data || {}).length
      const lastUpdated = new Date(data.lastUpdated || 0)
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)

      let score = 100

      // Deduct points for stale data
      if (daysSinceUpdate > 30) score -= 20
      if (daysSinceUpdate > 60) score -= 30
      if (daysSinceUpdate > 90) score -= 50

      // Deduct points for insufficient data
      if (dataPoints < 50) score -= 30
      if (dataPoints < 20) score -= 50

      return {
        score: Math.max(0, score),
        status: score >= UPDATE_CONFIG.MIN_QUALITY_SCORE ? "healthy" : "needs_attention",
        lastUpdated: lastUpdated.toISOString(),
        dataPoints,
        daysSinceUpdate: Math.floor(daysSinceUpdate),
      }
    } catch (error) {
      return {
        score: 0,
        status: "error",
        error: error.message,
      }
    }
  }

  async performWeeklyUpdate() {
    console.log("📅 Performing weekly data update...")

    try {
      // Update measures data
      await updateAllMeasures()

      const updatedPages = [
        `${SITE_URL}/`,
        `${SITE_URL}/charts`,
        `${SITE_URL}/salary-calculator`,
        `${SITE_URL}/retirement-calculator`,
        `${SITE_URL}/legacy-planner`,
      ]

      await submitToIndexNow(updatedPages, "updated")

      // Validate updated data
      const validationResults = await this.validateAllData()

      // Log results
      this.logUpdate(
        "weekly-update",
        "success",
        `Updated data for all currencies. Validation: ${validationResults.summary}`,
      )

      console.log("✅ Weekly update completed successfully")
    } catch (error) {
      console.error("❌ Weekly update failed:", error)
      this.logError("weekly-update", error)

      // Attempt recovery
      await this.attemptRecovery("weekly-update", error)
    }
  }

  async performFullUpdate() {
    console.log("🔄 Performing full monthly data update...")

    try {
      // Full data collection from all sources
      const results = await fetchAllInflationMeasures()

      // Update legacy data files for backward compatibility
      await this.updateLegacyDataFiles()

      // Comprehensive validation
      const validationResults = await this.validateAllData()

      // Update metadata
      await this.updateMetadata(results, validationResults)

      const allPages = [
        `${SITE_URL}/`,
        `${SITE_URL}/charts`,
        `${SITE_URL}/salary-calculator`,
        `${SITE_URL}/retirement-calculator`,
        `${SITE_URL}/legacy-planner`,
        `${SITE_URL}/about`,
      ]

      await submitToIndexNow(allPages, "updated")

      this.lastFullUpdate = new Date().toISOString()

      this.logUpdate("full-update", "success", `Full update completed. ${results.total_series} series updated.`)

      console.log("✅ Full monthly update completed successfully")
    } catch (error) {
      console.error("❌ Full update failed:", error)
      this.logError("full-update", error)

      // Attempt recovery with fallback strategies
      await this.attemptRecovery("full-update", error)
    }
  }

  async updateSpecificMeasure(currency, measure) {
    console.log(`🎯 Updating specific measure: ${currency} ${measure}`)

    try {
      // This would typically update just the specific measure
      // For now, we'll update the entire currency
      const result = await this.updateCurrencyData(currency)

      const currencyPages = [`${SITE_URL}/`, `${SITE_URL}/charts`]

      await submitToIndexNow(currencyPages, "updated")

      this.logUpdate(`${currency}-${measure}`, "success", `Updated ${currency} ${measure} data`)

      return result
    } catch (error) {
      console.error(`❌ Failed to update ${currency} ${measure}:`, error)
      this.logError(`${currency}-${measure}`, error)
      throw error
    }
  }

  async updateCurrencyData(currency) {
    // Implementation would depend on the specific currency and data sources
    console.log(`🔄 Updating data for ${currency}`)

    // Simulate update process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      currency,
      updated: true,
      timestamp: new Date().toISOString(),
    }
  }

  async validateAllData() {
    console.log("🔍 Validating all data...")

    const results = {
      totalCurrencies: 0,
      validCurrencies: 0,
      issues: [],
      summary: "",
    }

    const currencies = ["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY", "NZD"]

    for (const currency of currencies) {
      results.totalCurrencies++

      try {
        const health = await this.checkCurrencyHealth(currency)

        if (health.score >= UPDATE_CONFIG.MIN_QUALITY_SCORE) {
          results.validCurrencies++
        } else {
          results.issues.push(`${currency}: Quality score ${health.score}`)
        }
      } catch (error) {
        results.issues.push(`${currency}: Validation error - ${error.message}`)
      }
    }

    results.summary = `${results.validCurrencies}/${results.totalCurrencies} currencies valid`

    if (results.issues.length > 0) {
      console.warn("⚠️ Data validation issues:")
      results.issues.forEach((issue) => console.warn(`   • ${issue}`))
    }

    return results
  }

  async updateLegacyDataFiles() {
    console.log("🔄 Updating legacy data files for backward compatibility...")

    // This would convert the new measures data back to the legacy format
    // to ensure existing functionality continues to work
    const currencies = ["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY", "NZD"]

    for (const currency of currencies) {
      try {
        // Load measures data and convert to legacy format
        await this.convertToLegacyFormat(currency)
      } catch (error) {
        console.warn(`⚠️ Failed to update legacy data for ${currency}:`, error.message)
      }
    }
  }

  async convertToLegacyFormat(currency) {
    // Implementation would convert measures data to legacy single-file format
    console.log(`🔄 Converting ${currency} to legacy format`)

    // Simulate conversion
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  async updateMetadata(updateResults, validationResults) {
    const metadata = {
      lastFullUpdate: new Date().toISOString(),
      updateResults: {
        totalSeries: updateResults.total_series,
        successfulSeries: updateResults.success_count,
        failedSeries: updateResults.failed_count,
      },
      validationResults: {
        totalCurrencies: validationResults.totalCurrencies,
        validCurrencies: validationResults.validCurrencies,
        issues: validationResults.issues.length,
      },
      systemHealth: this.categorizeHealth(
        (validationResults.validCurrencies / validationResults.totalCurrencies) * 100,
      ),
      nextScheduledUpdate: this.calculateNextUpdate(),
    }

    // Save metadata
    const metadataPath = "public/data/system-metadata.json"
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    console.log("📊 System metadata updated")
  }

  async handleCriticalIssues(criticalIssues) {
    console.log("🚨 Handling critical data issues...")

    for (const issue of criticalIssues) {
      const currency = issue.split(":")[0]

      try {
        console.log(`🔧 Attempting to fix critical issue for ${currency}`)

        // Attempt immediate data update
        await this.updateCurrencyData(currency)

        // Re-validate
        const health = await this.checkCurrencyHealth(currency)

        if (health.score >= UPDATE_CONFIG.CRITICAL_QUALITY_SCORE) {
          console.log(`✅ Critical issue resolved for ${currency}`)
        } else {
          console.warn(`⚠️ Critical issue persists for ${currency}`)
        }
      } catch (error) {
        console.error(`❌ Failed to resolve critical issue for ${currency}:`, error)
      }
    }
  }

  async attemptRecovery(operation, error) {
    console.log(`🔧 Attempting recovery for failed operation: ${operation}`)

    const recoveryStrategies = [
      {
        name: "retry",
        action: async () => {
          console.log("🔄 Retrying operation...")
          await new Promise((resolve) => setTimeout(resolve, UPDATE_CONFIG.RETRY_DELAY))

          if (operation === "weekly-update") {
            await this.performWeeklyUpdate()
          } else if (operation === "full-update") {
            await this.performFullUpdate()
          }
        },
      },
      {
        name: "partial-update",
        action: async () => {
          console.log("🎯 Attempting partial update...")
          // Update only critical currencies
          const criticalCurrencies = ["USD", "EUR", "GBP"]

          for (const currency of criticalCurrencies) {
            try {
              await this.updateCurrencyData(currency)
            } catch (currencyError) {
              console.warn(`⚠️ Partial update failed for ${currency}:`, currencyError.message)
            }
          }
        },
      },
      {
        name: "fallback-mode",
        action: async () => {
          console.log("🛡️ Entering fallback mode...")
          // Use cached data and mark system as degraded
          await this.enableFallbackMode()
        },
      },
    ]

    for (const strategy of recoveryStrategies) {
      try {
        await strategy.action()
        console.log(`✅ Recovery successful using strategy: ${strategy.name}`)
        this.logUpdate(`recovery-${operation}`, "success", `Recovered using ${strategy.name}`)
        return
      } catch (recoveryError) {
        console.warn(`⚠️ Recovery strategy ${strategy.name} failed:`, recoveryError.message)
      }
    }

    console.error(`❌ All recovery strategies failed for ${operation}`)
    this.logError(`recovery-${operation}`, new Error("All recovery strategies failed"))
  }

  async enableFallbackMode() {
    console.log("🛡️ Enabling fallback mode...")

    const fallbackStatus = {
      enabled: true,
      timestamp: new Date().toISOString(),
      reason: "Automatic recovery after update failure",
      expectedDuration: "Until next successful update",
    }

    // Save fallback status
    fs.writeFileSync("public/data/fallback-status.json", JSON.stringify(fallbackStatus, null, 2))

    console.log("✅ Fallback mode enabled")
  }

  startMonitoringLoop() {
    // Start a monitoring loop that runs every hour
    const monitoringInterval = setInterval(
      async () => {
        if (!this.isRunning) {
          clearInterval(monitoringInterval)
          return
        }

        try {
          await this.performMonitoringCheck()
        } catch (error) {
          console.error("❌ Monitoring check failed:", error)
        }
      },
      60 * 60 * 1000,
    ) // 1 hour

    this.scheduledUpdates.set("monitoring-loop", monitoringInterval)
  }

  async performMonitoringCheck() {
    // Light-weight monitoring check
    const status = {
      timestamp: new Date().toISOString(),
      systemRunning: this.isRunning,
      scheduledTasks: this.scheduledUpdates.size,
      recentErrors: this.errorLog.slice(-5),
      lastFullUpdate: this.lastFullUpdate,
    }

    // Check for any immediate issues
    const criticalFiles = ["public/data/usd-inflation.json", "public/data/eur-inflation.json"]

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        console.warn(`⚠️ Critical file missing: ${file}`)
        // Trigger immediate recovery
        await this.handleCriticalIssues([`Critical file missing: ${file}`])
      }
    }

    // Log monitoring status
    console.log(
      `📊 Monitoring check: ${status.scheduledTasks} tasks scheduled, ${status.recentErrors.length} recent errors`,
    )
  }

  logUpdate(operation, status, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      status,
      message,
    }

    this.updateHistory.push(logEntry)

    // Keep only last 100 entries
    if (this.updateHistory.length > 100) {
      this.updateHistory = this.updateHistory.slice(-100)
    }

    console.log(`📝 Update log: ${operation} - ${status} - ${message}`)
  }

  logError(operation, error) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      operation,
      error: error.message,
      stack: error.stack,
    }

    this.errorLog.push(errorEntry)

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50)
    }

    console.error(`❌ Error log: ${operation} - ${error.message}`)
  }

  async loadState() {
    const statePath = "data/updater-state.json"

    if (fs.existsSync(statePath)) {
      try {
        const state = JSON.parse(fs.readFileSync(statePath, "utf8"))
        this.lastFullUpdate = state.lastFullUpdate
        this.updateHistory = state.updateHistory || []
        this.errorLog = state.errorLog || []
        console.log("📂 Loaded previous updater state")
      } catch (error) {
        console.warn("⚠️ Failed to load updater state:", error.message)
      }
    }
  }

  async saveState() {
    const state = {
      lastFullUpdate: this.lastFullUpdate,
      updateHistory: this.updateHistory,
      errorLog: this.errorLog,
      timestamp: new Date().toISOString(),
    }

    const statePath = "data/updater-state.json"

    try {
      // Ensure directory exists
      const dir = path.dirname(statePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
      console.log("💾 Saved updater state")
    } catch (error) {
      console.error("❌ Failed to save updater state:", error)
    }
  }

  categorizeHealth(score) {
    if (score >= 90) return "excellent"
    if (score >= 80) return "good"
    if (score >= 60) return "fair"
    return "poor"
  }

  calculateNextUpdate() {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + UPDATE_CONFIG.WEEKLY_UPDATE)
    return nextWeek.toISOString()
  }

  // Public API methods
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastFullUpdate: this.lastFullUpdate,
      scheduledTasks: this.scheduledUpdates.size,
      recentUpdates: this.updateHistory.slice(-10),
      recentErrors: this.errorLog.slice(-5),
      dataQualityReports: Array.from(this.dataQualityReports.entries()).slice(-7), // Last 7 days
    }
  }

  async forceUpdate(type = "full") {
    console.log(`🔧 Force update requested: ${type}`)

    try {
      if (type === "full") {
        await this.performFullUpdate()
      } else if (type === "weekly") {
        await this.performWeeklyUpdate()
      } else if (type === "health") {
        await this.performHealthCheck()
      }

      return { success: true, message: `${type} update completed successfully` }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

// Create global instance
const automatedUpdater = new AutomatedDataUpdater()

// CLI interface
if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case "start":
      automatedUpdater.start()
      break

    case "stop":
      automatedUpdater.stop()
      break

    case "status":
      console.log(JSON.stringify(automatedUpdater.getStatus(), null, 2))
      break

    case "force-update":
      const updateType = process.argv[3] || "full"
      automatedUpdater
        .forceUpdate(updateType)
        .then((result) => {
          console.log(result.message)
          process.exit(result.success ? 0 : 1)
        })
        .catch((error) => {
          console.error("Force update failed:", error)
          process.exit(1)
        })
      break

    case "health-check":
      automatedUpdater
        .performHealthCheck()
        .then((report) => {
          console.log("Health Check Report:")
          console.log(JSON.stringify(report, null, 2))
          process.exit(0)
        })
        .catch((error) => {
          console.error("Health check failed:", error)
          process.exit(1)
        })
      break

    default:
      console.log("Usage: node automated-data-updater.js [start|stop|status|force-update|health-check]")
      console.log("")
      console.log("Commands:")
      console.log("  start        - Start the automated update system")
      console.log("  stop         - Stop the automated update system")
      console.log("  status       - Show current system status")
      console.log("  force-update - Force an immediate update (full|weekly|health)")
      console.log("  health-check - Perform immediate health check")
      break
  }
}

module.exports = { AutomatedDataUpdater, automatedUpdater }
