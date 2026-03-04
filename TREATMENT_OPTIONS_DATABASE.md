# Implementasi Database untuk Kategori & Fasilitas Treatment

## 📋 Ringkasan Perubahan

Data kategori dan fasilitas perawatan sekarang disimpan di **database MySQL**, bukan lagi di localStorage. Ini memastikan data tetap konsisten dan tersimpan permanen meskipun admin logout atau browser dibersihkan.

---

## 🗄️ Database Schema

### Tabel Baru: `treatment_options`

```sql
CREATE TABLE treatment_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  option_type ENUM('category', 'facility') NOT NULL,
  option_value VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_option (option_type, option_value)
);
```

**Kolom:**
- `id`: Primary key auto increment
- `option_type`: Tipe data ('category' atau 'facility')
- `option_value`: Nilai/nama kategori atau fasilitas
- `is_active`: Status aktif/nonaktif (untuk soft delete)
- `created_at`: Tanggal dibuat
- `updated_at`: Tanggal terakhir diupdate

**Data Default yang Sudah Diisi:**

**Kategori (5):**
1. Perawatan Wajah
2. Perawatan Tubuh
3. Perawatan Khusus
4. Paket Spesial
5. Perawatan Promo

**Fasilitas (13):**
1. Facial Wash
2. Deep Cleansing
3. Facial Massage
4. Head Massage
5. Shoulder Massage
6. Masker Wajah
7. Scrub
8. Serum Treatment
9. Totok Wajah
10. Face Toning
11. Aromaterapi
12. Hand Treatment
13. Foot Spa

---

## 🔌 API Endpoints Baru

Base URL: `http://localhost:5000/api/treatment-options`

### 1. Get Categories
```
GET /api/treatment-options/categories
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    "Perawatan Wajah",
    "Perawatan Tubuh",
    "Perawatan Khusus",
    "Paket Spesial",
    "Perawatan Promo"
  ]
}
```

### 2. Get Facilities
```
GET /api/treatment-options/facilities
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 13,
  "data": [
    "Facial Wash",
    "Deep Cleansing",
    ...
  ]
}
```

### 3. Add Category (Admin Only)
```
POST /api/treatment-options/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "Perawatan Anti-Aging"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category added successfully",
  "data": "Perawatan Anti-Aging"
}
```

### 4. Add Facility (Admin Only)
```
POST /api/treatment-options/facilities
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "Hot Stone Therapy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Facility added successfully",
  "data": "Hot Stone Therapy"
}
```

### 5. Delete Category (Admin Only - Soft Delete)
```
DELETE /api/treatment-options/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "Perawatan Promo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### 6. Delete Facility (Admin Only - Soft Delete)
```
DELETE /api/treatment-options/facilities
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "Aromaterapi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Facility deleted successfully"
}
```

---

## 📁 File-File yang Dibuat/Diubah

### File Baru di Server:

1. **`server/create_treatment_options_table.sql`**
   - SQL script untuk membuat tabel dan data default

2. **`server/models/TreatmentOptions.js`**
   - Model untuk CRUD operations pada treatment_options

3. **`server/controllers/treatmentOptionsController.js`**
   - Controller untuk handle API requests

4. **`server/routes/treatmentOptionsRoutes.js`**
   - Routes untuk API endpoints

5. **`server/setup_treatment_options.js`**
   - Script untuk setup database (sekali jalan)

### File yang Diubah:

1. **`server/server.js`**
   - Menambahkan import dan register route baru:
   ```javascript
   const treatmentOptionsRoutes = require('./routes/treatmentOptionsRoutes');
   app.use('/api/treatment-options', treatmentOptionsRoutes);
   ```

2. **`src/pages/admin/Treatment.jsx`**
   - Mengganti localStorage dengan API calls
   - Fetch data dari database saat load
   - Save ke database saat tambah/hapus kategori/fasilitas

---

## 🔄 Cara Kerja Baru

### Sebelum (localStorage):
```javascript
// Load dari localStorage
const [availableCategories, setAvailableCategories] = useState(() => {
  const saved = localStorage.getItem('availableCategories');
  return saved ? JSON.parse(saved) : defaultCategories;
});

// Simpan ke localStorage
localStorage.setItem('availableCategories', JSON.stringify(availableCategories));
```

### Sesudah (Database API):
```javascript
// State kosong, akan diisi dari database
const [availableCategories, setAvailableCategories] = useState([]);

// Fetch dari database saat load
const fetchCategories = async () => {
  const response = await axios.get(`${OPTIONS_API_URL}/categories`, {
    headers: { Authorization: `Bearer ${Token}` }
  });
  setAvailableCategories(response.data.data || []);
};

// Save ke database saat tambah
const handleAddCategory = async () => {
  await axios.post(`${OPTIONS_API_URL}/categories`, 
    { value: newCategoryValue },
    { headers: { Authorization: `Bearer ${Token}` } }
  );
  await fetchCategories(); // Refresh dari database
};

// Delete dari database
const handleRemoveCategory = async (category) => {
  await axios.delete(`${OPTIONS_API_URL}/categories`, {
    data: { value: category },
    headers: { Authorization: `Bearer ${Token}` }
  });
  await fetchCategories(); // Refresh dari database
};
```

---

## ✅ Keuntungan Implementasi Database

1. **Data Persisten**: Data tidak hilang meskipun browser dibersihkan atau logout
2. **Multi-Device Sync**: Perubahan langsung terlihat di semua device
3. **Centralized**: Satu sumber data untuk semua admin
4. **Backup & Recovery**: Data masuk dalam backup database
5. **Audit Trail**: Bisa track siapa dan kapan menambah/hapus data
6. **No Storage Limit**: Tidak terbatas space localStorage
7. **Soft Delete**: Data dihapus dengan flag, bisa di-restore
8. **Validation**: Server bisa validasi dan prevent duplicate

---

## 🧪 Cara Testing

### 1. Test Get Categories
```bash
curl -X GET http://localhost:5000/api/treatment-options/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Add Category
```bash
curl -X POST http://localhost:5000/api/treatment-options/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "Perawatan Anti-Aging"}'
```

### 3. Test Delete Category
```bash
curl -X DELETE http://localhost:5000/api/treatment-options/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "Perawatan Anti-Aging"}'
```

### 4. Test di Frontend (Treatment.jsx)
1. Login sebagai admin
2. Buka halaman Treatment
3. Klik "Tambah Perawatan"
4. Buka tab "Detail Perawatan"
5. Lihat kategori yang tersedia (dari database)
6. Tambah kategori baru
7. Logout dan login lagi
8. Kategori baru masih ada (tersimpan di database)

---

## 🔧 Maintenance

### Melihat Data di Database
```sql
-- Lihat semua kategori aktif
SELECT * FROM treatment_options 
WHERE option_type = 'category' AND is_active = TRUE;

-- Lihat semua fasilitas aktif
SELECT * FROM treatment_options 
WHERE option_type = 'facility' AND is_active = TRUE;

-- Lihat data yang dihapus (soft delete)
SELECT * FROM treatment_options WHERE is_active = FALSE;
```

### Restore Data yang Dihapus
```sql
-- Restore kategori yang dihapus
UPDATE treatment_options 
SET is_active = TRUE 
WHERE option_value = 'Perawatan Promo' AND option_type = 'category';
```

### Hard Delete (Permanent)
```sql
-- Hapus permanen data yang sudah soft delete
DELETE FROM treatment_options WHERE is_active = FALSE;
```

---

## 🚀 Migration Guide (Jika Ada Data di localStorage)

Jika sebelumnya sudah ada custom kategori/fasilitas di localStorage dan ingin migrasi ke database:

1. Buka browser console di halaman Treatment
2. Copy data localStorage:
```javascript
// Copy categories
console.log(JSON.parse(localStorage.getItem('availableCategories')));

// Copy facilities
console.log(JSON.parse(localStorage.getItem('availableFacilities')));
```

3. Tambahkan satu per satu via API atau langsung insert ke database:
```sql
INSERT INTO treatment_options (option_type, option_value) VALUES
('category', 'Your Custom Category'),
('facility', 'Your Custom Facility');
```

4. Clear localStorage (optional):
```javascript
localStorage.removeItem('availableCategories');
localStorage.removeItem('availableFacilities');
localStorage.removeItem('deletedCategories');
localStorage.removeItem('deletedFacilities');
```

---

## 📝 Notes

1. **Soft Delete**: Data yang dihapus tidak benar-benar dihapus dari database, hanya flag `is_active` diset ke `FALSE`
2. **Unique Constraint**: Tidak bisa menambahkan kategori/fasilitas yang sudah ada (case-sensitive)
3. **Admin Only**: Hanya admin yang bisa tambah/hapus kategori dan fasilitas
4. **Auto Restore**: Jika mencoba tambah data yang sudah ada tapi soft-deleted, akan otomatis di-restore

---

## ⚠️ Troubleshooting

### Error: "Failed to fetch categories"
- Pastikan server berjalan di port 5000
- Pastikan token valid dan belum expired
- Check network tab di browser console

### Categories/Facilities tidak muncul
- Cek browser console untuk error
- Pastikan database tabel sudah dibuat
- Jalankan `node setup_treatment_options.js` jika perlu

### Error saat tambah kategori/fasilitas
- Pastikan login sebagai admin (role='admin')
- Pastikan nama kategori/fasilitas belum ada
- Pastikan koneksi database normal

---

## 📞 Support

Jika ada masalah atau pertanyaan, silakan check:
1. Browser console untuk error frontend
2. Server logs untuk error backend
3. Database untuk verifikasi data

---

✅ **Implementasi Selesai!**
Data kategori dan fasilitas sekarang tersimpan permanen di database MySQL.
