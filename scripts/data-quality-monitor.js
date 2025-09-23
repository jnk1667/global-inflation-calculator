const fs = require("fs")
const path = require("path")

// 📊 DATA QUALITY MONITORING SYSTEM
// Monitors data quality, generates reports, and alerts on issues

class DataQualityMonitor {
  constructor() {
    this.reports = new Map()
    this.alerts = []
    this.thresholds = {
      critical: 50,
      warning: 70,
      good: 85,
    }
  }

  async generateQualityReport() {
    console.log("📊 Generating comprehensive data quality report...")

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCurrencies: 0,
        healthyCurrencies: 0,
        warningCurrencies: 0,
        criticalCurrencies: 0,
        averageScore: 0,
      },
      currencies: {},
      systemHealth: "unknown",
      recommendations: [],
      alerts: [],
    }

    const currencies = ["USD", "GBP", "EUR", "CAD", "AUD", "CHF", "JPY", "NZD"]
    let totalScore = 0

    for (const currency of currencies) {
      const currencyReport = await this.analyzeCurrency(currency)
      report.currencies[currency] = currencyReport
      report.summary.totalCurrencies++

      if (currencyReport.overallScore >= this.thresholds.good) {
        report.summary.healthyCurrencies++
      } else if (currencyReport.overallScore >= this.thresholds.warning) {
        report.summary.warningCurrencies++
      } else {
        report.summary.criticalCurrencies++
      }

      totalScore += currencyReport.overallScore
    }

    report.summary.averageScore = Math.round(totalScore / report.summary.totalCurrencies)

    // Determine system health
    if (report.summary.averageScore >= this.thresholds.good) {
      report.systemHealth = "excellent"
    } else if (report.summary.averageScore >= this.thresholds.warning) {
      report.systemHealth = "good"
    } else if (report.summary.averageScore >= this.thresholds.critical) {
      report.systemHealth = "fair"
    } else {
      report.systemHealth = "poor"
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report)

    // Generate alerts
    report.alerts = this.generateAlerts(report)

    // Save report
    const reportPath = `data/quality-reports/quality-report-${new Date().toISOString().split("T")[0]}.json`
    this.saveReport(reportPath, report)

    console.log(`✅ Quality report generated. System health: ${report.systemHealth}`)
    return report
  }

  async analyzeCurrency(currency) {
    const analysis = {
      currency,
      overallScore: 0,
      measures: {},
      issues: [],
      strengths: [],
      lastUpdated: null,
      dataCompleteness: 0,
      dataFreshness: 0,
      dataConsistency: 0,
    }

    try {
      // Check if measures data exists
      const measuresDir = "public/data/measures"
      const measureFiles = fs
        .readdirSync(measuresDir)
        .filter((file) => file.startsWith(currency.toLowerCase()) && file.endsWith(".json"))

      if (measureFiles.length === 0) {
        analysis.issues.push("No measures data found")
        analysis.overallScore = 0
        return analysis
      }

      let totalMeasureScore = 0
      let validMeasures = 0

      // Analyze each measure
      for (const file of measureFiles) {
        const measureName = file.replace(`${currency.toLowerCase()}-`, "").replace(".json", "")
        const measurePath = path.join(measuresDir, file)

        try {
          const measureData = JSON.parse(fs.readFileSync(measurePath, "utf8"))
          const measureAnalysis = this.analyzeMeasure(measureData)

          analysis.measures[measureName] = measureAnalysis

          if (measureAnalysis.score > 0) {
            totalMeasureScore += measureAnalysis.score
            validMeasures++
          }
        } catch (error) {
          analysis.issues.push(`Failed to analyze ${measureName}: ${error.message}`)
        }
      }

      // Calculate overall score
      if (validMeasures > 0) {
        analysis.overallScore = Math.round(totalMeasureScore / validMeasures)
      }

      // Analyze data completeness
      analysis.dataCompleteness = this.calculateCompleteness(analysis.measures)

      // Analyze data freshness
      analysis.dataFreshness = this.calculateFreshness(analysis.measures)

      // Analyze data consistency
      analysis.dataConsistency = this.calculateConsistency(analysis.measures)

      // Identify strengths
      if (analysis.overallScore >= this.thresholds.good) {
        analysis.strengths.push("High overall data quality")
      }

      if (validMeasures >= 5) {
        analysis.strengths.push("Good measure coverage")
      }

      if (analysis.dataFreshness >= 80) {
        analysis.strengths.push("Recent data updates")
      }
    } catch (error) {
      analysis.issues.push(`Currency analysis failed: ${error.message}`)
      analysis.overallScore = 0
    }

    return analysis
  }

  analyzeMeasure(measureData) {
    const analysis = {
      score: 0,
      dataPoints: 0,
      yearsCovered: 0,
      lastUpdated: null,
      issues: [],
      quality: "unknown",
    }

    try {
      if (!measureData || !measureData.data) {
        analysis.issues.push("Invalid data structure")
        return analysis
      }

      // Count data points
      const years = Object.keys(measureData.data).filter((year) => !isNaN(Number(year)))
      analysis.dataPoints = years.length
      analysis.yearsCovered = years.length

      if (years.length === 0) {
        analysis.issues.push("No valid data points")
        return analysis
      }

      // Check data freshness
      if (measureData.last_updated) {
        analysis.lastUpdated = measureData.last_updated
        const lastUpdate = new Date(measureData.last_updated)
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

        if (daysSinceUpdate > 90) {
          analysis.issues.push(`Data is stale (${Math.floor(daysSinceUpdate)} days old)`)
        }
      } else {
        analysis.issues.push("Missing last updated timestamp")
      }

      // Validate data integrity
      let validDataPoints = 0
      let outliers = 0

      for (const [year, data] of Object.entries(measureData.data)) {
        if (typeof data === "object" && data.inflation_factor != null) {
          if (data.inflation_factor > 0 && data.inflation_factor < 1000) {
            validDataPoints++
          } else {
            outliers++
          }
        }
      }

      const dataIntegrity = validDataPoints / analysis.dataPoints

      // Calculate score
      let score = 100

      // Deduct for issues
      score -= analysis.issues.length * 10

      // Deduct for poor data integrity
      score -= (1 - dataIntegrity) * 30

      // Deduct for outliers
      score -= outliers * 2

      // Bonus for good coverage
      if (analysis.dataPoints >= 50) score += 5
      if (analysis.dataPoints >= 100) score += 5

      analysis.score = Math.max(0, Math.min(100, score))

      // Categorize quality
      if (analysis.score >= this.thresholds.good) {
        analysis.quality = "excellent"
      } else if (analysis.score >= this.thresholds.warning) {
        analysis.quality = "good"
      } else if (analysis.score >= this.thresholds.critical) {
        analysis.quality = "fair"
      } else {
        analysis.quality = "poor"
      }
    } catch (error) {
      analysis.issues.push(`Analysis error: ${error.message}`)
    }

    return analysis
  }

  calculateCompleteness(measures) {
    if (Object.keys(measures).length === 0) return 0

    const completenessScores = Object.values(measures).map((measure) => {
      if (measure.dataPoints >= 100) return 100
      if (measure.dataPoints >= 50) return 80
      if (measure.dataPoints >= 20) return 60
      if (measure.dataPoints >= 10) return 40
      return 20
    })

    return Math.round(completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length)
  }

  calculateFreshness(measures) {
    if (Object.keys(measures).length === 0) return 0

    const now = Date.now()
    const freshnessScores = Object.values(measures).map((measure) => {
      if (!measure.lastUpdated) return 0

      const lastUpdate = new Date(measure.lastUpdated).getTime()
      const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24)

      if (daysSinceUpdate <= 7) return 100
      if (daysSinceUpdate <= 30) return 80
      if (daysSinceUpdate <= 60) return 60
      if (daysSinceUpdate <= 90) return 40
      return 20
    })

    return Math.round(freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length)
  }

  calculateConsistency(measures) {
    if (Object.keys(measures).length < 2) return 100

    const scores = Object.values(measures).map((measure) => measure.score)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)

    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - stdDev * 2)
    return Math.round(consistencyScore)
  }

  generateRecommendations(report) {
    const recommendations = []

    // System-level recommendations
    if (report.summary.criticalCurrencies > 0) {
      recommendations.push({
        priority: "high",
        category: "system",
        message: `${report.summary.criticalCurrencies} currencies have critical data quality issues`,
        action: "Immediate data review and update required",
      })
    }

    if (report.summary.averageScore < this.thresholds.warning) {
      recommendations.push({
        priority: "medium",
        category: "system",
        message: "Overall system data quality below acceptable threshold",
        action: "Review data collection processes and sources",
      })
    }

    // Currency-specific recommendations
    Object.entries(report.currencies).forEach(([currency, currencyReport]) => {
      if (currencyReport.overallScore < this.thresholds.critical) {
        recommendations.push({
          priority: "high",
          category: "currency",
          currency,
          message: `${currency} data quality is critical (score: ${currencyReport.overallScore})`,
          action: "Immediate attention required - check data sources and collection",
        })
      }

      if (currencyReport.dataFreshness < 50) {
        recommendations.push({
          priority: "medium",
          category: "freshness",
          currency,
          message: `${currency} data is stale`,
          action: "Update data from official sources",
        })
      }

      if (Object.keys(currencyReport.measures).length < 3) {
        recommendations.push({
          priority: "low",
          category: "coverage",
          currency,
          message: `${currency} has limited measure coverage`,
          action: "Consider adding more inflation measures for better accuracy",
        })
      }
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  generateAlerts(report) {
    const alerts = []

    // Critical system alerts
    if (report.systemHealth === "poor") {
      alerts.push({
        level: "critical",
        message: "System data quality is poor - immediate action required",
        timestamp: new Date().toISOString(),
      })
    }

    // Currency-specific alerts
    Object.entries(report.currencies).forEach(([currency, currencyReport]) => {
      if (currencyReport.overallScore < this.thresholds.critical) {
        alerts.push({
          level: "critical",
          message: `${currency} data quality critical (score: ${currencyReport.overallScore})`,
          currency,
          timestamp: new Date().toISOString(),
        })
      }

      if (currencyReport.issues.length > 5) {
        alerts.push({
          level: "warning",
          message: `${currency} has multiple data issues (${currencyReport.issues.length})`,
          currency,
          timestamp: new Date().toISOString(),
        })
      }
    })

    return alerts
  }

  saveReport(reportPath, report) {
    try {
      // Ensure directory exists
      const dir = path.dirname(reportPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`📊 Quality report saved to: ${reportPath}`)
    } catch (error) {
      console.error("❌ Failed to save quality report:", error)
    }
  }

  async generateDashboard() {
    const report = await this.generateQualityReport()

    const dashboard = {
      title: "Data Quality Dashboard",
      generated: new Date().toISOString(),
      summary: report.summary,
      systemHealth: report.systemHealth,
      criticalAlerts: report.alerts.filter((alert) => alert.level === "critical"),
      topRecommendations: report.recommendations.slice(0, 5),
      currencyScores: Object.entries(report.currencies).map(([currency, data]) => ({
        currency,
        score: data.overallScore,
        status: data.overallScore >= this.thresholds.good ? "healthy" : "needs_attention",
      })),
    }

    // Save dashboard
    fs.writeFileSync("public/data/quality-dashboard.json", JSON.stringify(dashboard, null, 2))

    console.log("📊 Quality dashboard generated")
    return dashboard
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new DataQualityMonitor()
  const command = process.argv[2]

  switch (command) {
    case "report":
      monitor
        .generateQualityReport()
        .then((report) => {
          console.log("Quality Report Summary:")
          console.log(`System Health: ${report.systemHealth}`)
          console.log(`Average Score: ${report.summary.averageScore}`)
          console.log(`Healthy Currencies: ${report.summary.healthyCurrencies}/${report.summary.totalCurrencies}`)
          console.log(`Critical Issues: ${report.summary.criticalCurrencies}`)
        })
        .catch((error) => {
          console.error("Failed to generate report:", error)
          process.exit(1)
        })
      break

    case "dashboard":
      monitor
        .generateDashboard()
        .then((dashboard) => {
          console.log("Dashboard Summary:")
          console.log(`System Health: ${dashboard.systemHealth}`)
          console.log(`Critical Alerts: ${dashboard.criticalAlerts.length}`)
          console.log(`Top Recommendations: ${dashboard.topRecommendations.length}`)
        })
        .catch((error) => {
          console.error("Failed to generate dashboard:", error)
          process.exit(1)
        })
      break

    default:
      console.log("Usage: node data-quality-monitor.js [report|dashboard]")
      console.log("")
      console.log("Commands:")
      console.log("  report    - Generate comprehensive quality report")
      console.log("  dashboard - Generate quality dashboard")
      break
  }
}

module.exports = { DataQualityMonitor }
