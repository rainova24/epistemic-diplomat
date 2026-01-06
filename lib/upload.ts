import { writeFile } from "fs/promises"
import { mkdir, existsSync } from "fs"
import { promisify } from "util"
import path from "path"

const mkdirAsync = promisify(mkdir)

const uploadDir = path.join(process.cwd(), "public", "uploads", "articles")

// Ensure upload directory exists
export async function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    await mkdirAsync(uploadDir, { recursive: true })
  }
}

export async function saveUploadedFile(file: File): Promise<string> {
  await ensureUploadDir()

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
  const filepath = path.join(uploadDir, filename)
  const publicPath = `/uploads/articles/${filename}`

  await writeFile(filepath, buffer)

  return publicPath
}

export function getUploadDir() {
  return uploadDir
}
