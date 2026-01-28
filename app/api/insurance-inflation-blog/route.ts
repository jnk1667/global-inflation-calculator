import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch insurance inflation blog content from site_content table
    const { data, error } = await supabase
      .from("site_content")
      .select("insurance_inflation_essay, insurance_inflation_methodology")
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
        essay: data?.insurance_inflation_essay || "",
        methodology: data?.insurance_inflation_methodology || "",
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
