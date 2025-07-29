"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, type FAQ, type SEOContent, type SiteSettings, type AboutContent } from "@/lib/supabase"
import { Trash2, Plus, Save, Eye, EyeOff, Twitter, Linkedin, Github, Facebook, Instagram, Mail } from "lucide-react"

export default function AdminContentPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [seoContent, setSeoContent] = useState<SEOContent | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true)
      loadAllContent()
    } else {
      setMessage("Invalid password")
    }
  }

  const loadAllContent = async () => {
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
      const { data: aboutData } = await supabase.from("about_content").select("*").order("section")
      if (aboutData) setAboutContent(aboutData)
    } catch (error) {
      console.error("Error loading content:", error)
      setMessage("Error loading content")
    } finally {
      setLoading(false)
    }
  }

  const saveFAQs = async () => {
    setLoading(true)
    try {
      for (const faq of faqs) {
        if (faq.id.startsWith("new-")) {
          const { id, ...faqData } = faq
          await supabase.from("faqs").insert(faqData)
        } else {
          await supabase.from("faqs").update(faq).eq("id", faq.id)
        }
      }
      setMessage("FAQs saved successfully!")
      loadAllContent()
    } catch (error) {
      console.error("Error saving FAQs:", error)
      setMessage("Error saving FAQs")
    } finally {
      setLoading(false)
    }
  }

  const saveSEOContent = async () => {
    if (!seoContent) return
    setLoading(true)
    try {
      await supabase.from("seo_content").upsert(seoContent)
      setMessage("SEO content saved successfully!")
    } catch (error) {
      console.error("Error saving SEO content:", error)
      setMessage("Error saving SEO content")
    } finally {
      setLoading(false)
    }
  }

  const saveSiteSettings = async () => {
    if (!siteSettings) return
    setLoading(true)
    try {
      await supabase.from("site_settings").upsert(siteSettings)
      setMessage("Site settings saved successfully!")
    } catch (error) {
      console.error("Error saving site settings:", error)
      setMessage("Error saving site settings")
    } finally {
      setLoading(false)
    }
  }

  const saveAboutContent = async () => {
    setLoading(true)
    try {
      for (const content of aboutContent) {
        await supabase.from("about_content").upsert(content)
      }
      setMessage("About content saved successfully!")
    } catch (error) {
      console.error("Error saving about content:", error)
      setMessage("Error saving about content")
    } finally {
      setLoading(false)
    }
  }

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: `new-${Date.now()}`,
      question: "",
      answer: "",
      category: "general",
      order_index: faqs.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setFaqs([...faqs, newFAQ])
  }

  const deleteFAQ = async (id: string) => {
    if (id.startsWith("new-")) {
      setFaqs(faqs.filter((faq) => faq.id !== id))
    } else {
      try {
        await supabase.from("faqs").delete().eq("id", id)
        setFaqs(faqs.filter((faq) => faq.id !== id))
        setMessage("FAQ deleted successfully!")
      } catch (error) {
        console.error("Error deleting FAQ:", error)
        setMessage("Error deleting FAQ")
      }
    }
  }

  const updateFAQ = (id: string, field: keyof FAQ, value: any) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value, updated_at: new Date().toISOString() } : faq)))
  }

  const updateAboutContent = (id: string, field: keyof AboutContent, value: any) => {
    setAboutContent(
      aboutContent.map((content) =>
        content.id === id ? { ...content, [field]: value, updated_at: new Date().toISOString() } : content,
      ),
    )
  }

  const addSocialLink = (contentId: string) => {
    const content = aboutContent.find((c) => c.id === contentId)
    if (content) {
      const newLink = { platform: "twitter", url: "", icon: "twitter" }
      const updatedLinks = [...(content.social_links || []), newLink]
      updateAboutContent(contentId, "social_links", updatedLinks)
    }
  }

  const removeSocialLink = (contentId: string, index: number) => {
    const content = aboutContent.find((c) => c.id === contentId)
    if (content) {
      const updatedLinks = content.social_links.filter((_, i) => i !== index)
      updateAboutContent(contentId, "social_links", updatedLinks)
    }
  }

  const updateSocialLink = (contentId: string, index: number, field: string, value: string) => {
    const content = aboutContent.find((c) => c.id === contentId)
    if (content) {
      const updatedLinks = content.social_links.map((link, i) => (i === index ? { ...link, [field]: value } : link))
      updateAboutContent(contentId, "social_links", updatedLinks)
    }
  }

  const socialPlatforms = [
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
    { value: "github", label: "GitHub", icon: Github },
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "email", label: "Email", icon: Mail },
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage site content and settings</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="seo">SEO Content</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
            <TabsTrigger value="about">About Us</TabsTrigger>
          </TabsList>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage FAQs</CardTitle>
                <div className="space-x-2">
                  <Button onClick={addFAQ} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                  <Button onClick={saveFAQs} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={faq.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={faq.is_active ? "default" : "secondary"}>
                          {faq.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFAQ(faq.id, "is_active", !faq.is_active)}
                          >
                            {faq.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteFAQ(faq.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                            placeholder="Enter FAQ question"
                          />
                        </div>
                        <div>
                          <Label>Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                            placeholder="Enter FAQ answer"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Input
                              value={faq.category}
                              onChange={(e) => updateFAQ(faq.id, "category", e.target.value)}
                              placeholder="general"
                            />
                          </div>
                          <div>
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={faq.order_index}
                              onChange={(e) => updateFAQ(faq.id, "order_index", Number.parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Content Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>SEO Content</CardTitle>
                <Button onClick={saveSEOContent} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
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
                      <Label>Content</Label>
                      <Textarea
                        value={seoContent.content}
                        onChange={(e) => setSeoContent({ ...seoContent, content: e.target.value })}
                        rows={20}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Site Settings</CardTitle>
                <Button onClick={saveSiteSettings} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
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
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        value={siteSettings.contact_email || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Us Tab */}
          <TabsContent value="about">
            <div className="space-y-6">
              {aboutContent.map((content) => (
                <Card key={content.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="capitalize">{content.section} Section</CardTitle>
                    <Button onClick={saveAboutContent} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={content.title}
                        onChange={(e) => updateAboutContent(content.id, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={content.content}
                        onChange={(e) => updateAboutContent(content.id, "content", e.target.value)}
                        rows={10}
                        placeholder="Enter content for this section..."
                      />
                    </div>

                    {/* Social Links Management */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Social Media Links</Label>
                        <Button size="sm" onClick={() => addSocialLink(content.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Link
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {content.social_links?.map((link, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <select
                              value={link.platform}
                              onChange={(e) => updateSocialLink(content.id, index, "platform", e.target.value)}
                              className="px-3 py-2 border rounded-md"
                            >
                              {socialPlatforms.map((platform) => (
                                <option key={platform.value} value={platform.value}>
                                  {platform.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              value={link.url}
                              onChange={(e) => updateSocialLink(content.id, index, "url", e.target.value)}
                              placeholder="https://..."
                              className="flex-1"
                            />
                            <Button size="sm" variant="destructive" onClick={() => removeSocialLink(content.id, index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!content.social_links || content.social_links.length === 0) && (
                          <p className="text-muted-foreground text-sm">No social links added yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
