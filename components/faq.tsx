"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface FAQProps {
  category?: string
  limit?: number
}

const defaultFAQs: FAQItem[] = [
  {
    id: "1",
    question: "Will Inflation ever go down?",
    answer:
      "Inflation rates can decrease (called disinflation) or even become negative (deflation), but this is relatively rare in modern economies. Central banks typically target a low, positive inflation rate (around 2%) as it indicates healthy economic growth.",
    category: "economics",
    tags: ["deflation", "trends", "economics"],
  },
  {
    id: "2",
    question: "How often is the data updated?",
    answer:
      "We update our inflation data monthly when new official statistics are released by government agencies. Historical data is also reviewed and corrected when revisions are published by central banks and statistical offices.",
    category: "data",
    tags: ["updates", "frequency", "data sources"],
  },
  {
    id: "3",
    question: "How accurate is your inflation data?",
    answer:
      "Our calculations are based on official government data from central banks and statistical agencies. However, inflation affects different goods and services differently, so individual experiences may vary from the national average.",
    category: "accuracy",
    tags: ["accuracy", "data quality", "limitations"],
  },
  {
    id: "4",
    question: "Why Inflation happens?",
    answer:
      "Inflation occurs due to various factors including increased demand for goods and services, rising production costs, monetary policy decisions, supply chain disruptions, and changes in consumer behavior. It's a complex economic phenomenon with multiple contributing factors.",
    category: "economics",
    tags: ["causes", "economics", "monetary policy"],
  },
  {
    id: "5",
    question: "What is Purchasing Power Parity (PPP)?",
    answer:
      "Purchasing Power Parity is an economic theory that compares different countries' currencies through a 'basket of goods' approach. It suggests that exchange rates should adjust so that identical goods cost the same in different countries when prices are converted to a common currency.",
    category: "concepts",
    tags: ["PPP", "definition", "economics"],
  },
]

export default function FAQ({ category, limit }: FAQProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch from API first
        try {
          const response = await fetch("/api/faqs")
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              setFaqs(data)
              return
            }
          }
        } catch (apiError) {
          console.warn("Failed to fetch FAQs from API, using default data")
        }

        // Fallback to default data
        let filteredFAQs = defaultFAQs

        // Filter by category if specified
        if (category && typeof category === "string") {
          filteredFAQs = filteredFAQs.filter((faq) => faq.category === category)
        }

        // Limit results if specified
        if (typeof limit === "number" && limit > 0) {
          filteredFAQs = filteredFAQs.slice(0, limit)
        }

        setFaqs(filteredFAQs)
      } catch (err) {
        console.error("Error loading FAQs:", err)
        setError("Failed to load FAQ data")
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [category, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Common questions about inflation and our calculator</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Common questions about inflation and our calculator</p>
        </div>
        <div className="text-center text-red-600 dark:text-red-400 py-8">
          <p>{error}</p>
          <p className="text-sm mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  if (faqs.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Common questions about inflation and our calculator</p>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>No FAQ items found for the selected category.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Common questions about inflation and our calculator</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
