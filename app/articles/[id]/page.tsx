import { getArticleById } from "@/lib/db/articles"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { ARTICLE_CATEGORIES } from "@/lib/constants/articles"
import { ArticleImageWithFallback } from "@/components/article-image-with-fallback"

interface ArticlePageProps {
  params: {
    id: string
  }
}

interface ImageInContent {
  id: string
  path: string
  alt: string
  width?: number
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const articleId = parseInt(params.id)
  if (isNaN(articleId)) {
    notFound();
  }
  
  const article = await getArticleById(articleId)

  if (!article) {
    notFound()
  }

  const getCategoryLabel = (id: string) => {
    return ARTICLE_CATEGORIES.find(c => c.id === id)?.label || id
  }

  // Parse content if it's in the new format
  let contentText = article.content
  let images: ImageInContent[] = []
  
  try {
    const parsed = JSON.parse(article.content)
    if (parsed.text && parsed.images) {
      contentText = parsed.text
      images = parsed.images
    }
  } catch {
    // Content is in old format (plain text)
    contentText = article.content
  }

  // Function to render content with inline images
  const renderContent = (text: string) => {
    const parts = text.split(/(\[IMAGE:[^\]]+\])/)
    
    return parts.map((part, idx) => {
      // Check if this is an image placeholder
      const imageMatch = part.match(/\[IMAGE:([^\]]+)\]/)
      if (imageMatch) {
        const imageId = imageMatch[1]
        const image = images.find(img => img.id === imageId)
        
        if (image) {
          const widthStyle = image.width ? `${image.width}%` : "100%"
          return (
            <div key={idx} className="my-6 rounded-lg overflow-hidden bg-muted border border-border/40" style={{ maxWidth: widthStyle, margin: "1.5rem auto" }}>
              <ArticleImageWithFallback
                src={image.path}
                alt={image.alt}
              />
            </div>
          )
        }
      }
      
      // Regular text paragraph
      return part.trim() ? (
        <p key={idx} className="whitespace-pre-wrap">
          {part}
        </p>
      ) : null
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>

        {/* Article Header */}
        <article className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">{article.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
              <div>
                <span className="font-semibold text-foreground">Oleh:</span> {article.author}
              </div>
              <div>
                <span className="font-semibold text-foreground">Email:</span> {article.email}
              </div>
              <Badge variant="secondary">{getCategoryLabel(article.category)}</Badge>
              <div>
                {new Date(article.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Content with inline images */}
          <div className="prose prose-invert max-w-none">
            <div className="rounded-lg border border-border/40 bg-muted/30 p-6 text-foreground/90 leading-relaxed space-y-4">
              {renderContent(contentText)}
            </div>
          </div>

          {/* Meta Info */}
          <div className="border-t border-border/40 pt-6 text-xs text-foreground/60">
            <div className="space-y-1">
              <p>Dibuat: {new Date(article.createdAt).toLocaleString("id-ID")}</p>
              <p>Diperbarui: {new Date(article.updatedAt).toLocaleString("id-ID")}</p>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}

