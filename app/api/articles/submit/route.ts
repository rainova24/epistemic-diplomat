import { NextRequest, NextResponse } from "next/server"
import { addArticle } from "@/lib/db/articles"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, author, email, content, category, excerpt, image } = body

    console.log("📝 Article submission received:", { title, author, email, category })
    console.log("📸 Image path:", image)

    // Validation
    if (!title || !author || !email || !content || !category || !excerpt) {
      console.warn("❌ Validation failed: Missing required fields")
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.warn("❌ Validation failed: Invalid email")
      return NextResponse.json(
        { message: "Email tidak valid" },
        { status: 400 }
      )
    }

    // Add article to database
    const article = await addArticle(title, author, email, content, category, excerpt, image)
    
    console.log("✅ Article saved successfully:", { id: article.id, title })

    return NextResponse.json(
      {
        message: "Tulisan Anda telah dikirim dan menunggu persetujuan dari admin",
        article,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error submitting article:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan tulisan" },
      { status: 500 }
    )
  }
}

