"use client"

import { Card, CardContent } from "@/components/ui/card"

interface PurchasingPowerProps {
  originalAmount: number
  adjustedAmount: number
  currency: string
  symbol: string
  fromYear: number
}

export default function PurchasingPowerVisual({
  originalAmount,
  adjustedAmount,
  currency,
  symbol,
  fromYear,
}: PurchasingPowerProps) {
  const currentYear = 2025

  if (
    !originalAmount ||
    !adjustedAmount ||
    !isFinite(originalAmount) ||
    !isFinite(adjustedAmount) ||
    originalAmount <= 0 ||
    adjustedAmount <= 0 ||
    !currency ||
    !symbol
  ) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🛒</div>
            <div>Invalid calculation data</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If fromYear is current year, show only current purchasing power
  const isCurrentYear = fromYear >= currentYear
  const ratio = isCurrentYear ? 1 : adjustedAmount / originalAmount
  const items = getPurchasingExamples(originalAmount, currency, fromYear, isCurrentYear)

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
      <CardContent className="p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          🛒 {isCurrentYear ? "What Your Money Can Buy Today" : "What Your Money Could Buy"}
        </h3>

        {!isCurrentYear && (
          <>
            {/* Visual Representation - Only show for historical years */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{fromYear}</div>
                  <div className="text-sm text-gray-600">Then</div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (1 / ratio) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-pink-600">{currentYear}</div>
                  <div className="text-sm text-gray-600">Now</div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                Your {symbol}
                {originalAmount} from {fromYear} had <strong>{ratio.toFixed(1)}x</strong> more purchasing power than
                today
              </div>
            </div>
          </>
        )}

        {/* Item Examples */}
        {isCurrentYear ? (
          // Current year - show only current purchasing power
          <div className="max-w-md mx-auto">
            <h4 className="font-semibold text-purple-900 mb-4 text-center">
              With {symbol}
              {originalAmount} today, you can buy:
            </h4>
            <div className="space-y-3">
              {items.now.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-gray-700 font-medium">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Historical year - show comparison
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-900 mb-3">
                In {fromYear}, {symbol}
                {originalAmount} could buy:
              </h4>
              <div className="space-y-2">
                {items.then.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm text-gray-700">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-pink-900 mb-3">
                Today, {symbol}
                {adjustedAmount.toFixed(0)} can buy:
              </h4>
              <div className="space-y-2">
                {items.now.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm text-gray-700">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fun Fact - Only show for historical years */}
        {!isCurrentYear && (
          <div className="mt-6 p-4 bg-white/70 rounded-lg text-center">
            <div className="text-sm text-gray-600">
              💡 <strong>Fun Fact:</strong> If you had invested that {symbol}
              {originalAmount} in {fromYear} in the stock market, it might be worth {symbol}
              {(adjustedAmount * 8).toFixed(0)} today (assuming 7% annual returns)!
            </div>
          </div>
        )}

        {/* Current year fun fact */}
        {isCurrentYear && (
          <div className="mt-6 p-4 bg-white/70 rounded-lg text-center">
            <div className="text-sm text-gray-600">
              💡 <strong>Pro Tip:</strong> Try sliding back to see how much more your {symbol}
              {originalAmount} could have bought in previous decades!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getPurchasingExamples(amount: number, currency: string, year: number, isCurrentYear: boolean) {
  const currentPrices = getCurrentPrices(currency)

  if (isCurrentYear) {
    // For current year, only return current purchasing power
    return {
      then: [], // Not used
      now: [
        {
          emoji: "🎬",
          description: `${Math.floor(amount / currentPrices.movieTicket)} movie tickets`,
        },
        {
          emoji: "⛽",
          description: `${Math.floor(amount / currentPrices.gasoline)} gallons of gas`,
        },
        {
          emoji: "🍞",
          description: `${Math.floor(amount / currentPrices.bread)} loaves of bread`,
        },
        {
          emoji: "☕",
          description: `${Math.floor(amount / currentPrices.coffee)} cups of coffee`,
        },
        {
          emoji: "🍔",
          description: `${Math.floor(amount / currentPrices.hamburger)} hamburgers`,
        },
        {
          emoji: "📰",
          description: `${Math.floor(amount / currentPrices.newspaper)} newspapers`,
        },
      ],
    }
  }

  // For historical years, return both historical and current
  const historicalPrices = getHistoricalPrices(year, currency)

  return {
    then: [
      {
        emoji: "🎬",
        description: `${Math.floor(amount / historicalPrices.movieTicket)} movie tickets`,
      },
      {
        emoji: "⛽",
        description: `${Math.floor(amount / historicalPrices.gasoline)} gallons of gas`,
      },
      {
        emoji: "🍞",
        description: `${Math.floor(amount / historicalPrices.bread)} loaves of bread`,
      },
      {
        emoji: "☕",
        description: `${Math.floor(amount / historicalPrices.coffee)} cups of coffee`,
      },
      {
        emoji: "🍔",
        description: `${Math.floor(amount / historicalPrices.hamburger)} hamburgers`,
      },
      {
        emoji: "📰",
        description: `${Math.floor(amount / historicalPrices.newspaper)} newspapers`,
      },
    ],
    now: [
      {
        emoji: "🎬",
        description: `${Math.floor(amount / currentPrices.movieTicket)} movie tickets`,
      },
      {
        emoji: "⛽",
        description: `${Math.floor(amount / currentPrices.gasoline)} gallons of gas`,
      },
      {
        emoji: "🍞",
        description: `${Math.floor(amount / currentPrices.bread)} loaves of bread`,
      },
      {
        emoji: "☕",
        description: `${Math.floor(amount / currentPrices.coffee)} cups of coffee`,
      },
      {
        emoji: "🍔",
        description: `${Math.floor(amount / currentPrices.hamburger)} hamburgers`,
      },
      {
        emoji: "📰",
        description: `${Math.floor(amount / currentPrices.newspaper)} newspapers`,
      },
    ],
  }
}

function getHistoricalPrices(year: number, currency: string) {
  // Base prices in USD - will be converted for other currencies
  const basePrices: { [key: number]: any } = {
    1914: { movieTicket: 0.1, gasoline: 0.2, bread: 0.05, coffee: 0.03, hamburger: 0.08, newspaper: 0.02 },
    1920: { movieTicket: 0.15, gasoline: 0.25, bread: 0.08, coffee: 0.05, hamburger: 0.12, newspaper: 0.03 },
    1930: { movieTicket: 0.2, gasoline: 0.18, bread: 0.09, coffee: 0.05, hamburger: 0.15, newspaper: 0.03 },
    1940: { movieTicket: 0.23, gasoline: 0.18, bread: 0.1, coffee: 0.05, hamburger: 0.2, newspaper: 0.04 },
    1950: { movieTicket: 0.48, gasoline: 0.27, bread: 0.14, coffee: 0.1, hamburger: 0.3, newspaper: 0.05 },
    1960: { movieTicket: 0.69, gasoline: 0.31, bread: 0.2, coffee: 0.15, hamburger: 0.45, newspaper: 0.08 },
    1970: { movieTicket: 1.55, gasoline: 0.36, bread: 0.25, coffee: 0.25, hamburger: 0.65, newspaper: 0.15 },
    1980: { movieTicket: 2.69, gasoline: 1.19, bread: 0.5, coffee: 0.45, hamburger: 1.2, newspaper: 0.25 },
    1990: { movieTicket: 4.23, gasoline: 1.34, bread: 0.7, coffee: 0.75, hamburger: 2.1, newspaper: 0.5 },
    2000: { movieTicket: 5.39, gasoline: 1.51, bread: 1.99, coffee: 1.25, hamburger: 3.5, newspaper: 0.75 },
    2010: { movieTicket: 7.89, gasoline: 2.79, bread: 2.79, coffee: 2.45, hamburger: 5.5, newspaper: 1.5 },
    2020: { movieTicket: 9.16, gasoline: 2.17, bread: 2.5, coffee: 4.5, hamburger: 7.5, newspaper: 2.0 },
  }

  // Find the closest year with data
  const availableYears = Object.keys(basePrices)
    .map(Number)
    .sort((a, b) => a - b)
  let closestYear = availableYears[0]

  for (const availableYear of availableYears) {
    if (year >= availableYear) {
      closestYear = availableYear
    } else {
      break
    }
  }

  const prices = basePrices[closestYear]

  // Apply currency conversion multipliers (rough estimates)
  const currencyMultipliers: { [key: string]: number } = {
    USD: 1.0,
    GBP: 0.8, // Pound was typically stronger
    EUR: 0.9, // Euro roughly similar to USD
    CAD: 1.1, // Canadian dollar typically weaker
    AUD: 1.2, // Australian dollar typically weaker
  }

  const multiplier = currencyMultipliers[currency] || 1.0

  return {
    movieTicket: prices.movieTicket * multiplier,
    gasoline: prices.gasoline * multiplier,
    bread: prices.bread * multiplier,
    coffee: prices.coffee * multiplier,
    hamburger: prices.hamburger * multiplier,
    newspaper: prices.newspaper * multiplier,
  }
}

function getCurrentPrices(currency: string) {
  // Current prices in 2025
  const basePrices = {
    movieTicket: 12.5,
    gasoline: 3.45,
    bread: 3.25,
    coffee: 5.5,
    hamburger: 9.5,
    newspaper: 2.5,
  }

  // Apply currency conversion for current prices
  const currencyMultipliers: { [key: string]: number } = {
    USD: 1.0,
    GBP: 0.78, // Current exchange rate consideration
    EUR: 0.85, // Current exchange rate consideration
    CAD: 1.35, // Current exchange rate consideration
    AUD: 1.45, // Current exchange rate consideration
  }

  const multiplier = currencyMultipliers[currency] || 1.0

  return {
    movieTicket: basePrices.movieTicket * multiplier,
    gasoline: basePrices.gasoline * multiplier,
    bread: basePrices.bread * multiplier,
    coffee: basePrices.coffee * multiplier,
    hamburger: basePrices.hamburger * multiplier,
    newspaper: basePrices.newspaper * multiplier,
  }
}
