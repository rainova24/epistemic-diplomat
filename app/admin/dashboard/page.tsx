"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ARTICLE_CATEGORIES, ARTICLE_STATUS } from "@/lib/constants/articles"
import { Check, X, Eye, Trash2, Edit, LogOut } from "lucide-react"
import Link from "next/link"
import { EditArticleDialog } from "@/components/edit-article-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(ARTICLE_STATUS.PENDING)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/articles/all")
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error)
      toast({
        title: "Error",
        description: "Gagal mengambil data artikel",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is authenticated
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin-token="))
      ?.split("=")[1]

    if (!token) {
      router.push("/admin/login")
      return
    }

    setIsAuthorized(true)
    fetchArticles()
  }, [])

  const handleLogout = () => {
    // Clear admin token
    document.cookie = "admin-token=; path=/; max-age=0"
    toast({
      title: "Logout Berhasil",
      description: "Anda telah logout dari admin dashboard",
    })
    router.push("/admin/login")
  }

  if (!isAuthorized) {
    return null
  }

  const handleApprove = async (id: number) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin-token="))
        ?.split("=")[1]

      const response = await fetch(`/api/articles/${id}/approve`, {
        method: "PATCH",
        headers: {
          "x-admin-token": token || "",
        },
      })

      if (response.ok) {
        setArticles(articles.map(a => 
          a.id === id ? { ...a, status: ARTICLE_STATUS.APPROVED } : a
        ))
        toast({
          title: "Sukses",
          description: "Artikel berhasil disetujui",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyetujui artikel",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: number) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin-token="))
        ?.split("=")[1]

      const response = await fetch(`/api/articles/${id}/reject`, {
        method: "PATCH",
        headers: {
          "x-admin-token": token || "",
        },
      })

      if (response.ok) {
        setArticles(articles.map(a => 
          a.id === id ? { ...a, status: ARTICLE_STATUS.REJECTED } : a
        ))
        toast({
          title: "Sukses",
          description: "Artikel ditolak",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menolak artikel",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin-token="))
        ?.split("=")[1]

      const response = await fetch(`/api/articles/${deleteId}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token || "",
        },
      })

      if (response.ok) {
        setArticles(articles.filter(a => a.id !== deleteId))
        toast({
          title: "Sukses ✅",
          description: "Artikel berhasil dihapus",
        })
      } else {
        throw new Error("Gagal menghapus artikel")
      }
    } catch (error) {
      toast({
        title: "Error ❌",
        description: error instanceof Error ? error.message : "Gagal menghapus artikel",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getCategoryLabel = (id: string) => {
    return ARTICLE_CATEGORIES.find(c => c.id === id)?.label || id
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ARTICLE_STATUS.PENDING:
        return <Badge variant="outline">Menunggu</Badge>
      case ARTICLE_STATUS.APPROVED:
        return <Badge variant="default" className="bg-green-600">Disetujui</Badge>
      case ARTICLE_STATUS.REJECTED:
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredArticles = {
    pending: articles.filter(a => a.status === ARTICLE_STATUS.PENDING),
    approved: articles.filter(a => a.status === ARTICLE_STATUS.APPROVED),
    rejected: articles.filter(a => a.status === ARTICLE_STATUS.REJECTED),
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 rounded-lg bg-muted" />
            <div className="h-96 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-foreground/60">Kelola artikel yang dikirim pengguna</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value={ARTICLE_STATUS.PENDING}>
              Menunggu ({filteredArticles.pending.length})
            </TabsTrigger>
            <TabsTrigger value={ARTICLE_STATUS.APPROVED}>
              Disetujui ({filteredArticles.approved.length})
            </TabsTrigger>
            <TabsTrigger value={ARTICLE_STATUS.REJECTED}>
              Ditolak ({filteredArticles.rejected.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Articles */}
          <TabsContent value={ARTICLE_STATUS.PENDING} className="space-y-4">
            {filteredArticles.pending.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-foreground/60">Tidak ada artikel yang menunggu persetujuan</p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.pending.map((article) => (
                <Card key={article.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>
                          Oleh {article.author} ({article.email})
                        </CardDescription>
                      </div>
                      {getStatusBadge(article.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {article.image && (
                      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
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
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{getCategoryLabel(article.category)}</Badge>
                      <span className="text-xs text-foreground/60">
                        {new Date(article.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm text-foreground/70">{article.excerpt || article.content.substring(0, 150)}</p>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/articles/${article.id}?preview=true`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingArticle(article)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Sunting
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(article.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(article.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Approved Articles */}
          <TabsContent value={ARTICLE_STATUS.APPROVED} className="space-y-4">
            {filteredArticles.approved.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-foreground/60">Tidak ada artikel yang disetujui</p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.approved.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>
                          Oleh {article.author}
                        </CardDescription>
                      </div>
                      {getStatusBadge(article.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {article.image && (
                      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
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
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{getCategoryLabel(article.category)}</Badge>
                      <span className="text-xs text-foreground/60">
                        {new Date(article.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-foreground/70">{article.excerpt || article.content.substring(0, 150)}</p>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/articles/${article.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingArticle(article)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Sunting
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(article.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rejected Articles */}
          <TabsContent value={ARTICLE_STATUS.REJECTED} className="space-y-4">
            {filteredArticles.rejected.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-foreground/60">Tidak ada artikel yang ditolak</p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.rejected.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>
                          Oleh {article.author}
                        </CardDescription>
                      </div>
                      {getStatusBadge(article.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {article.image && (
                      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
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
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{getCategoryLabel(article.category)}</Badge>
                      <span className="text-xs text-foreground/60">
                        {new Date(article.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-foreground/70">{article.excerpt || article.content.substring(0, 150)}</p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingArticle(article)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Sunting
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(article.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Setujui Ulang
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(article.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Article Dialog */}
      <EditArticleDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        article={editingArticle}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          fetchArticles()
        }}
      />
    </div>
  )
}
