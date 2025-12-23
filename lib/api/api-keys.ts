// Centralized API key management and validation

export interface ApiKeyStatus {
  isConfigured: boolean
  name: string
  requiredFor: string[]
}

/**
 * Check status of all API keys
 */
export function checkApiKeysStatus(): Record<string, ApiKeyStatus> {
  return {
    fred: {
      isConfigured: !!process.env.FRED_API_KEY,
      name: "FRED (Federal Reserve Economic Data)",
      requiredFor: ["Treasury rates", "Inflation data", "Economic indicators"],
    },
    bls: {
      isConfigured: !!process.env.BLS_API_KEY,
      name: "BLS (Bureau of Labor Statistics)",
      requiredFor: ["Employment data", "Wage statistics", "CPI data"],
    },
    collegeScorecard: {
      isConfigured: !!process.env.COLLEGE_SCORECARD_API_KEY,
      name: "College Scorecard",
      requiredFor: ["College cost data", "Student loan data"],
    },
    alphaVantage: {
      isConfigured: !!process.env.ALPHA_VANTAGE_API_KEY,
      name: "Alpha Vantage",
      requiredFor: ["Stock prices", "Commodity ETFs", "Oil prices"],
    },
    eia: {
      isConfigured: !!process.env.EIA_API_KEY,
      name: "EIA (Energy Information Administration)",
      requiredFor: ["Gasoline prices", "Crude oil", "Natural gas", "Electricity prices"],
    },
  }
}

/**
 * Get missing API keys
 */
export function getMissingApiKeys(): string[] {
  const status = checkApiKeysStatus()
  return Object.entries(status)
    .filter(([, value]) => !value.isConfigured)
    .map(([key]) => key)
}

/**
 * Check if all required API keys for deflation calculator are present
 */
export function validateDeflationCalculatorApis(): {
  isValid: boolean
  missing: string[]
} {
  const required = ["ALPHA_VANTAGE_API_KEY"]
  const missing = required.filter((key) => !process.env[key])

  return {
    isValid: missing.length === 0,
    missing,
  }
}
