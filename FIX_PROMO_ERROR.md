# Fix Promo Error - Panduan Troubleshooting

## Masalah
Error 500 saat menyimpan data promo produk dengan pesan: "Error menyimpan produk: AxiosError: Request failed with status code 500"

## Penyebab
Kemungkinan kolom promo (`discount_percentage`, `promo_start_date`, `promo_end_date`) belum ditambahkan ke tabel `products` di database.

## Solusi

### Langkah 1: Cek Kolom di Database

Buka MySQL/phpMyAdmin dan jalankan query berikut:

```sql
DESCRIBE products;
```

Pastikan tabel `products` memiliki kolom berikut:
- `discount_percentage` (INT)
- `promo_start_date` (DATE)
- `promo_end_date` (DATE)

### Langkah 2: Jika Kolom Belum Ada, Jalankan Migration

Jika kolom tersebut belum ada, jalankan file migration yang sudah disediakan:

**Melalui MySQL Command Line:**
```bash
mysql -u root -p klinik_kecantikan < server/add_promo_fields.sql
```

**Atau melalui phpMyAdmin:**
1. Buka phpMyAdmin
2. Pilih database `klinik_kecantikan`
3. Klik tab "SQL"
4. Copy-paste isi file `server/add_promo_fields.sql`
5. Klik "Go" untuk menjalankan

**Atau jalankan query ini langsung:**
```sql
-- Tambahkan kolom untuk fitur promo
ALTER TABLE `products` 
ADD COLUMN `discount_percentage` INT DEFAULT 0 COMMENT 'Persentase diskon (0-100)',
ADD COLUMN `promo_start_date` DATE DEFAULT NULL COMMENT 'Tanggal mulai promo',
ADD COLUMN `promo_end_date` DATE DEFAULT NULL COMMENT 'Tanggal akhir promo';

-- Update existing products dengan nilai default
UPDATE `products` SET 
    `discount_percentage` = 0,
    `promo_start_date` = NULL,
    `promo_end_date` = NULL
WHERE `discount_percentage` IS NULL;
```

### Langkah 3: Restart Server

Setelah menambahkan kolom, restart backend server:

```bash
cd server
npm run dev
```

### Langkah 4: Test Promo Feature

1. Buka halaman Product di admin panel
2. Klik Edit pada produk yang ingin ditambahkan promo
3. Isi data promo:
   - Diskon (%): Masukkan angka 0-100
   - Tanggal Mulai Promo: Pilih tanggal
   - Tanggal Berakhir Promo: Pilih tanggal
4. Klik "Simpan Perubahan"

## Perbaikan yang Sudah Dilakukan

### Frontend (Product.jsx):
1. ✅ Menambahkan helper function `formatDateForInput()` untuk format tanggal
2. ✅ Update `handleEdit()` untuk format tanggal dengan benar
3. ✅ Update `handleSave()` untuk handle empty string dan convert ke null
4. ✅ Update `handleChange()` untuk validasi discount percentage (0-100)
5. ✅ Menambahkan error logging yang lebih detail

### Backend (productsController.js):
1. ✅ Menambahkan console.log untuk debugging
2. ✅ Menambahkan error details di response (sqlMessage)
3. ✅ Improved error handling

## Cara Cek Error di Console

Jika masih ada error, cek:

**Browser Console (F12):**
- Error details akan muncul di console
- Cari pesan yang dimulai dengan "Error menyimpan produk:"

**Server Console:**
- Lihat terminal yang menjalankan `npm run dev` di folder server
- Error SQL akan muncul dengan detail lengkap

## Troubleshooting Lanjutan

Jika masih error setelah migration:

1. **Cek tipe data kolom:**
   ```sql
   SHOW COLUMNS FROM products LIKE '%promo%';
   SHOW COLUMNS FROM products LIKE '%discount%';
   ```

2. **Cek apakah ada constraint yang bermasalah:**
   ```sql
   SHOW CREATE TABLE products;
   ```

3. **Test manual insert:**
   ```sql
   UPDATE products 
   SET discount_percentage = 20, 
       promo_start_date = '2026-03-01', 
       promo_end_date = '2026-03-31' 
   WHERE id = 1;
   ```

4. **Cek error di server log** - buka terminal server dan lihat pesan error lengkap

## Kontak

Jika masalah masih berlanjut, share:
1. Screenshot error di browser console
2. Error message di server console
3. Result dari `DESCRIBE products;`
