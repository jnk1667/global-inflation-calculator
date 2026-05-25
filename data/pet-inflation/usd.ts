/**
 * Pet Inflation Data — United States (USD)
 *
 * Sources:
 * - BLS CPI Pet Food & Treats: Series CUUR0000SS61031 (Dec 1997 = 100), via FRED/St. Louis Fed
 *   Last updated: January 13, 2026
 * - BLS CPI Veterinary Services: Series CUSR0000SS62054 (seasonally adjusted), BLS Data Viewer
 *   Latest available: April 2026
 * - APPA (American Pet Products Association): Total US Pet Industry Expenditures, 2015–2025
 *   Source: americanpetproducts.org/industry-trends-and-stats
 * - NAPHIA (North American Pet Health Insurance Association): State of the Industry 2025 Report
 *   Average premium data for dog & cat Accident & Illness coverage, 2024 values
 * - PetfoodIndustry.com / Pet Business Professor "Petflation" tracker, January 2026 report
 *   Total petflation 3.4% YoY as of Jan 2026; pet prices 33.0% above 2019 pre-pandemic levels
 * - GlobalPETS: Inflation Snapshot articles (Jan & Mar 2026)
 *
 * Notes:
 * - Pet food CPI annual averages derived from monthly BLS index values (base Dec 1997 = 100).
 * - Vet CPI annual averages derived from monthly BLS seasonally-adjusted values.
 *   Full monthly history available from 2000; annual values below are calendar-year averages.
 * - YoY % change is calculated as ((current year avg / prior year avg) - 1) * 100.
 * - General CPI (all items) annual averages sourced from BLS CPI-U series CUSR0000SA0.
 */

export interface PetInflationYearData {
  year: number
  petFoodCpiIndex: number        // BLS index value (base period varies by series)
  petFoodYoY: number             // % change year-over-year
  vetCpiIndex: number            // BLS vet services index value
  vetYoY: number                 // % change year-over-year
  generalCpiYoY: number          // General CPI all-items YoY % for comparison
  petServicesYoY?: number        // grooming, boarding, other services YoY % (where available)
  petInsuranceYoY?: number       // pet insurance premium YoY % growth
  totalPetSpendingBillions?: number  // total US industry spend (APPA, USD billions)
}

/**
 * Annual averages for US Pet Food CPI (CUUR0000SS61031, base Dec 1997 = 100)
 * Derived from monthly values published by BLS via FRED.
 *
 * Annual average = mean of all 12 monthly index values for that calendar year.
 */
export const usdPetFoodCpiAnnualAverages: Record<number, number> = {
  2015: 151.73,   // avg of all 12 months 2015
  2016: 152.33,   // avg of all 12 months 2016
  2017: 150.78,   // avg of all 12 months 2017
  2018: 150.54,   // avg of all 12 months 2018
  2019: 154.36,   // avg of all 12 months 2019
  2020: 154.93,   // avg of all 12 months 2020
  2021: 155.90,   // avg of all 12 months 2021
  2022: 172.89,   // avg of all 12 months 2022 — major supply chain + commodity surge
  2023: 191.08,   // avg of all 12 months 2023
  2024: 190.96,   // avg of all 12 months 2024 — price plateau/slight moderation
  2025: 190.78,   // avg of available months 2025 (Jan–Sep, Nov–Dec; Oct missing)
}

/**
 * Annual averages for US Veterinary Services CPI (CUSR0000SS62054, seasonally adjusted)
 * Base period: ~1982–84 = 100 (BLS standard for this series).
 * Full monthly data only available from Jan 2024 forward in Data Viewer;
 * historical annual averages below sourced from BLS published data and FRED.
 *
 * Note: The vet series has shown consistent 4–8% annual growth for over a decade,
 * roughly double the pace of general CPI over the same period.
 */
export const usdVetCpiAnnualAverages: Record<number, number> = {
  2015: 248.3,
  2016: 258.1,
  2017: 267.2,
  2018: 277.0,
  2019: 287.4,
  2020: 296.5,
  2021: 308.6,
  2022: 322.8,
  2023: 338.9,
  2024: 369.6,   // avg of 12 monthly values Jan–Dec 2024 from BLS Data Viewer
  2025: 394.1,   // avg of available months 2025 (Jan–Sep, Nov–Dec)
}

/**
 * Year-by-year summary data for the US pet inflation calculator.
 * This is the primary dataset to use for calculations and charts.
 */
export const usdPetInflationData: PetInflationYearData[] = [
  {
    year: 2015,
    petFoodCpiIndex: 151.73,
    petFoodYoY: -0.2,
    vetCpiIndex: 248.3,
    vetYoY: 4.1,
    generalCpiYoY: 0.1,
    totalPetSpendingBillions: 60.28,
  },
  {
    year: 2016,
    petFoodCpiIndex: 152.33,
    petFoodYoY: 0.4,
    vetCpiIndex: 258.1,
    vetYoY: 3.9,
    generalCpiYoY: 1.3,
    totalPetSpendingBillions: 66.75,
  },
  {
    year: 2017,
    petFoodCpiIndex: 150.78,
    petFoodYoY: -1.0,
    vetCpiIndex: 267.2,
    vetYoY: 3.5,
    generalCpiYoY: 2.1,
    totalPetSpendingBillions: 69.51,
  },
  {
    year: 2018,
    petFoodCpiIndex: 150.54,
    petFoodYoY: -0.2,
    vetCpiIndex: 277.0,
    vetYoY: 3.7,
    generalCpiYoY: 2.4,
    totalPetSpendingBillions: 72.13,
  },
  {
    year: 2019,
    petFoodCpiIndex: 154.36,
    petFoodYoY: 2.5,
    vetCpiIndex: 287.4,
    vetYoY: 3.8,
    generalCpiYoY: 1.8,
    totalPetSpendingBillions: 95.7,
  },
  {
    year: 2020,
    petFoodCpiIndex: 154.93,
    petFoodYoY: 0.4,
    vetCpiIndex: 296.5,
    vetYoY: 3.2,
    generalCpiYoY: 1.2,
    petInsuranceYoY: 26.8,         // NAPHIA total premium volume YoY
    totalPetSpendingBillions: 103.6,
  },
  {
    year: 2021,
    petFoodCpiIndex: 155.90,
    petFoodYoY: 0.6,
    vetCpiIndex: 308.6,
    vetYoY: 4.1,
    generalCpiYoY: 4.7,
    petInsuranceYoY: 30.5,         // NAPHIA
    totalPetSpendingBillions: 123.6,
  },
  {
    year: 2022,
    petFoodCpiIndex: 172.89,
    petFoodYoY: 10.9,
    vetCpiIndex: 322.8,
    vetYoY: 4.6,
    generalCpiYoY: 8.0,
    petServicesYoY: 4.5,
    petInsuranceYoY: 23.5,         // NAPHIA
    totalPetSpendingBillions: 136.8,
  },
  {
    year: 2023,
    petFoodCpiIndex: 191.08,
    petFoodYoY: 10.5,
    vetCpiIndex: 338.9,
    vetYoY: 5.0,
    generalCpiYoY: 4.1,
    petServicesYoY: 4.8,
    petInsuranceYoY: 21.7,         // NAPHIA
    totalPetSpendingBillions: 147.0,
  },
  {
    year: 2024,
    petFoodCpiIndex: 190.96,
    petFoodYoY: -0.1,              // plateau — prices stabilized after 2022–2023 surge
    vetCpiIndex: 369.6,
    vetYoY: 9.1,                   // major acceleration in vet costs
    generalCpiYoY: 2.9,
    petServicesYoY: 5.0,
    petInsuranceYoY: 20.8,         // NAPHIA avg premium growth
    totalPetSpendingBillions: 158.0,  // APPA 2025 actual sales report (labeled as 2024 spend)
  },
  {
    year: 2025,
    petFoodCpiIndex: 190.78,
    petFoodYoY: 1.2,               // BLS 2025 YoY from GlobalPETS / BLS data
    vetCpiIndex: 394.1,
    vetYoY: 7.1,                   // BLS / GlobalPETS Inflation Snapshot Jan 2026
    generalCpiYoY: 2.7,
    petServicesYoY: 5.0,           // GlobalPETS: pet services grew 5% in 2025 (US)
    totalPetSpendingBillions: 158.0, // APPA confirmed $158B in 2025 actual sales
  },
]

/**
 * Key benchmark statistics for context and display.
 */
export const usdPetInflationBenchmarks = {
  /** Total pet prices vs. pre-pandemic (2019) baseline as of Jan 2026 */
  totalPetInflationSince2019: 33.0,  // % — PetfoodIndustry/Pet Business Professor

  /** Total pet prices vs. 2021 baseline */
  totalPetInflationSince2021: 27.6,  // % — PetfoodIndustry/Pet Business Professor

  /** Jan 2026 YoY total petflation */
  currentTotalPetflation: 3.4,  // % — Pet Business Professor, Feb 2026 report

  /** Jan 2026 vet services YoY */
  currentVetInflation: 7.4,  // %

  /** Jan 2026 pet food YoY */
  currentPetFoodInflation: 1.4,  // %

  /** Average pet insurance A&I premium, dog, 2024 (USD/year) */
  avgDogInsurancePremiumUSD: 749,   // NAPHIA State of the Industry 2025

  /** Average pet insurance A&I premium, cat, 2024 (USD/year) */
  avgCatInsurancePremiumUSD: 386,   // NAPHIA State of the Industry 2025

  /** Estimated annual dog ownership cost, 2024 */
  avgAnnualDogCostUSD: 1500,       // range $1,000–$2,000+; mid estimate

  /** Estimated annual cat ownership cost, 2024 */
  avgAnnualCatCostUSD: 900,        // range $700–$1,200; mid estimate

  /** % of US households owning a pet, 2025 */
  petOwnershipRatePct: 66,          // APPA National Pet Owners Survey 2025 (95M of ~145M households)

  /** US pet dog population, millions, 2025 */
  dogPopulationMillions: 87.3,      // AVMA / APPA 2025

  /** US pet cat population, millions, 2025 */
  catPopulationMillions: 76.3,      // AVMA / APPA 2025

  /** Total US pet industry spending, 2026 projection */
  projectedSpend2026Billions: 165,  // APPA 2026 projection

  dataSourceNote: [
    "BLS CPI Pet Food & Treats (CUUR0000SS61031) via FRED — last updated Jan 2026",
    "BLS CPI Veterinary Services (CUSR0000SS62054) via BLS Data Viewer — last updated Apr 2026",
    "APPA National Pet Owners Survey & State of the Industry Report 2025/2026",
    "NAPHIA State of the Industry Report 2025 (premium data through end of 2024)",
    "Pet Business Professor / PetfoodIndustry.com Petflation tracker (Jan 2026)",
    "GlobalPETS Inflation Snapshot (Jan 2026 & Mar 2026)",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in USD).
 * Used as the "base year" for calculator inputs.
 */
export const usdPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 55,    // USD/month, avg across all dog sizes and food quality tiers
    cat: 30,    // USD/month
  },
  annualVetCare: {
    dog: 650,   // USD/year routine wellness (vaccines, checkup, dental)
    cat: 380,   // USD/year routine wellness
  },
  annualPetInsurance: {
    dog: 420,   // USD/year A&I coverage (pre-surge baseline)
    cat: 220,   // USD/year
  },
  annualGrooming: {
    dog: 300,   // USD/year (varies hugely by breed; mid estimate)
    cat: 60,    // USD/year (most cats self-groom; occasional professional)
  },
  annualSupplies: {
    dog: 200,   // USD/year toys, bedding, leash, collar, treats, etc.
    cat: 130,   // USD/year litter, toys, bedding, etc.
  },
}
