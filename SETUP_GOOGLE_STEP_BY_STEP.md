# PANDUAN STEP-BY-STEP: Setup Login dengan Google

## 📋 PERSIAPAN

Yang Anda butuhkan:
- ✅ Akun Gmail (akun biasa, tidak perlu bisnis)
- ✅ Browser (Chrome/Firefox/Edge)
- ✅ 10-15 menit waktu
- ✅ **TIDAK PERLU** kartu kredit atau biaya apapun

---

## STEP 1: Buka Google Cloud Console

1. **Buka browser** dan kunjungi:
   ```
   https://console.cloud.google.com/
   ```

2. **Login** dengan akun Gmail Anda

3. Anda akan melihat halaman dashboard Google Cloud Console

---

## STEP 2: Buat Project Baru

1. **Klik dropdown** di pojok kiri atas (biasanya tertulis "Select a project")

2. **Klik tombol "NEW PROJECT"** (pojok kanan atas di popup)

3. **Isi form:**
   - Project name: `Mochint Beauty Care` (atau nama apapun)
   - Organization: biarkan kosong (No organization)
   - Location: biarkan default

4. **Klik "CREATE"**

5. **Tunggu beberapa detik** sampai project selesai dibuat

6. **Pastikan project baru Anda sudah terpilih** (cek di dropdown pojok kiri atas)

---

## STEP 3: Enable Google+ API (Opsional tapi Direkomendasikan)

1. Di menu sebelah kiri, klik **"APIs & Services"** → **"Library"**

2. Di search bar, ketik: `Google+ API`

3. Klik hasil **"Google+ API"**

4. Klik tombol **"ENABLE"**

5. Tunggu beberapa detik

---

## STEP 4: Buat OAuth Consent Screen

1. Di menu sebelah kiri, klik **"APIs & Services"** → **"OAuth consent screen"**

2. **Pilih "External"** (biarkan default)

3. Klik **"CREATE"**

4. **Isi form OAuth consent screen:**

   **App Information:**
   - App name: `Mochint Beauty Care`
   - User support email: pilih email Anda dari dropdown
   - App logo: (skip dulu, tidak wajib)

   **App Domain (Opsional - bisa dikosongkan untuk development):**
   - Application home page: `http://localhost:5173`
   - Application privacy policy link: (kosongkan)
   - Application terms of service link: (kosongkan)

   **Authorized domains:**
   - Untuk development, bisa dikosongkan dulu

   **Developer contact information:**
   - Email addresses: masukkan email Anda

5. Klik **"SAVE AND CONTINUE"**

6. **Scopes screen:**
   - Klik **"ADD OR REMOVE SCOPES"**
   - Cari dan centang:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Klik **"UPDATE"**
   - Klik **"SAVE AND CONTINUE"**

7. **Test users (Opsional):**
   - Untuk development, Anda bisa tambahkan email tester
   - Atau skip dengan klik **"SAVE AND CONTINUE"**

8. **Summary:**
   - Review informasi
   - Klik **"BACK TO DASHBOARD"**

---

## STEP 5: Buat OAuth 2.0 Client ID (PENTING!)

1. Di menu sebelah kiri, klik **"APIs & Services"** → **"Credentials"**

2. Klik tombol **"+ CREATE CREDENTIALS"** (di atas)

3. Pilih **"OAuth client ID"**

4. **Isi form:**

   **Application type:**
   - Pilih: **"Web application"**

   **Name:**
   - Ketik: `Mochint Web Client`

   **Authorized JavaScript origins:**
   - Klik **"+ ADD URI"**
   - Masukkan: `http://localhost:5173`
   - Klik **"+ ADD URI"** lagi
   - Masukkan: `http://localhost:5000`

   **Authorized redirect URIs:**
   - Klik **"+ ADD URI"**
   - Masukkan: `http://localhost:5000/api/auth/google/callback`
   - ⚠️ **PENTING**: URI harus PERSIS seperti ini!

5. Klik **"CREATE"**

6. **Pop-up akan muncul dengan Client ID dan Client Secret**
   - ✅ **JANGAN TUTUP POP-UP INI DULU!**
   - Klik ikon **copy** untuk menyalin Client ID
   - Klik ikon **copy** untuk menyalin Client Secret
   - Atau klik **"DOWNLOAD JSON"** untuk backup

---

## STEP 6: Update File .env di Backend

1. **Buka VS Code**

2. **Buka file**: `server/.env`

3. **Update baris berikut** dengan nilai yang Anda copy tadi:

   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=paste_client_id_disini
   GOOGLE_CLIENT_SECRET=paste_client_secret_disini
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

4. **Contoh setelah diisi** (nilai Anda akan berbeda):
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

5. **SAVE file** (Ctrl+S)

---

## STEP 7: Aktifkan Tombol Google di Frontend

### File 1: Login.jsx

1. **Buka file**: `src/pages/auth/Login.jsx`

2. **Cari baris** (sekitar baris 68):
   ```javascript
   const isGoogleOAuthEnabled = false;
   ```

3. **Ubah menjadi**:
   ```javascript
   const isGoogleOAuthEnabled = true;
   ```

4. **SAVE file** (Ctrl+S)

### File 2: Regist.jsx

1. **Buka file**: `src/pages/auth/Regist.jsx`

2. **Cari baris** (sekitar baris 68):
   ```javascript
   const isGoogleOAuthEnabled = false;
   ```

3. **Ubah menjadi**:
   ```javascript
   const isGoogleOAuthEnabled = true;
   ```

4. **SAVE file** (Ctrl+S)

---

## STEP 8: Restart Backend Server

1. **Buka terminal** yang menjalankan backend (yang di folder `server`)

2. **Tekan Ctrl+C** untuk stop server

3. **Jalankan ulang**:
   ```bash
   npm run dev
   ```

4. Pastikan muncul log: `✅ Passport initialized for Google OAuth`

---

## STEP 9: Restart Frontend

1. **Buka terminal** yang menjalankan frontend (yang di root folder)

2. **Tekan Ctrl+C** untuk stop

3. **Jalankan ulang**:
   ```bash
   npm run dev
   ```

4. Tunggu sampai muncul: `✓ ready in ...`

---

## STEP 10: Update Database (Jika Belum)

1. **Buka phpMyAdmin** atau MySQL client

2. **Pilih database**: `beauty_clinic`

3. **Jalankan query berikut**:

   ```sql
   -- Tambah kolom untuk Google OAuth
   ALTER TABLE members
   ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL;

   -- Tambah index
   ALTER TABLE members
   ADD INDEX IF NOT EXISTS idx_google_id (google_id);

   -- Buat password nullable (untuk user yang login via Google)
   ALTER TABLE members
   MODIFY COLUMN password VARCHAR(255) DEFAULT NULL;
   ```

4. **Klik "Go"** atau "Execute"

5. Pastikan query sukses tanpa error

---

## STEP 11: TEST LOGIN DENGAN GOOGLE! 🎉

1. **Buka browser** (gunakan Incognito/Private untuk test bersih)

2. **Kunjungi**: `http://localhost:5173/login`

3. **Anda akan melihat**:
   - Form login email/password
   - **Garis pembatas "ATAU"**
   - **Tombol "MASUK DENGAN GOOGLE"** (dengan logo Google)

4. **Klik tombol "MASUK DENGAN GOOGLE"**

5. **Anda akan dialihkan ke halaman Google**:
   - Pilih akun Gmail Anda
   - Klik "Continue" atau "Lanjutkan"

6. **Google akan meminta izin**:
   - Baca permission yang diminta
   - Klik "Allow" atau "Izinkan"

7. **Anda akan otomatis kembali ke aplikasi** dan masuk ke dashboard member!

---

## ✅ CHECKLIST SUKSES

Jika setup berhasil:
- ✅ Tombol Google muncul di halaman Login
- ✅ Tombol Google muncul di halaman Register
- ✅ Klik tombol redirect ke halaman Google
- ✅ Setelah login Google, otomatis masuk ke dashboard
- ✅ Data user tersimpan di database dengan google_id
- ✅ Login berikutnya lebih cepat (tidak perlu isi form)

---

## ⚠️ TROUBLESHOOTING

### Error: "Access blocked: Authorization Error"
**Solusi:**
- Pastikan OAuth Consent Screen sudah dibuat
- Tambahkan email Anda sebagai test user
- Coba pakai akun Gmail yang sama dengan developer

### Error: "Redirect URI mismatch"
**Solusi:**
- Pastikan URI di Google Console PERSIS: `http://localhost:5000/api/auth/google/callback`
- Tidak ada spasi atau karakter tambahan
- Tidak ada trailing slash (/)
- Update `.env` jika perlu, lalu restart backend

### Error: "invalid_client"
**Solusi:**
- Pastikan Client ID dan Secret sudah benar di `.env`
- Tidak ada spasi sebelum/sesudah nilai
- Restart backend setelah update `.env`

### Tombol Google tidak muncul
**Solusi:**
- Pastikan `isGoogleOAuthEnabled = true` di Login.jsx dan Regist.jsx
- Restart frontend (Ctrl+C, lalu `npm run dev`)
- Clear browser cache (Ctrl+Shift+Delete)

### Error: "Cannot GET /api/auth/google"
**Solusi:**
- Pastikan backend berjalan di port 5000
- Check log backend ada error atau tidak
- Restart backend

---

## 🎯 TIPS

1. **Gunakan Incognito/Private window** untuk testing agar tidak tercampur dengan session lama

2. **Bookmark Credentials page** di Google Console untuk akses cepat nanti

3. **Backup Client ID dan Secret** di file notes atau password manager

4. **Untuk Production:**
   - Ganti semua `localhost` dengan domain asli
   - Submit OAuth Consent Screen untuk verification
   - Update Authorized domains

---

## 📞 BUTUH BANTUAN?

Jika ada error atau stuck di step manapun:
1. Screenshot error yang muncul
2. Screenshot konfigurasi di Google Console
3. Copy-paste log error dari terminal
4. Saya siap bantu troubleshoot!

---

**Selamat! Setelah mengikuti langkah-langkah di atas, fitur Login dengan Google sudah siap digunakan!** 🎉
