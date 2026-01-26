-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 21 Jan 2026 pada 12.53
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `klinik_kecantikan`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `appointments`
--

CREATE TABLE `appointments` (
  `id` varchar(10) NOT NULL,
  `member_id` varchar(10) DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `treatment_id` varchar(10) DEFAULT NULL,
  `therapist_id` varchar(10) DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data untuk tabel `appointments`
--

INSERT INTO `appointments` (`id`, `member_id`, `customer_name`, `treatment_id`, `therapist_id`, `appointment_date`, `amount`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('AP001', 'M001', 'Sarah Johnson', 'T001', 'TH001', '2026-01-21 16:37:14', 250000.00, 'completed', 'Regular facial treatment', '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('AP002', 'M002', 'Michael Chen', 'T002', 'TH002', '2026-01-22 16:37:14', 350000.00, 'confirmed', 'Deep tissue massage', '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('AP003', 'M003', 'Emma Wilson', 'T003', 'TH003', '2026-01-23 16:37:14', 200000.00, 'pending', 'First consultation', '2026-01-21 09:37:14', '2026-01-21 09:37:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `members`
--

CREATE TABLE `members` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `join_date` date NOT NULL,
  `total_visits` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_visit` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data untuk tabel `members`
--

INSERT INTO `members` (`id`, `name`, `email`, `phone`, `join_date`, `total_visits`, `status`, `last_visit`, `created_at`, `updated_at`) VALUES
('M001', 'Sarah Johnson', 'sarah@email.com', '081234567890', '2026-01-21', 3, 'active', '2026-01-21', '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('M002', 'Michael Chen', 'michael@email.com', '081234567891', '2026-01-21', 2, 'active', '2026-01-21', '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('M003', 'Emma Wilson', 'emma@email.com', '081234567892', '2026-01-21', 1, 'active', '2026-01-21', '2026-01-21 09:37:14', '2026-01-21 09:37:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `therapists`
--

CREATE TABLE `therapists` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `join_date` date NOT NULL,
  `total_treatments` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data untuk tabel `therapists`
--

INSERT INTO `therapists` (`id`, `name`, `email`, `phone`, `specialization`, `image`, `notes`, `status`, `join_date`, `total_treatments`, `created_at`, `updated_at`) VALUES
('TH001', 'Dr. Sarah Johnson', 'sarah@clinic.com', '081234567801', 'Massage Therapy', NULL, NULL, 'active', '2026-01-21', 24, '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('TH002', 'Dr. Michael Chen', 'michael@clinic.com', '081234567802', 'Facial Treatment', NULL, NULL, 'active', '2026-01-21', 18, '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('TH003', 'Dr. Lisa Wang', 'lisa@clinic.com', '081234567803', 'Aromatherapy', NULL, NULL, 'active', '2026-01-21', 15, '2026-01-21 09:37:14', '2026-01-21 09:37:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `treatments`
--

CREATE TABLE `treatments` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data untuk tabel `treatments`
--

INSERT INTO `treatments` (`id`, `name`, `category`, `duration`, `price`, `description`, `image`, `created_at`, `updated_at`) VALUES
('T001', 'Facial Treatment', 'Facial', '60 min', 250000.00, 'Deep cleansing facial treatment for glowing skin', NULL, '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('T002', 'Body Massage', 'Massage', '90 min', 350000.00, 'Relaxing full body massage with essential oils', NULL, '2026-01-21 09:37:14', '2026-01-21 09:37:14'),
('T003', 'Hair Treatment', 'Hair Care', '45 min', 200000.00, 'Nourishing hair treatment for damaged hair', NULL, '2026-01-21 09:37:14', '2026-01-21 09:37:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `treatment_history`
--

CREATE TABLE `treatment_history` (
  `id` int(11) NOT NULL,
  `member_id` varchar(10) DEFAULT NULL,
  `appointment_id` varchar(10) DEFAULT NULL,
  `treatment_id` varchar(10) DEFAULT NULL,
  `date` varchar(50) NOT NULL,
  `therapist` varchar(100) NOT NULL,
  `amount` varchar(20) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `treatment_id` (`treatment_id`),
  ADD KEY `therapist_id` (`therapist_id`);

--
-- Indeks untuk tabel `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `therapists`
--
ALTER TABLE `therapists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `treatment_history`
--
ALTER TABLE `treatment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `treatment_id` (`treatment_id`),
  ADD KEY `idx_member` (`member_id`),
  ADD KEY `idx_date` (`date`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `treatment_history`
--
ALTER TABLE `treatment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`therapist_id`) REFERENCES `therapists` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `treatment_history`
--
ALTER TABLE `treatment_history`
  ADD CONSTRAINT `treatment_history_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `treatment_history_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `treatment_history_ibfk_3` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
