# Fix Google OAuth Error 401: invalid_client

## Masalah
Error "Error 401: invalid_client" muncul saat mencoba login dengan Google. Error ini berarti Google tidak dapat memvalidasi Client ID dan Client Secret yang dikirim dari aplikasi Anda.

## Penyebab Utama
1. **Client Secret tidak cocok** dengan yang ada di Google Cloud Console
2. Client Secret sudah kadaluarsa atau di-regenerate
3. OAuth client sedang disabled atau dihapus
4. User bukan test user (jika app masih dalam testing mode)

## Solusi Step-by-Step

### Langkah 1: Verifikasi Credentials di Google Cloud Console

1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Pilih project "Mochint Beauty Care"
3. Klik pada OAuth 2.0 Client ID: **"Mochint Beauty Care - OAuth"**
4. Catat atau screenshot:
   - Client ID
   - Authorized JavaScript origins
   - Authorized redirect URIs

### Langkah 2: Generate Secret Baru (RECOMMENDED)

Karena Client Secret tidak bisa dilihat lagi setelah dibuat, cara paling aman adalah generate yang baru:

1. Di halaman OAuth client, scroll ke bagian **"Client secrets"**
2. Klik tombol **"ADD SECRET"** 
3. Secret baru akan ditampilkan **SEKALI SAJA** - COPY segera!
4. Format: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxx`

> ⚠️ **PENTING**: Simpan secret ini dengan aman. Anda tidak akan bisa melihatnya lagi!

### Langkah 3: Update File server/.env

Edit file `server/.env` dan update dengan credentials yang benar:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=541701158147-d3257qmibs92unfphcfueptbg52n9s3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-PASTE_SECRET_BARU_DISINI
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Langkah 4: Verifikasi Test Users

Jika aplikasi Anda masih dalam **Testing mode**:

1. Buka [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Scroll ke bagian **"Test users"**
3. Pastikan email yang akan digunakan untuk login sudah ditambahkan sebagai test user
4. Jika belum, klik **"ADD USERS"** dan tambahkan:
   - sitimaulana2005@gmail.com
   - Dan email lain yang akan dipakai untuk testing

**ATAU** publish aplikasi ke Production (jika sudah siap).

### Langkah 5: Verifikasi Authorized URLs

Pastikan URLs di Google Cloud Console sudah benar:

**Authorized JavaScript origins:**
- `http://localhost:5173` (untuk Vite dev server)
- `http://localhost:5000` (untuk backend)

**Authorized redirect URIs:**
- `http://localhost:5000/api/auth/google/callback`

### Langkah 6: Restart Server

Setelah update `.env`, WAJIB restart server Node.js:

```powershell
# Stop server yang sedang jalan
Get-Process node | Stop-Process -Force

# Atau Ctrl+C di terminal server, lalu jalankan lagi:
cd server
node server.js
```

### Langkah 7: Test Login

1. Buka browser dan akses: `http://localhost:5173/login`
2. Klik tombol "MASUK DENGAN GOOGLE"
3. Pilih akun Google yang sudah ditambahkan sebagai test user
4. Seharusnya berhasil redirect ke dashboard member

## Troubleshooting Tambahan

### Jika Masih Error 401

**Check 1: Pastikan menggunakan secret yang BENAR**
- Copy-paste langsung dari Google Console
- Jangan ada spasi di awal/akhir
- Format: `GOCSPX-` diikuti karakter random

**Check 2: Cek console log server**
Saat server start, Anda harus melihat:
```
🔑 Google OAuth Credentials:
Client ID: 541701158147-d3257q...
Client Secret: SET (GOCSPX-9VYVkVJ...)
Callback URL: http://localhost:5000/api/auth/google/callback
```

Jika Client Secret menunjukkan "NOT SET", berarti .env tidak terbaca.

**Check 3: Hapus old secrets di Google Console**
Jika ada multiple secrets, hapus yang lama untuk menghindari konflik.

### Jika Error "redirect_uri_mismatch"

Pastikan callback URL PERSIS SAMA (termasuk http/https, port, path):
- Di `.env`: `http://localhost:5000/api/auth/google/callback`
- Di Google Console: `http://localhost:5000/api/auth/google/callback`

### Jika Error "access_denied"

User mungkin bukan test user atau menolak permission. Pastikan:
1. User sudah ditambahkan sebagai test user
2. User meng-allow semua permissions yang diminta (profile, email)

## Testing Checklist

- [ ] Client ID di .env sesuai dengan Google Console
- [ ] Client Secret di .env adalah yang TERBARU dari Google Console  
- [ ] Callback URL di .env sesuai dengan Google Console
- [ ] Test user sudah ditambahkan di OAuth consent screen
- [ ] Server sudah di-restart setelah update .env
- [ ] Browser sudah clear cache/cookies atau gunakan incognito
- [ ] Port 5000 (backend) dan 5173 (frontend) sudah running

## Referensi

- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google OAuth](http://www.passportjs.org/packages/passport-google-oauth20/)

---

**Terakhir diupdate**: 26 Februari 2026
