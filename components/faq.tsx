"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FAQ {
  id: string
  question: string
  answer: string
}

// Default FAQs to use when database is not available
const defaultFAQs: FAQ[] = [
  {
    id: "1",
    question: "How accurate is this inflation calculator?",
    answer:
      "Our calculator uses official government data from sources like the US Bureau of Labor Statistics, UK Office for National Statistics, Eurostat, Statistics Canada, and Australian Bureau of Statistics. The data is updated monthly and provides highly accurate historical inflation calculations.",
  },
  {
    id: "2",
    question: "What time period does the calculator cover?",
    answer:
      "The calculator covers different periods for each currency: USD and CAD from 1913, GBP and AUD from 1948, and EUR from 1999. All data extends to the current year and is regularly updated.",
  },
  {
    id: "3",
    question: "How is inflation calculated?",
    answer:
      "Inflation is calculated using the Consumer Price Index (CPI) for each country. The formula compares the CPI of your selected year to the current year's CPI, showing how much more expensive goods and services have become.",
  },
  {
    id: "4",
    question: "Can I compare inflation across different currencies?",
    answer:
      "Yes! Our currency comparison tool allows you to see how the same amount of money would be affected by inflation in different countries over the same time period. This helps understand relative purchasing power changes.",
  },
  {
    id: "5",
    question: "What causes inflation?",
    answer:
      "Inflation can be caused by various factors including increased demand for goods and services, rising production costs, monetary policy changes, supply chain disruptions, and economic growth. Our calculator helps you see the cumulative effect of these factors over time.",
  },
  {
    id: "6",
    question: "How often is the data updated?",
    answer:
      "We update our inflation data monthly when new CPI figures are released by government statistical agencies. The 'Last Updated' information is displayed at the bottom of the page.",
  },
  {
    id: "7",
    question: "Is this tool free to use?",
    answer:
      "Yes, our Global Inflation Calculator is completely free to use. We believe financial education tools should be accessible to everyone.",
  },
  {
    id: "8",
    question: "Can I use this for investment planning?",
    answer:
      "While our calculator provides accurate historical inflation data, it should be used for educational purposes only. For investment decisions, please consult with qualified financial advisors who can provide personalized advice.",
  },
]

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs)
  const [loading, setLoading] = useState(false)

  // Always use default FAQs since database table doesn't exist
  useEffect(() => {
    setFaqs(defaultFAQs)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">❓ Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">❓ Frequently Asked Questions</CardTitle>
        <p className="text-gray-600">Common questions about inflation calculation and our tool</p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left hover:text-blue-600 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
