import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminAuth } from "@/lib/admin-auth"

const getServerClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET - public, used by the about page
export async function GET() {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase.from("about_content").select("*").order("section")
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching about_content:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch content" }, { status: 500 })
  }
}

// PUT - admin only, upserts a single about_content row
export async function PUT(request: Request) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, section, title, content, social_links } = body

    if (!id || !section) {
      return NextResponse.json({ success: false, error: "id and section are required" }, { status: 400 })
    }

    const supabase = getServerClient()
    const { data, error } = await supabase
      .from("about_content")
      .upsert({
        id,
        section,
        title,
        content,
        social_links: Array.isArray(social_links) ? social_links : [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error saving about_content:", error)
    return NextResponse.json({ success: false, error: "Failed to save content" }, { status: 500 })
  }
}
