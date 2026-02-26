# TROUBLESHOOTING: Error 401 invalid_client

## Penyebab Error 401: invalid_client

Error ini terjadi karena salah satu dari:

### 1. ❌ Client ID atau Client Secret Salah
**Solusi:** Copy ulang dari Google Console

### 2. ❌ Authorized redirect URIs tidak match (PALING SERING)
**Solusi:** Pastikan PERSIS seperti ini di Google Console

### 3. ❌ Server belum restart setelah update .env
**Solusi:** Restart backend

---

## ✅ CHECKLIST PERBAIKAN

### A. Cek di Google Cloud Console

1. **Buka:** https://console.cloud.google.com/apis/credentials

2. **Klik OAuth 2.0 Client ID** yang Anda buat (Mochint Web Client)

3. **SANGAT PENTING - Authorized redirect URIs harus PERSIS:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```
   
   ⚠️ **Perhatikan:**
   - Tidak ada spasi
   - Tidak ada trailing slash (/)
   - Port: 5000 (bukan 3000 atau 5173)
   - Path: /api/auth/google/callback (bukan yang lain)

4. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5000
   ```

5. **Klik SAVE** jika ada yang diubah

6. **Tunggu 5 menit** untuk perubahan apply (Google butuh waktu)

---

### B. Verifikasi File .env

1. Buka: `server/.env`

2. Pastikan TIDAK ADA SPASI atau karakter tersembunyi:

   ```env
   GOOGLE_CLIENT_ID=541701158147-o0vmh1j4nosvh2av0el4otrkOqbf4n7f.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

3. **Cara cek:** Cursor di akhir baris, tidak boleh ada karakter setelahnya

---

### C. Restart Server dengan Benar

**PENTING:** Restart FULL, bukan hanya reload

1. **Stop semua proses Node:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Tunggu 2-3 detik**

3. **Start backend:**
   ```powershell
   cd server
   node server.js
   ```

4. **Cek log muncul:**
   ```
   ✅ Passport initialized for Google OAuth
   ✅ Connected to MySQL at localhost:3306
   Server running on http://localhost:5000
   ```

5. **Start frontend (terminal baru):**
   ```powershell
   npm run dev
   ```

---

### D. Test dengan Browser Bersih

1. **Tutup SEMUA tab browser**

2. **Buka Incognito/Private mode**

3. **Kunjungi:** http://localhost:5173/login

4. **Clear cache jika perlu:** Ctrl+Shift+Delete

5. **Klik tombol Google**

---

## 🔄 ALTERNATIVE: Buat Credentials Baru

Jika masih error setelah semua dicoba:

### Opsi 1: Buat OAuth Client Baru

1. Buka Google Console → Credentials

2. Klik **+ CREATE CREDENTIALS** → OAuth client ID

3. Type: **Web application**

4. Name: **Mochint Web Client v2**

5. **Authorized JavaScript origins:**
   - http://localhost:5173
   - http://localhost:5000

6. **Authorized redirect URIs:**
   - http://localhost:5000/api/auth/google/callback

7. **CREATE**

8. **Copy Client ID & Secret baru**

9. **Update .env dengan credentials baru**

10. **Restart server**

---

### Opsi 2: Reset OAuth Consent Screen

1. OAuth consent screen → EDIT APP

2. Pastikan status: **Testing** (bukan production)

3. **Test users:** Tambahkan email Gmail Anda

4. **SAVE**

---

## 🎯 QUICK FIX - Coba Ini Dulu

**Paling sering berhasil:**

1. **Buka Google Console** → Credentials
2. **Edit OAuth Client** 
3. **Hapus** semua Authorized redirect URIs
4. **Tambah ulang:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. **SAVE**
6. **Tunggu 2 menit**
7. **Restart backend** (stop + start)
8. **Clear browser cache**
9. **Test lagi**

---

## 📞 Masih Error?

Screenshot dan kirim:
1. ✅ OAuth Client settings di Google Console (bagian URIs)
2. ✅ File .env (sensor Client Secret)
3. ✅ Terminal log backend (cari error message)
4. ✅ Browser console error (F12 → Console tab)

**Biasanya masalahnya di redirect URI yang tidak match!**
