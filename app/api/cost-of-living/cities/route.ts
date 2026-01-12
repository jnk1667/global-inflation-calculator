import { NextResponse } from "next/server"
import citiesData from "@/public/data/cost-of-living/cities-complete.json"

export const dynamic = "force-static"
export const revalidate = 86400 // Revalidate every 24 hours

export async function GET() {
  try {
    return NextResponse.json(citiesData)
  } catch (error) {
    console.error("[v0] Error loading cities data:", error)
    return NextResponse.json({ error: "Failed to load cities data" }, { status: 500 })
  }
}
