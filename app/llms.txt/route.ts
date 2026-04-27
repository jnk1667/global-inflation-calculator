import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const plainTextContent = `# Global Inflation Calculator - llms.txt

## Site Overview

The Global Inflation Calculator (https://www.globalinflationcalculator.com) is a comprehensive free inflation calculator that aggregates multiple official inflation indices for each currency. The platform serves individuals, researchers, financial professionals, and educators who need precise inflation analysis for financial planning, academic research, and economic understanding.

## Primary Keywords and Topics

- inflation calculator, purchasing power calculator, CPI inflation
- best inflation calculator online, inflation calculator usd
- best inflation calculator 2025 accurate, eur inflation calculator
- salary inflation adjustment, retirement inflation planning
- historical inflation data, currency inflation comparison
- cost of living calculator, real vs nominal value
- financial planning tools, economic data analysis
- shrinkflation calculator, free shrinkflation calculator, shrinkflation percentage calculator
- hidden price increase calculator, grocery shrinkflation, package size reduction calculator
- true inflation calculator, shrinkflation vs CPI, food CPI benchmark
- deflation calculator, deflationary assets, gold silver calculator
- precious metals appreciation, commodity price calculator
- investment race calculator, which investment beat inflation, inflation adjusted returns
- S&P 500 vs gold vs bitcoin, real returns calculator, investment comparison calculator
- best investment against inflation, gold vs stocks inflation, bitcoin vs inflation calculator
- energy inflation calculator, electricity price inflation, why is my electricity bill so high
- fuel price inflation history, energy CPI vs general CPI, energy cost history by country
- UK energy prices, Germany electricity prices, Australia electricity inflation, Bill Time Machine energy
- student loan calculator, loan repayment calculator, income-driven repayment
- mortgage calculator, home loan calculator, mortgage payment calculator
- emergency fund calculator, emergency savings calculator, recession preparation
- 3 month emergency fund, 6 month emergency fund, financial safety net
- economic uncertainty 2025, recession planning, emergency savings goal
- purchasing power parity calculator, PPP calculator, international salary comparison

## Site URLs and Tools

### Main Application Pages

- **Homepage (/) - Multi-Measure Inflation Calculator**
  - URL: https://www.globalinflationcalculator.com/
  - Purpose: Primary inflation calculator with multiple economic measures
  - Features: 
    * Multi-currency support (USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK, PLN, INR, CNY, BRL, MXN, ZAR, KRW, TRY, RUB, IDR, THB, MYR, PHP, VND, EGP, NGN, KES, GHS, UGX, TZS, ZMW, MWK, RWF, BIF, ETB, DJF, SOS, SDG, SSP)
    * Multiple inflation measures per currency (CPI, Core CPI, PCE, Core PCE, GDP Deflator, PPI, Import/Export Price Indices)
    * Historical data from 1913 to present
    * Real-time calculations with data quality indicators
    * Visual charts showing inflation trends
    * Purchasing power analysis
    * Year-over-year comparison
  - Data Sources: Bureau of Labor Statistics (BLS), Federal Reserve Economic Data (FRED), Eurostat, Bank of England, Statistics Canada, Australian Bureau of Statistics, and other official national statistical agencies
  - Update Frequency: Monthly (automated via Vercel Cron)
  - Technical: Next.js 15, React 19, TypeScript, Supabase PostgreSQL, Recharts visualization

- **About Page (/about)**
  - URL: https://www.globalinflationcalculator.com/about
  - Purpose: Explains methodology, data sources, and platform mission
  - Content: Detailed explanation of inflation calculation methods, data aggregation process, quality assurance, and educational resources

- **Charts Page (/charts)**
  - URL: https://www.globalinflationcalculator.com/charts
  - Purpose: Interactive inflation visualization and comparison tool
  - Features:
    * Multi-currency inflation rate comparison
    * Historical trend analysis (1913-present)
    * Customizable date ranges
    * Multiple chart types (line, area, bar)
    * Export capabilities (PNG, CSV)
    * Real-time data updates
  - Use Cases: Economic research, policy analysis, investment decisions, academic studies

### Specialized Calculators

- **Retirement Calculator (/retirement-calculator)**
  - URL: https://www.globalinflationcalculator.com/retirement-calculator
  - Purpose: Calculate retirement savings needs adjusted for inflation
  - Features:
    * Current age and retirement age inputs
    * Current savings and monthly contribution
    * Expected return rate and inflation adjustment
    * Retirement duration planning
    * Visual projection of savings growth
    * Inflation-adjusted retirement income needs
  - Target Users: Pre-retirees, financial planners, retirement savers
  - Educational Content: Explains compound interest, inflation impact on retirement, safe withdrawal rates

- **Salary Calculator (/salary-calculator)**
  - URL: https://www.globalinflationcalculator.com/salary-calculator
  - Purpose: Adjust historical salaries for inflation to understand real wage growth
  - Features:
    * Historical salary comparison
    * Real vs nominal wage analysis
    * Multi-year salary progression tracking
    * Purchasing power equivalence
    * Cost of living adjustments
  - Use Cases: Salary negotiations, wage analysis, economic research, career planning

- **Auto Loan Calculator (/auto-loan-calculator)**
  - URL: https://www.globalinflationcalculator.com/auto-loan-calculator
  - Purpose: Calculate auto loan payments and total vehicle ownership costs with inflation and gas price analysis
  - Features:
    * Vehicle price and loan amount inputs
    * Interest rate (APR) and loan term configuration (12-84 months)
    * Down payment calculator with percentage options
    * Monthly payment calculation with principal and interest breakdown
    * Total interest paid over loan lifetime
    * Inflation-adjusted cost analysis
    * Gas price inflation projections and fuel cost estimates
    * Total cost of ownership including fuel over loan term
    * Real vs nominal vehicle cost comparison
    * Historical vehicle price inflation trends
  - Calculations:
    * Monthly Payment: P × [r(1+r)^n] / [(1+r)^n - 1] where P = principal, r = monthly rate, n = months
    * Total Interest: (Monthly Payment × Loan Term) - Loan Amount
    * Inflation-Adjusted Total Cost: Vehicle cost + interest + fuel costs adjusted for inflation
    * Real Cost of Vehicle: Inflation-adjusted purchasing power equivalent
    * Fuel Cost Projection: Annual miles ÷ MPG × gas price × years × inflation factor
  - Educational Content:
    * Explains auto loan mechanics and vehicle financing basics
    * How down payments reduce total interest costs
    * Why shorter loan terms save money despite higher monthly payments
    * Impact of vehicle price inflation on affordability (50+ increase since 2020)
    * Gas price volatility and fuel cost projections
    * True cost of ownership beyond monthly payments
    * Comparing loan offers and negotiating rates
    * Avoiding negative equity situations
  - Data Sources: Federal Reserve auto loan rates, BLS transportation CPI, gasoline price indices
  - Target Users: Car buyers, vehicle financing seekers, auto loan borrowers, first-time car buyers, budget-conscious consumers
  - Use Cases: Vehicle purchase planning, auto loan comparison, financing decisions, budget planning for car ownership
  - Context: Vehicle prices have inflated dramatically post-2020, making financing more challenging
  - Update Frequency: Monthly (gas price and inflation data updates)

- **Shrinkflation Calculator (/shrinkflation-calculator)**
  - URL: https://www.globalinflationcalculator.com/shrinkflation-calculator
  - Purpose: Calculate the true effective inflation rate hidden in grocery package size reductions (shrinkflation) and compare against official food CPI benchmarks
  - Features:
    * Old vs new weight and price inputs for any consumer product
    * Effective shrinkflation rate: combined price-per-unit change capturing both price increase and size reduction
    * Annualised CAGR shrinkflation rate normalised across user-selected year span
    * Annual extra household cost calculation (annual spend × shrinkflation gap)
    * Official food CPI benchmark comparison — shows excess above what CPI recorded
    * 8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)
    * Pre-loaded common grocery product examples (cereal, coffee, chocolate, etc.)
    * Historical food CPI data 2000–2025 per currency
    * Severity rating (Mild / Moderate / Severe / Extreme) based on effective rate
  - Calculations:
    * Effective Shrinkflation %: ((New Price ÷ New Weight) ÷ (Old Price ÷ Old Weight) − 1) × 100
    * Annualised Rate (CAGR): (New Price-per-unit ÷ Old Price-per-unit) ^ (1 ÷ Years) − 1
    * Annual Extra Cost: (New Price − Fair Price at Old Rate) × Purchases per Year
    * CPI Benchmark Gap: Effective Shrinkflation % − Food CPI % change over same period
  - Data Sources:
    * FAOSTAT Consumer Price Indices (FAO, UN) — food CPI for USD, GBP, EUR, CAD, AUD, CHF, JPY (license: CC BY 4.0)
    * Stats NZ Consumer Price Index — food group series for NZD (license: CC BY 4.0)
    * Historical coverage: 2000–2025, 2015=100 base period
  - Educational Content:
    * What shrinkflation is and why it is technically legal in most countries
    * Why official CPI under-reports the true cost of shrinkflation
    * How to spot shrinkflation by comparing unit prices
    * Most affected product categories (cereals, snacks, chocolate, coffee, toiletries)
    * France and EU regulatory responses to mandatory shrinkflation labelling
  - Target Users: Consumers tracking grocery price changes, household budget planners, personal finance researchers, food journalists, consumer rights advocates
  - Unique Value Proposition:
    * Only shrinkflation calculator with multi-currency food CPI benchmark comparison
    * Shows both the raw shrinkflation % AND the gap above official food inflation
    * Covers 8 major currencies — not US-only like most alternatives
    * FAOSTAT-sourced benchmark data clearly cited and attributed
  - Use Cases:
    * Track whether a specific grocery product has shrunk and by how much
    * Calculate how much extra you spend per year because of shrinkflation
    * Compare your product effective inflation to what official CPI reported
    * Build evidence for consumer advocacy or journalism
  - Context: 2024 Capgemini study found 61–71% of consumers frustrated by shrinkflation; France became first country to mandate in-store labelling of shrinkflated products in 2024
  - Update Frequency: Annual (food CPI dataset updated as FAO and Stats NZ release new annual data)

- **Skimpflation Calculator (/skimpflation-calculator)**
  - URL: https://www.globalinflationcalculator.com/skimpflation-calculator
  - Purpose: Reveal the true hidden cost of quality degradation — when companies reduce service quality, ingredient strength, material thickness, or feature count while keeping the price the same or raising it
  - Features:
    * Quality score input (old vs new, rated 1–10) with optional description fields
    * Old vs new price inputs per unit
    * Effective quality-adjusted inflation rate: combines price change AND quality change into one real cost figure
    * Annual extra cost: how much more you are paying per year for the same or worse quality
    * Projected 5-year cumulative skimpflation cost
    * Severity badge: Mild / Moderate / Severe / Extreme based on effective rate
    * 8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)
    * Pre-loaded real-world category examples: Food & Drink, Clothing & Textiles, Hotels, Airlines, Streaming, Banking
    * Comparison to official CPI over a user-selected year span
    * Full results breakdown card with share-ready summary
    * Related Calculators section linking to Shrinkflation, Energy Inflation, and Insurance Inflation
    * Full-length editorial essay on 25 years of skimpflation evidence
    * FAQ section covering 7 common skimpflation questions
  - Calculations:
    * Quality-adjusted old price: old_price × (new_quality / old_quality)
    * Effective skimpflation %: ((new_price / quality_adjusted_old_price) − 1) × 100
    * Annual extra cost: (new_price − quality_adjusted_old_price) × purchases_per_year
    * 5-year cumulative cost: annual_extra × 5 (simplified linear projection)
    * CPI benchmark gap: effective_skimpflation % − official_CPI % over selected years
  - Pre-loaded Examples:
    * Supermarket ready meal (portion size and ingredient quality cuts)
    * Hotel room (fewer toiletries, no daily housekeeping, smaller breakfast)
    * Budget airline (no checked bag, no seat selection, reduced legroom)
    * Streaming service (lower default stream quality, ad-supported tier)
    * High street clothing (thinner fabric, fewer stitches per inch, polyester blend increase)
    * Bank current account (eliminated free overdraft buffer, reduced cashback)
  - Data Sources: Official CPI data from BLS (USD), ONS (GBP), Eurostat (EUR), Statistics Canada (CAD), ABS (AUD), Swiss FSO (CHF), Statistics Bureau Japan (JPY), Stats NZ (NZD) — same source chain as Shrinkflation Calculator
  - Target Users: Consumers, household budget planners, personal finance researchers, journalists, consumer rights advocates, product quality researchers
  - Unique Value Proposition: Only calculator that quantifies the hidden inflation from quality degradation (not just size reduction) across 8 currencies with a severity rating, 5-year projection, and official CPI comparison — distinct from shrinkflation which covers size/quantity changes only
  - Use Cases: Identify how much worse value a product or service represents vs 3 years ago; calculate annual household cost of widespread quality cuts; compare across product categories; build evidence for consumer advocacy
  - Context: Skimpflation accelerated during and after the 2021-2023 inflation surge as companies faced input cost increases and labour shortages. Unlike shrinkflation (measurable, physical), skimpflation is qualitative and deliberately harder to detect or prove — making a calculator that quantifies it uniquely valuable
  - Update Frequency: Annual (CPI benchmark data updated as national statistics agencies release new annual data)
  - SEO Sibling Pages: /shrinkflation-calculator (quantity reduction), /energy-inflation-calculator (sector-specific inflation), /insurance-inflation-calculator (service quality decline)

- **Sneakflation Calculator (/sneakflation-calculator)**
  - URL: https://www.globalinflationcalculator.com/sneakflation-calculator
  - Purpose: Quantify the true annual cost of hidden fees, surcharges, and quietly removed perks — the third pillar of the hidden inflation trilogy alongside shrinkflation and skimpflation
  - Features:
    * Multi-row fee entry table — add unlimited individual fees
    * Fee types: Increased Fee, New Fee, Removed Perk
    * Frequency options: Weekly, Monthly, Quarterly, Annual, One-off
    * Per-fee annual cost calculation with running totals
    * Total annual sneakflation burden summary card
    * 5-year cumulative cost projection
    * Bar chart breakdown by fee category
    * Severity badge: Low / Moderate / High / Severe based on annual total
    * 8 currency support with locale-specific pre-loaded example sets
    * Pre-loaded real-world category examples: Airlines, Streaming, Banking, Hotels, Gym, Restaurants
    * Locale-specific presets: USD (US airlines/banks), GBP (UK banks/rail), EUR (European airlines/banks), CAD, AUD, CHF, JPY, NZD
    * Full results breakdown with share-ready summary
    * Related Calculators section linking to Shrinkflation, Skimpflation, Energy Inflation
    * Full-length editorial essay on the hidden fee epidemic
    * FAQ section covering 7 common sneakflation questions
  - Calculations:
    * Per-fee annual cost: (current_amount - original_amount) × annual_frequency
    * Total annual burden: sum of all per-fee annual costs
    * 5-year cumulative: total_annual × 5 (simplified linear projection)
    * Severity thresholds: Low <£/$/€100, Moderate £100–299, High £300–599, Severe £600+
  - Pre-loaded Example Sets by Currency:
    * USD: Airline checked bag, Netflix password fee, Bank maintenance fee, Hotel resort fee, Gym annual fee, Restaurant service charge
    * GBP: Rail booking fee, Sky TV price hike, Barclays account fee, Hotel parking, Gym registration, Card surcharge
    * EUR: Ryanair seat fee, Spotify price hike, Deutsche Bank fee, Hotel city tax, Fitness First fee, Eco-surcharge
    * CAD: Air Canada bag fee, Crave TV hike, TD account fee, Hotel destination fee, GoodLife annual fee, Delivery surcharge
    * AUD: Qantas bag fee, Stan price hike, CommBank fee, Hotel parking, Fitness First fee, Card surcharge
    * CHF: Swiss Air bag fee, Netflix CHF hike, UBS account fee, Hotel city tax, Migros Fitness fee, Recycling surcharge
    * JPY: ANA bag fee, Netflix JPY hike, Mizuho account fee, Hotel facility fee, Konami Sports fee, Container charge
    * NZD: Air NZ bag fee, Neon price hike, ANZ account fee, Hotel resort fee, Les Mills annual fee, Card surcharge
  - Data Sources: No external CPI data required — all calculations are user-input based fee comparisons
  - Target Users: Consumers tracking subscription creep, frequent travellers, personal finance researchers, journalists covering junk fees, consumer rights advocates
  - Unique Value Proposition: Only calculator that quantifies the combined annual cost of all hidden fees and removed perks across unlimited services simultaneously — distinct from shrinkflation (size) and skimpflation (quality)
  - Context: The 2021–2024 inflationary period triggered a systematic unbundling of previously free services. US airlines collected over $7 billion in bag fees in 2023 alone. Hotel resort fees became standard. Streaming services added ad tiers and password sharing fees. Banks eliminated free overdraft buffers. The cumulative annual household cost runs into hundreds of dollars/pounds/euros for most consumers.
  - Update Frequency: Annual
  - SEO Sibling Pages: /shrinkflation-calculator (quantity reduction), /skimpflation-calculator (quality degradation), /insurance-inflation-calculator (service cost inflation)

- **Investment Race Calculator (/investment-race-calculator)**
  - URL: https://www.globalinflationcalculator.com/investment-race-calculator
  - Purpose: Compare real, inflation-adjusted returns of six major asset classes — S&P 500, gold, Bitcoin, housing, government bonds, and savings accounts — across any year range since 2000
  - Features:
    * Side-by-side multi-asset comparison: S&P 500 (2000–2025), gold (2000–2025), Bitcoin (2013–2025), housing (2000–2025), 10-year government bonds (2000–2025), savings account (2000–2025)
    * Inflation-adjusted (real) returns using official CPI data for 8 currencies
    * Nominal vs real return toggle (Fisher equation)
    * 8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)
    * Interactive line chart showing investment growth year by year
    * CAGR leaderboard ranking all assets from best to worst
    * Asset toggle to include or exclude specific investments
    * Cumulative CPI shown over the selected period for context
  - Calculations:
    * Nominal growth: Value(year) = Value(year−1) × (1 + nominal_return%)
    * Real return: ((1 + nominal) ÷ (1 + CPI)) − 1 (Fisher equation)
    * CAGR: (FinalValue ÷ InitialValue) ^ (1 ÷ Years) − 1
    * CPI data: annual headline CPI per currency from FAOSTAT and national agencies, 2000–2025
  - Data Sources:
    * Robert Shiller / Yale Economics (S&P 500 total returns)
    * LBMA / ICE Benchmark Administration (gold spot price)
    * CoinGecko / CoinMarketCap (Bitcoin annual close price)
    * BIS Residential Property Price Statistics (housing)
    * FRED / World Bank (government bonds, savings rates)
    * FAOSTAT / BLS / ONS / Eurostat / Statistics Canada / ABS / SFSO / Statistics Bureau of Japan / Stats NZ (CPI)
  - Target Users: Investors comparing asset classes, inflation hedgers, personal finance researchers, long-term savers, financial educators
  - Unique Value Proposition: Only free calculator that shows all six major asset classes with real inflation-adjusted returns side-by-side across 8 currencies using official CPI benchmarks
  - Use Cases: Understand which assets preserved purchasing power over any decade; compare Bitcoin vs gold vs stocks in real terms; research inflation hedging strategies; educational demonstrations of compound growth and inflation erosion
  - Update Frequency: Annual (return data and CPI updated as new year data becomes available)

- **Energy Inflation Calculator (/energy-inflation-calculator)**
  - URL: https://www.globalinflationcalculator.com/energy-inflation-calculator
  - Purpose: Track how electricity, petrol/gasoline, and fuel prices have outpaced or lagged general CPI inflation since 2000 across 8 major currencies
  - Features:
    * Energy CPI index vs general CPI index chart (2000–2025, both indexed to 2000=100)
    * Absolute price chart — residential electricity (ct/kWh) and petrol/gasoline (per litre or gallon) by year
    * % Change bar chart — side-by-side comparison of energy CPI, general CPI, electricity price, and fuel price changes
    * Bill Time Machine — enter your monthly energy bill from any past year, see what it costs today using energy CPI
    * General CPI equivalent shown alongside for direct comparison of excess energy cost
    * Scenario presets: Pre-Crisis Decade (2000–2008), Green Transition (2010–2020), Energy Crisis (2020–2025), Full History (2000–2025)
    * Year range selectors (From / To)
    * Summary stat cards: energy CPI change, general CPI change, outpacing gap, and projected bill
    * 8 currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)
    * Data sources panel with per-currency citations
    * Related Calculators section
    * Full-length editorial essay on 25 years of energy inflation data
    * FAQ section covering common energy inflation questions
  - Calculations:
    * Energy CPI indexed to 2000=100: (energy_cpi_year / energy_cpi_2000) × 100
    * Bill Time Machine: old_bill × (energy_cpi_end / energy_cpi_start)
    * % Change: ((end_index − start_index) / start_index) × 100
    * Outpacing gap: energy_cpi_pct_change − general_cpi_pct_change
  - Data Sources:
    * EIA Energy CPI & Retail Electricity/Gasoline Prices (USD)
    * ONS CPIH Energy Sub-index D7BT & BEIS Road Fuel Survey (GBP)
    * Eurostat HICP CP04+CP072 & BDEW Electricity Prices (EUR)
    * Statistics Canada CPI Table 18-10-0004-01 & NEB Electricity Prices (CAD)
    * ABS CPI Energy Sub-group 6401.0 & AER Electricity Prices (AUD)
    * Swiss FSO Energy Sub-index & ElCom Electricity Tariffs (CHF)
    * Statistics Bureau of Japan CPI Energy Series & METI Electricity Prices (JPY)
    * Stats NZ CPI Group 4 & EA Networks Electricity Prices (NZD)
  - Target Users: Households tracking energy bills, energy policy researchers, journalists, financial planners, economists
  - Unique Value Proposition: Only free calculator that compares energy CPI to general CPI across 8 currencies with a Bill Time Machine, absolute price history charts, and scenario presets — all from official national statistics sources
  - Use Cases: Understand why energy bills keep rising despite renewable transition; calculate how much more you have paid for energy over a decade vs if costs had tracked general inflation; compare country-level energy inflation after the 2022 energy crisis; research energy affordability and fuel poverty
  - Update Frequency: Annual (energy CPI and price data updated as new year data becomes available)

- **Deflation Calculator (/deflation-calculator)**
  - URL: https://www.globalinflationcalculator.com/deflation-calculator
  - Features:
    * Gold price calculator (historical data from 1913)
    * Silver price calculator (historical data from 1913)
    * Bitcoin price calculator (data from 2010)
    * Real vs nominal returns
    * Inflation-adjusted asset performance
    * Comparative analysis vs fiat currency
  - Data Sources: Federal Reserve, World Gold Council, Coinbase/CoinGecko APIs
  - Target Users: Investors, precious metals enthusiasts, cryptocurrency holders, inflation hedgers

- **Student Loan Calculator (/student-loan-calculator)**
  - URL: https://www.globalinflationcalculator.com/student-loan-calculator
  - Purpose: Calculate student loan payments with inflation considerations
  - Features:
    * Loan amount and interest rate inputs
    * Multiple repayment plan options (Standard, Graduated, Extended, Income-Driven)
    * Income-Driven Repayment (IDR) calculations (IBR, PAYE, REPAYE, ICR)
    * Loan forgiveness timeline projections
    * Total interest paid over loan lifetime
    * Monthly payment affordability analysis
    * Inflation impact on real loan burden
    * Federal vs private loan comparison
  - Repayment Plans Supported:
    * Standard Repayment (10 years)
    * Graduated Repayment (10 years, increasing payments)
    * Extended Repayment (25 years)
    * Income-Based Repayment (IBR) - 10% or 15% of discretionary income
    * Pay As You Earn (PAYE) - 10% of discretionary income
    * Revised Pay As You Earn (REPAYE) - 10% of discretionary income
    * Income-Contingent Repayment (ICR) - 20% of discretionary income
  - Educational Content: 
    * Explains federal student loan types (Direct Subsidized, Direct Unsubsidized, Direct PLUS)
    * Loan forgiveness programs (Public Service Loan Forgiveness, Teacher Loan Forgiveness)
    * Deferment and forbearance options
    * Refinancing considerations
    * Impact of inflation on loan repayment burden
  - Data Sources: Federal Student Aid, College Scorecard API, Department of Education
  - Target Users: College students, recent graduates, parents, financial aid counselors
  - Update Frequency: Annual (interest rates and income thresholds updated yearly)

- **Mortgage Calculator (/mortgage-calculator)**
  - URL: https://www.globalinflationcalculator.com/mortgage-calculator
  - Purpose: Calculate mortgage affordability and compare home prices to household income over time
  - Features:
    * Historical home price data (1970-present)
    * Median household income comparison
    * Price-to-Income ratio analysis
    * Affordability trends over time
    * Interactive charts showing housing market changes
    * Regional and national housing data
    * Inflation-adjusted home price analysis
    * Down payment and mortgage affordability calculations
    * Mortgage qualification guidelines
  - Metrics Calculated:
    * Median home price vs median household income
    * Price-to-Income (PTI) ratio
    * Housing affordability index
    * Years of income needed to buy a home
    * Percentage of income spent on housing
    * Historical comparison across decades
  - Educational Content:
    * Explains housing affordability metrics
    * Historical context of housing market trends
    * Impact of interest rates on affordability
    * Regional housing market variations
    * First-time homebuyer considerations
    * Mortgage qualification guidelines
  - Data Sources: U.S. Census Bureau, Federal Reserve Economic Data (FRED), Department of Housing and Urban Development (HUD)
  - Target Users: Prospective homebuyers, real estate professionals, housing policy researchers, economic analysts, mortgage applicants
  - Update Frequency: Quarterly (housing data updated as new Census/FRED data becomes available)

- **Emergency Fund Calculator (/emergency-fund-calculator)**
  - URL: https://www.globalinflationcalculator.com/emergency-fund-calculator
  - Purpose: Calculate emergency savings needs adjusted for inflation during economic uncertainty
  - Features:
    * Monthly expenses input with inflation adjustment
    * Target months of coverage (3-6 months recommended)
    * Current savings tracking
    * Monthly savings capacity calculation
    * Timeline to reach emergency fund goal
    * Risk assessment based on employment stability
    * Inflation-adjusted emergency fund projections
    * Personalized savings recommendations
    * Multiple expense categories tracking
    * Economic uncertainty context (2025 recession concerns)
  - Calculations:
    * Basic emergency fund: Monthly expenses × Target months
    * Inflation-adjusted future need
    * Required monthly savings to reach goal
    * Time to reach target savings
    * Purchasing power erosion over time
    * Risk-adjusted recommendations
  - Educational Content:
    * Explains why 3-6 months of expenses is recommended
    * Impact of 2025 economic uncertainty
    * How inflation affects emergency fund adequacy
    * Importance of high-yield savings accounts
    * Strategies to build emergency fund faster
    * When to use emergency fund vs other resources
    * Job loss and economic downturn preparation
  - Data Sources: Bureau of Labor Statistics (BLS) salary data, Federal Reserve inflation data, current savings rate data
  - Target Users: Workers concerned about job security, anyone without adequate emergency savings, recession preparers, financial planners
  - Context: 2025 economic uncertainty, less than 50% of Americans have 3 months saved, 33% have more credit card debt than emergency savings
  - Update Frequency: Monthly (inflation data updates)

- **50/30/20 Budget Calculator (/budget-calculator)**
  - URL: https://www.globalinflationcalculator.com/budget-calculator
  - Purpose: Simple budget planning using the proven 50/30/20 rule - 50% needs, 30% wants, 20% savings
  - Features:
    * Monthly or annual income input (after-tax)
    * Visual pie chart showing budget allocation
    * Automatic calculation of three categories:
      - Needs (50%): Housing, utilities, groceries, transportation, healthcare, insurance, minimum debt payments
      - Wants (30%): Dining out, entertainment, hobbies, subscriptions, shopping, travel
      - Savings (20%): Emergency fund, retirement, extra debt payments, investments, future goals
    * Detailed category examples for each budget section
    * Annual savings projections
    * Monthly budget breakdown with dollar amounts
    * Mobile-friendly interface with clear visual hierarchy
  - Calculations:
    * Needs amount: Monthly income × 0.50
    * Wants amount: Monthly income × 0.30
    * Savings amount: Monthly income × 0.20
    * Annual projections for all categories
  - Educational Content:
    * Explains the 50/30/20 budget rule popularized by Elizabeth Warren
    * Difference between needs and wants with real examples
    * Why after-tax income should be used
    * How to adjust percentages for high cost-of-living areas
    * When 60/20/20 or 70/20/10 splits may be necessary
    * Importance of saving even if less than 20%
    * How to track spending and stick to budget
  - Framework: Based on "All Your Worth: The Ultimate Lifetime Money Plan" by Elizabeth Warren
  - Target Users: Budget beginners, anyone seeking simple budgeting method, people in 2025 economic uncertainty, those building emergency funds
  - Context: Most popular budgeting method in 2025, recommended by financial advisors, simple enough for anyone to follow
  - Update Frequency: Static calculator (no data dependencies)

- **ROI Calculator (/roi-calculator)**
  - URL: https://www.globalinflationcalculator.com/roi-calculator
  - Purpose: Calculate return on investment with advanced inflation adjustment and Treasury rate comparison across 8 currencies
  - Features:
    * Basic ROI calculation (nominal returns)
    * Annualized return (CAGR) calculation
    * Inflation-adjusted returns (real ROI)
    * Tax impact analysis with customizable tax rates
    * Combined tax and inflation adjustment
    * Treasury rate comparison (opportunity cost analysis)
    * Multi-currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)
    * Visual chart showing nominal vs real returns over time
    * Year-by-year breakdown of purchasing power erosion
    * Advanced mode toggle for institutional-level analysis
    * Risk premium calculation (excess return over risk-free rate)
  - Calculations:
    * Basic ROI: (Final Value - Initial Investment) / Initial Investment × 100
    * Annualized Return: (Final Value / Initial Investment)^(1/Years) - 1
    * Real ROI: ROI adjusted for cumulative inflation over investment period
    * After-Tax Return: Net profit × (1 - tax rate) / Initial Investment × 100
    * True Return: After-tax, inflation-adjusted return (the real wealth gain)
    * Opportunity Cost: What Treasury bonds would have earned (risk-free alternative)
    * Excess Return: Investment return - Treasury return (risk premium)
  - Advanced Features (Available in Advanced Mode):
    * Capital gains tax rate input (0%, 15%, 20% for US long-term gains)
    * Custom inflation rate based on user's currency
    * Treasury benchmark selection (3-month T-Bill, 10-year Note, 30-year Bond)
    * Timeline chart showing nominal value vs purchasing power
    * Multi-measure inflation consensus (when available)
    * Purchasing power erosion visualization
  - Educational Content:
    * Explains difference between nominal and real returns
    * Why inflation-adjusted returns matter more than headline numbers
    * How taxes significantly impact true investment performance
    * Importance of comparing to risk-free Treasury rates
    * What "opportunity cost" means for investors
    * How to interpret risk premium (excess return over Treasuries)
    * Multi-currency considerations for international investors
    * When to use different Treasury benchmarks (short vs long-term)
  - Data Sources: 
    * U.S. Treasury rates (3-month, 10-year, 30-year) updated in real-time
    * Inflation rates for 8 currencies from official sources
    * Historical Treasury data for opportunity cost calculations
  - Target Users: 
    * Individual investors evaluating investment performance
    * Portfolio managers comparing returns to benchmarks
    * Financial advisors showing clients real vs nominal returns
    * International investors tracking multi-currency returns
    * Anyone wanting to understand true investment performance
  - Unique Value Proposition:
    * Only ROI calculator combining inflation, taxes, AND Treasury comparison
    * Multi-currency real return analysis (not available elsewhere)
    * Institutional-level analysis accessible to retail investors
    * Shows what investment REALLY earned in purchasing power terms
    * Risk-adjusted performance vs government bonds
  - Use Cases:
    * Evaluating stock investment performance over 5-10 years
    * Comparing real estate returns to alternative investments
    * Assessing whether investment risk was properly compensated
    * Understanding true wealth creation after inflation and taxes
    * International investment performance tracking
  - Context: Most ROI calculators only show percentage gains; this reveals true economic profit
  - Update Frequency: Real-time (Treasury rates updated daily)

- **PPP Calculator (/ppp-calculator)**
  - URL: https://www.globalinflationcalculator.com/ppp-calculator
  - Purpose: Calculate purchasing power parity (PPP) to compare real value of money across major global economies
  - Features:
    * PPP conversion between major economies (USA, UK, Canada, Australia, Japan, Eurozone, Switzerland, China, India, Brazil)
    * Basic mode: Simple PPP currency conversion using World Bank data
    * Advanced mode: Historical PPP trends (1990-2023), sector-specific breakdowns, multi-country comparison matrix
    * Historical Time Machine: See how purchasing power has evolved between countries over 30+ years
    * Sector-Specific PPP: Compare housing, healthcare, food, education, and energy costs across countries
    * Multi-Country Matrix: Compare 3-5 countries simultaneously
    * Visual charts showing PPP trends and comparisons
    * Salary purchasing power analysis across borders
    * Real-time calculations with World Bank and OECD data
  - Calculations:
    * Basic PPP Conversion: Amount × (Target Country PPP / Source Country PPP)
    * Purchasing Power Equivalent: What same amount of money can buy in different countries
    * Historical PPP Comparison: Track how PPP ratios have changed over time (1990-2023)
    * Sector PPP Breakdown: Housing, healthcare, food, education, energy purchasing power
    * Salary Equivalence: What salary in one country equals in purchasing power elsewhere
  - Advanced Features (Toggle-enabled):
    * Historical Time Machine: Compare purchasing power between two time periods
    * Sector-Specific Analysis: Granular breakdown by spending category
    * Multi-Country Matrix: Side-by-side comparison of 3+ countries
    * Inflation-adjusted PPP trends using historical inflation data
    * OECD detailed sector data for 38 OECD countries
  - Educational Content:
    * Explains what Purchasing Power Parity (PPP) means and why it differs from exchange rates
    * Why PPP is more accurate than exchange rates for salary and cost of living comparisons
    * How PPP accounts for local price levels and cost of living
    * Limitations of PPP (average baskets, quality differences, spending category variations)
    * How to use PPP for international salary negotiations
    * Understanding the "Big Mac Index" and commodity-based PPP
    * Combining PPP with tax considerations for true purchasing power
  - Data Sources:
    * World Bank PPP conversion factors (200+ countries, 1990-2023)
    * OECD PPP data with sector breakdowns (38 OECD countries)
    * BLS category-specific price indices for sector comparisons
    * Historical exchange rates and inflation data for time-series analysis
  - Methodology:
    * World Bank International Comparison Program (ICP) methodology
    * OECD PPP benchmarks using standardized basket of goods
    * Sector-specific PPP calculated from BLS subcategory indices
    * Historical calculations combine PPP ratios with inflation adjustment
    * Multi-country comparisons use normalized purchasing power metrics
  - Target Users:
    * International workers comparing salary offers across countries
    * Expats and digital nomads evaluating cost of living
    * HR professionals setting international compensation packages
    * Economists and researchers studying purchasing power trends
    * Students understanding international economics concepts
    * Investors analyzing currency valuation and market opportunities
    * Policy makers evaluating economic development and standards of living
  - Unique Value Proposition:
    * Only PPP calculator with 30+ years of historical trend analysis
    * Sector-specific breakdowns (housing, healthcare, education) not available elsewhere
    * Combines PPP with inflation data for time-adjusted comparisons
    * Multi-country matrix comparison (most calculators only do 2-country)
    * Advanced mode with institutional-level analysis accessible to everyone
    * Integration with existing inflation calculator infrastructure
  - Use Cases:
    * Salary negotiation: "My $100k salary in NYC equals £62k purchasing power in London"
    * Relocation planning: Understanding true cost of living differences
    * International hiring: Setting fair compensation across borders
    * Economic research: Tracking purchasing power convergence/divergence
    * Investment analysis: Currency valuation and arbitrage opportunities
    * Academic study: Teaching international economics and PPP concepts
  - Context: Essential tool for globalized economy where salary and cost comparisons must account for local purchasing power
  - Update Frequency: Annually (World Bank PPP data updated yearly, historical data static)

### Administrative and Content Management

- **Admin Content Management (/admin-manage-content)**
  - URL: https://www.globalinflationcalculator.com/admin-manage-content
  - Purpose: Internal tool for managing site content and data updates
  - Access: Password-protected (admin only)
  - Features:
    * Manual data refresh triggers
    * Content updates for About page
    * FAQ management
    * Data quality monitoring
    * API health checks

- **FAQ Management (/api/faqs)**
  - URL: https://www.globalinflationcalculator.com/api/faqs
  - Purpose: API endpoint for frequently asked questions
  - Features: CRUD operations for FAQ content, automatic IndexNow submission on updates

## Data Sources and Methodology

### Primary Data Sources

1. **United States (USD)**
   - Bureau of Labor Statistics (BLS) - CPI, Core CPI, PPI
   - Federal Reserve Economic Data (FRED) - PCE, Core PCE, GDP Deflator
   - Update Frequency: Monthly
   - Historical Coverage: 1913-present

2. **European Union (EUR)**
   - Eurostat - HICP (Harmonized Index of Consumer Prices)
   - European Central Bank - Core inflation measures
   - Update Frequency: Monthly
   - Historical Coverage: 1999-present (Euro introduction)

3. **United Kingdom (GBP)**
   - Office for National Statistics (ONS) - CPI, RPI
   - Bank of England - Inflation data
   - Update Frequency: Monthly
   - Historical Coverage: 1913-present

4. **Other Currencies**
   - National statistical agencies for each supported currency
   - Central bank data repositories
   - International Monetary Fund (IMF) data
   - World Bank economic indicators

### Calculation Methodology

- **Inflation Rate Calculation**: ((CPI_end / CPI_start) - 1) × 100
- **Purchasing Power**: Amount × (CPI_start / CPI_end)
- **Real Value**: Nominal Value / (1 + Inflation Rate)^years
- **Compound Annual Growth Rate (CAGR)**: ((End Value / Start Value)^(1/years) - 1) × 100

### Data Quality Assurance

- Automated data validation checks
- Cross-reference with multiple sources
- Outlier detection and flagging
- Manual review for significant discrepancies
- Data quality score (0-100%) displayed to users
- Fallback to simulated data if real data unavailable

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts library
- **State Management**: React hooks, SWR for data fetching

### Backend
- **Database**: Supabase (PostgreSQL)
- **API Routes**: Next.js API routes
- **Authentication**: Supabase Auth (for admin features)
- **Cron Jobs**: Vercel Cron (daily/monthly data updates)

### Data Pipeline
- **Automated Updates**: Vercel Cron triggers at 4 PM EST daily
- **Data Fetching**: Custom API integrations with BLS, FRED, Eurostat
- **Storage**: Supabase PostgreSQL with Row Level Security (RLS)
- **Caching**: SWR client-side caching, Next.js static generation

### SEO and Performance
- **Server-Side Rendering**: Next.js SSR for optimal SEO
- **Metadata**: Dynamic Open Graph and Twitter Card generation
- **Sitemap**: Auto-generated XML sitemap
- **IndexNow**: Automatic search engine notification on content updates
- **Performance**: Lighthouse score 95+ (Performance, Accessibility, Best Practices, SEO)

## User Personas and Use Cases

### Individual Users
- **Retirees**: Planning retirement income adjusted for inflation
- **Salary Negotiators**: Understanding real wage growth over time
- **Investors**: Analyzing inflation-adjusted returns
- **Students**: Calculating student loan repayment with inflation considerations
- **Homebuyers**: Understanding historical home price appreciation vs inflation
- **Emergency Fund Builders**: Preparing for economic uncertainty with inflation-adjusted savings
- **Budget Beginners**: Using the 50/30/20 rule for simple budget planning
- **International Workers**: Comparing salary offers across countries using PPP analysis

### Professional Users
- **Financial Advisors**: Client retirement and investment planning
- **Economists**: Research and policy analysis
- **Journalists**: Economic reporting and data visualization
- **Educators**: Teaching inflation concepts with real data
- **Policy Makers**: Economic policy impact assessment

### Institutional Users
- **Universities**: Academic research and teaching
- **Think Tanks**: Economic policy research
- **Government Agencies**: Economic analysis and forecasting
- **Corporations**: Compensation planning and budgeting

## Content Strategy and SEO

### Target Keywords (Primary)
- inflation calculator
- purchasing power calculator
- CPI calculator
- retirement calculator inflation
- salary inflation adjustment
- deflation calculator
- student loan calculator
- mortgage calculator
- emergency fund calculator
- budget calculator 50 30 20
- roi calculator
- ppp calculator
- shrinkflation calculator

### Target Keywords (Long-tail)
- best inflation calculator 2025 accurate
- how to calculate inflation between two years
- historical inflation rate calculator
- multi-currency inflation comparison
- retirement savings inflation adjustment
- real vs nominal wage calculator
- gold silver inflation hedge calculator
- student loan repayment calculator income-driven
- mortgage affordability calculator
- home price to income ratio analysis
- emergency savings goal calculation
- economic uncertainty planning
- 50 30 20 budget rule explanation
- roi calculator multi-currency
- roi calculator real-time
- purchasing power parity comparison
- international salary analysis

## Privacy and Data Protection

- No personal data collection for calculator usage
- Anonymous usage analytics (Google Analytics)
- GDPR compliant (EU users)
- CCPA compliant (California users)
- No cookies required for core functionality
- Optional cookies for analytics (user consent)

## Future Roadmap

### Planned Features
- Additional currencies (50+ total)
- Cryptocurrency inflation tracking
- Real estate price inflation calculator
- Healthcare cost inflation calculator
- Education cost inflation calculator
- Food price inflation tracker
- Energy price inflation tracker
- Mobile app (iOS and Android)
- API access for developers
- Custom inflation basket creator
- Inflation alerts and notifications

### Data Expansion
- Extended historical data (pre-1913 where available)
- Regional inflation data (US states, EU countries)
- City-level cost of living comparisons
- Industry-specific inflation indices
- Commodity price tracking

## Contact and Support

- **Website**: https://www.globalinflationcalculator.com
- **Support**: Contact form on website
- **Updates**: Follow on social media for new features
- **Feedback**: User feedback form available on all pages

## License and Attribution

- **Data**: Public domain (government sources) and licensed APIs
- **Code**: Proprietary (Global Inflation Calculator)
- **Attribution**: Data sources credited on each calculator page
- **Usage**: Free for personal and educational use
- **Commercial Use**: Contact for licensing

---

Last Updated: January 2025
Version: 2.0
Maintained by: Global Inflation Calculator Team`

  const acceptHeader = request.headers.get("accept") || ""

  // Check if the request prefers HTML (browsers and search engines typically send text/html)
  const prefersHtml = acceptHeader.includes("text/html")

  if (prefersHtml) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Documentation & Site Guide - Global Inflation Calculator | llms.txt</title>
  <meta name="description" content="Comprehensive AI-friendly documentation for the Global Inflation Calculator platform. Machine-readable guide to our inflation calculators, data sources, methodology, and financial planning tools. Optimized for LLMs, search engines, and AI assistants.">
  <meta name="keywords" content="llms.txt, AI documentation, site guide, inflation calculator API, LLM documentation, machine-readable documentation, AI assistant guide, chatbot integration">
  
  <!-- Enhanced SEO meta tags for better indexing -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://www.globalinflationcalculator.com/llms.txt">
  
  <!-- Open Graph meta tags for social sharing -->
  <meta property="og:title" content="AI Documentation & Site Guide - Global Inflation Calculator">
  <meta property="og:description" content="Comprehensive documentation for AI assistants and language models to understand and reference the Global Inflation Calculator platform.">
  <meta property="og:url" content="https://www.globalinflationcalculator.com/llms.txt">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Global Inflation Calculator">
  
  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AI Documentation & Site Guide - Global Inflation Calculator">
  <meta name="twitter:description" content="Machine-readable guide to our inflation calculators, data sources, and financial planning tools.">
  
  <!-- Structured data for better search understanding -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "AI Documentation & Site Guide - Global Inflation Calculator",
    "description": "Comprehensive documentation for AI assistants and language models to understand the Global Inflation Calculator platform.",
    "author": {
      "@type": "Organization",
      "name": "Global Inflation Calculator"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Global Inflation Calculator",
      "url": "https://www.globalinflationcalculator.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.globalinflationcalculator.com/llms.txt"
    },
    "dateModified": "${new Date().toISOString()}",
    "inLanguage": "en-US"
  }
  </script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    pre {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    .header-info {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #2563eb;
    }
    .header-info h1 {
      margin-top: 0;
      border: none;
    }
  </style>
</head>
<body>
  <!-- Added header section with SEO-friendly content -->
  <div class="header-info">
    <h1>🤖 AI Documentation & Site Guide</h1>
    <p><strong>Purpose:</strong> This page provides machine-readable documentation for AI assistants, language models, and search engines to understand the Global Inflation Calculator platform.</p>
    <p><strong>Format:</strong> llms.txt - A standardized format for AI-friendly site documentation</p>
    <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
  </div>
  <pre>${plainTextContent}</pre>
</body>
</html>`

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    })
  } else {
    return new NextResponse(plainTextContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    })
  }
}
