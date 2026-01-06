import { NextRequest, NextResponse } from "next/server"

// Simple admin password - GANTI DENGAN PASSWORD YANG KUAT
// TODO: Upgrade ke NextAuth or proper auth system before production
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_PASSWORD) {
  throw new Error("FATAL: The ADMIN_PASSWORD environment variable is not set. The application cannot start without it.")
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const adminToken = request.headers.get("x-admin-token")
  
  if (!adminToken) {
    return false
  }

  // Verify token (simple base64 check)
  try {
    const decoded = Buffer.from(adminToken, "base64").toString("utf-8")
    const [, password] = decoded.split(":")
    return password === ADMIN_PASSWORD
  } catch {
    return false
  }
}

export function requireAdminAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        { message: "Unauthorized - Admin authentication required" },
        { status: 401 }
      )
    }

    return handler(request, context)
  }
}
