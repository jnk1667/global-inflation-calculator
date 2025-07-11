"use client"

import type React from "react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <div className="text-center">
        <div className="text-lg font-medium text-gray-700">Loading inflation data...</div>
        <div className="text-sm text-gray-500">Fetching historical currency information</div>
      </div>
    </div>
  )
}

export default LoadingSpinner
