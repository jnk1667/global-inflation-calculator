"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase, type AboutContent } from "@/lib/supabase"
import { trackPageView } from "@/lib/analytics"
import {
  Building2,
  User,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Mail,
  ExternalLink,
  Calculator,
  TrendingUp,
  BarChart3,
  Database,
  Shield,
  Award,
  Clock,
} from "lucide-react"
import Link from "next/link"

const socialIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  email: Mail,
}

export default function AboutClientPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackPageView("/about")
    loadAboutContent()
  }, [])

  const loadAboutContent = async () => {
    try {
      const { data, error } = await supabase.from("about_content").select("*").order("section")

      if (data && !error) {
        setAboutContent(data)
      }
    } catch (error) {
      console.error("Failed to load about content:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderSocialLinks = (socialLinks: any) => {
    // Ensure socialLinks is an array and has content
    if (!socialLinks || !Array.isArray(socialLinks) || socialLinks.length === 0) {
      return null
    }

    return (
      <div className="flex flex-wrap gap-3 mt-4">
        {socialLinks.map((link: any, index: number) => {
          const IconComponent = socialIcons[link.platform as keyof typeof socialIcons]
          if (!IconComponent || !link.url) return null

          return (
            <Button key={index} variant="outline" size="sm" asChild className="flex items-center gap-2 bg-transparent">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )
        })}
      </div>
    )
  }

  const projectContent = aboutContent.find((content) => content.section === "project")
  const adminContent = aboutContent.find((content) => content.section === "admin")

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">About Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn about our mission to democratize financial data and meet the team behind the Global Inflation
              Calculator.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Project Section */}
        {projectContent && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Building2 className="w-8 h-8 text-primary" />
                {projectContent.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {projectContent.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                        {paragraph.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (paragraph.startsWith("- ")) {
                    const listItems = paragraph.split("\n").filter((item) => item.startsWith("- "))
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 mb-4">
                        {listItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-muted-foreground leading-relaxed">
                            {item.replace("- ", "")}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  return (
                    <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
              {renderSocialLinks(projectContent.social_links)}
            </CardContent>
          </Card>
        )}

        {/* Admin Section */}
        {adminContent && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <User className="w-8 h-8 text-primary" />
                {adminContent.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {adminContent.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                        {paragraph.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (paragraph.startsWith("- ")) {
                    const listItems = paragraph.split("\n").filter((item) => item.startsWith("- "))
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 mb-4">
                        {listItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-muted-foreground leading-relaxed">
                            {item.replace("- ", "")}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  return (
                    <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
              {renderSocialLinks(adminContent.social_links)}
            </CardContent>
          </Card>
        )}

        {/* Default Content if no database content */}
        {!projectContent && !adminContent && (
          <>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Building2 className="w-8 h-8 text-primary" />
                  About Our Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The Global Inflation Calculator is a comprehensive tool designed to help individuals, researchers,
                    and financial professionals understand the impact of inflation across different currencies and time
                    periods.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our mission is to democratize access to accurate inflation data and provide intuitive tools for
                    financial analysis. We believe that understanding inflation is crucial for making informed financial
                    decisions, whether you're planning for retirement, analyzing historical investments, or conducting
                    academic research.
                  </p>
                  <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">Key Features</h2>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li className="text-muted-foreground leading-relaxed">
                      Multi-currency support with official government data
                    </li>
                    <li className="text-muted-foreground leading-relaxed">Historical data spanning over 100 years</li>
                    <li className="text-muted-foreground leading-relaxed">Interactive charts and visualizations</li>
                    <li className="text-muted-foreground leading-relaxed">Real-time calculations and comparisons</li>
                    <li className="text-muted-foreground leading-relaxed">Mobile-responsive design</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="w-8 h-8 text-primary" />
                  About the Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our team consists of financial analysts, data scientists, and web developers passionate about making
                    financial data accessible to everyone.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We are committed to maintaining the highest standards of data accuracy and user experience. All our
                    data comes from official government statistical agencies, and we update our datasets regularly to
                    ensure you have access to the most current information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Methodology Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Calculator className="w-8 h-8 text-primary" />
              Methodology & Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Calculation Formula */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Inflation Calculation Formula
              </h3>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  We use the Consumer Price Index (CPI) to calculate inflation-adjusted values:
                </p>
                <div className="font-mono text-center text-lg bg-background p-4 rounded border">
                  Adjusted Value = Original Amount × (Current CPI / Historical CPI)
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Annual inflation rate is calculated using the compound annual growth rate (CAGR) formula:
                </p>
                <div className="font-mono text-center text-lg bg-background p-4 rounded border mt-2">
                  Annual Rate = ((Final Value / Initial Value)^(1/Years)) - 1
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Official Data Sources
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇺🇸</span>
                    <div>
                      <div className="font-medium">United States</div>
                      <div className="text-sm text-muted-foreground">Bureau of Labor Statistics</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <div className="font-medium">United Kingdom</div>
                      <div className="text-sm text-muted-foreground">Office for National Statistics</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇪🇺</span>
                    <div>
                      <div className="font-medium">European Union</div>
                      <div className="text-sm text-muted-foreground">Eurostat</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇨🇦</span>
                    <div>
                      <div className="font-medium">Canada</div>
                      <div className="text-sm text-muted-foreground">Statistics Canada</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇦🇺</span>
                    <div>
                      <div className="font-medium">Australia</div>
                      <div className="text-sm text-muted-foreground">Australian Bureau of Statistics</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇨🇭</span>
                    <div>
                      <div className="font-medium">Switzerland</div>
                      <div className="text-sm text-muted-foreground">Federal Statistical Office</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">🇯🇵</span>
                    <div>
                      <div className="font-medium">Japan</div>
                      <div className="text-sm text-muted-foreground">Statistics Bureau of Japan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Assurance */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data Quality & Updates
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">Monthly Updates</div>
                  <div className="text-sm text-muted-foreground">Data refreshed monthly from official sources</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">100+ Years</div>
                  <div className="text-sm text-muted-foreground">Historical data from 1913 to present</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">Verified Sources</div>
                  <div className="text-sm text-muted-foreground">Only official government statistical agencies</div>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Important Disclaimers</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• This calculator is for educational and informational purposes only</li>
                  <li>• Results should not be used as the sole basis for financial decisions</li>
                  <li>• CPI data may not reflect individual spending patterns or regional variations</li>
                  <li>• Historical comparisons may not account for quality improvements in goods and services</li>
                  <li>• Always consult with financial professionals for investment and planning decisions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Mail className="w-8 h-8 text-primary" />
              Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Have questions, suggestions, or found an issue? We'd love to hear from you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/privacy">Privacy Policy</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/terms">Terms of Service</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
