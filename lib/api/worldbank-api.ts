// World Bank Documents & Reports API client
// Free tier with no strict rate limits

const WORLDBANK_API_BASE = "https://search.worldbank.org/api/v3/wds"

export interface WorldBankDocument {
  id: string
  display_title: string
  docdt: string // Document date
  docty: string // Document type
  count: string[] // Countries
  lang: string // Language
  abstracts: string
  url: string
  pdfurl?: string
}

export interface WorldBankApiResponse {
  total: number
  documents: {
    doclist: {
      docs: WorldBankDocument[]
    }
  }
}

/**
 * Search World Bank documents and reports
 * @param query Search query term
 * @param options Query options
 */
export async function searchWorldBankDocuments(
  query: string,
  options: {
    format?: "json" | "xml"
    fields?: string[]
    rows?: number
    offset?: number
    countries?: string[]
    documentTypes?: string[]
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
    language?: string
  } = {},
): Promise<WorldBankApiResponse> {
  const {
    format = "json",
    fields = ["id", "display_title", "docdt", "docty", "count", "abstracts", "url"],
    rows = 10,
    offset = 0,
    countries,
    documentTypes,
    startDate,
    endDate,
    language,
  } = options

  const params = new URLSearchParams({
    format,
    qterm: query,
    fl: fields.join(","),
    rows: rows.toString(),
    os: offset.toString(),
  })

  if (countries && countries.length > 0) {
    params.append("count_exact", countries.join("^"))
  }

  if (documentTypes && documentTypes.length > 0) {
    params.append("docty_exact", documentTypes.join("^"))
  }

  if (startDate) {
    params.append("strdate", startDate)
  }

  if (endDate) {
    params.append("enddate", endDate)
  }

  if (language) {
    params.append("lang_exact", language)
  }

  const url = `${WORLDBANK_API_BASE}?${params.toString()}`

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  })

  if (!response.ok) {
    throw new Error(`World Bank API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get facets (all available values) for specific fields
 * @param fields Fields to get facets for
 * @param query Optional query to filter
 */
export async function getWorldBankFacets(fields: string[], query?: string): Promise<any> {
  const params = new URLSearchParams({
    format: "json",
    fct: fields.join(","),
    rows: "0", // Don't return documents, just facets
  })

  if (query) {
    params.append("qterm", query)
  }

  const url = `${WORLDBANK_API_BASE}?${params.toString()}`

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  })

  if (!response.ok) {
    throw new Error(`World Bank API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Common document types in World Bank
 */
export const WORLDBANK_DOC_TYPES = {
  ECONOMIC_REPORT: "Economic & Sector Work",
  PROJECT_DOCUMENT: "Project Document",
  TECHNICAL_ASSISTANCE: "Technical Assistance",
  WORKING_PAPER: "Working Paper",
  POLICY_RESEARCH: "Policy Research Working Paper",
  ANNUAL_REPORT: "Annual Report",
  COUNTRY_REPORT: "Country Economic Memorandum",
  PROCUREMENT_PLAN: "Procurement Plan",
}

/**
 * Search for economic and commodity-related reports
 * @param topic Topic to search for (e.g., "gold", "oil", "inflation")
 * @param countries Optional list of countries
 * @param startYear Starting year
 * @param endYear Ending year
 */
export async function searchCommodityReports(
  topic: string,
  countries?: string[],
  startYear?: number,
  endYear?: number,
): Promise<WorldBankApiResponse> {
  const startDate = startYear ? `${startYear}-01-01` : undefined
  const endDate = endYear ? `${endYear}-12-31` : undefined

  return searchWorldBankDocuments(topic, {
    countries,
    startDate,
    endDate,
    rows: 50,
    documentTypes: [
      WORLDBANK_DOC_TYPES.ECONOMIC_REPORT,
      WORLDBANK_DOC_TYPES.WORKING_PAPER,
      WORLDBANK_DOC_TYPES.POLICY_RESEARCH,
    ],
  })
}

/**
 * Get available countries from World Bank
 */
export async function getAvailableCountries(): Promise<string[]> {
  const response = await getWorldBankFacets(["count_exact"])

  if (response.facets && response.facets.count_exact) {
    return Object.keys(response.facets.count_exact)
  }

  return []
}
