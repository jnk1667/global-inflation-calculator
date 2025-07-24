// Google Analytics tracking functions
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_TRACKING_ID || "", {
      page_path: url,
    })
  }
}

export const trackCalculation = (data: {
  currency: string
  amount: number
  fromYear: number
  toYear: number
  totalInflation: number
}) => {
  trackEvent("inflation_calculation", {
    currency: data.currency,
    amount: data.amount,
    from_year: data.fromYear,
    to_year: data.toYear,
    total_inflation: data.totalInflation,
    event_category: "calculator",
    event_label: `${data.currency}_${data.fromYear}_${data.toYear}`,
  })
}

export const trackCurrencyChange = (currency: string) => {
  trackEvent("currency_change", {
    currency,
    event_category: "user_interaction",
    event_label: currency,
  })
}

export const trackYearChange = (year: number) => {
  trackEvent("year_change", {
    year,
    event_category: "user_interaction",
    event_label: year.toString(),
  })
}

export const trackShare = (platform: string, result?: any) => {
  trackEvent("share_result", {
    platform,
    event_category: "social",
    event_label: platform,
    ...(result && {
      currency: result.currency,
      total_inflation: result.totalInflation,
    }),
  })
}

export const trackError = (error: string, context?: string) => {
  trackEvent("error", {
    error_message: error,
    error_context: context || "unknown",
    event_category: "error",
    event_label: error,
  })
}

export const trackFeatureUsage = (feature: string, details?: Record<string, any>) => {
  trackEvent("feature_usage", {
    feature_name: feature,
    event_category: "feature",
    event_label: feature,
    ...details,
  })
}
