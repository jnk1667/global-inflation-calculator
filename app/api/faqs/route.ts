import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://globalinflationcalculator.com"

async function submitFAQUpdateToIndexNow() {
  try {
    const response = await fetch(`${SITE_URL}/api/indexnow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: [`${SITE_URL}/about`], // About page contains FAQs
        reason: "updated",
      }),
    })

    if (response.ok) {
      console.log("📡 IndexNow: Successfully notified search engines of FAQ update")
    } else {
      console.warn("⚠️ IndexNow: Failed to notify search engines of FAQ update")
    }
  } catch (error) {
    console.error("❌ IndexNow: Error notifying search engines:", error)
  }
}

export async function GET() {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: faqs, error } = await supabase.from("faqs").select("*").eq("is_active", true).order("order_index")

    if (error) {
      console.error("Error fetching FAQs:", error)
      return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedFaqs = faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
      tags: faq.tags || [],
    }))

    return NextResponse.json(transformedFaqs)
  } catch (error) {
    console.error("Error in FAQs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const body = await request.json()

    const { question, answer, category = "general" } = body

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 })
    }

    // Generate a unique ID for the FAQ
    const faqId = `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Get the next order index
    const { data: existingFaqs } = await supabase
      .from("faqs")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1)

    const nextOrderIndex = existingFaqs && existingFaqs.length > 0 ? (existingFaqs[0].order_index || 0) + 1 : 1

    const { data, error } = await supabase
      .from("faqs")
      .insert([
        {
          id: faqId,
          question,
          answer,
          category,
          is_active: true,
          order_index: nextOrderIndex,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error creating FAQ:", error)
      return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 })
    }

    await submitFAQUpdateToIndexNow()

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 })
  } catch (error) {
    console.error("Error in FAQ POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
