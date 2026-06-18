import { JsonLd } from "@/components/json-ld"
import type { Metadata } from "next"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "LLM Context | Global Inflation Calculator",
  description:
    "Complete context documentation for LLM models about Global Inflation Calculator. 20+ financial planning tools for inflation analysis, salary comparison, retirement planning, and cost of living analysis across 8 currencies.",
  alternates: {
    canonical: "https://www.globalinflationcalculator.com/llms",
  },
  keywords: [
    "LLM context",
    "inflation calculator",
    "financial tools",
    "retirement planning",
    "salary comparison",
    "cost of living",
    "AI model documentation",
  ],
  openGraph: {
    title: "LLM Context | Global Inflation Calculator",
    description:
      "Complete documentation of Global Inflation Calculator for LLM models, including all 20+ calculators, data sources, and technical specifications.",
    url: "https://www.globalinflationcalculator.com/llms",
    type: "website",
  },
}

export default function LLMSPage() {
  const llmsContent = `# Global Inflation Calculator - LLM Context

## Site Overview
Global Inflation Calculator is a comprehensive financial planning platform offering 20+ calculators for inflation analysis, salary comparison, retirement planning, subscription price tracking, and cost of living comparisons across multiple currencies.

## Core Tools

### Inflation Calculator (Homepage)
URL: https://globalinflationcalculator.com/
Calculate historical inflation for 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) from 1913-2026.

### Salary Calculator
URL: https://globalinflationcalculator.com/salary-calculator
Adjust historical salaries for inflation to understand purchasing power over time.

### Regional Cost of Living Comparison
URL: https://globalinflationcalculator.com/salary-calculator/regional-cost-of-living
Compare cost of living across 80+ cities worldwide in 8 currencies. Analyze housing, utilities, food, and transportation costs with official government data from BLS, UK ONS, Eurostat, Statistics Canada, ABS, Swiss FSO, Statistics Bureau of Japan, and Stats NZ. Features include cross-currency salary comparison, affordability metrics, and real-time cost calculations.

### Retirement Calculator
URL: https://globalinflationcalculator.com/retirement-calculator
Plan retirement savings considering inflation's impact on nest eggs.

### Student Loan Calculator
URL: https://globalinflationcalculator.com/student-loan-calculator
Calculate student loan repayment with inflation adjustments.

### Mortgage Calculator
URL: https://globalinflationcalculator.com/mortgage-calculator
Analyze home affordability and mortgage payments adjusted for inflation.

### Inflation-Adjusted Home Affordability Calculator
URL: https://globalinflationcalculator.com/home-affordability-calculator/inflation-adjusted
Calculate maximum home purchase price based on income, down payment, monthly debts, and interest rate. Applies country-specific lending rules: US 28/36 DTI rule (Fannie Mae/Freddie Mac guidelines), UK 4.5x income cap with FCA/PRA stress test, Canada CMHC stress test (OSFI Guideline B-20), Australia APRA 3% serviceability buffer, Switzerland FINMA 33% housing cost ratio, Japan JHF DTI thresholds, New Zealand RBNZ debt-to-income restrictions. Shows inflation-adjusted buying power since 2000 using official CPI data. Supports USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD. Data sourced from BLS, ONS, Eurostat, Statistics Canada, ABS, Swiss FSO, Statistics Bureau of Japan, Stats NZ, Freddie Mac PMMS, and FRED API.

### Auto Loan Calculator
URL: https://globalinflationcalculator.com/auto-loan-calculator
Calculate auto loan payments with gas price and inflation analysis.

### Emergency Fund Calculator
URL: https://globalinflationcalculator.com/emergency-fund-calculator
Determine emergency savings needs with inflation protection.

### Budget Calculator
URL: https://globalinflationcalculator.com/budget-calculator
Use the 50/30/20 rule for budgeting with inflation considerations.

### ROI Calculator
URL: https://globalinflationcalculator.com/roi-calculator
Calculate investment returns adjusted for inflation.

### PPP Calculator
URL: https://globalinflationcalculator.com/ppp-calculator
Compare purchasing power parity across economies.

### Insurance Inflation Calculator
URL: https://globalinflationcalculator.com/insurance-inflation-calculator
Calculate health insurance premium increases over time with medical inflation. Project 5, 10, or 20-year costs based on age, family size, region, plan type, and smoking status across 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD). Features regional premium variations, medical inflation rates 3-6% annually, and comprehensive cost forecasting.

### Global Net Worth Calculator
URL: https://globalinflationcalculator.com/global-net-worth-calculator
Calculate real net worth across 8 major currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) with inflation-adjusted purchasing power analysis. Track assets (real estate, investments, savings, vehicles, business, other) and liabilities (mortgage, auto loan, student loan, credit cards, personal loans, other). Features include debt-to-asset ratio health indicator, global wealth percentile ranking, 10/20/30-year inflation erosion projections using official government inflation rates, and future net worth projection with growth rate benchmarks (savings account, bonds, balanced portfolio, S&P 500). Data sourced from BLS, ONS, Eurostat, Statistics Canada, ABS, Swiss FSO, Statistics Bureau of Japan, and Stats NZ.

### Global Compound Interest Calculator
URL: https://globalinflationcalculator.com/global-compound-interest
Calculate compound interest with inflation adjustment across 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD). Shows real vs nominal returns using official Bureau of Labor Statistics inflation data from 1913-2026. Features monthly contribution calculations, investment strategy comparison (High-Yield Savings 3.67%, I-Bonds 4.03%, Bonds 5%, Balanced 7%, S&P 500 10.5%), purchasing power analysis, and currency-specific inflation rates. Includes detailed formulas, data source methodology, and interactive visualizations showing nominal value vs inflation-adjusted real purchasing power over time.

### Legacy Planner
URL: https://globalinflationcalculator.com/legacy-planner
Project multi-generational wealth transfer with inflation.

### Deflation Calculator
URL: https://globalinflationcalculator.com/deflation-calculator
Analyze purchasing power growth of Bitcoin, Ethereum, Gold, Silver, Oil.

### Investment Race Calculator
URL: https://globalinflationcalculator.com/investment-race-calculator
Compare real, inflation-adjusted returns of S&P 500, gold, Bitcoin, housing, 10-year government bonds, and savings accounts across any year range since 2000. Uses log-scale charting to display assets with vastly different return magnitudes on a single readable chart. Supports 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) with country-specific CPI benchmarks. Data sourced from Robert Shiller / Yale Economics (S&P 500), LBMA / ICE Benchmark Administration (Gold), CoinGecko / CoinMarketCap (Bitcoin), BIS Residential Property Price Statistics (Housing), FRED / World Bank (Bonds and Savings), and FAOSTAT (CPI).

### Dateflation Calculator
URL: https://globalinflationcalculator.com/dateflation-calculator
Calculate how much more expensive dating has become since a chosen start year. Enter old vs current per-date costs to get a personal dateflation rate (total % and annualised CAGR), annual extra dating spend, a Dating Inflation Tax (cost above the official eating-out CPI-adjusted baseline), and 3/5-year forward projections. Pre-fills per-date costs from survey data (BMO Real Financial Progress Index for USD and CAD, Velloy Dating Index for GBP, ABS CPI-anchored estimate for AUD, trami.jp/laskoi.jp for JPY). Compares against official eating-out CPI sub-indices: BLS Food Away From Home (USD), ONS CPIH Restaurants & Cafes L557 (GBP), Statistics Canada Food from Restaurants CPI (CAD), ABS Meals Out CPI (AUD), Statistics Bureau of Japan Eating Out CPI (JPY). Supports 5 date type presets (Dinner & Drinks, Coffee & Walk, Activity, Drinks Only, Home/Cook Together) with optional pre-date cost breakdown (grooming, transport, dating apps). Data quality badges distinguish High Confidence currencies (USD, GBP, JPY) from Estimated Baseline currencies (CAD, AUD).

### Education Inflation Calculator
URL: https://globalinflationcalculator.com/education-inflation-calculator
Calculate how much university tuition has risen vs official Education CPI since 1990. Enter tuition costs from two different years to get a personal education inflation rate (total % + annualized CAGR), an Education Inflation Tax (cost above CPI-adjusted baseline), and 5/10-year projections at historical growth rates. Pre-fills national tuition benchmarks per currency. Supports 8 currencies (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD) with Education CPI data from BLS series CUSR0000SAE1, ONS D7C5, Eurostat HICP CP10, Statistics Canada Table 18-10-0004-01, ABS CPI 6401.0, Swiss FSO, Statistics Bureau of Japan, and Stats NZ Group 11. Tuition benchmarks from NCES IPEDS, UK Parliament, DUO, Statistics Canada Table 37-10-0045-01, Study Assist (AUS), ETH Zurich, MEXT, and NZ Ministry of Education. Includes global tuition comparison table (2000, 2010, 2024) for USA, UK, Canada, Australia, Netherlands, Germany, France, Switzerland, Japan, and New Zealand.

### Subscription Inflation Calculator
URL: https://globalinflationcalculator.com/subscription-inflation-calculator
Track how much Netflix, Spotify, Amazon Prime, Disney+, Apple TV+, YouTube Premium, Microsoft 365, Adobe Creative Cloud, Dropbox, LinkedIn Premium, NordVPN, Planet Fitness, Peloton, Duolingo, the New York Times, Hulu/Max, and iCloud+ have raised prices above official CPI inflation since launch. Users add their own subscriptions, choose a start year and currency (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD), and see a personalised monthly "Subscription Inflation Tax" figure with an interactive price history chart vs CPI-adjusted baseline. Includes the Subscription Creep Calculator (per-service deep-dive with CAGR, cumulative overpayment, and multi-year forward projection) and a custom unlisted service mode. Price history sourced from official company press releases, investor relations filings, and archived pricing pages. CPI baselines sourced from BLS (USD), ONS (GBP), Eurostat (EUR), Statistics Canada (CAD), ABS (AUD), Swiss FSO (CHF), Statistics Bureau of Japan (JPY), and Stats NZ (NZD).

### Charts & Analytics
URL: https://globalinflationcalculator.com/charts
Interactive inflation trends and economic data visualizations.

## Data Sources
- US Bureau of Labor Statistics (BLS)
- UK Office for National Statistics (ONS)
- Eurostat (European Statistics)
- Statistics Canada
- Australian Bureau of Statistics (ABS)
- Swiss Federal Statistical Office (FSO)
- Statistics Bureau of Japan
- Statistics New Zealand (Stats NZ)
- Federal Reserve Economic Data (FRED)

## Technical Details
- 8 supported currencies: USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD
- Historical data: 1913-2026
- 80+ cities for cost of living comparison
- Real-time calculations
- Government data sources for accuracy
- Full keyboard accessibility (WCAG 2.1 AA)
- Mobile-responsive design

## Key Features
- Historical inflation tracking
- Salary purchasing power analysis
- Multi-city cost of living comparison
- Retirement planning with inflation
- Loan calculators (student, mortgage, auto)
- Budget planning tools
- Investment ROI analysis
- Cross-currency comparisons
- Data transparency with source attribution

## Accessibility
WCAG 2.1 Level AA compliant, full keyboard navigation, screen reader support, high contrast modes.

Last Updated: June 2026`

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.globalinflationcalculator.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "LLM Context",
        item: "https://www.globalinflationcalculator.com/llms",
      },
    ],
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "LLM Context Documentation",
    description:
      "Complete documentation of Global Inflation Calculator for language models and AI systems, including all calculators, features, and technical specifications.",
    url: "https://www.globalinflationcalculator.com/llms",
    about: {
      "@type": "Thing",
      name: "Global Inflation Calculator",
      description:
        "Comprehensive financial planning platform with 20+ calculators for inflation analysis across 8 currencies.",
    },
  }

  return (
    <>
      <JsonLd id="schema-breadcrumb" data={breadcrumbSchema} />
      <JsonLd id="schema-structured" data={structuredData} />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">LLM Context</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Complete documentation of Global Inflation Calculator for language models and AI systems
          </p>
        </header>

        <article className="prose prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <div className="text-gray-700 dark:text-gray-200 space-y-6 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {llmsContent}
          </div>
        </article>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Raw Text Version</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For direct integration with AI models and automated systems, access the raw text version:
          </p>
          <a
            href="/llms.txt"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download llms.txt
          </a>
        </div>
      </main>
    </>
  )
}
