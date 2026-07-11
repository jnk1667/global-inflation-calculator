/**
 * Server-side admin authentication helper.
 *
 * Uses ADMIN_SECRET — a server-only env var (no NEXT_PUBLIC_ prefix).
 * This value is NEVER sent to the browser. API routes call requireAdminAuth()
 * before performing any write operation.
 *
 * The AdminContentPage sends this secret as a Bearer token via the
 * NEXT_PUBLIC_ADMIN_SECRET env var, which is a separate, lower-privilege
 * token only used for client→API communication (not direct DB access).
 */

import { NextResponse } from "next/server"

/**
 * Validates the Authorization header on incoming API requests.
 * Returns null if auth passes, or a 401 NextResponse if it fails.
 *
 * Usage in any write API route:
 *   const authError = requireAdminAuth(request)
 *   if (authError) return authError
 */
export function requireAdminAuth(request: Request): NextResponse | null {
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    console.error("[admin-auth] ADMIN_SECRET environment variable is not set")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.slice(7) // strip "Bearer "
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null // auth passed
}
