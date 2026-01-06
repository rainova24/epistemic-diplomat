"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, User, ChevronLeft, ChevronRight } from "lucide-react"
import { posts, categories } from "@/data/posts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ARTICLE_CATEGORIES } from "@/lib/constants/articles"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ApprovedArticle {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  category: string
  categoryId: string
  image?: string
}

export function ArticleGrid() {
  const [selectedCategory, setSelectedCategory] = useState("semua")
  const [allArticles, setAllArticles] = useState<ApprovedArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6

  useEffect(() => {
    fetchApprovedArticles()
  }, [])

  const fetchApprovedArticles = async () => {
    try {
      const response = await fetch("/api/articles")
      if (response.ok) {
        const articles = await response.json()
        // Transform database articles to match the format
        const transformed = articles.map((article: any) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          author: article.author,
          image: article.image,
          categoryId: article.category,
          date: new Date(article.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          category: ARTICLE_CATEGORIES.find(c => c.id === article.category)?.label || article.category,
        }))
        setAllArticles(transformed)
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Combine static posts with approved articles
  const combinedArticles = [...posts, ...allArticles]

  const filteredPosts =
    selectedCategory === "semua" ? combinedArticles : combinedArticles.filter((post) => post.categoryId === selectedCategory)

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + articlesPerPage)

  // Reset to page 1 when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  return (
    <section id="esai" className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Koleksi <span className="text-primary">Esai</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Temukan artikel mendalam dari berbagai perspektif interdisipliner
          </p>
        </motion.div>

        {/* Category Filter - Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <div className="w-full max-w-xs">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Article Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/50 py-12 text-center">
              <p className="text-foreground/60">Tidak ada artikel untuk kategori ini</p>
            </div>
          ) : (
            paginatedPosts.map((post, index) => (
              <motion.div
                key={`${post.category}-${post.title}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group flex flex-col h-full overflow-hidden border border-border/40 bg-card transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                  {post.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          console.error("Image failed to load:", post.image)
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Category Tag */}
                    <div className="mb-4">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 font-serif text-xl font-bold leading-tight text-balance text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground flex-1">{post.excerpt}</p>

                    {/* Meta Information */}
                    <div className="flex flex-col gap-2 border-t border-border/40 pt-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">Ditulis oleh {post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{post.date}</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <Link href={`/articles/${post.id}`}>
                      <Button variant="default" className="w-full">
                        Baca Selengkapnya
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredPosts.length > articlesPerPage && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="min-w-10"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
