-- Create database
CREATE DATABASE IF NOT EXISTS klinik_kecantikan;
USE klinik_kecantikan;

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    join_date VARCHAR(20) NOT NULL,
    total_visits INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_visit VARCHAR(20) DEFAULT 'Never',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email (email)
);

-- Therapists table
CREATE TABLE IF NOT EXISTS therapists (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100),
    experience_years INT,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    working_hours VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Treatments table
CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    duration_minutes INT,
    price DECIMAL(10, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT 0,
    status ENUM('available', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(10) PRIMARY KEY,
    member_id VARCHAR(10),
    therapist_id VARCHAR(10),
    treatment_id VARCHAR(10),
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration_minutes INT,
    status ENUM('pending', 'confirmed', 'completed', 'no_show') DEFAULT 'pending',
    notes TEXT,
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE SET NULL,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_member (member_id)
);

-- Treatment history table
CREATE TABLE IF NOT EXISTS treatment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(10),
    appointment_id VARCHAR(10),
    treatment_id VARCHAR(10),
    date VARCHAR(50) NOT NULL,
    therapist VARCHAR(100) NOT NULL,
    amount VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL,
    INDEX idx_member (member_id),
    INDEX idx_date (date)
);
