import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"



export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "cost-of-living", "cities-complete.json")
    const fileContents = fs.readFileSync(filePath, "utf8")
    const citiesData = JSON.parse(fileContents)

    return NextResponse.json(citiesData, {
      headers: {
        // Cache at the edge for 24 hours, allow stale for up to 7 days while revalidating.
        // The file never changes between deployments so this is safe.
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Error loading cities data:", error)
    return NextResponse.json({ error: "Failed to load cities data" }, { status: 500 })
  }
}
