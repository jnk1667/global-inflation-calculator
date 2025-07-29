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
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">About Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn about our mission to make inflation data accessible and the team behind the Global Inflation
              Calculator.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Project Section */}
          {projectContent ? (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Building2 className="w-8 h-8 text-primary" />
                  {projectContent.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {renderContent(projectContent.content)}
                </div>

                {/* Project Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Key Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calculator className="w-4 h-4 text-primary" />
                      <span>Free Calculator</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span>7 Currencies</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>100+ Years Data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-primary" />
                      <span>Official Sources</span>
                    </div>
                  </div>
                </div>

                {projectContent.social_links && renderSocialLinks(projectContent.social_links)}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Building2 className="w-8 h-8 text-primary" />
                  About This Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The Global Inflation Calculator is a comprehensive financial tool designed to help individuals,
                    researchers, and financial professionals understand the impact of inflation on purchasing power over
                    time.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We believe that understanding inflation is crucial for making informed financial decisions. Our
                    mission is to provide accurate, accessible, and comprehensive inflation data to help people
                    understand how their money's value changes over time.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Key Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calculator className="w-4 h-4 text-primary" />
                      <span>Free Calculator</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span>7 Currencies</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>100+ Years Data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-primary" />
                      <span>Official Sources</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Section */}
          {adminContent ? (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="w-8 h-8 text-primary" />
                  {adminContent.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {renderContent(adminContent.content)}
                </div>

                {/* Credentials */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Credentials & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Economics Background
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      10+ Years Experience
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Data Science Expert
                    </Badge>
                  </div>
                </div>

                {adminContent.social_links && renderSocialLinks(adminContent.social_links)}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="w-8 h-8 text-primary" />
                  About the Administrator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    I am a financial data analyst and software developer with over 10 years of experience in economic
                    research and web development. I created this calculator to bridge the gap between complex economic
                    data and practical financial understanding.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Background</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    My background includes work with government statistical agencies, financial institutions, and
                    academic research organizations. I hold degrees in Economics and Computer Science.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Credentials & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Economics Background
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      10+ Years Experience
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Data Science Expert
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-12" />

        {/* Methodology Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Methodology & Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Calculation Formula */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Inflation Calculation Formula</h3>
              <div className="bg-muted p-6 rounded-lg">
                <div className="text-center mb-4">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded border">
                    Adjusted Amount = (Original Amount × Current CPI) ÷ Historical CPI
                  </code>
                </div>
                <div className="text-center mb-4">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded border">
                    Total Inflation = ((Adjusted Amount - Original Amount) ÷ Original Amount) × 100
                  </code>
                </div>
                <div className="text-center">
                  <code className="text-lg font-mono bg-background px-4 py-2 rounded border">
                    Annual Rate = (Adjusted Amount ÷ Original Amount)^(1/Years) - 1
                  </code>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Official Data Sources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div>
                      <h4 className="font-medium">United States</h4>
                      <p className="text-sm text-muted-foreground">US Bureau of Labor Statistics (BLS)</p>
                      <p className="text-xs text-muted-foreground">Consumer Price Index (CPI-U)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <h4 className="font-medium">United Kingdom</h4>
                      <p className="text-sm text-muted-foreground">Office for National Statistics (ONS)</p>
                      <p className="text-xs text-muted-foreground">Retail Price Index (RPI)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇪🇺</span>
                    <div>
                      <h4 className="font-medium">European Union</h4>
                      <p className="text-sm text-muted-foreground">Eurostat</p>
                      <p className="text-xs text-muted-foreground">Harmonised Index of Consumer Prices (HICP)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇨🇦</span>
                    <div>
                      <h4 className="font-medium">Canada</h4>
                      <p className="text-sm text-muted-foreground">Statistics Canada</p>
                      <p className="text-xs text-muted-foreground">Consumer Price Index (CPI)</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇦🇺</span>
                    <div>
                      <h4 className="font-medium">Australia</h4>
                      <p className="text-sm text-muted-foreground">Australian Bureau of Statistics (ABS)</p>
                      <p className="text-xs text-muted-foreground">Consumer Price Index (CPI)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇨🇭</span>
                    <div>
                      <h4 className="font-medium">Switzerland</h4>
                      <p className="text-sm text-muted-foreground">Swiss Federal Statistical Office (FSO)</p>
                      <p className="text-xs text-muted-foreground">Consumer Price Index (CPI)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🇯🇵</span>
                    <div>
                      <h4 className="font-medium">Japan</h4>
                      <p className="text-sm text-muted-foreground">Statistics Bureau of Japan</p>
                      <p className="text-xs text-muted-foreground">Consumer Price Index (CPI)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Data Quality & Updates</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium mb-2">Verified Sources</h4>
                    <p className="text-sm text-muted-foreground">
                      All data sourced directly from official government statistical agencies
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium mb-2">Regular Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Data updated monthly when new CPI figures are released
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium mb-2">Historical Coverage</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive data from 1913 to present day</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Limitations */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Important Disclaimers</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
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
        </div>
      </main>
    </div>
  )
}
