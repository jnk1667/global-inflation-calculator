// Simple analytics tracking for inflation calculator usage
interface AnalyticsEvent {
  event: string
  currency?: string
  startYear?: string
  endYear?: string
  amount?: number
  timestamp: number
}

class Analytics {
  private events: AnalyticsEvent[] = []
  private isClient = typeof window !== "undefined"

  track(event: string, properties?: Record<string, any>) {
    if (!this.isClient) return

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      ...properties,
    }

    this.events.push(analyticsEvent)

    // In a real app, you'd send this to your analytics service
    console.log("Analytics Event:", analyticsEvent)

    // Store in localStorage for persistence
    try {
      const stored = localStorage.getItem("inflation_calculator_analytics") || "[]"
      const storedEvents = JSON.parse(stored)
      storedEvents.push(analyticsEvent)

      // Keep only last 100 events
      const recentEvents = storedEvents.slice(-100)
      localStorage.setItem("inflation_calculator_analytics", JSON.stringify(recentEvents))
    } catch (error) {
      console.error("Error storing analytics:", error)
    }

    // Google Analytics tracking
    if (window.gtag) {
      window.gtag("event", event, {
        ...properties,
      })
    }
  }

  getEvents(): AnalyticsEvent[] {
    if (!this.isClient) return []

    try {
      const stored = localStorage.getItem("inflation_calculator_analytics") || "[]"
      return JSON.parse(stored)
    } catch (error) {
      console.error("Error retrieving analytics:", error)
      return []
    }
  }

  getUsageStats() {
    const events = this.getEvents()
    const calculations = events.filter((e) => e.event === "inflation_calculation")

    const currencyCount: Record<string, number> = {}
    calculations.forEach((calc) => {
      if (calc.currency) {
        currencyCount[calc.currency] = (currencyCount[calc.currency] || 0) + 1
      }
    })

    return {
      totalCalculations: calculations.length,
      popularCurrencies: Object.entries(currencyCount)
        .map(([currency, count]) => ({ currency, count }))
        .sort((a, b) => b.count - a.count),
      lastCalculation: calculations[calculations.length - 1]?.timestamp || null,
    }
  }
}

const analytics = new Analytics()

// Convenience functions
export const trackInflationCalculation = (currency: string, startYear: string, endYear: string, amount: number) => {
  analytics.track("inflation_calculation", {
    currency,
    startYear,
    endYear,
    amount,
  })
}

export const trackCurrencyChange = (currency: string) => {
  analytics.track("currency_change", { currency })
}

export const trackPageView = (page: string) => {
  analytics.track("page_view", { page })
}

// Generic track event function
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties)
}

export const getAnalytics = () => analytics

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID!, {
      page_path: url,
    })
  }
}

export const event = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackCalculation = (currency: string, startYear: number, endYear: number, amount: number) => {
  event("calculation", "inflation_calculator", `${currency}_${startYear}_${endYear}`, amount)
}

export default analytics
