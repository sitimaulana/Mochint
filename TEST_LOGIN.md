# TEST LOGIN & REGISTRASI

## Server Status
✅ Server berjalan di: http://localhost:5000
✅ Database terhubung

## Cara Test Login

### 1. Test dari Browser
Buka aplikasi di browser:
```
http://localhost:5173/login
```

Gunakan kredensial yang sudah ada di database.

### 2. Test dengan PowerShell/CMD

**Test Health:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

**Test Registrasi:**
```powershell
$body = @{
    name = "Test User"
    email = "testuser@example.com"
    phone = "08123456789"
    address = "Jl. Test No. 123"
    password = "testpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Test Login:**
```powershell
$body = @{
    email = "testuser@example.com"
    password = "testpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

## Update Database untuk Google OAuth

Jika belum menjalankan SQL migration, jalankan query berikut di MySQL:

```sql
-- Jalankan ini di MySQL client atau phpMyAdmin
USE beauty_clinic;

-- Tambah kolom untuk Google OAuth
ALTER TABLE members
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL;

-- Tambah index
ALTER TABLE members
ADD INDEX IF NOT EXISTS idx_google_id (google_id);

-- Buat password nullable
ALTER TABLE members
MODIFY COLUMN password VARCHAR(255) DEFAULT NULL;
```

Atau jalankan file SQL yang sudah dibuat:
```bash
cd server
mysql -u root -p beauty_clinic < add_google_oauth_columns.sql
```

## Troubleshooting

**Error 401 Unauthorized:**
- Pastikan localStorage berisi token dan active_user
- Clear localStorage dan login ulang
- Cek di browser console (F12)

**Error "Server error" saat login:**
- Pastikan email dan password benar
- Cek apakah user ada di database `members` table
- Lihat console log di terminal server

**Google OAuth tidak berfungsi:**
- Pastikan sudah setup Google OAuth credentials
- Update .env dengan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET
- Jika belum setup, login email/password tetap berfungsi normal
