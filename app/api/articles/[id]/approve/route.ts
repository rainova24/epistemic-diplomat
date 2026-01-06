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

    const url = new URL(request.url)
    const action = url.pathname.split("/").pop()

    let newStatus: string
    if (action === "approve") {
      newStatus = ARTICLE_STATUS.APPROVED
    } else if (action === "reject") {
      newStatus = ARTICLE_STATUS.REJECTED
    } else {
      return NextResponse.json(
        { message: "Action tidak valid" },
        { status: 400 }
      )
    }

    const updated = updateArticleStatus(articleId, newStatus as any)

    if (!updated) {
      return NextResponse.json(
        { message: "Artikel tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Artikel berhasil ${action === "approve" ? "disetujui" : "ditolak"}`, article: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating article status:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui status artikel" },
      { status: 500 }
    )
  }
}
