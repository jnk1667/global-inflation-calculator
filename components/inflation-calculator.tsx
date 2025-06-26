"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { trackInflationCalculation, trackCurrencyChange } from "@/lib/analytics"

interface InflationCalculatorProps {
  defaultCurrency?: string
}

const InflationCalculator: React.FC<InflationCalculatorProps> = ({ defaultCurrency = "USD" }) => {
  const [amount, setAmount] = useState<string>("")
  const [startYear, setStartYear] = useState<string>("")
  const [endYear, setEndYear] = useState<string>("")
  const [inflationRate, setInflationRate] = useState<number | null>(null)
  const [adjustedValue, setAdjustedValue] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency)
  const [currencyOptions, setCurrencyOptions] = useState<string[]>(["USD", "EUR", "GBP", "JPY", "CAD", "AUD"])

  useEffect(() => {
    trackCurrencyChange(selectedCurrency)
  }, [selectedCurrency])

  const calculateInflation = async () => {
    setError(null)
    setInflationRate(null)
    setAdjustedValue(null)
    setLoading(true)

    try {
      const amountValue = Number.parseFloat(amount)
      const startYearValue = Number.parseInt(startYear)
      const endYearValue = Number.parseInt(endYear)

      if (isNaN(amountValue) || isNaN(startYearValue) || isNaN(endYearValue)) {
        throw new Error("Please enter valid numbers for all fields.")
      }

      if (startYearValue >= endYearValue) {
        throw new Error("Start year must be before end year.")
      }

      const response = await fetch(
        `/api/inflation?currency=${selectedCurrency}&startYear=${startYearValue}&endYear=${endYearValue}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch inflation data: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const calculatedInflationRate = data.inflationRate
      const calculatedAdjustedValue = amountValue * (1 + calculatedInflationRate)

      setInflationRate(calculatedInflationRate)
      setAdjustedValue(calculatedAdjustedValue)
      trackInflationCalculation(selectedCurrency, startYear, endYear, Number.parseFloat(amount))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(event.target.value)
    trackCurrencyChange(event.target.value)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Inflation Calculator</h2>

      <div className="mb-4">
        <label htmlFor="currency" className="block text-gray-700 text-sm font-bold mb-2">
          Currency:
        </label>
        <select
          id="currency"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
          Amount:
        </label>
        <input
          type="number"
          id="amount"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="startYear" className="block text-gray-700 text-sm font-bold mb-2">
          Start Year:
        </label>
        <input
          type="number"
          id="startYear"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter start year"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="endYear" className="block text-gray-700 text-sm font-bold mb-2">
          End Year:
        </label>
        <input
          type="number"
          id="endYear"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter end year"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={calculateInflation}
        disabled={loading}
      >
        {loading ? "Calculating..." : "Calculate"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {inflationRate !== null && (
        <div className="mt-4">
          <p>Inflation Rate: {inflationRate.toFixed(2)}</p>
        </div>
      )}

      {adjustedValue !== null && (
        <div className="mt-4">
          <p>
            Adjusted Value: {adjustedValue.toFixed(2)} {selectedCurrency}
          </p>
        </div>
      )}
    </div>
  )
}

export default InflationCalculator
