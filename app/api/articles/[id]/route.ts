import { NextRequest, NextResponse } from "next/server"
import { deleteArticle, updateArticle } from "@/lib/db/articles"
import { isAdminAuthenticated } from "@/lib/auth/admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  // Verify admin authentication
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }
  
  try {
    const { id } = await params
    const articleId = parseInt(id)

    if (isNaN(articleId)) {
      return NextResponse.json(
        { message: "ID artikel tidak valid" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, author, email, content, category, excerpt, image } = body

    if (!title || !author || !email || !content || !category || !excerpt) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    const updated = updateArticle(articleId, title, author, email, content, category, excerpt, image)

    if (!updated) {
      return NextResponse.json(
        { message: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }

    console.log("✏️ Article updated:", { id: updated.id, title: updated.title })

    return NextResponse.json(
      { message: "Artikel berhasil diperbarui", article: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui artikel" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  // Verify admin authentication
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const articleId = parseInt(id)

    if (isNaN(articleId)) {
      return NextResponse.json(
        { message: "ID artikel tidak valid" },
        { status: 400 }
      )
    }

    const deleted = deleteArticle(articleId)

    if (!deleted) {
      return NextResponse.json(
        { message: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Artikel berhasil dihapus" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus artikel" },
      { status: 500 }
    )
  }
}
