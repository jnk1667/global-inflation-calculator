import { type NextRequest, NextResponse } from "next/server"

const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || ""
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"

// IndexNow endpoint URLs for different search engines
const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
]

interface IndexNowRequest {
  url?: string // Support single URL
  urls?: string[] // Support multiple URLs
  reason?: "created" | "updated" | "deleted"
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!INDEXNOW_API_KEY) {
      console.error("[IndexNow] API key not configured")
      return NextResponse.json(
        { error: "IndexNow API key not configured. Please set INDEXNOW_API_KEY environment variable." },
        { status: 500 },
      )
    }

    const body: IndexNowRequest = await request.json()
    const { url, urls: urlsArray, reason = "updated" } = body

    let urls: string[]
    if (url) {
      // If url is provided, check if it's already an array
      urls = Array.isArray(url) ? url : [url]
    } else {
      urls = urlsArray || []
    }

    console.log("[IndexNow] Received request:", { url, urls: urlsArray, reason })
    console.log("[IndexNow] Processed URLs:", urls)

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "URL or URLs array is required and must not be empty" }, { status: 400 })
    }

    // Validate URLs belong to our domain (handle both www and non-www)
    const siteHostname = new URL(SITE_URL).hostname.replace(/^www\./, "")
    const validUrls = urls.filter((url) => {
      try {
        const urlObj = new URL(url)
        const urlHostname = urlObj.hostname.replace(/^www\./, "")
        return urlHostname === siteHostname
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 },
    )
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
