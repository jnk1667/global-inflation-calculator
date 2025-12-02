// This replaces the JSON file import which doesn't work in this environment

export const treasuryData = {
  latest_year: 2025,
  data: {
    2025: {
      treasury_bills_3m: 4.38,
      treasury_bills_6m: 4.42,
      treasury_bills_1y: 4.45,
      treasury_notes_2y: 4.28,
      treasury_notes_3y: 4.22,
      treasury_notes_5y: 4.18,
      treasury_notes_7y: 4.25,
      treasury_notes_10y: 4.48,
      treasury_bonds_20y: 4.82,
      treasury_bonds_30y: 4.71,
    },
    2024: {
      treasury_bills_3m: 5.21,
      treasury_bills_6m: 5.18,
      treasury_bills_1y: 4.95,
      treasury_notes_2y: 4.52,
      treasury_notes_3y: 4.38,
      treasury_notes_5y: 4.28,
      treasury_notes_7y: 4.35,
      treasury_notes_10y: 4.58,
      treasury_bonds_20y: 4.92,
      treasury_bonds_30y: 4.78,
    },
    2023: {
      treasury_bills_3m: 5.42,
      treasury_bills_6m: 5.48,
      treasury_bills_1y: 5.35,
      treasury_notes_2y: 4.88,
      treasury_notes_3y: 4.52,
      treasury_notes_5y: 4.38,
      treasury_notes_7y: 4.42,
      treasury_notes_10y: 4.65,
      treasury_bonds_20y: 5.02,
      treasury_bonds_30y: 4.88,
    },
  },
  savings_bonds: {
    series_i: {
      data: {
        2025: {
          composite_rate: 4.52,
          fixed_rate: 1.2,
          inflation_rate: 3.32,
        },
        2024: {
          composite_rate: 4.28,
          fixed_rate: 1.3,
          inflation_rate: 2.98,
        },
        2023: {
          composite_rate: 5.27,
          fixed_rate: 0.9,
          inflation_rate: 4.37,
        },
      },
    },
    series_ee: {
      data: {
        2025: {
          fixed_rate: 2.7,
        },
        2024: {
          fixed_rate: 2.6,
        },
        2023: {
          fixed_rate: 2.5,
        },
      },
    },
  },
}

export type TreasuryData = typeof treasuryData
