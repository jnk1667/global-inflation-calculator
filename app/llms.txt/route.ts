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
- deflation calculator, deflationary assets, gold silver calculator
- precious metals appreciation, commodity price calculator
- student loan calculator, loan repayment calculator, income-driven repayment
- mortgage calculator, home loan calculator, mortgage payment calculator
- emergency fund calculator, emergency savings calculator, recession preparation
- 3 month emergency fund, 6 month emergency fund, financial safety net
- economic uncertainty 2025, recession planning, emergency savings goal

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

- **Deflation Calculator (/deflation-calculator)**
  - URL: https://www.globalinflationcalculator.com/deflation-calculator
  - Purpose: Calculate appreciation of deflationary assets (gold, silver, Bitcoin)
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
  <title>Site Documentation and Guide - Global Inflation Calculator</title>
  <meta name="description" content="Comprehensive documentation for the Global Inflation Calculator platform. Learn about our inflation calculators, data sources, methodology, and financial planning tools including retirement, salary, and student loan calculators.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.globalinflationcalculator.com/llms.txt">
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
  </style>
</head>
<body>
  <pre>${plainTextContent}</pre>
</body>
</html>`

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } else {
    return new NextResponse(plainTextContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}
