# 📚 Panduan Penggunaan PageContent Admin Panel

## Overview
Panel PageContent memungkinkan admin untuk mengelola semua konten website secara dinamis tanpa perlu coding. Halaman **Home**, **About**, dan **Promo** kini sepenuhnya dapat dikustomisasi melalui panel admin.

---

## 🏠 Halaman HOME - Section Keys

### 1. **Hero Section** (Section Key: `hero`)
**Tampilan:** Banner utama di bagian atas halaman Home

**Field yang digunakan:**
- **Page Type:** `home`
- **Section Key:** `hero`
- **Title:** Judul utama hero (contoh: "Mochint Beauty Care")
- **Subtitle:** Tagline/deskripsi singkat  
- **Image URL:** Background image untuk hero section
- **Display Order:** 1
- **Is Active:** ✅ Centang untuk menampilkan

**Contoh Data:**
```
Title: Mochint Beauty Care
Subtitle: Klinik kecantikan terpercaya dengan teknologi terkini dan bahan premium untuk perawatan kulit Anda.
Image URL: https://images.unsplash.com/photo-1560750588-73207b1ef5b8
```

---

### 2. **About Section** (Section Key: `about`)
**Tampilan:** Section "Kenali Mochint Lebih Dekat" dengan gambar dan teks

**Field yang digunakan:**
- **Page Type:** `home`
- **Section Key:** `about`
- **Title:** Judul section (contoh: "Rumah Cantik Mochint Beauty Care")
- **Subtitle:** Label UPPERCASE di atas judul (contoh: "Kenali Mochint Lebih Dekat")
- **Content:** Deskripsi lengkap tentang klinik
- **Image URL:** Foto klinik/tim/layanan
- **Display Order:** 2
- **Is Active:** ✅ Centang untuk menampilkan

**Contoh Data:**
```
Title: Rumah Cantik Mochint Beauty Care
Subtitle: Kenali Mochint Lebih Dekat
Content: Selamat datang di Mochint Beauty Care, salon kecantikan yang berlokasi di Pandaan Pasuruan Jawa Timur. Kami hadir sebagai solusi bagi Anda yang ingin merawat kulit dengan teknologi terkini dan bahan premium.
Image URL: https://images.unsplash.com/photo-1612817288484-6f916006741a
```

---

### 3. **Promo Banner** (Section Key: `promo_banner`)
**Tampilan:** Banner promo besar dengan background gelap dan tombol CTA

**Field yang digunakan:**
- **Page Type:** `home`
- **Section Key:** `promo_banner`
- **Title:** Baris pertama judul (contoh: "Buka Peluang Bisnis")
- **Subtitle:** Baris kedua judul dengan warna berbeda (contoh: "Bersama Mochint!")
- **Content:** Deskripsi promo/penawaran
- **Image URL:** Background image (opsional, akan ditampilkan dengan opacity)
- **Display Order:** 3
- **Is Active:** ✅ Centang untuk menampilkan

**Additional Data (JSON):**
```json
{
  "button_text": "Gabung Mitra"
}
```

**Contoh Data:**
```
Title: Buka Peluang Bisnis
Subtitle: Bersama Mochint!
Content: Buka peluang penghasilan tambahan dengan menjadi Reseller resmi Mochint Beauty Care. Modal ringan, keuntungan pasti.
Additional Data: { "button_text": "Gabung Mitra" }
```

---

### 4. **Footer Contact** (Section Key: `footer_contact`)
**Tampilan:** Footer dengan peta Google Maps dan informasi kontak

**Field yang digunakan:**
- **Page Type:** `home`
- **Section Key:** `footer_contact`
- **Title:** Judul section footer (contoh: "Kunjungi Kami")
- **Subtitle:** Label kontak (contoh: "WhatsApp")
- **Content:** Alamat lengkap klinik
- **Display Order:** 4
- **Is Active:** ✅ Centang untuk menampilkan

**📝 Form Spesial dengan Tutorial Lengkap:**

Ketika Anda memilih `page_type: home` dan `section_key: footer_contact`, akan muncul **form khusus dengan 2 section** yang mudah diisi:

#### **📞 Section 1: Nomor WhatsApp**

**A. Nomor untuk Ditampilkan**
   - Ini adalah nomor yang akan terlihat di website
   - Format bebas: bisa pakai spasi, strip, atau tanda kurung
   - Contoh:
     - `+62 819-9420-4009` ✅
     - `0819-9420-4009` ✅
     - `(0819) 9420-4009` ✅

**B. Link WhatsApp**
   - Ini adalah link yang akan dibuka ketika user klik nomor
   - Format WAJIB: `https://wa.me/[nomor tanpa 0 dan spasi]`
   
   **🔄 Cara Konversi (ada di form):**
   ```
   Nomor asli:    0819-9420-4009
   
   Langkah:
   1. Hapus angka 0 di depan       → 819-9420-4009
   2. Tambahkan kode negara 62     → 62819-9420-4009
   3. Hapus spasi dan strip        → 6281994204009
   4. Tambahkan prefix             → https://wa.me/6281994204009
   
   ✅ Hasil: https://wa.me/6281994204009
   ```

#### **🗺️ Section 2: Google Maps**

Form menyediakan **tutorial step-by-step** dengan 6 langkah mudah:

1. **Buka Google Maps** → [https://www.google.com/maps](https://www.google.com/maps)
2. **Cari lokasi** → Ketik nama/alamat klinik
3. **Klik "Share"** → Tombol bagikan
4. **Pilih "Embed a map"** → Tab sematkan peta
5. **Copy URL** → Ambil hanya URL dari dalam `src="..."`
   
   **Contoh kode yang muncul:**
   ```html
   <iframe src="https://www.google.com/maps/embed?pb=..." ...>
   ```
   **Copy HANYA bagian:** `https://www.google.com/maps/embed?pb=...`

6. **Paste ke form** → Tempelkan di kolom yang disediakan

**Contoh Lengkap:**
```
Title: Kunjungi Kami
Subtitle: WhatsApp
Content: Jl. Sidomukti No.13 RT03, RW.04, Pesantren, Pandaan, Kec. Pandaan, Pasuruan, Jawa Timur 67156

📞 Nomor Tampil: +62 819-9420-4009
🔗 Link WhatsApp: https://wa.me/6281994204009
🗺️ Maps URL: https://www.google.com/maps/embed?pb=!1m18!1m12...
```

**💡 Keuntungan Form Baru:**
- ✅ Panduan visual dengan icon dan warna
- ✅ Contoh konversi nomor WhatsApp langsung di form
- ✅ Tutorial Google Maps step-by-step dengan screenshot visual
- ✅ Warning box untuk hal penting
- ✅ Tidak perlu input JSON manual!

---

## 📄 Halaman ABOUT

### 1. **Vision Section** (Section Key: `vision`)
**Field yang digunakan:**
- **Page Type:** `about`
- **Section Key:** `vision`
- **Title:** Judul halaman about
- **Content:** Deskripsi umum

**Additional Data (JSON):**
```json
{
  "visi": "Menjadi klinik kecantikan terpercaya di Indonesia",
  "misi": [
    "Memberikan pelayanan terbaik",
    "Menggunakan produk berkualitas tinggi",
    "Mengembangkan SDM profesional"
  ]
}
```

---

## 🎁 Halaman PROMO

### 1. **Promo Details** (Section Key: `promo_details`)
**Field yang digunakan:**
- **Page Type:** `promo`
- **Section Key:** `promo_details`
- **Title:** Nama promo
- **Subtitle:** Label promo
- **Content:** Deskripsi promo
- **Image URL:** Banner promo

**Additional Data (JSON):**
```json
{
  "promo_label": "DISKON SPESIAL",
  "discount_percentage": "50",
  "whatsapp_number": "628123456789",
  "benefits": [
    "Gratis konsultasi dengan dokter",
    "Potongan harga hingga 50%",
    "Produk home care gratis"
  ]
}
```

---

## 🎯 Tips Penggunaan

### ✅ Best Practices
1. **Section Key harus LOWERCASE dan konsisten**
   - ✅ Benar: `hero`, `about`, `promo_banner`, `footer_contact`
   - ❌ Salah: `Hero`, `ABOUT`, `Promo Banner`

2. **Form Additional Data muncul otomatis**
   - Untuk `page_type: promo` → Form manfaat promo, diskon, WhatsApp
   - Untuk `page_type: about` + `section_key: vision` → Form visi & misi
   - Untuk `page_type: home` + `section_key: footer_contact` → Form nomor telepon, WhatsApp URL, Google Maps
   - **Tidak perlu input JSON manual!** Form sudah disediakan dengan field yang jelas

3. **Satu section_key = Satu konten aktif**
   - Jika ada 2 konten dengan section_key yang sama dan keduanya aktif, sistem akan mengambil yang pertama ditemukan

4. **Display Order menentukan urutan**
   - Angka lebih kecil = posisi lebih atas
   - Gunakan urutan: 1, 2, 3, 4, dst.

5. **Image URL harus valid**
   - Gunakan URL lengkap dengan https://
   - Atau upload gambar dari device (akan otomatis ter-encode)

6. **Additional Data untuk section lain (manual JSON)**
   - Jika menggunakan section_key selain yang sudah disebutkan, Anda bisa input JSON manual
   - Gunakan double quotes untuk key dan value string
   - Array menggunakan []
   - Contoh: `{"key": "value", "array": ["item1", "item2"]}`

### 🔍 Fallback System
Jika konten tidak ditemukan atau tidak aktif, sistem akan menampilkan konten default yang sudah di-hardcode. Website tetap berfungsi normal meski belum ada konten di database.

---

## 🚀 Workflow Admin

### Menambah Konten Baru:
1. Klik tombol **"Tambah Konten"**
2. Pilih **Page Type** (Home/About/Promo)
3. Isi **Section Key** sesuai panduan di atas
4. Isi **Title, Subtitle, Content** sesuai kebutuhan
5. Upload **Image** atau paste URL
6. Isi **Additional Data** jika diperlukan (format JSON)
7. Tentukan **Display Order**
8. Centang **"Aktifkan konten ini"**
9. Klik **"Simpan"**

### Mengedit Konten:
1. Klik tombol **"Edit"** pada kartu konten
2. Ubah field yang diperlukan
3. Klik **"Perbarui"**

### Menonaktifkan Konten:
1. Klik tombol **"Edit"**
2. **Uncheck** checkbox "Aktifkan konten ini"
3. Atau klik tombol **"Hapus"** (soft delete - bisa dipulihkan)

### Memulihkan Konten:
1. Konten yang dihapus akan muncul dengan opacity rendah dan border abu-abu
2. Klik tombol **"Pulihkan"** untuk mengaktifkan kembali

---

## ❓ Troubleshooting

**Q: Konten tidak muncul di website setelah disimpan?**
- Pastikan checkbox "Aktifkan konten ini" sudah dicentang
- Cek Page Type dan Section Key sudah benar
- Refresh halaman website (Ctrl+F5)

**Q: Gambar tidak muncul?**
- Pastikan URL gambar valid dan bisa diakses
- Gunakan URL dengan https:// bukan http://
- Coba upload gambar dari device sebagai alternatif

**Q: Additional Data error?**
- Untuk `footer_contact`, `promo`, dan `vision` → Gunakan form yang sudah disediakan, JANGAN input JSON manual
- Form akan muncul otomatis setelah memilih page_type dan section_key yang sesuai
- Jika tetap perlu input JSON manual (untuk section lain), pastikan format valid
- Gunakan tool JSON validator online untuk mengecek
- Jangan lupa double quotes untuk string

**Q: Form Additional Data tidak muncul?**
- Pastikan kombinasi page_type dan section_key sudah benar:
  - `page_type: home` + `section_key: footer_contact` → Form kontak & maps
  - `page_type: promo` (any section_key) → Form promo
  - `page_type: about` + `section_key: vision` → Form visi & misi
- Refresh form dengan menutup dan membuka kembali

**Q: Konten muncul ganda?**
- Cek apakah ada 2 konten dengan section_key yang sama dan keduanya aktif
- Nonaktifkan salah satu atau ubah section_key

---

## 📞 Support
Jika ada pertanyaan atau masalah, hubungi tim developer.

**Terakhir diupdate:** Maret 2026
