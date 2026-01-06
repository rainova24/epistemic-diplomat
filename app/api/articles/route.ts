import { NextResponse } from "next/server"
import { getArticles } from "@/lib/db/articles"
import { ARTICLE_STATUS } from "@/lib/constants/articles"

export async function GET() {
  try {
    const articles = getArticles(ARTICLE_STATUS.APPROVED)
    return NextResponse.json(articles, { status: 200 })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data tulisan" },
      { status: 500 }
    )
  }
}
