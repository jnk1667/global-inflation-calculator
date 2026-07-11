import { createClient } from "@supabase/supabase-js"

const getServerClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const supabase = getServerClient()
    // Fetch insurance inflation blog content from seo_content table
    const { data, error } = await supabase
      .from("seo_content")
      .select("content")
      .eq("id", "insurance_inflation_essay")
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return Response.json(
        { success: false, error: "Failed to fetch content" },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      data: {
        essay: data?.content || "",
        methodology: "", // Methodology is hardcoded on the page
      },
    }, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching insurance blog content:", error)
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
