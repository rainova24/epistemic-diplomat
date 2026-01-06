import { NextResponse } from "next/server"
import { getArticles } from "@/lib/db/articles"

export async function GET() {
  try {
    const articles = getArticles()
    return NextResponse.json(articles, { status: 200 })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data artikel" },
      { status: 500 }
    )
  }
}
