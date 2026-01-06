import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { ArticleStatus, ARTICLE_STATUS } from "@/lib/constants/articles"

export interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  email: string
  content: string
  category: string
  image?: string
  status: ArticleStatus
  createdAt: string
  updatedAt: string
}

const dbDir = path.join(process.cwd(), "data")
const dbFile = path.join(dbDir, "articles.json")
const imgDir = path.join(dbDir, "uploads")

// Ensure data directory exists
export async function initializeDatabase() {
  if (!existsSync(dbDir)) {
    await mkdir(dbDir, { recursive: true })
  }

  if (!existsSync(imgDir)) {
    await mkdir(imgDir, { recursive: true })
  }
  
  if (!existsSync(dbFile)) {
    await writeFile(dbFile, JSON.stringify([], null, 2))
  }
}

// Initialize on module load (synchronous wrapper for next.js)
if (!existsSync(dbFile)) {
  try {
    const dir = path.join(process.cwd(), "data")
    if (!existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true })
    }
    require("fs").writeFileSync(dbFile, JSON.stringify([], null, 2))
  } catch (e) {
    console.warn("Failed to initialize database file on module load:", e)
  }
}

function migrateArticle(article: any): Article {
  // Migrate old schema to new schema
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || article.content?.substring(0, 150) || "",
    author: article.author,
    email: article.email,
    content: article.content,
    category: article.category,
    status: article.status || ARTICLE_STATUS.PENDING,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  }
}

function loadArticles(): Article[] {
  try {
    let data = require("fs").readFileSync(dbFile, "utf-8")
    // Remove BOM if present
    if (data.charCodeAt(0) === 0xFEFF) {
      data = data.slice(1)
    }
    const parsed = JSON.parse(data)
    console.log("📖 Articles loaded from database:", parsed.length, "articles")
    return parsed.map(migrateArticle)
  } catch (error) {
    console.warn("⚠️ Error loading articles:", error)
    return []
  }
}

function saveArticles(articles: Article[]) {
  try {
    const fs = require("fs")
    // Write without BOM using utf8 encoding
    const jsonString = JSON.stringify(articles, null, 2)
    fs.writeFileSync(dbFile, jsonString, { encoding: "utf8" })
    console.log("💾 Articles saved to database:", articles.length, "articles")
  } catch (error) {
    console.error("❌ Error saving articles:", error)
    throw error
  }
}

export function addArticle(
  title: string,
  author: string,
  email: string,
  content: string,
  category: string,
  excerpt: string,
  image?: string
): Article {
  const articles = loadArticles()
  
  const newArticle: Article = {
    id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
    title,
    excerpt,
    author,
    email,
    content,
    category,
    ...(image && { image }),
    status: ARTICLE_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  articles.push(newArticle)
  saveArticles(articles)
  
  return newArticle
}

export function getArticles(statusFilter?: ArticleStatus): Article[] {
  const articles = loadArticles()
  const filtered = statusFilter ? articles.filter(a => a.status === statusFilter) : articles
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getArticleById(id: number): Article | undefined {
  const articles = loadArticles()
  return articles.find(a => a.id === id)
}

export function updateArticle(
  id: number,
  title: string,
  author: string,
  email: string,
  content: string,
  category: string,
  excerpt: string,
  image?: string
): Article | undefined {
  const articles = loadArticles()
  const index = articles.findIndex(a => a.id === id)
  
  if (index === -1) return undefined
  
  articles[index] = {
    ...articles[index],
    title,
    excerpt,
    author,
    email,
    content,
    category,
    ...(image && { image }),
    updatedAt: new Date().toISOString(),
  }
  
  saveArticles(articles)
  return articles[index]
}

export function updateArticleStatus(id: number, status: ArticleStatus): Article | undefined {
  const articles = loadArticles()
  const index = articles.findIndex(a => a.id === id)
  
  if (index === -1) return undefined
  
  articles[index] = {
    ...articles[index],
    status,
    updatedAt: new Date().toISOString(),
  }
  
  saveArticles(articles)
  return articles[index]
}

export function deleteArticle(id: number): boolean {
  const articles = loadArticles()
  const filteredArticles = articles.filter(a => a.id !== id)
  
  if (filteredArticles.length === articles.length) return false
  
  saveArticles(filteredArticles)
  return true
}

export function getImageDir() {
  return imgDir
}

export default { addArticle, getArticles, getArticleById, updateArticle, updateArticleStatus, deleteArticle }
