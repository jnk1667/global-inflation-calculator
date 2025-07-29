"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, Save, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface FAQ {
  id?: string
  question: string
  answer: string
  category: string
  order_index: number
  is_active: boolean
}

interface SeoContent {
  id: string
  title: string
  content: string
  meta_description: string
  keywords: string[]
}

interface SiteSettings {
  id: string
  site_name: string
  site_description: string
  logo_url: string
  contact_email: string
  social_links: any
}

interface AboutContent {
  id: string
  section: "project" | "admin"
  title: string
  content: string
  social_links: any[]
}

interface UsageStats {
  id: string
  total_calculations: number
  monthly_calculations: number
  popular_currencies: any
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [seoContent, setSeoContent] = useState<SeoContent | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const supabase = createClient()

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadData()
    } else {
      setMessage("Invalid password")
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Load FAQs
      const { data: faqData } = await supabase.from("faqs").select("*").order("order_index")
      if (faqData) setFaqs(faqData)

      // Load SEO Content
      const { data: seoData } = await supabase.from("seo_content").select("*").eq("id", "main_essay").single()
      if (seoData) setSeoContent(seoData)

      // Load Site Settings
      const { data: settingsData } = await supabase.from("site_settings").select("*").eq("id", "main").single()
      if (settingsData) setSiteSettings(settingsData)

      // Load About Content
      const { data: aboutData } = await supabase.from("about_content").select("*")
      if (aboutData) setAboutContent(aboutData)

      // Load Usage Stats
      const { data: statsData } = await supabase.from("usage_statistics").select("*").eq("id", "main").single()
      if (statsData) setUsageStats(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage("Error loading data")
    }
    setLoading(false)
  }

  const saveFAQs = async () => {
    setLoading(true)
    try {
      // Delete all existing FAQs
      await supabase.from("faqs").delete().neq("id", "")

      // Insert new FAQs
      for (const faq of faqs) {
        await supabase.from("faqs").insert({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          order_index: faq.order_index,
          is_active: faq.is_active,
        })
      }
      setMessage("FAQs saved successfully!")
    } catch (error) {
      console.error("Error saving FAQs:", error)
      setMessage("Error saving FAQs")
    }
    setLoading(false)
  }

  const saveSeoContent = async () => {
    if (!seoContent) return
    setLoading(true)
    try {
      await supabase.from("seo_content").upsert({
        id: "main_essay",
        title: seoContent.title,
        content: seoContent.content,
        meta_description: seoContent.meta_description,
        keywords: seoContent.keywords,
        updated_at: new Date().toISOString(),
      })
      setMessage("SEO content saved successfully!")
    } catch (error) {
      console.error("Error saving SEO content:", error)
      setMessage("Error saving SEO content")
    }
    setLoading(false)
  }

  const saveSiteSettings = async () => {
    if (!siteSettings) return
    setLoading(true)
    try {
      await supabase.from("site_settings").upsert({
        id: "main",
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        logo_url: siteSettings.logo_url,
        contact_email: siteSettings.contact_email,
        social_links: siteSettings.social_links,
        updated_at: new Date().toISOString(),
      })
      setMessage("Site settings saved successfully!")
    } catch (error) {
      console.error("Error saving site settings:", error)
      setMessage("Error saving site settings")
    }
    setLoading(false)
  }

  const saveAboutContent = async () => {
    setLoading(true)
    try {
      for (const content of aboutContent) {
        await supabase.from("about_content").upsert({
          id: content.id,
          section: content.section,
          title: content.title,
          content: content.content,
          social_links: content.social_links,
          updated_at: new Date().toISOString(),
        })
      }
      setMessage("About content saved successfully!")
    } catch (error) {
      console.error("Error saving about content:", error)
      setMessage("Error saving about content")
    }
    setLoading(false)
  }

  const addFAQ = () => {
    setFaqs([
      ...faqs,
      {
        question: "",
        answer: "",
        category: "general",
        order_index: faqs.length,
        is_active: true,
      },
    ])
  }

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFAQ = (index: number, field: keyof FAQ, value: any) => {
    const updatedFaqs = [...faqs]
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value }
    setFaqs(updatedFaqs)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter the admin password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your site content and settings</p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="seo">SEO Content</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
            <TabsTrigger value="about">About Content</TabsTrigger>
            <TabsTrigger value="stats">Usage Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Manage FAQs</CardTitle>
                <CardDescription>Add, edit, or remove frequently asked questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>FAQ #{index + 1}</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFAQ(index, "is_active", !faq.is_active)}
                        >
                          {faq.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeFAQ(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, "question", e.target.value)}
                    />
                    <Textarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Category"
                        value={faq.category}
                        onChange={(e) => updateFAQ(index, "category", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Order"
                        value={faq.order_index}
                        onChange={(e) => updateFAQ(index, "order_index", Number.parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <Button onClick={addFAQ} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                  <Button onClick={saveFAQs} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save FAQs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Content</CardTitle>
                <CardDescription>Manage main essay and SEO metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoContent && (
                  <>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={seoContent.title}
                        onChange={(e) => setSeoContent({ ...seoContent, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Meta Description</Label>
                      <Textarea
                        value={seoContent.meta_description || ""}
                        onChange={(e) => setSeoContent({ ...seoContent, meta_description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Keywords (comma-separated)</Label>
                      <Input
                        value={seoContent.keywords?.join(", ") || ""}
                        onChange={(e) => setSeoContent({ ...seoContent, keywords: e.target.value.split(", ") })}
                      />
                    </div>
                    <div>
                      <Label>Content (Markdown supported)</Label>
                      <Textarea
                        value={seoContent.content}
                        onChange={(e) => setSeoContent({ ...seoContent, content: e.target.value })}
                        rows={15}
                      />
                    </div>
                    <Button onClick={saveSeoContent} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save SEO Content
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Manage general site configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {siteSettings && (
                  <>
                    <div>
                      <Label>Site Name</Label>
                      <Input
                        value={siteSettings.site_name}
                        onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Site Description</Label>
                      <Textarea
                        value={siteSettings.site_description}
                        onChange={(e) => setSiteSettings({ ...siteSettings, site_description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={siteSettings.logo_url || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, logo_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={siteSettings.contact_email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                      />
                    </div>
                    <Button onClick={saveSiteSettings} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Content</CardTitle>
                <CardDescription>Manage About Us page content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aboutContent.map((content, index) => (
                  <div key={content.id} className="border rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold capitalize">{content.section} Section</h3>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={content.title}
                        onChange={(e) => {
                          const updated = [...aboutContent]
                          updated[index] = { ...updated[index], title: e.target.value }
                          setAboutContent(updated)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Content (Markdown supported)</Label>
                      <Textarea
                        value={content.content}
                        onChange={(e) => {
                          const updated = [...aboutContent]
                          updated[index] = { ...updated[index], content: e.target.value }
                          setAboutContent(updated)
                        }}
                        rows={8}
                      />
                    </div>
                    <div>
                      <Label>Social Links (JSON format)</Label>
                      <Textarea
                        value={JSON.stringify(content.social_links, null, 2)}
                        onChange={(e) => {
                          try {
                            const updated = [...aboutContent]
                            updated[index] = { ...updated[index], social_links: JSON.parse(e.target.value) }
                            setAboutContent(updated)
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={saveAboutContent} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save About Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>View and manage site usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageStats && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Total Calculations</Label>
                        <Input
                          type="number"
                          value={usageStats.total_calculations}
                          onChange={(e) =>
                            setUsageStats({ ...usageStats, total_calculations: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Monthly Calculations</Label>
                        <Input
                          type="number"
                          value={usageStats.monthly_calculations}
                          onChange={(e) =>
                            setUsageStats({ ...usageStats, monthly_calculations: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Popular Currencies (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(usageStats.popular_currencies, null, 2)}
                        onChange={(e) => {
                          try {
                            setUsageStats({ ...usageStats, popular_currencies: JSON.parse(e.target.value) })
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={6}
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        setLoading(true)
                        try {
                          await supabase.from("usage_statistics").upsert({
                            id: "main",
                            total_calculations: usageStats.total_calculations,
                            monthly_calculations: usageStats.monthly_calculations,
                            popular_currencies: usageStats.popular_currencies,
                            last_updated: new Date().toISOString(),
                          })
                          setMessage("Usage statistics saved successfully!")
                        } catch (error) {
                          console.error("Error saving usage statistics:", error)
                          setMessage("Error saving usage statistics")
                        }
                        setLoading(false)
                      }}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Statistics
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
