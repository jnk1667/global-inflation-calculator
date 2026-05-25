/**
 * Pet Inflation Data — Master Index
 *
 * This index aggregates all 8 currency/country datasets into a unified structure
 * for use in the Global Pet Inflation Calculator.
 *
 * Supported currencies and their primary countries:
 *   USD — United States
 *   GBP — United Kingdom
 *   EUR — Eurozone (Germany, France, Italy, Spain, Netherlands, etc.)
 *   CAD — Canada
 *   AUD — Australia
 *   NZD — New Zealand
 *   CHF — Switzerland (+ Liechtenstein)
 *   JPY — Japan
 *
 * Data coverage: 2015–2025 (annual)
 * Base year for calculator inputs: 2019 (pre-pandemic baseline)
 *
 * ---
 * DATA QUALITY TIERS
 * ---
 * Tier 1 — Official government sub-index data (most reliable):
 *   USD: BLS CPI series CUUR0000SS61031 (pet food) + CUSR0000SS62054 (vet services)
 *   GBP: ONS RPI Series CZDI "Pet care" (combined)
 *   EUR: Eurostat HICP CP09321 (pets/products) + CP09322 (vet services)
 *   NZD: Stats NZ quarterly sub-series (pets/products + vet services — separate)
 *   CAD: Statistics Canada CPI pet food & supplies sub-category
 *
 * Tier 2 — Derived from broad government CPI categories + industry data:
 *   AUD: ABS broad food/recreation CPI + Australian Pet Retailers Association data
 *   CHF: Swiss FSO general CPI + services premium estimate + Eurozone proxy
 *   JPY: Japan Statistics Bureau CPI + Anicom + Yano Research + Pet Food Association
 *
 * ---
 * CALENDAR COVERAGE NOTES
 * ---
 * - All annual YoY values are calendar-year averages unless noted as Q4-to-Q4 (NZD).
 * - 2025 values represent available data as of May 2026 (typically full-year confirmed
 *   for most countries by Q1 2026 statistical releases).
 * - 2026 data is not included; only select Jan/Mar 2026 point data appears in benchmarks.
 */

// ─── Individual country/currency exports ─────────────────────────────────────

export {
  usdPetInflationData,
  usdPetInflationBenchmarks,
  usdPetCostBaselines2019,
  usdPetFoodCpiAnnualAverages,
  usdVetCpiAnnualAverages,
  type PetInflationYearData,
} from "./usd"

export {
  gbpPetInflationData,
  gbpPetInflationBenchmarks,
  gbpPetCostBaselines2019,
  gbpPetInflationQuarterly,
  type GBPPetInflationYearData,
} from "./gbp"

export {
  eurPetInflationData,
  eurPetInflationBenchmarks,
  eurPetCostBaselines2019,
  eurCountryBreakdown2025,
  type EURPetInflationYearData,
} from "./eur"

export {
  cadPetInflationData,
  cadPetInflationBenchmarks,
  cadPetCostBaselines2019,
  type CADPetInflationYearData,
} from "./cad"

export {
  audPetInflationData,
  audPetInflationBenchmarks,
  audPetCostBaselines2019,
  type AUDPetInflationYearData,
} from "./aud"

export {
  nzdPetInflationData,
  nzdPetInflationBenchmarks,
  nzdPetCostBaselines2019,
  type NZDPetInflationYearData,
} from "./nzd"

export {
  chfPetInflationData,
  chfPetInflationBenchmarks,
  chfPetCostBaselines2019,
  type CHFPetInflationYearData,
} from "./chf"

export {
  jpyPetInflationData,
  jpyPetInflationBenchmarks,
  jpyPetCostBaselines2019,
  type JPYPetInflationYearData,
} from "./jpy"

// ─── Shared types ─────────────────────────────────────────────────────────────

export type SupportedCurrency = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "NZD" | "CHF" | "JPY"

export type PetType = "dog" | "cat"

export interface PetCostCategory {
  monthlyPetFood: { dog: number; cat: number }
  annualVetCare: { dog: number; cat: number }
  annualPetInsurance: { dog: number; cat: number }
  annualGrooming: { dog: number; cat: number }
  annualSupplies: { dog: number; cat: number }
}

// ─── Unified baselines lookup ─────────────────────────────────────────────────

import { usdPetCostBaselines2019 } from "./usd"
import { gbpPetCostBaselines2019 } from "./gbp"
import { eurPetCostBaselines2019 } from "./eur"
import { cadPetCostBaselines2019 } from "./cad"
import { audPetCostBaselines2019 } from "./aud"
import { nzdPetCostBaselines2019 } from "./nzd"
import { chfPetCostBaselines2019 } from "./chf"
import { jpyPetCostBaselines2019 } from "./jpy"

/**
 * 2019 cost baselines indexed by currency.
 * Use this to populate calculator default inputs.
 */
export const petCostBaselines2019: Record<SupportedCurrency, PetCostCategory> = {
  USD: usdPetCostBaselines2019,
  GBP: gbpPetCostBaselines2019,
  EUR: eurPetCostBaselines2019,
  CAD: cadPetCostBaselines2019,
  AUD: audPetCostBaselines2019,
  NZD: nzdPetCostBaselines2019,
  CHF: chfPetCostBaselines2019,
  JPY: jpyPetCostBaselines2019,
}

// ─── Unified annual inflation lookup ─────────────────────────────────────────

import { usdPetInflationData } from "./usd"
import { gbpPetInflationData } from "./gbp"
import { eurPetInflationData } from "./eur"
import { cadPetInflationData } from "./cad"
import { audPetInflationData } from "./aud"
import { nzdPetInflationData } from "./nzd"
import { chfPetInflationData } from "./chf"
import { jpyPetInflationData } from "./jpy"

/**
 * Normalised annual inflation data per currency.
 *
 * Each entry exposes three consistent fields for use in calculators/charts:
 *   year          — calendar year
 *   petFoodYoY    — best available pet food / food+products YoY %
 *   vetYoY        — best available vet services YoY %
 *   generalCpiYoY — official general CPI YoY % (for comparison)
 *
 * Field mapping by currency:
 *   USD: petFoodYoY = BLS pet food CPI YoY;  vetYoY = BLS vet services CPI YoY
 *   GBP: petFoodYoY = ONS RPI pet care YoY (combined proxy); vetYoY = vet sub-index where available
 *   EUR: petFoodYoY = Eurostat pet products YoY;  vetYoY = Eurostat vet services YoY
 *   CAD: petFoodYoY = StatCan pet food+supplies YoY;  vetYoY = derived vet services YoY
 *   AUD: petFoodYoY = estimated pet food YoY;  vetYoY = estimated vet services YoY
 *   NZD: petFoodYoY = Stats NZ pet products YoY;  vetYoY = Stats NZ vet services YoY
 *   CHF: petFoodYoY = estimated pet food YoY;  vetYoY = estimated vet services YoY
 *   JPY: petFoodYoY = estimated pet food YoY;  vetYoY = estimated vet services YoY
 */
export interface NormalisedPetInflationEntry {
  year: number
  petFoodYoY: number
  vetYoY: number
  generalCpiYoY: number
}

export const normalisedPetInflation: Record<SupportedCurrency, NormalisedPetInflationEntry[]> = {
  USD: usdPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petFoodYoY,
    vetYoY: d.vetYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
  GBP: gbpPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petProductsYoY ?? d.petCareRpiYoY,
    vetYoY: d.vetServicesYoY ?? d.petCareRpiYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
  EUR: eurPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petProductsYoY,
    vetYoY: d.vetServicesYoY,
    generalCpiYoY: d.generalHicpYoY,
  })),
  CAD: cadPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petFoodSuppliesYoY,
    vetYoY: d.vetServicesYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
  AUD: audPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petFoodYoY,
    vetYoY: d.vetServicesYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
  NZD: nzdPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petProductsYoY,
    vetYoY: d.vetServicesYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
  CHF: chfPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petFoodYoY,
    vetYoY: d.vetServicesYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
  JPY: jpyPetInflationData.map((d) => ({
    year: d.year,
    petFoodYoY: d.petFoodYoY,
    vetYoY: d.vetServicesYoY,
    generalCpiYoY: d.generalCpiYoY,
  })),
}

// ─── Unified benchmarks lookup ─────────────────────────────────────────────────

import { usdPetInflationBenchmarks } from "./usd"
import { gbpPetInflationBenchmarks } from "./gbp"
import { eurPetInflationBenchmarks } from "./eur"
import { cadPetInflationBenchmarks } from "./cad"
import { audPetInflationBenchmarks } from "./aud"
import { nzdPetInflationBenchmarks } from "./nzd"
import { chfPetInflationBenchmarks } from "./chf"
import { jpyPetInflationBenchmarks } from "./jpy"

/**
 * Benchmarks indexed by currency — convenient for calculator context panels.
 */
export const petInflationBenchmarks = {
  USD: usdPetInflationBenchmarks,
  GBP: gbpPetInflationBenchmarks,
  EUR: eurPetInflationBenchmarks,
  CAD: cadPetInflationBenchmarks,
  AUD: audPetInflationBenchmarks,
  NZD: nzdPetInflationBenchmarks,
  CHF: chfPetInflationBenchmarks,
  JPY: jpyPetInflationBenchmarks,
}

// ─── Country metadata ─────────────────────────────────────────────────────────

export interface CountryMeta {
  currency: SupportedCurrency
  currencySymbol: string
  primaryCountry: string
  /** Countries covered by this currency (for display) */
  coveredCountries: string[]
  /** Data quality tier (see notes at top of file) */
  dataTier: 1 | 2
  /** Primary statistical agency used */
  primarySource: string
  /** Whether pet-specific CPI sub-indices are officially published */
  hasOfficialPetCpi: boolean
  /** Pet ownership rate in primary country (% of households) */
  petOwnershipRatePct: number
}

export const currencyMeta: Record<SupportedCurrency, CountryMeta> = {
  USD: {
    currency: "USD",
    currencySymbol: "$",
    primaryCountry: "United States",
    coveredCountries: ["United States"],
    dataTier: 1,
    primarySource: "Bureau of Labor Statistics (BLS)",
    hasOfficialPetCpi: true,
    petOwnershipRatePct: 66,
  },
  GBP: {
    currency: "GBP",
    currencySymbol: "£",
    primaryCountry: "United Kingdom",
    coveredCountries: ["United Kingdom"],
    dataTier: 1,
    primarySource: "Office for National Statistics (ONS)",
    hasOfficialPetCpi: true,       // ONS RPI "Pet care" series CZDI
    petOwnershipRatePct: 52,
  },
  EUR: {
    currency: "EUR",
    currencySymbol: "€",
    primaryCountry: "Eurozone",
    coveredCountries: [
      "Germany", "France", "Italy", "Spain", "Netherlands",
      "Belgium", "Austria", "Portugal", "Finland", "Ireland",
      "and 10 other EU member states",
    ],
    dataTier: 1,
    primarySource: "Eurostat HICP",
    hasOfficialPetCpi: true,       // Eurostat CP09321 + CP09322
    petOwnershipRatePct: 46,       // avg across major Eurozone countries
  },
  CAD: {
    currency: "CAD",
    currencySymbol: "C$",
    primaryCountry: "Canada",
    coveredCountries: ["Canada"],
    dataTier: 1,
    primarySource: "Statistics Canada",
    hasOfficialPetCpi: true,       // StatCan pet food & supplies sub-category
    petOwnershipRatePct: 58,
  },
  AUD: {
    currency: "AUD",
    currencySymbol: "A$",
    primaryCountry: "Australia",
    coveredCountries: ["Australia"],
    dataTier: 2,
    primarySource: "Australian Bureau of Statistics (ABS)",
    hasOfficialPetCpi: false,      // ABS does not publish standalone pet CPI
    petOwnershipRatePct: 69,
  },
  NZD: {
    currency: "NZD",
    currencySymbol: "NZ$",
    primaryCountry: "New Zealand",
    coveredCountries: ["New Zealand"],
    dataTier: 1,
    primarySource: "Stats NZ",
    hasOfficialPetCpi: true,       // Stats NZ quarterly sub-series (pets + vet — separate)
    petOwnershipRatePct: 64,
  },
  CHF: {
    currency: "CHF",
    currencySymbol: "CHF",
    primaryCountry: "Switzerland",
    coveredCountries: ["Switzerland", "Liechtenstein"],
    dataTier: 2,
    primarySource: "Swiss Federal Statistical Office (FSO/BFS)",
    hasOfficialPetCpi: false,      // FSO does not publish standalone pet CPI publicly
    petOwnershipRatePct: 42,       // estimated
  },
  JPY: {
    currency: "JPY",
    currencySymbol: "¥",
    primaryCountry: "Japan",
    coveredCountries: ["Japan"],
    dataTier: 2,
    primarySource: "Japan Statistics Bureau + Anicom + Yano Research",
    hasOfficialPetCpi: false,      // Japan Statistics Bureau CPI used as context; no standalone pet series
    petOwnershipRatePct: 17,       // low due to apartment restrictions + cultural factors
  },
}

// ─── Helper utilities ─────────────────────────────────────────────────────────

/**
 * Calculate the cumulative inflation multiplier between two years for a given
 * currency and inflation category.
 *
 * @param currency  — e.g. "USD"
 * @param category  — "petFood" | "vet" | "general"
 * @param fromYear  — start year (inclusive)
 * @param toYear    — end year (inclusive)
 * @returns multiplier, e.g. 1.33 = 33% cumulative increase
 */
export function calcCumulativeInflation(
  currency: SupportedCurrency,
  category: "petFood" | "vet" | "general",
  fromYear: number,
  toYear: number
): number {
  const data = normalisedPetInflation[currency]
  const inRange = data.filter((d) => d.year > fromYear && d.year <= toYear)

  let multiplier = 1
  for (const entry of inRange) {
    const rate =
      category === "petFood"
        ? entry.petFoodYoY
        : category === "vet"
        ? entry.vetYoY
        : entry.generalCpiYoY
    multiplier *= 1 + rate / 100
  }
  return multiplier
}

/**
 * Project a cost forward from a base year to a target year using the
 * cumulative pet inflation rate for a given category and currency.
 *
 * @param baseCost   — cost in base year (in local currency)
 * @param currency   — e.g. "USD"
 * @param category   — "petFood" | "vet" | "general"
 * @param fromYear   — base year for the cost
 * @param toYear     — target year to project to
 * @returns projected cost in local currency (rounded to 2 decimal places)
 */
export function projectCost(
  baseCost: number,
  currency: SupportedCurrency,
  category: "petFood" | "vet" | "general",
  fromYear: number,
  toYear: number
): number {
  const multiplier = calcCumulativeInflation(currency, category, fromYear, toYear)
  return Math.round(baseCost * multiplier * 100) / 100
}

/**
 * Get a summary of how much a specific pet cost has inflated
 * from a base year to the most recent year (2025) for all currencies.
 * Useful for comparison tables across countries.
 */
export function getGlobalInflationComparison(
  category: "petFood" | "vet" | "general",
  fromYear: number = 2019,
  toYear: number = 2025
): Array<{ currency: SupportedCurrency; country: string; cumulativePct: number }> {
  return (Object.keys(normalisedPetInflation) as SupportedCurrency[]).map((currency) => {
    const multiplier = calcCumulativeInflation(currency, category, fromYear, toYear)
    return {
      currency,
      country: currencyMeta[currency].primaryCountry,
      cumulativePct: Math.round((multiplier - 1) * 1000) / 10,
    }
  })
}
