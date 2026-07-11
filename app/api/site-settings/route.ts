import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminAuth } from "@/lib/admin-auth"

const getServerClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET - public, used by the site header/footer
export async function GET() {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", "main").single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching site_settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT - admin only, upserts site settings
export async function PUT(request: Request) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { site_title, site_description, footer_text, logo_url } = body

    const supabase = getServerClient()
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({
        id: "main",
        site_name: site_title,
        site_description,
        logo_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error saving site_settings:", error)
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 })
  }
}
