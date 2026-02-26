-- Menambahkan kolom google_id dan profile_picture ke tabel members
ALTER TABLE members
ADD COLUMN google_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL,
ADD INDEX idx_google_id (google_id);

-- Membuat password menjadi nullable untuk mendukung Google OAuth
ALTER TABLE members
MODIFY COLUMN password VARCHAR(255) DEFAULT NULL;
