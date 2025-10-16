// HHS Poverty Guidelines API client

const POVERTY_GUIDELINES_API = "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines/api"

export interface PovertyGuidelineResponse {
  year: number
  guidelines: {
    household_size: number
    "48_contiguous": number
    alaska: number
    hawaii: number
  }[]
}

/**
 * Fetch poverty guidelines for a specific year
 * @param year Year (e.g., 2024)
 */
export async function fetchPovertyGuidelines(year?: number): Promise<any> {
  const targetYear = year || new Date().getFullYear()

  try {
    const response = await fetch(`${POVERTY_GUIDELINES_API}/${targetYear}`)

    if (!response.ok) {
      throw new Error(`Poverty Guidelines API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch from API, falling back to manual data")
    // Fallback to manual data if API fails
    return getPovertyGuidelinesFallback(targetYear)
  }
}

/**
 * Fetch poverty guidelines for multiple years
 */
export async function fetchHistoricalPovertyGuidelines(
  startYear = 2000,
  endYear: number = new Date().getFullYear(),
): Promise<PovertyGuidelineResponse[]> {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

  const promises = years.map((year) => fetchPovertyGuidelines(year))
  const results = await Promise.all(promises)

  return results
}

/**
 * Fallback poverty guidelines data (2024)
 * Source: https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 */
function getPovertyGuidelinesFallback(year: number): PovertyGuidelineResponse {
  // 2024 poverty guidelines
  const guidelines2024 = {
    year: 2024,
    guidelines: [
      { household_size: 1, "48_contiguous": 15060, alaska: 18810, hawaii: 17310 },
      { household_size: 2, "48_contiguous": 20440, alaska: 25520, hawaii: 23500 },
      { household_size: 3, "48_contiguous": 25820, alaska: 32230, hawaii: 29690 },
      { household_size: 4, "48_contiguous": 31200, alaska: 38960, hawaii: 35880 },
      { household_size: 5, "48_contiguous": 36580, alaska: 45690, hawaii: 42070 },
      { household_size: 6, "48_contiguous": 41960, alaska: 52420, hawaii: 48260 },
      { household_size: 7, "48_contiguous": 47340, alaska: 59150, hawaii: 54450 },
      { household_size: 8, "48_contiguous": 52720, alaska: 65880, hawaii: 60640 },
    ],
  }

  // For years other than 2024, adjust by ~3% per year (rough estimate)
  if (year !== 2024) {
    const yearDiff = year - 2024
    const adjustmentFactor = Math.pow(1.03, yearDiff)

    return {
      year,
      guidelines: guidelines2024.guidelines.map((g) => ({
        household_size: g.household_size,
        "48_contiguous": Math.round(g["48_contiguous"] * adjustmentFactor),
        alaska: Math.round(g.alaska * adjustmentFactor),
        hawaii: Math.round(g.hawaii * adjustmentFactor),
      })),
    }
  }

  return guidelines2024
}

/**
 * Calculate discretionary income for income-driven repayment plans
 * @param agi Adjusted Gross Income
 * @param familySize Family size
 * @param state State of residence ("48_states" | "alaska" | "hawaii")
 * @param povertyMultiplier Multiplier for poverty guideline (1.5 for most IDR plans)
 */
export function calculateDiscretionaryIncome(
  agi: number,
  familySize: number,
  state: "48_states" | "alaska" | "hawaii" = "48_states",
  povertyMultiplier = 1.5,
): number {
  // This would use the fetched poverty guidelines
  // For now, using 2024 data as example
  const guidelines = getPovertyGuidelinesFallback(2024)
  const guideline = guidelines.guidelines.find((g) => g.household_size === familySize)

  if (!guideline) {
    throw new Error(`No poverty guideline found for family size ${familySize}`)
  }

  const povertyLevel =
    state === "alaska" ? guideline.alaska : state === "hawaii" ? guideline.hawaii : guideline["48_contiguous"]

  const adjustedPovertyLevel = povertyLevel * povertyMultiplier
  const discretionaryIncome = Math.max(0, agi - adjustedPovertyLevel)

  return discretionaryIncome
}
