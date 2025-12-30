"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  is_active: boolean
  order_index: number
  created_at: string
}

interface CategoryCheck {
  category: string
  expectedBy: string[]
  count: number
  status: "found" | "missing"
}

// Categories expected by different pages
const EXPECTED_CATEGORIES = {
  home: "general",
  "ppp-calculator": "ppp",
  "salary-calculator": "salary-calculator",
  "student-loan-calculator": "student-loan",
  "mortgage-calculator": "mortgage-affordability",
  "retirement-calculator": "retirement",
  "budget-calculator": "budget",
  "emergency-fund-calculator": "emergency-fund",
  "deflation-calculator": "deflation",
  charts: "charts",
  "legacy-planner": "legacy-planner",
}

export default function FAQDiagnosticPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [categoryChecks, setCategoryChecks] = useState<CategoryCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all FAQs without category filter
      const response = await fetch("/api/faqs")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setFaqs(data)

      // Group FAQs by category
      const categoryCounts = data.reduce((acc: Record<string, number>, faq: FAQItem) => {
        acc[faq.category] = (acc[faq.category] || 0) + 1
        return acc
      }, {})

      // Check which expected categories exist
      const checks: CategoryCheck[] = Object.entries(EXPECTED_CATEGORIES).map(([page, category]) => ({
        category,
        expectedBy: [page],
        count: categoryCounts[category] || 0,
        status: categoryCounts[category] > 0 ? "found" : "missing",
      }))

      // Add any unexpected categories found in database
      Object.keys(categoryCounts).forEach((dbCategory) => {
        if (!Object.values(EXPECTED_CATEGORIES).includes(dbCategory)) {
          checks.push({
            category: dbCategory,
            expectedBy: ["UNKNOWN - Not mapped to any page"],
            count: categoryCounts[dbCategory],
            status: "found",
          })
        }
      })

      setCategoryChecks(checks)
    } catch (err) {
      console.error("Error loading diagnostics:", err)
      setError(err instanceof Error ? err.message : "Failed to load FAQ diagnostics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiagnostics()
  }, [])

  const foundCount = categoryChecks.filter((c) => c.status === "found").length
  const missingCount = categoryChecks.filter((c) => c.status === "missing").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">FAQ Diagnostic Tool</h1>
          <p className="text-muted-foreground">Check FAQ category mappings and identify issues</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faqs.length}</div>
              <p className="text-xs text-muted-foreground">Active FAQs in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories Found</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{foundCount}</div>
              <p className="text-xs text-muted-foreground">Categories with FAQs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missing Categories</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{missingCount}</div>
              <p className="text-xs text-muted-foreground">Pages without FAQs</p>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button onClick={loadDiagnostics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Diagnostics
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Category Status Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Status</CardTitle>
            <CardDescription>
              Shows which FAQ categories exist in the database and which pages expect them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Used By Page</th>
                    <th className="text-center p-2">FAQ Count</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryChecks
                    .sort((a, b) => b.count - a.count)
                    .map((check, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 font-mono text-sm">{check.category}</td>
                        <td className="p-2 text-sm">{check.expectedBy.join(", ")}</td>
                        <td className="p-2 text-center">{check.count}</td>
                        <td className="p-2 text-center">
                          {check.status === "found" ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Found
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" />
                              Missing
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* All FAQs List */}
        <Card>
          <CardHeader>
            <CardTitle>All FAQs in Database</CardTitle>
            <CardDescription>Complete list of FAQs with their categories and metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      Category: {faq.category}
                    </span>
                    <span>Order: {faq.order_index}</span>
                    <span>Active: {faq.is_active ? "✓" : "✗"}</span>
                    <span>Created: {new Date(faq.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {faqs.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8">No FAQs found in database</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Fix Category Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">If you see "Missing" categories:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to the Admin Manage Content page</li>
                <li>Add new FAQs and select the correct category from the dropdown</li>
                <li>The category must match exactly (e.g., "ppp" for PPP Calculator page)</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">If you see "UNKNOWN" categories:</h3>
              <p className="text-sm text-muted-foreground">
                These FAQs exist in the database but aren't mapped to any page. You may need to update the FAQ category
                in the database or add the category mapping to this diagnostic tool.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Required Category Names:</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(EXPECTED_CATEGORIES).map(([page, category]) => (
                  <div key={page} className="text-sm">
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{category}</span>
                    <span className="text-muted-foreground ml-2">→ {page}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
