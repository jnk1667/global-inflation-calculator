"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { supabase } from "@/lib/supabase"

interface FAQ {
  id: string
  question: string
  answer: string
}

const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadFAQs = async () => {
      try {
        const { data, error } = await supabase.from("faqs").select("*").order("id")

        if (error) {
          console.error("Error loading FAQs:", error)
          // Load default FAQs if database fails
          setFaqs(defaultFAQs)
        } else if (data && data.length > 0) {
          setFaqs(data)
        } else {
          // Load default FAQs if no data in database
          setFaqs(defaultFAQs)
        }
      } catch (err) {
        console.error("Error loading FAQs:", err)
        setFaqs(defaultFAQs)
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [mounted])

  const defaultFAQs: FAQ[] = [
    {
      id: "1",
      question: "How accurate is this inflation calculator?",
      answer:
        "Our calculator uses official government data from sources like the US Bureau of Labor Statistics, UK Office for National Statistics, and other national statistical agencies. The data is updated monthly and provides historical accuracy back to 1913 for most currencies.",
    },
    {
      id: "2",
      question: "What currencies are supported?",
      answer:
        "We currently support USD (US Dollar), GBP (British Pound), EUR (Euro), CAD (Canadian Dollar), and AUD (Australian Dollar). Each currency has different historical data availability, with USD and GBP having the longest historical records.",
    },
    {
      id: "3",
      question: "How is inflation calculated?",
      answer:
        "Inflation is calculated using Consumer Price Index (CPI) data. We compare the CPI value from your selected starting year to the current year's CPI to determine how much prices have increased and what equivalent purchasing power would be today.",
    },
    {
      id: "4",
      question: "Why do different currencies show different inflation rates?",
      answer:
        "Each country experiences different economic conditions, monetary policies, and market factors that affect inflation. Central bank policies, economic growth, supply and demand, and global events all contribute to varying inflation rates between countries.",
    },
    {
      id: "5",
      question: "How often is the data updated?",
      answer:
        "Our inflation data is updated monthly when new CPI figures are released by government statistical agencies. The most recent data is typically from the previous month, as there's usually a delay in official reporting.",
    },
    {
      id: "6",
      question: "Can I use this for investment decisions?",
      answer:
        "This calculator is for educational purposes only and should not be used as the sole basis for investment decisions. While it provides accurate historical inflation data, past performance doesn't guarantee future results. Always consult with financial professionals for investment advice.",
    },
    {
      id: "7",
      question: "What's the difference between total inflation and annual average?",
      answer:
        "Total inflation shows the cumulative price increase over the entire period, while annual average shows the average yearly inflation rate. For example, 100% total inflation over 10 years equals roughly 7.2% annual average inflation.",
    },
    {
      id: "8",
      question: "Why doesn't the Euro have data before 1999?",
      answer:
        "The Euro was officially introduced in 1999, so there's no Euro inflation data before that date. For earlier European inflation data, you would need to look at individual country currencies like the German Deutsche Mark or French Franc.",
    },
  ]

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <Card className="bg-card shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-xl text-card-foreground">❓ Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/50 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card shadow-lg border-border">
      <CardHeader>
        <CardTitle className="text-xl text-card-foreground">❓ Frequently Asked Questions</CardTitle>
        <div className="text-sm text-muted-foreground">Common questions about inflation and our calculator</div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-border">
              <AccordionTrigger className="text-left text-card-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default FAQ
