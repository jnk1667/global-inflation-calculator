/**
 * Pet Inflation Data — Australia (AUD)
 *
 * Sources:
 * - Australian Bureau of Statistics (ABS): Consumer Price Index, Australia
 *   ABS does not publish a dedicated "pet food" or "veterinary services" CPI sub-category
 *   in its headline CPI tables. Pet-related costs fall under broad categories:
 *   - "Food and non-alcoholic beverages" (pet food embedded in groceries)
 *   - "Health" (human, not vet)
 *   - "Recreation and culture" (pets/pets accessories appear here)
 *   ABS CPI Dec 2025: all-items +3.8% YoY. Jun 2025: +2.1% YoY (ABS.gov.au).
 * - Canada Agriculture / Agriculture and Agri-Food Canada sector analysis:
 *   Australia pet food retail sales grew 5.7% annually (CAGR) 2020–2024
 *   Australia pet food imports increased 10.1% annually 2020–2024
 * - Australian pet food market valued at USD $2.8B in 2024 (Ken Research)
 * - ABS notes housing, food, and recreation as largest CPI contributors in 2025
 * - Pet insurance: Australia has one of the highest pet insurance penetration rates
 *   globally — estimated 25–30% of dog owners (vs. <5% in Canada/USA)
 * - Pet industry total AUD spending: estimated AUD $15–17B in 2024
 *   (Australian Pet Retailers Association / Animal Medicines Australia)
 * - Animal Medicines Australia "Pet Ownership in Australia" biennial report (2022):
 *   69% of Australian households own a pet — one of the highest rates in the world
 *   Dogs: 39% of households; Cats: 29% of households
 * - Petlife-navi.jp international comparison: Australia overall pet ownership 69%
 *   (second globally after US 71%)
 * - Vet cost annual inflation estimated from ABS general services CPI + industry data.
 *
 * Data limitation note:
 * Australia does not publish granular pet-specific CPI sub-indices publicly. The annual
 * YoY values below are best estimates derived from ABS broad categories, industry reports,
 * and the global context from GlobalPETS Forum analysis. They should be treated as
 * informed estimates, not direct ABS-published sub-indices.
 */

export interface AUDPetInflationYearData {
  year: number
  /**
   * Estimated pet food YoY % inflation (derived from ABS food CPI + industry data)
   */
  petFoodYoY: number
  /**
   * Estimated vet services YoY % (derived from ABS services CPI + industry sources)
   */
  vetServicesYoY: number
  /**
   * General ABS CPI all-items YoY % for comparison
   */
  generalCpiYoY: number
  /**
   * Estimated pet food retail market annual growth % (CAGR approx, industry source)
   */
  petFoodMarketGrowthPct?: number
}

/**
 * Annual Australian pet inflation data.
 *
 * Note: Values marked with "(est)" are informed estimates based on ABS broad
 * category data and international benchmarks, not standalone ABS sub-series.
 */
export const audPetInflationData: AUDPetInflationYearData[] = [
  {
    year: 2015,
    petFoodYoY: 1.5,    // est
    vetServicesYoY: 3.8,  // est — vets consistently above general CPI in Australia
    generalCpiYoY: 1.5,
  },
  {
    year: 2016,
    petFoodYoY: 1.2,
    vetServicesYoY: 3.5,
    generalCpiYoY: 1.3,
  },
  {
    year: 2017,
    petFoodYoY: 2.0,
    vetServicesYoY: 4.0,
    generalCpiYoY: 1.9,
  },
  {
    year: 2018,
    petFoodYoY: 2.5,
    vetServicesYoY: 4.2,
    generalCpiYoY: 1.9,
  },
  {
    year: 2019,
    petFoodYoY: 2.8,
    vetServicesYoY: 4.5,
    generalCpiYoY: 1.6,
  },
  {
    year: 2020,
    petFoodYoY: 2.2,
    vetServicesYoY: 3.8,
    generalCpiYoY: 0.9,
    petFoodMarketGrowthPct: 5.7,  // CAGR 2020–2024 start
  },
  {
    year: 2021,
    petFoodYoY: 3.5,
    vetServicesYoY: 4.5,
    generalCpiYoY: 2.8,
    petFoodMarketGrowthPct: 5.7,
  },
  {
    year: 2022,
    petFoodYoY: 8.2,    // global supply chain + commodity shock
    vetServicesYoY: 6.5,
    generalCpiYoY: 6.1,
    petFoodMarketGrowthPct: 5.7,
  },
  {
    year: 2023,
    petFoodYoY: 7.5,
    vetServicesYoY: 6.8,
    generalCpiYoY: 5.4,
    petFoodMarketGrowthPct: 5.7,
  },
  {
    year: 2024,
    petFoodYoY: 4.2,    // moderating
    vetServicesYoY: 5.5,
    generalCpiYoY: 3.8,  // ABS Dec 2024 annual
    petFoodMarketGrowthPct: 5.7,  // CAGR 2020–2024 end
  },
  {
    year: 2025,
    petFoodYoY: 3.0,    // est — aligns with global moderation trend
    vetServicesYoY: 5.0,
    generalCpiYoY: 3.8,  // ABS Dec 2025 annual: +3.8% (latest published)
  },
]

/**
 * Key benchmark statistics for the Australian market.
 */
export const audPetInflationBenchmarks = {
  /**
   * Household pet ownership rate — among highest globally
   * Source: Animal Medicines Australia / petlife-navi international comparison
   */
  overallPetOwnershipRatePct: 69,   // % of households — 2nd highest globally after US (71%)
  dogOwnershipRatePct: 39,          // % of Australian households
  catOwnershipRatePct: 29,          // % of Australian households

  /**
   * Pet food retail market CAGR 2020–2024
   * Source: Agriculture & Agri-Food Canada sector analysis on Australia
   */
  petFoodRetailCAGR2020to2024: 5.7,  // %

  /**
   * Pet food import annual growth rate 2020–2024
   */
  petFoodImportGrowth2020to2024: 10.1,  // %

  /**
   * Australian pet food market total value 2024
   */
  petFoodMarketValue2024USD: 2.8,  // USD billions (Ken Research)

  /**
   * Pet insurance penetration — significantly higher than other English-speaking markets
   */
  petInsurancePenetrationDogsPct: 28,  // estimated ~25–30%

  /**
   * Pet food ingredient market value 2026 and projected growth
   * Source: IndexBox
   */
  petFoodIngredientMarket2026AUDRange: { low: 1.2, high: 1.5 },  // AUD billions
  petFoodIngredientMarketCAGR2026to2035: { low: 5.5, high: 6.5 },  // %

  dataSourceNote: [
    "Australian Bureau of Statistics (ABS) CPI — Dec 2025 and Jun 2025 releases",
    "Animal Medicines Australia 'Pet Ownership in Australia' report 2022",
    "Agriculture & Agri-Food Canada sector trend analysis: pet food trends in Australia",
    "Ken Research: Australia Pet Food Market 2024",
    "IndexBox: Australia Pet Food Ingredients Market Analysis 2026",
    "Euromonitor International / petlife-navi international pet ownership comparison",
    "GlobalPETS Inflation Snapshot Jan 2026 (no Australia-specific sub-data available)",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in AUD).
 */
export const audPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 70,    // AUD/month
    cat: 38,    // AUD/month
  },
  annualVetCare: {
    dog: 700,   // AUD/year routine wellness
    cat: 420,   // AUD/year
  },
  annualPetInsurance: {
    dog: 700,   // AUD/year (penetration higher than other markets; more competitive pricing)
    cat: 320,   // AUD/year
  },
  annualGrooming: {
    dog: 350,   // AUD/year
    cat: 50,    // AUD/year
  },
  annualSupplies: {
    dog: 220,   // AUD/year
    cat: 140,   // AUD/year
  },
}
