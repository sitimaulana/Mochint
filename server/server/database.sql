-- database.sql
CREATE DATABASE IF NOT EXISTS klinik_kecantikan;
USE klinik_kecantikan;

-- 1. Members Table
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    join_date DATE NOT NULL,
    total_visits INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_visit DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Therapists Table
CREATE TABLE IF NOT EXISTS therapists (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    image VARCHAR(255),
    notes TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    join_date DATE NOT NULL,
    total_treatments INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    duration VARCHAR(20),
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(10) PRIMARY KEY,
    member_id VARCHAR(10),
    customer_name VARCHAR(100) NOT NULL,
    treatment_id VARCHAR(10),
    therapist_id VARCHAR(10),
    appointment_date DATETIME NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL,
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE SET NULL
);

-- 5. Insert Sample Data
INSERT INTO members (id, name, email, phone, join_date, total_visits, status, last_visit) VALUES
('M001', 'Sarah Johnson', 'sarah@email.com', '081234567890', CURDATE(), 3, 'active', CURDATE()),
('M002', 'Michael Chen', 'michael@email.com', '081234567891', CURDATE(), 2, 'active', CURDATE()),
('M003', 'Emma Wilson', 'emma@email.com', '081234567892', CURDATE(), 1, 'active', CURDATE());

INSERT INTO therapists (id, name, email, phone, specialization, status, join_date, total_treatments) VALUES
('TH001', 'Dr. Sarah Johnson', 'sarah@clinic.com', '081234567801', 'Massage Therapy', 'active', CURDATE(), 24),
('TH002', 'Dr. Michael Chen', 'michael@clinic.com', '081234567802', 'Facial Treatment', 'active', CURDATE(), 18),
('TH003', 'Dr. Lisa Wang', 'lisa@clinic.com', '081234567803', 'Aromatherapy', 'active', CURDATE(), 15);

INSERT INTO treatments (id, name, category, duration, price, description) VALUES
('T001', 'Facial Treatment', 'Facial', '60 min', 250000, 'Deep cleansing facial treatment for glowing skin'),
('T002', 'Body Massage', 'Massage', '90 min', 350000, 'Relaxing full body massage with essential oils'),
('T003', 'Hair Treatment', 'Hair Care', '45 min', 200000, 'Nourishing hair treatment for damaged hair');

INSERT INTO appointments (id, member_id, customer_name, treatment_id, therapist_id, appointment_date, amount, status, notes) VALUES
('AP001', 'M001', 'Sarah Johnson', 'T001', 'TH001', NOW(), 250000, 'completed', 'Regular facial treatment'),
('AP002', 'M002', 'Michael Chen', 'T002', 'TH002', DATE_ADD(NOW(), INTERVAL 1 DAY), 350000, 'confirmed', 'Deep tissue massage'),
('AP003', 'M003', 'Emma Wilson', 'T003', 'TH003', DATE_ADD(NOW(), INTERVAL 2 DAY), 200000, 'pending', 'First consultation');