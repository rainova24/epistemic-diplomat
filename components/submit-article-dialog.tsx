"use client"

import { useState } from "react"
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

interface SubmitArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ImageInContent {
  id: string
  path: string
  alt: string
  width?: number // width percentage (default 100)
}

const IMAGE_SIZES = [
  { label: "Full Width (100%)", value: 100 },
  { label: "Large (80%)", value: 80 },
  { label: "Medium (60%)", value: 60 },
  { label: "Small (40%)", value: 40 },
]

export function SubmitArticleDialog({ open, onOpenChange }: SubmitArticleDialogProps) {
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

      // Add image to content with unique ID
      const imageId = `img-${Date.now()}`
      const newImage: ImageInContent = {
        id: imageId,
        path: data.path,
        alt: file.name,
      }
      
      setImagesInContent((prev) => [...prev, newImage])
      
      // Add image reference to content
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

    setIsLoading(true)
    try {
      // Get first image as featured image (or undefined)
      const featuredImage = imagesInContent.length > 0 ? imagesInContent[0].path : undefined
      
      // Serialize images in content
      const contentWithImages = JSON.stringify({
        text: formData.content,
        images: imagesInContent,
      })
      
      // Clean excerpt from image placeholders
      const cleanExcerpt = formData.content
        .replace(/\[IMAGE:[^\]]+\]/g, "")
        .trim()
        .substring(0, 150)
        .trim() + "..."
      
      const response = await fetch("/api/articles/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(data.message || "Gagal mengirim tulisan")
      }

      // Save email to localStorage for deletion feature
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", formData.email)
      }

      toast({
        title: "Sukses! ✅",
        description: data.message || "Tulisan Anda berhasil dikirim dan menunggu persetujuan admin!",
      })

      setFormData({ title: "", author: "", email: "", category: "", content: "" })
      setImagesInContent([])
      
      // Close dialog setelah 2 detik agar user bisa melihat success message
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error("❌ Submit error:", error)
      toast({
        title: "Pengiriman Gagal ❌",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim tulisan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kirim Tulisan</DialogTitle>
          <DialogDescription>
            Kirim tulisan Anda seperti mengirim email. Format mirip dengan email profesional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Email-like header section */}
          <div className="border border-border/40 rounded-lg p-4 bg-muted/30 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase text-foreground/70">Subjek</Label>
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
                <Label htmlFor="author" className="text-xs font-semibold uppercase text-foreground/70">Dari (Nama)</Label>
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
                <Label htmlFor="email" className="text-xs font-semibold uppercase text-foreground/70">Email</Label>
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
              <Label htmlFor="category" className="text-xs font-semibold uppercase text-foreground/70">Kategori</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} disabled={isLoading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.filter(cat => cat.id !== "semua").map((cat) => (
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
              <Label htmlFor="content" className="text-sm font-semibold">Isi Tulisan</Label>
              <label
                htmlFor="imageInsert"
                className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1"
              >
                <ImageIcon className="h-3 w-3" />
                Sisipkan Gambar
              </label>
              <input
                id="imageInsert"
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
                placeholder="Tulis isi tulisan Anda di sini. Gunakan tombol 'Sisipkan Gambar' untuk menambahkan gambar di tengah-tengah tulisan..."
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
                          <img
                            src={img.path}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Image preview failed:", img.path)
                            }}
                          />
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isUploadingImage}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingImage}>
              {isLoading ? "Mengirim..." : isUploadingImage ? "Mengupload gambar..." : "Kirim Tulisan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

