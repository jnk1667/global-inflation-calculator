/**
 * Pet Inflation Data — Switzerland (CHF)
 *
 * Sources:
 * - Swiss Federal Statistical Office (FSO / BFS): Consumer Price Index Switzerland
 *   Switzerland's overall CPI has been among the lowest in the developed world,
 *   with general inflation barely exceeding 0–1% for most of the 2015–2021 period.
 *   Peak inflation: 2022 at ~2.8% (low by global standards); 2023 ~2.1%; 2024 ~1.1%.
 * - Swiss FSO CPI methodology (2016 base year) — noted in search results
 * - Eurostat HICP: Switzerland is not in the EU/Eurozone but Eurostat vet services
 *   data for neighboring eurozone countries (Germany, Austria, France) is used as proxy.
 *   Euro Area vet services HICP +33.26% since Dec 2016 (record high Nov 2025).
 * - Global pet food market context: Major pet food brands (Mars, Nestlé Purina) are
 *   headquartered/have major operations in Switzerland — this provides pricing context.
 *   Nestlé SA (Vevey, Switzerland) is one of the largest global pet food manufacturers.
 * - Swiss animal companion population: ~1.7 million dogs, ~1.5 million cats (est. 2023)
 *   Source: Swiss Federal Food Safety and Veterinary Office (FSVO/BLV) registration data.
 * - Vet inflation: Swiss vet costs are among the highest in Europe but inflation has been
 *   more moderate than UK/Canada due to Switzerland's generally lower overall inflation.
 * - TGM Global Pet Care Report 2024: referenced in search results but not fully accessible.
 *
 * Data limitation note:
 * Switzerland does not widely publish granular pet-specific CPI sub-categories publicly
 * (as of the research period). Values below are informed estimates based on:
 * 1. Swiss FSO general CPI trajectory (known, very low)
 * 2. Global/European vet inflation context (+3–6% per year)
 * 3. Swiss general services inflation patterns (roughly 1–2pp above goods)
 * 4. Switzerland's position as a high-cost country with premium pet services
 *
 * Geo note: CHF is used in Switzerland and Liechtenstein. Switzerland has
 * compulsory liability insurance for dogs in most cantons (Haftpflichtversicherung).
 * Swiss vet costs are typically 20–40% higher than neighboring Germany/Austria.
 */

export interface CHFPetInflationYearData {
  year: number
  /**
   * Estimated pet food YoY % inflation (Switzerland)
   * Note: FSO does not publish standalone pet food CPI; these are estimates
   * based on food commodity trends and Swiss FSO food category data.
   */
  petFoodYoY: number
  /**
   * Estimated vet services YoY % inflation (Switzerland)
   * Derived from Swiss services CPI patterns and neighboring Eurozone country data.
   */
  vetServicesYoY: number
  /**
   * General Switzerland CPI all-items YoY % (FSO published)
   */
  generalCpiYoY: number
}

/**
 * Annual Swiss pet inflation data.
 *
 * Context: Switzerland's inflation environment is fundamentally different from the
 * UK, US, or Canada. General CPI was negative or near-zero from 2015–2020, meaning
 * even modest pet-sector inflation represented a significant real price increase
 * relative to the general economy.
 */
export const chfPetInflationData: CHFPetInflationYearData[] = [
  {
    year: 2015,
    petFoodYoY: 0.5,    // est — Switzerland in mild deflation 2015
    vetServicesYoY: 2.5, // est — services consistently above goods in CH
    generalCpiYoY: -1.1, // FSO: Switzerland CPI -1.1% in 2015
  },
  {
    year: 2016,
    petFoodYoY: 0.3,
    vetServicesYoY: 2.3,
    generalCpiYoY: -0.4, // FSO: near-zero, mild deflation
  },
  {
    year: 2017,
    petFoodYoY: 0.8,
    vetServicesYoY: 2.5,
    generalCpiYoY: 0.5,
  },
  {
    year: 2018,
    petFoodYoY: 1.2,
    vetServicesYoY: 2.7,
    generalCpiYoY: 0.9,
  },
  {
    year: 2019,
    petFoodYoY: 1.0,
    vetServicesYoY: 2.5,
    generalCpiYoY: 0.4,
  },
  {
    year: 2020,
    petFoodYoY: 0.8,
    vetServicesYoY: 2.2,
    generalCpiYoY: -0.7, // mild deflation; COVID demand effects
  },
  {
    year: 2021,
    petFoodYoY: 1.5,
    vetServicesYoY: 2.8,
    generalCpiYoY: 0.6,
  },
  {
    year: 2022,
    petFoodYoY: 4.5,    // global supply chain spike — muted vs. other countries due to CHF strength
    vetServicesYoY: 3.5,
    generalCpiYoY: 2.8, // FSO: highest Swiss inflation in ~30 years
  },
  {
    year: 2023,
    petFoodYoY: 4.0,
    vetServicesYoY: 3.8,
    generalCpiYoY: 2.1, // FSO
  },
  {
    year: 2024,
    petFoodYoY: 2.0,    // moderating
    vetServicesYoY: 3.2,
    generalCpiYoY: 1.1, // FSO: sharp deceleration
  },
  {
    year: 2025,
    petFoodYoY: 1.5,    // est
    vetServicesYoY: 3.0, // est — broadly aligns with Eurozone vet moderation
    generalCpiYoY: 0.8,  // est — Switzerland trending back toward near-zero
  },
]

/**
 * Key benchmark statistics for the Swiss market.
 */
export const chfPetInflationBenchmarks = {
  /**
   * Switzerland general inflation context
   * Swiss inflation is structural low — CHF is a safe-haven currency, imports cheaper
   */
  avgGeneralCpiPct2015to2021: 0.0,  // avg effectively zero/negative
  peakGeneralCpiPct: 2.8,           // 2022 — highest in ~30 years for Switzerland
  generalCpi2024: 1.1,              // FSO confirmed

  /**
   * Vet cost context: Switzerland has some of the highest vet costs in Europe,
   * but inflation of those costs has been relatively moderate vs. UK/Canada.
   * Swiss vets benefit from compulsory dog liability insurance requirements
   * creating a stable revenue base.
   */
  vetCostsVsGermany: "20–40% higher",   // indicative premium for Swiss vet care
  dogLiabilityInsuranceMandatory: true,  // required in most Swiss cantons

  /**
   * Swiss pet population estimates (FSVO/BLV registration + survey data)
   */
  estimatedDogPopulationMillions: 1.7,   // Switzerland 2023
  estimatedCatPopulationMillions: 1.5,   // Switzerland 2023

  /**
   * Key corporate context: Nestlé Purina HQ in Lausanne/Vevey, Switzerland
   * Mars Petcare has European operations closely linked to CH market
   */
  nestlePurinaHQ: "Vevey, Switzerland",

  dataSourceNote: [
    "Swiss Federal Statistical Office (FSO/BFS) CPI — annual all-items figures",
    "Swiss Federal Food Safety and Veterinary Office (FSVO/BLV) — pet population data",
    "Eurostat HICP vet services data for neighboring countries (proxy reference)",
    "GlobalPETS Inflation Snapshot Jan 2026 (Euro Area context; Switzerland not EU member)",
    "Note: Switzerland-specific pet CPI sub-categories not publicly available from FSO",
    "Annual estimates based on FSO general CPI trajectory + services premium factor",
  ],
}

/**
 * Per-category cost baselines (approximate 2019 costs in CHF).
 * Switzerland has among the highest absolute costs in Europe.
 */
export const chfPetCostBaselines2019 = {
  monthlyPetFood: {
    dog: 65,    // CHF/month (premium market; higher absolute costs)
    cat: 38,    // CHF/month
  },
  annualVetCare: {
    dog: 800,   // CHF/year routine wellness (significantly higher than EU avg)
    cat: 500,   // CHF/year
  },
  annualPetInsurance: {
    dog: 450,   // CHF/year (liability + health combined; liability often mandatory)
    cat: 200,   // CHF/year
  },
  annualGrooming: {
    dog: 380,   // CHF/year
    cat: 60,    // CHF/year
  },
  annualSupplies: {
    dog: 250,   // CHF/year
    cat: 160,   // CHF/year
  },
}
