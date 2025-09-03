"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Loader2, Save, RefreshCw } from "lucide-react"

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

      // Initialize editing content
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

      <Tabs defaultValue={Object.keys(groupedContent)[0]} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(groupedContent).map((page) => (
            <TabsTrigger key={page} value={page} className="capitalize">
              {page.replace("-", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

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
