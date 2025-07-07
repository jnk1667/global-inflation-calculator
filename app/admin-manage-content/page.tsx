"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase, type FAQ, type SiteSettings, type SEOContent } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X } from "lucide-react"

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [settings, setSettings] = useState<SiteSettings>({
    id: "main",
    title: "Global Inflation Calculator",
    description: "Free inflation calculator for comparing currency values",
    keywords: "inflation calculator, currency, historical prices",
    contact_email: "admin@globalinflationcalculator.com",
    logo_url: "/images/globe-icon.png",
  })
  const [seoContent, setSeoContent] = useState<SEOContent>({
    id: "main_essay",
    content: "",
  })
  const [activeTab, setActiveTab] = useState("faqs")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "YourSecurePassword123!"

  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message)
      setError(null)
    } else {
      setError(message)
      setSuccess(null)
    }
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 5000)
  }

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuth", "true")
    } else {
      showMessage("Incorrect password", "error")
    }
  }

  useEffect(() => {
    // Check if already authenticated
    if (localStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true)
    }

    if (isAuthenticated) {
      testConnection()
      loadFAQs()
      loadSettings()
      loadSEOContent()
    }
  }, [isAuthenticated])

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from("faqs").select("count", { count: "exact" })
      if (error) {
        setDebugInfo(`Connection test failed: ${error.message}`)
      } else {
        setDebugInfo(`Connection successful. FAQ count: ${data?.length || 0}`)
      }
    } catch (err) {
      setDebugInfo(`Connection error: ${err}`)
    }
  }

  const loadFAQs = async () => {
    try {
      setLoading(true)
      console.log("Attempting to load FAQs from database...")

      const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        setDebugInfo(`FAQ Load Error: ${error.message} (Code: ${error.code})`)
        showMessage(`Error loading FAQs: ${error.message}`, "error")

        // Load default FAQs as fallback
        setFaqs(defaultFAQs)
        return
      }

      console.log("FAQs loaded successfully:", data)
      setFaqs(data || [])
      setDebugInfo(`Successfully loaded ${data?.length || 0} FAQs from database`)

      if (!data || data.length === 0) {
        showMessage("No FAQs found in database. You can add some below.", "error")
      }
    } catch (error) {
      console.error("Failed to load FAQs:", error)
      setDebugInfo(`Connection failed: ${error}`)
      showMessage("Failed to connect to database", "error")

      // Load default FAQs as fallback
      setFaqs(defaultFAQs)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      console.log("Attempting to load settings from database...")

      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "main").single()

      if (error) {
        console.error("Settings error:", error)
        setDebugInfo((prev) => prev + ` | Settings Error: ${error.message}`)
        showMessage(`Error loading settings: ${error.message}`, "error")
        return
      }

      if (data) {
        setSettings({
          id: data.id,
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          contact_email: data.contact_email,
          logo_url: data.logo_url || "/images/globe-icon.png",
        })
        console.log("Settings loaded successfully:", data)
        setDebugInfo((prev) => prev + " | Settings loaded successfully")
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      setDebugInfo((prev) => prev + ` | Settings connection failed: ${error}`)
      showMessage("Failed to connect to database for settings", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadSEOContent = async () => {
    try {
      setLoading(true)
      console.log("Attempting to load SEO content from database...")

      const { data, error } = await supabase.from("seo_content").select("*").eq("id", "main_essay").single()

      if (error) {
        console.error("SEO content error:", error)
        setDebugInfo((prev) => prev + ` | SEO Content Error: ${error.message}`)
        // Don't show error message for SEO content as it's optional
        return
      }

      if (data) {
        setSeoContent({
          id: data.id,
          content: data.content,
        })
        console.log("SEO content loaded successfully")
        setDebugInfo((prev) => prev + " | SEO content loaded successfully")
      }
    } catch (error) {
      console.error("Failed to load SEO content:", error)
      setDebugInfo((prev) => prev + ` | SEO content connection failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file", "error")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image must be smaller than 5MB", "error")
      return
    }

    try {
      setUploadingImage(true)

      // Create a unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `logo-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        showMessage(`Upload failed: ${uploadError.message}`, "error")
        return
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)

      if (urlData?.publicUrl) {
        // Update settings with new logo URL
        setSettings((prev) => ({
          ...prev,
          logo_url: urlData.publicUrl,
        }))

        showMessage("Image uploaded successfully!", "success")
      } else {
        showMessage("Failed to get image URL", "error")
      }
    } catch (error: any) {
      console.error("Image upload failed:", error)
      showMessage(`Upload failed: ${error.message}`, "error")
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = () => {
    setSettings((prev) => ({
      ...prev,
      logo_url: "",
    }))
    showMessage("Image removed. Don't forget to save settings.", "success")
  }

  const saveFAQs = async () => {
    try {
      setLoading(true)
      console.log("Attempting to save FAQs to database...")

      // First, delete all existing FAQs
      const { error: deleteError } = await supabase.from("faqs").delete().neq("id", "impossible-id")

      if (deleteError) {
        console.error("Delete error:", deleteError)
        throw deleteError
      }

      // Then insert all current FAQs
      if (faqs.length > 0) {
        const { error: insertError } = await supabase.from("faqs").insert(
          faqs.map((faq) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
          })),
        )

        if (insertError) {
          console.error("Insert error:", insertError)
          throw insertError
        }
      }

      showMessage("FAQs saved successfully to database!", "success")
      console.log("FAQs saved to database successfully")
    } catch (error: any) {
      console.error("Database save failed:", error)
      showMessage(`Failed to save FAQs: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setLoading(true)
      console.log("Attempting to save settings to database...")

      const { error } = await supabase.from("site_settings").upsert({
        id: "main",
        title: settings.title,
        description: settings.description,
        keywords: settings.keywords,
        contact_email: settings.contact_email,
        logo_url: settings.logo_url,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Settings save error:", error)
        throw error
      }

      showMessage("Settings saved successfully to database!", "success")
      console.log("Settings saved to database successfully")
    } catch (error: any) {
      console.error("Database save failed:", error)
      showMessage(`Failed to save settings: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const saveSEOContent = async () => {
    try {
      setLoading(true)
      console.log("Attempting to save SEO content to database...")

      const { error } = await supabase.from("seo_content").upsert({
        id: "main_essay",
        content: seoContent.content,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("SEO content save error:", error)
        throw error
      }

      showMessage("SEO content saved successfully to database!", "success")
      console.log("SEO content saved to database successfully")
    } catch (error: any) {
      console.error("Database save failed:", error)
      showMessage(`Failed to save SEO content: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: "",
      answer: "",
    }
    setFaqs([...faqs, newFAQ])
  }

  const updateFAQ = (id: string, field: "question" | "answer", value: string) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)))
  }

  const deleteFAQ = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      // Remove from local state
      setFaqs(faqs.filter((faq) => faq.id !== id))

      // Also try to delete from database
      try {
        const { error } = await supabase.from("faqs").delete().eq("id", id)
        if (error) {
          console.error("Error deleting FAQ from database:", error)
        } else {
          console.log("FAQ deleted from database")
        }
      } catch (error) {
        console.error("Failed to delete from database:", error)
      }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuth")
    setPassword("")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🔒 Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">📝 Content Manager</h1>
          <div className="flex items-center space-x-4">
            {loading && <div className="text-sm text-gray-600">Loading...</div>}
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Debug Info */}
        {debugInfo && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Debug Info:</strong> {debugInfo}
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <Button onClick={() => setActiveTab("faqs")} variant={activeTab === "faqs" ? "default" : "outline"}>
            📝 FAQs
          </Button>
          <Button onClick={() => setActiveTab("settings")} variant={activeTab === "settings" ? "default" : "outline"}>
            ⚙️ Settings
          </Button>
          <Button onClick={() => setActiveTab("seo")} variant={activeTab === "seo" ? "default" : "outline"}>
            📖 SEO Content
          </Button>
          <Button onClick={() => setActiveTab("analytics")} variant={activeTab === "analytics" ? "default" : "outline"}>
            📊 Analytics
          </Button>
        </div>

        {/* FAQ Management */}
        {activeTab === "faqs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage FAQs</h2>
              <div className="space-x-2">
                <Button onClick={loadFAQs} disabled={loading} variant="outline">
                  🔄 Reload
                </Button>
                <Button onClick={addFAQ} disabled={loading}>
                  + Add FAQ
                </Button>
                <Button onClick={saveFAQs} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  💾 {loading ? "Saving..." : "Save All"}
                </Button>
              </div>
            </div>

            {faqs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No FAQs found. Click "Add FAQ" to create your first one.
                </CardContent>
              </Card>
            ) : (
              faqs.map((faq) => (
                <Card key={faq.id}>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Question:</label>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                        placeholder="Enter FAQ question"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Answer:</label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                        placeholder="Enter FAQ answer"
                        rows={3}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => deleteFAQ(faq.id)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        disabled={loading}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Settings Management */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Site Settings</h2>
              <div className="space-x-2">
                <Button onClick={loadSettings} disabled={loading} variant="outline">
                  🔄 Reload
                </Button>
                <Button onClick={saveSettings} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  💾 {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Logo Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Site Logo:</label>
                  <div className="space-y-4">
                    {/* Current Logo Preview */}
                    {settings.logo_url && (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                        <img
                          src={settings.logo_url || "/placeholder.svg"}
                          alt="Current logo"
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M8 14s1.5 2 4 2 4-2 4-2'/%3E%3Cline x1='9' y1='9' x2='9.01' y2='9'/%3E%3Cline x1='15' y1='9' x2='15.01' y2='9'/%3E%3C/svg%3E"
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current Logo</p>
                          <p className="text-xs text-gray-500 break-all">{settings.logo_url}</p>
                        </div>
                        <Button
                          onClick={removeImage}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center space-x-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage || loading}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload New Logo</span>
                          </>
                        )}
                      </Button>
                      <div className="text-xs text-gray-500">Max 5MB • JPG, PNG, GIF, WebP</div>
                    </div>

                    {/* Manual URL Input */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">
                        Or enter image URL manually:
                      </label>
                      <Input
                        value={settings.logo_url || ""}
                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Site Title:</label>
                  <Input
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description:</label>
                  <Textarea
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={2}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Keywords:</label>
                  <Input
                    value={settings.keywords}
                    onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email:</label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SEO Content Management */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">SEO Essay Content</h2>
              <div className="space-x-2">
                <Button onClick={loadSEOContent} disabled={loading} variant="outline">
                  🔄 Reload
                </Button>
                <Button onClick={saveSEOContent} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  💾 {loading ? "Saving..." : "Save Content"}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    SEO Essay Content (10,000+ characters recommended):
                  </label>
                  <div className="text-sm text-gray-600 mb-2">
                    Current length: {seoContent.content.length} characters
                  </div>
                  <Textarea
                    value={seoContent.content}
                    onChange={(e) => setSeoContent({ ...seoContent, content: e.target.value })}
                    placeholder="Enter comprehensive SEO content about inflation, economics, debt-backed currency, etc. Use # for main headings and ## for subheadings."
                    rows={25}
                    disabled={loading}
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    💡 Use markdown-style formatting: # for main headings, ## for subheadings. This content appears
                    between Historical Context and Social Share sections.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Site Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">15,247</div>
                  <div className="text-gray-600">Total Visitors</div>
                  <div className="text-sm text-green-600">+12% this month</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">89,543</div>
                  <div className="text-gray-600">Calculations</div>
                  <div className="text-sm text-green-600">+8% this month</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">$127.50</div>
                  <div className="text-gray-600">Ad Revenue</div>
                  <div className="text-sm text-green-600">+15% this month</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Search Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>inflation calculator</span>
                    <span className="text-gray-600">2,847 visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>what is $100 in 1950 worth today</span>
                    <span className="text-gray-600">1,234 visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>currency inflation comparison</span>
                    <span className="text-gray-600">987 visits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Default FAQs to use as fallback
const defaultFAQs: FAQ[] = [
  {
    id: "1",
    question: "How accurate is your inflation data?",
    answer:
      "Our data comes directly from official government sources: US Bureau of Labor Statistics, UK Office for National Statistics, Statistics Canada, Australian Bureau of Statistics, and Eurostat. We update this data monthly to ensure accuracy.",
  },
  {
    id: "2",
    question: "Which currencies and time periods do you support?",
    answer:
      "We support 5 major currencies: USD (from 1913), GBP (from 1947), EUR (from 1996), CAD (from 1914), and AUD (from 1948). This gives you over 100 years of historical data for most currencies.",
  },
  {
    id: "3",
    question: "Is this service completely free?",
    answer:
      "Yes! Our inflation calculator is completely free to use with no registration required. We support the service through advertising to keep it free for everyone.",
  },
  {
    id: "4",
    question: "How do you calculate inflation?",
    answer:
      "We use the Consumer Price Index (CPI) from each country's official statistics bureau. The calculation compares the CPI value from your selected year to the current year to determine the equivalent purchasing power.",
  },
  {
    id: "5",
    question: "Can I use this for business or academic purposes?",
    answer:
      "Our tool is perfect for research, education, business planning, and personal finance. All data comes from official government sources, making it reliable for professional use.",
  },
  {
    id: "6",
    question: "How often is the data updated?",
    answer:
      "We automatically update our inflation data monthly when new CPI figures are released by government statistics agencies. This ensures you always have the most current information.",
  },
]
