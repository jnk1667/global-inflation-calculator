"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FAQItem {
  id: string
  question: string
  answer: string
}

const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await fetch("/data/faqs.json")
        if (response.ok) {
          const data = await response.json()
          setFaqs(data.faqs || [])
        }
      } catch (error) {
        console.error("Error loading FAQs:", error)
        // Fallback FAQs
        setFaqs([
          {
            id: "what-is-inflation",
            question: "What is inflation?",
            answer:
              "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power over time. When inflation occurs, each unit of currency buys fewer goods and services than it did previously.",
          },
          {
            id: "how-calculated",
            question: "How is inflation calculated?",
            answer:
              "Inflation is typically measured using price indices like the Consumer Price Index (CPI), which tracks the average change in prices paid by consumers for a basket of goods and services over time.",
          },
          {
            id: "data-sources",
            question: "Where does the data come from?",
            answer:
              "Our inflation data comes from official government sources including the US Bureau of Labor Statistics, UK Office for National Statistics, Eurostat, Statistics Canada, and the Australian Bureau of Statistics.",
          },
          {
            id: "accuracy",
            question: "How accurate are these calculations?",
            answer:
              "Our calculations use official government inflation data and are mathematically accurate. However, inflation affects different goods and services differently, so individual experiences may vary.",
          },
          {
            id: "currencies",
            question: "Which currencies are supported?",
            answer:
              "We currently support USD (US Dollar), GBP (British Pound), EUR (Euro), CAD (Canadian Dollar), and AUD (Australian Dollar), with historical data going back to 1913 for USD and varying start dates for other currencies.",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [])

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl">❓ Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">❓ Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left hover:text-blue-600">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default FAQ
