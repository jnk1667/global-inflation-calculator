"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  TrendingUp,
  Coins,
  Zap,
  Fuel,
  Gem,
  Bitcoin,
  Shield,
  BookOpen,
  Calculator,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import FAQ from "@/components/faq"
import { getCryptoHistoricalPrices } from "@/lib/api/coingecko-api"
import { getCommodityPrice } from "@/lib/api/alphavantage-api"

export default function DeflationCalculatorPage() {
  const [amount, setAmount] = useState("1000")
  const [startYear, setStartYear] = useState("2015")
  const [endYear, setEndYear] = useState("2025")
  const [selectedAsset, setSelectedAsset] = useState("bitcoin")
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(false)
  const [liveDataStatus, setLiveDataStatus] = useState<Record<string, boolean>>({})
  const [priceData, setPriceData] = useState<any>(null)

  const mockData = {
    bitcoin: {
      2010: 0.08,
      2011: 5,
      2012: 13,
      2013: 770,
      2014: 320,
      2015: 430,
      2016: 960,
      2017: 13850,
      2018: 3740,
      2019: 7200,
      2020: 29000,
      2021: 47000,
      2022: 16500,
      2023: 42000,
      2024: 67000,
      2025: 95000,
    },
    ethereum: {
      2015: 0.75,
      2016: 8,
      2017: 730,
      2018: 130,
      2019: 130,
      2020: 600,
      2021: 4000,
      2022: 1200,
      2023: 2300,
      2024: 3500,
      2025: 4200,
    },
    gold: {
      1985: 280,
      1990: 445,
      1995: 1225,
      2000: 250,
      2005: 445,
      2010: 1225,
      2015: 1060,
      2016: 1250,
      2017: 1257,
      2018: 1268,
      2019: 1393,
      2020: 1800,
      2021: 1900,
      2022: 1950,
      2023: 2000,
      2024: 2100,
      2025: 2150,
    },
    silver: {
      1997: 5,
      2000: 7,
      2005: 20,
      2010: 14,
      2015: 17,
      2016: 17,
      2017: 15,
      2018: 16,
      2019: 24,
      2020: 26,
      2021: 21,
      2022: 25,
      2023: 28,
      2024: 30,
      2025: 32,
    },
    oil: {
      1986: 28,
      1990: 56,
      1995: 80,
      2000: 48,
      2005: 43,
      2010: 51,
      2015: 65,
      2016: 57,
      2017: 40,
      2018: 70,
      2019: 95,
      2020: 75,
      2021: 85,
      2022: 78,
      2023: 80,
      2024: 90,
      2025: 92,
    },
  }

  const assetYearRanges = {
    bitcoin: { start: 2010, end: 2025 },
    ethereum: { start: 2015, end: 2025 },
    gold: { start: 1985, end: 2025 },
    silver: { start: 1997, end: 2025 },
    oil: { start: 1986, end: 2025 },
  }

  const assetInfo = {
    bitcoin: {
      name: "Bitcoin",
      icon: Bitcoin,
      color: "hsl(var(--deflation-primary))",
      mechanism: "21M Hard Cap + Halving Events",
      description: "Fixed supply with decreasing issuance every 4 years",
    },
    ethereum: {
      name: "Ethereum",
      icon: Zap,
      color: "hsl(45 93% 47%)",
      mechanism: "EIP-1559 Fee Burns",
      description: "Transaction fees burned, reducing total supply",
    },
    gold: {
      name: "Gold",
      icon: Gem,
      color: "hsl(45 93% 47%)",
      mechanism: "Finite Mining Reserves",
      description: "Limited geological deposits with increasing extraction costs",
    },
    silver: {
      name: "Silver",
      icon: Coins,
      color: "hsl(0 0% 75%)",
      mechanism: "Industrial Demand + Scarcity",
      description: "High industrial usage with limited supply",
    },
    oil: {
      name: "Crude Oil",
      icon: Fuel,
      color: "hsl(0 0% 20%)",
      mechanism: "Depleting Reserves",
      description: "Finite fossil fuel reserves with extraction challenges",
    },
  }

  const getAvailableYears = (assetKey: string) => {
    const range = assetYearRanges[assetKey as keyof typeof assetYearRanges]
    const years = []
    for (let year = range.start; year <= range.end; year++) {
      years.push(year)
    }
    return years
  }

  useEffect(() => {
    const range = assetYearRanges[selectedAsset as keyof typeof assetYearRanges]
    const currentStart = Number.parseInt(startYear)
    const currentEnd = Number.parseInt(endYear)

    if (currentStart < range.start) {
      setStartYear(range.start.toString())
    }
    if (currentEnd > range.end) {
      setEndYear(range.end.toString())
    }
    if (currentStart < range.start && currentEnd > range.end) {
      setStartYear(range.start.toString())
      setEndYear(range.end.toString())
    }
  }, [selectedAsset])

  const calculatePurchasingPower = () => {
    const asset = priceData
      ? priceData[selectedAsset as keyof typeof priceData]
      : mockData[selectedAsset as keyof typeof mockData]
    if (!asset) return

    const startPrice = asset[Number.parseInt(startYear) as keyof typeof asset]
    const endPrice = asset[Number.parseInt(endYear) as keyof typeof asset]

    // Check if prices exist for selected years
    if (startPrice === undefined || endPrice === undefined) {
      console.log("[v0] Price data not available for selected years")
      return
    }

    const initialAmount = Number.parseFloat(amount)
    if (isNaN(initialAmount) || initialAmount <= 0) {
      console.log("[v0] Invalid amount")
      return
    }

    const units = initialAmount / startPrice
    const finalValue = units * endPrice
    const growth = ((finalValue - initialAmount) / initialAmount) * 100

    setCalculationResult({
      initialAmount,
      finalValue,
      growth,
      units,
      startPrice,
      endPrice,
    })
  }

  useEffect(() => {
    calculatePurchasingPower()
  }, [amount, startYear, endYear, selectedAsset])

  useEffect(() => {
    const loadBlogContent = async () => {
      try {
        const { data, error } = await supabase
          .from("seo_content")
          .select("content")
          .eq("id", "deflation_essay")
          .single()

        if (error || !data?.content) {
          console.log("Using default blog content")
          setBlogContent(
            `Understanding deflationary assets is crucial for modern wealth preservation. Unlike traditional fiat currencies that lose purchasing power over time due to inflation, deflationary assets are designed to maintain or increase their value through scarcity mechanisms.

Bitcoin, often called "digital gold," has a fixed supply of 21 million coins. This hard cap, combined with halving events that reduce new supply every four years, creates a deflationary monetary system. As adoption grows and supply remains constrained, the purchasing power of Bitcoin has historically increased dramatically.

Ethereum introduced a revolutionary fee-burning mechanism through EIP-1559. When network activity is high, more ETH is burned than created, making it deflationary. This ties the asset's scarcity directly to its utility and adoption.

Traditional precious metals like gold and silver have served as stores of value for millennia. Their scarcity comes from geological limits - there's only so much gold in the Earth's crust, and extraction becomes increasingly difficult and expensive. Industrial demand for silver often exceeds new supply, creating additional scarcity pressure.

The key to understanding deflationary assets is recognizing the inverse relationship between supply constraints and purchasing power. While fiat currencies can be printed infinitely, leading to devaluation, deflationary assets have built-in mechanisms that prevent oversupply. This fundamental difference makes them powerful tools for wealth preservation.

When comparing deflationary assets to cash, the contrast is stark. A dollar today buys less than it did a decade ago due to inflation. Meanwhile, deflationary assets have generally appreciated, not just maintaining but growing purchasing power. This makes them essential components of a diversified portfolio designed to preserve wealth across generations.

However, it's important to note that deflationary assets can be volatile in the short term. Their long-term value proposition comes from scarcity and growing adoption, but prices can fluctuate significantly. Investors should consider their time horizon and risk tolerance when allocating to these assets.

The rise of digital deflationary assets represents a paradigm shift in how we think about money and value storage. For the first time in history, we have programmable scarcity - assets whose supply constraints are enforced by mathematics and code rather than physical limitations or central authority promises.`,
          )
          setBlogLoading(false)
          return
        }

        setBlogContent(data.content)
      } catch (err) {
        console.log("Error loading blog content:", err)
        setBlogContent(
          `Understanding deflationary assets is crucial for modern wealth preservation. Unlike traditional fiat currencies that lose purchasing power over time due to inflation, deflationary assets are designed to maintain or increase their value through scarcity mechanisms.

Bitcoin, often called "digital gold," has a fixed supply of 21 million coins. This hard cap, combined with halving events that reduce new supply every four years, creates a deflationary monetary system. As adoption grows and supply remains constrained, the purchasing power of Bitcoin has historically increased dramatically.

Ethereum introduced a revolutionary fee-burning mechanism through EIP-1559. When network activity is high, more ETH is burned than created, making it deflationary. This ties the asset's scarcity directly to its utility and adoption.

Traditional precious metals like gold and silver have served as stores of value for millennia. Their scarcity comes from geological limits - there's only so much gold in the Earth's crust, and extraction becomes increasingly difficult and expensive. Industrial demand for silver often exceeds new supply, creating additional scarcity pressure.

The key to understanding deflationary assets is recognizing the inverse relationship between supply constraints and purchasing power. While fiat currencies can be printed infinitely, leading to devaluation, deflationary assets have built-in mechanisms that prevent oversupply. This fundamental difference makes them powerful tools for wealth preservation.

When comparing deflationary assets to cash, the contrast is stark. A dollar today buys less than it did a decade ago due to inflation. Meanwhile, deflationary assets have generally appreciated, not just maintaining but growing purchasing power. This makes them essential components of a diversified portfolio designed to preserve wealth across generations.

However, it's important to note that deflationary assets can be volatile in the short term. Their long-term value proposition comes from scarcity and growing adoption, but prices can fluctuate significantly. Investors should consider their time horizon and risk tolerance when allocating to these assets.

The rise of digital deflationary assets represents a paradigm shift in how we think about money and value storage. For the first time in history, we have programmable scarcity - assets whose supply constraints are enforced by mathematics and code rather than physical limitations or central authority promises.`,
        )
      } finally {
        setBlogLoading(false)
      }
    }

    loadBlogContent()
  }, [])

  const fetchLiveData = async (asset: string, year: number) => {
    try {
      setIsLoadingLiveData(true)

      if (asset === "bitcoin" || asset === "ethereum") {
        // Use CoinGecko for cryptocurrencies
        const coinId = asset === "bitcoin" ? "bitcoin" : "ethereum"
        const historicalData = await getCryptoHistoricalPrices(coinId, year === 2025 ? 365 : 30)

        if (historicalData && historicalData.length > 0) {
          setLiveDataStatus((prev) => ({ ...prev, [asset]: true }))
          return historicalData[0].price // Return latest price
        }
      } else if (asset === "gold" || asset === "silver") {
        // Use Alpha Vantage for precious metals
        const symbol = asset === "gold" ? "GLD" : "SLV"
        const price = await getCommodityPrice(symbol)

        if (price) {
          setLiveDataStatus((prev) => ({ ...prev, [asset]: true }))
          return price
        }
      } else if (asset === "oil") {
        // Use Alpha Vantage for oil
        const price = await getCommodityPrice("USO") // US Oil Fund ETF

        if (price) {
          setLiveDataStatus((prev) => ({ ...prev, [asset]: true }))
          return price
        }
      }

      return null
    } catch (error) {
      console.log("[v0] Error fetching live data:", error)
      setLiveDataStatus((prev) => ({ ...prev, [asset]: false }))
      return null
    } finally {
      setIsLoadingLiveData(false)
    }
  }

  useEffect(() => {
    const fetchCurrentPrices = async () => {
      if (endYear === "2025") {
        const livePrice = await fetchLiveData(selectedAsset, 2025)
        if (livePrice) {
          // Update mock data with live price
          setPriceData((prev: any) => ({
            ...prev,
            [selectedAsset]: {
              ...mockData[selectedAsset as keyof typeof mockData],
              2025: livePrice,
            },
          }))
        }
      }
    }

    fetchCurrentPrices()
  }, [selectedAsset, endYear])

  const comparisonData = [
    { year: 2020, cash: 1000, bitcoin: 1000, gold: 1000, inflation: 1000 },
    { year: 2021, cash: 950, bitcoin: 1620, gold: 1055, inflation: 920 },
    { year: 2022, cash: 900, bitcoin: 570, gold: 1083, inflation: 840 },
    { year: 2023, cash: 850, bitcoin: 1450, gold: 1111, inflation: 770 },
    { year: 2024, cash: 800, bitcoin: 2310, gold: 1167, inflation: 700 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Purchasing Power Growth Calculator
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Deflation Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-balance">
            Discover how scarce assets preserve and grow your purchasing power over time. See the opposite of inflation
            with deflationary asset appreciation.
          </p>
          {liveDataStatus[selectedAsset] && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Using Live {assetInfo[selectedAsset as keyof typeof assetInfo]?.name} Price Data
            </div>
          )}
        </div>

        {/* Main Calculator */}
        <Card className="mb-16 shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="w-6 h-6" />
              Purchasing Power Growth Calculator
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchLiveData(selectedAsset, Number.parseInt(endYear))}
                disabled={isLoadingLiveData}
                className="ml-auto text-white hover:bg-white/20"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingLiveData ? "animate-spin" : ""}`} />
              </Button>
            </CardTitle>
            <CardDescription className="text-purple-100">
              Calculate how your money would grow with deflationary assets
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Initial Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg h-12 mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    placeholder="1000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startYear" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Start Year
                    </Label>
                    <Select value={startYear} onValueChange={setStartYear}>
                      <SelectTrigger className="h-12 mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {getAvailableYears(selectedAsset)
                          .slice(0, -1)
                          .map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                              className="dark:text-white dark:focus:bg-gray-700"
                            >
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="endYear" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      End Year
                    </Label>
                    <Select value={endYear} onValueChange={setEndYear}>
                      <SelectTrigger className="h-12 mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {getAvailableYears(selectedAsset)
                          .slice(1)
                          .map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                              className="dark:text-white dark:focus:bg-gray-700"
                            >
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Select Deflationary Asset
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {Object.entries(assetInfo).map(([key, info]) => {
                      const IconComponent = info.icon
                      return (
                        <Button
                          key={key}
                          variant={selectedAsset === key ? "default" : "outline"}
                          onClick={() => setSelectedAsset(key)}
                          className="h-16 flex flex-col items-center gap-1 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                          style={selectedAsset === key ? { backgroundColor: info.color } : {}}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-xs">{info.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                  Purchasing Power Growth
                </h3>

                {calculationResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                        ${calculationResult.finalValue?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Final Value ({endYear})</div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-900 dark:text-gray-100">Growth:</span>
                      <Badge
                        variant={calculationResult.growth > 0 ? "default" : "destructive"}
                        className="text-lg px-3 py-1"
                      >
                        {calculationResult.growth > 0 ? "+" : ""}
                        {calculationResult.growth?.toFixed(1) || "0"}%
                      </Badge>
                    </div>

                    <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Units Purchased:</span>
                        <span>{calculationResult.units?.toFixed(4) || "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price in {startYear}:</span>
                        <span>${calculationResult.startPrice?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price in {endYear}:</span>
                        <span>${calculationResult.endPrice?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Select parameters to calculate purchasing power growth
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deflation vs Inflation Comparison */}
        <Card className="mb-16 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="w-6 h-6" />
              Deflation vs Inflation: The Purchasing Power Gap
            </CardTitle>
            <CardDescription>See how $1,000 performs across different asset classes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`$${value}`, name]} />
                  <Line
                    type="monotone"
                    dataKey="bitcoin"
                    stroke="hsl(var(--deflation-primary))"
                    strokeWidth={3}
                    name="Bitcoin"
                  />
                  <Line type="monotone" dataKey="gold" stroke="hsl(45 93% 47%)" strokeWidth={3} name="Gold" />
                  <Line
                    type="monotone"
                    dataKey="cash"
                    stroke="hsl(0 0% 50%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Cash (No Growth)"
                  />
                  <Line
                    type="monotone"
                    dataKey="inflation"
                    stroke="hsl(0 84% 60%)"
                    strokeWidth={2}
                    name="Cash (Inflation Adjusted)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">+131%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bitcoin Growth</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">+16.7%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Gold Growth</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">-20%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cash (No Growth)</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">-30%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cash (Inflation)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scarcity Mechanisms Dashboard */}
        <Card className="mb-16 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-6 h-6" />
              Scarcity Mechanisms Dashboard
            </CardTitle>
            <CardDescription>Understanding what makes these assets deflationary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(assetInfo).map(([key, info]) => {
                const IconComponent = info.icon
                return (
                  <Card key={key} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${info.color}20` }}>
                          <IconComponent className="w-6 h-6" style={{ color: info.color }} />
                        </div>
                        <CardTitle className="text-lg">{info.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {info.mechanism}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                        <div className="pt-2">
                          <div className="text-xs text-gray-500 dark:text-gray-500">Scarcity Level</div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                backgroundColor: info.color,
                                width:
                                  key === "bitcoin"
                                    ? "95%"
                                    : key === "ethereum"
                                      ? "80%"
                                      : key === "gold"
                                        ? "85%"
                                        : key === "silver"
                                          ? "70%"
                                          : "75%",
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Methodology Section */}
        <Card className="mb-16 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6" />
              Methodology & Understanding Deflation
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <Tabs defaultValue="methodology" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="methodology">Methodology</TabsTrigger>
                <TabsTrigger value="scarcity">Scarcity Economics</TabsTrigger>
                <TabsTrigger value="mechanisms">Deflation Mechanisms</TabsTrigger>
                <TabsTrigger value="strategy">Investment Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="methodology" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">How We Calculate Purchasing Power Growth</h3>
                  <p>
                    Our deflation calculator uses historical price data to show how scarce assets preserve and grow
                    purchasing power over time:
                  </p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Asset Units Calculation:</strong> Initial Amount ÷ Starting Price = Units Purchased
                    </li>
                    <li>
                      <strong>Final Value:</strong> Units × Ending Price = Current Worth
                    </li>
                    <li>
                      <strong>Growth Rate:</strong> ((Final Value - Initial Amount) ÷ Initial Amount) × 100
                    </li>
                    <li>
                      <strong>Real Purchasing Power:</strong> Adjusted for inflation to show true wealth preservation
                    </li>
                  </ol>
                  <p>
                    This methodology demonstrates the inverse relationship between asset scarcity and purchasing power
                    erosion.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="scarcity" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">The Economics of Scarcity</h3>
                  <p>Deflationary assets derive their value from fundamental scarcity mechanisms:</p>
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300">Supply Constraints</h4>
                      <p className="text-sm mt-2">
                        Fixed or decreasing supply creates natural price appreciation as demand grows.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300">Increasing Demand</h4>
                      <p className="text-sm mt-2">
                        Growing adoption and utility drive demand while supply remains constrained.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mechanisms" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Deflation Mechanisms by Asset</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold">Bitcoin: Programmatic Scarcity</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        21 million hard cap, halving events every 4 years, lost coins permanently remove supply.
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold">Ethereum: Fee Burning</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        EIP-1559 burns transaction fees, making ETH deflationary during high network usage.
                      </p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold">Precious Metals: Geological Limits</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Finite deposits, increasing extraction costs, industrial demand exceeding supply.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="strategy" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Using Deflationary Assets in Your Portfolio</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-green-600">Inflation Hedge</h4>
                      <p className="text-sm mt-2">Protect purchasing power during inflationary periods.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-blue-600">Diversification</h4>
                      <p className="text-sm mt-2">Reduce correlation with traditional financial assets.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-purple-600">Long-term Growth</h4>
                      <p className="text-sm mt-2">Benefit from scarcity-driven appreciation over time.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Educational Blog Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6" />
              Understanding Deflationary Assets and Wealth Preservation
            </CardTitle>
            <CardDescription>Learn more about deflationary assets and wealth preservation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
              {blogLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {blogContent.split("\n").map((line, index) => {
                    const trimmedLine = line.trim()

                    // Skip empty lines
                    if (!trimmedLine) return null

                    // Detect headings: lines ending with "?" or ":" or short standalone lines (< 60 chars and not part of a sentence)
                    const isHeading =
                      trimmedLine.endsWith("?") ||
                      trimmedLine.endsWith(":") ||
                      (trimmedLine.length < 60 && !trimmedLine.endsWith(".") && !trimmedLine.endsWith(","))

                    if (isHeading) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                          {trimmedLine}
                        </h3>
                      )
                    }

                    // Regular paragraphs
                    return (
                      <p key={index} className="text-base leading-7 mb-4">
                        {trimmedLine}
                      </p>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16 mb-8 max-w-4xl mx-auto">
          <FAQ category="deflation" />
        </div>

        {/* Footer Section */}
        <footer className="mt-12 bg-slate-900 text-white rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-3 gap-8 p-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">Deflation Calculator</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Calculate purchasing power changes during deflation periods with historical data from 1913 to 2025.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Bureau of Labor Statistics (BLS)</li>
                <li>• Federal Reserve Economic Data</li>
                <li>• Historical CPI Records</li>
                <li>• US Treasury Department</li>
                <li>• OECD Economic Indicators</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    Home - Inflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/deflation-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Deflation Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/ppp-calculator" className="text-slate-300 hover:text-white transition-colors">
                    PPP Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/salary-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Salary Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/retirement-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Retirement Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/student-loan-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Student Loan Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/mortgage-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Mortgage Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Budget Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-fund-calculator" className="text-slate-300 hover:text-white transition-colors">
                    Emergency Fund Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/roi-calculator" className="text-slate-300 hover:text-white transition-colors">
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/legacy-planner" className="text-slate-300 hover:text-white transition-colors">
                    Legacy Planner
                  </Link>
                </li>
                <li>
                  <Link href="/charts" className="text-slate-300 hover:text-white transition-colors">
                    Charts & Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 px-8 py-6 text-center">
            <p className="text-sm text-slate-400">© 2025 Global Inflation Calculator. Educational purposes only.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
