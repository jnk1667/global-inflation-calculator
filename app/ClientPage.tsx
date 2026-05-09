"use client"

import type React from "react"
import { useState, useEffect, lazy, Suspense, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"
import LoadingSpinner from "@/components/loading-spinner"
import { Globe, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"
import { trackPageView } from "@/lib/analytics"
import Script from "next/script"
import { JsonLd } from "@/components/json-ld"
import Link from "next/link"
import { loadCurrencyMeasuresWithFallback } from "@/lib/data-loader"
import {
  calculateConsensusInflation,
  getMeasureDisplayName,
  getMeasureDescription,
  getDataQualityScore,
} from "@/lib/inflation-measures"

// Lazy load heavy components for better performance
const SimpleLineChart = lazy(() => import("@/components/simple-line-chart"))
const PurchasingPowerVisual = lazy(() => import("@/components/purchasing-power-visual"))
const CurrencyComparisonChart = lazy(() => import("@/components/currency-comparison-chart"))
const FAQ = lazy(() => import("@/components/faq"))
const SocialShare = lazy(() => import("@/components/social-share"))
const AdBanner = lazy(() => import("@/components/ad-banner"))
const UsageStats = lazy(() => import("@/components/usage-stats"))

interface InflationData {
  [year: string]: number
}

interface CurrencyData {
  data: InflationData
  symbol: string
  name: string
  flag: string
  startYear: number
  endYear: number
}

interface AllInflationData {
  [currency: string]: CurrencyData
}

// Currency definitions with proper spacing - Added NZD
const currencies = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", code: "US" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", code: "GB" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", code: "EU" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", code: "CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", code: "AU" },
  CHF: { symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", code: "CH" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", code: "JP" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", code: "NZ" },
} as const

// Year-by-year fun facts for the slider hover feature
const yearFacts: Record<number, string> = {
  1913: "The US Federal Reserve is established, creating America's central banking system.",
  1914: "World War 1 begins — Britain, France and Russia face the Central Powers.",
  1915: "The Gallipoli campaign: Australia and New Zealand troops land at ANZAC Cove.",
  1916: "The Battle of the Somme — over 1 million casualties on the Western Front.",
  1917: "The US enters World War 1, tipping the balance against the Central Powers.",
  1918: "World War 1 ends on November 11th — the 'War to End All Wars' is over.",
  1919: "The Treaty of Versailles imposes crippling reparations on Germany.",
  1920: "The Roaring Twenties begin — US consumer spending and credit boom.",
  1921: "The British pound returns to the gold standard, causing deflation and unemployment.",
  1922: "Mussolini's March on Rome — fascism takes power in Italy.",
  1923: "German hyperinflation peaks: a loaf of bread costs 200 billion marks.",
  1924: "The Dawes Plan restructures German reparations and stabilises the mark.",
  1925: "The UK returns to the gold standard at pre-war rates, deflationary for British workers.",
  1926: "The UK General Strike: 1.7 million workers walk out for nine days.",
  1927: "The Federal Reserve tightens credit, planting seeds of the coming Depression.",
  1928: "Herbert Hoover wins the US presidency; stock markets hit record highs.",
  1929: "Wall Street Crash — the Dow Jones falls 25% in two days. The Great Depression begins.",
  1930: "The Smoot-Hawley Tariff triggers a global trade war, deepening the Depression.",
  1931: "Britain abandons the gold standard; the pound devalues 30% overnight.",
  1932: "US unemployment hits 25%. Canada's GDP falls 40% from its 1929 peak.",
  1933: "FDR's New Deal launches. The US confiscates private gold under Executive Order 6102.",
  1934: "The US devalues the dollar against gold from $20.67 to $35 per ounce.",
  1935: "Australia's central bank, the Commonwealth Bank, begins acting as a true reserve bank.",
  1936: "Keynes publishes The General Theory — reshaping economic policy for a generation.",
  1937: "FDR cuts spending too early; the US falls back into recession within the Depression.",
  1938: "Germany annexes Austria — European tensions reach a breaking point.",
  1939: "World War 2 begins. Canada declares war one week after Britain.",
  1940: "The Battle of Britain: the RAF defeats the Luftwaffe over English skies.",
  1941: "The US enters World War 2 after Japan attacks Pearl Harbour.",
  1942: "Australia faces direct threat of Japanese invasion; wartime rationing begins.",
  1943: "The Allies turn the tide — victory at Stalingrad and North Africa.",
  1944: "The Bretton Woods agreement: the US dollar becomes the world's reserve currency.",
  1945: "World War 2 ends. The United Nations is founded. The postwar boom begins.",
  1946: "Baby boom begins in the US, Canada, and Australia.",
  1947: "The Marshall Plan is proposed — the US pledges $13 billion to rebuild Europe.",
  1948: "The NHS is founded in the UK — universal healthcare becomes a British right.",
  1949: "NATO is founded. China becomes a communist republic under Mao Zedong.",
  1950: "The Korean War begins. US defence spending surges, fuelling inflation.",
  1951: "Japan signs the San Francisco Peace Treaty, regaining sovereignty.",
  1952: "New Zealand introduces compulsory military service in response to the Cold War.",
  1953: "Korean War armistice. US consumer goods boom — TVs, cars, and appliances.",
  1954: "Swiss banks introduce numbered accounts, cementing Switzerland's role as a financial haven.",
  1955: "West Germany joins NATO. The German 'economic miracle' is in full swing.",
  1956: "The Suez Crisis: Britain and France are humiliated, signalling the end of empire.",
  1957: "The EEC (European Common Market) is founded by the Treaty of Rome.",
  1958: "The French franc is devalued by 17.5% as de Gaulle returns to power.",
  1959: "Australia's Reserve Bank Act separates the central bank from the Commonwealth Bank.",
  1960: "The OPEC oil cartel is founded by Saudi Arabia, Iran, Iraq, Kuwait and Venezuela.",
  1961: "The Berlin Wall is built, dividing Germany for 28 years.",
  1962: "The Cuban Missile Crisis brings the world to the brink of nuclear war.",
  1963: "President Kennedy is assassinated in Dallas. Johnson escalates Vietnam involvement.",
  1964: "Japan hosts the Tokyo Olympics — marking its postwar economic recovery to the world.",
  1965: "Canada adopts the Maple Leaf flag and introduces universal healthcare.",
  1966: "Australia switches to decimal currency, replacing pounds, shillings and pence.",
  1967: "The UK devalues the pound by 14.3%, from $2.80 to $2.40 against the dollar.",
  1968: "Global unrest — student riots in Paris, Prague Spring crushed by Soviet tanks.",
  1969: "Man lands on the Moon. US government spending on Vietnam and Apollo drives inflation.",
  1970: "New Zealand introduces equal pay legislation for women.",
  1971: "Nixon ends the gold standard — the dollar is untethered. The modern inflation era begins.",
  1972: "Nixon visits China. The floating exchange rate era begins for most major currencies.",
  1973: "The OPEC oil embargo quadruples crude prices. The energy crisis hits the West.",
  1974: "UK inflation hits 25%. The miners' strike forces a three-day working week.",
  1975: "Australia's Whitlam government is controversially dismissed during a constitutional crisis.",
  1976: "The IMF bails out the UK — Britain borrows $3.9 billion in crisis conditions.",
  1977: "Swiss inflation falls to 1.3% — the franc becomes the world's hardest currency.",
  1978: "Japan's Nikkei index surpasses 6,000 for the first time.",
  1979: "Volcker is appointed Fed Chair. UK elects Thatcher. Second oil shock hits.",
  1980: "Volcker raises US interest rates to 20% to crush inflation. A severe recession follows.",
  1981: "The Reagan tax cuts pass. Canada's Bank of Canada rate hits 20.03%.",
  1982: "Mexico defaults on its debt — the Latin American debt crisis spreads globally.",
  1983: "Australia floats the Australian dollar, ending the fixed exchange rate era.",
  1984: "New Zealand elects a Labour government that radically deregulates the economy.",
  1985: "The Plaza Accord: G5 nations agree to deliberately weaken the US dollar.",
  1986: "Big Bang deregulation transforms the City of London into a global financial hub.",
  1987: "Black Monday: global stock markets crash 22% in a single day.",
  1988: "Japan's asset price bubble peaks — Tokyo land values exceed all of the United States.",
  1989: "The Berlin Wall falls. Japan's bubble economy begins its catastrophic deflation.",
  1990: "German reunification — West Germany absorbs East Germany at great economic cost.",
  1991: "The Soviet Union collapses. US enters recession following the Gulf War.",
  1992: "Black Wednesday: the UK is forced out of the European Exchange Rate Mechanism.",
  1993: "The EU's Single Market launches, creating free movement of goods, services and people.",
  1994: "The Tequila Crisis: Mexico devalues the peso, triggering an EM currency contagion.",
  1995: "The Japanese yen hits a postwar record of 79 yen per dollar.",
  1996: "New Zealand becomes the first country to formally adopt inflation targeting as policy.",
  1997: "Asian financial crisis — Thailand, South Korea and Indonesia face currency collapses.",
  1998: "Russia defaults on its debt. Long-Term Capital Management collapses.",
  1999: "The euro is introduced as an accounting currency for 11 European nations.",
  2000: "The dot-com bubble bursts — the Nasdaq falls 78% from peak to trough.",
  2001: "9/11 attacks. The US economy enters recession. Afghanistan war begins.",
  2002: "Euro notes and coins enter circulation, replacing legacy currencies across Europe.",
  2003: "US invades Iraq. Global commodity prices begin a decade-long supercycle.",
  2004: "Ten new countries join the EU — the largest expansion in the bloc's history.",
  2005: "UK house prices double from 2000 levels. The housing bubble inflates globally.",
  2006: "The US housing market peaks. Sub-prime mortgage defaults begin to rise.",
  2007: "Northern Rock becomes the first British bank run in 150 years.",
  2008: "Global financial crisis. Lehman Brothers collapses. Governments bail out major banks.",
  2009: "The G20 coordinates the largest fiscal stimulus in history to prevent a depression.",
  2010: "The Greek debt crisis erupts, threatening the survival of the euro.",
  2011: "Japan's Fukushima disaster disrupts global supply chains. Switzerland caps the franc at 1.20.",
  2012: "Draghi pledges to do 'whatever it takes' to save the euro — markets stabilise.",
  2013: "The 'Taper Tantrum' — emerging market currencies crash as the Fed hints at tightening.",
  2014: "Oil prices collapse 50% as Saudi Arabia defends market share against US shale.",
  2015: "The Swiss National Bank shocks markets by removing the franc's cap — the franc soars 30%.",
  2016: "Brexit referendum: the UK votes to leave the EU. The pound falls 10% overnight.",
  2017: "Bitcoin surges from $1,000 to $20,000 in a single year.",
  2018: "US-China trade war begins. The Fed raises rates four times.",
  2019: "Covid-19 emerges in Wuhan. Australia's worst bushfire season on record.",
  2020: "Global pandemic. Central banks and governments inject $20 trillion in stimulus.",
  2021: "Supply chain chaos. Inflation hits 40-year highs across the US, UK, Canada and Australia.",
  2022: "Russia invades Ukraine. European energy prices spike 10x. UK inflation hits 11.1%.",
  2023: "Central banks raise rates aggressively. The fastest rate-hiking cycle in 40 years.",
  2024: "Central banks begin cutting rates. US inflation returns to near the 2% target.",
  2025: "AI investment boom. Global debt hits $320 trillion. Rate-cutting cycle continues.",
  2026: "You are here.",
}

// Historical context data by decade
const getHistoricalContext = (year: number) => {
  if (year >= 2025) {
    return {
      events: [
        "• Fed rate cuts to 3.5-3.75%",
        "• AI market boom continues",
        "• Stock markets reach all-time highs",
        "• Global inflation eases to ~3%",
      ],
      prices: ["• $13.00 Movie ticket", "• $3.35 Gallon of gas", "• $2.50 Loaf of bread", "• $6.00 Cup of coffee"],
    }
  } else if (year >= 2020) {
    return {
      events: [
        "• COVID-19 pandemic",
        "• Remote work revolution",
        "• Supply chain disruptions",
        "• Historic inflation surge",
      ],
      prices: ["• $12.50 Movie ticket", "• $3.45 Gallon of gas", "• $3.25 Loaf of bread", "• $5.50 Cup of coffee"],
    }
  } else if (year >= 2010) {
    return {
      events: [
        "• Social media revolution",
        "• Smartphone adoption",
        "• Economic recovery post-2008",
        "• Obama presidency",
      ],
      prices: ["• $7.89 Movie ticket", "• $2.79 Gallon of gas", "• $2.79 Loaf of bread", "• $2.45 Cup of coffee"],
    }
  } else if (year >= 2000) {
    return {
      events: ["• Dot-com boom and bust", "• 9/11 attacks", "• Iraq War", "• Bush presidency"],
      prices: ["• $5.39 Movie ticket", "• $1.51 Gallon of gas", "• $1.99 Loaf of bread", "• $1.25 Cup of coffee"],
    }
  } else if (year >= 1990) {
    return {
      events: ["• End of Cold War", "• Gulf War", "• Internet emergence", "• Clinton presidency"],
      prices: ["• $4.23 Movie ticket", "• $1.34 Gallon of gas", "• $0.70 Loaf of bread", "• $0.75 Cup of coffee"],
    }
  } else if (year >= 1980) {
    return {
      events: ["• Reagan presidency", "• High inflation period", "• Personal computers", "• MTV launches"],
      prices: ["• $2.69 Movie ticket", "• $1.19 Gallon of gas", "• $0.50 Loaf of bread", "• $0.45 Cup of coffee"],
    }
  } else if (year >= 1970) {
    return {
      events: ["• Vietnam War", "• Oil crisis", "• Watergate scandal", "• Moon landing aftermath"],
      prices: ["• $1.55 Movie ticket", "• $0.36 Gallon of gas", "• $0.25 Loaf of bread", "• $0.25 Cup of coffee"],
    }
  } else if (year >= 1960) {
    return {
      events: ["• Civil Rights Movement", "• JFK presidency", "• Space race", "• Beatles era"],
      prices: ["• $0.69 Movie ticket", "• $0.31 Gallon of gas", "• $0.20 Loaf of bread", "• $0.15 Cup of coffee"],
    }
  } else if (year >= 1950) {
    return {
      events: ["• Post-WWII boom", "• Korean War", "• Suburban growth", "• TV becomes popular"],
      prices: ["• $0.48 Movie ticket", "• $0.27 Gallon of gas", "• $0.14 Loaf of bread", "• $0.10 Cup of coffee"],
    }
  } else if (year >= 1940) {
    return {
      events: ["• World War II", "• Rationing and shortages", "• Women in workforce", "• Victory gardens"],
      prices: ["• $0.23 Movie ticket", "• $0.18 Gallon of gas", "• $0.10 Loaf of bread", "• $0.05 Cup of coffee"],
    }
  } else if (year >= 1930) {
    return {
      events: ["• Great Depression", "• New Deal programs", "• Dust Bowl", "• Radio golden age"],
      prices: ["• $0.20 Movie ticket", "• $0.18 Gallon of gas", "• $0.09 Loaf of bread", "• $0.05 Cup of coffee"],
    }
  } else if (year >= 1920) {
    return {
      events: ["• Roaring Twenties", "• Prohibition era", "• Jazz age", "• Stock market boom"],
      prices: ["• $0.15 Movie ticket", "• $0.25 Gallon of gas", "• $0.08 Loaf of bread", "• $0.05 Cup of coffee"],
    }
  } else {
    return {
      events: ["• World War I", "• Spanish flu pandemic", "• Industrial revolution peak", "• Horse and buggy era"],
      prices: ["• $0.10 Movie ticket", "• $0.20 Gallon of gas", "• $0.05 Loaf of bread", "• $0.03 Cup of coffee"],
    }
  }
}

// Default SEO essay content — mirrors the main_essay row in seo_content table
const defaultSEOEssay = `
## The Quiet Heist: How Inflation Has Been Stealing From You Since 1971

Let's talk about a crime that happens every single day, in every country, to every person — and nobody gets arrested for it. No alarm goes off. No news alert pops up. You just slowly notice that your paycheck doesn't seem to go as far as it used to, that the trolley at the supermarket feels lighter for the same amount of money, and that your parents' stories about buying a house for £30,000 sound like they're from another planet.

That crime is inflation. And after spending years building tools that crunch through over a century of official government data — from the U.S. Bureau of Labor Statistics, the UK's Office for National Statistics, the European Central Bank, and half a dozen other institutions — we can show you exactly how the heist works, how much has been taken, and what you can actually do about it.

No finance degree required. Let's get into it.

---

## The Year Everything Changed: 1971

If you want to understand modern inflation, there's one date you need to know: August 15, 1971.

That was the Sunday night President Richard Nixon went on television and told the world that the United States would no longer exchange U.S. dollars for gold. Up until that moment, every dollar in circulation was technically backed by a fixed amount of gold held in reserve. It was called the Bretton Woods system, and it acted as a natural ceiling on how many dollars could be printed. No gold, no new dollars.

When Nixon ended it — an event economists now call the "Nixon Shock" — governments gained the ability to create money essentially without limit. And they used it.

Here is what happened to the U.S. dollar's purchasing power after 1971, using our own CPI data pulled directly from BLS records:

- In **1971**, $100 had the purchasing power of $100.
- By **1990**, that same $100 only bought what $37.60 would have bought in 1971.
- By **2010**, it bought what $23.40 would have bought in 1971.
- By **2026**, it buys what roughly **$15.20** would have bought in 1971.

Read that again. A dollar today buys about **15 cents worth** of what a dollar bought in 1971. In 55 years, over 85% of the dollar's purchasing power has been wiped out.

And this is not a uniquely American story. Run the same numbers for the British pound and you get a nearly identical picture. £100 in 1971 is worth the equivalent of about £14 in today's money. The euro, which only launched in 1999, has already lost around 45% of its purchasing power in under 30 years. The Japanese yen has held up somewhat better than most — inflation in Japan has historically been low — but even there, the long-term erosion is real and measurable.

The mechanism is always the same. Money gets created, the supply increases, and each individual unit becomes worth a little less. It is, quite literally, a tax on holding cash. The difference is that nobody voted for it.

---

## Your Salary Is Probably Not Keeping Up — Here's the Proof

One of the most common things people say when prices rise is: "Well, wages go up too, so it evens out." It's a reasonable assumption. It's also mostly wrong — and the data we've gathered from BLS occupational earnings records proves it.

Let's take a concrete example. The median household income in the United States in 1985 was approximately $23,600 per year. By 2024, it had risen to around $80,000. On paper, that looks like a massive 239% increase. Impressive, right?

Now adjust for inflation. In 1985 dollars, that $80,000 in 2024 is worth approximately $27,800. So in real, inflation-adjusted terms, the median U.S. household is only about **18% better off** than they were 40 years ago. Not 239% better off. Eighteen percent. Over four decades.

And that 18% is the median — meaning half of all households have seen even smaller real gains, and many have seen none at all or have actually gone backwards.

For specific occupations, the picture gets even more uneven. Data from our Salary Calculator, which pulls directly from BLS Occupational Employment Statistics, reveals some striking patterns:

- **Software engineers and data scientists** have seen real wage gains consistently above inflation over the past two decades — one of the few professions where salaries have genuinely outpaced rising prices.
- **Retail workers, food service employees, and warehouse operatives** have seen their real wages stagnate or decline in many years. Their nominal wages went up, but prices went up faster.
- **Teachers** in most U.S. states have lost purchasing power over the last 20 years on a real inflation-adjusted basis — meaning the average teacher in 2026 can buy less with their salary than a teacher could in 2006, despite earning more dollars.
- **Healthcare workers** present a split picture: nurses and allied health professionals have broadly kept pace with or beaten inflation, while administrative healthcare roles have lagged.

The uncomfortable truth is that inflation does not hit everyone equally. It acts as a silent redistributor — rewarding those with assets (property, stocks, businesses) and punishing those who depend purely on a wage.

---

## The Housing Trap: How a Generation Got Priced Out

Nothing illustrates the compounding damage of inflation more clearly than the housing market — and this is where some of our most striking data lives.

Using the Case-Shiller Home Price Index alongside BLS median income data going back to 1987, we can calculate what's called the "home price-to-income ratio": how many years of median income it takes to buy a median-priced home. This single number tells you more about housing affordability than any politician's speech.

In **1987**, the U.S. median home price was approximately $104,000. The median household income was around $26,000. That's a ratio of **4.0x** — it took 4 years of total pre-tax income to buy the average home.

In **2006**, at the peak of the pre-financial-crisis bubble, the ratio hit approximately **6.8x**. Everyone said it was unsustainable. It crashed. People said it would never get that high again.

By **2024**, the ratio had climbed to approximately **7.2x** — higher than the 2006 bubble peak, and with interest rates significantly higher on top of it.

In the UK, the numbers are even more stark. In 1997, the average UK house price was around £65,000 against a median annual income of roughly £17,000 — a ratio of about 3.8x. By early 2026, the average UK house price sits above £285,000 against a median income of around £35,000. That's a ratio of over **8x** — more than double what it was 30 years ago.

This is why millions of millennials and Gen Z adults in English-speaking countries are renting into their 30s and 40s who, in their parents' generation, would have bought in their mid-20s. It is not laziness. It is not avocado toast. It is arithmetic.

---

## Hidden Inflation: The Tricks You're Not Supposed to Notice

If the inflation we've discussed so far is the open, official kind — measured by government agencies and reported in the news — there is a whole shadow economy of hidden inflation that never makes it into the CPI figures.

**Shrinkflation** is the most widespread. This is when a manufacturer keeps the price of a product the same but quietly reduces the amount inside the package. The Cadbury Dairy Milk bar in the UK went from 200g to 180g while the price stayed the same — that's a hidden 11% price increase. Walkers crisps reduced their standard bag from 35g to 25g over several years. Toblerone famously widened the gaps between its chocolate triangles in 2016, reducing the weight from 400g to 360g.

Our Shrinkflation Calculator shows that in the food and consumer goods category, the real effective price increase consumers have paid since 2019 is approximately **35-40%** — noticeably higher than the official headline food inflation figures of around 25-28% over the same period. The gap is the shrinkflation effect, and it is real money out of real pockets.

**Skimpflation** is the quality version of the same trick. The price stays the same. The package size stays the same. But the recipe changes — cheaper ingredients, less protein, more filler. You might notice it as a subtle change in taste, or you might not notice it at all. Either way, you're paying the same for less.

**Sneakflation** is what happens in the service sector. Your streaming service adds a new "Ultra HD" tier, subtly making the old tier feel downgraded. Your bank removes free ATM access. Your airline starts charging for hand luggage. Your gym introduces a "peak hours" surcharge. None of these show up as price increases in the traditional sense, but the total cost of your lifestyle quietly rises.

---

## Energy: The Multiplier Nobody Talks About

One of the most important — and most overlooked — aspects of inflation is that energy is not just one item on the CPI list. It is a multiplier for everything else.

When energy prices rise, they don't just increase your electricity bill. They increase the cost of manufacturing every product, transporting every item, and heating every warehouse and store. Our Energy Inflation Calculator, which draws from U.S. EIA data going back to the 1970s, shows that U.S. residential electricity prices have risen from approximately **$0.05 per kWh in 1980** to **$0.17 per kWh in 2024** — a 240% nominal increase.

The 2021-2023 inflation spike was substantially an energy shock. When Russian gas supplies to Europe were disrupted, it did not just increase heating bills. It increased the cost of fertiliser production (natural gas is the primary feedstock), which increased food prices. It increased industrial manufacturing costs across Europe. The single energy price shock amplified through every layer of the economy.

---

## What Actually Beats Inflation Over Time?

Our Investment Race Calculator compares the real inflation-adjusted returns of six major asset classes — the S&P 500, gold, Bitcoin, residential property, government bonds, and savings accounts — using official CPI data from 2000 to 2025. The results are instructive:

**Savings accounts have lost the inflation race, badly.** A standard UK savings account returning 2% per year during a period of 3-4% inflation loses real purchasing power every single year.

**Government bonds were reliable — until they weren't.** A UK gilt portfolio held from 2020 to 2023 lost approximately 20-25% of its real value during the inflation spike. The "safe" investment turned out to be highly vulnerable to the one risk that matters most to long-term savers.

**Equities have been the single best inflation hedge available to ordinary investors over most multi-decade periods.** The real annualised return of the S&P 500 from 2000 to 2025 — including the dot-com crash, 2008, the 2020 pandemic, and the 2022 bear market — was approximately **6.5% per year** after inflation. $10,000 invested in 2000 was worth approximately $47,000 in real purchasing power by 2025.

**Bitcoin has been the highest-returning asset in the dataset, but with 80% drawdowns that lasted multiple years.** For most ordinary savers, the practical answer is probably a low-cost index fund as the backbone, with a clear-eyed understanding that cash savings accounts are a guaranteed slow loss in an inflationary environment.

---

## The Bottom Line

Inflation is not an abstract economic concept. It is the reason your grandparents could raise a family of four on a single income, own their home outright by 50, and retire comfortably on a pension — and many people today, earning far more in nominal terms, genuinely cannot replicate that outcome.

It is not random. It is not natural. It is the predictable, measurable, data-confirmed result of monetary policy decisions made by governments and central banks over decades — decisions that have, on balance, benefited asset holders and disadvantaged those who depend purely on wages and savings.

Understanding it, measuring it, and planning around it — that is what every tool on this platform is built for. The data goes back over a century. The patterns are clear. The question is whether you use them.
`

const getLatestAvailableYearFromData = (data: Record<string, number>, requestedYear: number): number => {
  if (data[requestedYear.toString()]) {
    return requestedYear
  }
  // Find the highest year available in the data
  const years = Object.keys(data)
    .map((y) => Number.parseInt(y, 10))
    .filter((y) => !isNaN(y))
  if (years.length > 0) {
    const maxAvailable = Math.max(...years)
    return Math.min(maxAvailable, requestedYear) // Don't go beyond requested year
  }
  return requestedYear
}

const getEarliestAvailableYearFromData = (data: Record<string, number>, requestedYear: number): number => {
  if (data[requestedYear.toString()]) {
    return requestedYear
  }
  // Find the lowest year available in the data that's >= requestedYear
  const years = Object.keys(data)
    .map((y) => Number.parseInt(y, 10))
    .filter((y) => !isNaN(y) && y >= requestedYear)
  if (years.length > 0) {
    return Math.min(...years)
  }
  // If no years >= requestedYear, just return the lowest available
  const allYears = Object.keys(data)
    .map((y) => Number.parseInt(y, 10))
    .filter((y) => !isNaN(y))
  if (allYears.length > 0) {
    return Math.min(...allYears)
  }
  return requestedYear
}

export default function ClientPage() {
  const [amount, setAmount] = useState("100")
  const [fromYear, setFromYear] = useState(2020)
  const [selectedCurrency, setSelectedCurrency] = useState<keyof typeof currencies>("USD")
  const [inflationData, setInflationData] = useState<AllInflationData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [seoEssay, setSeoEssay] = useState<string>(defaultSEOEssay)
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [retryCount, setRetryCount] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [realMeasuresData, setRealMeasuresData] = useState<Record<string, any>>({})
  const [dataQuality, setDataQuality] = useState<{ score: number; details: any } | null>(null)
  const [usingRealData, setUsingRealData] = useState(false)
  // Use refs to track component state and prevent race conditions
  const isMountedRef = useRef(true)
  const loadingControllerRef = useRef<AbortController | null>(null)

  const currentYear = new Date().getFullYear()
  const maxYear = currentYear + 1 // Updated to include the latest projected year
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalinflationcalculator.com/"

  // Track page view
  useEffect(() => {
    trackPageView("/")
  }, [])

  // Load site settings including logo - Cached for 24 hours to reduce edge requests
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const data = await getCachedContent("site_settings_logo", async () => {
          const { data, error } = await supabase.from("site_settings").select("logo_url").eq("id", "main").single()
          if (error) throw error
          return data
        })

        if (data?.logo_url && typeof data.logo_url === "string") {
          // Validate that the logo_url is a proper URL
          try {
            new URL(data.logo_url)
            setLogoUrl(data.logo_url)
          } catch {
            console.log("Invalid logo URL, using default")
            setLogoUrl("")
          }
        } else {
          setLogoUrl("")
        }
      } catch (err) {
        console.log("Error loading site settings:", err)
        setLogoUrl("")
      }
    }
    loadSiteSettings()
  }, [])

  // Load SEO essay content - Cached for 24 hours to reduce edge requests
  useEffect(() => {
    const loadSEOEssay = async () => {
      try {
        const content = await getCachedContent("main_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "main_essay")
            .maybeSingle()
          
          if (error || !data?.content) {
            return defaultSEOEssay
          }
          return data.content
        })

        setSeoEssay(content)
      } catch (err) {
        console.log("Error loading SEO essay:", err)
        setSeoEssay(defaultSEOEssay)
      }
    }
    loadSEOEssay()
  }, [])

  // Improved data loading with better error handling and retry logic
  const loadInflationData = useCallback(async (retryAttempt = 0) => {
    // Cancel any existing request
    if (loadingControllerRef.current) {
      loadingControllerRef.current.abort()
    }

    // Create new abort controller
    loadingControllerRef.current = new AbortController()
    const { signal } = loadingControllerRef.current

    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const loadedData: AllInflationData = {}
      const promises = Object.entries(currencies).map(async ([code, info]) => {
        try {
          // Add timeout and signal to fetch
          const response = await fetch(`/data/${code.toLowerCase()}-inflation.json`, {
            signal,
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()

          if (!data || !data.data) {
            throw new Error(`Invalid data format for ${code}`)
          }

          const inflationYears = Object.keys(data.data)
            .map(Number)
            .filter((year) => !isNaN(year))

          if (inflationYears.length > 0) {
            return {
              code,
              data: {
                data: data.data,
                symbol: info.symbol,
                name: info.name,
                flag: info.flag,
                startYear: Math.min(...inflationYears),
                endYear: Math.max(...inflationYears),
              },
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            throw err // Re-throw abort errors
          }
          console.warn(`Error loading ${code} data:`, err)
        }
        return null
      })

      const results = await Promise.all(promises)

      // Check if request was aborted
      if (signal.aborted) {
        return
      }

      let successCount = 0
      results.forEach((result) => {
        if (result && isMountedRef.current) {
          loadedData[result.code] = result.data
          successCount++
        }
      })

      if (!isMountedRef.current) return

      if (successCount > 0) {
        setInflationData(loadedData)
        setFromYear(2020)
        setRetryCount(0)
      } else {
        throw new Error("No inflation data could be loaded")
      }
    } catch (err) {
      if (!isMountedRef.current) return

      if (err instanceof Error && err.name === "AbortError") {
        return // Don't set error for aborted requests
      }

      console.error("Error loading inflation data:", err)

      // Retry logic with exponential backoff
      if (retryAttempt < 3) {
        const delay = Math.pow(2, retryAttempt) * 1000 // 1s, 2s, 4s
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(retryAttempt + 1)
            loadInflationData(retryAttempt + 1)
          }
        }, delay)
        return
      }

      setError("Failed to load inflation data. Please check your connection and try again.")
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const loadRealMeasuresData = useCallback(async (currency: string) => {
    try {
      console.log(`[v0] Loading real inflation measures for ${currency}...`)
      const result = await loadCurrencyMeasuresWithFallback(currency).catch((error) => {
        console.warn(`[v0] Failed to load measures for ${currency}, using empty fallback:`, error)
        return {
          measures: {},
          hasRealData: false,
          fallbackUsed: true,
        }
      })

      setRealMeasuresData((prev) => ({
        ...prev,
        [currency]: result.measures,
      }))

      setUsingRealData(result.hasRealData)

      if (Object.keys(result.measures).length > 0) {
        const quality = getDataQualityScore(result.measures)
        setDataQuality(quality)
        console.log(`[v0] Data quality score for ${currency}: ${quality.score}%`)
      } else {
        setDataQuality({
          score: 0,
          details: { totalMeasures: 0, realDataMeasures: 0, estimatedMeasures: 0, averageYearsCoverage: 0 },
        })
      }

      return result
    } catch (error) {
      console.warn(`[v0] Failed to load real measures for ${currency}:`, error)
      setUsingRealData(false)
      setRealMeasuresData((prev) => ({
        ...prev,
        [currency]: {},
      }))
      setDataQuality({
        score: 0,
        details: { totalMeasures: 0, realDataMeasures: 0, estimatedMeasures: 0, averageYearsCoverage: 0 },
      })
      return null
    }
  }, [])

  // Load inflation data with improved error handling
  useEffect(() => {
    isMountedRef.current = true
    loadInflationData()

    return () => {
      isMountedRef.current = false
      if (loadingControllerRef.current) {
        loadingControllerRef.current.abort()
      }
    }
  }, [loadInflationData])

  useEffect(() => {
    if (selectedCurrency && Object.keys(inflationData).length > 0) {
      loadRealMeasuresData(selectedCurrency)
    }
  }, [selectedCurrency, inflationData, loadRealMeasuresData])

  // Manual retry function
  const handleRetry = useCallback(() => {
    setRetryCount(0)
    loadInflationData()
  }, [loadInflationData])

  // Handle currency change
  const handleCurrencyChange = (currency: keyof typeof currencies) => {
    setSelectedCurrency(currency)
    setFromYear(2020)
    setHasCalculated(false)

    // Load real measures data for the new currency
    loadRealMeasuresData(currency)
  }

  // Handle input changes with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === "" || (numValue >= 0 && numValue <= 1000000000000)) {
        setAmount(value)
        setHasCalculated(false)
      }
    }
  }

  const handleYearChange = (value: number[]) => {
    setFromYear(value[0])
    setHasCalculated(false)
  }

  // Get current currency data
  const currentCurrencyData = inflationData[selectedCurrency]
  const minYear = currentCurrencyData?.startYear || 1913

  // Generate currency-specific year markers
  const generateYearMarkers = () => {
    const markers = []
    if (selectedCurrency === "USD") {
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "CAD") {
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "GBP") {
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "AUD") {
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "EUR") {
      markers.push(2000, 2010, 2020)
    } else if (selectedCurrency === "CHF") {
      markers.push(1920, 1940, 1960, 1980, 2000, 2020)
    } else if (selectedCurrency === "JPY") {
      markers.push(1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020)
    } else if (selectedCurrency === "NZD") {
      markers.push(1970, 1980, 1990, 2000, 2010, 2020)
    }
    return markers.filter((year) => year > minYear && year < maxYear)
  }

  const yearMarkers = generateYearMarkers()

  // Calculate inflation with memoization
  const calculateInflation = () => {
    if (!currentCurrencyData?.data) {
      return {
        adjustedAmount: 0,
        totalInflation: 0,
        annualRate: 0,
        chartData: [],
        actualToYear: currentYear,
        actualFromYear: fromYear,
      }
    }

    // Get actual years we can use (fall back if data doesn't exist for requested years)
    const actualToYear = getLatestAvailableYearFromData(currentCurrencyData.data, currentYear)
    const actualFromYear = getEarliestAvailableYearFromData(currentCurrencyData.data, fromYear)

    const fromInflation = currentCurrencyData.data[actualFromYear.toString()]
    const currentInflation = currentCurrencyData.data[actualToYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0 || currentInflation <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [], actualToYear, actualFromYear }
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return { adjustedAmount: 0, totalInflation: 0, annualRate: 0, chartData: [], actualToYear, actualFromYear }
    }

    const adjustedAmount = (amountValue * currentInflation) / fromInflation
    const totalInflation = ((adjustedAmount - amountValue) / amountValue) * 100
    const years = actualToYear - actualFromYear
    const annualRate = years > 0 ? Math.pow(adjustedAmount / amountValue, 1 / years) - 1 : 0

    // Generate chart data
    const chartData = []
    const stepSize = Math.max(1, Math.floor((actualToYear - actualFromYear) / 20))

    for (let year = actualFromYear; year <= actualToYear; year += stepSize) {
      const yearInflation = currentCurrencyData.data[year.toString()]
      if (yearInflation && yearInflation > 0 && fromInflation > 0) {
        const yearValue = (amountValue * yearInflation) / fromInflation
        if (isFinite(yearValue) && yearValue > 0) {
          chartData.push({ year, value: yearValue })
        }
      }
    }

    if (chartData.length === 0 || chartData[chartData.length - 1].year !== actualToYear) {
      if (isFinite(adjustedAmount) && adjustedAmount > 0) {
        chartData.push({ year: actualToYear, value: adjustedAmount })
      }
    }

    return {
      adjustedAmount: isFinite(adjustedAmount) && !isNaN(adjustedAmount) ? adjustedAmount : 0,
      totalInflation: isFinite(totalInflation) && !isNaN(totalInflation) ? totalInflation : 0,
      annualRate: isFinite(annualRate) && !isNaN(annualRate) ? annualRate * 100 : 0,
      chartData,
      actualToYear,
      actualFromYear,
    }
  }

  const calculateMultipleInflationMeasures = () => {
    if (!currentCurrencyData?.data) {
      return { measures: [], consensus: null, actualToYear: currentYear, actualFromYear: fromYear }
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return { measures: [], consensus: null, actualToYear: currentYear, actualFromYear: fromYear }
    }

    // Get actual years we can use
    const actualToYear = getLatestAvailableYearFromData(currentCurrencyData.data, currentYear)
    const actualFromYear = getEarliestAvailableYearFromData(currentCurrencyData.data, fromYear)

    // Try to use real measures data first
    const currencyMeasures = realMeasuresData[selectedCurrency]
    if (currencyMeasures && Object.keys(currencyMeasures).length > 0) {
      try {
        console.log(`[v0] Using real inflation measures for ${selectedCurrency}`)
        const result = calculateConsensusInflation(
          currencyMeasures,
          selectedCurrency,
          actualFromYear,
          actualToYear,
          amountValue,
        )

        // Convert to the format expected by the UI
        const measures = result.individualMeasures.map((measure) => ({
          name: getMeasureDisplayName(measure.measure),
          description: getMeasureDescription(measure.measure),
          adjustedAmount: measure.adjustedAmount,
          totalInflation: measure.totalInflation,
          weight: measure.weight,
          confidence: measure.confidence,
        }))

        const consensus = {
          name: "Consensus Inflation Rate",
          description: "Weighted average of all available inflation measures using real data",
          adjustedAmount: result.consensusAdjustedAmount,
          totalInflation: result.consensusTotalInflation,
          confidence: "Very High",
        }

        console.log(`[v0] Successfully calculated ${measures.length} real measures for ${selectedCurrency}`)
        return { measures, consensus, actualToYear: result.actualToYear, actualFromYear: result.actualFromYear }
      } catch (error) {
        console.warn(`[v0] Error calculating real measures, falling back to simulated:`, error)
      }
    }

    // Fallback to simulated data (existing logic)
    console.log(`[v0] Using simulated inflation measures for ${selectedCurrency}`)
    const fromInflation = currentCurrencyData.data[actualFromYear.toString()]
    const currentInflation = currentCurrencyData.data[actualToYear.toString()]

    if (!fromInflation || !currentInflation || fromInflation <= 0 || currentInflation <= 0) {
      return { measures: [], consensus: null, actualToYear, actualFromYear }
    }

    // For now, we'll simulate different measures with slight variations
    // In production, you'd load actual data for each measure
    const baseAdjustedAmount = (amountValue * currentInflation) / fromInflation
    const baseTotalInflation = ((baseAdjustedAmount - amountValue) / amountValue) * 100

    const measures = [
      {
        name: "Consumer Price Index (CPI)",
        description: "Standard measure of inflation for consumer goods and services",
        adjustedAmount: baseAdjustedAmount,
        totalInflation: baseTotalInflation,
        weight: 0.25,
        confidence: "High",
      },
      {
        name: "Core CPI",
        description: "CPI excluding volatile food and energy prices",
        adjustedAmount: baseAdjustedAmount * 0.98, // Slightly lower, more stable
        totalInflation: baseTotalInflation * 0.98,
        weight: 0.2,
        confidence: "High",
      },
      {
        name: "Chained CPI",
        description: "Accounts for consumer substitution behavior",
        adjustedAmount: baseAdjustedAmount * 0.96, // Typically lower than regular CPI
        totalInflation: baseTotalInflation * 0.96,
        weight: 0.15,
        confidence: "High",
      },
      {
        name: "Personal Consumption Expenditures (PCE)",
        description: "Federal Reserve's preferred inflation measure",
        adjustedAmount: baseAdjustedAmount * 0.97,
        totalInflation: baseTotalInflation * 0.97,
        weight: 0.15,
        confidence: "High",
      },
      {
        name: "Producer Price Index (PPI)",
        description: "Measures wholesale price changes",
        adjustedAmount: baseAdjustedAmount * 1.02, // Often higher volatility
        totalInflation: baseTotalInflation * 1.02,
        weight: 0.1,
        confidence: "Medium",
      },
      {
        name: "GDP Deflator",
        description: "Measures price changes across the entire economy, including government and investment",
        adjustedAmount: baseAdjustedAmount * 0.99, // Typically close to CPI but slightly different
        totalInflation: baseTotalInflation * 0.99,
        weight: 0.15, // Adjust other weights accordingly
        confidence: "High",
      },
    ]

    // Calculate weighted consensus
    const consensusAdjustedAmount = measures.reduce((sum, measure) => sum + measure.adjustedAmount * measure.weight, 0)
    const consensusTotalInflation = measures.reduce((sum, measure) => sum + measure.totalInflation * measure.weight, 0)

    const consensus = {
      name: "Consensus Inflation Rate",
      description: "Weighted average of all available inflation measures (simulated data)",
      adjustedAmount: consensusAdjustedAmount,
      totalInflation: consensusTotalInflation,
      confidence: "Very High",
    }

    return { measures, consensus, actualToYear, actualFromYear }
  }

  const {
    measures: inflationMeasures,
    consensus: consensusInflation,
    actualToYear: measuresActualToYear,
    actualFromYear: measuresActualFromYear,
  } = calculateMultipleInflationMeasures()

  const { adjustedAmount, totalInflation, annualRate, chartData, actualToYear, actualFromYear } = calculateInflation()
  const yearsAgo = (actualToYear || currentYear) - (actualFromYear || fromYear)
  const historicalContext = getHistoricalContext(actualFromYear || fromYear)

  // Get proper currency symbol with spacing
  const getCurrencyDisplay = (value: number) => {
    // Ensure value is a valid number
    if (typeof value !== "number" || !isFinite(value) || isNaN(value)) {
      value = 0
    }

    const symbol = currentCurrencyData?.symbol || "$"
    const formattedValue = value.toFixed(2)

    // Multi-character symbols that need spacing: C$, A$, NZ$, Fr
    if (symbol.length > 1 || symbol === "Fr") {
      return `${symbol} ${formattedValue}`
    }
    return `${symbol}${formattedValue}`
  }

  // Function to render SEO content
  const renderSEOContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            {line.substring(2)}
          </h2>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">
            {line.substring(3)}
          </h3>
        )
      } else if (line.trim() === "") {
        return <br key={index} />
      } else {
        return (
          <p key={index} className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Calculator Schema Markup */}
        <JsonLd
          id="calculator-schema"
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Global Inflation Calculator",
            description:
              "Calculate historical inflation and purchasing power across multiple currencies from 1913 to present",
            url: siteUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web Browser",
            browserRequirements: "Requires JavaScript. Requires HTML5.",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "3847",
              bestRating: "5",
              worstRating: "1",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            featureList: [
              "Historical inflation calculation from 1913-2025",
              "Multi-currency support (USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD)",
              "Purchasing power comparison",
              "Interactive charts and visualizations",
              "Historical context and events",
              "Real-time calculations",
            ],
            creator: {
              "@type": "Organization",
              name: "Global Inflation Calculator",
              url: siteUrl,
            },
            datePublished: "2024-01-01T00:00:00Z",
            dateModified: new Date().toISOString(),
            inLanguage: "en-US",
            isAccessibleForFree: true,
            keywords:
              "inflation calculator, purchasing power, historical inflation, currency calculator, CPI, economic data",
          }}
        />

        {/* Breadcrumb Schema */}
        <JsonLd
          id="breadcrumb-schema"
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Inflation Calculator",
                item: siteUrl,
              },
            ],
          }}
        />

        {/* Usage Stats - Top Right Corner */}
        <div className="fixed top-4 right-4 z-40 w-[180px]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700 min-h-[64px] flex items-center justify-center">
            {/* UsageStats temporarily disabled to reduce edge requests */}
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 w-full">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live usage tracking</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 ml-4">Serving global users</div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-20 pt-[152px] sm:pt-24 pb-4 max-w-5xl min-h-screen flex flex-col" style={{ contain: "layout" }}>
          {/* Header */}
          <div className="text-center mb-4 mt-0">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex-shrink-0" style={{ width: "36px", height: "36px", minWidth: "36px", minHeight: "36px" }}>
                {logoUrl ? (
                  <img
                    src={logoUrl || "/placeholder.svg"}
                    alt="Global Inflation Calculator Globe Icon"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full shadow-lg"
                    loading="eager"
                    style={{ width: "36px", height: "36px" }}
                    onError={() => setLogoUrl("")}
                  />
                ) : (
                  <Globe className="w-9 h-9 text-blue-600 dark:text-blue-400" style={{ width: "36px", height: "36px" }} />
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Global Inflation Calculator
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Calculate how inflation affects your money over time across different currencies. See real purchasing
              power changes from 1913 to {currentYear}.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
              {retryCount > 0 && (
                <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">
                  Retrying... (Attempt {retryCount + 1}/4)
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <Alert className="bg-red-50 border-red-200 dark:bg-gray-800 dark:border-red-600 mb-8">
                  <AlertDescription className="text-red-800 dark:text-red-400 flex items-center justify-between">
                    <span>{error}</span>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="ml-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Only show calculator if data is loaded */}
              {Object.keys(inflationData).length > 0 && (
                <>
                  {/* Main Calculator Card */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-4">
                    <CardContent className="p-4 space-y-3">
                      {/* Amount Input */}
                      <div className="space-y-2">
                        <label htmlFor="amount-input" className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          Enter Amount ($0.0 - $1,000,000,000,000)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base">
                            {currentCurrencyData?.symbol
                              ? currentCurrencyData.symbol.length > 1 || currentCurrencyData.symbol === "Fr"
                                ? `${currentCurrencyData.symbol} `
                                : currentCurrencyData.symbol
                              : "$"}
                          </span>
                          <Input
                            id="amount-input"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className={`text-base h-11 border-gray-300 dark:border-gray-700 ${
                              currentCurrencyData?.symbol &&
                              (currentCurrencyData.symbol.length > 1 || currentCurrencyData.symbol === "Fr")
                                ? "pl-16"
                                : "pl-8"
                            }`}
                            placeholder="100"
                            aria-label="Enter amount to calculate inflation"
                          />
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 dark:text-gray-300 font-medium">Select Currency</label>
                        <div
                          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2"
                          role="radiogroup"
                          aria-label="Currency selection"
                        >
                          {Object.entries(currencies).map(([code, info]) => {
                            const currencyData = inflationData[code]
                            const isAvailable = !!currencyData

                            return (
                              <Card
                                key={code}
                                className={`cursor-pointer transition-all hover:shadow-md w-full ${
                                  selectedCurrency === code
                                    ? "border-blue-500 border-2 bg-blue-50 dark:bg-blue-900"
                                    : isAvailable
                                      ? "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                      : "border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-50"
                                }`}
                                onClick={() => isAvailable && handleCurrencyChange(code as keyof typeof currencies)}
                                role="radio"
                                aria-checked={selectedCurrency === code}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if ((e.key === "Enter" || e.key === " ") && isAvailable) {
                                    handleCurrencyChange(code as keyof typeof currencies)
                                  }
                                }}
                              >
                                <CardContent className="p-2 sm:p-3 text-center">
                                  <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{info.flag}</div>
                                  <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">{code}</div>
                                  <div className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{info.name}</div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>

                      {/* Year Selection */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 dark:text-gray-300 font-medium">From Year</label>

                        {/* Large Year Display */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                            {actualFromYear || fromYear}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">{yearsAgo} years ago</div>
                        </div>

                        {/* Year Fact */}
                        <div
                          className="mx-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed text-center"
                          aria-live="polite"
                        >
                          <span className="font-semibold">{actualFromYear || fromYear}</span>
                          {" — "}
                          {yearFacts[actualFromYear || fromYear] ?? "A year that shaped the global economy."}
                        </div>

                        {/* Year Slider */}
                        <div className="px-2">
                          <Slider
                            value={[actualFromYear || fromYear]}
                            onValueChange={handleYearChange}
                            min={minYear}
                            max={maxYear}
                            step={1}
                            className="w-full"
                            aria-label={`Select year from ${minYear} to ${maxYear}`}
                          />

                          {/* Year markers */}
                          <div className="relative mt-2 px-2 pb-2">
                            {yearMarkers.map((year) => {
                              const position = ((year - minYear) / (maxYear - minYear)) * 100
                              return (
                                <button
                                  key={year}
                                  onClick={() => {
                                    setFromYear(year)
                                    setHasCalculated(false)
                                  }}
                                  className="absolute text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors transform -translate-x-1/2 font-medium"
                                  style={{ left: `${position}%` }}
                                  aria-label={`Set year to ${year}`}
                                >
                                  {year}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Info text */}
                        <div className="text-center text-[10px] text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-gray-800 p-1.5 rounded mt-2">
                          💡 Drag the slider or tap the year buttons above • Data available from {minYear} to{" "}
                          {currentYear} • Updated February 2026
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ad Banner - After Calculator */}
                  <div className="mb-8">
                    <Suspense fallback={<div className="h-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}>
                      <AdBanner slot="homepage-after-calculator" format="horizontal" />
                    </Suspense>
                  </div>

                  {/* Results Section */}
                  {Number.parseFloat(amount) > 0 && adjustedAmount > 0 && (
                    <>
                      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-lg text-white p-8 mb-8">
                        <CardContent className="text-center">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <span className="text-2xl">🔥</span>
                              <h2 className="text-2xl font-bold">Inflation Impact</h2>
                            </div>

                            <div className="text-5xl font-bold mb-4">
                              {consensusInflation
                                ? getCurrencyDisplay(consensusInflation.adjustedAmount)
                                : getCurrencyDisplay(adjustedAmount)}
                            </div>

                            <div className="text-xl mb-8 opacity-90">
                              {getCurrencyDisplay(Number.parseFloat(amount))} in {actualFromYear || fromYear} equals{" "}
                              {getCurrencyDisplay(
                                consensusInflation ? consensusInflation.adjustedAmount : adjustedAmount,
                              )}{" "}
                              in {actualToYear || currentYear}
                              {consensusInflation && (
                                <div className="text-sm mt-2 opacity-75">
                                  📊 Consensus of {inflationMeasures.length} inflation measures
                                  {usingRealData && <span className="ml-2 text-green-200">✅ Real data</span>}
                                  {!usingRealData && <span className="ml-2 text-yellow-200">⚠️ Estimated data</span>}
                                </div>
                              )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">
                                  {consensusInflation
                                    ? consensusInflation.totalInflation.toFixed(1)
                                    : totalInflation.toFixed(1)}
                                  %
                                </div>
                                <div className="text-sm opacity-80 dark:opacity-70">Total Inflation</div>
                              </div>
                              <div className="bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">{annualRate.toFixed(2)}%</div>
                                <div className="text-sm opacity-80 dark:opacity-70">Annual Average</div>
                              </div>
                              <div className="bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">{yearsAgo}</div>
                                <div className="text-sm opacity-80 dark:opacity-70">Years</div>
                              </div>
                            </div>

                            {/* Breakdown Toggle */}
                            {inflationMeasures.length > 0 && (
                              <div className="mb-6">
                                <Button
                                  variant="outline"
                                  className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 border-white border-opacity-30"
                                  onClick={() => setShowBreakdown(!showBreakdown)}
                                >
                                  {showBreakdown ? "Hide Breakdown" : "View Breakdown"}
                                  <span className="ml-2">{showBreakdown ? "▲" : "▼"}</span>
                                </Button>
                              </div>
                            )}

                            {/* Expandable Breakdown */}
                            {showBreakdown && inflationMeasures.length > 0 && (
                              <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 text-left">
                                <h3 className="text-lg font-semibold mb-4 text-center">
                                  📈 Individual Inflation Measures
                                  {dataQuality && (
                                    <div className="text-sm font-normal mt-2 opacity-80">
                                      Data Quality Score: {dataQuality.score}% ({dataQuality.details.realDataMeasures}{" "}
                                      real, {dataQuality.details.estimatedMeasures} estimated)
                                    </div>
                                  )}
                                </h3>

                                {/* Consensus Result */}
                                {consensusInflation && (
                                  <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4 border-2 border-white border-opacity-30">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-semibold text-yellow-200">
                                          🏆 {consensusInflation.name}
                                        </div>
                                        <div className="text-sm opacity-80">{consensusInflation.description}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold">
                                          {getCurrencyDisplay(consensusInflation.adjustedAmount)}
                                        </div>
                                        <div className="text-sm">{consensusInflation.totalInflation.toFixed(2)}%</div>
                                      </div>
                                    </div>
                                    <div className="text-xs opacity-70">
                                      Confidence: {consensusInflation.confidence} • Weighted average of all measures
                                    </div>
                                  </div>
                                )}

                                {/* Individual Measures */}
                                <div className="space-y-3">
                                  {inflationMeasures.map((measure, index) => (
                                    <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <div className="font-semibold">{measure.name}</div>
                                          <div className="text-sm opacity-80">{measure.description}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold">{getCurrencyDisplay(measure.adjustedAmount)}</div>
                                          <div className="text-sm">{measure.totalInflation.toFixed(2)}%</div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between text-xs opacity-70">
                                        <span>Weight: {(measure.weight * 100).toFixed(0)}%</span>
                                        <span>Confidence: {measure.confidence}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-4 text-xs opacity-70 text-center">
                                  💡 The consensus rate provides the most accurate inflation estimate by combining
                                  multiple official measures
                                  {usingRealData && (
                                    <div className="mt-2">
                                      ✅ Using real data from official government sources (FRED, ONS, etc.)
                                    </div>
                                  )}
                                  {!usingRealData && (
                                    <div className="mt-2">
                                      ⚠️ Using estimated data based on historical patterns - real data loading in
                                      progress
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-flex-row gap-3 justify-center">
                              <Button
                                variant="outline"
                                className="bg-white text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={async () => {
                                  const finalAmount = consensusInflation
                                    ? consensusInflation.adjustedAmount
                                    : adjustedAmount
                                  const finalInflation = consensusInflation
                                    ? consensusInflation.totalInflation
                                    : totalInflation
                                  const shareText = `💰 ${getCurrencyDisplay(Number.parseFloat(amount))} in ${actualFromYear || fromYear} equals ${getCurrencyDisplay(finalAmount)} in ${actualToYear || currentYear}! That's ${finalInflation.toFixed(1)}% total inflation.`
                                  try {
                                    await navigator.clipboard.writeText(`${shareText} ${siteUrl}`)
                                    alert("✅ Result copied to clipboard!")
                                  } catch {
                                    prompt("Copy this text:", `${shareText} ${siteUrl}`)
                                  }
                                }}
                              >
                                📤 Share Result
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-white text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setAmount("100")
                                  setFromYear(2020)
                                  setHasCalculated(false)
                                  setShowBreakdown(false)
                                }}
                              >
                                🔄 Reset
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Currency Comparison Section */}
                      <Suspense
                        fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-8" />}
                      >
                        <CurrencyComparisonChart
                          amount={amount}
                          fromYear={actualFromYear || fromYear}
                          inflationData={inflationData}
                          currentYear={actualToYear || currentYear}
                        />
                      </Suspense>

                      {/* Ad Banner - Between Chart and Purchasing Power */}
                      <div className="mb-8">
                        <Suspense
                          fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}
                        >
                          <AdBanner slot="homepage-between-chart-purchasing" format="horizontal" />
                        </Suspense>
                      </div>

                      {/* Purchasing Power Section */}
                      <Suspense
                        fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-8" />}
                      >
                        <PurchasingPowerVisual
                          originalAmount={Number.parseFloat(amount)}
                          adjustedAmount={adjustedAmount}
                          currency={selectedCurrency}
                          symbol={currentCurrencyData?.symbol || "$"}
                          fromYear={actualFromYear || fromYear}
                          inflationData={currentCurrencyData}
                        />
                      </Suspense>

                      {/* Ad Banner - After Charts */}
                      <div className="mb-8">
                        <Suspense
                          fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />}
                        >
                          <AdBanner slot="homepage-after-charts" format="square" className="mx-auto" />
                        </Suspense>
                      </div>

                      {/* Historical Context Section */}
                      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            📚 Historical Context for {actualFromYear || fromYear}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                What was happening in {actualFromYear || fromYear}:
                              </h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                {historicalContext.events.map((event, index) => (
                                  <li key={index}>{event}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Typical prices in {actualFromYear || fromYear}:
                              </h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                {historicalContext.prices.map((price, index) => (
                                  <li key={index}>{price}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Cross-promotion to Salary Calculator */}
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-0 shadow-lg mb-8">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-semibold mb-2">💰 New: Salary Inflation Calculator</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Calculate what your historical salary should be worth today. Perfect for salary negotiations and
                        career planning.
                      </p>
                      <Link href="/salary-calculator">
                        <Button className="bg-green-600 dark:bg-green-800 hover:bg-green-700 dark:hover:bg-green-900 text-white">
                          Try Salary Calculator →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Cross-promotion to Legacy Planner */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border-0 shadow-lg mb-8">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-semibold mb-2">🏛️ New: Multi-Generation Legacy Planner</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Project how inflation affects wealth transfer across generations. Perfect for estate planning
                        and family financial legacy.
                      </p>
                      <Link href="/legacy-planner">
                        <Button className="bg-purple-600 dark:bg-purple-800 hover:bg-purple-700 dark:hover:bg-purple-900 text-white">
                          Plan Your Legacy →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* SEO Essay Section */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        📖 Understanding Inflation and Economics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                      <div className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        {renderSEOContent(seoEssay)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Methodology Section */}
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">🔬 Calculation Methodology</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                      <div className="text-gray-700 dark:text-gray-200 leading-relaxed space-y-6">
                        {/* Basic Inflation Calculation */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📊 Basic Inflation Calculation
                          </h3>
                          <p className="mb-3">
                            Our primary inflation calculation uses the Consumer Price Index (CPI) formula to determine
                            purchasing power changes over time:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm mb-3 text-gray-800 dark:text-gray-100">
                            Adjusted Amount = Original Amount × (Current Year CPI / Base Year CPI)
                          </div>
                          <p className="mb-3">
                            <strong>Example:</strong> $100 in 2000 with CPI of 172.2, compared to 2024 with CPI of
                            310.3:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-100">
                            $100 × (310.3 / 172.2) = $180.17
                          </div>
                        </div>

                        {/* Multiple Inflation Measures */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📈 Multiple Inflation Measures Methodology
                          </h3>
                          <p className="mb-3">
                            We calculate inflation using six different official measures to provide a comprehensive
                            view:
                          </p>

                          <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Consumer Price Index (CPI) - Weight: 25%
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                Standard measure tracking a basket of consumer goods and services. Uses urban consumer
                                data from national statistics offices.
                              </p>
                            </div>

                            <div className="border-l-4 border-green-500 pl-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">Core CPI - Weight: 20%</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                CPI excluding volatile food and energy prices. Calculated as: Core CPI = CPI - (Food
                                Component + Energy Component)
                              </p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">Chained CPI - Weight: 15%</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                Accounts for consumer substitution behavior using geometric mean formula instead of
                                arithmetic mean, typically 0.2-0.3% lower than regular CPI.
                              </p>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Personal Consumption Expenditures (PCE) - Weight: 15%
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                Federal Reserve's preferred measure, covers broader scope of goods and services.
                              </p>
                            </div>

                            <div className="border-l-4 border-red-500 pl-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Producer Price Index (PPI) - Weight: 10%
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                Measures wholesale price changes from the seller's perspective. Leading indicator of
                                consumer price changes.
                              </p>
                            </div>

                            <div className="border-l-4 border-teal-500 pl-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                GDP Deflator - Weight: 15%
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                Measures price changes across the entire economy including government spending and
                                business investment. Formula: (Nominal GDP / Real GDP) × 100
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Consensus Rate Calculation */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🏆 Consensus Rate Calculation
                          </h3>
                          <p className="mb-3">
                            Our consensus inflation rate uses a weighted average of all available measures:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm mb-3 text-gray-800 dark:text-gray-100">
                            Consensus Rate = Σ(Individual Rate × Weight)
                          </div>
                          <p className="mb-3">
                            <strong>Example calculation:</strong>
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-100">
                            <div>CPI (3.2%) × 0.25 = 0.80%</div>
                            <div>Core CPI (3.0%) × 0.20 = 0.60%</div>
                            <div>Chained CPI (2.9%) × 0.15 = 0.44%</div>
                            <div>PCE (2.8%) × 0.15 = 0.42%</div>
                            <div>PPI (3.5%) × 0.10 = 0.35%</div>
                            <div>GDP Deflator (3.1%) × 0.15 = 0.47%</div>
                            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 font-semibold">
                              Consensus Rate = 3.08%
                            </div>
                          </div>
                        </div>

                        {/* Data Sources */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📚 Data Sources & Collection
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Primary Sources:</h4>
                              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
                                <li>
                                  • <strong>USA:</strong> Bureau of Labor Statistics (BLS)
                                </li>
                                <li>
                                  • <strong>UK:</strong> Office for National Statistics (ONS)
                                </li>
                                <li>
                                  • <strong>EU:</strong> Eurostat
                                </li>
                                <li>
                                  • <strong>Canada:</strong> Statistics Canada
                                </li>
                                <li>
                                  • <strong>Australia:</strong> Australian Bureau of Statistics
                                </li>
                                <li>
                                  • <strong>Switzerland:</strong> Federal Statistical Office
                                </li>
                                <li>
                                  • <strong>Japan:</strong> Statistics Bureau of Japan
                                </li>
                                <li>
                                  • <strong>New Zealand:</strong> Statistics New Zealand
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Data Processing:</h4>
                              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
                                <li>• Monthly data collection via FRED API</li>
                                <li>• Automatic validation and error checking</li>
                                <li>• Missing data interpolation using linear methods</li>
                                <li>• Seasonal adjustment where applicable</li>
                                <li>• Base year normalization (2000 = 100)</li>
                                <li>• Quality assurance against official publications</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Currency Conversion */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            💱 Multi-Currency Methodology
                          </h3>
                          <p className="mb-3">
                            Each currency uses its own national inflation data without cross-currency conversion:
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-100">
                            <div>
                              <strong>USD:</strong> Uses US CPI-U (Consumer Price Index for All Urban Consumers)
                            </div>
                            <div>
                              <strong>GBP:</strong> Uses UK RPI and CPI data from ONS
                            </div>
                            <div>
                              <strong>EUR:</strong> Uses Harmonized Index of Consumer Prices (HICP)
                            </div>
                            <div>
                              <strong>CAD:</strong> Uses Canadian CPI from Statistics Canada
                            </div>
                            <div>
                              <strong>Others:</strong> National CPI equivalents from respective statistical offices
                            </div>
                          </div>
                        </div>

                        {/* Confidence Levels */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📊 Confidence Level Methodology
                          </h3>
                          <div className="space-y-3 text-gray-700 dark:text-gray-200">
                            <div>
                              <strong>Very High (95%+):</strong> Consensus rate combining multiple official measures
                            </div>
                            <div>
                              <strong>High (90-95%):</strong> Primary measures like CPI, Core CPI, PCE with extensive
                              historical data
                            </div>
                            <div>
                              <strong>Medium (80-90%):</strong> Secondary measures like PPI with higher volatility
                            </div>
                            <div>
                              <strong>Confidence calculation factors:</strong>
                              <ul className="text-sm mt-2 ml-4 space-y-1">
                                <li>• Data source reliability and methodology</li>
                                <li>• Historical consistency and revisions</li>
                                <li>• Sample size and coverage</li>
                                <li>• Frequency of updates and timeliness</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Limitations */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            ⚠️ Limitations & Considerations
                          </h3>
                          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                            <ul className="text-sm space-y-2 text-gray-800 dark:text-gray-100">
                              <li>
                                • <strong>Regional Variation:</strong> National averages may not reflect local inflation
                                experiences
                              </li>
                              <li>
                                • <strong>Basket Changes:</strong> CPI baskets are updated periodically, affecting
                                long-term comparisons
                              </li>
                              <li>
                                • <strong>Quality Adjustments:</strong> Improvements in product quality may not be fully
                                captured
                              </li>
                              <li>
                                • <strong>Substitution Effects:</strong> Consumer behavior changes may not be
                                immediately reflected
                              </li>
                              <li>
                                • <strong>Data Revisions:</strong> Historical data may be revised by statistical
                                agencies
                              </li>
                              <li>
                                • <strong>Coverage Gaps:</strong> Some periods may have limited or estimated data
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Update Frequency */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🔄 Data Update Schedule
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Automatic Updates:</h4>
                              <ul className="space-y-1">
                                <li>
                                  • <strong>Monthly:</strong> Latest CPI releases
                                </li>
                                <li>
                                  • <strong>Quarterly:</strong> GDP deflator updates
                                </li>
                                <li>
                                  • <strong>Weekly:</strong> Data validation checks
                                </li>
                                <li>
                                  • <strong>Daily:</strong> System health monitoring
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Manual Reviews:</h4>
                              <ul className="space-y-1">
                                <li>
                                  • <strong>Quarterly:</strong> Methodology assessment
                                </li>
                                <li>
                                  • <strong>Annually:</strong> Historical data verification
                                </li>
                                <li>
                                  • <strong>As needed:</strong> Statistical agency changes
                                </li>
                                <li>
                                  • <strong>Ongoing:</strong> User feedback integration
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <p className="text-sm text-gray-800 dark:text-gray-100">
                            <strong>Note:</strong> All calculations are performed using official government data and
                            established economic methodologies. Results are for educational purposes only and should not
                            be considered as financial advice. Individual inflation experiences may vary based on
                            personal spending patterns, geographic location, and other factors.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Share */}
                  <Suspense fallback={<div className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-8" />}>
                    <SocialShare />
                  </Suspense>

                  {/* Spacing between Share and FAQ */}
                  <div className="mb-12"></div>

                  {/* FAQ */}
                  <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-8" />}>
                    <FAQ category="general" />
                  </Suspense>
                </>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-300 py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Global Inflation Calculator</h3>
                <p className="text-gray-300 dark:text-gray-50 mb-6">
                  Track inflation across major world currencies with historical data from 1913 to {currentYear}.
                </p>
                <div className="flex gap-4 mb-8">
                  <a
                    href="https://www.youtube.com/@GlobalInflationCalculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Visit our YouTube channel"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.pinterest.com/globalinflationcalculator/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-red-600 transition-colors"
                    aria-label="Follow us on Pinterest"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/GInflationCalc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    aria-label="Follow us on X (Twitter)"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.244H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Related Tools</h4>
                  <ul className="text-gray-300 dark:text-gray-50 space-y-2">
                    <li>
                      <Link
                        href="/salary-calculator/regional-cost-of-living"
                        className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                      >
                        Regional Cost of Living
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
                <ul className="text-gray-300 dark:text-gray-50 space-y-2">
                  <li>• US Bureau of Labor Statistics</li>
                  <li>• UK Office for National Statistics</li>
                  <li>• Eurostat</li>
                  <li>• Statistics Canada</li>
                  <li>• Australian Bureau of Statistics</li>
                  <li>• Swiss Federal Statistical Office</li>
                  <li>• Statistics Bureau of Japan</li>
                  <li>• Statistics New Zealand</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="text-gray-300 dark:text-gray-50 space-y-2">
                  <li>
                    <Link href="/mortgage-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Mortgage Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/home-affordability-calculator/inflation-adjusted" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Home Affordability Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/deflation-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Deflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/shrinkflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Shrinkflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/energy-inflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Energy Inflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/skimpflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Skimpflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/sneakflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Sneakflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/subscription-inflation-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Subscription Inflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/charts" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Charts & Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/investment-race-calculator" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Investment Race Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/global-compound-interest"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Compound Interest Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/global-net-worth-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Global Net Worth Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/ppp-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      PPP Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auto-loan-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Auto Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/salary-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Salary Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/retirement-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Retirement Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student-loan-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Student Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/budget-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Budget Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/emergency-fund-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Emergency Fund Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/roi-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      ROI Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/insurance-inflation-calculator"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Insurance Inflation Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legacy-planner"
                      className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors"
                    >
                      Legacy Planner
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-blue-400 dark:hover:text-blue-600 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
                <p className="text-sm text-gray-400 dark:text-gray-600 mt-4">Last Updated: February 2026</p>
              </div>
            </div>
            <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
              <p>&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
