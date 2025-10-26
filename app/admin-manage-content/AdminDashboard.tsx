"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Loader2, Save, RefreshCw, Download } from "lucide-react"

interface ContentItem {
  id: string
  page: string
  section: string
  content: string
  updated_at: string
}

export default function AdminDashboard() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [editingContent, setEditingContent] = useState<{ [key: string]: string }>({})
  const [fetchingCurrency, setFetchingCurrency] = useState<string | null>(null)
  const [currencyData, setCurrencyData] = useState<any>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("page", { ascending: true })
        .order("section", { ascending: true })

      if (error) throw error
      setContent(data || [])

      const initialContent: { [key: string]: string } = {}
      data?.forEach((item) => {
        initialContent[`${item.page}-${item.section}`] = item.content
      })
      setEditingContent(initialContent)
    } catch (error) {
      console.error("Error fetching content:", error)
      setMessage("Error fetching content")
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (page: string, section: string) => {
    setSaving(true)
    try {
      const key = `${page}-${section}`
      const newContent = editingContent[key]

      const { error } = await supabase.from("site_content").upsert({
        page,
        section,
        content: newContent,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage("Content saved successfully!")
      await fetchContent()
    } catch (error) {
      console.error("Error saving content:", error)
      setMessage("Error saving content")
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (page: string, section: string, value: string) => {
    const key = `${page}-${section}`
    setEditingContent((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const fetchCurrencyData = async (currency: string) => {
    setFetchingCurrency(currency)
    setCurrencyData(null)
    setMessage("")

    try {
      const password = prompt("Enter admin password:")
      if (!password) {
        setFetchingCurrency(null)
        return
      }

      const response = await fetch(`/api/admin/fetch-${currency.toLowerCase()}-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      setCurrencyData(result)
      setMessage(`${currency} data fetched successfully! ${result.recordCount} years of data from ${result.yearRange}`)
    } catch (error) {
      console.error(`Error fetching ${currency} data:`, error)
      setMessage(`Error fetching ${currency} data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setFetchingCurrency(null)
    }
  }

  const fetchFredData = async (currency: string) => {
    setFetchingCurrency(`FRED-${currency}`)
    setCurrencyData(null)
    setMessage("")

    try {
      const password = prompt("Enter admin password:")
      if (!password) {
        setFetchingCurrency(null)
        return
      }

      const response = await fetch(`/api/admin/fetch-fred-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, currency }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch FRED data")
      }

      setCurrencyData(result)
      setMessage(
        `${currency} data fetched from FRED successfully! ${result.recordCount} years of data from ${result.yearRange}`,
      )
    } catch (error) {
      console.error(`Error fetching FRED data for ${currency}:`, error)
      setMessage(`Error fetching FRED data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setFetchingCurrency(null)
    }
  }

  const downloadCurrencyData = () => {
    if (!currencyData?.data) return

    const dataStr = JSON.stringify(currencyData.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = currencyData.file || "currency-data.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const groupedContent = content.reduce(
    (acc, item) => {
      if (!acc[item.page]) {
        acc[item.page] = []
      }
      acc[item.page].push(item)
      return acc
    },
    {} as { [key: string]: ContentItem[] },
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Management Dashboard</h1>
        <p className="text-muted-foreground">Manage content for all pages</p>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <Button onClick={fetchContent} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Content
        </Button>
      </div>

      <Tabs defaultValue={Object.keys(groupedContent)[0] || "currency-data"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="currency-data">Currency Data</TabsTrigger>
          {Object.keys(groupedContent).map((page) => (
            <TabsTrigger key={page} value={page} className="capitalize">
              {page.replace("-", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="currency-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fetch Currency Inflation Data</CardTitle>
              <CardDescription>
                Fetch real CPI data from official statistical agencies (Statistics Denmark, Statistics Sweden,
                Statistics Poland). Download the JSON files and add them to /public/data/ in your GitHub repo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Danish Krone (DKK)</CardTitle>
                    <CardDescription>Statistics Denmark (DST)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => fetchCurrencyData("DKK")}
                      disabled={fetchingCurrency !== null}
                      className="w-full"
                    >
                      {fetchingCurrency === "DKK" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Fetch DKK Data"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Swedish Krona (SEK)</CardTitle>
                    <CardDescription>Statistics Sweden (SCB)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => fetchCurrencyData("SEK")}
                      disabled={fetchingCurrency !== null}
                      className="w-full"
                    >
                      {fetchingCurrency === "SEK" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Fetch SEK Data"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Polish Zloty (PLN)</CardTitle>
                    <CardDescription>Statistics Poland (GUS)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => fetchCurrencyData("PLN")}
                      disabled={fetchingCurrency !== null}
                      className="w-full"
                    >
                      {fetchingCurrency === "PLN" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Fetch PLN Data"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>FRED API (Cross-Reference)</CardTitle>
                  <CardDescription>
                    Fetch inflation data from Federal Reserve Economic Data (FRED) to cross-reference with official
                    sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button
                      onClick={() => fetchFredData("DKK")}
                      disabled={fetchingCurrency !== null}
                      variant="outline"
                      className="w-full"
                    >
                      {fetchingCurrency === "FRED-DKK" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "FRED: DKK"
                      )}
                    </Button>

                    <Button
                      onClick={() => fetchFredData("SEK")}
                      disabled={fetchingCurrency !== null}
                      variant="outline"
                      className="w-full"
                    >
                      {fetchingCurrency === "FRED-SEK" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "FRED: SEK"
                      )}
                    </Button>

                    <Button
                      onClick={() => fetchFredData("PLN")}
                      disabled={fetchingCurrency !== null}
                      variant="outline"
                      className="w-full"
                    >
                      {fetchingCurrency === "FRED-PLN" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "FRED: PLN"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    FRED Series IDs: DKK (FPCPITOTLZGDNK), SEK (FPCPITOTLZGSWE), PLN (FPCPITOTLZGPOL)
                  </p>
                </CardContent>
              </Card>

              {currencyData && (
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle>Currency Data Fetched Successfully!</CardTitle>
                    <CardDescription>{currencyData.message}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>File:</strong> {currencyData.file}
                      </div>
                      <div>
                        <strong>Records:</strong> {currencyData.recordCount}
                      </div>
                      <div>
                        <strong>Year Range:</strong> {currencyData.yearRange}
                      </div>
                      <div>
                        <strong>Last Updated:</strong> {new Date(currencyData.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                    <Button onClick={downloadCurrencyData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download {currencyData.file}
                    </Button>
                    <div className="text-xs text-muted-foreground bg-background p-3 rounded">
                      <strong>Next Steps:</strong> Download the file above, then add it to /public/data/ in your GitHub
                      repo.
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {Object.entries(groupedContent).map(([page, items]) => (
          <TabsContent key={page} value={page} className="space-y-4">
            <div className="grid gap-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{item.section.replace("-", " ")}</CardTitle>
                    <CardDescription>Last updated: {new Date(item.updated_at).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`content-${item.id}`}>Content</Label>
                      <Textarea
                        id={`content-${item.id}`}
                        value={editingContent[`${item.page}-${item.section}`] || ""}
                        onChange={(e) => handleContentChange(item.page, item.section, e.target.value)}
                        rows={10}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={() => saveContent(item.page, item.section)} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
