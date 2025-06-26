// Google Analytics tracking functions
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track inflation calculations
export const trackInflationCalculation = (currency: string, startYear: number, endYear: number, amount: number) => {
  event({
    action: "calculate_inflation",
    category: "Calculator",
    label: `${currency}_${startYear}_to_${endYear}`,
    value: amount,
  })
}

// Track FAQ interactions
export const trackFAQClick = (question: string) => {
  event({
    action: "faq_click",
    category: "Engagement",
    label: question,
  })
}

// Track currency changes
export const trackCurrencyChange = (currency: string) => {
  event({
    action: "currency_change",
    category: "Calculator",
    label: currency,
  })
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
