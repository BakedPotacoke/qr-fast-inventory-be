import express from 'express';
import { getAllItems, createItem, deleteItems, updateItem, reportItem } from '../controller/itemController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload, { processAndUploadImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ===== ROUTES =====

// GET /api/items — semua user login bisa akses daftar barang
router.get('/', verifyToken, getAllItems);

// POST /api/items — hanya admin yang boleh tambah barang
// Chain: multer (validasi + memory buffer) → Sharp + Cloudinary → controller
router.post('/', verifyToken, isAdmin, upload.single('gambar'), processAndUploadImage, createItem);

// PUT /api/items/:id — admin bisa update semua field; pegawai hanya bisa update status
// Chain: multer → Sharp + Cloudinary → controller
router.put('/:id', verifyToken, upload.single('gambar'), processAndUploadImage, updateItem);

// POST /api/items/:id/report — lapor barang rusak/hilang saat sedang dipinjam
router.post('/:id/report', verifyToken, reportItem);

// DELETE /api/items — hanya admin yang boleh menghapus (bulk delete)
router.delete('/', verifyToken, isAdmin, deleteItems);

export default router;