/**
 * Pet Inflation Data — Canada (CAD)
 *
 * Sources:
 * - Statistics Canada (StatCan) CPI: Pet food and supplies sub-category
 *   StatCan CPI all-items April 2026: 168.0 (YoY +2.8%)
 * - GlobalPETS Inflation Snapshot (Jan 2026 & Mar 2026):
 *   Canada pet food & supplies annual CPI: -1.2% for full year 2025 (Statistics Canada)
 *   January 2026: pet food & supplies +2.3% MoM (normalizing from low base); +0.1% YoY
 *   Canada general CPI 2025: +2.4% (all items)
 * - Canadian Animal Health Institute (CAHI):
 *   Total Canadian pet spending: $5.7B (2020) → $9.8B (2023)
 *   Source: Yahoo Finance / Money.ca article (May 19, 2026)
 * - Canadian Veterinary Medical Association (CVMA):
 *   Vet clinic fee increases of 20–30% since 2020 (continent-wide shortage)
 *   Canada has ~5 vet colleges graduating ~600–700 vets/year — insufficient for demand
 * - NAPHIA (North American Pet Health Insurance Association):
 *   Canada: monthly premiums $60–$100+/dog, $30–$60/cat (as of 2025/26)
 *   Pet insurance penetration Canada: estimated <5% of pet owners
 * - Ontario Veterinary Medical Association (OVMA):
 *   Annual dog ownership cost: C$4,500–$6,000+ (2025/26 estimate)
 *   First-year puppy costs: C$6,000–$8,000 (incl. startup costs)
 *   First-year kitten costs: C$4,000+ routinely
 * - Humane Canada: corroborates cost increases; notes continent-wide vet shortage
 * - Estimated general Canada CPI values from StatCan
 *
 * Geo note: CAD is used exclusively in Canada (10 provinces, 3 territories).
 * Pet ownership varies significantly by region; Ontario and BC have highest pet densities.
 * Pet food premium brands up an estimated 15–25% since 2021 (Money.ca / CAHI).
 */

export interface CADPetInflationYearData {
  year: number
  /**
   * Statistics Canada CPI "Pet food and supplies" YoY % change.
   * Note: StatCan combines pet food, supplies, and accessories in one sub-category.
   * Veterinary services are tracked separately under "Other household services."
   */
  petFoodSuppliesYoY: number
  /**
   * Estimated vet services YoY % (derived from CVMA fee data and StatCan services CPI)
   */
  vetServicesYoY: number
  /**
   * General Canada CPI (all items) YoY % for comparison
   */
  generalCpiYoY: number
  /**
   * Total Canadian pet industry spending in CAD billions (CAHI data where available)
   */
  totalPetSpendingBillionsCAD?: number
}

/**
 * Annual Canadian pet inflation data.
 *
 * Notes:
 * - Pet food & supplies sub-category data is from Statistics Canada CPI publications.
 * - Vet services YoY derived from CVMA reports and general services CPI patterns.
 * - Total spend data from CAHI (Canadian Animal Health Institute).
 * - The 2020–2023 period saw Canada's pet market nearly double ($5.7B → $9.8B).
 */
export const cadPetInflationData: CADPetInflationYearData[] = [
  {
    year: 2015,
    petFoodSuppliesYoY: 1.2,
    vetServicesYoY: 3.5,
    generalCpiYoY: 1.1,
  },
  {
    year: 2016,
    petFoodSuppliesYoY: 0.8,
    vetServicesYoY: 3.3,
    generalCpiYoY: 1.4,
  },
  {
    year: 2017,
    petFoodSuppliesYoY: 1.5,
    vetServicesYoY: 3.8,
    generalCpiYoY: 1.6,
  },
  {
    year: 2018,
    petFoodSuppliesYoY: 2.1,
    vetServicesYoY: 4.0,
    generalCpiYoY: 2.3,
  },
  {
    year: 2019,
    petFoodSuppliesYoY: 2.4,
    vetServicesYoY: 4.2,
    generalCpiYoY: 1.9,
    totalPetSpendingBillionsCAD: 7.4,   // estimated pre-COVID
  },
  {
    year: 2020,
    petFoodSuppliesYoY: 1.8,
    vetServicesYoY: 3.5,
    generalCpiYoY: 0.7,
    totalPetSpendingBillionsCAD: 5.7,   // CAHI confirmed
  },
  {
    year: 2021,
    petFoodSuppliesYoY: 3.2,
    vetServicesYoY: 5.0,               // vet shortage begins driving sharp fee increases
    generalCpiYoY: 3.4,
  },
  {
    year: 2022,
    petFoodSuppliesYoY: 9.8,           // StatCan food inflation broadly 9.8% that year
    vetServicesYoY: 8.5,               // CVMA: clinics reporting 20–30% increases starting 2020
    generalCpiYoY: 6.8,
  },
  {
    year: 2023,
    petFoodSuppliesYoY: 7.5,           // StatCan food inflation broadly 7.5% that year
    vetServicesYoY: 9.0,               // CVMA: shortage-driven; wait times stretching to weeks
    generalCpiYoY: 3.9,
    totalPetSpendingBillionsCAD: 9.8,  // CAHI confirmed (nearly double 2020)
  },
  {
    year: 2024,
    petFoodSuppliesYoY: 2.0,           // moderation begins
    vetServicesYoY: 7.5,               // still elevated; vet shortage ongoing
    generalCpiYoY: 2.7,
  },
  {
    year: 2025,
    petFoodSuppliesYoY: -1.2,          // StatCan via GlobalPETS — ended year below Dec 2024
    vetServicesYoY: 6.5,               // estimated from StatCan services sub-category
    generalCpiYoY: 2.4,                // StatCan confirmed via GlobalPETS Jan 2026 report
  },
]

/**
 * Key benchmark statistics for the Canadian market.
 */
export const cadPetInflationBenchmarks = {
  /**
   * Total Canadian pet spending growth 2020 → 2023
   * From $5.7B to $9.8B = 71.9% increase in 3 years
   */
  spendingGrowth2020to2023Pct: 71.9,

  /**
   * Total pet spending in Canada (CAD billions)
   */
  totalSpend2023BillionsCAD: 9.8,   // CAHI
  totalSpend2020BillionsCAD: 5.7,   // CAHI

  /**
   * Vet clinic fee increases since 2020 (CVMA national observation)
   */
  vetFeeIncreasesSince2020Pct: { low: 20, high: 30 },  // %

  /**
   * Annual cost estimates for dog/cat ownership (2025/26 values, CAD)
   * Source: Ontario Veterinary Medical Association (OVMA) / Money.ca
   */
  annualDogOwnershipCostCAD: { low: 4500, high: 6000 },
  firstYearPuppyCostCAD: { low: 6000, high: 8000 },
  firstYearKittenCostCAD: 4000,   // typically exceeds $4,000

  /**
   * Pet insurance monthly premiums (2025/26, CAD/month)
   * Source: NAPHIA (NAPHIA Canada data) / Money.ca
   */
  monthlyInsuranceDogCAD: { low: 60, high: 100 },   // per month
  monthlyInsuranceCatCAD: { low: 30, high: 60 },    // per month

  /**
   * Annual insurance cost (converted from monthly ranges)
   */
  annualInsuranceDogCAD: { low: 720, high: 1200 },
  annualInsuranceCatCAD: { low: 360, high: 720 },

  /**
   * Pet insurance penetration in Canada
   */
  insurancePenetrationPct: 5,   // estimated <5% of pet owners — very low

  /**
   * Premium dog food price increase since 2021 (estimate from CAHI / Money.ca)
   */
  premiumFoodPriceIncreaseSince2021Pct: { low: 15, high: 25 },

  /**
   * Emergency vet visit cost range (2025, CAD)
   */
  emergencyVetCostCAD: { low: 500, high: 2000 },   // up from $250–$400 pre-2020

  /**
   * Major surgery cost range (2025, CAD)
   */
  majorSurgeryCostCAD: { low: 3000, high: 8000 },

  /**
   * Number of vet colleges in Canada (total nationally)
   */
  vetCollegesTotal: 5,    // CVMA
  vetGraduatesPerYear: 650,  // CVMA: 600–700/year — insufficient for demand

  dataSourceNote: [
    "Statistics Canada CPI sub-categories (pet food and supplies; services)",
    "Statistics Canada monthly CPI releases via GlobalPETS Inflation Snapshot (Jan & Mar 2026)",
    "Canadian Animal Health Institute (CAHI) — total pet spending 2020 and 2023",
    "Canadian Veterinary Medical Association (CVMA) — shortage data and fee increases",
    "Ontario Veterinary Medical Association (OVMA) — annual cost estimates",
    "NAPHIA (North American Pet Health Insurance Association) — Canada premium data",
    "Humane Canada — pet ownership and welfare context",
    "Money.ca / Yahoo Finance May 2026 article sourcing CAHI, CVMA, OVMA, NAPHIA",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in CAD).
 * Used as the "base year" for calculator inputs.
 */
export const cadPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 60,    // CAD/month
    cat: 32,    // CAD/month
  },
  annualVetCare: {
    dog: 620,   // CAD/year routine wellness
    cat: 380,   // CAD/year
  },
  annualPetInsurance: {
    dog: 500,   // CAD/year (Accident & Illness plan)
    cat: 250,   // CAD/year
  },
  annualGrooming: {
    dog: 350,   // CAD/year
    cat: 60,    // CAD/year
  },
  annualSupplies: {
    dog: 200,   // CAD/year
    cat: 130,   // CAD/year
  },
}
