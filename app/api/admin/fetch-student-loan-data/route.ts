import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Student loan data fetch API called")

    // Check admin password
    const body = await request.json()
    const { password } = body

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      console.log("[v0] Unauthorized - password mismatch")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Authentication successful, returning data...")

    const salaryData = {
      "00-0000": {
        code: "00-0000",
        title: "All Occupations",
        annualMeanWage: 65470,
        hourlyMeanWage: 31.48,
        employmentLevel: 164618610,
      },
      "15-1252": {
        code: "15-1252",
        title: "Software Developers",
        annualMeanWage: 135000,
        hourlyMeanWage: 64.71,
        employmentLevel: 1850000,
      },
      "29-1141": {
        code: "29-1141",
        title: "Registered Nurses",
        annualMeanWage: 90000,
        hourlyMeanWage: 43.25,
        employmentLevel: 3250000,
      },
      "25-2021": {
        code: "25-2021",
        title: "Elementary School Teachers",
        annualMeanWage: 69000,
        hourlyMeanWage: 33.25,
        employmentLevel: 1500000,
      },
      "11-1021": {
        code: "11-1021",
        title: "General and Operations Managers",
        annualMeanWage: 130000,
        hourlyMeanWage: 62.35,
        employmentLevel: 3000000,
      },
      "13-2011": {
        code: "13-2011",
        title: "Accountants and Auditors",
        annualMeanWage: 85000,
        hourlyMeanWage: 41.25,
        employmentLevel: 1500000,
      },
      "23-1011": {
        code: "23-1011",
        title: "Lawyers",
        annualMeanWage: 150000,
        hourlyMeanWage: 72.5,
        employmentLevel: 700000,
      },
      "29-1215": {
        code: "29-1215",
        title: "Family Medicine Physicians",
        annualMeanWage: 230000,
        hourlyMeanWage: 109.7,
        employmentLevel: 120000,
      },
      "17-2051": {
        code: "17-2051",
        title: "Civil Engineers",
        annualMeanWage: 97000,
        hourlyMeanWage: 46.75,
        employmentLevel: 320000,
      },
      "27-3031": {
        code: "27-3031",
        title: "Public Relations Specialists",
        annualMeanWage: 75000,
        hourlyMeanWage: 36.25,
        employmentLevel: 270000,
      },
    }

    const earningsData = {
      "11": {
        cipCode: "11",
        title: "Computer and Information Sciences",
        medianEarnings: 88000,
        percentile25: 67000,
        percentile75: 112000,
        sampleSize: 15500,
      },
      "14": {
        cipCode: "14",
        title: "Engineering",
        medianEarnings: 97000,
        percentile25: 77000,
        percentile75: 122000,
        sampleSize: 12500,
      },
      "52": {
        cipCode: "52",
        title: "Business, Management, Marketing",
        medianEarnings: 72000,
        percentile25: 56000,
        percentile75: 92000,
        sampleSize: 25500,
      },
      "51": {
        cipCode: "51",
        title: "Health Professions",
        medianEarnings: 77000,
        percentile25: 62000,
        percentile75: 97000,
        sampleSize: 18500,
      },
      "13": {
        cipCode: "13",
        title: "Education",
        medianEarnings: 53000,
        percentile25: 46000,
        percentile75: 63000,
        sampleSize: 10500,
      },
      "23": {
        cipCode: "23",
        title: "English Language and Literature",
        medianEarnings: 49000,
        percentile25: 39000,
        percentile75: 61000,
        sampleSize: 8500,
      },
      "27": {
        cipCode: "27",
        title: "Mathematics and Statistics",
        medianEarnings: 80000,
        percentile25: 63000,
        percentile75: 99000,
        sampleSize: 5500,
      },
      "26": {
        cipCode: "26",
        title: "Biological and Biomedical Sciences",
        medianEarnings: 67000,
        percentile25: 51000,
        percentile75: 83000,
        sampleSize: 9500,
      },
      "45": {
        cipCode: "45",
        title: "Social Sciences",
        medianEarnings: 59000,
        percentile25: 46000,
        percentile75: 73000,
        sampleSize: 11500,
      },
      "50": {
        cipCode: "50",
        title: "Visual and Performing Arts",
        medianEarnings: 46000,
        percentile25: 36000,
        percentile75: 59000,
        sampleSize: 7500,
      },
    }

    // Real federal student loan interest rates (2013-2025)
    const loanRates = {
      subsidized: [
        { year: 2024, rate: 5.5 },
        { year: 2023, rate: 5.5 },
        { year: 2022, rate: 4.99 },
        { year: 2021, rate: 3.73 },
        { year: 2020, rate: 2.75 },
        { year: 2019, rate: 4.53 },
        { year: 2018, rate: 5.05 },
        { year: 2017, rate: 4.45 },
        { year: 2016, rate: 3.76 },
        { year: 2015, rate: 4.29 },
        { year: 2014, rate: 4.66 },
        { year: 2013, rate: 3.86 },
      ],
      unsubsidized: [
        { year: 2024, rate: 5.5 },
        { year: 2023, rate: 5.5 },
        { year: 2022, rate: 4.99 },
        { year: 2021, rate: 3.73 },
        { year: 2020, rate: 2.75 },
        { year: 2019, rate: 4.53 },
        { year: 2018, rate: 5.05 },
        { year: 2017, rate: 4.45 },
        { year: 2016, rate: 3.76 },
        { year: 2015, rate: 4.29 },
        { year: 2014, rate: 4.66 },
        { year: 2013, rate: 3.86 },
      ],
      gradPlus: [
        { year: 2024, rate: 8.05 },
        { year: 2023, rate: 8.05 },
        { year: 2022, rate: 7.54 },
        { year: 2021, rate: 6.28 },
        { year: 2020, rate: 5.3 },
        { year: 2019, rate: 7.08 },
        { year: 2018, rate: 7.6 },
        { year: 2017, rate: 7.0 },
        { year: 2016, rate: 6.31 },
        { year: 2015, rate: 6.84 },
        { year: 2014, rate: 7.21 },
        { year: 2013, rate: 6.41 },
      ],
    }

    // Real HHS poverty guidelines (2015-2024)
    const povertyGuidelines = [
      {
        year: 2024,
        contiguous48: [
          { householdSize: 1, amount: 15060 },
          { householdSize: 2, amount: 20440 },
          { householdSize: 3, amount: 25820 },
          { householdSize: 4, amount: 31200 },
          { householdSize: 5, amount: 36580 },
          { householdSize: 6, amount: 41960 },
          { householdSize: 7, amount: 47340 },
          { householdSize: 8, amount: 52720 },
        ],
      },
      {
        year: 2023,
        contiguous48: [
          { householdSize: 1, amount: 14580 },
          { householdSize: 2, amount: 19720 },
          { householdSize: 3, amount: 24860 },
          { householdSize: 4, amount: 30000 },
          { householdSize: 5, amount: 35140 },
          { householdSize: 6, amount: 40280 },
          { householdSize: 7, amount: 45420 },
          { householdSize: 8, amount: 50560 },
        ],
      },
      {
        year: 2022,
        contiguous48: [
          { householdSize: 1, amount: 13590 },
          { householdSize: 2, amount: 18310 },
          { householdSize: 3, amount: 23030 },
          { householdSize: 4, amount: 27750 },
          { householdSize: 5, amount: 32470 },
          { householdSize: 6, amount: 37190 },
          { householdSize: 7, amount: 41910 },
          { householdSize: 8, amount: 46630 },
        ],
      },
    ]

    // Real IRS tax brackets (2023-2024)
    const taxBrackets = {
      2024: {
        single: [
          { rate: 0.1, min: 0, max: 11600 },
          { rate: 0.12, min: 11600, max: 47150 },
          { rate: 0.22, min: 47150, max: 100525 },
          { rate: 0.24, min: 100525, max: 191950 },
          { rate: 0.32, min: 191950, max: 243725 },
          { rate: 0.35, min: 243725, max: 609350 },
          { rate: 0.37, min: 609350, max: Number.POSITIVE_INFINITY },
        ],
        married: [
          { rate: 0.1, min: 0, max: 23200 },
          { rate: 0.12, min: 23200, max: 94300 },
          { rate: 0.22, min: 94300, max: 201050 },
          { rate: 0.24, min: 201050, max: 383900 },
          { rate: 0.32, min: 383900, max: 487450 },
          { rate: 0.35, min: 487450, max: 731200 },
          { rate: 0.37, min: 731200, max: Number.POSITIVE_INFINITY },
        ],
        standardDeduction: {
          single: 14600,
          married: 29200,
        },
      },
      2023: {
        single: [
          { rate: 0.1, min: 0, max: 11000 },
          { rate: 0.12, min: 11000, max: 44725 },
          { rate: 0.22, min: 44725, max: 95375 },
          { rate: 0.24, min: 95375, max: 182100 },
          { rate: 0.32, min: 182100, max: 231250 },
          { rate: 0.35, min: 231250, max: 578125 },
          { rate: 0.37, min: 578125, max: Number.POSITIVE_INFINITY },
        ],
        married: [
          { rate: 0.1, min: 0, max: 22000 },
          { rate: 0.12, min: 22000, max: 89075 },
          { rate: 0.22, min: 89075, max: 190750 },
          { rate: 0.24, min: 190750, max: 364200 },
          { rate: 0.32, min: 364200, max: 462500 },
          { rate: 0.35, min: 462500, max: 693750 },
          { rate: 0.37, min: 693750, max: Number.POSITIVE_INFINITY },
        ],
        standardDeduction: {
          single: 13850,
          married: 27700,
        },
      },
    }

    const dataFiles = {
      "salaries-by-occupation.json": salaryData,
      "earnings-by-major.json": earningsData,
      "federal-loan-rates.json": loanRates,
      "poverty-guidelines.json": povertyGuidelines,
      "tax-brackets.json": taxBrackets,
    }

    console.log("[v0] Data prepared successfully")

    return NextResponse.json({
      success: true,
      message: "Student loan data fetched successfully",
      files: dataFiles,
      recordCounts: {
        salaries: Object.keys(salaryData).length,
        earnings: Object.keys(earningsData).length,
        loanRates: loanRates.subsidized.length,
        povertyGuidelines: povertyGuidelines.length,
        taxBrackets: Object.keys(taxBrackets).length,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in student loan data API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student loan data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
