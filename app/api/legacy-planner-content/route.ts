import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminAuth } from "@/lib/admin-auth"

const getServerClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET - public
export async function GET() {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase
      .from("legacy_planner_content")
      .select("*")
      .eq("id", "main")
      .single()
    if (error && error.code !== "PGRST116") throw error
    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    console.error("Error fetching legacy_planner_content:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch content" }, { status: 500 })
  }
}

// PUT - admin only
export async function PUT(request: Request) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { title, content } = body

    const supabase = getServerClient()
    const { data, error } = await supabase
      .from("legacy_planner_content")
      .upsert({
        id: "main",
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error saving legacy_planner_content:", error)
    return NextResponse.json({ success: false, error: "Failed to save content" }, { status: 500 })
  }
}
