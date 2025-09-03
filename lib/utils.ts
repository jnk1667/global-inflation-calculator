import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateInflation(
  startAmount: number,
  startYear: number,
  endYear: number,
  inflationData: Array<{ year: number; rate: number }>,
): { endAmount: number; totalInflation: number; purchasingPowerLoss: number } {
  let currentAmount = startAmount
  let totalInflationRate = 1

  for (let year = startYear; year < endYear; year++) {
    const yearData = inflationData.find((d) => d.year === year)
    if (yearData) {
      const inflationRate = yearData.rate / 100
      totalInflationRate *= 1 + inflationRate
      currentAmount *= 1 + inflationRate
    }
  }

  const totalInflation = (totalInflationRate - 1) * 100
  const purchasingPowerLoss = ((currentAmount - startAmount) / currentAmount) * 100

  return {
    endAmount: currentAmount,
    totalInflation,
    purchasingPowerLoss,
  }
}

export function getYearRange(inflationData: Array<{ year: number; rate: number }>): {
  minYear: number
  maxYear: number
} {
  if (!inflationData || inflationData.length === 0) {
    return { minYear: 1950, maxYear: new Date().getFullYear() }
  }

  const years = inflationData.map((d) => d.year)
  return {
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
  }
}
