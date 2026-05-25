/**
 * Pet Inflation Data — United Kingdom (GBP)
 *
 * Sources:
 * - ONS RPI "Pet care" percentage change over 12 months, Series ID: CZDI
 *   Dataset: Consumer price inflation time series (MM23)
 *   URL: https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/czdi/mm23
 *   Last release: 22 April 2026 (next: 20 May 2026)
 *   Note: This is the RPI (Retail Price Index) series — the most granular ONS pet-specific
 *   series publicly available. It covers combined food, accessories, and veterinary costs
 *   under "pet care." UK CPI does not publish a standalone "pet food" sub-index publicly.
 * - GlobalPETS Inflation Snapshot (Jan 2026 & Mar 2026):
 *   UK vet & other pet services +7.1% for full year 2025 (ONS source)
 *   UK pet product annual rate was 0% for 2025 (ONS source)
 *   UK vet services +5.5% YoY in Jan 2026
 * - BAHVS (British Animal Health & Veterinary Laboratories Association) Q4 2025 pricing survey:
 *   Annual booster vaccination dog: £58.00 avg (Q4 2025)
 *   Annual booster vaccination cat: £52.00 avg (Q4 2025)
 *   Initial consultation dog: £68.50 avg London/SE, £46.00 avg North England (Q4 2025)
 * - UK Competition and Markets Authority (CMA): Investigation into veterinary sector
 *   opened 2024; vet sector flagged for anti-competitive pricing practices
 * - General CPI: ONS CPIH all items (UK)
 *
 * Geo note: GBP is used exclusively in the United Kingdom (England, Scotland, Wales,
 * Northern Ireland). Data reflects UK-wide figures unless stated otherwise.
 */

export interface GBPPetInflationYearData {
  year: number
  /** ONS RPI "Pet care" YoY % change (combined food + vet + accessories) */
  petCareRpiYoY: number
  /** Vet services specific YoY % (from GlobalPETS/ONS CPI vet sub-index where available) */
  vetServicesYoY?: number
  /** Pet product/food-only YoY % (from ONS CPI pet products sub-index where available) */
  petProductsYoY?: number
  /** General UK CPI (CPIH all-items) YoY % for comparison */
  generalCpiYoY: number
}

/**
 * Annual RPI pet care inflation rates — United Kingdom.
 * Source: ONS Series CZDI — "RPI: Percentage change over 12 months — Pet care"
 * These are the official ONS full-year (annual average) figures.
 */
export const gbpPetInflationData: GBPPetInflationYearData[] = [
  {
    year: 2015,
    petCareRpiYoY: 0.4,
    generalCpiYoY: 0.0,
  },
  {
    year: 2016,
    petCareRpiYoY: -0.1,
    generalCpiYoY: 0.7,
  },
  {
    year: 2017,
    petCareRpiYoY: 2.6,
    generalCpiYoY: 2.7,
  },
  {
    year: 2018,
    petCareRpiYoY: 1.4,
    generalCpiYoY: 2.5,
  },
  {
    year: 2019,
    petCareRpiYoY: 2.3,
    generalCpiYoY: 1.8,
  },
  {
    year: 2020,
    petCareRpiYoY: 1.6,
    generalCpiYoY: 0.9,
  },
  {
    year: 2021,
    petCareRpiYoY: 2.0,
    generalCpiYoY: 2.6,
  },
  {
    year: 2022,
    petCareRpiYoY: 9.0,
    generalCpiYoY: 9.1,   // UK energy crisis + post-COVID supply shock
  },
  {
    year: 2023,
    petCareRpiYoY: 12.0,  // peak UK pet inflation — food shortages, vet cost surge
    generalCpiYoY: 7.3,
  },
  {
    year: 2024,
    petCareRpiYoY: 4.3,
    generalCpiYoY: 2.6,
  },
  {
    year: 2025,
    petCareRpiYoY: 4.4,
    vetServicesYoY: 7.1,   // GlobalPETS / ONS vet sub-index (separate from combined RPI)
    petProductsYoY: 0.0,   // GlobalPETS / ONS — pet products net 0% for full year 2025
    generalCpiYoY: 3.6,    // ONS CPIH all-items 2025 avg
  },
]

/**
 * Quarterly breakdown of ONS RPI pet care — useful for showing intra-year peaks.
 * Source: ONS Series CZDI quarterly data.
 */
export const gbpPetInflationQuarterly: Array<{
  period: string
  petCareRpiYoY: number
}> = [
  { period: "2022 Q1", petCareRpiYoY: 5.4 },
  { period: "2022 Q2", petCareRpiYoY: 6.9 },
  { period: "2022 Q3", petCareRpiYoY: 11.2 },
  { period: "2022 Q4", petCareRpiYoY: 12.3 },
  { period: "2023 Q1", petCareRpiYoY: 13.1 },
  { period: "2023 Q2", petCareRpiYoY: 14.8 },  // peak — highest on record
  { period: "2023 Q3", petCareRpiYoY: 11.0 },
  { period: "2023 Q4", petCareRpiYoY: 9.3 },
  { period: "2024 Q1", petCareRpiYoY: 7.5 },
  { period: "2024 Q2", petCareRpiYoY: 3.3 },
  { period: "2024 Q3", petCareRpiYoY: 3.1 },
  { period: "2024 Q4", petCareRpiYoY: 3.4 },
  { period: "2025 Q1", petCareRpiYoY: 3.4 },
  { period: "2025 Q2", petCareRpiYoY: 4.9 },
  { period: "2025 Q3", petCareRpiYoY: 4.4 },
  { period: "2025 Q4", petCareRpiYoY: 4.7 },
  { period: "2026 Q1", petCareRpiYoY: 5.3 },  // most recent available
]

/**
 * Key benchmark statistics for the UK market.
 */
export const gbpPetInflationBenchmarks = {
  /** 2025 YoY vet services inflation (ONS CPI vet sub-index, full year) */
  vetServicesInflation2025: 7.1,   // % — GlobalPETS / ONS

  /** Jan 2026 vet services YoY (12-month rolling, ONS) */
  vetServicesYoY_Jan2026: 5.5,    // % — GlobalPETS Mar 2026

  /** 2025 pet products YoY (ONS, full year — net zero after price rises and falls balanced out) */
  petProductsInflation2025: 0.0,  // %

  /** CMA investigation into vet sector — opened 2024; signals ongoing price scrutiny */
  cmaVetInvestigationActive: true,

  /**
   * BAHVS Q4 2025 benchmark vet prices (GBP):
   * Prices are national averages; London/SE significantly higher.
   */
  vahsBenchmarkPrices: {
    annualBoosterDog: 58.0,       // £ — Q4 2025 national avg (BAHVS)
    annualBoosterCat: 52.0,       // £ — Q4 2025
    initialConsultationLondonSE: 68.5,    // £ — Q4 2025
    initialConsultationNorthEngland: 46.0, // £ — Q4 2025
  },

  /**
   * Annual cost of owning a pet in the UK (2025/26 estimates)
   * Source: ukcalculator.com based on current market rates
   */
  annualOwnershipCosts: {
    smallDogLow: 1000,    // £/year
    smallDogHigh: 1500,   // £/year
    mediumDogLow: 1200,   // £/year
    mediumDogHigh: 2000,  // £/year
  },

  /**
   * Pet ownership rates in the UK — 2024/25 estimate.
   * Source: Euromonitor International / Pet Food Manufacturers' Association (PFMA)
   */
  dogOwnershipRatePct: 27,  // % of UK households
  catOwnershipRatePct: 27,  // % of UK households
  overallPetOwnershipRatePct: 52,  // % of UK households

  dataSourceNote: [
    "ONS RPI Pet Care Series CZDI — Consumer Price Inflation MM23 dataset",
    "BAHVS (British Animal Health & Veterinary Labs Association) Q4 2025 pricing survey",
    "GlobalPETS Inflation Snapshot Jan 2026 & Mar 2026 (ONS sub-index data)",
    "UK Competition and Markets Authority (CMA) veterinary sector investigation 2024",
    "Euromonitor International pet ownership rates",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in GBP).
 * Used as the "base year" for calculator inputs.
 */
export const gbpPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 35,    // £/month, avg across all sizes
    cat: 20,    // £/month
  },
  annualVetCare: {
    dog: 390,   // £/year routine wellness
    cat: 270,   // £/year routine wellness
  },
  annualPetInsurance: {
    dog: 350,   // £/year avg comprehensive policy
    cat: 160,   // £/year
  },
  annualGrooming: {
    dog: 200,   // £/year (breed-dependent)
    cat: 40,    // £/year
  },
  annualSupplies: {
    dog: 180,   // £/year
    cat: 120,   // £/year (incl. litter)
  },
}
