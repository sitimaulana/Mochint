-- Create table for disabled timeslots
-- Database: beauty_clinic

USE beauty_clinic;

CREATE TABLE IF NOT EXISTS disabled_timeslots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  time_slot VARCHAR(5) NOT NULL COMMENT 'Format: HH:MM',
  reason VARCHAR(255) DEFAULT NULL,
  disabled_by VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date_time (date, time_slot),
  INDEX idx_date (date),
  INDEX idx_time_slot (time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
