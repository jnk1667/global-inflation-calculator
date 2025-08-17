"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase, type AboutContent } from "@/lib/supabase"
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
  BarChart3,
  TrendingUp,
  Database,
  Shield,
  Award,
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
    loadAboutContent()
  }, [])

  const loadAboutContent = async () => {
    try {
      const { data, error } = await supabase.from("about_content").select("*").order("section", { ascending: true })

      if (data && !error) {
        setAboutContent(data)
      }
    } catch (error) {
      console.error("Failed to load about content:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => {
      if (paragraph.startsWith("## ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {paragraph.replace("## ", "")}
          </h3>
        )
      } else if (paragraph.startsWith("- ")) {
        const items = paragraph.split("\n").filter((item) => item.startsWith("- "))
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item.replace("- ", "")}</li>
            ))}
          </ul>
        )
      } else {
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {paragraph}
          </p>
        )
      }
    })
  }

  const renderSocialLinks = (socialLinks: any) => {
    // Ensure socialLinks is an array and has content
    if (!socialLinks || !Array.isArray(socialLinks) || socialLinks.length === 0) {
      return null
    }

    return (
      <div className="flex flex-wrap gap-3 mt-4">
        {socialLinks.map((link, index) => {
          const IconComponent = socialIcons[link.icon as keyof typeof socialIcons] || ExternalLink
          return (
            <Button key={index} variant="outline" size="sm" asChild className="flex items-center gap-2 bg-transparent">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <IconComponent className="w-4 h-4" />
                {link.platform}
              </a>
            </Button>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const projectContent = aboutContent.find((content) => content.section === "project")
  const adminContent = aboutContent.find((content) => content.section === "admin")

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 dark:bg-background dark:text-foreground">
      {/* Header */}
      <header className="border-b bg-card dark:bg-card dark:border-b dark:border-foreground">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 dark:text-foreground">About Us</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2 dark:text-muted-foreground">
              Learn about our mission to make inflation data accessible and the team behind the Global Inflation
              Calculator.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Project Section */}
          {projectContent ? (
            <Card className="h-fit dark:bg-card dark:border dark:border-foreground">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xl sm:text-2xl dark:text-foreground">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 dark:text-primary" />
                  <span className="text-left sm:text-left">{projectContent.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 dark:text-muted-foreground">
                <div className="prose prose-gray dark:prose-invert max-w-none text-sm sm:text-base">
                  {renderContent(projectContent.content)}
                </div>

                {/* Project Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground dark:text-foreground">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <Calculator className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>Free Calculator</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <BarChart3 className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>8 Currencies</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>100+ Years Data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <Database className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>Official Sources</span>
                    </div>
                  </div>
                </div>

                {projectContent.social_links && renderSocialLinks(projectContent.social_links)}
              </CardContent>
            </Card>
          ) : (
            // Default project content with better mobile layout
            <Card className="h-fit dark:bg-card dark:border dark:border-foreground">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xl sm:text-2xl dark:text-foreground">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 dark:text-primary" />
                  <span>About This Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 dark:text-muted-foreground">
                <div className="prose prose-gray dark:prose-invert max-w-none text-sm sm:text-base">
                  <p className="text-muted-foreground leading-relaxed mb-4 dark:text-muted-foreground">
                    The Global Inflation Calculator is a comprehensive financial tool designed to help individuals,
                    researchers, and financial professionals understand the impact of inflation on purchasing power over
                    time.
                  </p>
                  <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 text-foreground dark:text-foreground">
                    Our Mission
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 dark:text-muted-foreground">
                    We believe that understanding inflation is crucial for making informed financial decisions. Our
                    mission is to provide accurate, accessible, and comprehensive inflation data to help people
                    understand how their money's value changes over time.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground dark:text-foreground">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <Calculator className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>Free Calculator</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <BarChart3 className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>8 Currencies</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>100+ Years Data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-foreground">
                      <Database className="w-4 h-4 text-primary flex-shrink-0 dark:text-primary" />
                      <span>Official Sources</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Section - Similar mobile improvements */}
          {adminContent ? (
            <Card className="h-fit dark:bg-card dark:border dark:border-foreground">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xl sm:text-2xl dark:text-foreground">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 dark:text-primary" />
                  <span>{adminContent.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 dark:text-muted-foreground">
                <div className="prose prose-gray dark:prose-invert max-w-none text-sm sm:text-base">
                  {renderContent(adminContent.content)}
                </div>

                {/* Credentials */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground dark:text-foreground">Credentials & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs dark:text-foreground">
                      <Award className="w-3 h-3 dark:text-primary" />
                      Fintech
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs dark:text-foreground">
                      <Database className="w-3 h-3 dark:text-primary" />
                      Data Science
                    </Badge>
                  </div>
                </div>

                {adminContent.social_links && renderSocialLinks(adminContent.social_links)}
              </CardContent>
            </Card>
          ) : (
            // Default admin content with mobile improvements
            <Card className="h-fit dark:bg-card dark:border dark:border-foreground">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xl sm:text-2xl dark:text-foreground">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 dark:text-primary" />
                  <span>About the Administrator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 dark:text-muted-foreground">
                <div className="prose prose-gray dark:prose-invert max-w-none text-sm sm:text-base">
                  <p className="text-muted-foreground leading-relaxed mb-4 dark:text-muted-foreground">
                    I am a financial data analyst and software developer with over 10 years of experience in economic
                    research and web development. I created this calculator to bridge the gap between complex economic
                    data and practical financial understanding.
                  </p>
                  <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 text-foreground dark:text-foreground">
                    Background
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 dark:text-muted-foreground">
                    My background includes work with government statistical agencies, financial institutions, and
                    academic research organizations. I hold degrees in Economics and Computer Science.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground dark:text-foreground">Credentials & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs dark:text-foreground">
                      <Award className="w-3 h-3 dark:text-primary" />
                      Fintech
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs dark:text-foreground">
                      <Database className="w-3 h-3 dark:text-primary" />
                      Data Science
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-12 dark:border dark:border-foreground" />

        {/* Methodology Section */}
        <Card className="dark:bg-card dark:border dark:border-foreground">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 dark:text-foreground">
              <BarChart3 className="w-8 h-8 text-primary dark:text-primary" />
              Methodology & Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 dark:text-muted-foreground">
            {/* Calculation Formula */}
            <div>
              <h3 className="text-xl font-semibold mb-4 dark:text-foreground">Inflation Calculation Formula</h3>
              <div className="bg-muted p-6 rounded-lg dark:bg-background">
                <div className="text-center mb-4 dark:text-foreground">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded border dark:bg-background dark:border-foreground">
                    Adjusted Amount = (Original Amount × Current CPI) ÷ Historical CPI
                  </code>
                </div>
                <div className="text-center mb-4 dark:text-foreground">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded border dark:bg-background dark:border-foreground">
                    Total Inflation = ((Adjusted Amount - Original Amount) ÷ Original Amount) × 100
                  </code>
                </div>
                <div className="text-center dark:text-foreground">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded border dark:bg-background dark:border-foreground">
                    Annual Rate = (Adjusted Amount ÷ Original Amount)^(1/Years) - 1
                  </code>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-xl font-semibold mb-4 dark:text-foreground">Official Data Sources</h3>
              <div className="grid md:grid-cols-2 gap-4 dark:text-foreground">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div>
                      <h4 className="font-medium">United States</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        US Bureau of Labor Statistics (BLS)
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Consumer Price Index (CPI-U)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <h4 className="font-medium">United Kingdom</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Office for National Statistics (ONS)
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Retail Price Index (RPI)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇪🇺</span>
                    <div>
                      <h4 className="font-medium">European Union</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Eurostat</p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Harmonised Index of Consumer Prices (HICP)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇨🇦</span>
                    <div>
                      <h4 className="font-medium">Canada</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Statistics Canada</p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Consumer Price Index (CPI)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇦🇺</span>
                    <div>
                      <h4 className="font-medium">Australia</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Australian Bureau of Statistics (ABS)
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Consumer Price Index (CPI)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇨🇭</span>
                    <div>
                      <h4 className="font-medium">Switzerland</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Swiss Federal Statistical Office (FSO)
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Consumer Price Index (CPI)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇯🇵</span>
                    <div>
                      <h4 className="font-medium">Japan</h4>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Statistics Bureau of Japan
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Consumer Price Index (CPI)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div>
              <h3 className="text-xl font-semibold mb-4 dark:text-foreground">Data Quality & Updates</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="dark:bg-card dark:border dark:border-foreground">
                  <CardContent className="p-4 text-center dark:text-foreground">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2 dark:text-primary" />
                    <h4 className="font-medium mb-2 dark:text-foreground">Verified Sources</h4>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      All data sourced directly from official government statistical agencies
                    </p>
                  </CardContent>
                </Card>
                <Card className="dark:bg-card dark:border dark:border-foreground">
                  <CardContent className="p-4 text-center dark:text-foreground">
                    <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2 dark:text-primary" />
                    <h4 className="font-medium mb-2 dark:text-foreground">Regular Updates</h4>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Data updated monthly when new CPI figures are released
                    </p>
                  </CardContent>
                </Card>
                <Card className="dark:bg-card dark:border dark:border-foreground">
                  <CardContent className="p-4 text-center dark:text-foreground">
                    <Database className="w-8 h-8 text-primary mx-auto mb-2 dark:text-primary" />
                    <h4 className="font-medium mb-2 dark:text-foreground">Historical Coverage</h4>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Comprehensive data from 1913 to present day
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Limitations */}
            <div>
              <h3 className="text-xl font-semibold mb-4 dark:text-foreground">Important Disclaimers</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 dark:text-foreground">
                <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground">
                  <li>• This calculator is for educational and informational purposes only</li>
                  <li>• Results should not be used as the sole basis for financial decisions</li>
                  <li>• Inflation affects different goods and services differently</li>
                  <li>• Regional variations within countries are not reflected</li>
                  <li>• Historical data may be subject to revisions by statistical agencies</li>
                  <li>• Consult with financial professionals for investment advice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center mt-12">
          <Button asChild>
            <Link href="/">← Back to Calculator</Link>
          </Button>
          <Button asChild className="ml-4">
            <Link href="/retirement-calculator">Retirement Calculator →</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
