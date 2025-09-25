import { type NextRequest, NextResponse } from "next/server"

const INDEXNOW_API_KEY = "09f1b1a26bf949c68b1b59625adcb9d"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"

// IndexNow endpoint URLs for different search engines
const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
]

interface IndexNowRequest {
  urls: string[]
  reason?: "created" | "updated" | "deleted"
}

export async function POST(request: NextRequest) {
  try {
    const { urls, reason = "updated" }: IndexNowRequest = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "URLs array is required and must not be empty" }, { status: 400 })
    }

    // Validate URLs belong to our domain
    const validUrls = urls.filter((url) => {
      try {
        const urlObj = new URL(url)
        return urlObj.origin === new URL(SITE_URL).origin
      } catch {
        return false
      }
    })

    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No valid URLs found for this domain" }, { status: 400 })
    }

    const results = []

    // Submit to each IndexNow endpoint
    for (const endpoint of INDEXNOW_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            host: new URL(SITE_URL).hostname,
            key: INDEXNOW_API_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_API_KEY}.txt`,
            urlList: validUrls,
          }),
        })

        results.push({
          endpoint,
          status: response.status,
          success: response.ok,
          statusText: response.statusText,
        })

        console.log(`[IndexNow] Submitted ${validUrls.length} URLs to ${endpoint}: ${response.status}`)
      } catch (error) {
        console.error(`[IndexNow] Error submitting to ${endpoint}:`, error)
        results.push({
          endpoint,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Log successful submissions
    const successfulSubmissions = results.filter((r) => r.success).length
    console.log(`[IndexNow] Successfully submitted to ${successfulSubmissions}/${INDEXNOW_ENDPOINTS.length} endpoints`)

    return NextResponse.json({
      message: `Submitted ${validUrls.length} URLs to ${successfulSubmissions} search engines`,
      urls: validUrls,
      results,
      reason,
    })
  } catch (error) {
    console.error("[IndexNow] API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to submit common page updates
export async function submitPageUpdate(pagePath: string, reason: "created" | "updated" | "deleted" = "updated") {
  const url = `${SITE_URL}${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}`

  try {
    const response = await fetch(`${SITE_URL}/api/indexnow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: [url],
        reason,
      }),
    })

    if (!response.ok) {
      console.error(`[IndexNow] Failed to submit ${url}:`, response.statusText)
      return false
    }

    console.log(`[IndexNow] Successfully submitted ${url} for ${reason}`)
    return true
  } catch (error) {
    console.error(`[IndexNow] Error submitting ${url}:`, error)
    return false
  }
}
