import express from 'express';
import { getAllReports } from '../controller/itemReportController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/reports  -> daftar semua laporan (butuh login/token valid)
router.get('/', verifyToken, getAllReports);

export default router;