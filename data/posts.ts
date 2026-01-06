export interface Post {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  category: string
  categoryId: string
  slug: string
}

export const posts: Post[] = []

export const categories = ["Semua", "Filsafat Sains", "Teologi", "Bioetika", "Logika"]
