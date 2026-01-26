-- Migration script to fix appointment status ENUM
-- Run this script in your MySQL database to update the status column

-- Step 1: Modify the ENUM column to include pending and confirmed
ALTER TABLE appointments MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'scheduled') DEFAULT 'pending';

-- Step 2: Update existing 'scheduled' statuses to 'pending'
UPDATE appointments SET status = 'pending' WHERE status = 'scheduled' OR status IS NULL OR status = '';

-- Step 3: Final cleanup - remove 'scheduled' from ENUM (optional)
ALTER TABLE appointments MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending';

-- Verify the changes
SELECT id, appointment_id, customer_name, status FROM appointments;
