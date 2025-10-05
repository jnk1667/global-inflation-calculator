import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    // Read the llms.txt file from the public directory
    const filePath = join(process.cwd(), "public", "llms.txt")
    const content = await readFile(filePath, "utf-8")

    // Return with explicit headers to ensure proper serving
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Error serving llms.txt:", error)
    return new NextResponse("llms.txt not found", { status: 404 })
  }
}
