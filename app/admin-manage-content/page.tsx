"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface SiteSettings {
  title: string
  description: string
  keywords: string
  contactEmail: string
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [settings, setSettings] = useState<SiteSettings>({
    title: "Global Inflation Calculator",
    description: "Free inflation calculator for comparing currency values",
    keywords: "inflation calculator, currency, historical prices",
    contactEmail: "admin@example.com",
  })
  const [activeTab, setActiveTab] = useState("faqs")

  const ADMIN_PASSWORD = "YourSecurePassword123!" // Change this!

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuth", "true")
    } else {
      alert("Incorrect password")
    }
  }

  useEffect(() => {
    // Check if already authenticated
    if (localStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true)
    }

    // Load existing data
    loadFAQs()
    loadSettings()
  }, [])

  const loadFAQs = async () => {
    try {
      const response = await fetch("/data/faqs.json")
      const data = await response.json()
      setFaqs(data.faqs || [])
    } catch (error) {
      console.log("Could not load FAQs")
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/data/settings.json")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.log("Could not load settings")
    }
  }

  const saveFAQs = async () => {
    try {
      // In a real implementation, this would save to your backend
      localStorage.setItem("faqs", JSON.stringify({ faqs }))
      alert("FAQs saved successfully!")
    } catch (error) {
      alert("Failed to save FAQs")
    }
  }

  const saveSettings = async () => {
    try {
      localStorage.setItem("settings", JSON.stringify(settings))
      alert("Settings saved successfully!")
    } catch (error) {
      alert("Failed to save settings")
    }
  }

  const addFAQ = () => {
    const newFAQ: FAQItem = {
      id: Date.now().toString(),
      question: "",
      answer: "",
    }
    setFaqs([...faqs, newFAQ])
  }

  const updateFAQ = (id: string, field: "question" | "answer", value: string) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)))
  }

  const deleteFAQ = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      setFaqs(faqs.filter((faq) => faq.id !== id))
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
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
                <Button onClick={addFAQ}>+ Add FAQ</Button>
                <Button onClick={saveFAQs} className="bg-green-600 hover:bg-green-700">
                  💾 Save All
                </Button>
              </div>
            </div>

            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question:</label>
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                      placeholder="Enter FAQ question"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Answer:</label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                      placeholder="Enter FAQ answer"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => deleteFAQ(faq.id)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Settings Management */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Site Settings</h2>
              <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
                💾 Save Settings
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Title:</label>
                  <Input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description:</label>
                  <Textarea
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Keywords:</label>
                  <Input
                    value={settings.keywords}
                    onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email:</label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
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
