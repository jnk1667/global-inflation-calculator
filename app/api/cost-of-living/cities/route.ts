import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"



export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "cost-of-living", "cities-complete.json")
    const fileContents = fs.readFileSync(filePath, "utf8")
    const citiesData = JSON.parse(fileContents)

    console.log("[v0] Successfully loaded cities data:", citiesData.totalCities, "cities")
    return NextResponse.json(citiesData)
  } catch (error) {
    console.error("[v0] Error loading cities data:", error)
    return NextResponse.json({ error: "Failed to load cities data" }, { status: 500 })
  }
}
