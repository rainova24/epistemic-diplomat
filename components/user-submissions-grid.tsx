"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ARTICLE_CATEGORIES } from "@/lib/constants/articles"

interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  email: string
  content: string
  category: string
  image?: string
  createdAt: string
}

const TRUNCATE_LENGTH = 150

export function UserSubmissionsGrid() {
  const { toast } = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/articles")
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryLabel = (id: string) => {
    return ARTICLE_CATEGORIES.find(c => c.id === id)?.label || id
  }

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.substring(0, length) + "..."
  }

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-foreground">Artikel Terpublikasi</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-foreground">Artikel Terpublikasi</h2>

          {articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 py-12 text-center">
              <p className="text-foreground/60">Belum ada artikel yang dipublikasikan. Jadilah yang pertama!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card key={article.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {article.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <img 
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", article.image)
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="space-y-2">
                      <div>Oleh: <span className="font-semibold text-foreground">{article.author}</span></div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{getCategoryLabel(article.category)}</Badge>
                        <span className="text-xs text-foreground/60">
                          {new Date(article.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-foreground/70">
                      {truncateText(article.excerpt, TRUNCATE_LENGTH)}
                    </p>
                  </CardContent>
                  <div className="border-t border-border px-6 py-3">
                    <Link href={`/articles/${article.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Baca Selengkapnya
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
