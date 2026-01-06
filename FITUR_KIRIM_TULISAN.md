# Fitur Kirim Tulisan - Dokumentasi

## 📋 Ringkasan Fitur

Fitur "Kirim Tulisan" memungkinkan pengguna untuk mengirimkan esai atau artikel ke Epistemic Diplomat. Setiap artikel yang dikirimkan akan melalui proses review admin terlebih dahulu sebelum dipublikasikan di Koleksi Esai.

## 🎯 Alur Workflow

```
Pengguna Kirim Tulisan
        ↓
Masuk ke Database (Status: PENDING)
        ↓
Admin Review di Dashboard
        ↓
Admin Approve atau Reject
        ↓
Jika Approved: Tampil di Koleksi Esai
Jika Rejected: Tersimpan tapi tidak ditampilkan
```

## 📝 Cara Penggunaan

### Untuk Pengguna

1. **Membuka Dialog Kirim Tulisan**
   - Klik tombol "Kirim Tulisan" di navbar
   - Dialog akan terbuka dengan form kosong

2. **Mengisi Form**
   - **Judul Tulisan**: Masukkan judul artikel (wajib)
   - **Nama Penulis**: Nama Anda (wajib)
   - **Email**: Email Anda (wajib, untuk verifikasi kepemilikan)
   - **Kategori**: Pilih dari daftar kategori yang tersedia (wajib)
   - **Ringkasan Singkat**: Kutipan/preview artikel (wajib) - akan ditampilkan di grid artikel
   - **Gambar Sampul**: Upload gambar sampul (opsional) - ditampilkan di bagian atas artikel
   - **Isi Tulisan Lengkap**: Konten artikel utama (wajib)

3. **Upload Gambar Sampul**
   - Klik area "Klik untuk pilih gambar"
   - Pilih file gambar dari komputer (format: JPG, PNG, WebP, dll)
   - Ukuran maksimal: 5MB
   - Preview akan ditampilkan
   - Klik tombol X untuk menghapus gambar jika ingin ganti

4. **Mengirim**
   - Klik tombol "Kirim Tulisan"
   - Tunggu notifikasi sukses
   - Email Anda akan disimpan untuk identifikasi kepemilikan artikel

### Untuk Admin

1. **Membuka Admin Dashboard**
   - Navigasi ke `/admin/dashboard`

2. **Meninjau Artikel Pending**
   - Tab "Menunggu" menampilkan semua artikel yang belum direview
   - Setiap artikel menampilkan:
     - Judul
     - Nama dan email penulis
     - Ringkasan singkat
     - Kategori dan tanggal pengiriman

3. **Menyetujui Artikel**
   - Klik tombol "Setujui"
   - Artikel akan pindah ke tab "Disetujui"
   - Artikel akan otomatis tampil di Koleksi Esai

4. **Menolak Artikel**
   - Klik tombol "Tolak"
   - Artikel akan pindah ke tab "Ditolak"
   - Artikel tidak akan ditampilkan di publik

5. **Membatalkan Persetujuan**
   - Di tab "Disetujui", klik "Batalkan Persetujuan"
   - Artikel akan kembali ke status ditolak

## 🗂️ Struktur File

### Database & API

```
lib/
├── constants/articles.ts       # Kategori dan status constants
└── db/articles.ts             # Operasi database (CRUD)

app/api/
├── articles/
│   ├── route.ts               # GET approved articles
│   ├── all/route.ts           # GET all articles (untuk admin)
│   ├── submit/route.ts        # POST submit article
│   └── [id]/
│       ├── approve/route.ts   # PATCH approve article
│       ├── reject/route.ts    # PATCH reject article
│       └── route.ts           # DELETE article
```

### Komponen

```
components/
├── submit-article-dialog.tsx   # Form untuk submit tulisan
├── user-submissions-grid.tsx   # Grid display artikel yang dipublikasi
└── article-grid.tsx            # Koleksi Esai (merged dengan user submissions)

app/
├── articles/
│   └── [id]/page.tsx           # Halaman detail artikel
└── admin/
    └── dashboard/page.tsx      # Admin review interface
```

### Data

```
data/
└── articles.json              # Penyimpanan artikel dalam format JSON
```

## 📊 Database Schema

```typescript
interface Article {
  id: number                      // Auto-increment ID
  title: string                   // Judul artikel
  excerpt: string                 // Ringkasan singkat (untuk preview)
  author: string                  // Nama penulis
  email: string                   // Email penulis (untuk verifikasi)
  content: string                 // Isi lengkap artikel
  category: string                // ID kategori
  image?: string                  // Path gambar sampul (opsional)
  status: "pending" | "approved" | "rejected"  // Status review
  createdAt: string               // Timestamp pembuatan (ISO 8601)
  updatedAt: string               // Timestamp perubahan terakhir
}
```

## 🏷️ Kategori Tersedia

Kategori disinkronkan dengan koleksi esai yang ada:

- **filsafat-sains** - Filsafat Sains
- **teologi** - Teologi
- **bioetika** - Bioetika
- **logika** - Logika
- **epistemologi** - Epistemologi
- **metafisika** - Metafisika
- **filosofi-agama** - Filosofi Agama
- **pendidikan** - Pendidikan
- **semua** - Semua Kategori

## 🔐 Fitur Keamanan & Ownership

### Email-based Ownership
- Email penyubmit disimpan di localStorage
- Hanya penulis yang bisa menghapus artikel mereka sendiri
- Tombol "Hapus" hanya visible untuk pemilik artikel

### Input Validation
- Semua field form wajib diisi
- Validasi format email di client dan server
- Panjang konten tidak dibatasi untuk fleksibilitas

## 📱 Responsive Design

- Form dialog responsive di mobile
- Grid artikel menyesuaikan ke 1, 2, atau 3 kolom
- Detail page artikel fully responsive

## 🔄 Alur Integrasi dengan Koleksi Esai

1. **Static Posts**: Artikel yang sudah ada di `data/posts.ts` tetap ditampilkan
2. **Dynamic Articles**: Artikel yang disetujui dari database ditampilkan
3. **Merger**: ArticleGrid menggabungkan keduanya dan menampilkan dalam satu tampilan
4. **Kategori Unified**: Filter kategori bekerja untuk kedua sumber data

## 💾 Penyimpanan Data

- **Format**: JSON file-based storage di `data/articles.json`
- **Sinkronisasi**: Real-time read/write menggunakan fs module
- **Backup**: Setiap operasi menuliskan file lengkap (atomic writes)

## 📝 Markdown/Content Syntax

### Embedded Images
```
[img]https://example.com/image.jpg[/img]
```

### Plain Text
- Gunakan newline biasa untuk paragraf baru
- Konten disimpan apa adanya untuk fleksibilitas maksimal

## 🎨 UI Components Used

- **Dialog** - Form submit tulisan
- **Tabs** - Admin dashboard review workflow
- **Card** - Article grid display
- **Badge** - Category labels
- **Button** - Actions
- **Textarea** - Content input
- **Select** - Category dropdown
- **Toast** - User feedback notifications
- **AlertDialog** - Delete confirmation

## 🚀 Features

✅ Form submission dengan validasi
✅ File upload gambar sampul (drag & drop support)
✅ Image preview sebelum submit
✅ Max file size validation (5MB)
✅ Admin dashboard dengan 3 status tabs
✅ Approval workflow
✅ Email-based ownership verification
✅ Delete functionality (owner only)
✅ Category filtering
✅ Responsive design
✅ Toast notifications
✅ Article detail page dengan gambar sampul
✅ Integrasi dengan Koleksi Esai
✅ Dynamic article listing
✅ Image display di grid dan detail page

## 🔍 Tips untuk Testing

1. **Submit artikel baru**:
   - Buka halaman utama
   - Klik "Kirim Tulisan"
   - Isi form lengkap
   - Klik "Kirim Tulisan"

2. **Review artikel sebagai admin**:
   - Buka `/admin/dashboard`
   - Lihat artikel di tab "Menunggu"
   - Klik "Lihat" untuk preview
   - Klik "Setujui" atau "Tolak"

3. **Lihat artikel yang dipublikasi**:
   - Kembali ke halaman utama
   - Scroll ke bagian "Koleksi Esai"
   - Filter berdasarkan kategori
   - Klik "Baca Selengkapnya" untuk detail

4. **Menghapus artikel (sebagai pemilik)**:
   - Di grid artikel, tombol "Hapus" hanya visible untuk pemilik
   - Klik "Hapus"
   - Konfirmasi penghapusan

## 📞 Troubleshooting

### Artikel tidak muncul di Koleksi Esai
- Pastikan artikel sudah disetujui admin (check `/admin/dashboard`)
- Refresh halaman untuk memastikan cache ter-clear
- Check artikel status di tab "Disetujui"

### Email tidak terkenali untuk delete
- Email harus sama persis dengan yang dikirimkan saat submit
- Check localStorage.userEmail di browser console
- Clear localStorage jika ada masalah

### Form tidak submit
- Pastikan semua field terisi
- Check email format (harus valid)
- Check browser console untuk error messages
- Pastikan server running (pnpm dev)

## 🔧 Maintenance

### Backup Database
```bash
# articles.json secara otomatis di-backup setiap operasi
# Manual backup: copy data/articles.json ke lokasi aman
```

### Clear Database (Development Only)
```bash
# Edit data/articles.json menjadi []
echo "[]" > data/articles.json
```

### View All Articles (Console)
```typescript
// Di browser console
const articles = await fetch('/api/articles/all').then(r => r.json())
console.log(articles)
```

## 📚 Related Documentation

- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Version**: 1.0  
**Last Updated**: 2025-01-05  
**Status**: Production Ready ✅
