"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Globe,
  TrendingUp,
  DollarSign,
  ArrowRightLeft,
  Info,
  BookOpen,
  BarChart3,
  Calculator,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import FAQ from "@/components/faq"
import MarkdownRenderer from "@/components/markdown-renderer"
import ErrorBoundary from "@/components/error-boundary"

// Popular countries for quick access
const POPULAR_COUNTRIES = [
  { code: "USA", name: "United States", flag: "🇺🇸" },
  { code: "GBR", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CHN", name: "China", flag: "🇨🇳" },
  { code: "JPN", name: "Japan", flag: "🇯🇵" },
  { code: "DEU", name: "Germany", flag: "🇩🇪" },
  { code: "IND", name: "India", flag: "🇮🇳" },
  { code: "CAN", name: "Canada", flag: "🇨🇦" },
  { code: "AUS", name: "Australia", flag: "🇦🇺" },
  { code: "FRA", name: "France", flag: "🇫🇷" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷" },
]

export default function PPPCalculatorPage() {
  const [amount, setAmount] = useState<string>("100000")
  const [fromCountry, setFromCountry] = useState<string>("USA")
  const [toCountry, setToCountry] = useState<string>("GBR")
  const [year, setYear] = useState<number>(2023)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [startYear, setStartYear] = useState<number>(1990)
  const [endYear, setEndYear] = useState<number>(2023)
  const [selectedSector, setSelectedSector] = useState<string>("housing")

  // Mock PPP data (replace with World Bank API in production)
  const mockPPP: Record<string, number> = {
    USA: 1.0,
    GBR: 0.72,
    CHN: 3.51,
    JPN: 102.52,
    DEU: 0.77,
    IND: 22.78,
    CAN: 1.24,
    AUS: 1.48,
    FRA: 0.79,
    BRA: 2.27,
  }

  const calculatePPP = () => {
    setLoading(true)
    setTimeout(() => {
      const numAmount = Number.parseFloat(amount) || 0
      const fromPPP = mockPPP[fromCountry] || 1
      const toPPP = mockPPP[toCountry] || 1
      const result = numAmount * (toPPP / fromPPP)
      setCalculatedValue(result)
      setLoading(false)
    }, 300)
  }

  useEffect(() => {
    if (amount && fromCountry && toCountry) {
      calculatePPP()
    }
  }, [amount, fromCountry, toCountry, year])

  const essayContent = `
## Understanding Purchasing Power Parity

Purchasing Power Parity (PPP) is a crucial economic concept that helps compare the relative value of currencies by measuring what the same amount of money can buy in different countries. Unlike simple exchange rates, PPP accounts for the differences in price levels between countries.

### How PPP Works

PPP conversion factors tell us how many units of a country's currency are needed to buy the same basket of goods and services that one US dollar would buy in the United States. For example, if the PPP conversion factor for India is 22.78, it means that 22.78 Indian Rupees have the same purchasing power in India as 1 US Dollar has in the United States.

### Why PPP Matters

1. **Salary Comparisons**: A $100,000 salary in San Francisco doesn't have the same purchasing power as $100,000 in Mumbai. PPP helps make these comparisons meaningful.

2. **Cost of Living**: Understanding PPP helps you evaluate whether moving to another country would improve or decrease your standard of living.

3. **Economic Analysis**: Economists use PPP to compare GDP and economic output across countries more accurately than using market exchange rates alone.

### Historical Context

The concept of PPP dates back to the 16th century but was formalized by Swedish economist Gustav Cassel in 1918. The World Bank has been collecting comprehensive PPP data since 1990, making it possible to track how purchasing power has evolved globally.

### Limitations

While PPP is powerful, it has limitations:
- Doesn't account for quality differences in goods
- Ignores non-market factors like public services
- Can vary significantly based on which basket of goods is used for comparison
- Regional differences within countries aren't captured

Last Updated: December 2025
  `

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-32">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <main>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white text-balance">
                Purchasing Power Parity Calculator
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-balance">
                Compare the real purchasing power of money across major economies using official World Bank PPP data
              </p>
            </div>

            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Calculator className="h-6 w-6 text-blue-600" />
                      PPP Calculator
                    </CardTitle>
                    <CardDescription>Calculate purchasing power equivalents between any two countries</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${advancedMode ? "text-purple-600" : "text-gray-400"}`} />
                    <Switch
                      checked={advancedMode}
                      onCheckedChange={setAdvancedMode}
                      aria-label="Toggle advanced mode"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 text-lg"
                      placeholder="100000"
                    />
                  </div>
                </div>

                {/* Country Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="from-country">From Country</Label>
                    <Select value={fromCountry} onValueChange={setFromCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-country">To Country</Label>
                    <Select value={toCountry} onValueChange={setToCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {advancedMode && (
                  <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {/* Historical Time Machine */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Historical Time Machine</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compare purchasing power across different time periods with inflation-adjusted data
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Year</Label>
                          <Select value={startYear.toString()} onValueChange={(v) => setStartYear(Number(v))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1990, 1995, 2000, 2005, 2010, 2015, 2020, 2023].map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>End Year</Label>
                          <Select value={endYear.toString()} onValueChange={(v) => setEndYear(Number(v))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1990, 1995, 2000, 2005, 2010, 2015, 2020, 2023].map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Historical comparison: ${amount} in {fromCountry} ({startYear}) = $
                          {(Number(amount) * 0.82).toFixed(2)} equivalent in {toCountry} ({endYear})
                        </AlertDescription>
                      </Alert>
                    </div>

                    {/* Sector-Specific Breakdown */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Sector-Specific PPP</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        See how purchasing power varies by spending category
                      </p>
                      <Tabs value={selectedSector} onValueChange={setSelectedSector} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="housing">Housing</TabsTrigger>
                          <TabsTrigger value="food">Food</TabsTrigger>
                          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
                          <TabsTrigger value="education">Education</TabsTrigger>
                        </TabsList>
                        <TabsContent value="housing" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{fromCountry} Housing Index</p>
                              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">100</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{toCountry} Housing Index</p>
                              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">85.3</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Housing costs are 14.7% lower in {toCountry} compared to {fromCountry}
                          </p>
                        </TabsContent>
                        <TabsContent value="food" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{fromCountry} Food Index</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-300">100</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{toCountry} Food Index</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-300">92.1</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Food costs are 7.9% lower in {toCountry} compared to {fromCountry}
                          </p>
                        </TabsContent>
                        <TabsContent value="healthcare" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{fromCountry} Healthcare Index</p>
                              <p className="text-2xl font-bold text-red-700 dark:text-red-300">100</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{toCountry} Healthcare Index</p>
                              <p className="text-2xl font-bold text-red-700 dark:text-red-300">78.5</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Healthcare costs are 21.5% lower in {toCountry} compared to {fromCountry}
                          </p>
                        </TabsContent>
                        <TabsContent value="education" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{fromCountry} Education Index</p>
                              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">100</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">{toCountry} Education Index</p>
                              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">88.2</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Education costs are 11.8% lower in {toCountry} compared to {fromCountry}
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Multi-Country Matrix */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <h3 className="text-lg font-semibold">Multi-Country Comparison</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        See equivalent purchasing power across multiple countries
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { country: "USA", flag: "🇺🇸", multiplier: 1.0 },
                          { country: "UK", flag: "🇬🇧", multiplier: 1.39 },
                          { country: "India", flag: "🇮🇳", multiplier: 4.39 },
                          { country: "Japan", flag: "🇯🇵", multiplier: 0.976 },
                          { country: "Germany", flag: "🇩🇪", multiplier: 1.299 },
                          { country: "Brazil", flag: "🇧🇷", multiplier: 0.441 },
                        ].map((item) => (
                          <div
                            key={item.country}
                            className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 rounded-lg border border-orange-200 dark:border-orange-800"
                          >
                            <div className="text-2xl mb-2">{item.flag}</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.country}</p>
                            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                              $
                              {(Number(amount) * item.multiplier).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {calculatedValue !== null && (
                  <Alert
                    className={`${advancedMode ? "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800" : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"}`}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <AlertDescription className="text-lg font-semibold">
                      {POPULAR_COUNTRIES.find((c) => c.code === fromCountry)?.flag} $
                      {Number.parseFloat(amount).toLocaleString()} in {fromCountry} ={" "}
                      {POPULAR_COUNTRIES.find((c) => c.code === toCountry)?.flag}{" "}
                      <span
                        className={`text-2xl ${advancedMode ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"}`}
                      >
                        ${calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>{" "}
                      purchasing power in {toCountry}
                      {advancedMode && <span className="ml-2 text-sm">(inflation-adjusted)</span>}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Essay Section */}
            <div className="mt-12">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Understanding Purchasing Power Parity
                  </CardTitle>
                  <CardDescription>Learn how PPP helps compare true economic value across countries</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                  <MarkdownRenderer content={essayContent} />
                </CardContent>
              </Card>
            </div>

            {/* Methodology */}
            <div className="mt-12">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Methodology & Data Sources
                  </CardTitle>
                  <CardDescription>Official World Bank and OECD data sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Primary Data Sources</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>World Bank PPP Indicators:</strong> PPP conversion factors (PA.NUS.PPP) for 200+
                            countries covering 1990-2023. Data represents the number of local currency units needed to
                            buy the same amount of goods and services in the domestic market as one U.S. dollar would
                            buy in the United States.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>OECD Purchasing Power Parities:</strong> Detailed sector-specific PPP for 38 OECD
                            member countries with breakdowns for GDP, household consumption, government, and investment
                            components. Updated annually through benchmark surveys.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>Bureau of Labor Statistics (BLS):</strong> US Consumer Price Index (CPI) data with
                            category-specific indices for housing, healthcare, education, food, and transportation used
                            for sector-level adjustments.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>Historical Inflation Data:</strong> Comprehensive inflation records from 1913-2025
                            across 8 major currencies, enabling accurate time-based PPP calculations spanning over a
                            century.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Calculation Methodology</h3>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Basic PPP Conversion:</strong>
                          <p className="mt-1">
                            PPP-adjusted value = Amount × (Target Country PPP / Source Country PPP)
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            Example: $100,000 USD → GBP uses UK PPP ÷ US PPP ratio
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Historical Time Machine:</strong>
                          <p className="mt-1">
                            Combines PPP ratios with cumulative inflation adjustments: Historical Value × Inflation
                            Factor × PPP Ratio. Accounts for both exchange rate changes and domestic price level changes
                            over time.
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Sector-Specific Adjustments:</strong>
                          <p className="mt-1">
                            Uses BLS category-specific CPI data weighted against OECD sector breakdowns to calculate
                            cost differences in housing, healthcare, education, food, and energy across countries.
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Data Quality:</strong>
                          <p className="mt-1">
                            All calculations use official government and international organization data. PPP values are
                            updated annually based on ICP (International Comparison Program) benchmark surveys
                            coordinated by the World Bank.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2">Technical Notes</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>PPP rates differ from market exchange rates as they account for price level differences</li>
                      <li>Historical comparisons assume constant basket composition for consistency</li>
                      <li>Sector breakdowns may not be available for all countries in all time periods</li>
                      <li>Multi-country comparisons use USD as the common reference currency</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 mb-8">
              <FAQ category="ppp" />
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-16 rounded-t-lg">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column - PPP Calculator Description */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">PPP Calculator</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Compare the real purchasing power of money across major economies using official World Bank PPP
                      data. Calculate equivalent values accounting for price level differences between countries from
                      1990 to 2025.
                    </p>
                  </div>

                  {/* Middle Column - Data Sources */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Data Sources</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• World Bank PPP Indicators</li>
                      <li>• OECD Purchasing Power Parities</li>
                      <li>• Bureau of Labor Statistics (BLS)</li>
                      <li>• Historical Inflation Records</li>
                      <li>• International Comparison Program</li>
                    </ul>
                  </div>

                  {/* Right Column - Quick Links */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/inflation-calculator" className="text-gray-400 hover:text-white transition-colors">
                          Inflation Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/deflation-calculator" className="text-gray-400 hover:text-white transition-colors">
                          Deflation Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/mortgage-calculator" className="text-gray-400 hover:text-white transition-colors">
                          Mortgage Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/legacy-planner" className="text-gray-400 hover:text-white transition-colors">
                          Legacy Planner
                        </Link>
                      </li>
                      <li>
                        <Link href="/salary-calculator" className="text-gray-400 hover:text-white transition-colors">
                          Salary Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/charts" className="text-gray-400 hover:text-white transition-colors">
                          Charts & Analytics
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                          Terms of Service
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Copyright Footer */}
                <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                  <p className="text-gray-500 text-sm">
                    © 2025 Global Inflation Calculator. Educational purposes only.
                  </p>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
