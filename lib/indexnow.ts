const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"

export interface IndexNowSubmission {
  urls: string[]
  reason?: "created" | "updated" | "deleted"
}

/**
 * Submit URLs to IndexNow for immediate search engine indexing
 */
export async function submitToIndexNow(
  urls: string | string[],
  reason: "created" | "updated" | "deleted" = "updated",
): Promise<boolean> {
  const urlArray = Array.isArray(urls) ? urls : [urls]

  try {
    const response = await fetch(`${SITE_URL}/api/indexnow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: urlArray,
        reason,
      }),
    })

    if (!response.ok) {
      console.error("[IndexNow] Submission failed:", response.statusText)
      return false
    }

    const result = await response.json()
    console.log("[IndexNow] Submission successful:", result.message)
    return true
  } catch (error) {
    console.error("[IndexNow] Submission error:", error)
    return false
  }
}

/**
 * Submit common pages that get updated with new data
 */
export async function submitDataUpdatePages(): Promise<void> {
  const pagesToUpdate = [
    "/", // Homepage with latest data
    "/charts", // Charts page with updated visualizations
    "/salary-calculator", // Calculator with updated inflation data
    "/retirement-calculator", // Retirement calculator with updated data
    "/legacy-planner", // Legacy planner with updated data
  ]

  console.log("[IndexNow] Submitting data update pages...")
  await submitToIndexNow(pagesToUpdate, "updated")
}

/**
 * Submit specific currency pages when their data is updated
 */
export async function submitCurrencyUpdate(currencyCode: string): Promise<void> {
  const currencyPages = [
    "/", // Homepage always shows latest data
    "/charts", // Charts include all currencies
  ]

  console.log(`[IndexNow] Submitting pages for ${currencyCode} data update...`)
  await submitToIndexNow(currencyPages, "updated")
}

/**
 * Submit FAQ pages when FAQs are updated
 */
export async function submitFAQUpdate(): Promise<void> {
  const faqPages = [
    "/about", // About page contains FAQs
  ]

  console.log("[IndexNow] Submitting FAQ update pages...")
  await submitToIndexNow(faqPages, "updated")
}
