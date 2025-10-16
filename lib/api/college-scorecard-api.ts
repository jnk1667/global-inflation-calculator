// College Scorecard API client for earnings by major/field of study

const SCORECARD_API_BASE = "https://api.data.gov/ed/collegescorecard/v1"
const SCORECARD_API_KEY = process.env.COLLEGE_SCORECARD_API_KEY

export interface CollegeScorecardField {
  school: {
    name: string
    city: string
    state: string
  }
  latest: {
    earnings: {
      "1_yr_after_completion": {
        overall_median: number
      }
      "4_yrs_after_completion": {
        overall_median: number
      }
      "10_yrs_after_completion": {
        median: number
      }
    }
    student: {
      debt_median: number
    }
  }
  [key: string]: any
}

export interface FieldOfStudyData {
  credential: {
    level: number
    title: string
  }
  code: string // CIP code
  title: string
  earnings: {
    "1_yr_after": {
      median: number
      count: number
    }
    "4_yrs_after": {
      median: number
      count: number
    }
  }
  debt: {
    median: number
    mean: number
  }
}

/**
 * Fetch earnings data by field of study (CIP code)
 * @param cipCode 6-digit CIP code (e.g., "11.0701" for Computer Science)
 * @param credentialLevel 1=Certificate, 2=Associate, 3=Bachelor, 5=Master, 6=Doctoral
 */
export async function fetchEarningsByMajor(cipCode?: string, credentialLevel?: number): Promise<any> {
  if (!SCORECARD_API_KEY) {
    throw new Error("COLLEGE_SCORECARD_API_KEY environment variable is not set")
  }

  const params = new URLSearchParams({
    api_key: SCORECARD_API_KEY,
    fields: [
      "school.name",
      "school.city",
      "school.state",
      "latest.earnings.1_yr_after_completion.overall_median",
      "latest.earnings.4_yrs_after_completion.overall_median",
      "latest.earnings.10_yrs_after_completion.median",
      "latest.student.debt_median",
    ].join(","),
    per_page: "100",
  })

  if (cipCode) {
    params.append("latest.programs.cip_4_digit", cipCode.substring(0, 4))
  }

  if (credentialLevel) {
    params.append("latest.programs.credential.level", credentialLevel.toString())
  }

  const response = await fetch(`${SCORECARD_API_BASE}/schools?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`College Scorecard API request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Fetch field of study data (more detailed than school-level data)
 */
export async function fetchFieldOfStudyData(page = 0): Promise<any> {
  if (!SCORECARD_API_KEY) {
    throw new Error("COLLEGE_SCORECARD_API_KEY environment variable is not set")
  }

  const params = new URLSearchParams({
    api_key: SCORECARD_API_KEY,
    per_page: "100",
    page: page.toString(),
  })

  const response = await fetch(`${SCORECARD_API_BASE}/fields?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`College Scorecard API request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Common CIP (Classification of Instructional Programs) codes
 */
export const COMMON_CIP_CODES = {
  COMPUTER_SCIENCE: "11.0701",
  ENGINEERING_GENERAL: "14.0101",
  MECHANICAL_ENGINEERING: "14.1901",
  CIVIL_ENGINEERING: "14.0801",
  ELECTRICAL_ENGINEERING: "14.1001",
  BUSINESS_ADMIN: "52.0201",
  ACCOUNTING: "52.0301",
  FINANCE: "52.0801",
  MARKETING: "52.1401",
  NURSING: "51.1601",
  BIOLOGY: "26.0101",
  PSYCHOLOGY: "42.0101",
  ENGLISH: "23.0101",
  HISTORY: "54.0101",
  MATHEMATICS: "27.0101",
  ECONOMICS: "45.0601",
  POLITICAL_SCIENCE: "45.1001",
  EDUCATION: "13.0101",
  SOCIAL_WORK: "44.0701",
  COMMUNICATIONS: "09.0101",
}
