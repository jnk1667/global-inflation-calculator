/**
 * EIA (Energy Information Administration) API Integration
 * Documentation: https://www.eia.gov/opendata/documentation.php
 * Browser: https://www.eia.gov/opendata/browser/
 */

const EIA_API_KEY = process.env.EIA_API_KEY
const EIA_BASE_URL = "https://api.eia.gov/v2"

export interface EIAGasolinePrice {
  period: string // Date in YYYY-MM-DD format
  price: number // Price per gallon in USD
  product: string // Product name (Regular, Premium, Diesel)
  area: string // Geographic area
}

export interface EIACrudeOilPrice {
  period: string
  price: number // Price per barrel in USD
  grade: string // WTI or Brent
}

export interface EIANaturalGasPrice {
  period: string
  price: number // Price per thousand cubic feet
  sector: string // Residential, Commercial, Industrial, etc.
}

export interface EIAElectricityPrice {
  period: string
  price: number // Price per kilowatt-hour
  sector: string // Residential, Commercial, Industrial, etc.
}

export interface EIAEnergyData {
  gasoline: EIAGasolinePrice[]
  crudeOil: EIACrudeOilPrice[]
  naturalGas: EIANaturalGasPrice[]
  electricity: EIAElectricityPrice[]
}

/**
 * Fetch gasoline prices (Regular, Premium, Diesel)
 * Returns weekly or monthly retail prices
 */
export async function getGasolinePrices(
  params: {
    product?: "regular" | "premium" | "diesel" | "all"
    area?: "US" | string // US national average or state code
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
    frequency?: "weekly" | "monthly" | "annual"
  } = {},
): Promise<EIAGasolinePrice[]> {
  if (!EIA_API_KEY) {
    console.warn("EIA_API_KEY not configured")
    return []
  }

  try {
    const { product = "regular", area = "US", startDate, endDate, frequency = "monthly" } = params

    // EIA Series IDs for gasoline prices
    const seriesIds: Record<string, string> = {
      regular: `PET.EMM_EPMR_PTE_NUS_DPG.${frequency === "monthly" ? "M" : frequency === "weekly" ? "W" : "A"}`,
      premium: `PET.EMM_EPMP_PTE_NUS_DPG.${frequency === "monthly" ? "M" : frequency === "weekly" ? "W" : "A"}`,
      diesel: `PET.EMD_EPD2D_PTE_NUS_DPG.${frequency === "monthly" ? "M" : frequency === "weekly" ? "W" : "A"}`,
    }

    const seriesId = product === "all" ? Object.values(seriesIds) : [seriesIds[product]]

    const responses = await Promise.all(
      seriesId.map(async (id) => {
        const url = new URL(`${EIA_BASE_URL}/petroleum/pri/gnd/data/`)
        url.searchParams.append("api_key", EIA_API_KEY!)
        url.searchParams.append("frequency", frequency)
        url.searchParams.append("data[0]", "value")
        url.searchParams.append(
          "facets[product][]",
          product === "regular" ? "EPM0" : product === "premium" ? "EPMP" : "EPD2D",
        )
        url.searchParams.append("facets[area][]", area)
        url.searchParams.append("sort[0][column]", "period")
        url.searchParams.append("sort[0][direction]", "desc")
        url.searchParams.append("offset", "0")
        url.searchParams.append("length", "5000")

        if (startDate) {
          url.searchParams.append("start", startDate)
        }
        if (endDate) {
          url.searchParams.append("end", endDate)
        }

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error(`EIA API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.response?.data || []
      }),
    )

    const allData = responses.flat()

    return allData.map((item: any) => ({
      period: item.period,
      price: Number.parseFloat(item.value),
      product: item.product === "EPM0" ? "Regular" : item.product === "EPMP" ? "Premium" : "Diesel",
      area: item.area || area,
    }))
  } catch (error) {
    console.error("Error fetching EIA gasoline prices:", error)
    return []
  }
}

/**
 * Fetch crude oil prices (WTI and Brent)
 */
export async function getCrudeOilPrices(
  params: {
    grade?: "wti" | "brent" | "both"
    startDate?: string
    endDate?: string
    frequency?: "daily" | "weekly" | "monthly" | "annual"
  } = {},
): Promise<EIACrudeOilPrice[]> {
  if (!EIA_API_KEY) {
    console.warn("EIA_API_KEY not configured")
    return []
  }

  try {
    const { grade = "wti", frequency = "monthly", startDate, endDate } = params

    // WTI Cushing, OK Spot Price
    const wtiSeriesId = `PET.RWTC.${frequency === "daily" ? "D" : frequency === "weekly" ? "W" : frequency === "monthly" ? "M" : "A"}`
    // Brent Europe Spot Price
    const brentSeriesId = `PET.RBRTE.${frequency === "daily" ? "D" : frequency === "weekly" ? "W" : frequency === "monthly" ? "M" : "A"}`

    const seriesIds =
      grade === "both" ? [wtiSeriesId, brentSeriesId] : grade === "wti" ? [wtiSeriesId] : [brentSeriesId]

    const responses = await Promise.all(
      seriesIds.map(async (seriesId) => {
        const url = new URL(`${EIA_BASE_URL}/petroleum/pri/spt/data/`)
        url.searchParams.append("api_key", EIA_API_KEY!)
        url.searchParams.append("frequency", frequency)
        url.searchParams.append("data[0]", "value")
        url.searchParams.append("facets[product][]", seriesId.includes("RWTC") ? "EPCWTI" : "EPCBRENT")
        url.searchParams.append("sort[0][column]", "period")
        url.searchParams.append("sort[0][direction]", "desc")
        url.searchParams.append("offset", "0")
        url.searchParams.append("length", "5000")

        if (startDate) {
          url.searchParams.append("start", startDate)
        }
        if (endDate) {
          url.searchParams.append("end", endDate)
        }

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error(`EIA API error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
          data: data.response?.data || [],
          grade: seriesId.includes("RWTC") ? "WTI" : "Brent",
        }
      }),
    )

    return responses.flatMap((resp) =>
      resp.data.map((item: any) => ({
        period: item.period,
        price: Number.parseFloat(item.value),
        grade: resp.grade,
      })),
    )
  } catch (error) {
    console.error("Error fetching EIA crude oil prices:", error)
    return []
  }
}

/**
 * Fetch natural gas prices
 */
export async function getNaturalGasPrices(
  params: {
    sector?: "residential" | "commercial" | "industrial" | "all"
    startDate?: string
    endDate?: string
    frequency?: "monthly" | "annual"
  } = {},
): Promise<EIANaturalGasPrice[]> {
  if (!EIA_API_KEY) {
    console.warn("EIA_API_KEY not configured")
    return []
  }

  try {
    const { sector = "residential", frequency = "monthly", startDate, endDate } = params

    const url = new URL(`${EIA_BASE_URL}/natural-gas/pri/sum/data/`)
    url.searchParams.append("api_key", EIA_API_KEY!)
    url.searchParams.append("frequency", frequency)
    url.searchParams.append("data[0]", "value")
    url.searchParams.append("facets[process][]", "PRS")
    url.searchParams.append("sort[0][column]", "period")
    url.searchParams.append("sort[0][direction]", "desc")
    url.searchParams.append("offset", "0")
    url.searchParams.append("length", "5000")

    if (startDate) {
      url.searchParams.append("start", startDate)
    }
    if (endDate) {
      url.searchParams.append("end", endDate)
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`EIA API error: ${response.statusText}`)
    }

    const data = await response.json()
    const results = data.response?.data || []

    return results.map((item: any) => ({
      period: item.period,
      price: Number.parseFloat(item.value),
      sector: item.sector || "residential",
    }))
  } catch (error) {
    console.error("Error fetching EIA natural gas prices:", error)
    return []
  }
}

/**
 * Fetch electricity prices
 */
export async function getElectricityPrices(
  params: {
    sector?: "residential" | "commercial" | "industrial" | "all"
    state?: string // Two-letter state code or "US" for national
    startDate?: string
    endDate?: string
    frequency?: "monthly" | "annual"
  } = {},
): Promise<EIAElectricityPrice[]> {
  if (!EIA_API_KEY) {
    console.warn("EIA_API_KEY not configured")
    return []
  }

  try {
    const { sector = "residential", state = "US", frequency = "monthly", startDate, endDate } = params

    const url = new URL(`${EIA_BASE_URL}/electricity/retail-sales/data/`)
    url.searchParams.append("api_key", EIA_API_KEY!)
    url.searchParams.append("frequency", frequency)
    url.searchParams.append("data[0]", "price")
    url.searchParams.append("facets[stateid][]", state)
    url.searchParams.append(
      "facets[sectorid][]",
      sector === "residential" ? "RES" : sector === "commercial" ? "COM" : "IND",
    )
    url.searchParams.append("sort[0][column]", "period")
    url.searchParams.append("sort[0][direction]", "desc")
    url.searchParams.append("offset", "0")
    url.searchParams.append("length", "5000")

    if (startDate) {
      url.searchParams.append("start", startDate)
    }
    if (endDate) {
      url.searchParams.append("end", endDate)
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`EIA API error: ${response.statusText}`)
    }

    const data = await response.json()
    const results = data.response?.data || []

    return results.map((item: any) => ({
      period: item.period,
      price: Number.parseFloat(item.price),
      sector: item.sectorid === "RES" ? "Residential" : item.sectorid === "COM" ? "Commercial" : "Industrial",
    }))
  } catch (error) {
    console.error("Error fetching EIA electricity prices:", error)
    return []
  }
}

/**
 * Helper function to get the latest energy prices for all categories
 */
export async function getLatestEnergyPrices(): Promise<{
  gasoline: number | null
  diesel: number | null
  crudeOil: number | null
  naturalGas: number | null
  electricity: number | null
}> {
  try {
    const [gasoline, diesel, crude, gas, electric] = await Promise.all([
      getGasolinePrices({ product: "regular" }),
      getGasolinePrices({ product: "diesel" }),
      getCrudeOilPrices({ grade: "wti" }),
      getNaturalGasPrices({ sector: "residential" }),
      getElectricityPrices({ sector: "residential" }),
    ])

    return {
      gasoline: gasoline[0]?.price || null,
      diesel: diesel[0]?.price || null,
      crudeOil: crude[0]?.price || null,
      naturalGas: gas[0]?.price || null,
      electricity: electric[0]?.price || null,
    }
  } catch (error) {
    console.error("Error fetching latest energy prices:", error)
    return {
      gasoline: null,
      diesel: null,
      crudeOil: null,
      naturalGas: null,
      electricity: null,
    }
  }
}

/**
 * Get historical energy price data for inflation comparison
 */
export async function getHistoricalEnergyPrices(
  startYear: number,
  endYear: number,
): Promise<{
  gasoline: EIAGasolinePrice[]
  crudeOil: EIACrudeOilPrice[]
  naturalGas: EIANaturalGasPrice[]
  electricity: EIAElectricityPrice[]
}> {
  const startDate = `${startYear}-01-01`
  const endDate = `${endYear}-12-31`

  const [gasoline, crude, gas, electric] = await Promise.all([
    getGasolinePrices({
      product: "regular",
      startDate,
      endDate,
      frequency: "annual",
    }),
    getCrudeOilPrices({ grade: "wti", startDate, endDate, frequency: "annual" }),
    getNaturalGasPrices({ sector: "residential", startDate, endDate, frequency: "annual" }),
    getElectricityPrices({ sector: "residential", startDate, endDate, frequency: "annual" }),
  ])

  return {
    gasoline,
    crudeOil: crude,
    naturalGas: gas,
    electricity: electric,
  }
}
