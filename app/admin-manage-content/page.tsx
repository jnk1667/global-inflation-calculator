"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase, type FAQ, type SiteSettings } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  })
  const [activeTab, setActiveTab] = useState("faqs")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      loadFAQs()
      loadSettings()
    }
  }, [isAuthenticated])

  const loadFAQs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading FAQs:", error)
        showMessage("Error loading FAQs from database", "error")
        return
      }

      setFaqs(data || [])
      console.log("Successfully loaded FAQs from database")
    } catch (error) {
      console.error("Failed to load FAQs:", error)
      showMessage("Failed to connect to database", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "main").single()

      if (error) {
        console.error("Error loading settings:", error)
        showMessage("Error loading settings from database", "error")
        return
      }

      if (data) {
        setSettings({
          id: data.id,
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          contact_email: data.contact_email,
        })
        console.log("Successfully loaded settings from database")
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      showMessage("Failed to connect to database", "error")
    } finally {
      setLoading(false)
    }
  }

  const saveFAQs = async () => {
    try {
      setLoading(true)

      // First, delete all existing FAQs
      const { error: deleteError } = await supabase.from("faqs").delete().neq("id", "impossible-id") // Delete all

      if (deleteError) {
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
          throw insertError
        }
      }

      showMessage("FAQs saved successfully to database!", "success")
      console.log("FAQs saved to database successfully")
    } catch (error) {
      console.error("Database save failed:", error)
      showMessage("Failed to save FAQs to database", "error")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.from("site_settings").upsert({
        id: "main",
        title: settings.title,
        description: settings.description,
        keywords: settings.keywords,
        contact_email: settings.contact_email,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      showMessage("Settings saved successfully to database!", "success")
      console.log("Settings saved to database successfully")
    } catch (error) {
      console.error("Database save failed:", error)
      showMessage("Failed to save settings to database", "error")
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
              <Button onClick={saveSettings} disabled={loading} className="bg-green-600 hover:bg-green-700">
                💾 {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
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
