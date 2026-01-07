import { NextRequest, NextResponse } from "next/server"
import { updateArticleStatus } from "@/lib/db/articles"
import { ARTICLE_STATUS } from "@/lib/constants/articles"
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

    const updated = await updateArticleStatus(articleId, ARTICLE_STATUS.REJECTED)

    if (!updated) {
      return NextResponse.json(
        { message: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Artikel berhasil ditolak", article: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating article status:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menolak artikel" },
      { status: 500 }
    )
  }
}
