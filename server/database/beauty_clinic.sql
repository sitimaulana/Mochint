-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 05, 2026 at 07:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `beauty_clinic`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('super_admin','admin','staff') DEFAULT 'staff',
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `full_name`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'superadmin@mochint.com', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Super Administrator', 'super_admin', 'active', NULL, '2026-02-03 06:58:24', '2026-02-03 06:58:24'),
(2, 'admin', 'admin@mochint.com', '$2b$10$y/R/Hj86lTs3TF6FYBFZfeblP8X1CIO4vzEbZIDWME8N6Q/K1/Bse', 'System Admin', 'admin', 'active', '2026-02-04 10:55:54', '2026-02-03 06:58:24', '2026-02-04 10:55:54'),
(3, 'staff1', 'staff@mochint.com', '$2b$10$P13gvoRzqJdFqHML2khMZuqbwA0WNd157xzCdQ8NIgn8VUszfccie', 'Staff User', 'staff', 'active', NULL, '2026-02-03 07:46:48', '2026-02-04 10:42:30');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `appointment_id` varchar(20) DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `member_id` int(11) DEFAULT NULL,
  `treatment_id` int(11) DEFAULT NULL,
  `therapist_id` varchar(100) DEFAULT NULL,
  `date` varchar(20) NOT NULL,
  `time` varchar(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` enum('confirmed','completed') DEFAULT 'confirmed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `appointment_id`, `customer_name`, `member_id`, `treatment_id`, `therapist_id`, `date`, `time`, `amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 'APT00001', 'Fuad', 260003, null, null, '2026-01-29', '21:30', 10000.00, 'completed', '2026-01-22 14:31:40', '2026-01-30 06:51:33'),
(2, 'APT00002', 'Lanaaa Siti', 260001, null, null, '2026-01-28', '22:05', 450000.00, 'completed', '2026-01-22 15:06:00', '2026-01-28 16:23:16'),
(3, 'APT00003', 'Ikram', 260004, null, null, '2026-01-28', '17:56', 200000.00, 'completed', '2026-01-23 08:56:39', '2026-01-28 16:23:18'),
(4, 'APT00004', 'Lukman Hakim', 260002, null, null, '2026-01-28', '14:04', 750000.00, 'completed', '2026-01-26 07:04:26', '2026-01-28 14:40:22');

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `status` enum('Draft','Published') DEFAULT 'Draft',
  `image` longtext DEFAULT NULL,
  `author` varchar(100) DEFAULT 'Admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `image`, `author`, `created_at`, `updated_at`) VALUES
(1, 'New Facial Treatment Available', 'We are excited to introduce our latest cryotherapy facial treatment. This advanced treatment uses cutting-edge technology to rejuvenate your skin, reduce wrinkles, and provide a youthful glow. Book your appointment now to experience the difference!', 'Treatment', 'Published', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=500&fit=crop', 'Admin', '2026-01-21 14:06:51', '2026-01-26 14:34:38'),
(2, 'Special Holiday Schedule', 'Please be informed that our clinic will be closed from February 10-12, 2024, in observance of Chinese New Year. Regular operations will resume on February 13. We apologize for any inconvenience caused.', 'Announcement', 'Draft', 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=500&fit=crop', 'Fuad', '2026-01-21 14:06:51', '2026-01-28 15:30:29'),
(3, 'Monthly Promo Discount', 'Get 20% off on all facial treatments this month! This special promotion is valid until the end of January. Perfect time to pamper yourself or gift someone special with our premium beauty services.', 'Promotion', 'Published', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop', 'Admin', '2026-01-21 14:06:51', '2026-01-21 14:06:51'),
(4, 'Tips Perawatan Kulit Sehat', 'Content artikel tentang perawatan kulit...', 'Beauty', 'Published', NULL, 'Admin', '2026-02-05 18:10:47', '2026-02-05 18:10:47'),
(5, 'Manfaat Facial Rutin', 'Content artikel tentang manfaat facial...', 'Treatment', 'Published', NULL, 'Admin', '2026-02-05 18:10:47', '2026-02-05 18:10:47');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `join_date` varchar(20) DEFAULT NULL,
  `total_visits` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_visit` varchar(50) DEFAULT 'Never',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` enum('member','admin') DEFAULT 'member'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `name`, `email`, `phone`, `address`, `password`, `join_date`, `total_visits`, `status`, `last_visit`, `created_at`, `updated_at`, `role`) VALUES
(260001, 'Lanaaa Siti', 'sitilana@gmail.com', '081234567891', 'labubu', '', '21 Jan 2023', 9, 'active', '2026-01-30', '2026-01-21 15:12:12', '2026-01-30 06:50:02', 'member'),
(260002, 'Lukman Hakim', 'lukmanhakim@email.com', '08122222222', 'lala', '', '22 Jan 2026', 10, 'active', '23 Jan 2026', '2026-01-22 15:05:17', '2026-01-28 16:23:15', 'member'),
(260003, 'Fuad', 'fuad@email.com', '08144444444', 'klagen', '', '26 Jan 2026', 7, 'active', '2026-01-30', '2026-01-26 13:47:39', '2026-01-30 06:50:00', 'member'),
(260004, 'Ikram', 'ikram@email.com', '081234567891', 'sby', '', '27 Jan 2026', 1, 'active', '2026-01-28', '2026-01-27 10:28:17', '2026-01-28 16:23:18', 'member'),
(260005, 'Farchan', 'farchan@gmail.com', '081234567891', 'Kenjeran', '', '29 Jan 2026', 1, 'active', '2026-01-29', '2026-01-29 07:05:13', '2026-01-30 06:48:33', 'member'),
(260006, 'Eka', 'eka@gmail.com', '085732422898', 'Lamongan', '$2b$10$YX9bgvpmTrAvG4sxV.t3fO8LcdfFdi0mL4e75F6h1MYKpXJxsPcl2', '2/2/2026', 1, 'active', '2026-02-04 16:42:06.304', '2026-02-02 08:47:05', '2026-02-04 09:42:06', 'member'),
(260007, 'Kevin', 'epin@gmail.com', '081234567891', 'Surabaya', '', '2 Feb 2026', 0, 'active', 'Never', '2026-02-02 08:59:04', '2026-02-02 08:59:04', 'member'),
(260008, 'Herwin', 'herwin@gmail.com', '08123456789', 'Surabaya', '$2b$10$.wSVH8WzI4vL6Nu69Fok6edyLCsw4RGgwvLoxjt/xLHd78UJWya6a', '2/2/2026', 7, 'active', '2026-02-04 17:01:11.607', '2026-02-02 09:09:10', '2026-02-04 10:01:11', 'member'),
(260009, 'Siltiana Putri', 'siltiana@gmail.com', '081234567890', 'Jl. Test No. 123, Jakarta', '$2b$10$bj94Z0goPy3ivcSw4K88yOCXFmvq6qBTmvOkx33Ja6uMkqNzktKhG', '2024-01-15', 0, 'active', 'Never', '2026-02-05 18:10:46', '2026-02-05 18:10:46', 'member');

-- --------------------------------------------------------

--
-- Table structure for table `member_history`
--

CREATE TABLE `member_history` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `date` varchar(20) DEFAULT NULL,
  `treatment_name` varchar(100) DEFAULT NULL,
  `therapist` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `appointment_id` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `weight` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `image` longtext DEFAULT NULL,
  `marketplace_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`marketplace_links`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `weight`, `description`, `image`, `marketplace_links`, `created_at`, `updated_at`) VALUES
(1, 'Sunscreen', 'Skincare', 10000.00, 60, 'Hydrating moisturizer for all skin types', 'https://down-id.img.susercontent.com/file/id-11134207-7ra0s-mcsqsnxi4dko51@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/product123\",\"tokopedia\":\"https://tokopedia.com/product123\",\"lazada\":\"https://lazada.co.id/product123\"}', '2026-01-21 15:38:10', '2026-02-03 05:58:24'),
(2, 'Bahlil Shampoo opooo', 'Hair Care', 40000000.00, 148, 'Nourishing shampoo for healthy hair', 'https://down-id.img.susercontent.com/file/id-11134207-82251-mjguvuxun18i11@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/product456\",\"tokopedia\":\"https://tokopedia.com/product456\"}', '2026-01-21 15:38:10', '2026-01-28 11:13:15'),
(3, 'Bahlil Lotion', 'Skincare', 7000000.00, 0, 'Moisturizing body lotion with natural ingredients', 'https://down-id.img.susercontent.com/file/id-11134207-8224t-mimiwjvbtjpd66@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/product789\",\"lazada\":\"https://lazada.co.id/product789\"}', '2026-01-21 15:38:10', '2026-01-28 11:13:36'),
(4, 'Mist', 'Skincare', 99999999.99, 0, 'Brightening serum with Vitamin C', 'https://down-id.img.susercontent.com/file/id-11134207-8224s-mjguvuxphm9t89@resize_w900_nl.webp', '{}', '2026-01-21 15:38:10', '2026-01-28 11:16:27'),
(5, 'Vitamin C Serum', 'Skincare', 250000.00, 0, 'Brightening serum with Vitamin C', NULL, NULL, '2026-02-05 18:10:47', '2026-02-05 18:10:47'),
(6, 'Moisturizing Cream', 'Skincare', 180000.00, 0, 'Deep hydration cream', NULL, NULL, '2026-02-05 18:10:47', '2026-02-05 18:10:47');

-- --------------------------------------------------------

--
-- Table structure for table `therapists`
--

CREATE TABLE `therapists` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `total_treatments` int(11) DEFAULT 0,
  `join_date` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `therapists`
--

INSERT INTO `therapists` (`id`, `name`, `email`, `phone`, `status`, `total_treatments`, `join_date`, `created_at`, `updated_at`) VALUES
('', 'Dr. Amelia', 'amelia@clinic.com', '0811111111', 'active', 0, NULL, '2026-02-05 18:10:46', '2026-02-05 18:10:46'),
('TH001', 'Fufu', 'fufu@email.com', '081234567894', 'active', 0, '26 Jan 2026', '2026-01-26 13:50:53', '2026-02-05 09:27:20'),
('TH002', 'Siti Maulana', 'siti@email.com', '081234567890', 'active', 0, '22 Jan 2026', '2026-01-22 13:52:13', '2026-02-05 09:27:29');

-- --------------------------------------------------------

--
-- Table structure for table `treatments`
--

CREATE TABLE `treatments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `duration` varchar(20) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `treatments`
--

INSERT INTO `treatments` (`id`, `name`, `category`, `duration`, `price`, `description`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Hydrating Facial', 'Special Treatment', '120 min', 12000.00, 'Deep hydration facial treatment for dry skin ', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop', '2026-01-21 15:21:46', '2026-01-30 06:51:07'),
(2, 'Acne Clear Treatment', 'Facial', '90 min', 200000.00, 'Specialized treatment for acne-prone skin with extraction, calming mask, and post-treatment care.', 'data:image/jpeg;base64,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', '2026-01-21 15:21:46', '2026-01-28 09:47:53'),
(3, 'Hair Spa Treatment', 'Hair Care', '120 min', 400000.00, 'Complete hair spa with deep conditioning, scalp massage, and hair mask for damaged hair.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop', '2026-01-21 15:21:46', '2026-02-05 09:29:11'),
(4, 'Facial Treatment', 'Facial', '60 minutes', 300000.00, 'Deep cleansing facial treatment', NULL, '2026-02-05 18:10:47', '2026-02-05 18:10:47'),
(5, 'Body Massage', 'Massage', '90 minutes', 450000.00, 'Relaxing full body massage', NULL, '2026-02-05 18:10:47', '2026-02-05 18:10:47');

-- --------------------------------------------------------

--
-- Table structure for table `treatment_facilities`
--

CREATE TABLE `treatment_facilities` (
  `id` int(11) NOT NULL,
  `treatment_id` int(11) NOT NULL,
  `facility_name` varchar(100) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appointment_id` (`appointment_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_therapist` (`therapist_id`),
  ADD KEY `idx_treatment` (`treatment_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `member_history`
--
ALTER TABLE `member_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_member_id` (`member_id`),
  ADD KEY `idx_date` (`date`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_price` (`price`);

--
-- Indexes for table `therapists`
--
ALTER TABLE `therapists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_price` (`price`);

--
-- Indexes for table `treatment_facilities`
--
ALTER TABLE `treatment_facilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_treatment_id` (`treatment_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=260010;

--
-- AUTO_INCREMENT for table `member_history`
--
ALTER TABLE `member_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `treatments`
--
ALTER TABLE `treatments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `treatment_facilities`
--
ALTER TABLE `treatment_facilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`therapist_id`) REFERENCES `therapists` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `member_history`
--
ALTER TABLE `member_history`
  ADD CONSTRAINT `member_history_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `treatment_facilities`
--
ALTER TABLE `treatment_facilities`
  ADD CONSTRAINT `treatment_facilities_ibfk_1` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
