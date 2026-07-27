-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 27, 2026 at 02:28 AM
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
  `cloudinary_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('tersedia','dipinjam','rusak','hilang') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'tersedia',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `qr_code`, `nama_barang`, `kategori`, `gambar_url`, `cloudinary_public_id`, `status`, `created_at`) VALUES
(30, 'KAM', 'kamera', 'kamera', 'https://res.cloudinary.com/daoauzqpd/image/upload/v1785046671/qrfast/items/2bef7770-146b-4efd-b8dd-994eeff8c25f.webp', 'qrfast/items/2bef7770-146b-4efd-b8dd-994eeff8c25f', 'dipinjam', '2026-07-26 06:18:05');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `item_id`, `waktu_pinjam`, `waktu_kembali`, `status_transaksi`) VALUES
(54, 6, 30, '2026-07-26 06:18:30', '2026-07-26 06:19:03', 'selesai'),
(55, 6, 30, '2026-07-26 06:21:57', '2026-07-26 07:17:46', 'selesai'),
(56, 6, 30, '2026-07-26 07:17:51', '2026-07-26 07:30:14', 'selesai'),
(57, 6, 30, '2026-07-26 11:05:44', '2026-07-26 11:19:07', 'selesai'),
(58, 6, 30, '2026-07-26 11:19:13', '2026-07-26 11:20:09', 'selesai'),
(59, 6, 30, '2026-07-26 11:20:12', '2026-07-26 11:36:48', 'selesai'),
(60, 4, 30, '2026-07-26 11:36:51', '2026-07-26 11:36:58', 'selesai'),
(61, 6, 30, '2026-07-27 02:10:10', NULL, 'dipinjam');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `email`, `password`, `role`, `created_at`) VALUES
(4, 'Admin Utama', 'admin@example.com', '$2b$10$mXOq4KHYTa6P1noBg55h4ePYcAWIXbup3sOhK8ve/O/sOzw1B.qH2', 'admin', '2026-07-15 14:00:48'),
(6, 'Kamal', 'kamaludin@example.com', '$2b$10$YulvOG1DZl.a6G2erS9p7eitVIdkaqbD9Il8EabonJv4vWVIlgy/O', 'pegawai', '2026-07-15 15:32:12');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transaction_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `fk_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
