import { kv } from "@vercel/kv";
import { ArticleStatus, ARTICLE_STATUS } from "@/lib/constants/articles";

// Define the structure of an Article
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  email: string;
  content: string;
  category: string;
  image?: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

// Helper to create a key for an article
const articleKey = (id: number) => `article:${id}`;

// --- Core KV Functions ---

export async function addArticle(
  title: string,
  author: string,
  email: string,
  content: string,
  category: string,
  excerpt: string,
  image?: string
): Promise<Article> {
  // Generate a new unique ID
  const newId = await kv.incr("next_article_id");

  const now = new Date().toISOString();

  const newArticle: Article = {
    id: newId,
    title,
    excerpt,
    author,
    email,
    content,
    category,
    ...(image && { image }),
    status: ARTICLE_STATUS.PENDING,
    createdAt: now,
    updatedAt: now,
  };

  // Use a pipeline to perform multiple operations atomically
  const pipe = kv.pipeline();
  // Store the full article object as a Hash
  pipe.hset(articleKey(newId), newArticle);
  // Add the article to a sorted set for chronological retrieval
  pipe.zadd("articles_by_date", { score: new Date(now).getTime(), member: articleKey(newId) });
  
  await pipe.exec();

  console.log(`📝 Article added with ID: ${newId}`);
  return newArticle;
}

export async function getArticles(statusFilter?: ArticleStatus): Promise<Article[]> {
  // Get all article keys, sorted from newest to oldest
  const articleKeys = await kv.zrange("articles_by_date", 0, -1, { rev: true });

  if (articleKeys.length === 0) {
    return [];
  }

  // Fetch all articles in a single pipeline for efficiency
  const pipe = kv.pipeline();
  articleKeys.forEach(key => pipe.hgetall(key as string));
  const results = await pipe.exec() as (Article | null)[];

  const articles = results.filter((article): article is Article => article !== null);

  // Filter by status if a filter is provided
  const filtered = statusFilter ? articles.filter(a => a.status === statusFilter) : articles;

  console.log(`📖 Loaded ${filtered.length} articles.`);
  return filtered;
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const article = await kv.hgetall<Article>(articleKey(id));
  if (!article || Object.keys(article).length === 0) {
    return undefined;
  }
  return article;
}

export async function updateArticle(
  id: number,
  title: string,
  author: string,
  email: string,
  content: string,
  category: string,
  excerpt: string,
  image?: string
): Promise<Article | undefined> {
  const key = articleKey(id);
  const article = await kv.hgetall<Article>(key);

  if (!article) return undefined;

  const updatedData: Partial<Article> = {
    title,
    excerpt,
    author,
    email,
    content,
    category,
    ...(image && { image }),
    updatedAt: new Date().toISOString(),
  };

  await kv.hset(key, updatedData);

  const updatedArticle = { ...article, ...updatedData };
  console.log(`💾 Article updated with ID: ${id}`);
  return updatedArticle;
}

export async function updateArticleStatus(id: number, status: ArticleStatus): Promise<Article | undefined> {
  const key = articleKey(id);
  const article = await kv.hgetall<Article>(key);

  if (!article) return undefined;

  const updatedData = {
    status,
    updatedAt: new Date().toISOString(),
  };

  await kv.hset(key, updatedData);

  const updatedArticle = { ...article, ...updatedData };
  console.log(`✅ Article status updated for ID: ${id}. New status: ${status}`);
  return updatedArticle;
}

export async function deleteArticle(id: number): Promise<boolean> {
  const key = articleKey(id);
  
  // Remove from the sorted set
  const removedFromSet = await kv.zrem("articles_by_date", key);
  
  // Delete the hash
  const deletedHash = await kv.del(key);

  if (deletedHash > 0) {
    console.log(`❌ Article deleted with ID: ${id}`);
    return true;
  }
  
  return false;
}

// This function is no longer needed with Vercel Blob, but we keep it empty for now
// to avoid breaking imports if it's used elsewhere. It will be removed later.
export function getImageDir() {
  return "";
}

export default { addArticle, getArticles, getArticleById, updateArticle, updateArticleStatus, deleteArticle };

