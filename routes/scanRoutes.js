import express from 'express';
import { handleScan } from '../controller/scanController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoint utama untuk handle Scan QR Code
router.post('/scan', verifyToken, handleScan);

export default router;