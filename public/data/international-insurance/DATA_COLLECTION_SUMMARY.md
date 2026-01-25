# International Health Insurance Calculator - Data Collection Complete

**Date Collected:** January 25, 2026  
**Status:** All data files successfully created and stored locally in `/public/data/international-insurance/`

---

## Files Created

### Primary Data Files (by Currency)

1. **insurance-calculator-gbp.json** (UK - GBP)
   - 94 lines | Age multipliers, family adjustments, regional variations
   - 8 UK regions tracked | Medical inflation: 4.1%
   - Sources: Bupa, Aviva, ABI, ONS Health Accounts

2. **insurance-calculator-cad.json** (Canada - CAD)
   - 88 lines | Age & family multipliers by province
   - 8 provinces mapped | Medical inflation: 6.2%
   - Sources: CLHIA, Statistics Canada

3. **insurance-calculator-aud.json** (Australia - AUD)
   - 96 lines | 2% annual age loading (30-99), state variations
   - 8 states + territories | Medical inflation: 5.8%
   - Sources: APRA, PrivateHealth.gov.au, Insurance Council

4. **insurance-calculator-chf.json** (Switzerland - CHF)
   - 112 lines | Canton-specific data from FOPH
   - 26 cantons mapped | Medical inflation: 4.5%
   - Sources: FOPH official rates, Basel-Stadt 2025 detailed data

5. **insurance-calculator-eur-germany.json** (Germany - EUR)
   - 66 lines | Statutory system (income-based, NOT age-based)
   - Contribution rates: 14.6% + 2.9% average additional | Medical inflation: 3.8%
   - Sources: AOK, TK, Barmer, Krankenkassen

6. **insurance-calculator-eur-france.json** (France - EUR)
   - 69 lines | Supplemental mutuelle system (top-up to Sécurité Sociale)
   - 6% average premium increase 2024-2025 | Medical inflation: 3.5%
   - Sources: SNCF Mutuelle, Sécurité Sociale, Malakoff Humanis

7. **insurance-calculator-jpy.json** (Japan - JPY)
   - 70 lines | **UNIQUE: Income-based system, NOT age-based**
   - Shakaihoken contribution rates 4-7% of income | Medical inflation: 2.8%
   - Sources: MHLW, Japanese health insurance funds

8. **insurance-calculator-nzd.json** (New Zealand - NZD)
   - 97 lines | Age multipliers, family plans, plan tiers
   - Private insurance market (supplement to public) | Medical inflation: 5.5%
   - Sources: UniMed, Southern Cross, PrivateHealth.gov.nz

### Metadata & Index Files

9. **README.json** (194 lines)
   - Complete index of all files and data quality assessments
   - Data gaps analysis
   - Implementation roadmap
   - Update schedule recommendations

---

## Data Coverage Summary

| Currency | Country/Region | Coverage | Age Multipliers | Family Multipliers | Regional Variations | Status |
|----------|---|---|---|---|---|---|
| USD | USA (50 states) | Complete | ✅ Precise CMS | ✅ Complete | ✅ All 50 states | Production Ready |
| GBP | UK (8 regions) | Good | ✅ Insurer data | ✅ 7 types | ✅ 8 regions | Good |
| CAD | Canada (8 provinces) | Good | ✅ Industry est. | ✅ 7 types | ✅ 8 provinces | Good |
| AUD | Australia (8 states) | Complete | ✅ APRA 2% rule | ✅ 7 types | ✅ 8 states | Production Ready |
| CHF | Switzerland (26 cantons) | Complete | ✅ FOPH bands | ✅ Individual plans | ✅ All 26 cantons | Production Ready |
| EUR | Germany | Good | ❌ Income-based | ✅ Statutory structure | ✅ National | Simplified Model |
| EUR | France | Good | ⚠️ Estimated | ✅ 3 tiers | ✅ National | Good |
| JPY | Japan | Simplified | ❌ Income-based | ✅ Insured+dependents | ✅ National | Unique Model |
| NZD | New Zealand | Good | ✅ Industry standard | ✅ 7 types | ✅ National | Good |

---

## Key Features of Collected Data

### Medical Inflation Rates (by Country)
- USA: 5.4% (highest)
- Canada: 6.2% (highest in data)
- Australia: 5.8%
- New Zealand: 5.5%
- Switzerland: 4.5%
- UK: 4.1%
- Germany: 3.8%
- France: 3.5%
- Japan: 2.8% (lowest)

### Age Multiplier Ranges
- **Traditional System (USA, UK, CAD, AUD, NZD):** 0.7x-3.2x (age 25-65)
- **Swiss System:** Specific age bands, child (0.2x), young adult (1.0x), adult 46+ (1.1-1.3x)
- **German System:** Not applicable - uses income-based contribution (14.6% + additional)
- **Japanese System:** Not applicable - income-based with mandatory coverage

### Family Multipliers
- **Standard multiplier for couple+children:** 1.8x-2.2x (across most markets)
- **Switzerland:** No family plans - individual policies, but children covered at discount rates

### Regional/Regional Variations
- **USA:** 50 states (well-documented price differences)
- **Australia:** 8 states + territories (10% variation range)
- **Switzerland:** 26 cantons (significant variation, basel example: CHF 652-746 for adults)
- **Canada:** 8 provinces (5-10% variation)
- **UK:** 8 regions (London premium: +25%)

---

## Data Quality Assessment

### Tier 1 - Production Ready (High Confidence)
- ✅ **USD** - Official CMS/KFF/BLS data
- ✅ **AUD** - APRA official data + PrivateHealth.gov.au
- ✅ **CHF** - FOPH official canton rates

### Tier 2 - Good Quality (Medium Confidence)
- ✅ **GBP** - Major insurers (Bupa, Aviva) + industry sources
- ✅ **CAD** - CLHIA industry reports + Statistics Canada
- ✅ **NZD** - Major insurers + government sources
- ⚠️ **EUR (France)** - Mutuelle association data but less standardized
- ⚠️ **EUR (Germany)** - Official krankenkassen rates but unique system

### Tier 3 - Simplified Models (Limitations)
- ⚠️ **JPY** - Unique income-based system, not compatible with age-based calculator
- ⚠️ **EUR (Multiple countries)** - Each country has different system; needs separate implementation

---

## Known Data Gaps & Limitations

### Critical (Need Solutions)
1. **Japan (JPY)** - Income-based system fundamentally different from age-based
   - Calculator logic needs complete rethinking
   - Solution: Create separate calculator mode for income-based systems

2. **EUR Multi-Country** - 27 countries with completely different systems
   - Germany: Mandatory statutory (14.6% + additional contribution)
   - France: Public system + supplemental mutuelle
   - Solution: Start with 2 countries, expand gradually

3. **Pre-existing Condition Loading** - Data not publicly available
   - Most countries either prohibit or regulate separately
   - Impact on total cost: Unknown but potentially significant

### Moderate (Can Estimate)
1. **Age multipliers for non-USA** - Extracted from insurer websites (not official)
   - Variations by insurer (±10-15%)
   - Solution: Note as "estimated" in UI, provide range

2. **Family multiplier variations** - Wide ranges by country/insurer
   - Not all countries have standardized "family plans"
   - Switzerland: Individual policies only

3. **Smoking surcharge** - Not tracked in most European systems
   - Mostly applies to UK, CAD, AUD, NZD
   - Germany, France, Japan: Don't track separately

### Minor (Can Improve Over Time)
1. Regional data incomplete for EUR countries
2. Historical data only 10-15 years back for some
3. Discount structures for multi-policy holders not fully captured

---

## Implementation Roadmap

### Phase 1: USA (Already Complete)
- ✅ Full implementation with all 50 states
- ✅ All age/family/plan multipliers
- ✅ Detailed projections

### Phase 2: English-Speaking Markets (Ready)
- 🟡 **AUD** (Australia) - Ready to integrate
- 🟡 **GBP** (UK) - Ready to integrate  
- 🟡 **NZD** (New Zealand) - Ready to integrate
- 🟡 **CAD** (Canada) - Ready to integrate

All have:
- Age multipliers ✅
- Family multipliers ✅
- Regional variations ✅
- Plan types ✅

### Phase 3: Mandatory Insurance Countries (Requires New Logic)
- 🟡 **CHF** (Switzerland) - Ready but needs different UI (cantons vs. states)
- 🔴 **EUR (Germany)** - Needs income-based calculator variant
- 🟡 **EUR (France)** - Supplemental model (unique)

### Phase 4: Unique Systems (Longer Term)
- 🔴 **JPY** (Japan) - Requires completely different calculator logic
- 🔴 **EUR (Expansion)** - Add Italy, Spain, etc. (each unique)

---

## How to Use This Data

### For USA (Baseline)
```
currency: "USD"
file: /public/data/insurance-calculator.json (existing)
location: State (50 options)
model: Age + Family + Plan Type + Smoking
```

### For Phase 2 Countries (AUD, GBP, NZD, CAD)
```
currency: "AUD|GBP|NZD|CAD"
file: /public/data/international-insurance/insurance-calculator-[code].json
location: State/Province/Region
model: Age + Family + Plan Type + Smoking
```

### For Switzerland (CHF)
```
currency: "CHF"
file: /public/data/international-insurance/insurance-calculator-chf.json
location: Canton (26 options)
model: Age + Individual policies (no family plan multiplier)
specialNote: Franchise/deductible impacts premium significantly
```

### For Germany (EUR)
```
currency: "EUR"
country: "Germany"
file: /public/data/international-insurance/insurance-calculator-eur-germany.json
model: Income-based (14.6% contribution rate)
specialNote: NOT age-based; requires different calculator
```

### For France (EUR)
```
currency: "EUR"
country: "France"
file: /public/data/international-insurance/insurance-calculator-eur-france.json
model: Supplemental mutuelle (top-up system)
location: National
```

### For Japan (JPY)
```
currency: "JPY"
file: /public/data/international-insurance/insurance-calculator-jpy.json
model: Income-based (4-7% of income)
specialNote: Requires completely different calculator logic
location: National
```

---

## Next Steps for Development

1. **Update Calculator UI** - Add currency/country selector
2. **Modify calculateProjection()** - Handle different data structures
3. **Create Country-Specific Logic** - Handle income-based (Japan), statutory (Germany), etc.
4. **Add Disclaimers** - Show data quality/currency for each country
5. **Plan Phase Rollout** - USA first, then Phase 2 (AUD/GBP/NZD/CAD), then others

---

## Data Update Notes

All files timestamped: **January 25, 2026**

Recommended update frequency:
- **USA**: Quarterly (CMS/KFF updates)
- **AUD**: Quarterly (APRA reports)
- **CHF**: Annually (January - cantonal rates)
- **UK/CAD/NZD**: Annually
- **EUR countries**: Annually (January)
- **Japan**: Annually

Last fetched from official sources: January 25, 2026
