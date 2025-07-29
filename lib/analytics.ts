"use client"

// Google Analytics tracking functions
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_TRACKING_ID || "", {
      page_location: url,
    })
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackCalculation = (data: {
  currency: string
  amount: number
  fromYear: number
  toYear: number
}) => {
  trackEvent("calculation", "inflation_calculator", `${data.currency}_${data.fromYear}_${data.toYear}`, data.amount)
}

export const trackFeatureUsage = (feature: string, data?: any) => {
  trackEvent("feature_usage", "calculator", feature, data ? JSON.stringify(data).length : undefined)
}

// Alias for backward compatibility
export const trackInflationCalculation = trackCalculation

// Default export for easier importing
export default {
  trackPageView,
  trackEvent,
  trackCalculation,
  trackFeatureUsage,
  trackInflationCalculation,
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
