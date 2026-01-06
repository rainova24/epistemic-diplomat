"use client"

import { useState } from "react"

interface ArticleImageWithFallbackProps {
  src: string
  alt: string
}

export function ArticleImageWithFallback({ src, alt }: ArticleImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="w-full bg-muted/50 flex items-center justify-center py-12">
        <div className="text-center text-foreground/50">
          <p className="text-sm">Gambar tidak dapat dimuat</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-auto"
      onError={() => {
        console.error("Image failed to load:", src)
        setFailed(true)
      }}
    />
  )
}
