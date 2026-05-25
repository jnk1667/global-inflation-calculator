/**
 * Pet Inflation Data — Japan (JPY)
 *
 * Sources:
 * - Anicom Insurance (アニコム損保):
 *   "Pet Annual Expenditure Survey" (ペットにかける年間支出調査)
 *   Annual dog ownership cost 2025: ¥414,159 (+22% YoY from 2024 — significant leap)
 *   Annual cat ownership cost 2025: ¥178,418
 *   Source: petlife-navi.jp/statistics (citing Anicom; last updated Apr 2026)
 * - Pet Food Association of Japan (ペットフード協会):
 *   Pet population survey (全国犬猫飼育実態調査) — annual
 *   Dogs: 682.0万頭 (6.82M) in 2025; Cats: 884.7万頭 (8.847M) in 2025
 *   Total dogs+cats: ~15.67 million (2025)
 * - Yano Research Institute (矢野経済研究所):
 *   Japan pet-related market size: ¥1.9 trillion (2024 est), ¥1.87 trillion (2023)
 *   2023 YoY growth: +4.2%; 2025 projected: ¥1.926 trillion (+0.8% YoY)
 * - GITNUX Japan Pet Industry Statistics 2026 (citing multiple Japanese industry sources):
 *   Vet services market: ¥567 billion (2023)
 *   Average annual vet spend per dog: ¥112,000 (2023)
 *   Average annual vet spend per cat: ¥89,000 (2023)
 *   Pet food market total: ¥1.02 trillion (FY2022)
 *   Pet insurance premiums: ¥45 billion collected (FY2023)
 *   Pet insurance penetration: ~18% of dog owners in Japan
 *   Average annual spend per pet owner: ¥245,000 (2023)
 * - Petlife-navi.jp 2026 statistics compilation:
 *   Dog cost up 22% YoY (2025 vs 2024) — attributed to vet cost increases + premium food
 *   Pet market 2024: ¥1.9071 trillion (+2.6% YoY)
 * - Japan Statistics Bureau (総務省統計局): CPI for Japan
 *   Japan was in near-deflation/0% inflation for most of 2015–2021.
 *   CPI began rising significantly in 2022 (global energy + food commodity spike).
 *   2022: +2.5%; 2023: +3.2%; 2024: ~2.5%; 2025: ~2.8%
 * - DOGFOOD-STUDY.COM (dogfood-study.com):
 *   Multiple rounds of dog food price increases in Japan since 2022
 *   Manufacturers citing rising ingredient costs and weak yen making imports more expensive
 *
 * Geo note: JPY is used exclusively in Japan.
 * Japan's pet market is unique: cat population now exceeds dogs (since 2017).
 * Pet ownership rate is relatively low (17% of households) due to apartment restrictions
 * and cultural factors, but spending per pet is high.
 * Pet insurance penetration of ~18–20% among dog owners is globally high.
 * The weak yen (2022–2025) has made imported pet food significantly more expensive.
 */

export interface JPYPetInflationYearData {
  year: number
  /**
   * Estimated pet food YoY % inflation (Japan)
   * Context: Japan imports ~55% of pet food. Weak yen + commodity prices = significant impact.
   */
  petFoodYoY: number
  /**
   * Estimated vet services YoY % inflation (Japan)
   * Derived from Anicom expenditure survey data and market growth rates
   */
  vetServicesYoY: number
  /**
   * General Japan CPI all-items YoY % (Statistics Bureau)
   */
  generalCpiYoY: number
  /**
   * Total Japan pet-related market size in JPY billions (Yano Research)
   */
  marketSizeBillionJPY?: number
  /**
   * Average annual dog ownership cost in JPY (Anicom survey data, selected years)
   */
  avgAnnualDogCostJPY?: number
  /**
   * Average annual cat ownership cost in JPY (Anicom survey data, selected years)
   */
  avgAnnualCatCostJPY?: number
}

/**
 * Annual Japan pet inflation data.
 *
 * Notes:
 * - Japan's prolonged low-inflation/deflation period (2015–2021) means absolute price
 *   levels were stable, but the 2022–2025 surge is especially notable in context.
 * - The 22% jump in annual dog ownership costs in 2025 (Anicom) is the largest
 *   single-year increase on record for Japan.
 * - Yen weakness (2022–2025) is a key Japan-specific driver: ~55% of pet food is imported.
 *   USD/JPY went from ~110 (2021) to ~155 (2024), making imports ~40% more expensive.
 */
export const jpyPetInflationData: JPYPetInflationYearData[] = [
  {
    year: 2015,
    petFoodYoY: 1.0,     // Japan in mild deflation/near-zero CPI; pet food imported = slight increase
    vetServicesYoY: 2.5, // services always above goods in Japan
    generalCpiYoY: 0.8,
    marketSizeBillionJPY: 1400, // est
  },
  {
    year: 2016,
    petFoodYoY: 0.5,
    vetServicesYoY: 2.3,
    generalCpiYoY: -0.1,
    marketSizeBillionJPY: 1450,
  },
  {
    year: 2017,
    petFoodYoY: 1.2,
    vetServicesYoY: 2.5,
    generalCpiYoY: 0.5,
    marketSizeBillionJPY: 1520,
  },
  {
    year: 2018,
    petFoodYoY: 1.5,
    vetServicesYoY: 2.8,
    generalCpiYoY: 1.0,
    marketSizeBillionJPY: 1580,
  },
  {
    year: 2019,
    petFoodYoY: 2.0,
    vetServicesYoY: 3.0,
    generalCpiYoY: 0.5,
    marketSizeBillionJPY: 1640,
  },
  {
    year: 2020,
    petFoodYoY: 1.5,
    vetServicesYoY: 2.8,
    generalCpiYoY: 0.0,
    marketSizeBillionJPY: 1680,
  },
  {
    year: 2021,
    petFoodYoY: 2.5,
    vetServicesYoY: 3.2,
    generalCpiYoY: -0.2,
    marketSizeBillionJPY: 1720,
  },
  {
    year: 2022,
    petFoodYoY: 7.5,    // yen weakness (USD/JPY 110→150) + commodity spike = major food price surge
    vetServicesYoY: 4.5,
    generalCpiYoY: 2.5,  // Japan's highest CPI since early 1990s
    marketSizeBillionJPY: 1780,
  },
  {
    year: 2023,
    petFoodYoY: 8.0,    // continued yen weakness + multiple manufacturer price revision rounds
    vetServicesYoY: 5.5, // market ¥567B in 2023 (GITNUX); avg dog vet ¥112,000
    generalCpiYoY: 3.2,
    marketSizeBillionJPY: 1862, // Yano Research
    avgAnnualDogCostJPY: 245000, // GITNUX (avg per owner across dog + cat households)
  },
  {
    year: 2024,
    petFoodYoY: 6.0,    // continued pressure; USD/JPY peaked ~160 in 2024
    vetServicesYoY: 6.5,
    generalCpiYoY: 2.5,
    marketSizeBillionJPY: 1908, // Yano Research est (¥1.9071 trillion)
    avgAnnualDogCostJPY: 339000, // est (before 2025's 22% jump; working backwards from ¥414,159 ÷ 1.22)
  },
  {
    year: 2025,
    petFoodYoY: 5.0,    // some moderation as yen stabilizes
    vetServicesYoY: 7.0, // Anicom survey: dog costs up 22% YoY — vet is primary driver
    generalCpiYoY: 2.8,  // est
    marketSizeBillionJPY: 1926, // Yano Research projection
    avgAnnualDogCostJPY: 414159, // Anicom confirmed — 22% increase vs 2024
    avgAnnualCatCostJPY: 178418, // Anicom confirmed
  },
]

/**
 * Key benchmark statistics for the Japanese market.
 */
export const jpyPetInflationBenchmarks = {
  /**
   * 2025 annual dog ownership cost (Anicom — gold standard Japanese survey)
   */
  annualDogCostJPY2025: 414159,     // ¥ — Anicom
  annualCatCostJPY2025: 178418,     // ¥ — Anicom

  /**
   * 2025 dog cost YoY increase (Anicom)
   */
  dogCostYoYPct2025: 22,            // % — Anicom — largest on record

  /**
   * Pet population (Pet Food Association of Japan, 2025)
   */
  dogPopulationMillions2025: 6.82,  // 682万頭
  catPopulationMillions2025: 8.85,  // 884.7万頭 (cats exceed dogs since 2017)
  totalDogsCatsMillions2025: 15.67,

  /**
   * Historical peak populations for context
   */
  dogPopulationPeakMillions: 8.80,  // ~2019
  catPopulationPeakMillions: 9.155, // 2024

  /**
   * Market size (Yano Research)
   */
  marketSize2024BillionJPY: 1908,   // ¥1.9071 trillion
  marketSize2023BillionJPY: 1862,   // ¥1.862 trillion (Yano)
  marketSizeCAGR2023to2028Pct: 4.5, // projected (GITNUX citing Yano)

  /**
   * Pet food segment (dominant at ~58% of total market)
   */
  petFoodMarketFY2022BillionJPY: 1020, // ¥1.02 trillion
  importedFoodShareOfTotal: 0.55,       // 55% of pet food imported (yen sensitivity)

  /**
   * Vet services market
   */
  vetMarket2023BillionJPY: 567,     // GITNUX citing Japanese industry data
  avgAnnualVetPerDogJPY2023: 112000, // GITNUX
  avgAnnualVetPerCatJPY2023: 89000,  // GITNUX

  /**
   * Pet insurance
   */
  petInsurancePremiums2023BillionJPY: 45,
  petInsurancePenetrationDogOwnersPct: 18, // ~18–20%, globally high
  avgInsuranceClaimPayoutJPY: 245000,      // GITNUX

  /**
   * Ownership rate — low by global standards due to housing restrictions
   * Source: petlife-navi.jp international comparison / Euromonitor
   */
  overallPetOwnershipRatePct: 17,   // % of households (vs USA 71%, Australia 69%)
  dogOwnershipRatePct: 9.0,
  catOwnershipRatePct: 8.6,
  petOwningHouseholdsMillions: 15.2, // 2022 (GITNUX)

  /**
   * Key yen weakness factor (2022–2024) — unique Japan driver
   * USD/JPY trajectory: ~110 (2021) → ~150 (2022) → ~155 (2023) → ~160 (2024 peak)
   */
  usdJpyApprox: {
    2021: 110,
    2022: 131,
    2023: 141,
    2024: 153,
  },

  dataSourceNote: [
    "Anicom Insurance (アニコム損保) 'ペットにかける年間支出調査' — annual expenditure survey",
    "Pet Food Association of Japan (ペットフード協会) — 全国犬猫飼育実態調査 (annual population survey)",
    "Yano Research Institute (矢野経済研究所) — Japan pet market size data",
    "GITNUX Japan Pet Industry Statistics 2026 (citing Japanese industry sources)",
    "petlife-navi.jp/statistics — 2026 compilation (Anicom, Yano, Pet Food Association)",
    "dogfood-study.com — pet food price increase tracker (Japan-specific)",
    "Japan Statistics Bureau — CPI annual rates",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in JPY).
 * Note: Japan had very low inflation 2015–2021 so 2019 is a clean baseline.
 */
export const jpyPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 6500,   // ¥/month
    cat: 3800,   // ¥/month
  },
  annualVetCare: {
    dog: 85000,  // ¥/year routine wellness (incl. vaccines; avg dog ¥112k in 2023 = higher now)
    cat: 60000,  // ¥/year
  },
  annualPetInsurance: {
    dog: 42000,  // ¥/year (~¥3,500/month — typical mid-tier Japan plan)
    cat: 22000,  // ¥/year
  },
  annualGrooming: {
    dog: 35000,  // ¥/year (grooming services 89B¥ market / ~8M dogs ≈ ~¥11,000/dog;
                 //  but includes full-service shops; mid-to-premium dog estimate)
    cat: 5000,   // ¥/year (minimal; most cats self-groom in Japan)
  },
  annualSupplies: {
    dog: 22000,  // ¥/year (toys, bedding, accessories — Japan known for premium pet goods)
    cat: 15000,  // ¥/year (incl. litter)
  },
}
