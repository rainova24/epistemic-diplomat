"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ARTICLE_CATEGORIES } from "@/lib/constants/articles"
import { X, Image as ImageIcon } from "lucide-react"

interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  email: string
  content: string
  category: string
  image?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface ImageInContent {
  id: string
  path: string
  alt: string
  width?: number
}

const IMAGE_SIZES = [
  { label: "Full Width (100%)", value: 100 },
  { label: "Large (80%)", value: 80 },
  { label: "Medium (60%)", value: 60 },
  { label: "Small (40%)", value: 40 },
]

interface EditArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: Article | null
  onSuccess: () => void
}

export function EditArticleDialog({ open, onOpenChange, article, onSuccess }: EditArticleDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagesInContent, setImagesInContent] = useState<ImageInContent[]>([])
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    email: "",
    category: "",
    content: "",
  })

  // Initialize form when dialog opens and article changes
  React.useEffect(() => {
    if (open && article) {
      // Reset form first
      setFormData({
        title: article.title,
        author: article.author,
        email: article.email,
        category: article.category,
        content: "",
      })
      setImagesInContent([])

      // Parse content if it's in the new format
      try {
        const parsed = JSON.parse(article.content)
        if (parsed.text && Array.isArray(parsed.images)) {
          setFormData((prev) => ({ ...prev, content: parsed.text }))
          setImagesInContent(parsed.images)
        } else {
          // Content is in old format
          setFormData((prev) => ({ ...prev, content: article.content }))
        }
      } catch {
        // Content is in old format (plain text)
        setFormData((prev) => ({ ...prev, content: article.content }))
      }
    }
  }, [open, article])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar (max 5MB)",
          variant: "destructive",
        })
        return
      }

      uploadImageInline(file)
    }
  }

  const uploadImageInline = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formDataForUpload = new FormData()
      formDataForUpload.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataForUpload,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal upload gambar")
      }

      const imageId = `img-${Date.now()}`
      const newImage: ImageInContent = {
        id: imageId,
        path: data.path,
        alt: file.name,
        width: 100,
      }

      setImagesInContent((prev) => [...prev, newImage])
      setFormData((prev) => ({
        ...prev,
        content: prev.content + `\n[IMAGE:${imageId}]\n`,
      }))

      toast({
        title: "Sukses",
        description: "Gambar berhasil diupload dan dimasukkan ke tulisan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal upload gambar",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImageFromContent = (imageId: string) => {
    setImagesInContent((prev) => prev.filter((img) => img.id !== imageId))
    setFormData((prev) => ({
      ...prev,
      content: prev.content.replace(`[IMAGE:${imageId}]\n`, "").replace(`\n[IMAGE:${imageId}]`, ""),
    }))
  }

  const updateImageWidth = (imageId: string, width: number) => {
    setImagesInContent((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, width } : img))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.author || !formData.email || !formData.content || !formData.category) {
      toast({
        title: "Validasi Gagal ❌",
        description: "Semua field (Subjek, Nama, Email, Kategori, dan Isi) wajib diisi",
        variant: "destructive",
      })
      return
    }

    if (!article) return

    setIsLoading(true)
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin-token="))
        ?.split("=")[1]

      const featuredImage = imagesInContent.length > 0 ? imagesInContent[0].path : article.image
      const contentWithImages = JSON.stringify({
        text: formData.content,
        images: imagesInContent,
      })

      const cleanExcerpt = formData.content
        .replace(/\[IMAGE:[^\]]+\]/g, "")
        .trim()
        .substring(0, 150)
        .trim() + "..."

      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          email: formData.email,
          category: formData.category,
          content: contentWithImages,
          excerpt: cleanExcerpt,
          image: featuredImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan perubahan")
      }

      toast({
        title: "Sukses! ✅",
        description: "Artikel berhasil diperbarui",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("❌ Edit error:", error)
      toast({
        title: "Penyimpanan Gagal ❌",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan perubahan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!article) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sunting Artikel</DialogTitle>
          <DialogDescription>
            Edit konten artikel yang dikirimkan oleh user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Email-like header section */}
          <div className="border border-border/40 rounded-lg p-4 bg-muted/30 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase text-foreground/70">
                Subjek
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Tulis subjek tulisan Anda di sini..."
                value={formData.title}
                onChange={handleChange}
                disabled={isLoading}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="author" className="text-xs font-semibold uppercase text-foreground/70">
                  Dari (Nama)
                </Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Nama Anda"
                  value={formData.author}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase text-foreground/70">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-semibold uppercase text-foreground/70">
                Kategori
              </Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} disabled={isLoading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.filter((cat) => cat.id !== "semua").map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content section with inline image support */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-sm font-semibold">
                Isi Tulisan
              </Label>
              <label
                htmlFor="imageInsertEdit"
                className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1"
              >
                <ImageIcon className="h-3 w-3" />
                Sisipkan Gambar
              </label>
              <input
                id="imageInsertEdit"
                type="file"
                accept="image/*"
                onChange={handleImageInsert}
                disabled={isLoading || isUploadingImage}
                className="hidden"
              />
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20 space-y-3">
              <Textarea
                id="content"
                name="content"
                placeholder="Edit isi tulisan..."
                value={formData.content}
                onChange={handleChange}
                disabled={isLoading || isUploadingImage}
                rows={14}
                className="resize-none bg-background"
              />

              {/* Show images that will be inserted */}
              {imagesInContent.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                  <div className="text-xs font-semibold text-foreground/70 uppercase">Gambar dalam Tulisan ({imagesInContent.length})</div>
                  <div className="space-y-4">
                    {imagesInContent.map((img) => (
                      <div key={img.id} className="border border-border/40 rounded-lg p-3 bg-muted/20 space-y-2">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted border border-border/40">
                          <img src={img.path} alt={img.alt} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImageFromContent(img.id)}
                            disabled={isUploadingImage}
                            className="absolute top-2 right-2 p-1 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase text-foreground/70">Ukuran Gambar</Label>
                          <Select
                            value={(img.width || 100).toString()}
                            onValueChange={(value) => updateImageWidth(img.id, parseInt(value))}
                            disabled={isUploadingImage}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {IMAGE_SIZES.map((size) => (
                                <SelectItem key={size.value} value={size.value.toString()}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isUploadingImage}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingImage}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
