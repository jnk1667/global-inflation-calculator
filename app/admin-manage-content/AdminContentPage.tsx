"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Database,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
}

interface SocialLink {
  platform: string
  url: string
  icon: string
}

// Updated Content interface to include new essay fields
interface Content {
  site_title: string
  site_description: string
  footer_text: string // Added footer_text
  seo_essay: string
  salary_essay: string
  retirement_essay: string
  deflation_essay: string
  charts_essay: string
  housing_affordability_essay: string
  emergency_fund_essay: string
  budget_essay: string
  student_loan_blog_title: string
  student_loan_blog_content: string
  student_loan_methodology: string
  legacy_planner_title: string
  legacy_planner_content: string
  privacy_content: string
  terms_content: string
  logo_url: string
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
  // Initialized new essay fields
  const [content, setContent] = useState<Content>({
    site_title: "",
    site_description: "",
    footer_text: "", // Added footer_text
    seo_essay: "",
    salary_essay: "",
    retirement_essay: "",
    deflation_essay: "",
    charts_essay: "",
    housing_affordability_essay: "",
    emergency_fund_essay: "",
    budget_essay: "",
    student_loan_blog_title: "Understanding Student Loans in an Inflationary Economy: A Comprehensive Guide",
    student_loan_blog_content: "",
    student_loan_methodology: "",
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
  })

  // FAQ state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "general" })

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

  const [fetchingData, setFetchingData] = useState(false)
  const [dataFetchResult, setDataFetchResult] = useState<any>(null)

  const [fetchingCurrency, setFetchingCurrency] = useState<string | null>(null)
  const [currencyDataResult, setCurrencyDataResult] = useState<any>(null)

  const [fetchingHousing, setFetchingHousing] = useState(false)
  const [housingDataResult, setHousingDataResult] = useState<any>(null)

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
      // Load content from seo_content table
      const { data: contentData, error: contentError } = await supabase.from("seo_content").select("*")
      if (contentError) {
        console.error("Error loading seo_content:", contentError)
      }

      // Load settings from site_settings table
      const { data: settingsData, error: settingsError } = await supabase.from("site_settings").select("*")
      if (settingsError) {
        console.error("Error loading site_settings:", settingsError)
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

      // Transform contentData into a map
      const contentMap =
        contentData?.reduce(
          (acc, item) => {
            acc[item.id] = item.content
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      // Transform settingsData into a map
      const settingsMap =
        settingsData?.reduce(
          (acc, item) => {
            acc[item.setting_key] = item.setting_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      // Process content and settings
      setContent((prev) => ({
        ...prev,
        site_title: settingsMap.site_title || prev.site_title,
        site_description: settingsMap.site_description || prev.site_description,
        footer_text: settingsMap.footer_text || prev.footer_text, // Load footer_text
        seo_essay: contentMap.main_essay || prev.seo_essay,
        salary_essay: contentMap.salary_essay || prev.salary_essay,
        retirement_essay: contentMap.retirement_essay || prev.retirement_essay,
        deflation_essay: contentMap.deflation_essay || prev.deflation_essay,
        charts_essay: contentMap.charts_essay || prev.charts_essay,
        housing_affordability_essay: contentMap.housing_affordability_essay || prev.housing_affordability_essay,
        emergency_fund_essay: contentMap.emergency_fund_essay || prev.emergency_fund_essay,
        budget_essay: contentMap.budget_essay || prev.budget_essay,
        privacy_content: contentMap.privacy_page || prev.privacy_content,
        terms_content: contentMap.terms_page || prev.terms_content,
      }))

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

      try {
        const blogResponse = await fetch("/api/student-loan-blog")
        const blogResult = await blogResponse.json()
        if (blogResult.success && blogResult.data) {
          setContent((prev) => ({
            ...prev,
            student_loan_blog_title: blogResult.data.title || prev.student_loan_blog_title,
            student_loan_blog_content: blogResult.data.content || prev.student_loan_blog_content,
            student_loan_methodology: blogResult.data.methodology || prev.student_loan_methodology,
          }))
        }
      } catch (err) {
        console.log("Student loan blog content not found, using defaults")
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
        id: "main", // Assuming 'main' is the identifier for site settings
        site_title: content.site_title,
        site_description: content.site_description,
        footer_text: content.footer_text, // Saving footer_text
        logo_url: content.logo_url,
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

  const saveStudentLoanBlog = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/student-loan-blog", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: content.student_loan_blog_title,
          content: content.student_loan_blog_content,
          methodology: content.student_loan_methodology,
        }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setMessage("Student loan blog saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error saving student loan blog:", err)
      setError("Failed to save student loan blog")
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
          category: newFaq.category || "general",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add FAQ")
      }

      const result = await response.json()

      if (result.success && result.data) {
        setFaqs((prev) => [...prev, result.data])
        setNewFaq({ question: "", answer: "", category: "general" })
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

  const updateFaq = async (id: string, question: string, answer: string, category?: string) => {
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
          category: category || "general",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update FAQ")
      }

      setFaqs((prev) => prev.map((faq) => (faq.id === id ? { ...faq, question, answer, category } : faq)))
      setMessage("FAQ updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error updating FAQ:", err)
      setError("Failed to update FAQ")
    }
  }

  const fetchStudentLoanData = async () => {
    setFetchingData(true)
    setDataFetchResult(null)
    setError("")

    try {
      const response = await fetch("/api/admin/fetch-student-loan-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      setDataFetchResult(result)
      setMessage("Student loan data fetched successfully! Download the files below.")
      setTimeout(() => setMessage(""), 5000)
    } catch (err) {
      console.error("Error fetching student loan data:", err)
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setFetchingData(false)
    }
  }

  const fetchCurrencyData = async (currency: string) => {
    setFetchingCurrency(currency)
    setCurrencyDataResult(null)
    setError("")

    try {
      const response = await fetch(`/api/admin/fetch-${currency.toLowerCase()}-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorDetails = [
          `Status: ${response.status}`,
          `Error: ${result.error || "Unknown error"}`,
          result.details ? `Details: ${result.details}` : null,
          result.apiStatus ? `API Status: ${result.apiStatus}` : null,
          result.apiResponse ? `API Response: ${JSON.stringify(result.apiResponse).substring(0, 200)}...` : null,
        ]
          .filter(Boolean)
          .join("\n")

        throw new Error(errorDetails)
      }

      setCurrencyDataResult(result)
      setMessage(`${currency} data fetched successfully! Download the file below.`)
      setTimeout(() => setMessage(""), 5000)
    } catch (err) {
      console.error(`Error fetching ${currency} data:`, err)
      setError(`Failed to fetch ${currency} data:\n\n${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setFetchingCurrency(null)
    }
  }

  // Download function for JSON files
  const downloadFile = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const fetchHousingAffordabilityData = async () => {
    setFetchingHousing(true)
    setHousingDataResult(null)
    setError("")

    try {
      console.log("[v0] Starting housing affordability data fetch...")

      const response = await fetch("/api/admin/fetch-housing-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
        }),
      })

      console.log("[v0] Response status:", response.status)
      const result = await response.json()
      console.log("[v0] Response data:", result)

      if (!response.ok) {
        const errorDetails = [
          `Status: ${response.status}`,
          `Error: ${result.error || "Unknown error"}`,
          result.details ? `Details: ${result.details}` : null,
          result.casShillerStatus ? `Case-Shiller API Status: ${result.casShillerStatus}` : null,
          result.incomeStatus ? `Income API Status: ${result.incomeStatus}` : null,
          result.casShillerError ? `Case-Shiller Error: ${result.casShillerError}` : null,
          result.incomeError ? `Income Error: ${result.incomeError}` : null,
        ]
          .filter(Boolean)
          .join("\n")

        throw new Error(errorDetails)
      }

      setHousingDataResult(result)
      setMessage("Housing affordability data fetched successfully! Download the file below.")
      setTimeout(() => setMessage(""), 5000)
    } catch (err) {
      console.error("[v0] Error fetching housing data:", err)
      setError(`Failed to fetch housing affordability data:\n\n${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setFetchingHousing(false)
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
                <AlertDescription className="text-red-800 whitespace-pre-wrap font-mono text-xs">
                  {error}
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
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Collection
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

            {/* Charts Essay */}
            <Card>
              <CardHeader>
                <CardTitle>Charts Essay</CardTitle>
                <p className="text-sm text-gray-600">Educational content for the charts page</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.charts_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, charts_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter charts essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("charts_essay", content.charts_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Charts Essay"}
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
                <CardDescription>Educational content for the retirement calculator page</CardDescription>
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

            {/* Deflation Calculator Essay */}
            <Card>
              <CardHeader>
                <CardTitle>Deflation Calculator Essay</CardTitle>
                <CardDescription>Educational content for the deflation calculator page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.deflation_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, deflation_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter deflation calculator essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("deflation_essay", content.deflation_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Deflation Calculator Essay"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Housing Affordability Calculator Essay</CardTitle>
                <CardDescription>Educational content for the housing affordability calculator page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.housing_affordability_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, housing_affordability_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter housing affordability calculator essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("housing_affordability_essay", content.housing_affordability_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Housing Affordability Essay"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Fund Calculator Essay</CardTitle>
                <CardDescription>Educational content for the emergency fund calculator page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.emergency_fund_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, emergency_fund_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter emergency fund calculator essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("emergency_fund_essay", content.emergency_fund_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Emergency Fund Essay"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>50/30/20 Budget Calculator Essay</CardTitle>
                <CardDescription>Educational content for the 50/30/20 budget calculator page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content.budget_essay}
                  onChange={(e) => setContent((prev) => ({ ...prev, budget_essay: e.target.value }))}
                  rows={15}
                  placeholder="Enter budget calculator essay content..."
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveContent("budget_essay", content.budget_essay)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Budget Calculator Essay"}
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

            <Card>
              <CardHeader>
                <CardTitle>Student Loan Calculator Blog</CardTitle>
                <CardDescription>
                  Educational content for the student loan calculator page (1000+ words recommended)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blog Title</label>
                  <Input
                    value={content.student_loan_blog_title}
                    onChange={(e) => setContent((prev) => ({ ...prev, student_loan_blog_title: e.target.value }))}
                    placeholder="Understanding Student Loans in an Inflationary Economy"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Blog Content</label>
                  <Textarea
                    value={content.student_loan_blog_content}
                    onChange={(e) => setContent((prev) => ({ ...prev, student_loan_blog_content: e.target.value }))}
                    rows={20}
                    placeholder="Enter comprehensive blog content about student loans and inflation..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Current word count: {content.student_loan_blog_content.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Methodology Section</label>
                  <Textarea
                    value={content.student_loan_methodology}
                    onChange={(e) => setContent((prev) => ({ ...prev, student_loan_methodology: e.target.value }))}
                    rows={15}
                    placeholder="Explain how the calculator works, data sources, and calculation methods..."
                    className="font-mono text-sm"
                  />
                </div>

                <Button onClick={saveStudentLoanBlog} disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Student Loan Blog"}
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

                {/* Footer Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Footer Text</label>
                  <Textarea
                    value={content.footer_text}
                    onChange={(e) => setContent((prev) => ({ ...prev, footer_text: e.target.value }))}
                    rows={3}
                    placeholder="Your company name or copyright notice"
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newFaq.category}
                    onValueChange={(value) => setNewFaq((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General (Homepage)</SelectItem>
                      <SelectItem value="salary">Salary Calculator</SelectItem>
                      <SelectItem value="retirement">Retirement Calculator</SelectItem>
                      <SelectItem value="student-loan">Student Loan Calculator</SelectItem>
                      <SelectItem value="deflation">Deflation Calculator</SelectItem>
                      <SelectItem value="legacy">Legacy Planner</SelectItem>
                      <SelectItem value="charts">Charts & Analytics</SelectItem>
                      <SelectItem value="housing-affordability">Housing Affordability Calculator</SelectItem>
                      <SelectItem value="emergency-fund">Emergency Fund Calculator</SelectItem>
                      <SelectItem value="budget">50/30/20 Budget Calculator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={faq.category || "general"}
                        onValueChange={(value) => updateFaq(faq.id, faq.question, faq.answer, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General (Homepage)</SelectItem>
                          <SelectItem value="salary">Salary Calculator</SelectItem>
                          <SelectItem value="retirement">Retirement Calculator</SelectItem>
                          <SelectItem value="student-loan">Student Loan Calculator</SelectItem>
                          <SelectItem value="deflation">Deflation Calculator</SelectItem>
                          <SelectItem value="legacy">Legacy Planner</SelectItem>
                          <SelectItem value="charts">Charts & Analytics</SelectItem>
                          <SelectItem value="housing-affordability">Housing Affordability Calculator</SelectItem>
                          <SelectItem value="emergency-fund">Emergency Fund Calculator</SelectItem>
                          <SelectItem value="budget">50/30/20 Budget Calculator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFaq(faq.id, e.target.value, faq.answer, faq.category)}
                      className="font-medium"
                    />
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(faq.id, faq.question, e.target.value, faq.category)}
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

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Student Loan Data Collection
                </CardTitle>
                <CardDescription>
                  Fetch live data from BLS, College Scorecard, and other APIs. Download the JSON files and add them to
                  /public/data/student-loans/ in your GitHub repo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Data Sources:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• BLS API - Salary data by occupation</li>
                    <li>• College Scorecard API - Earnings by major</li>
                    <li>• Federal Student Aid - Loan interest rates</li>
                    <li>• HHS - Poverty guidelines for IDR calculations</li>
                    <li>• IRS - Tax brackets</li>
                  </ul>
                </div>

                <Button
                  onClick={fetchStudentLoanData}
                  disabled={fetchingData}
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Database className={`w-5 h-5 ${fetchingData ? "animate-pulse" : ""}`} />
                  {fetchingData ? "Fetching Data..." : "Fetch Student Loan Data"}
                </Button>

                {dataFetchResult && dataFetchResult.files && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-green-900">Data Fetched Successfully!</h4>

                    <div className="space-y-2">
                      <p className="text-sm text-green-800 font-medium">Download Files:</p>
                      {Object.entries(dataFetchResult.files).map(([filename, data]) => (
                        <Button
                          key={filename}
                          onClick={() => downloadFile(filename, data)}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Database className="w-4 h-4 mr-2" />
                          {filename}
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Salary Records</p>
                        <p className="text-2xl font-bold text-green-700">
                          {dataFetchResult.recordCounts?.salaries || 0}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Major Earnings</p>
                        <p className="text-2xl font-bold text-green-700">
                          {dataFetchResult.recordCounts?.earnings || 0}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Loan Rate Years</p>
                        <p className="text-2xl font-bold text-green-700">
                          {dataFetchResult.recordCounts?.loanRates || 0}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Poverty Guidelines</p>
                        <p className="text-2xl font-bold text-green-700">
                          {dataFetchResult.recordCounts?.povertyGuidelines || 0}
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Next Steps:</strong> Download all 5 files above, then add them to{" "}
                        <code className="bg-yellow-100 px-1 rounded">/public/data/student-loans/</code> in your GitHub
                        repo, replacing the sample files.
                      </p>
                    </div>

                    <p className="text-sm text-green-800">
                      Last updated: {new Date(dataFetchResult.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Housing Affordability Data Collection section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Housing Affordability Data Collection
                </CardTitle>
                <CardDescription>
                  Fetch live data from FRED (Federal Reserve Economic Data). Download the JSON file and add it to
                  /public/data/ in your GitHub repo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Data Sources:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• FRED API - Case-Shiller U.S. National Home Price Index (CSUSHPISA)</li>
                    <li>• FRED API - Real Median Household Income (MEHOINUSA672N)</li>
                    <li>• Data Range: 1987-2025 (Case-Shiller starts in 1987)</li>
                    <li>• Calculates price-to-income ratios for housing affordability analysis</li>
                  </ul>
                </div>

                <Button
                  onClick={fetchHousingAffordabilityData}
                  disabled={fetchingHousing}
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Database className={`w-5 h-5 ${fetchingHousing ? "animate-pulse" : ""}`} />
                  {fetchingHousing ? "Fetching Housing Data..." : "Fetch Housing Affordability Data"}
                </Button>

                {housingDataResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-green-900">Housing Data Fetched Successfully!</h4>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">File</p>
                        <p className="font-mono text-sm text-green-700">{housingDataResult.file}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Total Years</p>
                        <p className="text-2xl font-bold text-green-700">{housingDataResult.recordCount}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Year Range</p>
                        <p className="font-semibold text-green-700">{housingDataResult.yearRange}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Last Updated</p>
                        <p className="text-xs text-green-700">
                          {new Date(housingDataResult.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {housingDataResult.dataQuality && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Data Quality:</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• Case-Shiller Records: {housingDataResult.dataQuality.casShillerRecords}</li>
                          <li>• Income Records: {housingDataResult.dataQuality.incomeRecords}</li>
                          <li>• Latest Case-Shiller: {housingDataResult.dataQuality.latestCaseShiller}</li>
                          <li>• Latest Income: {housingDataResult.dataQuality.latestIncome}</li>
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => downloadFile(housingDataResult.file, housingDataResult.data)}
                      className="w-full"
                      size="lg"
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Download {housingDataResult.file}
                    </Button>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Next Steps:</strong> Download the file above, then upload it in the v0 chat so it can be
                        added to <code className="bg-yellow-100 px-1 rounded">/public/data/</code> in your project.
                      </p>
                    </div>

                    <p className="text-sm text-green-800">
                      Last updated: {new Date(housingDataResult.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Currency Inflation Data Collection
                </CardTitle>
                <CardDescription>
                  Fetch real CPI data from official statistical agencies (Statistics Denmark, Statistics Sweden,
                  Statistics Poland). Download the JSON files and add them to /public/data/ in your GitHub repo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Danish Krone (DKK)</CardTitle>
                      <CardDescription className="text-xs">Statistics Denmark (DST)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => fetchCurrencyData("DKK")}
                        disabled={fetchingCurrency !== null}
                        className="w-full"
                        size="sm"
                      >
                        {fetchingCurrency === "DKK" ? (
                          <>
                            <Database className="w-4 h-4 mr-2 animate-pulse" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4 mr-2" />
                            Fetch DKK Data
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Swedish Krona (SEK)</CardTitle>
                      <CardDescription className="text-xs">Statistics Sweden (SCB)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => fetchCurrencyData("SEK")}
                        disabled={fetchingCurrency !== null}
                        className="w-full"
                        size="sm"
                      >
                        {fetchingCurrency === "SEK" ? (
                          <>
                            <Database className="w-4 h-4 mr-2 animate-pulse" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4 mr-2" />
                            Fetch SEK Data
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Polish Zloty (PLN)</CardTitle>
                      <CardDescription className="text-xs">Statistics Poland (GUS)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => fetchCurrencyData("PLN")}
                        disabled={fetchingCurrency !== null}
                        className="w-full"
                        size="sm"
                      >
                        {fetchingCurrency === "PLN" ? (
                          <>
                            <Database className="w-4 h-4 mr-2 animate-pulse" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4 mr-2" />
                            Fetch PLN Data
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {currencyDataResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-green-900">Currency Data Fetched Successfully!</h4>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">File</p>
                        <p className="font-mono text-sm text-green-700">{currencyDataResult.file}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Records</p>
                        <p className="text-2xl font-bold text-green-700">{currencyDataResult.recordCount}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Year Range</p>
                        <p className="font-semibold text-green-700">{currencyDataResult.yearRange}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Last Updated</p>
                        <p className="text-xs text-green-700">
                          {new Date(currencyDataResult.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => downloadFile(currencyDataResult.file, currencyDataResult.data)}
                      className="w-full"
                      size="lg"
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Download {currencyDataResult.file}
                    </Button>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Next Steps:</strong> Download the file above, then add it to{" "}
                        <code className="bg-yellow-100 px-1 rounded">/public/data/</code> in your GitHub repo.
                      </p>
                    </div>
                  </div>
                )}
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
