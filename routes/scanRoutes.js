import express from 'express';
import { handleScan, confirmReturn } from '../controller/scanController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoint utama untuk handle Scan QR Code
router.post('/scan', verifyToken, handleScan);

// Finalisasi pengembalian setelah user mengonfirmasi kondisi barang (baik/rusak)
router.post('/scan/confirm-return', verifyToken, confirmReturn);

export default router;