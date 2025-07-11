"use client"

import type React from "react"

interface ChartData {
  year: number
  value: number
}

interface SimpleLineChartProps {
  data: ChartData[]
  currency: string
  fromYear: number
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, currency, fromYear }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">No data available for chart</div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const valueRange = maxValue - minValue || 1

  const formatCurrency = (value: number) => {
    if (currency.length > 1) {
      return `${currency} ${value.toFixed(0)}`
    }
    return `${currency}${value.toFixed(0)}`
  }

  return (
    <div className="w-full h-full relative bg-white">
      <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Chart area */}
        <g transform="translate(80, 20)">
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = 320 - ratio * 320
            const value = minValue + valueRange * ratio
            return (
              <g key={index}>
                <line x1="0" y1={y} x2="640" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x="-10" y={y + 5} textAnchor="end" fontSize="12" fill="#6b7280">
                  {formatCurrency(value)}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {data
            .filter((_, index) => index % Math.ceil(data.length / 6) === 0)
            .map((point, index) => {
              const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
              return (
                <text key={index} x={x} y="350" textAnchor="middle" fontSize="12" fill="#6b7280">
                  {point.year}
                </text>
              )
            })}

          {/* Line path */}
          <path
            d={data
              .map((point, index) => {
                const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
                const y = 320 - ((point.value - minValue) / valueRange) * 320
                return `${index === 0 ? "M" : "L"} ${x} ${y}`
              })
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = ((point.year - data[0].year) / (data[data.length - 1].year - data[0].year)) * 640
            const y = 320 - ((point.value - minValue) / valueRange) * 320
            return (
              <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2">
                <title>{`${point.year}: ${formatCurrency(point.value)}`}</title>
              </circle>
            )
          })}
        </g>

        {/* Axes */}
        <g transform="translate(80, 20)">
          <line x1="0" y1="320" x2="640" y2="320" stroke="#374151" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="320" stroke="#374151" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}

export default SimpleLineChart
