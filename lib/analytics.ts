// Analytics tracking functions for the Global Inflation Calculator
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      page_path: path,
    })
  }
}

// Track general events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track inflation calculations
export const trackCalculation = (currency: string, fromYear: number, amount: number) => {
  trackEvent("calculate_inflation", "calculator", `${currency}_${fromYear}`, amount)
}

// Track currency changes
export const trackCurrencyChange = (fromCurrency: string, toCurrency: string) => {
  trackEvent("currency_change", "calculator", `${fromCurrency}_to_${toCurrency}`)
}

// Track feature usage
export const trackFeatureUsage = (feature: string, details?: string) => {
  trackEvent("feature_usage", "engagement", `${feature}${details ? `_${details}` : ""}`)
}

// Alias for backward compatibility
export const trackInflationCalculation = trackCalculation

// Default export with all functions
export default {
  trackPageView,
  trackEvent,
  trackCalculation,
  trackCurrencyChange,
  trackFeatureUsage,
  trackInflationCalculation,
}
