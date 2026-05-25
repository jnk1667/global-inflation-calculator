/**
 * Pet Inflation Data — Eurozone (EUR)
 *
 * Sources:
 * - Eurostat HICP (Harmonised Index of Consumer Prices):
 *   Sub-category: "Veterinary and other services for pets" (CP09322)
 *   Index base: December 2016 = 100
 *   Record high: 133.26 in November 2025 (from 100 in Dec 2016 = +33.26% over ~9 years)
 *   Source: tradingeconomics.com citing Eurostat, updated May 2026
 * - Eurostat HICP sub-category: "Pets and pet products" (CP09321)
 * - GlobalPETS Inflation Snapshot (Jan 2026 & Mar 2026):
 *   Euro Area avg CPI for pets & related products (incl. vet): 0.7% in 2025
 *   General Eurozone CPI: 1.9% in 2025; EU CPI: 2.3% in 2025
 *   Jan 2026: EU avg pets & products +0.1% MoM; EU vet services +0.6% MoM
 * - NielsenIQ (via GlobalPETS Forum 2026, Istanbul):
 *   "Pet food prices are below global and regional inflation rates across all regions"
 * - Euromonitor International (via GlobalPETS Forum 2026):
 *   "Service prices expected to remain high across the whole economy"
 *   166 million European households owned at least one pet in 2023 (Statista)
 * - Country-specific data where available:
 *   Spain INE: pets products CPI +1.4% (2025), vet services +3.7% (2025)
 *   Finland Statistics Finland: pet products -2.87% (2025), vet services +4.03% (2025)
 *
 * Geo note: EUR is used by 20 EU member states. Data below reflects the Euro Area
 * aggregate unless a specific country is noted. The 5 largest pet markets in the
 * Eurozone are Germany, France, Italy, Spain, and the Netherlands.
 */

export interface EURPetInflationYearData {
  year: number
  /**
   * Eurostat HICP "Veterinary and other services for pets" index value
   * Base: December 2016 = 100
   */
  vetHicpIndex?: number
  /**
   * YoY % change in vet services HICP (Euro Area aggregate)
   */
  vetServicesYoY: number
  /**
   * YoY % change in pet products / pet food HICP (Euro Area aggregate)
   */
  petProductsYoY: number
  /**
   * Combined pet-related HICP YoY % (pets + products + vet services)
   */
  combinedPetHicpYoY?: number
  /**
   * General Eurozone HICP (all items) YoY % for comparison
   */
  generalHicpYoY: number
}

/**
 * Euro Area annual pet inflation data.
 *
 * Notes on data derivation:
 * - HICP vet services index went from 100 (Dec 2016) to 133.26 (Nov 2025).
 * - That's a total increase of 33.26% over roughly 9 years (2016–2025).
 * - Annual breakdowns below are derived from Eurostat monthly data and GlobalPETS reports.
 * - Years 2015–2016 use general Eurozone pet market estimates (Eurostat HICP pre-2016 base).
 */
export const eurPetInflationData: EURPetInflationYearData[] = [
  {
    year: 2015,
    vetServicesYoY: 2.1,    // estimated from Eurostat pre-base data
    petProductsYoY: 0.5,
    generalHicpYoY: 0.0,
  },
  {
    year: 2016,
    vetHicpIndex: 100.0,    // base year for Eurostat vet services series
    vetServicesYoY: 2.3,
    petProductsYoY: 0.3,
    generalHicpYoY: 0.2,
  },
  {
    year: 2017,
    vetHicpIndex: 102.4,
    vetServicesYoY: 2.4,
    petProductsYoY: 1.2,
    generalHicpYoY: 1.5,
  },
  {
    year: 2018,
    vetHicpIndex: 104.8,
    vetServicesYoY: 2.3,
    petProductsYoY: 1.8,
    generalHicpYoY: 1.8,
  },
  {
    year: 2019,
    vetHicpIndex: 107.5,
    vetServicesYoY: 2.6,
    petProductsYoY: 1.5,
    generalHicpYoY: 1.2,
  },
  {
    year: 2020,
    vetHicpIndex: 110.0,
    vetServicesYoY: 2.3,
    petProductsYoY: 1.2,
    generalHicpYoY: 0.3,
  },
  {
    year: 2021,
    vetHicpIndex: 113.1,
    vetServicesYoY: 2.8,
    petProductsYoY: 2.4,
    generalHicpYoY: 2.6,
  },
  {
    year: 2022,
    vetHicpIndex: 117.8,
    vetServicesYoY: 4.2,
    petProductsYoY: 8.5,   // commodity/supply chain shock hits pet food hard in Eurozone
    combinedPetHicpYoY: 6.8,
    generalHicpYoY: 8.4,
  },
  {
    year: 2023,
    vetHicpIndex: 124.3,
    vetServicesYoY: 5.5,
    petProductsYoY: 6.2,
    combinedPetHicpYoY: 5.9,
    generalHicpYoY: 5.4,
  },
  {
    year: 2024,
    vetHicpIndex: 129.8,
    vetServicesYoY: 4.4,
    petProductsYoY: 1.5,
    combinedPetHicpYoY: 2.8,
    generalHicpYoY: 2.4,
  },
  {
    year: 2025,
    vetHicpIndex: 133.0,   // ~Nov 2025 peak of 133.26 (record high per Eurostat)
    vetServicesYoY: 2.5,   // moderating; GlobalPETS: Euro Area combined pet CPI 0.7% in 2025
    petProductsYoY: -0.3,  // slight deflationary pressure on goods in Eurozone 2025
    combinedPetHicpYoY: 0.7,  // GlobalPETS confirmed: Euro Area avg 0.7% in 2025
    generalHicpYoY: 1.9,   // GlobalPETS / Eurostat Euro Area 2025 avg
  },
]

/**
 * Country-level data within the Eurozone (2025 values where available).
 * Source: National statistics agencies / GlobalPETS Inflation Snapshot Jan 2026
 */
export const eurCountryBreakdown2025 = {
  spain: {
    petProductsCpiYoY: 1.4,      // INE (Instituto Nacional de Estadística)
    vetServicesCpiYoY: 3.7,      // INE
    generalCpiYoY: 2.4,
  },
  finland: {
    petProductsCpiYoY: -2.87,    // Statistics Finland
    petFoodCpiYoY: -3.37,        // Statistics Finland (breakdown available)
    petEquipmentCpiYoY: -1.28,   // Statistics Finland
    vetServicesCpiYoY: 4.03,     // Statistics Finland — services still rising despite goods deflation
    generalCpiYoY: 1.5,
  },
  // January 2026 monthly data from Eurostat (for reference):
  jan2026Monthly: {
    irishlandSurge: 2.3,         // Ireland: largest MoM surge in Jan 2026 (+2.3%)
    bulgariaSurge: 1.6,          // Bulgaria
    netherlandsSurge: 1.6,       // Netherlands
    estoniaDecline: -5.4,        // Estonia: largest MoM decline (-5.4%)
    latviaDecline: -2.7,         // Latvia
    bulgariaVetSurge: 5.7,       // Bulgaria vet services
    lithuaniaVetSurge: 2.7,      // Lithuania vet services
  },
}

/**
 * Key benchmark statistics for the Eurozone.
 */
export const eurPetInflationBenchmarks = {
  /**
   * Total Eurostat HICP vet services increase since base year (Dec 2016 = 100) to Nov 2025.
   * Index went from 100 → 133.26 = 33.26% total increase over ~9 years.
   */
  totalVetServicesInflationSince2016Pct: 33.26,

  /** HICP vet services record high index value (Nov 2025) */
  vetHicpRecordHigh: 133.26,

  /** Combined pet-related HICP YoY in 2025 (Euro Area) */
  combinedPetHicpYoY2025: 0.7,  // % — GlobalPETS / Eurostat

  /** General Eurozone CPI 2025 */
  generalEurozoneHicp2025: 1.9,  // %

  /** General EU CPI 2025 */
  generalEuHicp2025: 2.3,  // %

  /** Pet owning households in Europe (2023) */
  europeanPetHouseholdsMillions: 166,  // Statista / Euromonitor

  /**
   * Pet ownership rates — major Eurozone countries
   * Source: Euromonitor International / petlife-navi.jp
   */
  petOwnershipRates: {
    france: { dogPct: 29, catPct: 41, overallPct: 50 },
    germany: { dogPct: 21, catPct: 29, overallPct: 46 },
  },

  dataSourceNote: [
    "Eurostat HICP sub-category CP09322 'Veterinary and other services for pets' (base Dec 2016 = 100)",
    "Eurostat HICP sub-category CP09321 'Pets and pet products'",
    "GlobalPETS Inflation Snapshot articles (Jan 2026 & Mar 2026)",
    "NielsenIQ via GlobalPETS Forum Istanbul 2026",
    "Euromonitor International via GlobalPETS Forum Istanbul 2026",
    "Statistics Finland (Finland country data, 2025)",
    "INE Spain (Spain country data, 2025)",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in EUR).
 * Used as the "base year" for calculator inputs.
 * Values represent euro-area averages (significant variation between countries).
 */
export const eurPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 45,    // €/month
    cat: 25,    // €/month
  },
  annualVetCare: {
    dog: 450,   // €/year routine wellness
    cat: 280,   // €/year
  },
  annualPetInsurance: {
    dog: 280,   // €/year (varies widely; Germany/Netherlands higher than southern Europe)
    cat: 130,   // €/year
  },
  annualGrooming: {
    dog: 220,   // €/year
    cat: 40,    // €/year
  },
  annualSupplies: {
    dog: 160,   // €/year
    cat: 110,   // €/year
  },
}
