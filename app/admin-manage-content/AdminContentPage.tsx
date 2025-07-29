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
  about_content: string
  privacy_content: string
  terms_content: string
  social_links: SocialLink[]
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
    about_content: "",
    privacy_content: "",
    terms_content: "",
    social_links: [],
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

  // Authentication
  const handleLogin = () => {
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    // Debug logging
    console.log("=== ADMIN LOGIN DEBUG ===")
    console.log("Entered password:", `"${password}"`, "Length:", password.length)
    console.log("Environment password:", `"${envPassword}"`, "Length:", envPassword?.length || 0)
    console.log("Environment password type:", typeof envPassword)
    console.log("Exact match:", password === envPassword)
    console.log("Trimmed match:", password.trim() === envPassword?.trim())
    console.log("Environment variable set:", !!envPassword)

    if (password === envPassword) {
      setIsAuthenticated(true)
      setError("")
      loadAllContent()
    } else {
      setError(`Invalid password. Entered: "${password}" | Expected: "${envPassword}"`)
    }
  }

  // Load all content
  const loadAllContent = async () => {
    setLoading(true)
    try {
      // Load main content
      const { data: contentData } = await supabase.from("seo_content").select("*")

      const { data: siteSettings } = await supabase.from("site_settings").select("*").eq("id", "main").single()

      // Load FAQs
      const { data: faqData } = await supabase.from("faqs").select("*").order("id")

      // Load usage stats
      const { data: statsData } = await supabase
        .from("usage_stats")
        .select("*")
        .order("date", { ascending: false })
        .limit(30)

      // Process content data
      if (contentData && contentData.length > 0) {
        const contentMap: any = {}
        contentData.forEach((item: any) => {
          contentMap[item.id] = item.content
        })

        setContent((prev) => ({
          ...prev,
          seo_essay: contentMap.main_essay || prev.seo_essay,
          about_content: contentMap.about_page || prev.about_content,
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
          social_links: Array.isArray(siteSettings.social_links) ? siteSettings.social_links : [],
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
    } catch (err) {
      console.error("Error loading content:", err)
      setError("Failed to load content")
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
        social_links: content.social_links,
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

  // FAQ management
  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return

    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert({
          question: newFaq.question.trim(),
          answer: newFaq.answer.trim(),
        })
        .select()

      if (error) throw error

      if (data && data[0]) {
        setFaqs((prev) => [...prev, data[0]])
        setNewFaq({ question: "", answer: "" })
        setMessage("FAQ added successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (err) {
      console.error("Error adding FAQ:", err)
      setError("Failed to add FAQ")
    }
  }

  const deleteFaq = async (id: string) => {
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id)

      if (error) throw error

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
      const { error } = await supabase.from("faqs").update({ question, answer }).eq("id", id)

      if (error) throw error

      setFaqs((prev) => prev.map((faq) => (faq.id === id ? { ...faq, question, answer } : faq)))
      setMessage("FAQ updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error updating FAQ:", err)
      setError("Failed to update FAQ")
    }
  }

  // Social links management
  const addSocialLink = () => {
    const newLinks = [...content.social_links, { platform: "", url: "", icon: "" }]
    setContent((prev) => ({ ...prev, social_links: newLinks }))
  }

  const removeSocialLink = (index: number) => {
    const newLinks = content.social_links.filter((_, i) => i !== index)
    setContent((prev) => ({ ...prev, social_links: newLinks }))
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...content.social_links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setContent((prev) => ({ ...prev, social_links: newLinks }))
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

            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Environment variable set: {process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? "✅ Yes" : "❌ No"}
            </div>

            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
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
            {/* SEO Essay */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Essay Content</CardTitle>
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
                  {saving ? "Saving..." : "Save SEO Essay"}
                </Button>
              </CardContent>
            </Card>

            {/* About Page */}
            <Card>
              <CardHeader>
                <CardTitle>About Page Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.about_content}
                  onChange={(e) => setContent((prev) => ({ ...prev, about_content: e.target.value }))}
                  rows={10}
                  placeholder="Enter about page content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("about_page", content.about_content)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save About Content"}
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

                {/* Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Social Links</label>
                    <Button
                      onClick={addSocialLink}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </Button>
                  </div>

                  {Array.isArray(content.social_links) &&
                    content.social_links.map((link, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                        <Input
                          placeholder="Platform (e.g., Twitter)"
                          value={link.platform}
                          onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                          className="flex-2"
                        />
                        <Input
                          placeholder="Icon (emoji)"
                          value={link.icon}
                          onChange={(e) => updateSocialLink(index, "icon", e.target.value)}
                          className="w-20"
                        />
                        <Button onClick={() => removeSocialLink(index)} size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
