import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { message: "Tidak ada file yang dikirim" },
        { status: 400 }
      )
    }

    console.log("📤 File upload started:", { name: file.name, size: file.size, type: file.type })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "File harus berupa gambar" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Ukuran file terlalu besar (max 5MB)" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const filename = `${timestamp}-${random}-${file.name}`
    
    // Store in public folder so it can be served as static file
    const uploadDir = join(process.cwd(), "public", "uploads", "articles")
    const filepath = join(uploadDir, filename)
    const publicUrl = `/uploads/articles/${filename}`

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Write file
    await writeFile(filepath, buffer)
    
    console.log("✅ File uploaded successfully:", { filename, publicUrl })

    return NextResponse.json(
      {
        message: "File berhasil diupload",
        path: publicUrl,
        filename,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error uploading file:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengupload file" },
      { status: 500 }
    )
  }
}
