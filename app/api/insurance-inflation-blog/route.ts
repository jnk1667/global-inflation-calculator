import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch insurance inflation blog content from site_settings
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .in("setting_key", [
        "insurance_inflation_essay",
        "insurance_inflation_methodology",
      ])

    if (error) {
      return Response.json(
        { success: false, error: "Failed to fetch content" },
        { status: 500 }
      )
    }

    const contentMap: { [key: string]: string } = {}
    if (data) {
      data.forEach((item: any) => {
        contentMap[item.setting_key] = item.setting_value || ""
      })
    }

    return Response.json({
      success: true,
      data: {
        essay: contentMap["insurance_inflation_essay"] || "",
        methodology: contentMap["insurance_inflation_methodology"] || "",
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
