"use client"

interface DataPoint {
  year: number
  value: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  currency: string
  fromYear: number
  className?: string
}

export default function SimpleLineChart({ data, currency, fromYear, className = "" }: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>Loading chart data...</div>
        </div>
      </div>
    )
  }

  // Filter and sort data
  const validData = data
    .filter(
      (point) =>
        point &&
        typeof point.year === "number" &&
        typeof point.value === "number" &&
        !isNaN(point.year) &&
        !isNaN(point.value) &&
        isFinite(point.value) &&
        point.value > 0,
    )
    .sort((a, b) => a.year - b.year)

  if (validData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div>No valid data points</div>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...validData.map((d) => d.value))
  const minValue = Math.min(...validData.map((d) => d.value))
  const range = maxValue - minValue

  // Handle edge case where all values are the same
  if (range === 0 || !isFinite(range)) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <div>
            Constant value: {currency}
            {maxValue.toFixed(2)}
          </div>
        </div>
      </div>
    )
  }

  const width = 100 // percentage
  const height = 100 // percentage
  const padding = 8 // Increased padding for better mobile display

  // Generate points for the line
  const points = validData
    .map((point, index) => {
      const x = padding + (index / Math.max(1, validData.length - 1)) * (width - 2 * padding)
      const y = padding + (height - 2 * padding) - ((point.value - minValue) / range) * (height - 2 * padding)

      // Ensure coordinates are valid numbers
      const safeX = isFinite(x) ? Math.max(0, Math.min(100, x)) : padding
      const safeY = isFinite(y) ? Math.max(0, Math.min(100, y)) : height / 2

      return `${safeX},${safeY}`
    })
    .join(" ")

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

  return (
    <div className={`w-full h-full relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Enhanced Grid lines and gradients */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
          </pattern>
          <pattern id="majorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Enhanced Grid background */}
        <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />
        <rect width="100" height="100" fill="url(#majorGrid)" opacity="0.6" />

        {/* Area under curve */}
        <polygon points={areaPoints} fill="url(#areaGradient)" />

        {/* Main line with gradient */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Enhanced Data points with mobile-friendly sizing and improved tooltips */}
        {validData.map((point, index) => {
          const x = padding + (index / Math.max(1, validData.length - 1)) * (width - 2 * padding)
          const y = padding + (height - 2 * padding) - ((point.value - minValue) / range) * (height - 2 * padding)

          // Ensure coordinates are valid
          const safeX = isFinite(x) ? Math.max(0, Math.min(100, x)) : padding
          const safeY = isFinite(y) ? Math.max(0, Math.min(100, y)) : height / 2

          const isFromYear = point.year === fromYear
          const isEndYear = point.year === 2025

          return (
            <g key={`${point.year}-${index}`}>
              {/* Enhanced circle with better mobile touch targets */}
              <circle
                cx={safeX}
                cy={safeY}
                r={isFromYear || isEndYear ? "3" : "2"}
                fill={isFromYear ? "#ef4444" : isEndYear ? "#10b981" : "#3b82f6"}
                stroke="white"
                strokeWidth="1.5"
                className="hover:r-4 transition-all cursor-pointer drop-shadow-sm"
              />

              {/* Enhanced tooltip that appears on hover/touch */}
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                {/* Tooltip background */}
                <rect
                  x={safeX - 15}
                  y={Math.max(8, safeY - 12)}
                  width="30"
                  height="16"
                  rx="2"
                  fill="rgba(0, 0, 0, 0.8)"
                  className="drop-shadow-lg"
                />

                {/* Year text */}
                <text
                  x={safeX}
                  y={Math.max(15, safeY - 6)}
                  textAnchor="middle"
                  className="fill-white font-medium"
                  fontSize="2.5"
                >
                  {point.year}
                </text>

                {/* Value text */}
                <text x={safeX} y={Math.max(20, safeY - 1)} textAnchor="middle" className="fill-white" fontSize="2">
                  {currency}
                  {point.value.toFixed(0)}
                </text>
              </g>

              {/* Mobile-friendly invisible touch area */}
              <circle
                cx={safeX}
                cy={safeY}
                r="8"
                fill="transparent"
                className="sm:hidden cursor-pointer"
                onTouchStart={(e) => {
                  // Show tooltip on mobile touch
                  const tooltip = e.currentTarget.previousElementSibling
                  if (tooltip) {
                    tooltip.classList.remove("opacity-0")
                    tooltip.classList.add("opacity-100")
                    setTimeout(() => {
                      tooltip.classList.remove("opacity-100")
                      tooltip.classList.add("opacity-0")
                    }, 2000)
                  }
                }}
              />
            </g>
          )
        })}

        {/* Trend indicators */}
        {validData.length > 1 && (
          <g>
            {/* Trend arrow */}
            <path
              d={`M ${width - 15} ${height - 15} L ${width - 10} ${height - 20} L ${width - 10} ${height - 17} L ${width - 5} ${height - 17} L ${width - 5} ${height - 13} L ${width - 10} ${height - 13} L ${width - 10} ${height - 10} Z`}
              fill="#10b981"
              opacity="0.7"
            />
          </g>
        )}
      </svg>

      {/* Enhanced Mobile-Friendly Labels */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1 left-1 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded shadow-sm">
          {validData[0]?.year || ""}
        </div>
        <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded shadow-sm">
          {validData[validData.length - 1]?.year || ""}
        </div>
        <div className="absolute top-1 left-1 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded shadow-sm">
          Max: {currency}
          {isFinite(maxValue) ? maxValue.toFixed(0) : "0"}
        </div>
        <div className="absolute top-1 right-1 text-xs text-blue-600 bg-blue-50/90 px-2 py-1 rounded font-medium shadow-sm">
          📈 Growth Trend
        </div>

        {/* Mobile-friendly data range indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded shadow-sm hidden sm:block">
          Range: {currency}
          {minValue.toFixed(0)} - {currency}
          {maxValue.toFixed(0)}
        </div>
      </div>

      {/* Mobile touch overlay for better interaction */}
      <div className="absolute inset-0 sm:hidden">
        {validData.map((point, index) => {
          const x = padding + (index / Math.max(1, validData.length - 1)) * (width - 2 * padding)
          const y = padding + (height - 2 * padding) - ((point.value - minValue) / range) * (height - 2 * padding)

          const isFromYear = point.year === fromYear
          const isEndYear = point.year === 2025

          if (!isFromYear && !isEndYear) return null

          return (
            <div
              key={`touch-${point.year}`}
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              title={`${point.year}: ${currency}${point.value.toFixed(2)}`}
            />
          )
        })}
      </div>
    </div>
  )
}
