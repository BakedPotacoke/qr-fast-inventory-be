import express from 'express';
import { getAllItems, createItem, deleteItems, updateItem } from '../controller/itemController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ===== ROUTES =====

// GET /api/items — semua user login bisa akses daftar barang
router.get('/', verifyToken, getAllItems);

// POST /api/items — hanya admin yang boleh tambah barang
router.post('/', verifyToken, isAdmin, upload.single('gambar'), createItem);

// PUT /api/items/:id — hanya admin yang boleh mengedit barang
router.put('/:id', verifyToken, isAdmin, upload.single('gambar'), updateItem);

// DELETE /api/items — hanya admin yang boleh menghapus (bulk delete)
router.delete('/', verifyToken, isAdmin, deleteItems);

export default router;
