// Student loan calculator with inflation-adjusted "real burden" calculations

import type { LoanCalculationInput, LoanCalculationResult } from "./types/student-loan-types"

/**
 * Calculate monthly payment for standard repayment plan
 */
export function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 12
  const numPayments = termYears * 12

  if (monthlyRate === 0) {
    return principal / numPayments
  }

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)

  return payment
}

/**
 * Calculate income-driven repayment monthly payment
 */
export function calculateIDRPayment(
  plan: "SAVE" | "PAYE" | "IBR" | "ICR",
  agi: number,
  familySize: number,
  povertyGuideline: number,
  loanBalance: number,
): number {
  let discretionaryIncome: number
  let paymentPercentage: number

  switch (plan) {
    case "SAVE":
    case "PAYE":
      // 10% of discretionary income (AGI - 150% of poverty guideline)
      discretionaryIncome = Math.max(0, agi - povertyGuideline * 1.5)
      paymentPercentage = 0.1
      break

    case "IBR":
      // 10% or 15% depending on when borrowed (using 10% for new borrowers)
      discretionaryIncome = Math.max(0, agi - povertyGuideline * 1.5)
      paymentPercentage = 0.1
      break

    case "ICR":
      // Lesser of 20% of discretionary income or fixed 12-year payment
      discretionaryIncome = Math.max(0, agi - povertyGuideline)
      const icrPayment = (discretionaryIncome * 0.2) / 12
      const fixed12YearPayment = calculateMonthlyPayment(loanBalance, 0.05, 12)
      return Math.min(icrPayment, fixed12YearPayment)

    default:
      throw new Error(`Unknown IDR plan: ${plan}`)
  }

  const annualPayment = discretionaryIncome * paymentPercentage
  return annualPayment / 12
}

/**
 * Calculate inflation-adjusted loan cost over time
 */
export function calculateRealBurden(
  monthlyPayment: number,
  termYears: number,
  annualInflationRate: number,
  annualIncomeGrowthRate: number,
  startingIncome: number,
): LoanCalculationResult["realBurdenOverTime"] {
  const realBurden: LoanCalculationResult["realBurdenOverTime"] = []

  for (let year = 0; year <= termYears; year++) {
    const inflationFactor = Math.pow(1 + annualInflationRate, year)
    const incomeFactor = Math.pow(1 + annualIncomeGrowthRate, year)

    const currentIncome = startingIncome * incomeFactor
    const realPayment = monthlyPayment / inflationFactor

    realBurden.push({
      year,
      nominalPayment: monthlyPayment,
      realPayment: realPayment,
      percentageOfIncome: (monthlyPayment * 12) / currentIncome,
    })
  }

  return realBurden
}

/**
 * Main loan calculation function
 */
export function calculateLoan(input: LoanCalculationInput): LoanCalculationResult {
  const { principalAmount, interestRate, loanTermYears, startDate, repaymentPlan, annualIncome = 50000 } = input

  let monthlyPayment: number

  if (repaymentPlan === "standard") {
    monthlyPayment = calculateMonthlyPayment(principalAmount, interestRate, loanTermYears)
  } else if (repaymentPlan === "income_driven" && input.incomeDriverPlan) {
    // For IDR, would need poverty guidelines
    const povertyGuideline = 15060 // 2024 guideline for family of 1
    monthlyPayment = calculateIDRPayment(
      input.incomeDriverPlan,
      annualIncome,
      input.familySize || 1,
      povertyGuideline,
      principalAmount,
    )
  } else {
    monthlyPayment = calculateMonthlyPayment(principalAmount, interestRate, loanTermYears)
  }

  const totalPaid = monthlyPayment * loanTermYears * 12
  const totalInterest = totalPaid - principalAmount

  const payoffDate = new Date(startDate)
  payoffDate.setFullYear(payoffDate.getFullYear() + loanTermYears)

  // Calculate real burden over time (using historical average inflation of 3%)
  const realBurdenOverTime = calculateRealBurden(
    monthlyPayment,
    loanTermYears,
    0.03, // 3% inflation
    0.04, // 4% income growth
    annualIncome,
  )

  // Calculate inflation-adjusted total cost
  const inflationAdjustedTotalCost = realBurdenOverTime.reduce((sum, year) => sum + year.realPayment * 12, 0)

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    payoffDate,
    inflationAdjustedTotalCost,
    realBurdenOverTime,
  }
}
