"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import {
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  Users,
  BarChart3,
  FileText,
  ImageIcon,
  HelpCircle,
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
}

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface ContentData {
  seo_essay: string
  salary_essay: string
  retirement_essay: string
  legacy_planner_title: string
  legacy_planner_content: string
  privacy_content: string
  terms_content: string
  logo_url: string
  site_title: string
  site_description: string
}

interface UsageData {
  total_calculations: number
  monthly_calculations: number
  popular_currencies: string[]
  popular_years: number[]
}

interface AboutContentItem {
  id: string
  section: "project" | "admin"
  title: string
  content: string
  social_links: Array<{
    platform: string
    url: string
    icon: string
  }>
}

const AdminContentPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Content state
  const [content, setContent] = useState<ContentData>({
    seo_essay: "",
    salary_essay: "",
    retirement_essay: "",
    legacy_planner_title: "Understanding Multi-Generational Wealth Planning",
    legacy_planner_content: `Multi-generational wealth planning is one of the most complex yet crucial aspects of financial management. As families accumulate wealth over time, the challenge becomes not just preserving it, but ensuring it grows and serves future generations effectively.

The impact of inflation on long-term wealth cannot be overstated. What seems like a substantial inheritance today may have significantly less purchasing power in 20 or 30 years. Historical data shows that inflation averages around 2-3% annually, but periods of higher inflation can dramatically erode wealth. For example, $1 million today would need to grow to approximately $1.8 million in 30 years just to maintain the same purchasing power, assuming a 2% inflation rate.

Healthcare costs present another significant challenge for legacy planning. Medical expenses have consistently outpaced general inflation, rising at rates of 4-6% annually. This means that healthcare-related expenses can consume a disproportionate amount of family wealth, particularly as family members age. Planning for these escalating costs is essential for preserving wealth across generations.

Investment strategy becomes critical when planning for multiple generations. While younger generations might benefit from aggressive growth strategies, older family members may require more conservative approaches focused on capital preservation. Diversification across asset classes, geographic regions, and time horizons helps balance these competing needs.

Estate planning tools such as trusts, family limited partnerships, and charitable giving strategies can provide tax advantages while ensuring wealth transfers efficiently between generations. These structures also offer protection from creditors and can help maintain family control over assets.

Regular family meetings and financial education for heirs are often overlooked but crucial components of successful wealth transfer. Teaching younger family members about financial responsibility, investment principles, and the family's values regarding wealth helps ensure they're prepared to manage their inheritance effectively.

The key to successful multi-generational wealth planning lies in balancing growth with preservation, considering the unique needs of each generation, and maintaining flexibility to adapt to changing economic conditions and family circumstances.`,
    privacy_content: "",
    terms_content: "",
    logo_url: "",
    site_title: "Global Inflation Calculator",
    site_description: "Calculate historical inflation and purchasing power across multiple currencies",
  })

  // FAQ state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" })

  // Usage stats state
  const [usageStats, setUsageStats] = useState<UsageData>({
    total_calculations: 0,
    monthly_calculations: 0,
    popular_currencies: [],
    popular_years: [],
  })

  // About content state with social links
  const [aboutContent, setAboutContent] = useState<AboutContentItem[]>([
    {
      id: "project",
      section: "project",
      title: "About This Project",
      content: "",
      social_links: [],
    },
    {
      id: "admin",
      section: "admin",
      title: "About the Administrator",
      content: "",
      social_links: [],
    },
  ])

  // Helper function to get social links safely
  const getSocialLinks = (section: "project" | "admin"): SocialLink[] => {
    const item = aboutContent.find((item) => item.section === section)
    if (!item || !item.social_links || !Array.isArray(item.social_links)) {
      return []
    }
    return item.social_links
  }

  // Social links management for about sections
  const addSocialLinkToSection = (section: "project" | "admin") => {
    const updated = aboutContent.map((item) =>
      item.section === section
        ? {
            ...item,
            social_links: Array.isArray(item.social_links)
              ? [...item.social_links, { platform: "", url: "", icon: "" }]
              : [{ platform: "", url: "", icon: "" }],
          }
        : item,
    )
    setAboutContent(updated)
  }

  const removeSocialLinkFromSection = (section: "project" | "admin", index: number) => {
    const updated = aboutContent.map((item) =>
      item.section === section
        ? {
            ...item,
            social_links: Array.isArray(item.social_links) ? item.social_links.filter((_, i) => i !== index) : [],
          }
        : item,
    )
    setAboutContent(updated)
  }

  const updateSocialLinkInSection = (
    section: "project" | "admin",
    index: number,
    field: keyof SocialLink,
    value: string,
  ) => {
    const updated = aboutContent.map((item) =>
      item.section === section
        ? {
            ...item,
            social_links: Array.isArray(item.social_links)
              ? item.social_links.map((link, i) => (i === index ? { ...link, [field]: value } : link))
              : [],
          }
        : item,
    )
    setAboutContent(updated)
  }

  // Save about content function
  const saveAboutContent = async (section: "project" | "admin") => {
    setSaving(true)
    try {
      const contentItem = aboutContent.find((item) => item.section === section)
      if (!contentItem) return

      const { error } = await supabase.from("about_content").upsert({
        id: section,
        section: section,
        title: contentItem.title,
        content: contentItem.content,
        social_links: Array.isArray(contentItem.social_links) ? contentItem.social_links : [],
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setMessage(`${section} content saved successfully!`)
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error(`Error saving ${section} content:`, err)
      setError(`Failed to save ${section} content`)
    } finally {
      setSaving(false)
    }
  }

  // Authentication
  const handleLogin = () => {
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    console.log("=== ADMIN LOGIN DEBUG ===")
    console.log("Entered password:", `"${password}"`, "Length:", password.length)
    console.log("Environment password:", `"${envPassword}"`, "Length:", envPassword?.length || 0)
    console.log("Environment password type:", typeof envPassword)
    console.log("Exact match:", password === envPassword)
    console.log("Trimmed match:", password.trim() === envPassword?.trim())
    console.log("Environment variable set:", !!envPassword)

    if (password && envPassword && password === envPassword) {
      setIsAuthenticated(true)
      setError("")
      loadAllContent()
    } else {
      setError(`Invalid password. Please check your credentials.`)
    }
  }

  // Load all content
  const loadAllContent = async () => {
    setLoading(true)
    setError("") // Clear previous errors
    try {
      // Load main content
      const { data: contentData, error: contentError } = await supabase.from("seo_content").select("*")
      if (contentError) {
        console.error("Error loading seo_content:", contentError)
      }

      const { data: siteSettings, error: siteError } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .single()
      if (siteError && siteError.code !== "PGRST116") {
        // PGRST116 is "not found" error
        console.error("Error loading site_settings:", siteError)
      }

      // Load FAQs
      const { data: faqData, error: faqError } = await supabase.from("faqs").select("*").order("id")
      if (faqError) {
        console.error("Error loading faqs:", faqError)
      }

      // Load usage stats
      const { data: statsData, error: statsError } = await supabase
        .from("usage_stats")
        .select("*")
        .order("date", { ascending: false })
        .limit(30)
      if (statsError) {
        console.error("Error loading usage_stats:", statsError)
      }

      // Process content data
      if (contentData && contentData.length > 0) {
        const contentMap: any = {}
        contentData.forEach((item: any) => {
          contentMap[item.id] = item.content
        })

        setContent((prev) => ({
          ...prev,
          seo_essay: contentMap.main_essay || prev.seo_essay,
          salary_essay: contentMap.salary_essay || prev.salary_essay,
          retirement_essay: contentMap.retirement_essay || prev.retirement_essay,
          privacy_content: contentMap.privacy_page || prev.privacy_content,
          terms_content: contentMap.terms_page || prev.terms_content,
        }))
      }

      // Process site settings
      if (siteSettings) {
        setContent((prev) => ({
          ...prev,
          logo_url: siteSettings.logo_url || prev.logo_url,
          site_title: siteSettings.site_title || prev.site_title,
          site_description: siteSettings.site_description || prev.site_description,
        }))
      }

      // Process FAQs
      if (faqData) {
        setFaqs(faqData)
      }

      // Process usage stats
      if (statsData) {
        const totalCalcs = statsData.reduce((sum: number, stat: any) => sum + (stat.calculations || 0), 0)
        const monthlyCalcs = statsData
          .slice(0, 30)
          .reduce((sum: number, stat: any) => sum + (stat.calculations || 0), 0)

        setUsageStats({
          total_calculations: totalCalcs,
          monthly_calculations: monthlyCalcs,
          popular_currencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
          popular_years: [2020, 2010, 2000, 1990, 1980],
        })
      }

      // Load About Content with proper social_links handling
      const { data: aboutData, error: aboutError } = await supabase.from("about_content").select("*").order("section")
      if (aboutError) {
        console.error("Error loading about_content:", aboutError)
      }

      if (aboutData && aboutData.length > 0) {
        // Ensure social_links is always an array
        const processedAboutData = aboutData.map((item: any) => ({
          ...item,
          social_links: Array.isArray(item.social_links) ? item.social_links : [],
        }))
        setAboutContent(processedAboutData)
      } else {
        // Initialize with default structure if no data exists
        const defaultAbout = [
          {
            id: "project",
            section: "project" as const,
            title: "About This Project",
            content:
              "The Global Inflation Calculator is a comprehensive financial tool designed to help individuals, researchers, and financial professionals understand the impact of inflation on purchasing power over time.",
            social_links: [],
          },
          {
            id: "admin",
            section: "admin" as const,
            title: "About the Administrator",
            content:
              "I am a financial data analyst and software developer with over 10 years of experience in economic research and web development.",
            social_links: [],
          },
        ]
        setAboutContent(defaultAbout)
      }

      // Load Legacy Planner Content
      try {
        const { data: legacyData, error: legacyError } = await supabase
          .from("legacy_planner_content")
          .select("*")
          .eq("id", "main")
          .single()
        if (legacyError && legacyError.code !== "PGRST116") {
          console.error("Error loading legacy_planner_content:", legacyError)
        }
        if (legacyData) {
          setContent((prev) => ({
            ...prev,
            legacy_planner_title: legacyData.title || prev.legacy_planner_title,
            legacy_planner_content: legacyData.content || prev.legacy_planner_content,
          }))
        }
      } catch (err) {
        console.log("Legacy planner content not found, using defaults")
      }

      setMessage("Content loaded successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error loading content:", err)
      setError(`Failed to load content: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  // Save content
  const saveContent = async (contentType: string, contentValue: string) => {
    setSaving(true)
    try {
      const { error } = await supabase.from("seo_content").upsert({
        id: contentType,
        content: contentValue,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setMessage(`${contentType} saved successfully!`)
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error saving content:", err)
      setError("Failed to save content")
    } finally {
      setSaving(false)
    }
  }

  // Save site settings
  const saveSiteSettings = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("site_settings").upsert({
        id: "main",
        logo_url: content.logo_url,
        site_title: content.site_title,
        site_description: content.site_description,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setMessage("Site settings saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error saving site settings:", err)
      setError("Failed to save site settings")
    } finally {
      setSaving(false)
    }
  }

  // Save legacy planner content
  const saveLegacyPlannerContent = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("legacy_planner_content").upsert({
        id: "main",
        title: content.legacy_planner_title,
        content: content.legacy_planner_content,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setMessage("Legacy planner content saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error saving legacy planner content:", err)
      setError("Failed to save legacy planner content")
    } finally {
      setSaving(false)
    }
  }

  // FAQ management
  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return

    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: newFaq.question.trim(),
          answer: newFaq.answer.trim(),
          category: "general",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add FAQ")
      }

      const result = await response.json()

      if (result.success && result.data) {
        setFaqs((prev) => [...prev, result.data])
        setNewFaq({ question: "", answer: "" })
        setMessage("FAQ added successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (err) {
      console.error("Error adding FAQ:", err)
      setError(`Failed to add FAQ: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const deleteFaq = async (id: string) => {
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete FAQ")
      }

      setFaqs((prev) => prev.filter((faq) => faq.id !== id))
      setMessage("FAQ deleted successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error deleting FAQ:", err)
      setError("Failed to delete FAQ")
    }
  }

  const updateFaq = async (id: string, question: string, answer: string) => {
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update FAQ")
      }

      setFaqs((prev) => prev.map((faq) => (faq.id === id ? { ...faq, question, answer } : faq)))
      setMessage("FAQ updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error updating FAQ:", err)
      setError("Failed to update FAQ")
    }
  }

  // Retry function
  const retryLoadContent = () => {
    setError("")
    loadAllContent()
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Environment variable set: {process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? "✅ Yes" : "❌ No"}
            </div>

            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">
                  {error}
                  {error.includes("Failed to load content") && (
                    <div className="mt-2">
                      <Button onClick={retryLoadContent} size="sm" variant="outline">
                        Retry Loading Content
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Admin Dashboard
                </CardTitle>
                <p className="text-gray-600">Manage site content and settings</p>
              </div>
              <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-6">
            {/* Homepage SEO Essay */}
            <Card>
              <CardHeader>
                <CardTitle>Homepage SEO Essay</CardTitle>
                <p className="text-sm text-gray-600">Main educational content for the homepage</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.seo_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, seo_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter SEO essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("main_essay", content.seo_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Homepage Essay"}
                </Button>
              </CardContent>
            </Card>

            {/* Salary Calculator Essay */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Calculator Essay</CardTitle>
                <p className="text-sm text-gray-600">Educational content for the salary calculator page</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.salary_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, salary_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter salary calculator essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("salary_essay", content.salary_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Salary Calculator Essay"}
                </Button>
              </CardContent>
            </Card>

            {/* Retirement Calculator Essay */}
            <Card>
              <CardHeader>
                <CardTitle>Retirement Calculator Essay</CardTitle>
                <p className="text-sm text-gray-600">Educational content for the retirement calculator page</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.retirement_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, retirement_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter retirement calculator essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("retirement_essay", content.retirement_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Retirement Calculator Essay"}
                </Button>
              </CardContent>
            </Card>

            {/* Legacy Planner Blog */}
            <Card>
              <CardHeader>
                <CardTitle>Legacy Planner Blog</CardTitle>
                <p className="text-sm text-gray-600">Educational content for the legacy planner page</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blog Title</label>
                  <Input
                    value={content.legacy_planner_title}
                    onChange={(e) => setContent((prev) => ({ ...prev, legacy_planner_title: e.target.value }))}
                    placeholder="Understanding Multi-Generational Wealth Planning"
                  />
                </div>

                <Textarea
                  value={content.legacy_planner_content}
                  onChange={(e) => setContent((prev) => ({ ...prev, legacy_planner_content: e.target.value }))}
                  rows={15}
                  placeholder="Enter legacy planner blog content..."
                  className="font-mono text-sm"
                />

                <Button onClick={saveLegacyPlannerContent} disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Legacy Planner Blog"}
                </Button>
              </CardContent>
            </Card>

            {/* About Content - Project Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Page - Project Section</CardTitle>
                <p className="text-sm text-gray-600">Information about the website/project and its social links</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Title</label>
                  <Input
                    value={aboutContent.find((item) => item.section === "project")?.title || ""}
                    onChange={(e) => {
                      const updated = aboutContent.map((item) =>
                        item.section === "project" ? { ...item, title: e.target.value } : item,
                      )
                      setAboutContent(updated)
                    }}
                    placeholder="About This Project"
                  />
                </div>
                <Textarea
                  value={aboutContent.find((item) => item.section === "project")?.content || ""}
                  onChange={(e) => {
                    const updated = aboutContent.map((item) =>
                      item.section === "project" ? { ...item, content: e.target.value } : item,
                    )
                    setAboutContent(updated)
                  }}
                  rows={10}
                  placeholder="Enter project description..."
                  className="font-mono text-sm"
                />

                {/* Project Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Project Social Links</label>
                    <Button
                      onClick={() => addSocialLinkToSection("project")}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </Button>
                  </div>

                  {getSocialLinks("project").map((link, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Input
                        placeholder="Platform (e.g., Twitter)"
                        value={link.platform}
                        onChange={(e) => updateSocialLinkInSection("project", index, "platform", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateSocialLinkInSection("project", index, "url", e.target.value)}
                        className="flex-2"
                      />
                      <Input
                        placeholder="Icon (emoji)"
                        value={link.icon}
                        onChange={(e) => updateSocialLinkInSection("project", index, "icon", e.target.value)}
                        className="w-20"
                      />
                      <Button
                        onClick={() => removeSocialLinkFromSection("project", index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => saveAboutContent("project")}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Project Content"}
                </Button>
              </CardContent>
            </Card>

            {/* About Content - Admin Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Page - Admin Section</CardTitle>
                <p className="text-sm text-gray-600">Information about the administrator and their social links</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Title</label>
                  <Input
                    value={aboutContent.find((item) => item.section === "admin")?.title || ""}
                    onChange={(e) => {
                      const updated = aboutContent.map((item) =>
                        item.section === "admin" ? { ...item, title: e.target.value } : item,
                      )
                      setAboutContent(updated)
                    }}
                    placeholder="About the Administrator"
                  />
                </div>
                <Textarea
                  value={aboutContent.find((item) => item.section === "admin")?.content || ""}
                  onChange={(e) => {
                    const updated = aboutContent.map((item) =>
                      item.section === "admin" ? { ...item, content: e.target.value } : item,
                    )
                    setAboutContent(updated)
                  }}
                  rows={10}
                  placeholder="Enter admin bio..."
                  className="font-mono text-sm"
                />

                {/* Admin Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Admin Social Links</label>
                    <Button
                      onClick={() => addSocialLinkToSection("admin")}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </Button>
                  </div>

                  {getSocialLinks("admin").map((link, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Input
                        placeholder="Platform (e.g., LinkedIn)"
                        value={link.platform}
                        onChange={(e) => updateSocialLinkInSection("admin", index, "platform", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateSocialLinkInSection("admin", index, "url", e.target.value)}
                        className="flex-2"
                      />
                      <Input
                        placeholder="Icon (emoji)"
                        value={link.icon}
                        onChange={(e) => updateSocialLinkInSection("admin", index, "icon", e.target.value)}
                        className="w-20"
                      />
                      <Button
                        onClick={() => removeSocialLinkFromSection("admin", index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={() => saveAboutContent("admin")} disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Admin Content"}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.privacy_content}
                  onChange={(e) => setContent((prev) => ({ ...prev, privacy_content: e.target.value }))}
                  rows={10}
                  placeholder="Enter privacy policy content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("privacy_page", content.privacy_content)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Privacy Policy"}
                </Button>
              </CardContent>
            </Card>

            {/* Terms of Service */}
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.terms_content}
                  onChange={(e) => setContent((prev) => ({ ...prev, terms_content: e.target.value }))}
                  rows={10}
                  placeholder="Enter terms of service content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("terms_page", content.terms_content)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Terms of Service"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Site Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Site Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Title</label>
                  <Input
                    value={content.site_title}
                    onChange={(e) => setContent((prev) => ({ ...prev, site_title: e.target.value }))}
                    placeholder="Global Inflation Calculator"
                  />
                </div>

                {/* Site Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Description</label>
                  <Textarea
                    value={content.site_description}
                    onChange={(e) => setContent((prev) => ({ ...prev, site_description: e.target.value }))}
                    rows={3}
                    placeholder="Calculate historical inflation and purchasing power..."
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    value={content.logo_url}
                    onChange={(e) => setContent((prev) => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                  {content.logo_url && (
                    <div className="mt-2">
                      <img
                        src={content.logo_url || "/placeholder.svg"}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-full object-cover"
                        onError={() => setError("Invalid logo URL")}
                      />
                    </div>
                  )}
                </div>

                <Button onClick={saveSiteSettings} disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Site Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Management */}
          <TabsContent value="faqs" className="space-y-6">
            {/* Add New FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Add New FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
                />
                <Textarea
                  placeholder="Answer"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, answer: e.target.value }))}
                  rows={4}
                />
                <Button
                  onClick={addFaq}
                  disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </Button>
              </CardContent>
            </Card>

            {/* Existing FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Existing FAQs ({faqs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-4 space-y-3">
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFaq(faq.id, e.target.value, faq.answer)}
                      className="font-medium"
                    />
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(faq.id, faq.question, e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => deleteFaq(faq.id)}
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Statistics */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Calculations</p>
                      <p className="text-2xl font-bold">{usageStats.total_calculations.toLocaleString()}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Calculations</p>
                      <p className="text-2xl font-bold">{usageStats.monthly_calculations.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Popular Currencies</p>
                    <div className="flex flex-wrap gap-1">
                      {usageStats.popular_currencies.map((currency) => (
                        <Badge key={currency} variant="secondary">
                          {currency}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Popular Years</p>
                    <div className="flex flex-wrap gap-1">
                      {usageStats.popular_years.map((year) => (
                        <Badge key={year} variant="outline">
                          {year}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={loadAllContent} disabled={loading} className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading..." : "Refresh All Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminContentPage
