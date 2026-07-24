-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 24, 2026 at 03:59 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fastqr`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qr_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_barang` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('tersedia','dipinjam','rusak','hilang') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'tersedia',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `qr_code`, `nama_barang`, `kategori`, `gambar_url`, `status`, `created_at`) VALUES
(27, 'KAME', 'Kamera', 'Kamera', NULL, 'tersedia', '2026-07-24 03:37:46'),
(26, 'KAM', 'kamera', 'kamera', NULL, 'hilang', '2026-07-24 03:29:20');

-- --------------------------------------------------------

--
-- Table structure for table `item_reports`
--

DROP TABLE IF EXISTS `item_reports`;
CREATE TABLE IF NOT EXISTS `item_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `user_id` int NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `jenis_laporan` enum('rusak','hilang') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_report_item` (`item_id`),
  KEY `fk_report_user` (`user_id`),
  KEY `fk_report_transaction` (`transaction_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `item_reports`
--

INSERT INTO `item_reports` (`id`, `item_id`, `user_id`, `transaction_id`, `jenis_laporan`, `keterangan`, `created_at`) VALUES
(2, 26, 4, 46, 'rusak', 'rusak minor', '2026-07-24 03:32:32');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `waktu_pinjam` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `waktu_kembali` timestamp NULL DEFAULT NULL,
  `status_transaksi` enum('dipinjam','selesai') COLLATE utf8mb4_unicode_ci DEFAULT 'dipinjam',
  PRIMARY KEY (`id`),
  KEY `fk_transaction_user` (`user_id`),
  KEY `fk_transaction_item` (`item_id`)
) ENGINE=MyISAM AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `item_id`, `waktu_pinjam`, `waktu_kembali`, `status_transaksi`) VALUES
(1, 1, 1, '2026-07-14 07:51:17', '2026-07-14 07:52:17', 'selesai'),
(2, 1, 1, '2026-07-14 07:53:28', '2026-07-14 07:53:51', 'selesai'),
(3, 1, 1, '2026-07-14 07:54:55', '2026-07-14 07:55:03', 'selesai'),
(4, 2, 1, '2026-07-14 07:55:08', '2026-07-14 07:55:10', 'selesai'),
(5, 2, 1, '2026-07-14 07:55:12', '2026-07-14 07:55:19', 'selesai'),
(6, 9, 1, '2026-07-14 07:55:21', '2026-07-14 07:55:24', 'selesai'),
(7, 9, 1, '2026-07-14 07:59:38', '2026-07-14 07:59:57', 'selesai'),
(8, 1, 1, '2026-07-14 08:04:45', '2026-07-14 08:12:16', 'selesai'),
(9, 1, 1, '2026-07-14 08:24:16', '2026-07-14 08:27:14', 'selesai'),
(10, 1, 2, '2026-07-14 08:24:57', '2026-07-14 08:26:53', 'selesai'),
(11, 1, 1, '2026-07-14 08:33:24', '2026-07-14 08:33:30', 'selesai'),
(12, 1, 1, '2026-07-14 08:33:32', '2026-07-14 08:34:18', 'selesai'),
(13, 5, 2, '2026-07-15 15:08:03', '2026-07-15 15:08:23', 'selesai'),
(14, 5, 2, '2026-07-15 15:08:26', '2026-07-15 15:08:28', 'selesai'),
(15, 5, 2, '2026-07-15 15:08:33', '2026-07-15 15:09:34', 'selesai'),
(16, 5, 2, '2026-07-15 15:09:43', '2026-07-15 15:18:35', 'selesai'),
(17, 4, 2, '2026-07-16 03:17:20', '2026-07-16 06:21:14', 'selesai'),
(18, 4, 1, '2026-07-16 03:19:54', '2026-07-16 03:46:48', 'selesai'),
(19, 6, 2, '2026-07-16 06:27:26', '2026-07-16 06:28:43', 'selesai'),
(20, 4, 2, '2026-07-16 06:29:12', '2026-07-16 06:46:06', 'selesai'),
(21, 6, 1, '2026-08-16 06:43:18', '2026-08-16 06:45:14', 'selesai'),
(22, 6, 1, '2026-09-16 07:41:36', '2026-09-16 07:42:25', 'selesai'),
(23, 4, 1, '2026-07-16 07:42:45', '2026-07-16 07:42:51', 'selesai'),
(24, 4, 1, '2026-07-16 08:16:45', '2026-07-17 03:22:15', 'selesai'),
(25, 4, 1, '2026-07-17 03:35:00', '2026-07-17 04:16:57', 'selesai'),
(26, 4, 15, '2026-07-17 03:35:08', '2026-07-17 03:37:23', 'selesai'),
(27, 4, 1, '2026-07-17 04:17:20', '2026-07-17 04:17:44', 'selesai'),
(28, 4, 1, '2026-07-17 04:19:21', '2026-07-17 04:20:45', 'selesai'),
(29, 4, 14, '2026-07-17 04:22:08', '2026-07-17 04:23:50', 'selesai'),
(30, 6, 15, '2026-07-17 04:22:53', '2026-07-17 04:23:25', 'selesai'),
(31, 4, 15, '2026-07-17 07:03:37', '2026-07-17 07:05:06', 'selesai'),
(32, 4, 1, '2026-07-17 07:03:59', '2026-07-17 07:04:09', 'selesai'),
(33, 4, 1, '2026-07-17 07:29:43', '2026-07-17 07:29:53', 'selesai'),
(34, 6, 15, '2026-07-20 04:49:07', '2026-07-20 05:21:18', 'selesai'),
(35, 6, 14, '2026-07-20 04:50:05', '2026-07-20 04:50:44', 'selesai'),
(36, 6, 14, '2026-07-20 05:18:42', '2026-07-20 05:19:00', 'selesai'),
(37, 6, 14, '2026-07-21 01:51:42', '2026-07-21 01:52:38', 'selesai'),
(38, 6, 14, '2026-07-21 01:59:33', '2026-07-21 01:59:53', 'selesai'),
(39, 4, 23, '2026-07-22 04:56:11', '2026-07-22 04:56:25', 'selesai'),
(40, 4, 23, '2026-07-22 04:56:30', '2026-07-22 04:56:34', 'selesai'),
(41, 4, 24, '2026-07-23 02:37:38', '2026-07-23 02:37:42', 'selesai'),
(42, 4, 25, '2026-07-23 06:20:13', '2026-07-23 06:27:54', 'selesai'),
(43, 4, 25, '2026-07-23 06:28:35', '2026-07-24 02:15:06', 'selesai'),
(44, 4, 26, '2026-07-24 03:29:44', '2026-07-24 03:30:00', 'selesai'),
(45, 4, 26, '2026-07-24 03:31:34', '2026-07-24 03:31:48', 'selesai'),
(46, 4, 26, '2026-07-24 03:31:54', '2026-07-24 03:32:32', 'selesai'),
(47, 4, 27, '2026-07-24 03:44:53', '2026-07-24 03:45:42', 'selesai');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','pegawai') COLLATE utf8mb4_unicode_ci DEFAULT 'pegawai',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `email`, `password`, `role`, `created_at`) VALUES
(4, 'Admin Utama', 'admin@example.com', '$2b$10$mXOq4KHYTa6P1noBg55h4ePYcAWIXbup3sOhK8ve/O/sOzw1B.qH2', 'admin', '2026-07-15 14:00:48'),
(6, 'Kamal', 'kamaludin@example.com', '$2b$10$YulvOG1DZl.a6G2erS9p7eitVIdkaqbD9Il8EabonJv4vWVIlgy/O', 'pegawai', '2026-07-15 15:32:12');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
