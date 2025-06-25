"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface FAQItem {
  id: string
  question: string
  answer: string
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load FAQs from your data file
    const loadFAQs = async () => {
      try {
        const response = await fetch("/data/faqs.json")
        const data = await response.json()
        setFaqs(data.faqs || defaultFAQs)
      } catch (error) {
        setFaqs(defaultFAQs)
      }
    }

    loadFAQs()
  }, [])

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600">Everything you need to know about our inflation calculator</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id} className="border-0 shadow-sm">
            <CardContent className="p-0">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <div className={`transform transition-transform ${openItems.has(faq.id) ? "rotate-180" : ""}`}>▼</div>
                </div>
              </button>

              {openItems.has(faq.id) && (
                <div className="px-6 pb-6">
                  <div className="text-gray-600 leading-relaxed">{faq.answer}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schema markup for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  )
}

const defaultFAQs: FAQItem[] = [
  {
    id: "1",
    question: "How accurate is your inflation data?",
    answer:
      "Our data comes directly from official government sources: US Bureau of Labor Statistics, UK Office for National Statistics, Statistics Canada, Australian Bureau of Statistics, and Eurostat. We update this data monthly to ensure accuracy.",
  },
  {
    id: "2",
    question: "Which currencies and time periods do you support?",
    answer:
      "We support 5 major currencies: USD (from 1913), GBP (from 1947), EUR (from 1996), CAD (from 1914), and AUD (from 1948). This gives you over 100 years of historical data for most currencies.",
  },
  {
    id: "3",
    question: "Is this service completely free?",
    answer:
      "Yes! Our inflation calculator is completely free to use with no registration required. We support the service through advertising to keep it free for everyone.",
  },
  {
    id: "4",
    question: "How do you calculate inflation?",
    answer:
      "We use the Consumer Price Index (CPI) from each country's official statistics bureau. The calculation compares the CPI value from your selected year to the current year to determine the equivalent purchasing power.",
  },
  {
    id: "5",
    question: "Can I use this for business or academic purposes?",
    answer:
      "Our tool is perfect for research, education, business planning, and personal finance. All data comes from official government sources, making it reliable for professional use.",
  },
  {
    id: "6",
    question: "How often is the data updated?",
    answer:
      "We automatically update our inflation data monthly when new CPI figures are released by government statistics agencies. This ensures you always have the most current information.",
  },
]
