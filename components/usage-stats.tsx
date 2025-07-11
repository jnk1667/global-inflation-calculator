"use client"

import type React from "react"
import { useState, useEffect } from "react"

const UsageStats: React.FC = () => {
  const [stats, setStats] = useState({
    calculations: 0,
    users: 0,
  })

  useEffect(() => {
    // Simulate real-time stats (in a real app, this would come from your analytics)
    const baseCalculations = 15847
    const baseUsers = 3291

    const updateStats = () => {
      const now = new Date()
      const minutesInDay = now.getHours() * 60 + now.getMinutes()
      const dailyGrowth = Math.floor(minutesInDay / 10) // Grow throughout the day

      setStats({
        calculations: baseCalculations + dailyGrowth + Math.floor(Math.random() * 5),
        users: baseUsers + Math.floor(dailyGrowth / 3) + Math.floor(Math.random() * 2),
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-xs text-gray-600">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>{stats.calculations.toLocaleString()} calculations</span>
        </div>
        <div className="text-gray-400">•</div>
        <div>{stats.users.toLocaleString()} users today</div>
      </div>
    </div>
  )
}

export default UsageStats
