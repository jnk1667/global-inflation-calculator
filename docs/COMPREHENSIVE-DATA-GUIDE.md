# Comprehensive Inflation Data Collection Guide

## Overview

This system collects comprehensive inflation data from multiple official sources to provide the most accurate and trustworthy inflation calculations available for free.

## Data Sources

### 🇺🇸 United States (FRED API)
- **Source**: Federal Reserve Economic Data (FRED)
- **API**: https://fred.stlouisfed.org/docs/api/
- **Data Series**:
  - Consumer Price Index (CPI) - All Urban Consumers
  - Chained CPI - Accounts for substitution effects
  - Personal Consumption Expenditures (PCE) - Fed's preferred measure
  - Core PCE - Excluding food and energy
  - Producer Price Index (PPI) - Wholesale prices
  - GDP Implicit Price Deflator
  - Trimmed Mean CPI - Cleveland Fed's measure
  - Housing Price Indices
  - Import/Export Price Indices

### 🇬🇧 United Kingdom (ONS API)
- **Source**: Office for National Statistics
- **API**: https://api.ons.gov.uk/
- **Data Series**:
  - Consumer Price Index (CPI)
  - Retail Price Index (RPI)
  - CPI including Housing (CPIH)
  - Producer Price Indices (Input/Output)

### 🇪🇺 European Union (Estimated)
- **Source**: Eurostat estimates based on historical patterns
- **Data Series**:
  - Harmonized Index of Consumer Prices (HICP)
  - Core HICP (excluding energy and food)
  - Producer Price Index
  - Services and Goods components

### 🇨🇦 Canada (Estimated)
- **Source**: Statistics Canada estimates
- **Data Series**:
  - Consumer Price Index
  - Industrial Product Price Index
  - Core CPI measures

## Setup Instructions

### 1. Get FRED API Key (Required for US data)
```bash
# Run the setup script
node scripts/setup-fred-api.js

# Or manually:
# 1. Visit https://fred.stlouisfed.org/docs/api/api_key.html
# 2. Create free account and get API key
# 3. Set environment variable:
export FRED_API_KEY=your_api_key_here
```

### 2. Collect All Data
```bash
# This will collect all comprehensive inflation data
node scripts/fetch-comprehensive-inflation-data.js
```

### 3. Validate Data
```bash
# Validate the collected data
node scripts/validate-comprehensive-data.js
```

## Data Structure

Each data file follows this structure:

```json
{
  "metadata": {
    "series_id": "cpi_all",
    "title": "Consumer Price Index for All Urban Consumers",
    "units": "Index (1982-84=100)",
    "frequency": "Monthly",
    "source": "Federal Reserve Economic Data (FRED)",
    "last_updated": "2025-01-15T10:30:00Z"
  },
  "data": {
    "2020": {
      "index_value": 258.811,
      "inflation_factor": 2.588,
      "year_over_year_change": 1.23
    },
    "2021": {
      "index_value": 270.970,
      "inflation_factor": 2.710,
      "year_over_year_change": 4.70
    }
  },
  "earliest_year": "1947",
  "latest_year": "2025",
  "total_years": 78
}
```

## Available Inflation Measures

### Consumer Price Measures
- **CPI**: Traditional consumer price index
- **Chained CPI**: Accounts for consumer substitution
- **Core CPI**: Excludes volatile food and energy
- **Trimmed Mean CPI**: Removes extreme price changes

### Producer Price Measures  
- **PPI**: Producer/wholesale prices
- **PPI Finished Goods**: Final products
- **PPI Intermediate**: Raw materials and components

### Broader Economic Measures
- **PCE**: Personal Consumption Expenditures (Fed's preferred)
- **GDP Deflator**: Broadest measure of price changes
- **Import/Export Prices**: International trade effects

## Data Quality & Accuracy

### Advantages over Basic CPI
1. **Multiple Measures**: Compare different inflation methodologies
2. **Substitution Effects**: Chained CPI accounts for consumer behavior
3. **Core Measures**: Remove volatile components for trend analysis
4. **Producer Prices**: Leading indicator of consumer inflation
5. **Official Sources**: Direct from government statistical agencies

### Data Validation
- Automatic validation of data structure
- Cross-reference with multiple sources
- Historical consistency checks
- Missing data detection and reporting

## Usage Examples

### Basic Inflation Calculation
```javascript
// Load comprehensive US CPI data
const cpiData = require('./public/data/comprehensive/us-cpi_all.json')

// Calculate inflation from 2020 to 2024
const factor2020 = cpiData.data['2020'].inflation_factor
const factor2024 = cpiData.data['2024'].inflation_factor
const inflationFactor = factor2024 / factor2020

console.log(`$100 in 2020 = $${(100 * inflationFactor).toFixed(2)} in 2024`)
```

### Compare Different Measures
```javascript
// Compare CPI vs PCE vs GDP Deflator
const cpi = require('./public/data/comprehensive/us-cpi_all.json')
const pce = require('./public/data/comprehensive/us-pce_core.json')
const gdp = require('./public/data/comprehensive/us-gdp_deflator.json')

// All measures for 2020-2024 period
const measures = { cpi, pce, gdp }
Object.entries(measures).forEach(([name, data]) => {
  const inflation = (data.data['2024'].inflation_factor / data.data['2020'].inflation_factor - 1) * 100
  console.log(`${name.toUpperCase()}: ${inflation.toFixed(1)}% total inflation`)
})
```

## File Organization

```
public/data/comprehensive/
├── collection-summary.json          # Collection metadata
├── validation-report.json           # Data validation results
├── us-cpi_all.json                 # US CPI All Urban Consumers
├── us-cpi_chained.json             # US Chained CPI
├── us-pce_all.json                 # US PCE Price Index
├── us-pce_core.json                # US Core PCE
├── us-ppi_all.json                 # US Producer Price Index
├── us-gdp_deflator.json            # US GDP Deflator
├── us-cpi_trimmed_mean.json        # US Trimmed Mean CPI
├── uk-cpi.json                     # UK Consumer Price Index
├── uk-rpi.json                     # UK Retail Price Index
├── uk-cpih.json                    # UK CPI including Housing
├── eur-hicp.json                   # EUR Harmonized CPI
├── eur-core_hicp.json              # EUR Core HICP
├── cad-cpi.json                    # CAD Consumer Price Index
└── cad-ppi.json                    # CAD Industrial Product Price Index
```

## Integration with Website

The comprehensive data can be integrated into the website to provide:

1. **Multiple Inflation Measures**: Let users choose CPI, PCE, GDP Deflator, etc.
2. **More Accurate Calculations**: Use the most appropriate measure for each use case
3. **Educational Content**: Explain differences between measures
4. **Advanced Features**: Trend analysis, forecasting, regional variations
5. **Trust & Authority**: Official government data sources

## Maintenance

### Automated Updates
- Set up cron jobs to update data monthly
- Monitor API changes and data availability
- Validate new data automatically
- Alert on collection failures

### Manual Maintenance
- Review and update estimated data annually
- Add new data series as they become available
- Improve data processing algorithms
- Expand to additional countries/currencies

## Next Steps

1. **Run the collection scripts** to gather all data
2. **Validate the data** to ensure quality
3. **Integrate into website** with new UI components
4. **Add educational content** explaining different measures
5. **Set up automated updates** for ongoing maintenance

This comprehensive approach will make your inflation calculator the most accurate and trustworthy free tool available online.
