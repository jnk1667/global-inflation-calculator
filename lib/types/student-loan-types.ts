// TypeScript interfaces for student loan calculator data

export interface SalaryData {
  occupationCode: string
  occupationTitle: string
  annualMeanWage: number
  annualMedianWage: number
  hourlyMeanWage: number
  hourlyMedianWage: number
  employmentLevel: number
  year: number
}

export interface EarningsByMajor {
  cipCode: string // Classification of Instructional Programs code
  cipTitle: string
  credentialLevel: string // "undergraduate" | "graduate" | "certificate"
  earningsYear1: number // Median earnings 1 year after graduation
  earningsYear4: number // Median earnings 4 years after graduation
  earningsYear10: number // Median earnings 10 years after graduation
  debtMedian: number // Median debt at graduation
  debtMean: number // Mean debt at graduation
  year: number
}

export interface FederalLoanRate {
  loanType: "Direct Subsidized" | "Direct Unsubsidized" | "Direct PLUS (Parent)" | "Direct PLUS (Grad)"
  academicYear: string // e.g., "2024-2025"
  interestRate: number // as decimal, e.g., 0.0529 for 5.29%
  originationFee: number // as decimal, e.g., 0.0107 for 1.07%
  effectiveDate: string // ISO date string
}

export interface PovertyGuideline {
  year: number
  householdSize: number
  annual48States: number // 48 contiguous states + DC
  annualAlaska: number
  annualHawaii: number
}

export interface TaxBracket {
  year: number
  filingStatus: "single" | "married_joint" | "married_separate" | "head_of_household"
  brackets: {
    rate: number // as decimal, e.g., 0.10 for 10%
    incomeMin: number
    incomeMax: number | null // null for highest bracket
  }[]
  standardDeduction: number
}

export interface IncomeGrowthRate {
  educationLevel: "high_school" | "associate" | "bachelor" | "master" | "doctoral" | "professional"
  yearsExperience: number
  annualGrowthRate: number // as decimal, e.g., 0.03 for 3%
}

export interface StudentLoanData {
  salaries: SalaryData[]
  earningsByMajor: EarningsByMajor[]
  federalLoanRates: FederalLoanRate[]
  povertyGuidelines: PovertyGuideline[]
  taxBrackets: TaxBracket[]
  incomeGrowthRates: IncomeGrowthRate[]
  lastUpdated: string
}

export interface LoanCalculationInput {
  principalAmount: number
  interestRate: number
  loanTermYears: number
  startDate: Date
  repaymentPlan: "standard" | "graduated" | "extended" | "income_driven"
  incomeDriverPlan?: "SAVE" | "PAYE" | "IBR" | "ICR"
  annualIncome?: number
  familySize?: number
  stateOfResidence?: string
}

export interface LoanCalculationResult {
  monthlyPayment: number
  totalPaid: number
  totalInterest: number
  payoffDate: Date
  inflationAdjustedTotalCost: number
  realBurdenOverTime: {
    year: number
    nominalPayment: number
    realPayment: number // adjusted for inflation
    percentageOfIncome: number
  }[]
}
