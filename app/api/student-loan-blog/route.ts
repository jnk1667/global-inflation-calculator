import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase credentials are not configured")
  }

  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("student_loan_blog").select("*").eq("id", "main").single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching student loan blog:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch blog content" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { title, content, methodology } = body

    const { data, error } = await supabase
      .from("student_loan_blog")
      .upsert({
        id: "main",
        title,
        content,
        methodology,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error updating student loan blog:", error)
    return NextResponse.json({ success: false, error: "Failed to update blog content" }, { status: 500 })
  }
}
