import { NextRequest, NextResponse } from "next/server"
import { ADMIN_PASSWORD } from "@/lib/auth/admin"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: "Password diperlukan" },
        { status: 400 }
      )
    }

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Password tidak valid" },
        { status: 401 }
      )
    }

    // Create token (simple base64 encoded password)
    const token = Buffer.from(`admin:${password}`).toString("base64")

    return NextResponse.json({
      success: true,
      token,
      message: "Login berhasil",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
