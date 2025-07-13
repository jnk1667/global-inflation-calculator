"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
  const [hoveredPoint, setHoveredPoint] = useState<ChartData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const sortedData = [...data].sort((a, b) => a.year - b.year)
    const minYear = Math.max(fromYear, Math.min(...sortedData.map((d) => d.year)))
    const maxYear = Math.max(...sortedData.map((d) => d.year))
    const minValue = Math.min(...sortedData.map((d) => d.value))
    const maxValue = Math.max(...sortedData.map((d) => d.value))

    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = 800
    const chartHeight = 400
    const innerWidth = chartWidth - padding.left - padding.right
    const innerHeight = chartHeight - padding.top - padding.bottom

    const xScale = (year: number) => padding.left + ((year - minYear) / (maxYear - minYear)) * innerWidth

    const yScale = (value: number) => padding.top + ((maxValue - value) / (maxValue - minValue)) * innerHeight

    const pathData = sortedData.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.year)} ${yScale(d.value)}`).join(" ")

    return {
      sortedData,
      minYear,
      maxYear,
      minValue,
      maxValue,
      padding,
      chartWidth,
      chartHeight,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
      pathData,
    }
  }, [data, fromYear])

  const formatCurrency = (value: number) => {
    if (currency.length > 1) {
      return `${currency} ${value.toFixed(2)}`
    }
    return `${currency}${value.toFixed(2)}`
  }

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!chartData) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setMousePosition({ x: event.clientX, y: event.clientY })

    // Find closest data point
    const mouseYear =
      chartData.minYear +
      ((x - chartData.padding.left) / chartData.innerWidth) * (chartData.maxYear - chartData.minYear)

    const closestPoint = chartData.sortedData.reduce((prev, curr) =>
      Math.abs(curr.year - mouseYear) < Math.abs(prev.year - mouseYear) ? curr : prev,
    )

    setHoveredPoint(closestPoint)
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Year: ${label}`}</p>
          <p className="text-blue-600">{`Value: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      )
    }
    return null
  }

  if (!chartData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">No data available for this currency</div>
        </CardContent>
      </Card>
    )
  }

  const {
    sortedData,
    minYear,
    maxYear,
    minValue,
    maxValue,
    padding,
    chartWidth,
    chartHeight,
    xScale,
    yScale,
    pathData,
  } = chartData

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{currency} Value Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* SVG Chart */}
          {/* <svg
            width="100%"
            height="400"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
          {/* <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect
              x={padding.left}
              y={padding.top}
              width={chartWidth - padding.left - padding.right}
              height={chartHeight - padding.top - padding.bottom}
              fill="url(#grid)"
            />

            {/* Y-axis labels */}
          {/* {Array.from({ length: 6 }, (_, i) => {
              const value = minValue + (maxValue - minValue) * (i / 5)
              const y = yScale(value)
              return (
                <g key={i}>
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-600">
                    {formatCurrency(value)}
                  </text>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                </g>
              )
            })}

            {/* X-axis labels */}
          {/* {Array.from({ length: 6 }, (_, i) => {
              const year = Math.round(minYear + (maxYear - minYear) * (i / 5))
              const x = xScale(year)
              return (
                <g key={i}>
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {year}
                  </text>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                </g>
              )
            })}

            {/* Main line */}
          {/* <path d={pathData} fill="none" stroke="#2563eb" strokeWidth="3" className="drop-shadow-sm" />

            {/* Data points */}
          {/* {sortedData.map((point, index) => (
              <circle
                key={index}
                cx={xScale(point.year)}
                cy={yScale(point.value)}
                r="4"
                fill="#2563eb"
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all duration-200"
              />
            ))}

            {/* Highlighted point */}
          {/* {hoveredPoint && (
              <circle
                cx={xScale(hoveredPoint.year)}
                cy={yScale(hoveredPoint.value)}
                r="6"
                fill="#2563eb"
                stroke="white"
                strokeWidth="3"
                className="drop-shadow-lg"
              />
            )}
          </svg> */}

          {/* Tooltip */}
          {/* {hoveredPoint && (
            <div
              className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
              style={{
                left: mousePosition.x - 100,
                top: mousePosition.y - 80,
              }}
            >
              <div className="text-sm font-semibold">{hoveredPoint.year}</div>
              <div className="text-sm text-gray-600">Value: {formatCurrency(hoveredPoint.value)}</div>
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  )
}

export default SimpleLineChart
