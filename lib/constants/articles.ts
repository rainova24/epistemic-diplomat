// Kategori yang tersedia - sinkron dengan Koleksi Esai
export const ARTICLE_CATEGORIES = [
  { id: "filsafat-sains", label: "Filsafat Sains" },
  { id: "teologi", label: "Teologi" },
  { id: "bioetika", label: "Bioetika" },
  { id: "logika", label: "Logika" },
  { id: "epistemologi", label: "Epistemologi" },
  { id: "metafisika", label: "Metafisika" },
  { id: "filosofi-agama", label: "Filosofi Agama" },
  { id: "pendidikan", label: "Pendidikan" },
  { id: "semua", label: "Semua" },
]

export const ARTICLE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS]
