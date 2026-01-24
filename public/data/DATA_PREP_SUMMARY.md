# Insurance Inflation Calculator - Data Preparation Complete

## ✅ DATA STATUS: READY FOR IMPLEMENTATION

### Updated Files:
1. **healthcare-deep-dive.json** 
   - Extended with 2026-2035 projections (10 years of data)
   - Updated lastUpdated to 2026-01-24
   - Insurance premiums project from $34,525/year (2025) to $59,095/year (2035)

2. **healthcare-inflation.json**
   - Added 2025-2026 annual healthcare vs general inflation rates
   - 2026: 5.4% healthcare inflation vs 2.7% general inflation
   - Updated lastUpdated to 2026-01-24

### New Files Created:
3. **insurance-calculator.json** (NEW - COMPREHENSIVE)
   - **Age Multipliers**: 18-64 with granular adjustments (0.65x at 18, peaks at 2.74x at 64)
   - **Family Size Adjustments**: Individual through 5+ family members
   - **Plan Type Multipliers**: Catastrophic (0.55x) to Platinum (1.55x) relative to Silver
   - **State Premium Variations**: All 50 states + DC with 2025 baseline premiums ($368-$495/month)
   - **Smoking Multipliers**: 50% premium increase for smokers
   - **Employer vs Individual Comparison**: Data for cost context
   - **Subsidy Eligibility**: 2026 Federal Poverty Levels for all household sizes
   - **Historical Growth Rates**: 4.5%-6.8% annual growth 2020-2026
   - **Projection Assumptions**: Clear methodology for forward calculations

### Data Coverage:
- ✅ Age-based calculations (18-64)
- ✅ Family composition adjustments
- ✅ All ACA plan metal levels
- ✅ Geographic variation (all 50 states)
- ✅ Tobacco use impact
- ✅ Historical trends (1990-2025)
- ✅ Forward projections (2026-2035)
- ✅ Subsidy context for low-income families
- ✅ Employer coverage context

### Ready to Build:
- Core calculation engine can now calculate premiums for any combination of:
  - Age (18-64)
  - Family size (1-5+ members)
  - Plan type (Catastrophic-Platinum)
  - State (all 50 states + DC)
  - Smoking status (Yes/No)
  - Years into future (2026-2035)

All data is sourced from CMS, KFF, Healthcare.gov, and DHS with 2025 baseline and 2026 projections.
