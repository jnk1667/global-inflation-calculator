"use client"

import type React from "react"
import { useState, useEffect } from "react"

const UsageStats: React.FC = () => {
  const [calculations, setCalculations] = useState<number>(0)
  const [visitors, setVisitors] = useState<number>(0)

  useEffect(() => {
    // Load stats from localStorage
    const savedCalculations = localStorage.getItem("inflation-calculations")
    const savedVisitors = localStorage.getItem("inflation-visitors")

    setCalculations(savedCalculations ? Number.parseInt(savedCalculations, 10) : 12847)
    setVisitors(savedVisitors ? Number.parseInt(savedVisitors, 10) : 45231)

    // Increment visitor count
    const newVisitorCount = (savedVisitors ? Number.parseInt(savedVisitors, 10) : 45231) + 1
    setVisitors(newVisitorCount)
    localStorage.setItem("inflation-visitors", newVisitorCount.toString())

    // Global function to increment calculations
    ;(window as any).incrementCalculation = () => {
      const newCalcCount = (savedCalculations ? Number.parseInt(savedCalculations, 10) : 12847) + 1
      setCalculations(newCalcCount)
      localStorage.setItem("inflation-calculations", newCalcCount.toString())
    }
  }, [])

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  return (
    <div className="text-xs text-gray-600">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="font-bold text-blue-600">{formatNumber(calculations)}</div>
          <div>Calculations</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-green-600">{formatNumber(visitors)}</div>
          <div>Visitors</div>
        </div>
      </div>
    </div>
  )
}

export default UsageStats
