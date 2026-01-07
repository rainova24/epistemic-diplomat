import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Tidak ada file yang dikirim" },
        { status: 400 }
      );
    }

    console.log("📤 File upload to Vercel Blob started:", { name: file.name, size: file.size, type: file.type });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "File harus berupa gambar" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Ukuran file terlalu besar (max 5MB)" },
        { status: 400 }
      );
    }

    // Create a unique filename for the blob
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const uniqueFilename = `${timestamp}-${random}-${file.name}`;

    // Upload the file to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    });

    console.log("✅ File uploaded successfully to Vercel Blob:", { url: blob.url });

    return NextResponse.json(
      {
        message: "File berhasil diupload",
        // The client expects a 'path', so we send the blob's URL here.
        path: blob.url,
        // Also send the full blob object for potential future use.
        blob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error uploading file to Vercel Blob:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengupload file" },
      { status: 500 }
    );
  }
}
