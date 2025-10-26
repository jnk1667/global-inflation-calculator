import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - Fetch all seo_content entries
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.from("seo_content").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching seo_content:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch content" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in seo_content GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new seo_content entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, meta_description, keywords } = body

    if (!id || !title || !content) {
      return NextResponse.json({ success: false, error: "ID, title, and content are required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from("seo_content")
      .insert([
        {
          id,
          title,
          content,
          meta_description: meta_description || null,
          keywords: keywords || null,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating seo_content:", error)
      return NextResponse.json({ success: false, error: "Failed to create content" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in seo_content POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
